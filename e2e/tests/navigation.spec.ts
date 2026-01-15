import { test, expect } from '../fixtures/test-fixtures.js'
import { HomePage } from '../pages/HomePage.js'

test.describe('Navigation', () => {
  test.beforeEach(async ({ mockApi }) => {
    await mockApi.setupMocks()
  })

  test('navbar is visible on page load', async ({ page }) => {
    const homePage = new HomePage(page)
    await homePage.goto()
    await homePage.waitForContent()

    await expect(homePage.navbar.navbar).toBeVisible()
  })

  test('navbar contains all section links', async ({ page }) => {
    const homePage = new HomePage(page)
    await homePage.goto()
    await homePage.waitForContent()

    const labels = await homePage.navbar.getNavLinkLabels()
    expect(labels).toContain('About')
    expect(labels).toContain('Projects')
    expect(labels).toContain('Blog')
    expect(labels).toContain('Photos')
    expect(labels).toContain('Contact')
  })

  test('clicking nav link scrolls to correct section', async ({ page }) => {
    const homePage = new HomePage(page)
    await homePage.goto()
    await homePage.waitForContent()

    // Click on Projects nav link
    await homePage.navbar.goToProjects()

    // Projects section should be visible
    await expect(homePage.projectsSection).toBeVisible()
  })

  test('clicking Contact nav link scrolls to contact section', async ({ page }) => {
    const homePage = new HomePage(page)
    await homePage.goto()
    await homePage.waitForContent()

    await homePage.navbar.goToContact()

    await expect(homePage.contactSection).toBeVisible()
  })

  test('clicking Blog nav link scrolls to blog section', async ({ page }) => {
    const homePage = new HomePage(page)
    await homePage.goto()
    await homePage.waitForContent()

    await homePage.navbar.goToBlog()

    await expect(homePage.blogSection).toBeVisible()
  })

  test('navbar remains visible after scrolling', async ({ page }) => {
    const homePage = new HomePage(page)
    await homePage.goto()
    await homePage.waitForContent()

    // Scroll down to contact section
    await homePage.scrollToSection('contact')

    // Navbar should still be visible (it's fixed)
    await expect(homePage.navbar.navbar).toBeVisible()
  })

  test('theme toggle is present in navbar', async ({ page }) => {
    const homePage = new HomePage(page)
    await homePage.goto()
    await homePage.waitForContent()

    await expect(homePage.navbar.themeToggle).toBeVisible()
  })
})
