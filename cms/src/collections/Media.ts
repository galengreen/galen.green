import type { CollectionConfig } from 'payload'
import exifr from 'exifr'
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
    staticDir: '../media',
    mimeTypes: ['image/*'],
    filesRequiredOnCreate: false,
    imageSizes: [
      {
        name: 'thumbnail',
        width: 400,
        height: undefined,
        position: 'centre',
      },
      {
        name: 'medium',
        width: 800,
        height: undefined,
        position: 'centre',
      },
      {
        name: 'large',
        width: 1400,
        height: undefined,
        position: 'centre',
      },
    ],
    adminThumbnail: 'thumbnail',
  },
  hooks: {
    beforeChange: [
      async ({ data, req }) => {
        if (req.file) {
          // Auto-populate alt text from filename if not provided
          if (!data.alt) {
            data.alt = filenameToTitle(req.file.name)
          }

          // Extract EXIF date taken from image (only for reasonable file sizes)
          // Skip EXIF parsing for very large files to avoid performance issues
          const maxSizeForExif = 50 * 1024 * 1024 // 50MB
          if (req.file.data.length <= maxSizeForExif) {
            try {
              const exif = await exifr.parse(req.file.data, {
                pick: ['DateTimeOriginal', 'CreateDate', 'ModifyDate'],
              })

              if (exif) {
                // Try DateTimeOriginal first, then CreateDate, then ModifyDate
                const dateTaken = exif.DateTimeOriginal || exif.CreateDate || exif.ModifyDate
                if (dateTaken instanceof Date) {
                  data.dateTaken = dateTaken.toISOString()
                }
              }
            } catch {
              // EXIF extraction failed - not all images have EXIF data
            }
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
