import type { CollectionConfig } from 'payload'
import exifr from 'exifr'
import { readFile } from 'fs/promises'
import { isAuthenticated } from '../access/isAuthenticated'

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

// Responsive image widths
const IMAGE_WIDTHS = {
  xs: 320,
  sm: 480,
  md: 768,
  lg: 1024,
  xl: 1400,
  xxl: 1920,
} as const

// Generate image size config for a given width and format
const createImageSize = (
  name: string,
  width: number,
  format: 'webp' | 'avif',
  quality: number,
) => ({
  name: format === 'webp' ? name : `${name}-avif`,
  width,
  height: undefined,
  position: 'centre' as const,
  formatOptions: {
    format,
    options: { quality },
  },
})

// Generate all responsive sizes for both formats
const generateImageSizes = () => {
  const sizes: ReturnType<typeof createImageSize>[] = []

  // WebP sizes (quality 85)
  for (const [name, width] of Object.entries(IMAGE_WIDTHS)) {
    sizes.push(createImageSize(name, width, 'webp', 85))
  }

  // AVIF sizes (quality 70 - AVIF achieves similar visual quality at lower values)
  for (const [name, width] of Object.entries(IMAGE_WIDTHS)) {
    sizes.push(createImageSize(name, width, 'avif', 70))
  }

  // Legacy WebP sizes for backwards compatibility
  sizes.push(createImageSize('thumbnail', 400, 'webp', 85))
  sizes.push(createImageSize('medium', 800, 'webp', 85))
  sizes.push(createImageSize('large', 1400, 'webp', 85))

  return sizes
}

export const Media: CollectionConfig = {
  slug: 'media',
  labels: {
    singular: 'Media',
    plural: 'Media',
  },
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
    // Default format for original file (WebP as fallback)
    formatOptions: {
      format: 'webp',
      options: {
        quality: 85,
        lossless: false,
      },
    },
    // Responsive image sizes in both AVIF and WebP formats
    imageSizes: generateImageSizes(),
    adminThumbnail: 'thumbnail',
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
