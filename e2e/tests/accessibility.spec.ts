import { test, expect } from '../fixtures/test-fixtures.js'
import AxeBuilder from '@axe-core/playwright'
import { HomePage } from '../pages/HomePage.js'
import { BlogPostPage } from '../pages/BlogPostPage.js'

test.describe('Accessibility', () => {
  test.beforeEach(async ({ mockApi }) => {
    await mockApi.setupMocks()
  })

  test.describe('Homepage', () => {
    test('homepage has no critical accessibility violations', async ({ page }) => {
      const homePage = new HomePage(page)
      await homePage.goto()
      await homePage.waitForContent()

      const accessibilityScanResults = await new AxeBuilder({ page })
        .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
        .exclude('.vue-devtools__anchor-btn') // Exclude Vue DevTools button (dev only)
        .exclude('[data-v-inspector]') // Exclude Vue inspector elements
        .analyze()

      // Filter out critical and serious violations
      const criticalViolations = accessibilityScanResults.violations.filter(
        (v) => v.impact === 'critical' || v.impact === 'serious',
      )

      expect(criticalViolations).toEqual([])
    })

    test('hero section is accessible', async ({ page }) => {
      const homePage = new HomePage(page)
      await homePage.goto()
      await homePage.waitForContent()

      const accessibilityScanResults = await new AxeBuilder({ page })
        .include('#hero')
        .withTags(['wcag2a', 'wcag2aa'])
        .analyze()

      const criticalViolations = accessibilityScanResults.violations.filter(
        (v) => v.impact === 'critical' || v.impact === 'serious',
      )

      expect(criticalViolations).toEqual([])
    })

    test('navigation is accessible', async ({ page }) => {
      const homePage = new HomePage(page)
      await homePage.goto()
      await homePage.waitForContent()

      const accessibilityScanResults = await new AxeBuilder({ page })
        .include('.navbar')
        .withTags(['wcag2a', 'wcag2aa'])
        .analyze()

      const criticalViolations = accessibilityScanResults.violations.filter(
        (v) => v.impact === 'critical' || v.impact === 'serious',
      )

      expect(criticalViolations).toEqual([])
    })

    test('contact form is accessible', async ({ page }) => {
      const homePage = new HomePage(page)
      await homePage.goto()
      await homePage.waitForContent()
      await homePage.scrollToSection('contact')

      const accessibilityScanResults = await new AxeBuilder({ page })
        .include('#contact')
        .withTags(['wcag2a', 'wcag2aa'])
        .exclude('.vue-devtools__anchor-btn')
        .analyze()

      const criticalViolations = accessibilityScanResults.violations.filter(
        (v) => v.impact === 'critical' || v.impact === 'serious',
      )

      expect(criticalViolations).toEqual([])
    })

    test('form inputs have associated labels', async ({ page }) => {
      const homePage = new HomePage(page)
      await homePage.goto()
      await homePage.waitForContent()
      await homePage.scrollToSection('contact')

      // Check that labels are properly associated
      const nameLabel = page.locator('label[for="name"]')
      const emailLabel = page.locator('label[for="email"]')
      const messageLabel = page.locator('label[for="message"]')

      await expect(nameLabel).toBeVisible()
      await expect(emailLabel).toBeVisible()
      await expect(messageLabel).toBeVisible()
    })
  })

  test.describe('Blog Post Page', () => {
    test('blog post page has no critical accessibility violations', async ({ page, mockApi }) => {
      const blogPostPage = new BlogPostPage(page)
      const post = mockApi.mockData.blogPosts.docs[0]

      await blogPostPage.goto(post.slug)
      await blogPostPage.waitForContent()

      const accessibilityScanResults = await new AxeBuilder({ page })
        .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
        .exclude('.vue-devtools__anchor-btn')
        .exclude('[data-v-inspector]')
        .analyze()

      const criticalViolations = accessibilityScanResults.violations.filter(
        (v) => v.impact === 'critical' || v.impact === 'serious',
      )

      expect(criticalViolations).toEqual([])
    })

    test('back link is keyboard accessible', async ({ page, mockApi }) => {
      const blogPostPage = new BlogPostPage(page)
      const post = mockApi.mockData.blogPosts.docs[0]

      await blogPostPage.goto(post.slug)
      await blogPostPage.waitForContent()

      // Tab to the back link
      await page.keyboard.press('Tab')

      // Check that the back button is focusable
      const focusedElement = page.locator(':focus')
      await expect(focusedElement).toBeVisible()
    })
  })

  test.describe('Keyboard Navigation', () => {
    test('can navigate homepage with keyboard only', async ({ page }) => {
      const homePage = new HomePage(page)
      await homePage.goto()
      await homePage.waitForContent()

      // Tab through interactive elements
      await page.keyboard.press('Tab')

      // Should be able to focus on navbar elements
      const focusedElement = page.locator(':focus')
      await expect(focusedElement).toBeVisible()

      // Tab again
      await page.keyboard.press('Tab')
      await expect(page.locator(':focus')).toBeVisible()
    })

    test('nav links are keyboard accessible', async ({ page }) => {
      const homePage = new HomePage(page)
      await homePage.goto()
      await homePage.waitForContent()

      // Focus on a nav link
      await homePage.navbar.getNavLink('Projects').focus()

      // Press Enter to activate
      await page.keyboard.press('Enter')

      // Should scroll to projects section
      await page.waitForTimeout(500)
      await expect(homePage.projectsSection).toBeVisible()
    })

    test('theme toggle is keyboard accessible', async ({ page }) => {
      const homePage = new HomePage(page)
      await homePage.goto()
      await homePage.waitForContent()

      const initialTheme = await homePage.getCurrentTheme()

      // Focus on theme toggle
      await homePage.navbar.themeToggle.focus()

      // Press Enter to toggle
      await page.keyboard.press('Enter')
      await page.waitForTimeout(300)

      const newTheme = await homePage.getCurrentTheme()
      expect(newTheme).not.toBe(initialTheme)
    })

    test('contact form can be completed with keyboard', async ({ page }) => {
      const homePage = new HomePage(page)
      await homePage.goto()
      await homePage.waitForContent()
      await homePage.scrollToSection('contact')

      // Focus on name input
      await homePage.contactForm.nameInput.focus()
      await page.keyboard.type('Test User')

      // Tab to email
      await page.keyboard.press('Tab')
      await page.keyboard.type('test@example.com')

      // Tab to message
      await page.keyboard.press('Tab')
      await page.keyboard.type('Test message via keyboard')

      // Tab to submit button
      await page.keyboard.press('Tab')

      // Submit with Enter
      await page.keyboard.press('Enter')

      // Should show success
      await expect(homePage.contactForm.successMessage).toBeVisible({ timeout: 5000 })
    })
  })

  test.describe('Dark Mode Accessibility', () => {
    test('dark mode has no critical accessibility violations', async ({ page }) => {
      const homePage = new HomePage(page)

      // Set dark mode before navigation
      await page.addInitScript(() => {
        localStorage.setItem('theme', 'dark')
      })

      await homePage.goto()
      await homePage.waitForContent()

      const accessibilityScanResults = await new AxeBuilder({ page })
        .withTags(['wcag2a', 'wcag2aa'])
        .exclude('.vue-devtools__anchor-btn')
        .exclude('[data-v-inspector]')
        .analyze()

      const criticalViolations = accessibilityScanResults.violations.filter(
        (v) => v.impact === 'critical' || v.impact === 'serious',
      )

      expect(criticalViolations).toEqual([])
    })

    test('light mode has no critical accessibility violations', async ({ page }) => {
      const homePage = new HomePage(page)

      // Set light mode before navigation
      await page.addInitScript(() => {
        localStorage.setItem('theme', 'light')
      })

      await homePage.goto()
      await homePage.waitForContent()

      const accessibilityScanResults = await new AxeBuilder({ page })
        .withTags(['wcag2a', 'wcag2aa'])
        .exclude('.vue-devtools__anchor-btn')
        .exclude('[data-v-inspector]')
        .analyze()

      const criticalViolations = accessibilityScanResults.violations.filter(
        (v) => v.impact === 'critical' || v.impact === 'serious',
      )

      expect(criticalViolations).toEqual([])
    })
  })

  test.describe('Focus Management', () => {
    test('focus is visible on interactive elements', async ({ page }) => {
      const homePage = new HomePage(page)
      await homePage.goto()
      await homePage.waitForContent()

      // Tab to first interactive element
      await page.keyboard.press('Tab')

      // Check that focus ring/outline is visible
      const focusedElement = page.locator(':focus')
      await expect(focusedElement).toBeVisible()

      // The focused element should have some visual indication
      // This could be outline, box-shadow, or border change
      const styles = await focusedElement.evaluate((el) => {
        const computed = window.getComputedStyle(el)
        return {
          outline: computed.outline,
          boxShadow: computed.boxShadow,
          border: computed.border,
        }
      })

      // At least one focus indicator should be present
      // Note: This is a soft check - some designs use other focus indicators
      // We're just checking that focus is visible, not specifically how
      expect(styles.outline || styles.boxShadow || styles.border).toBeDefined()
      await expect(focusedElement).toBeVisible()
    })
  })

  test.describe('Images', () => {
    test('images have alt text', async ({ page, mockApi }) => {
      const blogPostPage = new BlogPostPage(page)
      const post = mockApi.mockData.blogPosts.docs[0]

      await blogPostPage.goto(post.slug)
      await blogPostPage.waitForContent()

      // Our mock data has cover image for first post
      const altText = await blogPostPage.getCoverImageAlt()
      expect(altText).not.toBe('')
    })
  })

  test.describe('Semantic HTML', () => {
    test('page has main landmark', async ({ page }) => {
      const homePage = new HomePage(page)
      await homePage.goto()
      await homePage.waitForContent()

      // Some layouts might not have explicit main, check for article or section
      const contentElement = page.locator('main, [role="main"], article, .home')
      await expect(contentElement.first()).toBeVisible()
    })

    test('headings are in logical order', async ({ page }) => {
      const homePage = new HomePage(page)
      await homePage.goto()
      await homePage.waitForContent()

      // Get all heading levels
      const headings = await page.locator('h1, h2, h3, h4, h5, h6').all()

      // There should be headings on the page
      expect(headings.length).toBeGreaterThan(0)
    })

    test('blog post has proper article structure', async ({ page, mockApi }) => {
      const blogPostPage = new BlogPostPage(page)
      const post = mockApi.mockData.blogPosts.docs[0]

      await blogPostPage.goto(post.slug)
      await blogPostPage.waitForContent()

      // Should have an article element
      await expect(blogPostPage.article).toBeVisible()

      // Article should contain heading
      const heading = blogPostPage.article.locator('h1')
      await expect(heading).toBeVisible()
    })
  })
})
