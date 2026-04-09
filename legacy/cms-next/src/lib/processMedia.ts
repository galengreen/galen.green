import { readFile, rm, writeFile } from 'fs/promises'
import path from 'path'
import sharp from 'sharp'
import {
  MEDIA_IMAGE_SIZE_DEFINITIONS,
  type GeneratedImageFormat,
  type GeneratedMediaSizeDefinition,
} from './mediaImageSizes'

export const MEDIA_PROCESSING_QUEUE = 'media-processing'
export const MEDIA_PROCESSING_TASK = 'processMediaUpload'

export interface GeneratedMediaSize {
  filename: string
  filesize: number
  height: number
  mimeType: string
  url: string
  width: number
}

export type GeneratedMediaSizes = Record<string, GeneratedMediaSize>

export interface ProcessMediaOptions {
  logger?: (message: string) => void
  media: {
    filename?: string | null
    id: string
    sizes?: Record<string, { filename?: string | null } | null> | null
  }
  mediaDir?: string
}

export interface ProcessMediaResult {
  sizes: GeneratedMediaSizes
}

const toMediaURL = (filename: string) => `/api/media/file/${filename}`

const removeExtension = (filename: string) => filename.replace(/\.[^/.]+$/, '')

const resolveMediaDir = (mediaDir?: string) =>
  mediaDir || process.env.MEDIA_DIR || path.join(process.cwd(), '..', 'media')

const createDerivativeFilename = (
  originalFilename: string,
  sizeName: GeneratedMediaSizeDefinition['name'],
  format: GeneratedImageFormat,
) => `${removeExtension(originalFilename)}-${sizeName}.${format}`

const createSizeEntry = (
  filename: string,
  info: sharp.OutputInfo,
  mimeType: string,
): GeneratedMediaSize => ({
  filename,
  filesize: info.size,
  height: info.height,
  mimeType,
  url: toMediaURL(filename),
  width: info.width,
})

export async function processMedia({
  logger,
  media,
  mediaDir,
}: ProcessMediaOptions): Promise<ProcessMediaResult> {
  if (!media.filename) {
    throw new Error(`Media ${media.id} is missing a filename`)
  }

  const resolvedMediaDir = resolveMediaDir(mediaDir)
  const originalPath = path.join(resolvedMediaDir, media.filename)
  const originalBuffer = await readFile(originalPath)

  const previousFilenames = new Set(
    Object.values(media.sizes || {})
      .map((size) => size?.filename)
      .filter((filename): filename is string => Boolean(filename)),
  )

  const nextFilenames = new Set<string>()
  const reuseByFormatAndDimensions = new Map<string, GeneratedMediaSize>()
  const sizes: GeneratedMediaSizes = {}

  for (const definition of MEDIA_IMAGE_SIZE_DEFINITIONS) {
    const pipeline = sharp(originalBuffer).rotate().resize({
      fit: definition.fit,
      height: definition.height,
      width: definition.width,
      withoutEnlargement: definition.withoutEnlargement,
    })

    if (definition.format === 'webp') {
      pipeline.webp({ quality: definition.quality })
    } else {
      pipeline.avif({ quality: definition.quality })
    }

    const { data, info } = await pipeline.toBuffer({ resolveWithObject: true })
    const reuseKey = `${definition.format}:${info.width}x${info.height}`
    const reusedEntry = reuseByFormatAndDimensions.get(reuseKey)

    if (reusedEntry) {
      sizes[definition.name] = reusedEntry
      if (reusedEntry.filename) {
        nextFilenames.add(reusedEntry.filename)
      }
      continue
    }

    const derivativeFilename = createDerivativeFilename(
      media.filename,
      definition.name,
      definition.format,
    )
    const derivativePath = path.join(resolvedMediaDir, derivativeFilename)

    await writeFile(derivativePath, data)

    const mimeType = definition.format === 'webp' ? 'image/webp' : 'image/avif'
    const sizeEntry = createSizeEntry(derivativeFilename, info, mimeType)

    sizes[definition.name] = sizeEntry
    reuseByFormatAndDimensions.set(reuseKey, sizeEntry)
    nextFilenames.add(derivativeFilename)
    logger?.(`Generated ${definition.name} for ${media.filename}`)
  }

  const obsoleteFilenames = [...previousFilenames].filter(
    (filename) => !nextFilenames.has(filename),
  )
  await Promise.all(
    obsoleteFilenames.map(async (filename) => {
      try {
        await rm(path.join(resolvedMediaDir, filename))
      } catch {
        // Ignore stale file cleanup failures
      }
    }),
  )

  return { sizes }
}
