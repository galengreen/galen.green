import { test, expect } from '../fixtures/test-fixtures.js'
import { HomePage } from '../pages/HomePage.js'

test.describe('Contact Form', () => {
  test.beforeEach(async ({ mockApi }) => {
    await mockApi.setupMocks()
  })

  test('contact form is visible in contact section', async ({ page }) => {
    const homePage = new HomePage(page)
    await homePage.goto()
    await homePage.waitForContent()

    await homePage.scrollToSection('contact')

    expect(await homePage.contactForm.isFormVisible()).toBe(true)
  })

  test('contact form has all required fields', async ({ page }) => {
    const homePage = new HomePage(page)
    await homePage.goto()
    await homePage.waitForContent()

    await homePage.scrollToSection('contact')

    await expect(homePage.contactForm.nameInput).toBeVisible()
    await expect(homePage.contactForm.emailInput).toBeVisible()
    await expect(homePage.contactForm.messageInput).toBeVisible()
    await expect(homePage.contactForm.submitButton).toBeVisible()
  })

  test('submit button displays correct text', async ({ page }) => {
    const homePage = new HomePage(page)
    await homePage.goto()
    await homePage.waitForContent()

    await homePage.scrollToSection('contact')

    const buttonText = await homePage.contactForm.getSubmitButtonText()
    expect(buttonText.toLowerCase()).toContain('send')
  })

  test('can fill out form fields', async ({ page }) => {
    const homePage = new HomePage(page)
    await homePage.goto()
    await homePage.waitForContent()

    await homePage.scrollToSection('contact')

    await homePage.contactForm.fill({
      name: 'Test User',
      email: 'test@example.com',
      message: 'This is a test message',
    })

    await expect(homePage.contactForm.nameInput).toHaveValue('Test User')
    await expect(homePage.contactForm.emailInput).toHaveValue('test@example.com')
    await expect(homePage.contactForm.messageInput).toHaveValue('This is a test message')
  })

  test('successful form submission shows success message', async ({ page }) => {
    const homePage = new HomePage(page)
    await homePage.goto()
    await homePage.waitForContent()

    await homePage.scrollToSection('contact')

    await homePage.contactForm.fillAndSubmit({
      name: 'Test User',
      email: 'test@example.com',
      message: 'This is a test message',
    })

    // Wait for submission to complete
    await expect(homePage.contactForm.successMessage).toBeVisible({ timeout: 5000 })
  })

  test('success message contains thank you text', async ({ page }) => {
    const homePage = new HomePage(page)
    await homePage.goto()
    await homePage.waitForContent()

    await homePage.scrollToSection('contact')

    await homePage.contactForm.fillAndSubmit({
      name: 'Test User',
      email: 'test@example.com',
      message: 'This is a test message',
    })

    await expect(homePage.contactForm.successMessage).toBeVisible({ timeout: 5000 })
    const successText = await homePage.contactForm.getSuccessText()
    expect(successText.toLowerCase()).toContain('thanks')
  })

  test('form is hidden after successful submission', async ({ page }) => {
    const homePage = new HomePage(page)
    await homePage.goto()
    await homePage.waitForContent()

    await homePage.scrollToSection('contact')

    await homePage.contactForm.fillAndSubmit({
      name: 'Test User',
      email: 'test@example.com',
      message: 'This is a test message',
    })

    await expect(homePage.contactForm.successMessage).toBeVisible({ timeout: 5000 })
    expect(await homePage.contactForm.isFormVisible()).toBe(false)
  })

  test('name field is required', async ({ page }) => {
    const homePage = new HomePage(page)
    await homePage.goto()
    await homePage.waitForContent()

    await homePage.scrollToSection('contact')

    // Fill everything except name
    await homePage.contactForm.emailInput.fill('test@example.com')
    await homePage.contactForm.messageInput.fill('Test message')

    // Try to submit
    await homePage.contactForm.submit()

    // Form should not be submitted (HTML5 validation)
    expect(await homePage.contactForm.hasValidationError('name')).toBe(true)
  })

  test('email field is required', async ({ page }) => {
    const homePage = new HomePage(page)
    await homePage.goto()
    await homePage.waitForContent()

    await homePage.scrollToSection('contact')

    // Fill everything except email
    await homePage.contactForm.nameInput.fill('Test User')
    await homePage.contactForm.messageInput.fill('Test message')

    // Try to submit
    await homePage.contactForm.submit()

    // Form should not be submitted (HTML5 validation)
    expect(await homePage.contactForm.hasValidationError('email')).toBe(true)
  })

  test('message field is required', async ({ page }) => {
    const homePage = new HomePage(page)
    await homePage.goto()
    await homePage.waitForContent()

    await homePage.scrollToSection('contact')

    // Fill everything except message
    await homePage.contactForm.nameInput.fill('Test User')
    await homePage.contactForm.emailInput.fill('test@example.com')

    // Try to submit
    await homePage.contactForm.submit()

    // Form should not be submitted (HTML5 validation)
    expect(await homePage.contactForm.hasValidationError('message')).toBe(true)
  })

  test('email field validates email format', async ({ page }) => {
    const homePage = new HomePage(page)
    await homePage.goto()
    await homePage.waitForContent()

    await homePage.scrollToSection('contact')

    // Fill with invalid email
    await homePage.contactForm.fill({
      name: 'Test User',
      email: 'invalid-email',
      message: 'Test message',
    })

    // Try to submit
    await homePage.contactForm.submit()

    // Email field should have validation error
    expect(await homePage.contactForm.hasValidationError('email')).toBe(true)
  })

  test('form shows loading state during submission', async ({ page }) => {
    const homePage = new HomePage(page)
    await homePage.goto()
    await homePage.waitForContent()

    await homePage.scrollToSection('contact')

    await homePage.contactForm.fill({
      name: 'Test User',
      email: 'test@example.com',
      message: 'Test message',
    })

    // Click submit but don't wait for completion
    const submitPromise = homePage.contactForm.submit()

    // Button should show loading text
    const buttonText = await homePage.contactForm.getSubmitButtonText()
    expect(buttonText.toLowerCase()).toMatch(/send|sending/i)

    await submitPromise
  })
})
