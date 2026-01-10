import type { CollectionConfig } from 'payload'
import { sendContactNotification } from '../lib/email'

export const ContactSubmissions: CollectionConfig = {
  slug: 'contact-submissions',
  labels: {
    singular: 'Contact Submission',
    plural: 'Contact Submissions',
  },
  admin: {
    useAsTitle: 'name',
    defaultColumns: ['name', 'email', 'createdAt'],
    description: 'Messages received through the contact form',
  },
  access: {
    // Only authenticated users can read submissions
    read: ({ req: { user } }) => Boolean(user),
    // Anyone can create a submission (public form)
    create: () => true,
    // Only authenticated users can update/delete
    update: ({ req: { user } }) => Boolean(user),
    delete: ({ req: { user } }) => Boolean(user),
  },
  fields: [
    {
      name: 'name',
      type: 'text',
      required: true,
    },
    {
      name: 'email',
      type: 'email',
      required: true,
    },
    {
      name: 'message',
      type: 'textarea',
      required: true,
    },
    {
      name: 'read',
      type: 'checkbox',
      defaultValue: false,
      admin: {
        description: 'Mark as read after reviewing',
      },
    },
  ],
  hooks: {
    afterChange: [
      async ({ doc, operation, req }) => {
        if (operation === 'create') {
          // Get notification email from site settings
          let notificationEmail: string | undefined
          try {
            const siteSettings = await req.payload.findGlobal({
              slug: 'site-settings',
            })
            notificationEmail = siteSettings.email
          } catch (error) {
            console.warn('Could not fetch site settings for notification email:', error)
          }

          // Send email notification (non-blocking)
          sendContactNotification({
            name: doc.name,
            email: doc.email,
            message: doc.message,
            notificationEmail,
          }).catch((error) => {
            console.error('Failed to send contact notification:', error)
          })
        }
        return doc
      },
    ],
  },
}
