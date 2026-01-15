import { test, expect } from '../fixtures/test-fixtures.js'
import { HomePage } from '../pages/HomePage.js'
import { BlogPostPage } from '../pages/BlogPostPage.js'

/* eslint-disable playwright/no-networkidle -- networkidle is intentional for performance testing */

// Performance budgets (in milliseconds unless otherwise noted)
// Note: These are relaxed for dev environment - production should be stricter
const BUDGETS = {
  // Page load budgets
  PAGE_LOAD_DOM_CONTENT: 5000, // DOM content loaded
  PAGE_LOAD_NETWORK_IDLE: 10000, // Network idle
  BLOG_POST_LOAD: 5000, // Blog post page load

  // Core Web Vitals budgets
  LCP: 4000, // Largest Contentful Paint
  FCP: 3000, // First Contentful Paint
  TTI: 5000, // Time to Interactive

  // Resource budgets
  TOTAL_PAGE_WEIGHT_MB: 5, // Total page weight in MB (dev includes source maps)
  TOTAL_REQUESTS: 100, // Maximum number of requests (dev has more granular chunks)

  // Navigation budgets
  SCROLL_TIME: 3000, // Time for smooth scroll to complete
  TOGGLE_TIME: 1000, // Time for theme toggle
}

test.describe('Performance', () => {
  test.beforeEach(async ({ mockApi }) => {
    await mockApi.setupMocks()
  })

  test.describe('Homepage Load Performance', () => {
    test('homepage loads within DOM content budget', async ({ page }) => {
      const startTime = Date.now()

      await page.goto('/')
      await page.waitForLoadState('domcontentloaded')

      const loadTime = Date.now() - startTime

      expect(loadTime).toBeLessThan(BUDGETS.PAGE_LOAD_DOM_CONTENT)
    })

    test('homepage reaches network idle within budget', async ({ page }) => {
      const startTime = Date.now()

      await page.goto('/')
      await page.waitForLoadState('networkidle')

      const loadTime = Date.now() - startTime

      expect(loadTime).toBeLessThan(BUDGETS.PAGE_LOAD_NETWORK_IDLE)
    })

    test('homepage LCP is within budget', async ({ page }) => {
      await page.goto('/')

      // Wait for LCP
      const lcp = await page.evaluate(() => {
        return new Promise<number>((resolve) => {
          let lcpValue = 0

          const observer = new PerformanceObserver((list) => {
            const entries = list.getEntries()
            const lastEntry = entries[entries.length - 1]
            lcpValue = lastEntry.startTime
          })

          observer.observe({ type: 'largest-contentful-paint', buffered: true })

          // Wait for LCP to settle
          setTimeout(() => {
            observer.disconnect()
            resolve(lcpValue)
          }, 3000)
        })
      })

      expect(lcp).toBeLessThan(BUDGETS.LCP)
    })

    test('homepage FCP is within budget', async ({ page }) => {
      await page.goto('/')

      const fcp = await page.evaluate(() => {
        return new Promise<number>((resolve) => {
          const observer = new PerformanceObserver((list) => {
            const entries = list.getEntries()
            const fcpEntry = entries.find((e) => e.name === 'first-contentful-paint')
            if (fcpEntry) {
              observer.disconnect()
              resolve(fcpEntry.startTime)
            }
          })

          observer.observe({ type: 'paint', buffered: true })

          // Timeout fallback
          setTimeout(() => {
            observer.disconnect()
            resolve(0)
          }, 5000)
        })
      })

      expect(fcp).toBeGreaterThan(0)
      expect(fcp).toBeLessThan(BUDGETS.FCP)
    })
  })

  test.describe('Blog Post Load Performance', () => {
    test('blog post page loads within budget', async ({ page, mockApi }) => {
      const post = mockApi.mockData.blogPosts.docs[0]
      const blogPostPage = new BlogPostPage(page)

      const startTime = Date.now()

      await blogPostPage.goto(post.slug)
      await page.waitForLoadState('domcontentloaded')

      const loadTime = Date.now() - startTime

      expect(loadTime).toBeLessThan(BUDGETS.BLOG_POST_LOAD)
    })
  })

  test.describe('Resource Budgets', () => {
    test('total page weight is within budget', async ({ page }) => {
      let totalBytes = 0

      // Track all responses
      page.on('response', (response) => {
        const headers = response.headers()
        const contentLength = parseInt(headers['content-length'] || '0', 10)
        totalBytes += contentLength
      })

      await page.goto('/')
      await page.waitForLoadState('networkidle')

      const totalMB = totalBytes / (1024 * 1024)

      expect(totalMB).toBeLessThan(BUDGETS.TOTAL_PAGE_WEIGHT_MB)
    })

    test('number of requests is within budget', async ({ page }) => {
      let requestCount = 0

      page.on('request', () => {
        requestCount++
      })

      await page.goto('/')
      await page.waitForLoadState('networkidle')

      expect(requestCount).toBeLessThan(BUDGETS.TOTAL_REQUESTS)
    })
  })

  test.describe('Navigation Performance', () => {
    test('section scrolling is smooth', async ({ page }) => {
      const homePage = new HomePage(page)
      await homePage.goto()
      await homePage.waitForContent()

      const startTime = Date.now()

      await homePage.navbar.goToContact()

      const scrollTime = Date.now() - startTime

      // Scrolling should complete within a reasonable time
      expect(scrollTime).toBeLessThan(BUDGETS.SCROLL_TIME)

      // Contact section should be visible
      await expect(homePage.contactSection).toBeVisible()
    })

    test('theme toggle is responsive', async ({ page }) => {
      const homePage = new HomePage(page)
      await homePage.goto()
      await homePage.waitForContent()

      const startTime = Date.now()

      await homePage.navbar.toggleTheme()

      const toggleTime = Date.now() - startTime

      // Theme toggle should be responsive
      expect(toggleTime).toBeLessThan(BUDGETS.TOGGLE_TIME)
    })
  })

  test.describe('CLS (Cumulative Layout Shift)', () => {
    test('homepage has minimal layout shift', async ({ page }) => {
      await page.goto('/')

      // Measure CLS
      const cls = await page.evaluate(() => {
        return new Promise<number>((resolve) => {
          let clsValue = 0

          const observer = new PerformanceObserver((list) => {
            for (const entry of list.getEntries()) {
              // @ts-expect-error LayoutShift is not in standard types
              if (!entry.hadRecentInput) {
                // @ts-expect-error LayoutShift is not in standard types
                clsValue += entry.value
              }
            }
          })

          observer.observe({ type: 'layout-shift', buffered: true })

          // Wait for page to stabilise
          setTimeout(() => {
            observer.disconnect()
            resolve(clsValue)
          }, 5000)
        })
      })

      // CLS should be under 0.1 (good score)
      expect(cls).toBeLessThan(0.1)
    })
  })

  test.describe('Performance Marks', () => {
    test('records custom performance timing', async ({ page }) => {
      const homePage = new HomePage(page)

      // Add performance marks
      await page.addInitScript(() => {
        performance.mark('page-start')
      })

      await homePage.goto()

      // Mark when content is visible
      await page.evaluate(() => {
        performance.mark('content-visible')
        performance.measure('time-to-content', 'page-start', 'content-visible')
      })

      const measures = await page.evaluate(() => {
        const entries = performance.getEntriesByType('measure')
        return entries.map((e) => ({ name: e.name, duration: e.duration }))
      })

      // Should have recorded the measure
      const timeToContent = measures.find((m) => m.name === 'time-to-content')
      expect(timeToContent).toBeDefined()
    })
  })
})
