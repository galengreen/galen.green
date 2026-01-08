import type { CollectionConfig } from 'payload'

export const Photos: CollectionConfig = {
  slug: 'photos',
  labels: {
    singular: 'Photo',
    plural: 'Photos',
  },
  admin: {
    useAsTitle: 'title',
    defaultColumns: ['title', 'date', 'featured'],
  },
  access: {
    read: () => true,
  },
  defaultSort: '-date',
  hooks: {
    beforeChange: [
      async ({ data, req, operation }) => {
        // Only auto-populate on create
        if (operation === 'create' && data.image) {
          try {
            const media = await req.payload.findByID({
              collection: 'media',
              id: data.image,
            })

            if (media) {
              // Auto-populate title from filename if not provided
              if (!data.title && media.filename) {
                const name = media.filename.replace(/\.[^/.]+$/, '')
                data.title = name
                  .replace(/[-_.]/g, ' ')
                  .replace(/([a-z])([A-Z])/g, '$1 $2')
                  .replace(/\s+/g, ' ')
                  .trim()
              }

              // Auto-populate date from EXIF dateTaken, fallback to today
              if (!data.date) {
                const mediaData = media as { dateTaken?: string }
                data.date = mediaData.dateTaken || new Date().toISOString()
              }
            }
          } catch {
            // Silently fail - user can set values manually
            if (!data.date) {
              data.date = new Date().toISOString()
            }
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
        description: 'Upload an image - title and date will auto-populate from the file',
      },
    },
    {
      name: 'title',
      type: 'text',
      admin: {
        description: 'Defaults to image filename if left empty',
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
