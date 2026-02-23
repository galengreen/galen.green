import { describe, it, expect, beforeEach, vi } from 'vitest'
import { mount, flushPromises } from '@vue/test-utils'
import ContactSection from '../sections/ContactSection.vue'

const { submitMock } = vi.hoisted(() => ({
  submitMock: vi.fn(),
}))

vi.mock('@/services/payload', () => ({
  api: {
    contact: {
      submit: submitMock,
    },
  },
}))

describe('ContactSection', () => {
  beforeEach(() => {
    submitMock.mockReset()
  })

  it('renders contact form fields', () => {
    const wrapper = mount(ContactSection, {
      props: {
        title: 'Contact',
        visible: true,
      },
    })

    expect(wrapper.find('label[for="name"]').exists()).toBe(true)
    expect(wrapper.find('label[for="email"]').exists()).toBe(true)
    expect(wrapper.find('label[for="message"]').exists()).toBe(true)
    expect(wrapper.find('button[type="submit"]').text()).toContain('Send Message')
  })

  it('submits successfully and shows success state', async () => {
    submitMock.mockResolvedValueOnce(undefined)

    const wrapper = mount(ContactSection, {
      props: {
        title: 'Contact',
        visible: true,
      },
    })

    await wrapper.find('#name').setValue('Test User')
    await wrapper.find('#email').setValue('test@example.com')
    await wrapper.find('#message').setValue('Hello there')

    await wrapper.find('form').trigger('submit.prevent')
    await flushPromises()

    expect(submitMock).toHaveBeenCalledWith({
      name: 'Test User',
      email: 'test@example.com',
      message: 'Hello there',
    })
    expect(wrapper.text()).toContain("Thanks for your message! I'll get back to you soon.")
    expect(wrapper.find('form').exists()).toBe(false)
  })

  it('shows error message when submit fails', async () => {
    submitMock.mockRejectedValueOnce(new Error('network failure'))

    const wrapper = mount(ContactSection, {
      props: {
        title: 'Contact',
        visible: true,
      },
    })

    await wrapper.find('#name').setValue('Test User')
    await wrapper.find('#email').setValue('test@example.com')
    await wrapper.find('#message').setValue('Hello there')

    await wrapper.find('form').trigger('submit.prevent')
    await flushPromises()

    expect(wrapper.find('.form-error').text()).toContain(
      'Failed to send message. Please try again.',
    )
    expect(wrapper.find('form').exists()).toBe(true)
  })

  it('disables fields and shows loading label while submitting', async () => {
    let resolveSubmit!: () => void
    const pendingSubmit = new Promise<void>((resolve) => {
      resolveSubmit = resolve
    })
    submitMock.mockReturnValueOnce(pendingSubmit)

    const wrapper = mount(ContactSection, {
      props: {
        title: 'Contact',
        visible: true,
      },
    })

    await wrapper.find('#name').setValue('Test User')
    await wrapper.find('#email').setValue('test@example.com')
    await wrapper.find('#message').setValue('Hello there')

    await wrapper.find('form').trigger('submit.prevent')
    await flushPromises()

    expect(wrapper.find('button[type="submit"]').attributes('disabled')).toBeDefined()
    expect(wrapper.find('button[type="submit"]').text()).toContain('Sending...')
    expect(wrapper.find('#name').attributes('disabled')).toBeDefined()
    expect(wrapper.find('#email').attributes('disabled')).toBeDefined()
    expect(wrapper.find('#message').attributes('disabled')).toBeDefined()

    resolveSubmit()
    await flushPromises()
  })
})
