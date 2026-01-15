import { test as base, type Page } from '@playwright/test'
import { readFileSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))

// Load mock data
function loadMockData<T>(filename: string): T {
  const filePath = join(__dirname, 'api-mocks', filename)
  return JSON.parse(readFileSync(filePath, 'utf-8'))
}

// Mock data types
interface MockData {
  siteSettings: typeof import('./api-mocks/site-settings.json')
  about: typeof import('./api-mocks/about.json')
  githubStats: typeof import('./api-mocks/github-stats.json')
  blogPosts: typeof import('./api-mocks/blog-posts.json')
  projects: typeof import('./api-mocks/projects.json')
  photos: typeof import('./api-mocks/photos.json')
}

// API mocking fixture
export interface MockApiFixture {
  mockData: MockData
  setupMocks: () => Promise<void>
}

// Extend base test with our fixtures
export const test = base.extend<{
  mockApi: MockApiFixture
}>({
  mockApi: async ({ page }, use) => {
    const mockData: MockData = {
      siteSettings: loadMockData('site-settings.json'),
      about: loadMockData('about.json'),
      githubStats: loadMockData('github-stats.json'),
      blogPosts: loadMockData('blog-posts.json'),
      projects: loadMockData('projects.json'),
      photos: loadMockData('photos.json'),
    }

    const setupMocks = async () => {
      // Mock globals
      await page.route('**/api/globals/site-settings', (route) => {
        route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify(mockData.siteSettings),
        })
      })

      await page.route('**/api/globals/about**', (route) => {
        route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify(mockData.about),
        })
      })

      await page.route('**/api/globals/github-stats', (route) => {
        route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify(mockData.githubStats),
        })
      })

      // Mock GitHub stats custom endpoint
      await page.route('**/api/github-stats', (route) => {
        route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify(mockData.githubStats),
        })
      })

      // Mock blog posts - handle all query variations
      await page.route('**/api/blog-posts**', (route) => {
        const url = route.request().url()

        // Check if this is a slug query
        const slugMatch = url.match(/where\[slug\]\[equals\]=([^&]+)/)
        if (slugMatch) {
          const slug = decodeURIComponent(slugMatch[1])
          const post = mockData.blogPosts.docs.find((p) => p.slug === slug)
          if (post) {
            route.fulfill({
              status: 200,
              contentType: 'application/json',
              body: JSON.stringify({
                ...mockData.blogPosts,
                docs: [post],
                totalDocs: 1,
              }),
            })
          } else {
            route.fulfill({
              status: 200,
              contentType: 'application/json',
              body: JSON.stringify({
                ...mockData.blogPosts,
                docs: [],
                totalDocs: 0,
              }),
            })
          }
          return
        }

        // Default: return all posts
        route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify(mockData.blogPosts),
        })
      })

      // Mock projects
      await page.route('**/api/projects**', (route) => {
        const url = route.request().url()
        if (url.includes('where[featured]')) {
          const featuredProjects = mockData.projects.docs.filter((p) => p.featured)
          route.fulfill({
            status: 200,
            contentType: 'application/json',
            body: JSON.stringify({
              ...mockData.projects,
              docs: featuredProjects,
              totalDocs: featuredProjects.length,
            }),
          })
        } else {
          route.fulfill({
            status: 200,
            contentType: 'application/json',
            body: JSON.stringify(mockData.projects),
          })
        }
      })

      // Mock photos
      await page.route('**/api/photos**', (route) => {
        const url = route.request().url()
        if (url.includes('where[featured]')) {
          const featuredPhotos = mockData.photos.docs.filter((p) => p.featured)
          route.fulfill({
            status: 200,
            contentType: 'application/json',
            body: JSON.stringify({
              ...mockData.photos,
              docs: featuredPhotos,
              totalDocs: featuredPhotos.length,
            }),
          })
        } else {
          route.fulfill({
            status: 200,
            contentType: 'application/json',
            body: JSON.stringify(mockData.photos),
          })
        }
      })

      // Mock contact form submission
      await page.route('**/api/contact-submissions', (route) => {
        if (route.request().method() === 'POST') {
          route.fulfill({
            status: 201,
            contentType: 'application/json',
            body: JSON.stringify({ success: true }),
          })
        } else {
          route.continue()
        }
      })

      // Mock media files with placeholder images
      await page.route('**/media/**', (route) => {
        // Return a 1x1 transparent PNG for all image requests
        const transparentPng = Buffer.from(
          'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==',
          'base64',
        )
        route.fulfill({
          status: 200,
          contentType: 'image/png',
          body: transparentPng,
        })
      })
    }

    await use({ mockData, setupMocks })
  },
})

export { expect } from '@playwright/test'

// Helper type for page with mocked API
export type MockedPage = Page
