import type { GlobalConfig } from 'payload'

export const About: GlobalConfig = {
  slug: 'about',
  label: 'About',
  admin: {
    description: 'The about section content displayed on the homepage',
  },
  access: {
    read: () => true,
  },
  fields: [
    {
      name: 'content',
      type: 'richText',
      required: true,
      admin: {
        description: 'Your bio/about text (2-3 paragraphs)',
      },
    },
    {
      name: 'photo',
      type: 'upload',
      relationTo: 'media',
      admin: {
        description: 'Your profile photo for the hero section',
      },
    },
    {
      name: 'subtitle',
      type: 'text',
      admin: {
        description: 'Subtitle shown below your name (e.g., "Software Engineer & Photographer")',
      },
    },
  ],
}
