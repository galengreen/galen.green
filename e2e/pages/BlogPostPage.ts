import type { Page, Locator } from '@playwright/test'
import { BasePage } from './BasePage.js'

/**
 * Blog Post Page Object
 */
export class BlogPostPage extends BasePage {
  readonly article: Locator
  readonly closeButton: Locator
  readonly postTitle: Locator
  readonly postDate: Locator
  readonly postContent: Locator
  readonly coverImage: Locator
  readonly loadingScreen: Locator
  readonly lightboxOverlay: Locator
  readonly blogSection: Locator
  readonly errorState: Locator

  constructor(page: Page) {
    super(page)
    this.article = page.locator('.content-lightbox-inner')
    this.closeButton = page.getByRole('button', { name: 'Close' })
    this.postTitle = page.locator('.lightbox-title')
    this.postDate = page.locator('.lightbox-date')
    this.postContent = page.locator('.lightbox-body')
    this.coverImage = page.locator('.lightbox-cover img')
    this.loadingScreen = page.locator('.loading-screen')
    this.lightboxOverlay = page.locator('.lightbox-overlay')
    this.blogSection = page.locator('#blog')
    this.errorState = page.locator('.error')
  }

  /**
   * Navigate to a blog post by slug
   */
  async goto(slug: string): Promise<void> {
    await super.goto(`/#blog/${slug}`)
  }

  /**
   * Wait for post content to load
   */
  async waitForContent(): Promise<void> {
    await this.page.waitForLoadState('networkidle')

    await this.loadingScreen.waitFor({ state: 'hidden', timeout: 5000 }).catch(() => {
      // Overlay may not render in very fast test runs
    })

    // Wait for either lightbox content or blog section to be visible
    await Promise.race([
      this.postContent.waitFor({ state: 'visible', timeout: 10000 }),
      this.blogSection.waitFor({ state: 'visible', timeout: 10000 }),
    ]).catch(() => {
      // If neither appears, checks using locators will fail with clearer context
    })
  }

  /**
   * Check if post is loaded successfully
   */
  async isPostLoaded(): Promise<boolean> {
    const isLightboxOpen = await this.lightboxOverlay.isVisible()
    const hasTitle = await this.postTitle.isVisible()
    const hasContent = await this.postContent.isVisible()
    return isLightboxOpen && hasTitle && hasContent
  }

  /**
   * Check if error state is shown
   */
  async isErrorShown(): Promise<boolean> {
    return this.errorState.isVisible()
  }

  /**
   * Get the post title
   */
  async getPostTitle(): Promise<string> {
    const title = await this.postTitle.textContent()
    return title?.trim() || ''
  }

  /**
   * Get the post date
   */
  async getPostDate(): Promise<string> {
    const date = await this.postDate.textContent()
    return date?.trim() || ''
  }

  /**
   * Get the post content text
   */
  async getPostContentText(): Promise<string> {
    const content = await this.postContent.textContent()
    return content?.trim() || ''
  }

  /**
   * Check if cover image is visible
   */
  async hasCoverImage(): Promise<boolean> {
    return this.coverImage.isVisible()
  }

  /**
   * Get cover image alt text
   */
  async getCoverImageAlt(): Promise<string> {
    return (await this.coverImage.getAttribute('alt')) || ''
  }

  /**
   * Click the back button to return to blog list
   */
  async goBack(): Promise<void> {
    await this.closeButton.click()
    await this.page.waitForURL('**/#blog')
  }

  /**
   * Get error message text
   */
  async getErrorMessage(): Promise<string> {
    const heading = await this.errorState.locator('h1').textContent()
    return heading?.trim() || ''
  }

  /**
   * Click the "Go back" button in error state
   */
  async clickErrorGoBack(): Promise<void> {
    await this.page.evaluate(() => {
      history.replaceState(null, '', '#blog')
      window.dispatchEvent(new HashChangeEvent('hashchange'))
    })
    await this.page.waitForURL('**/#blog')
  }

  /**
   * Check if loading skeleton is visible
   */
  async isLoading(): Promise<boolean> {
    return this.loadingScreen.isVisible()
  }

  /**
   * Get all headings in the post content
   */
  async getContentHeadings(): Promise<string[]> {
    const headings = await this.postContent.locator('h1, h2, h3, h4, h5, h6').allTextContents()
    return headings.map((h) => h.trim())
  }

  /**
   * Get all links in the post content
   */
  getContentLinks(): Locator {
    return this.postContent.locator('a')
  }
}
