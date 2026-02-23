export const DEFAULT_NAVBAR_OFFSET = 100

export const getScrollRoot = () => {
  if (typeof document === 'undefined') return null
  return document.getElementById('scroll-root')
}

export const scrollToElement = (
  element: Element,
  options: { offset?: number; behavior?: ScrollBehavior } = {},
) => {
  const scrollRoot = getScrollRoot()
  if (!scrollRoot) return false

  const elementTop = (element as HTMLElement).offsetTop
  const offset = options.offset ?? DEFAULT_NAVBAR_OFFSET
  const behavior = options.behavior ?? 'smooth'

  scrollRoot.scrollTo({ top: elementTop - offset, behavior })
  return true
}

export const scrollToHash = (
  hash: string,
  options: { offset?: number; behavior?: ScrollBehavior } = {},
) => {
  if (!hash || typeof document === 'undefined') return false
  const element = document.querySelector(hash)
  if (!element) return false

  return scrollToElement(element, options)
}

export const scrollToSection = (
  id: string,
  options: { offset?: number; behavior?: ScrollBehavior } = {},
) => {
  return scrollToHash(`#${id}`, options)
}

export const scrollToTop = (behavior: ScrollBehavior = 'auto') => {
  const scrollRoot = getScrollRoot()
  if (!scrollRoot) return
  scrollRoot.scrollTo({ top: 0, behavior })
}
