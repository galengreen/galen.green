import type { Page, Locator } from '@playwright/test'

/**
 * NavBar component Page Object
 */
export class NavBar {
  readonly page: Page
  readonly navbar: Locator
  readonly themeToggle: Locator

  constructor(page: Page) {
    this.page = page
    this.navbar = page.locator('.navbar')
    this.themeToggle = page.locator('.theme-toggle')
  }

  /**
   * Get a navigation link by label
   */
  getNavLink(label: string): Locator {
    return this.navbar.getByRole('button', { name: label })
  }

  /**
   * Click a navigation link
   */
  async clickNavLink(label: string): Promise<void> {
    await this.getNavLink(label).click()
    // Wait for smooth scroll to complete
    await this.page.waitForTimeout(500)
  }

  /**
   * Navigate to About section
   */
  async goToAbout(): Promise<void> {
    await this.clickNavLink('About')
  }

  /**
   * Navigate to Projects section
   */
  async goToProjects(): Promise<void> {
    await this.clickNavLink('Projects')
  }

  /**
   * Navigate to Blog section
   */
  async goToBlog(): Promise<void> {
    await this.clickNavLink('Blog')
  }

  /**
   * Navigate to Photos section
   */
  async goToPhotos(): Promise<void> {
    await this.clickNavLink('Photos')
  }

  /**
   * Navigate to Contact section
   */
  async goToContact(): Promise<void> {
    await this.clickNavLink('Contact')
  }

  /**
   * Toggle the theme
   */
  async toggleTheme(): Promise<void> {
    await this.themeToggle.click()
  }

  /**
   * Get the current theme from the toggle button title
   */
  async getThemeFromToggle(): Promise<string> {
    const title = await this.themeToggle.getAttribute('title')
    return title || ''
  }

  /**
   * Check if navbar is visible
   */
  async isVisible(): Promise<boolean> {
    return this.navbar.isVisible()
  }

  /**
   * Get all navigation link labels
   */
  async getNavLinkLabels(): Promise<string[]> {
    const links = this.navbar.locator('.nav-link')
    return links.allTextContents()
  }
}
