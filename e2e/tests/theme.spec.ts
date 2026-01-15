import { test, expect } from '../fixtures/test-fixtures.js'
import { HomePage } from '../pages/HomePage.js'

test.describe('Theme', () => {
  test.beforeEach(async ({ mockApi }) => {
    await mockApi.setupMocks()
  })

  test('page loads with a theme applied', async ({ page }) => {
    const homePage = new HomePage(page)
    await homePage.goto()
    await homePage.waitForContent()

    const theme = await homePage.getCurrentTheme()
    expect(['light', 'dark']).toContain(theme)
  })

  test('theme toggle button is visible', async ({ page }) => {
    const homePage = new HomePage(page)
    await homePage.goto()
    await homePage.waitForContent()

    await expect(homePage.navbar.themeToggle).toBeVisible()
  })

  test('clicking theme toggle changes theme', async ({ page }) => {
    const homePage = new HomePage(page)
    await homePage.goto()
    await homePage.waitForContent()

    const initialTheme = await homePage.getCurrentTheme()

    await homePage.navbar.toggleTheme()

    // Wait for theme transition
    await page.waitForTimeout(300)

    const newTheme = await homePage.getCurrentTheme()
    expect(newTheme).not.toBe(initialTheme)
  })

  test('theme can be toggled back and forth', async ({ page }) => {
    const homePage = new HomePage(page)
    await homePage.goto()
    await homePage.waitForContent()

    const initialTheme = await homePage.getCurrentTheme()

    // Toggle to opposite theme
    await homePage.navbar.toggleTheme()
    await page.waitForTimeout(300)

    const middleTheme = await homePage.getCurrentTheme()
    expect(middleTheme).not.toBe(initialTheme)

    // Toggle back
    await homePage.navbar.toggleTheme()
    await page.waitForTimeout(300)

    const finalTheme = await homePage.getCurrentTheme()
    expect(finalTheme).toBe(initialTheme)
  })

  test('theme persists across page reload', async ({ page }) => {
    const homePage = new HomePage(page)
    await homePage.goto()
    await homePage.waitForContent()

    // Toggle theme
    await homePage.navbar.toggleTheme()
    await page.waitForTimeout(300)

    const themeAfterToggle = await homePage.getCurrentTheme()

    // Reload page
    await page.reload()
    await homePage.waitForContent()

    const themeAfterReload = await homePage.getCurrentTheme()
    expect(themeAfterReload).toBe(themeAfterToggle)
  })

  test('dark theme applies dark class to html element', async ({ page }) => {
    const homePage = new HomePage(page)

    // Set dark theme before navigation
    await page.addInitScript(() => {
      localStorage.setItem('theme', 'dark')
    })

    await homePage.goto()
    await homePage.waitForContent()

    const hasDarkClass = await page.evaluate(() => {
      return document.documentElement.classList.contains('dark')
    })

    expect(hasDarkClass).toBe(true)
  })

  test('light theme does not have dark class', async ({ page }) => {
    const homePage = new HomePage(page)

    // Set light theme before navigation
    await page.addInitScript(() => {
      localStorage.setItem('theme', 'light')
    })

    await homePage.goto()
    await homePage.waitForContent()

    const hasDarkClass = await page.evaluate(() => {
      return document.documentElement.classList.contains('dark')
    })

    expect(hasDarkClass).toBe(false)
  })

  test('theme toggle has accessible aria-label', async ({ page }) => {
    const homePage = new HomePage(page)
    await homePage.goto()
    await homePage.waitForContent()

    const themeToggle = homePage.navbar.themeToggle
    await expect(themeToggle).toHaveAttribute('aria-label')

    const ariaLabel = await themeToggle.getAttribute('aria-label')
    expect(ariaLabel?.toLowerCase()).toContain('theme')
  })

  test('theme toggle shows current theme in title', async ({ page }) => {
    const homePage = new HomePage(page)
    await homePage.goto()
    await homePage.waitForContent()

    const title = await homePage.navbar.getThemeFromToggle()
    expect(title.toLowerCase()).toMatch(/theme:\s*(light|dark)/i)
  })

  test('theme change updates toggle title', async ({ page }) => {
    const homePage = new HomePage(page)
    await homePage.goto()
    await homePage.waitForContent()

    const initialTitle = await homePage.navbar.getThemeFromToggle()

    await homePage.navbar.toggleTheme()
    await page.waitForTimeout(300)

    const newTitle = await homePage.navbar.getThemeFromToggle()
    expect(newTitle).not.toBe(initialTitle)
  })
})
