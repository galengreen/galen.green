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

const DEFAULT_FRONTEND_URL = 'https://galen.green'

const splitOrigins = (value?: string) =>
  (value || '')
    .split(',')
    .map((origin) => origin.trim())
    .filter(Boolean)

const productionOrigins = Array.from(
  new Set([
    DEFAULT_FRONTEND_URL,
    ...splitOrigins(process.env.FRONTEND_URL),
    ...splitOrigins(process.env.DEV_FRONTEND_URL),
  ]),
)

const developmentOrigins = Array.from(
  new Set(['http://localhost:5173', 'http://localhost:3000', ...productionOrigins]),
)

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
  cors: process.env.NODE_ENV === 'production' ? productionOrigins : developmentOrigins,
  csrf: process.env.NODE_ENV === 'production' ? productionOrigins : developmentOrigins,
})
