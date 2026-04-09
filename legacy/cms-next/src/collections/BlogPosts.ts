import type { CollectionConfig } from 'payload'
import { isAuthenticated } from '../access/isAuthenticated'

export const BlogPosts: CollectionConfig = {
  slug: 'blog-posts',
  labels: {
    singular: 'Blog Post',
    plural: 'Blog Posts',
  },
  admin: {
    useAsTitle: 'title',
    defaultColumns: ['title', 'date', 'published'],
  },
  access: {
    // Public can only read published posts, authenticated users can read all
    read: ({ req: { user } }) => {
      if (user) return true
      return { published: { equals: true } }
    },
    create: isAuthenticated,
    update: isAuthenticated,
    delete: isAuthenticated,
  },
  defaultSort: '-date',
  fields: [
    {
      name: 'title',
      type: 'text',
      required: true,
    },
    {
      name: 'slug',
      type: 'text',
      required: true,
      unique: true,
      admin: {
        description: 'URL-friendly identifier (e.g., "my-first-post")',
      },
    },
    {
      name: 'excerpt',
      type: 'textarea',
      admin: {
        description: 'Brief summary shown in the blog list',
      },
    },
    {
      name: 'content',
      type: 'richText',
      admin: {
        description: 'The full blog post content',
      },
    },
    {
      name: 'coverImage',
      type: 'upload',
      relationTo: 'media',
      admin: {
        description: 'Optional cover image for the post',
      },
    },
    {
      name: 'date',
      type: 'date',
      defaultValue: () => new Date().toISOString(),
      admin: {
        date: {
          pickerAppearance: 'dayOnly',
          displayFormat: 'd MMM yyyy',
        },
      },
    },
    {
      name: 'published',
      type: 'checkbox',
      defaultValue: false,
      admin: {
        description: 'Only published posts are visible on the site',
      },
    },
  ],
}
