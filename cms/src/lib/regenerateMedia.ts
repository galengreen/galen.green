import fs from 'fs'
import path from 'path'

interface MediaDoc {
  id: string
  filename: string
  mimeType: string
}

export interface RegenerateMediaOptions {
  batchSize?: number
  dryRun?: boolean
  logger?: (message: string) => void
  mediaDir?: string
  payload: {
    find: (args: any) => Promise<{ docs: unknown[]; totalDocs: number }>
    update: (args: any) => Promise<unknown>
  }
}

export interface RegenerateMediaResult {
  failed: number
  processed: number
  success: number
  totalDocs: number
}

export async function regenerateMedia({
  batchSize = 5,
  dryRun = false,
  logger,
  mediaDir,
  payload,
}: RegenerateMediaOptions): Promise<RegenerateMediaResult> {
  logger?.('Fetching media documents...')

  const { totalDocs } = await payload.find({
    collection: 'media',
    limit: 1,
  })

  logger?.(`Found ${totalDocs} media documents to process`)

  let processed = 0
  let failed = 0
  let page = 1

  while (processed < totalDocs) {
    const { docs } = await payload.find({
      collection: 'media',
      limit: batchSize,
      page,
    })

    if (docs.length === 0) {
      break
    }

    for (const media of docs as MediaDoc[]) {
      processed++
      const progress = `[${processed}/${totalDocs}]`

      try {
        logger?.(`${progress} Processing: ${media.filename}`)

        if (dryRun) {
          logger?.(`  Would regenerate sizes for: ${media.filename}`)
          continue
        }

        const resolvedMediaDir =
          mediaDir || process.env.MEDIA_DIR || path.join(process.cwd(), '..', 'media')
        const filePath = path.join(resolvedMediaDir, media.filename)

        if (!fs.existsSync(filePath)) {
          logger?.(`  WARNING: Original file not found: ${filePath}`)
          failed++
          continue
        }

        const fileBuffer = fs.readFileSync(filePath)

        await payload.update({
          collection: 'media',
          id: media.id,
          data: {},
          file: {
            data: fileBuffer,
            name: media.filename,
            mimetype: media.mimeType,
            size: fileBuffer.length,
          },
        })

        logger?.('  Regenerated successfully')
      } catch (error) {
        logger?.(`  ERROR: ${error instanceof Error ? error.message : 'Unknown error'}`)
        failed++
      }
    }

    page++
  }

  return {
    failed,
    processed,
    success: processed - failed,
    totalDocs,
  }
}
