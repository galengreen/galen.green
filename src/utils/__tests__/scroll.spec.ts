import { beforeEach, describe, expect, it, vi } from 'vitest'
import { scrollToHash } from '../scroll'

describe('scrollToHash', () => {
  beforeEach(() => {
    document.body.innerHTML = '<div id="scroll-root"></div><section id="blog"></section>'
  })

  it('scrolls to a plain section hash', () => {
    const scrollRoot = document.getElementById('scroll-root') as HTMLDivElement
    const blogSection = document.getElementById('blog') as HTMLElement
    const scrollTo = vi.fn()

    scrollRoot.scrollTo = scrollTo
    Object.defineProperty(blogSection, 'offsetTop', {
      value: 420,
      configurable: true,
    })

    expect(scrollToHash('#blog')).toBe(true)
    expect(scrollTo).toHaveBeenCalledWith({ top: 320, behavior: 'smooth' })
  })

  it('does not throw when the hash includes a deep-link slug', () => {
    const scrollRoot = document.getElementById('scroll-root') as HTMLDivElement
    const blogSection = document.getElementById('blog') as HTMLElement
    const scrollTo = vi.fn()

    scrollRoot.scrollTo = scrollTo
    Object.defineProperty(blogSection, 'offsetTop', {
      value: 500,
      configurable: true,
    })

    expect(() => scrollToHash('#blog/test-post')).not.toThrow()
    expect(scrollToHash('#blog/test-post')).toBe(true)
    expect(scrollTo).toHaveBeenCalledWith({ top: 400, behavior: 'smooth' })
  })
})
