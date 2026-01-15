import type { Page, Locator } from '@playwright/test'
import { BasePage } from './BasePage.js'
import { NavBar } from './components/NavBar.js'
import { ContactForm } from './components/ContactForm.js'

/**
 * Home Page Object
 */
export class HomePage extends BasePage {
  readonly navbar: NavBar
  readonly contactForm: ContactForm

  // Section locators
  readonly heroSection: Locator
  readonly aboutSection: Locator
  readonly projectsSection: Locator
  readonly blogSection: Locator
  readonly photosSection: Locator
  readonly contactSection: Locator
  readonly footerSection: Locator

  constructor(page: Page) {
    super(page)
    this.navbar = new NavBar(page)
    this.contactForm = new ContactForm(page)

    // Sections by ID
    this.heroSection = page.locator('#hero')
    this.aboutSection = page.locator('#about')
    this.projectsSection = page.locator('#projects')
    this.blogSection = page.locator('#blog')
    this.photosSection = page.locator('#photos')
    this.contactSection = page.locator('#contact')
    this.footerSection = page.locator('footer')
  }

  /**
   * Navigate to the home page
   */
  async goto(): Promise<void> {
    await super.goto('/')
  }

  /**
   * Wait for the page to be fully loaded with content
   */
  async waitForContent(): Promise<void> {
    await this.page.waitForLoadState('networkidle')
    // Wait for hero section to be visible
    await this.heroSection.waitFor({ state: 'visible' })
  }

  // ==================== Hero Section ====================

  /**
   * Get the hero name (first + last)
   */
  async getHeroName(): Promise<{ first: string; last: string }> {
    const firstName = await this.heroSection.locator('.hero-first-name').textContent()
    const lastName = await this.heroSection.locator('.hero-last-name').textContent()
    return {
      first: firstName?.trim() || '',
      last: lastName?.trim() || '',
    }
  }

  /**
   * Get the hero subtitle
   */
  async getHeroSubtitle(): Promise<string> {
    const subtitle = await this.heroSection.locator('.hero-subtitle').textContent()
    return subtitle?.trim() || ''
  }

  // ==================== About Section ====================

  /**
   * Get the about section title
   */
  async getAboutTitle(): Promise<string> {
    const title = await this.aboutSection.locator('.section-title').textContent()
    return title?.trim() || ''
  }

  /**
   * Check if GitHub graph is visible
   */
  async isGitHubGraphVisible(): Promise<boolean> {
    return this.aboutSection.locator('.github-graph').isVisible()
  }

  // ==================== Projects Section ====================

  /**
   * Get the projects section title
   */
  async getProjectsTitle(): Promise<string> {
    const title = await this.projectsSection.locator('.section-title').textContent()
    return title?.trim() || ''
  }

  /**
   * Get all project cards
   */
  getProjectCards(): Locator {
    return this.projectsSection.locator('.project-card')
  }

  /**
   * Get project count
   */
  async getProjectCount(): Promise<number> {
    return this.getProjectCards().count()
  }

  /**
   * Get project titles
   */
  async getProjectTitles(): Promise<string[]> {
    const titles = await this.getProjectCards().locator('.project-title').allTextContents()
    return titles.map((t) => t.trim())
  }

  // ==================== Blog Section ====================

  /**
   * Get the blog section title
   */
  async getBlogTitle(): Promise<string> {
    const title = await this.blogSection.locator('.section-title').textContent()
    return title?.trim() || ''
  }

  /**
   * Get all blog post cards/links
   */
  getBlogPostLinks(): Locator {
    return this.blogSection.locator('.blog-card, .blog-post-link, a[href*="/blog/"]')
  }

  /**
   * Get blog post count
   */
  async getBlogPostCount(): Promise<number> {
    return this.getBlogPostLinks().count()
  }

  /**
   * Click on a blog post by title
   */
  async clickBlogPost(title: string): Promise<void> {
    await this.blogSection.getByText(title).click()
  }

  // ==================== Photos Section ====================

  /**
   * Get the photos section title
   */
  async getPhotosTitle(): Promise<string> {
    const title = await this.photosSection.locator('.section-title').textContent()
    return title?.trim() || ''
  }

  /**
   * Get photo count in gallery
   */
  async getPhotoCount(): Promise<number> {
    return this.photosSection.locator('.photo-item, .masonry-item, img').count()
  }

  // ==================== Contact Section ====================

  /**
   * Get the contact section title
   */
  async getContactTitle(): Promise<string> {
    const title = await this.contactSection.locator('.section-title').textContent()
    return title?.trim() || ''
  }

  // ==================== Footer Section ====================

  /**
   * Get social links from footer
   */
  getSocialLinks(): Locator {
    return this.footerSection.locator('a[href*="github"], a[href*="linkedin"], a[href*="mailto"]')
  }

  /**
   * Get social link count
   */
  async getSocialLinkCount(): Promise<number> {
    return this.getSocialLinks().count()
  }

  // ==================== Section Visibility ====================

  /**
   * Check if a section is visible on the page
   */
  async isSectionVisible(
    section: 'hero' | 'about' | 'projects' | 'blog' | 'photos' | 'contact',
  ): Promise<boolean> {
    const sectionLocator = {
      hero: this.heroSection,
      about: this.aboutSection,
      projects: this.projectsSection,
      blog: this.blogSection,
      photos: this.photosSection,
      contact: this.contactSection,
    }[section]

    return sectionLocator.isVisible()
  }

  /**
   * Scroll to a specific section
   */
  async scrollToSection(
    section: 'hero' | 'about' | 'projects' | 'blog' | 'photos' | 'contact',
  ): Promise<void> {
    const sectionLocator = {
      hero: this.heroSection,
      about: this.aboutSection,
      projects: this.projectsSection,
      blog: this.blogSection,
      photos: this.photosSection,
      contact: this.contactSection,
    }[section]

    await sectionLocator.scrollIntoViewIfNeeded()
    await this.page.waitForTimeout(300) // Wait for scroll animation
  }
}
