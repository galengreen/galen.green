import type { CollectionConfig } from 'payload'
import exifr from 'exifr'
import { readFile } from 'fs/promises'
import { isAuthenticated } from '../access/isAuthenticated'
import { MEDIA_PROCESSING_TASK, MEDIA_PROCESSING_QUEUE } from '../lib/processMedia'
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
          message: `Queued ${result.success} media items for regeneration`,
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
    crop: false,
    adminThumbnail: ({ doc }) => {
      const mediaDoc = doc as { sizes?: { xs?: { url?: string | null } }; url?: string | null }
      return mediaDoc.sizes?.xs?.url || mediaDoc.url || null
    },
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

          data.processingError = null
          data.processingStatus = 'queued'
          data.processedAt = null
          data.sizes = {}
        }
        return data
      },
    ],
    afterChange: [
      async ({ doc, req }) => {
        if (!req.file) return doc

        await req.payload.jobs.queue({
          input: {
            mediaId: String(doc.id),
          },
          queue: MEDIA_PROCESSING_QUEUE,
          task: MEDIA_PROCESSING_TASK,
        })

        return doc
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
    {
      name: 'processingStatus',
      type: 'select',
      defaultValue: 'ready',
      options: [
        { label: 'Queued', value: 'queued' },
        { label: 'Processing', value: 'processing' },
        { label: 'Ready', value: 'ready' },
        { label: 'Failed', value: 'failed' },
      ],
      admin: {
        position: 'sidebar',
        readOnly: true,
      },
    },
    {
      name: 'processedAt',
      type: 'date',
      admin: {
        position: 'sidebar',
        readOnly: true,
      },
    },
    {
      name: 'processingError',
      type: 'textarea',
      admin: {
        condition: (_, siblingData) => siblingData?.processingStatus === 'failed',
        readOnly: true,
      },
    },
    {
      name: 'sizes',
      type: 'json',
      admin: {
        readOnly: true,
      },
    },
  ],
}
