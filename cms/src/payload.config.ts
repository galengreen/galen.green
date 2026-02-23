import path from 'path'
import { fileURLToPath } from 'url'
import { buildConfig } from 'payload'
import { mongooseAdapter } from '@payloadcms/db-mongodb'
import { lexicalEditor } from '@payloadcms/richtext-lexical'
import { seoPlugin } from '@payloadcms/plugin-seo'
import { mcpPlugin } from '@payloadcms/plugin-mcp'
import sharp from 'sharp'

import { Media, Photos, Projects, BlogPosts, ContactSubmissions, Users } from './collections'
import { About, GitHubStats, SiteSettings } from './globals'

const filename = fileURLToPath(import.meta.url)
const dirname = path.dirname(filename)

import { getAllowedOrigins } from './lib/cors'

const { productionOrigins, developmentOrigins } = getAllowedOrigins()

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://galen.green'

export default buildConfig({
  serverURL: process.env.NEXT_PUBLIC_SERVER_URL || 'http://localhost:3000',
  localization: false,
  admin: {
    user: Users.slug,
    meta: {
      titleSuffix: '- Galen Green CMS',
    },
  },
  collections: [Users, Media, Photos, Projects, BlogPosts, ContactSubmissions],
  globals: [SiteSettings, About, GitHubStats],
  editor: lexicalEditor(),
  plugins: [
    seoPlugin({
      collections: ['blog-posts', 'projects'],
      uploadsCollection: 'media',
      tabbedUI: true,
      generateTitle: ({ doc }) => `${doc?.title ?? 'Untitled'} | Galen Green`,
      generateDescription: ({ doc }) => doc?.excerpt ?? '',
      generateImage: ({ doc }) => doc?.coverImage ?? doc?.images?.[0]?.image ?? null,
      generateURL: ({ doc, collectionSlug }) => {
        const slug = doc?.slug ?? ''
        if (collectionSlug === 'blog-posts') return `${SITE_URL}/#blog/${slug}`
        if (collectionSlug === 'projects') return `${SITE_URL}/#projects/${slug}`
        return SITE_URL
      },
    }),
    mcpPlugin({
      collections: {
        'blog-posts': {
          enabled: {
            find: true,
            create: true,
            update: true,
            delete: false,
          },
          description:
            'Blog posts about software engineering, web development, and personal projects by Galen Green',
        },
        projects: {
          enabled: {
            find: true,
            create: true,
            update: true,
            delete: false,
          },
          description:
            'Portfolio projects showcasing web applications, tools, and open source work with tech stack details',
        },
        photos: {
          enabled: {
            find: true,
            create: false,
            update: false,
            delete: false,
          },
          description: 'Photography portfolio with landscape, nature, and travel photographs',
        },
      },
    }),
  ],
  secret: (() => {
    const secret = process.env.PAYLOAD_SECRET
    if (!secret) {
      throw new Error('PAYLOAD_SECRET environment variable is required')
    }
    return secret
  })(),
  typescript: {
    outputFile: path.resolve(dirname, 'payload-types.ts'),
  },
  db: mongooseAdapter({
    url: process.env.MONGODB_URI || 'mongodb://localhost:27017/galen-green',
  }),
  sharp,
  cors: process.env.NODE_ENV === 'production' ? productionOrigins : developmentOrigins,
  csrf: process.env.NODE_ENV === 'production' ? productionOrigins : developmentOrigins,
})
