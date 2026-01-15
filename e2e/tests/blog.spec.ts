import { test, expect } from '../fixtures/test-fixtures.js'
import { HomePage } from '../pages/HomePage.js'
import { BlogPostPage } from '../pages/BlogPostPage.js'

test.describe('Blog', () => {
  test.beforeEach(async ({ mockApi }) => {
    await mockApi.setupMocks()
  })

  test.describe('Blog Section on Homepage', () => {
    test('displays blog posts list', async ({ page, mockApi }) => {
      const homePage = new HomePage(page)
      await homePage.goto()
      await homePage.waitForContent()

      await homePage.scrollToSection('blog')

      // Should display blog posts from mock data
      const firstPost = mockApi.mockData.blogPosts.docs[0]
      await expect(homePage.blogSection).toContainText(firstPost.title)
    })

    test('blog posts are clickable', async ({ page, mockApi }) => {
      const homePage = new HomePage(page)
      await homePage.goto()
      await homePage.waitForContent()

      await homePage.scrollToSection('blog')

      const firstPost = mockApi.mockData.blogPosts.docs[0]
      await homePage.clickBlogPost(firstPost.title)

      // Should navigate to blog post page
      await expect(page).toHaveURL(new RegExp(`/blog/${firstPost.slug}`))
    })
  })

  test.describe('Individual Blog Post Page', () => {
    test('loads blog post by slug', async ({ page, mockApi }) => {
      const blogPostPage = new BlogPostPage(page)
      const post = mockApi.mockData.blogPosts.docs[0]

      await blogPostPage.goto(post.slug)
      await blogPostPage.waitForContent()

      expect(await blogPostPage.isPostLoaded()).toBe(true)
    })

    test('displays correct post title', async ({ page, mockApi }) => {
      const blogPostPage = new BlogPostPage(page)
      const post = mockApi.mockData.blogPosts.docs[0]

      await blogPostPage.goto(post.slug)
      await blogPostPage.waitForContent()

      const title = await blogPostPage.getPostTitle()
      expect(title).toBe(post.title)
    })

    test('displays post date', async ({ page, mockApi }) => {
      const blogPostPage = new BlogPostPage(page)
      const post = mockApi.mockData.blogPosts.docs[0]

      await blogPostPage.goto(post.slug)
      await blogPostPage.waitForContent()

      const date = await blogPostPage.getPostDate()
      expect(date).not.toBe('')
    })

    test('displays post content', async ({ page, mockApi }) => {
      const blogPostPage = new BlogPostPage(page)
      const post = mockApi.mockData.blogPosts.docs[0]

      await blogPostPage.goto(post.slug)
      await blogPostPage.waitForContent()

      const content = await blogPostPage.getPostContentText()
      expect(content).not.toBe('')
    })

    test('shows cover image when available', async ({ page, mockApi }) => {
      const blogPostPage = new BlogPostPage(page)
      const post = mockApi.mockData.blogPosts.docs[0]

      // First post has a cover image in our mock data
      await blogPostPage.goto(post.slug)
      await blogPostPage.waitForContent()

      // Our mock data has cover image for first post
      expect(await blogPostPage.hasCoverImage()).toBe(true)
    })

    test('back button navigates to blog section', async ({ page, mockApi }) => {
      const blogPostPage = new BlogPostPage(page)
      const post = mockApi.mockData.blogPosts.docs[0]

      await blogPostPage.goto(post.slug)
      await blogPostPage.waitForContent()

      await blogPostPage.goBack()

      // Should be on homepage with #blog hash
      await expect(page).toHaveURL(/#blog/)
    })

    test('shows error state for non-existent post', async ({ page }) => {
      const blogPostPage = new BlogPostPage(page)

      await blogPostPage.goto('non-existent-post-slug-12345')
      await blogPostPage.waitForContent()

      expect(await blogPostPage.isErrorShown()).toBe(true)
    })

    test('error state shows meaningful message', async ({ page }) => {
      const blogPostPage = new BlogPostPage(page)

      await blogPostPage.goto('non-existent-post-slug-12345')
      await blogPostPage.waitForContent()

      const errorMessage = await blogPostPage.getErrorMessage()
      expect(errorMessage.toLowerCase()).toContain('not found')
    })

    test('error state has go back button', async ({ page }) => {
      const blogPostPage = new BlogPostPage(page)

      await blogPostPage.goto('non-existent-post-slug-12345')
      await blogPostPage.waitForContent()

      await blogPostPage.clickErrorGoBack()
      await expect(page).toHaveURL(/#blog/)
    })
  })

  test.describe('Blog Post Content', () => {
    test('renders rich text headings', async ({ page, mockApi }) => {
      const blogPostPage = new BlogPostPage(page)
      const post = mockApi.mockData.blogPosts.docs[0]

      await blogPostPage.goto(post.slug)
      await blogPostPage.waitForContent()

      // Post has an h2 heading "Why Vue 3?"
      const headings = await blogPostPage.getContentHeadings()
      expect(headings.length).toBeGreaterThan(0)
    })

    test('renders paragraphs correctly', async ({ page, mockApi }) => {
      const blogPostPage = new BlogPostPage(page)
      const post = mockApi.mockData.blogPosts.docs[0]

      await blogPostPage.goto(post.slug)
      await blogPostPage.waitForContent()

      // Check for paragraph content
      const content = await blogPostPage.getPostContentText()
      expect(content).toContain('rebuild my portfolio')
    })
  })
})
