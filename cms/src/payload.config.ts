import path from 'path'
import { fileURLToPath } from 'url'
import { buildConfig } from 'payload'
import { mongooseAdapter } from '@payloadcms/db-mongodb'
import { lexicalEditor } from '@payloadcms/richtext-lexical'
import sharp from 'sharp'

import { Media, Photos, Projects, BlogPosts, ContactSubmissions, Users } from './collections'
import { About, GitHubStats, SiteSettings } from './globals'

const filename = fileURLToPath(import.meta.url)
const dirname = path.dirname(filename)

export default buildConfig({
  serverURL: process.env.NEXT_PUBLIC_SERVER_URL || 'http://localhost:3000',
  admin: {
    user: Users.slug,
    meta: {
      titleSuffix: '- Galen Green CMS',
    },
  },
  collections: [Users, Media, Photos, Projects, BlogPosts, ContactSubmissions],
  globals: [SiteSettings, About, GitHubStats],
  editor: lexicalEditor(),
  secret: process.env.PAYLOAD_SECRET || 'CHANGE_ME_IN_PRODUCTION',
  typescript: {
    outputFile: path.resolve(dirname, 'payload-types.ts'),
  },
  db: mongooseAdapter({
    url: process.env.MONGODB_URI || 'mongodb://localhost:27017/galen-green',
  }),
  sharp,
  cors: [
    'http://localhost:5173', // Vue dev server
    'http://localhost:3000', // Next.js dev server
    process.env.FRONTEND_URL || 'https://galen.green',
  ].filter(Boolean),
  csrf: [
    'http://localhost:5173',
    'http://localhost:3000',
    process.env.FRONTEND_URL || 'https://galen.green',
  ].filter(Boolean),
})
