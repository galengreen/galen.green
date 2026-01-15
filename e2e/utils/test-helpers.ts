import type { Page } from '@playwright/test'

/**
 * Wait for page to be fully loaded (network idle + no pending animations)
 */
export async function waitForPageReady(page: Page): Promise<void> {
  await page.waitForLoadState('networkidle')
  // Wait for any CSS transitions to complete
  await page.waitForTimeout(100)
}

/**
 * Get the current theme from the document
 */
export async function getCurrentTheme(page: Page): Promise<'light' | 'dark'> {
  return page.evaluate(() => {
    const html = document.documentElement
    return html.classList.contains('dark') ? 'dark' : 'light'
  })
}

/**
 * Set theme via localStorage (before page load)
 */
export async function setTheme(page: Page, theme: 'light' | 'dark'): Promise<void> {
  await page.addInitScript((t) => {
    localStorage.setItem('theme', t)
  }, theme)
}

/**
 * Scroll to a section by its ID
 */
export async function scrollToSection(page: Page, sectionId: string): Promise<void> {
  await page.evaluate((id) => {
    const element = document.getElementById(id)
    if (element) {
      element.scrollIntoView({ behavior: 'instant' })
    }
  }, sectionId)
  // Wait for scroll to complete
  await page.waitForTimeout(100)
}

/**
 * Check if an element is in the viewport
 */
export async function isInViewport(page: Page, selector: string): Promise<boolean> {
  return page.evaluate((sel) => {
    const element = document.querySelector(sel)
    if (!element) return false

    const rect = element.getBoundingClientRect()
    return (
      rect.top >= 0 &&
      rect.left >= 0 &&
      rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) &&
      rect.right <= (window.innerWidth || document.documentElement.clientWidth)
    )
  }, selector)
}

/**
 * Fill a form field by label or placeholder
 */
export async function fillField(
  page: Page,
  identifier: string,
  value: string,
  type: 'label' | 'placeholder' = 'label',
): Promise<void> {
  if (type === 'label') {
    await page.getByLabel(identifier).fill(value)
  } else {
    await page.getByPlaceholder(identifier).fill(value)
  }
}

/**
 * Take a named screenshot for debugging
 */
export async function debugScreenshot(page: Page, name: string): Promise<void> {
  await page.screenshot({ path: `test-results/debug-${name}.png`, fullPage: true })
}

/**
 * Performance timing helper - measure how long an action takes
 */
export async function measureTiming<T>(
  action: () => Promise<T>,
): Promise<{ result: T; duration: number }> {
  const start = Date.now()
  const result = await action()
  const duration = Date.now() - start
  return { result, duration }
}

/**
 * Wait for a specific network request to complete
 */
export async function waitForApiRequest(page: Page, urlPattern: string | RegExp): Promise<void> {
  await page.waitForResponse((response) => {
    const url = response.url()
    if (typeof urlPattern === 'string') {
      return url.includes(urlPattern)
    }
    return urlPattern.test(url)
  })
}
