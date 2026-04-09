import type { CollectionConfig } from 'payload'
import { isAuthenticated } from '../access/isAuthenticated'

export const Users: CollectionConfig = {
  slug: 'users',
  labels: {
    singular: 'User',
    plural: 'Users',
  },
  admin: {
    useAsTitle: 'email',
  },
  auth: true,
  access: {
    // Only authenticated users can read user data
    read: isAuthenticated,
    // Only authenticated users can create new users
    create: isAuthenticated,
    // Users can only update their own account
    update: ({ req: { user }, id }) => {
      if (!user) return false
      return user.id === id
    },
    // Only authenticated users can delete (consider restricting further)
    delete: isAuthenticated,
  },
  fields: [
    {
      name: 'name',
      type: 'text',
    },
  ],
}
