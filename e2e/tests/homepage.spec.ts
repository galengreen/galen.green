import { test, expect } from '../fixtures/test-fixtures.js'
import { HomePage } from '../pages/HomePage.js'

test.describe('Homepage', () => {
  test.beforeEach(async ({ mockApi }) => {
    await mockApi.setupMocks()
  })

  test('page loads successfully', async ({ page }) => {
    const homePage = new HomePage(page)
    await homePage.goto()
    await homePage.waitForContent()

    // Hero section should be visible
    await expect(homePage.heroSection).toBeVisible()
  })

  test('hero section displays name from site settings', async ({ page, mockApi }) => {
    const homePage = new HomePage(page)
    await homePage.goto()
    await homePage.waitForContent()

    // Check that the name from mock data is displayed
    const expectedFirst = mockApi.mockData.siteSettings.name.first
    const expectedLast = mockApi.mockData.siteSettings.name.last

    await expect(homePage.heroSection).toContainText(expectedFirst)
    await expect(homePage.heroSection).toContainText(expectedLast)
  })

  test('about section loads and is visible', async ({ page }) => {
    const homePage = new HomePage(page)
    await homePage.goto()
    await homePage.waitForContent()

    await homePage.scrollToSection('about')
    await expect(homePage.aboutSection).toBeVisible()
  })

  test('about section displays correct title', async ({ page, mockApi }) => {
    const homePage = new HomePage(page)
    await homePage.goto()
    await homePage.waitForContent()

    await homePage.scrollToSection('about')

    const expectedTitle = mockApi.mockData.siteSettings.sectionTitles.about
    const title = await homePage.getAboutTitle()
    expect(title).toBe(expectedTitle)
  })

  test('projects section displays projects', async ({ page, mockApi }) => {
    const homePage = new HomePage(page)
    await homePage.goto()
    await homePage.waitForContent()

    await homePage.scrollToSection('projects')
    await expect(homePage.projectsSection).toBeVisible()

    // Should have featured projects from mock data
    const featuredProjects = mockApi.mockData.projects.docs.filter((p) => p.featured)
    const projectCount = await homePage.getProjectCount()
    expect(projectCount).toBeGreaterThanOrEqual(featuredProjects.length)
  })

  test('projects section displays correct title', async ({ page, mockApi }) => {
    const homePage = new HomePage(page)
    await homePage.goto()
    await homePage.waitForContent()

    await homePage.scrollToSection('projects')

    const expectedTitle = mockApi.mockData.siteSettings.sectionTitles.projects
    const title = await homePage.getProjectsTitle()
    expect(title).toBe(expectedTitle)
  })

  test('blog section displays blog posts', async ({ page, mockApi }) => {
    const homePage = new HomePage(page)
    await homePage.goto()
    await homePage.waitForContent()

    await homePage.scrollToSection('blog')
    await expect(homePage.blogSection).toBeVisible()

    // Should contain text from blog posts
    const firstPost = mockApi.mockData.blogPosts.docs[0]
    await expect(homePage.blogSection).toContainText(firstPost.title)
  })

  test('blog section displays correct title', async ({ page, mockApi }) => {
    const homePage = new HomePage(page)
    await homePage.goto()
    await homePage.waitForContent()

    await homePage.scrollToSection('blog')

    const expectedTitle = mockApi.mockData.siteSettings.sectionTitles.blog
    const title = await homePage.getBlogTitle()
    expect(title).toBe(expectedTitle)
  })

  test('photos section loads', async ({ page }) => {
    const homePage = new HomePage(page)
    await homePage.goto()
    await homePage.waitForContent()

    await homePage.scrollToSection('photos')
    await expect(homePage.photosSection).toBeVisible()
  })

  test('photos section displays correct title', async ({ page, mockApi }) => {
    const homePage = new HomePage(page)
    await homePage.goto()
    await homePage.waitForContent()

    await homePage.scrollToSection('photos')

    const expectedTitle = mockApi.mockData.siteSettings.sectionTitles.photos
    const title = await homePage.getPhotosTitle()
    expect(title).toBe(expectedTitle)
  })

  test('contact section loads', async ({ page }) => {
    const homePage = new HomePage(page)
    await homePage.goto()
    await homePage.waitForContent()

    await homePage.scrollToSection('contact')
    await expect(homePage.contactSection).toBeVisible()
  })

  test('contact section displays correct title', async ({ page, mockApi }) => {
    const homePage = new HomePage(page)
    await homePage.goto()
    await homePage.waitForContent()

    await homePage.scrollToSection('contact')

    const expectedTitle = mockApi.mockData.siteSettings.sectionTitles.contact
    const title = await homePage.getContactTitle()
    expect(title).toBe(expectedTitle)
  })

  test('footer section is visible at bottom', async ({ page }) => {
    const homePage = new HomePage(page)
    await homePage.goto()
    await homePage.waitForContent()

    await homePage.scrollToSection('contact')
    await expect(homePage.footerSection).toBeVisible()
  })

  test('footer contains social links', async ({ page }) => {
    const homePage = new HomePage(page)
    await homePage.goto()
    await homePage.waitForContent()

    await homePage.scrollToSection('contact')

    const socialCount = await homePage.getSocialLinkCount()
    expect(socialCount).toBeGreaterThan(0)
  })

  test('all main sections are present', async ({ page }) => {
    const homePage = new HomePage(page)
    await homePage.goto()
    await homePage.waitForContent()

    // Check all sections exist
    await expect(homePage.heroSection).toBeAttached()
    await expect(homePage.aboutSection).toBeAttached()
    await expect(homePage.projectsSection).toBeAttached()
    await expect(homePage.blogSection).toBeAttached()
    await expect(homePage.photosSection).toBeAttached()
    await expect(homePage.contactSection).toBeAttached()
  })
})
