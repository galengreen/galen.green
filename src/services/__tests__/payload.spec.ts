import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { photos, projects, blogPosts, contact, github, globals } from '../payload'

type MockResponseInit = {
  ok: boolean
  status?: number
  statusText?: string
  json: unknown
}

const createMockResponse = ({ ok, status = 200, statusText = 'OK', json }: MockResponseInit) => {
  return {
    ok,
    status,
    statusText,
    json: vi.fn().mockResolvedValue(json),
  }
}

describe('payload service', () => {
  const fetchMock = vi.fn()
  let consoleErrorSpy: ReturnType<typeof vi.spyOn>

  beforeEach(() => {
    fetchMock.mockReset()
    vi.stubGlobal('fetch', fetchMock)
    consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
  })

  afterEach(() => {
    consoleErrorSpy.mockRestore()
    vi.unstubAllGlobals()
  })

  it('fetches photos list and returns docs', async () => {
    fetchMock.mockResolvedValueOnce(
      createMockResponse({
        ok: true,
        json: { docs: [{ id: 'photo-1' }] },
      }),
    )

    const result = await photos.getAll(25)

    expect(fetchMock).toHaveBeenCalledWith('/api/photos?limit=25&sort=-date&depth=1', {
      headers: {
        'Content-Type': 'application/json',
      },
    })
    expect(result).toEqual([{ id: 'photo-1' }])
  })

  it('returns null when project slug is not found', async () => {
    fetchMock.mockResolvedValueOnce(
      createMockResponse({
        ok: true,
        json: { docs: [] },
      }),
    )

    const result = await projects.getBySlug('missing-slug')

    expect(result).toBeNull()
  })

  it('encodes slug values in project and blog queries', async () => {
    fetchMock.mockResolvedValue(
      createMockResponse({
        ok: true,
        json: { docs: [] },
      }),
    )

    const slug = 'my project/#1?test=true'
    const encodedSlug = encodeURIComponent(slug)

    await projects.getBySlug(slug)
    await blogPosts.getBySlug(slug)

    expect(fetchMock).toHaveBeenNthCalledWith(
      1,
      `/api/projects?where[slug][equals]=${encodedSlug}&depth=2`,
      {
        headers: {
          'Content-Type': 'application/json',
        },
      },
    )

    expect(fetchMock).toHaveBeenNthCalledWith(
      2,
      `/api/blog-posts?where[slug][equals]=${encodedSlug}&where[published][equals]=true&depth=1`,
      {
        headers: {
          'Content-Type': 'application/json',
        },
      },
    )
  })

  it('submits contact form with POST body', async () => {
    fetchMock.mockResolvedValueOnce(
      createMockResponse({
        ok: true,
        json: {},
      }),
    )

    await contact.submit({
      name: 'Test User',
      email: 'test@example.com',
      message: 'Hello',
    })

    expect(fetchMock).toHaveBeenCalledWith('/api/contact-submissions', {
      method: 'POST',
      body: JSON.stringify({
        name: 'Test User',
        email: 'test@example.com',
        message: 'Hello',
      }),
      headers: {
        'Content-Type': 'application/json',
      },
    })
  })

  it('throws descriptive error when API returns non-ok response', async () => {
    fetchMock.mockResolvedValueOnce(
      createMockResponse({
        ok: false,
        status: 500,
        statusText: 'Server Error',
        json: {},
      }),
    )

    await expect(globals.getSiteSettings()).rejects.toThrow('API Error: 500 Server Error')
    expect(consoleErrorSpy).toHaveBeenCalled()
  })

  it('rethrows network errors and logs endpoint context', async () => {
    const networkError = new Error('network down')
    fetchMock.mockRejectedValueOnce(networkError)

    await expect(photos.getFeatured()).rejects.toThrow('network down')
    expect(consoleErrorSpy).toHaveBeenCalledWith(
      'Failed to fetch /photos?where[featured][equals]=true&limit=10&sort=-date&depth=1:',
      networkError,
    )
  })

  it('throws when github stats endpoint fails', async () => {
    fetchMock.mockResolvedValueOnce(
      createMockResponse({
        ok: false,
        status: 503,
        statusText: 'Service Unavailable',
        json: {},
      }),
    )

    await expect(github.getStats()).rejects.toThrow('Failed to fetch GitHub stats')
  })

  it('throws when refreshing github stats endpoint fails', async () => {
    fetchMock.mockResolvedValueOnce(
      createMockResponse({
        ok: false,
        status: 503,
        statusText: 'Service Unavailable',
        json: {},
      }),
    )

    await expect(github.refreshStats()).rejects.toThrow('Failed to refresh GitHub stats')
  })
})
