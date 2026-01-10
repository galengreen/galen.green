import type { GlobalConfig } from 'payload'
import { isAuthenticated } from '../access/isAuthenticated'

export const SiteSettings: GlobalConfig = {
  slug: 'site-settings',
  label: 'Site Settings',
  admin: {
    description: 'Global site settings and information',
  },
  access: {
    read: () => true,
    update: isAuthenticated,
  },
  fields: [
    {
      type: 'tabs',
      tabs: [
        {
          label: 'General',
          fields: [
            {
              name: 'name',
              type: 'group',
              fields: [
                {
                  name: 'first',
                  type: 'text',
                  required: true,
                  admin: {
                    description: 'First name (displayed in hero)',
                  },
                },
                {
                  name: 'last',
                  type: 'text',
                  required: true,
                  admin: {
                    description: 'Last name (displayed in hero)',
                  },
                },
              ],
            },
            {
              name: 'email',
              type: 'email',
              required: true,
              admin: {
                description: 'Contact email address (also receives contact form notifications)',
              },
            },
          ],
        },
        {
          label: 'Social Links',
          fields: [
            {
              name: 'socials',
              type: 'array',
              label: 'Social Media Links',
              admin: {
                description: 'Links displayed in the footer',
              },
              fields: [
                {
                  name: 'platform',
                  type: 'select',
                  required: true,
                  options: [
                    { label: 'GitHub', value: 'github' },
                    { label: 'LinkedIn', value: 'linkedin' },
                    { label: 'Instagram', value: 'instagram' },
                    { label: 'Twitter/X', value: 'twitter' },
                    { label: 'YouTube', value: 'youtube' },
                    { label: 'Email', value: 'email' },
                  ],
                },
                {
                  name: 'url',
                  type: 'text',
                  required: true,
                  admin: {
                    description: 'Full URL (use mailto: for email)',
                  },
                },
              ],
            },
          ],
        },
        {
          label: 'Section Titles',
          fields: [
            {
              name: 'sectionTitles',
              type: 'group',
              admin: {
                description: 'Customise section headings',
              },
              fields: [
                {
                  name: 'about',
                  type: 'text',
                  required: true,
                },
                {
                  name: 'projects',
                  type: 'text',
                  required: true,
                },
                {
                  name: 'blog',
                  type: 'text',
                  required: true,
                },
                {
                  name: 'photos',
                  type: 'text',
                  required: true,
                },
                {
                  name: 'contact',
                  type: 'text',
                  required: true,
                },
              ],
            },
          ],
        },
      ],
    },
  ],
}
