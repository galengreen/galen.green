import type { Photo, Project, BlogPost, About, GitHubStats, PaginatedResponse } from '@/types'

// API base URL - configured via environment variable
const API_URL = import.meta.env.VITE_PAYLOAD_URL || 'http://localhost:3000'

/**
 * Generic fetch wrapper with error handling
 */
async function fetchAPI<T>(endpoint: string, options?: RequestInit): Promise<T> {
  const url = `${API_URL}/api${endpoint}`

  try {
    const response = await fetch(url, {
      headers: {
        'Content-Type': 'application/json',
      },
      ...options,
    })

    if (!response.ok) {
      throw new Error(`API Error: ${response.status} ${response.statusText}`)
    }

    return response.json()
  } catch (error) {
    console.error(`Failed to fetch ${endpoint}:`, error)
    throw error
  }
}

/**
 * Photos API
 */
export const photos = {
  async getAll(limit = 50): Promise<Photo[]> {
    const response = await fetchAPI<PaginatedResponse<Photo>>(
      `/photos?limit=${limit}&sort=-date&depth=1`,
    )
    return response.docs
  },

  async getFeatured(): Promise<Photo[]> {
    const response = await fetchAPI<PaginatedResponse<Photo>>(
      `/photos?where[featured][equals]=true&limit=10&sort=-date&depth=1`,
    )
    return response.docs
  },

  async getById(id: string): Promise<Photo> {
    return fetchAPI<Photo>(`/photos/${id}?depth=1`)
  },
}

/**
 * Projects API
 */
export const projects = {
  async getAll(limit = 20): Promise<Project[]> {
    const response = await fetchAPI<PaginatedResponse<Project>>(
      `/projects?limit=${limit}&sort=-date&depth=2`,
    )
    return response.docs
  },

  async getFeatured(): Promise<Project[]> {
    const response = await fetchAPI<PaginatedResponse<Project>>(
      `/projects?where[featured][equals]=true&limit=5&sort=-date&depth=2`,
    )
    return response.docs
  },

  async getBySlug(slug: string): Promise<Project | null> {
    const response = await fetchAPI<PaginatedResponse<Project>>(
      `/projects?where[slug][equals]=${slug}&depth=2`,
    )
    return response.docs[0] || null
  },
}

/**
 * Blog Posts API
 */
export const blogPosts = {
  async getAll(limit = 20): Promise<BlogPost[]> {
    const response = await fetchAPI<PaginatedResponse<BlogPost>>(
      `/blog-posts?where[published][equals]=true&limit=${limit}&sort=-date&depth=1`,
    )
    return response.docs
  },

  async getRecent(limit = 5): Promise<BlogPost[]> {
    const response = await fetchAPI<PaginatedResponse<BlogPost>>(
      `/blog-posts?where[published][equals]=true&limit=${limit}&sort=-date&depth=1`,
    )
    return response.docs
  },

  async getBySlug(slug: string): Promise<BlogPost | null> {
    const response = await fetchAPI<PaginatedResponse<BlogPost>>(
      `/blog-posts?where[slug][equals]=${slug}&where[published][equals]=true&depth=1`,
    )
    return response.docs[0] || null
  },
}

/**
 * Globals API
 */
export const globals = {
  async getAbout(): Promise<About> {
    return fetchAPI<About>('/globals/about?depth=2')
  },

  async getGitHubStats(): Promise<GitHubStats> {
    return fetchAPI<GitHubStats>('/globals/github-stats')
  },
}

/**
 * Contact Form API
 */
export const contact = {
  async submit(data: { name: string; email: string; message: string }): Promise<void> {
    await fetchAPI('/contact-submissions', {
      method: 'POST',
      body: JSON.stringify(data),
    })
  },
}

/**
 * GitHub Stats API (custom endpoint)
 */
export const github = {
  async getStats(): Promise<GitHubStats> {
    const response = await fetch(`${API_URL}/api/github-stats`)
    if (!response.ok) {
      throw new Error('Failed to fetch GitHub stats')
    }
    return response.json()
  },

  async refreshStats(): Promise<GitHubStats> {
    const response = await fetch(`${API_URL}/api/github-stats`, {
      method: 'POST',
    })
    if (!response.ok) {
      throw new Error('Failed to refresh GitHub stats')
    }
    return response.json()
  },
}

// Export all APIs
export const api = {
  photos,
  projects,
  blogPosts,
  globals,
  contact,
  github,
}

export default api
