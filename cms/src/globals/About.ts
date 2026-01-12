import type { GlobalConfig } from 'payload'
import { isAuthenticated } from '../access/isAuthenticated'

export const About: GlobalConfig = {
  slug: 'about',
  label: 'About',
  admin: {
    description: 'The about section content displayed on the homepage',
  },
  access: {
    read: () => true,
    update: isAuthenticated,
  },
  fields: [
    {
      name: 'content',
      type: 'richText',
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
