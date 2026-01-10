import type { Access } from 'payload'

/**
 * Access control helper - allows access only to authenticated users
 */
export const isAuthenticated: Access = ({ req: { user } }) => {
  return Boolean(user)
}

/**
 * Access control helper - allows public read, authenticated write
 */
export const publicReadAuthenticatedWrite = {
  read: () => true,
  create: isAuthenticated,
  update: isAuthenticated,
  delete: isAuthenticated,
}
