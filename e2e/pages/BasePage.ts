import type { Page, Locator } from '@playwright/test'

/**
 * Base Page Object with common functionality shared across all pages
 */
export class BasePage {
  readonly page: Page

  constructor(page: Page) {
    this.page = page
  }

  /**
   * Navigate to a URL
   */
  async goto(path: string = '/'): Promise<void> {
    await this.page.goto(path)
  }

  /**
   * Wait for page to be fully loaded
   */
  async waitForPageReady(): Promise<void> {
    await this.page.waitForLoadState('networkidle')
  }

  /**
   * Wait for an element to be visible
   */
  async waitForVisible(selector: string): Promise<void> {
    await this.page.locator(selector).waitFor({ state: 'visible' })
  }

  /**
   * Get the current URL
   */
  getUrl(): string {
    return this.page.url()
  }

  /**
   * Get page title
   */
  async getTitle(): Promise<string> {
    return this.page.title()
  }

  /**
   * Check if element exists and is visible
   */
  async isVisible(selector: string): Promise<boolean> {
    const locator = this.page.locator(selector)
    return locator.isVisible()
  }

  /**
   * Get element by test ID
   */
  getByTestId(testId: string): Locator {
    return this.page.getByTestId(testId)
  }

  /**
   * Get element by role
   */
  getByRole(
    role: Parameters<Page['getByRole']>[0],
    options?: Parameters<Page['getByRole']>[1],
  ): Locator {
    return this.page.getByRole(role, options)
  }

  /**
   * Get element by text
   */
  getByText(text: string | RegExp): Locator {
    return this.page.getByText(text)
  }

  /**
   * Get element by label
   */
  getByLabel(label: string | RegExp): Locator {
    return this.page.getByLabel(label)
  }

  /**
   * Take a screenshot
   */
  async screenshot(name: string): Promise<void> {
    await this.page.screenshot({ path: `test-results/${name}.png`, fullPage: true })
  }

  /**
   * Get current theme
   */
  async getCurrentTheme(): Promise<'light' | 'dark'> {
    return this.page.evaluate(() => {
      return document.documentElement.classList.contains('dark') ? 'dark' : 'light'
    })
  }

  /**
   * Scroll to an element
   */
  async scrollTo(selector: string): Promise<void> {
    await this.page.locator(selector).scrollIntoViewIfNeeded()
  }
}
