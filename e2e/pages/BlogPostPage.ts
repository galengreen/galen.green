import type { Page, Locator } from '@playwright/test'
import { BasePage } from './BasePage.js'

/**
 * Blog Post Page Object
 */
export class BlogPostPage extends BasePage {
  readonly article: Locator
  readonly backButton: Locator
  readonly postTitle: Locator
  readonly postDate: Locator
  readonly postContent: Locator
  readonly coverImage: Locator
  readonly loadingState: Locator
  readonly errorState: Locator

  constructor(page: Page) {
    super(page)
    this.article = page.locator('article.blog-post')
    this.backButton = page.locator('.back-link')
    this.postTitle = page.locator('.post-title')
    this.postDate = page.locator('.post-date')
    this.postContent = page.locator('.post-content')
    this.coverImage = page.locator('.cover-image')
    this.loadingState = page.locator('.loading')
    this.errorState = page.locator('.error')
  }

  /**
   * Navigate to a blog post by slug
   */
  async goto(slug: string): Promise<void> {
    await super.goto(`/blog/${slug}`)
  }

  /**
   * Wait for post content to load
   */
  async waitForContent(): Promise<void> {
    // Wait for either content or error to be visible
    await Promise.race([
      this.postContent.waitFor({ state: 'visible', timeout: 10000 }),
      this.errorState.waitFor({ state: 'visible', timeout: 10000 }),
    ]).catch(() => {
      // If neither appears, just wait for loading to disappear
    })

    // Ensure loading is hidden
    await this.loadingState.waitFor({ state: 'hidden', timeout: 10000 }).catch(() => {
      // Loading might not exist if content loaded immediately
    })
  }

  /**
   * Check if post is loaded successfully
   */
  async isPostLoaded(): Promise<boolean> {
    const hasTitle = await this.postTitle.isVisible()
    const hasContent = await this.postContent.isVisible()
    return hasTitle && hasContent
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
    await this.backButton.click()
    // Wait for navigation
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
    await this.errorState.getByRole('button', { name: 'Go back' }).click()
  }

  /**
   * Check if loading skeleton is visible
   */
  async isLoading(): Promise<boolean> {
    return this.loadingState.isVisible()
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
