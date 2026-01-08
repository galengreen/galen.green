import type { GlobalConfig } from 'payload'

export const SiteSettings: GlobalConfig = {
  slug: 'site-settings',
  label: 'Site Settings',
  admin: {
    description: 'Global site settings and information',
  },
  access: {
    read: () => true,
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
                  defaultValue: 'Galen',
                  admin: {
                    description: 'First name (displayed in hero)',
                  },
                },
                {
                  name: 'last',
                  type: 'text',
                  required: true,
                  defaultValue: 'Green',
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
              defaultValue: 'dev@galen.green',
              admin: {
                description: 'Contact email address',
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
                  defaultValue: 'About',
                },
                {
                  name: 'projects',
                  type: 'text',
                  defaultValue: 'Projects',
                },
                {
                  name: 'blog',
                  type: 'text',
                  defaultValue: 'Blog',
                },
                {
                  name: 'photos',
                  type: 'text',
                  defaultValue: 'Photography',
                },
                {
                  name: 'contact',
                  type: 'text',
                  defaultValue: 'Contact',
                },
              ],
            },
          ],
        },
      ],
    },
  ],
}
