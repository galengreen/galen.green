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
          label: 'Loading Screen',
          fields: [
            {
              name: 'loadingMessages',
              type: 'array',
              label: 'Loading Screen Messages',
              admin: {
                description:
                  'Funny messages shown randomly during page load. Self-deprecating dev humour encouraged!',
              },
              fields: [
                {
                  name: 'message',
                  type: 'text',
                  required: true,
                  admin: {
                    placeholder: 'e.g., "Consulting Stack Overflow..."',
                  },
                },
              ],
            },
          ],
        },
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
            {
              name: 'heroBackground',
              type: 'group',
              label: 'Hero Background',
              admin: {
                description: 'Background images for the hero section (square images recommended)',
              },
              fields: [
                {
                  name: 'light',
                  type: 'upload',
                  relationTo: 'media',
                  admin: {
                    description: 'Background image for light mode',
                  },
                },
                {
                  name: 'dark',
                  type: 'upload',
                  relationTo: 'media',
                  admin: {
                    description: 'Background image for dark mode',
                  },
                },
              ],
            },
            {
              name: 'heroForeground',
              type: 'group',
              label: 'Hero Foreground',
              admin: {
                description:
                  'Foreground layer images with separate parallax speed (appears above background)',
              },
              fields: [
                {
                  name: 'light',
                  type: 'upload',
                  relationTo: 'media',
                  admin: {
                    description: 'Foreground image for light mode',
                  },
                },
                {
                  name: 'dark',
                  type: 'upload',
                  relationTo: 'media',
                  admin: {
                    description: 'Foreground image for dark mode',
                  },
                },
              ],
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
          label: 'SEO',
          fields: [
            {
              name: 'seo',
              type: 'group',
              admin: {
                description:
                  'Search engine optimisation settings. These control how the site appears in Google and social media.',
              },
              fields: [
                {
                  name: 'description',
                  type: 'textarea',
                  admin: {
                    description:
                      'Meta description shown in Google search results and social media previews. Aim for 150–300 characters. Google displays ~155 characters but indexes the full text for ranking.',
                  },
                },
                {
                  name: 'jobTitle',
                  type: 'text',
                  admin: {
                    description:
                      'Your job title for structured data (e.g., "Software Engineer"). Used in the Person schema for Google Knowledge Panel.',
                    placeholder: 'e.g., Software Engineer',
                  },
                },
                {
                  name: 'ogImage',
                  type: 'upload',
                  relationTo: 'media',
                  admin: {
                    description:
                      'Image shown in Google search results and when sharing on social media. Recommended size: 1200×630px. Falls back to your profile photo if not set.',
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
                  defaultValue: 'Photos',
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
