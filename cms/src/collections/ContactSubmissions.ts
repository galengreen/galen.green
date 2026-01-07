import type { CollectionConfig } from 'payload'

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
      async ({ doc, operation }) => {
        if (operation === 'create') {
          // TODO: Send email notification to dev@galen.green
          // This can be implemented with nodemailer or a service like Resend
          console.log(`New contact submission from ${doc.name} (${doc.email})`)
        }
        return doc
      },
    ],
  },
}
