import type { CollectionConfig } from 'payload'
import { isAuthenticated } from '../access/isAuthenticated'

export const Photos: CollectionConfig = {
  slug: 'photos',
  labels: {
    singular: 'Photo',
    plural: 'Photos',
  },
  admin: {
    useAsTitle: 'title',
    defaultColumns: ['title', 'date', 'featured'],
    components: {
      beforeList: ['@/components/BulkCreatePhotos#BulkCreatePhotos'],
    },
  },
  endpoints: [
    {
      path: '/bulk-create',
      method: 'post',
      handler: async (req) => {
        if (!req.user) {
          return Response.json({ error: 'Unauthorised' }, { status: 401 })
        }

        const body = await req.json?.()
        const mediaIds: string[] = body?.mediaIds

        if (!mediaIds || !Array.isArray(mediaIds) || mediaIds.length === 0) {
          return Response.json({ error: 'mediaIds array is required' }, { status: 400 })
        }

        const results: { created: string[]; errors: { id: string; error: string }[] } = {
          created: [],
          errors: [],
        }

        for (const mediaId of mediaIds) {
          try {
            const photo = await req.payload.create({
              collection: 'photos',
              data: {
                image: mediaId,
              },
              user: req.user,
            })
            results.created.push(photo.id)
          } catch (err) {
            results.errors.push({
              id: mediaId,
              error: err instanceof Error ? err.message : 'Unknown error',
            })
          }
        }

        return Response.json({
          message: `Created ${results.created.length} photos`,
          ...results,
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
  defaultSort: '-date',
  hooks: {
    beforeChange: [
      async ({ data, req, operation }) => {
        // Only auto-populate date on create
        if (operation === 'create' && data.image && !data.date) {
          try {
            const media = await req.payload.findByID({
              collection: 'media',
              id: data.image,
            })

            if (media) {
              // Auto-populate date from EXIF dateTaken, fallback to today
              const mediaData = media as { dateTaken?: string }
              data.date = mediaData.dateTaken || new Date().toISOString()
            }
          } catch {
            // Silently fail - user can set date manually
            data.date = new Date().toISOString()
          }
        }
        return data
      },
    ],
  },
  fields: [
    {
      name: 'image',
      type: 'upload',
      relationTo: 'media',
      required: true,
      admin: {
        description: 'Upload an image - date will auto-populate from EXIF data if available',
        allowCreate: true,
        isSortable: true,
      },
    },
    {
      name: 'title',
      type: 'text',
      admin: {
        description: 'Optional title for the photo',
      },
    },
    {
      name: 'description',
      type: 'textarea',
      label: 'Description',
      admin: {
        description: 'Optional text displayed when the photo is expanded',
      },
    },
    {
      name: 'date',
      type: 'date',
      admin: {
        date: {
          pickerAppearance: 'dayOnly',
          displayFormat: 'd MMM yyyy',
        },
        description: 'Defaults to photo EXIF date, or today if unavailable',
      },
    },
    {
      name: 'featured',
      type: 'checkbox',
      defaultValue: false,
      admin: {
        description: 'Featured photos may be highlighted on the homepage',
      },
    },
  ],
}
