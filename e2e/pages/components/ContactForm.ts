import type { Page, Locator } from '@playwright/test'

export interface ContactFormData {
  name: string
  email: string
  message: string
}

/**
 * Contact Form component Page Object
 */
export class ContactForm {
  readonly page: Page
  readonly form: Locator
  readonly nameInput: Locator
  readonly emailInput: Locator
  readonly messageInput: Locator
  readonly submitButton: Locator
  readonly successMessage: Locator
  readonly errorMessage: Locator

  constructor(page: Page) {
    this.page = page
    this.form = page.locator('.contact-form')
    this.nameInput = page.getByLabel('Name')
    this.emailInput = page.getByLabel('Email')
    this.messageInput = page.getByLabel('Message')
    this.submitButton = page.getByRole('button', { name: /send message/i })
    this.successMessage = page.locator('.contact-success')
    this.errorMessage = page.locator('.form-error')
  }

  /**
   * Fill the contact form with data
   */
  async fill(data: ContactFormData): Promise<void> {
    await this.nameInput.fill(data.name)
    await this.emailInput.fill(data.email)
    await this.messageInput.fill(data.message)
  }

  /**
   * Submit the form
   */
  async submit(): Promise<void> {
    await this.submitButton.click()
  }

  /**
   * Fill and submit the form
   */
  async fillAndSubmit(data: ContactFormData): Promise<void> {
    await this.fill(data)
    await this.submit()
  }

  /**
   * Check if form is visible
   */
  async isFormVisible(): Promise<boolean> {
    return this.form.isVisible()
  }

  /**
   * Check if success message is visible
   */
  async isSuccessVisible(): Promise<boolean> {
    return this.successMessage.isVisible()
  }

  /**
   * Check if error message is visible
   */
  async isErrorVisible(): Promise<boolean> {
    return this.errorMessage.isVisible()
  }

  /**
   * Get error message text
   */
  async getErrorText(): Promise<string> {
    const text = await this.errorMessage.textContent()
    return text ?? ''
  }

  /**
   * Get success message text
   */
  async getSuccessText(): Promise<string> {
    const text = await this.successMessage.textContent()
    return text ?? ''
  }

  /**
   * Check if submit button is disabled
   */
  async isSubmitDisabled(): Promise<boolean> {
    return this.submitButton.isDisabled()
  }

  /**
   * Get submit button text
   */
  async getSubmitButtonText(): Promise<string> {
    const text = await this.submitButton.textContent()
    return text ?? ''
  }

  /**
   * Check if a specific field has validation error (HTML5 validation)
   */
  async hasValidationError(field: 'name' | 'email' | 'message'): Promise<boolean> {
    const input =
      field === 'name' ? this.nameInput : field === 'email' ? this.emailInput : this.messageInput

    return input.evaluate((el: HTMLInputElement | HTMLTextAreaElement) => !el.checkValidity())
  }

  /**
   * Clear all form fields
   */
  async clear(): Promise<void> {
    await this.nameInput.clear()
    await this.emailInput.clear()
    await this.messageInput.clear()
  }
}
