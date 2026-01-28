import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import RichText from '../ui/RichText.vue'

describe('RichText', () => {
  it('renders paragraph content', () => {
    const content = {
      root: {
        children: [
          {
            type: 'paragraph',
            children: [{ type: 'text', text: 'Hello World' }],
          },
        ],
      },
    }
    const wrapper = mount(RichText, { props: { content } })
    expect(wrapper.html()).toContain('<p>Hello World</p>')
  })

  it('renders bold text', () => {
    const content = {
      root: {
        children: [
          {
            type: 'paragraph',
            children: [{ type: 'text', text: 'Bold text', format: 1 }],
          },
        ],
      },
    }
    const wrapper = mount(RichText, { props: { content } })
    expect(wrapper.html()).toContain('<strong>Bold text</strong>')
  })

  it('renders italic text', () => {
    const content = {
      root: {
        children: [
          {
            type: 'paragraph',
            children: [{ type: 'text', text: 'Italic text', format: 2 }],
          },
        ],
      },
    }
    const wrapper = mount(RichText, { props: { content } })
    expect(wrapper.html()).toContain('<em>Italic text</em>')
  })

  it('renders headings', () => {
    const content = {
      root: {
        children: [
          {
            type: 'heading',
            tag: 'h2',
            children: [{ type: 'text', text: 'Heading' }],
          },
        ],
      },
    }
    const wrapper = mount(RichText, { props: { content } })
    expect(wrapper.html()).toContain('<h2>Heading</h2>')
  })

  it('renders links', () => {
    const content = {
      root: {
        children: [
          {
            type: 'paragraph',
            children: [
              {
                type: 'link',
                url: 'https://example.com',
                children: [{ type: 'text', text: 'Link' }],
              },
            ],
          },
        ],
      },
    }
    const wrapper = mount(RichText, { props: { content } })
    expect(wrapper.html()).toContain('href="https://example.com"')
    expect(wrapper.html()).toContain('>Link</a>')
  })

  it('renders unordered lists', () => {
    const content = {
      root: {
        children: [
          {
            type: 'list',
            listType: 'bullet',
            children: [
              { type: 'listitem', children: [{ type: 'text', text: 'Item 1' }] },
              { type: 'listitem', children: [{ type: 'text', text: 'Item 2' }] },
            ],
          },
        ],
      },
    }
    const wrapper = mount(RichText, { props: { content } })
    expect(wrapper.html()).toContain('<ul>')
    expect(wrapper.html()).toContain('<li>Item 1</li>')
    expect(wrapper.html()).toContain('<li>Item 2</li>')
  })

  it('handles empty content gracefully', () => {
    const wrapper = mount(RichText, { props: { content: {} } })
    expect(wrapper.find('.rich-text').exists()).toBe(true)
    expect(wrapper.find('.rich-text').text()).toBe('')
  })

  it('escapes HTML in text nodes', () => {
    const content = {
      root: {
        children: [
          {
            type: 'paragraph',
            children: [{ type: 'text', text: '<script>alert("xss")</script>' }],
          },
        ],
      },
    }
    const wrapper = mount(RichText, { props: { content } })
    expect(wrapper.html()).not.toContain('<script>')
    expect(wrapper.html()).toContain('&lt;script&gt;')
  })

  it('sanitises javascript: URLs in links', () => {
    const content = {
      root: {
        children: [
          {
            type: 'paragraph',
            children: [
              {
                type: 'link',
                url: 'javascript:alert("xss")',
                children: [{ type: 'text', text: 'Click me' }],
              },
            ],
          },
        ],
      },
    }
    const wrapper = mount(RichText, { props: { content } })
    expect(wrapper.html()).toContain('href="#"')
    expect(wrapper.html()).not.toContain('javascript:')
  })

  it('escapes HTML in image alt text', () => {
    const content = {
      root: {
        children: [
          {
            type: 'upload',
            value: {
              url: '/media/test.jpg',
              alt: '"><script>alert("xss")</script>',
            },
          },
        ],
      },
    }
    const wrapper = mount(RichText, { props: { content } })
    // Check that alt attribute is properly escaped (quotes become &quot;)
    const img = wrapper.find('img')
    expect(img.attributes('alt')).toBe('"><script>alert("xss")</script>')
    // Check that figcaption text content is escaped (no actual script execution)
    const figcaption = wrapper.find('figcaption')
    expect(figcaption.text()).toBe('"><script>alert("xss")</script>')
    // Verify no actual script element was created
    expect(wrapper.find('script').exists()).toBe(false)
  })
})
