import type { CollectionConfig } from 'payload'
import exifr from 'exifr'
import { readFile } from 'fs/promises'
import { isAuthenticated } from '../access/isAuthenticated'
import { regenerateMedia } from '../lib/regenerateMedia'

// Helper to convert filename to readable title
const filenameToTitle = (filename: string): string => {
  // Remove extension
  const name = filename.replace(/\.[^/.]+$/, '')
  // Replace dashes, underscores, and dots with spaces
  // Also handle camelCase and PascalCase
  return name
    .replace(/[-_.]/g, ' ')
    .replace(/([a-z])([A-Z])/g, '$1 $2')
    .replace(/\s+/g, ' ')
    .trim()
}

// Responsive image short-side targets
const IMAGE_SHORT_SIDES = {
  xs: 320,
  sm: 480,
  md: 768,
  lg: 1024,
  xl: 1400,
  xxl: 1920,
} as const

const FULL_SIZE_TARGET = 999999

// Generate image size config for a given short-side target and format
const createResponsiveImageSize = (
  name: string,
  shortSide: number,
  format: 'webp' | 'avif',
  quality: number,
) => ({
  name: format === 'webp' ? name : `${name}-avif`,
  width: shortSide,
  height: shortSide,
  fit: 'outside' as const,
  position: 'centre' as const,
  withoutEnlargement: true,
  formatOptions: {
    format,
    options: { quality },
  },
})

const createFullImageSize = (format: 'webp' | 'avif', quality: number) => ({
  name: format === 'webp' ? 'full' : 'full-avif',
  width: FULL_SIZE_TARGET,
  height: FULL_SIZE_TARGET,
  fit: 'inside' as const,
  position: 'centre' as const,
  withoutEnlargement: true,
  formatOptions: {
    format,
    options: { quality },
  },
  admin: {
    disableGroupBy: true,
    disableListColumn: true,
    disableListFilter: true,
  },
})

// Generate all responsive sizes for both formats
const generateImageSizes = () => {
  const sizes: Array<
    ReturnType<typeof createResponsiveImageSize> | ReturnType<typeof createFullImageSize>
  > = []

  // WebP sizes (quality 85)
  for (const [name, shortSide] of Object.entries(IMAGE_SHORT_SIDES)) {
    sizes.push(createResponsiveImageSize(name, shortSide, 'webp', 85))
  }
  sizes.push(createFullImageSize('webp', 85))

  // AVIF sizes (quality 70 - AVIF achieves similar visual quality at lower values)
  for (const [name, shortSide] of Object.entries(IMAGE_SHORT_SIDES)) {
    sizes.push(createResponsiveImageSize(name, shortSide, 'avif', 70))
  }
  sizes.push(createFullImageSize('avif', 70))

  return sizes
}

export const Media: CollectionConfig = {
  slug: 'media',
  labels: {
    singular: 'Media',
    plural: 'Media',
  },
  admin: {
    components: {
      beforeList: ['@/components/RegenerateMediaButton#RegenerateMediaButton'],
    },
  },
  endpoints: [
    {
      path: '/regenerate',
      method: 'post',
      handler: async (req) => {
        if (!req.user) {
          return Response.json({ error: 'Unauthorised' }, { status: 401 })
        }

        const result = await regenerateMedia({
          payload: req.payload,
        })

        return Response.json({
          message: `Regenerated ${result.success} media items`,
          ...result,
        })
      },
    },
  ],
  access: {
    read: () => true,
    create: isAuthenticated,
    update: isAuthenticated,
    delete: isAuthenticated,
  },
  upload: {
    staticDir: process.env.MEDIA_DIR || '../media',
    mimeTypes: ['image/*'],
    filesRequiredOnCreate: false,
    focalPoint: false,
    // Preserve the uploaded original file exactly as provided.
    // Generated derivatives are defined separately in imageSizes.
    imageSizes: generateImageSizes(),
    adminThumbnail: 'xs',
  },
  hooks: {
    // Use beforeOperation to extract EXIF before image processing converts to WebP
    beforeOperation: [
      async ({ args, operation, req }) => {
        if ((operation === 'create' || operation === 'update') && req.file) {
          // Extract EXIF date taken from the ORIGINAL image before conversion
          try {
            let fileBuffer: Buffer | undefined = req.file.data
            if (!fileBuffer && req.file.tempFilePath) {
              fileBuffer = await readFile(req.file.tempFilePath)
            }

            if (fileBuffer) {
              const maxSizeForExif = 50 * 1024 * 1024 // 50MB
              if (fileBuffer.length <= maxSizeForExif) {
                const exif = await exifr.parse(fileBuffer, {
                  tiff: true,
                  exif: true,
                  pick: ['DateTimeOriginal', 'CreateDate', 'ModifyDate'],
                })

                if (exif) {
                  const dateTaken = exif.DateTimeOriginal || exif.CreateDate || exif.ModifyDate
                  if (dateTaken instanceof Date) {
                    req.context.exifDateTaken = dateTaken.toISOString()
                  } else if (typeof dateTaken === 'string') {
                    // Some EXIF data comes as string in format "YYYY:MM:DD HH:MM:SS"
                    const parsed = new Date(
                      dateTaken.replace(/^(\d{4}):(\d{2}):(\d{2})/, '$1-$2-$3'),
                    )
                    if (!isNaN(parsed.getTime())) {
                      req.context.exifDateTaken = parsed.toISOString()
                    }
                  }
                }
              }
            }
          } catch {
            // EXIF extraction failed - not all images have EXIF data
          }
        }
        return args
      },
    ],
    beforeChange: [
      async ({ data, req }) => {
        if (req.file) {
          // Auto-populate alt text from filename if not provided
          if (!data.alt) {
            data.alt = filenameToTitle(req.file.name)
          }

          // Apply EXIF date from beforeOperation hook
          if (req.context.exifDateTaken && typeof req.context.exifDateTaken === 'string') {
            data.dateTaken = req.context.exifDateTaken
          }
        }
        return data
      },
    ],
  },
  fields: [
    {
      name: 'alt',
      type: 'text',
      label: 'Alt Text',
      admin: {
        description: 'Defaults to filename if left empty',
      },
    },
    {
      name: 'dateTaken',
      type: 'date',
      label: 'Date Taken',
      admin: {
        description: 'Extracted from EXIF data if available',
        date: {
          pickerAppearance: 'dayAndTime',
          displayFormat: 'd MMM yyyy HH:mm',
        },
        readOnly: true,
      },
    },
  ],
}
