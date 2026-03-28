import { defineComponent, nextTick, ref } from 'vue'
import { mount } from '@vue/test-utils'
import { afterEach, describe, expect, it } from 'vitest'
import BaseLightbox from '../ui/BaseLightbox.vue'

const LightboxHarness = defineComponent({
  components: { BaseLightbox },
  setup() {
    const open = ref(false)

    return {
      open,
      handleClose: () => {
        open.value = false
      },
    }
  },
  template: `
    <div>
      <button id="trigger">Open lightbox</button>
      <BaseLightbox :open="open" label="Project details" @close="handleClose">
        <button class="secondary-action">Secondary action</button>
      </BaseLightbox>
    </div>
  `,
})

describe('BaseLightbox', () => {
  afterEach(() => {
    document.body.innerHTML = ''
  })

  it('renders accessible dialog semantics when open', async () => {
    const wrapper = mount(LightboxHarness, {
      attachTo: document.body,
    })

    const trigger = wrapper.get('#trigger')
    ;(trigger.element as HTMLButtonElement).focus()

    wrapper.vm.open = true
    await nextTick()
    await nextTick()

    const dialog = document.body.querySelector('.lightbox-overlay')

    expect(dialog?.getAttribute('role')).toBe('dialog')
    expect(dialog?.getAttribute('aria-modal')).toBe('true')
    expect(dialog?.getAttribute('aria-label')).toBe('Project details')
    expect(document.activeElement?.getAttribute('aria-label')).toBe('Close')
  })

  it('restores focus to the trigger after closing', async () => {
    const wrapper = mount(LightboxHarness, {
      attachTo: document.body,
    })

    const trigger = wrapper.get('#trigger')
    ;(trigger.element as HTMLButtonElement).focus()

    wrapper.vm.open = true
    await nextTick()
    wrapper.vm.open = false
    await nextTick()

    expect(document.activeElement).toBe(trigger.element)
  })
})
