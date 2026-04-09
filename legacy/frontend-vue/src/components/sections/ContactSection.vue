<script setup lang="ts">
import { ref } from 'vue'
import SectionShell from '@/components/sections/SectionShell.vue'
import Card from '@/components/ui/CustomCard.vue'
import { api } from '@/services/payload'

defineProps<{
  title: string
}>()

const contactForm = ref({
  name: '',
  email: '',
  message: '',
})
const contactSubmitting = ref(false)
const contactSuccess = ref(false)
const contactError = ref<string | null>(null)

const submitContact = async () => {
  contactSubmitting.value = true
  contactError.value = null

  try {
    await api.contact.submit(contactForm.value)
    contactSuccess.value = true
    contactForm.value = { name: '', email: '', message: '' }
  } catch (e) {
    contactError.value = 'Failed to send message. Please try again.'
    console.error('Contact form error:', e)
  } finally {
    contactSubmitting.value = false
  }
}
</script>

<template>
  <SectionShell id="contact" :title="title" container="narrow">
    <Card
      v-if="contactSuccess"
      padding="lg"
      radius="sm"
      :opacity="80"
      :blur="12"
      class="text-center"
    >
      <p>Thanks for your message! I'll get back to you soon.</p>
    </Card>

    <form v-else class="flex flex-col gap-4 md:gap-5" @submit.prevent="submitContact">
      <div class="flex flex-col gap-2">
        <label for="name" class="text-sm font-medium text-text">Name</label>
        <input
          v-model="contactForm.name"
          type="text"
          id="name"
          name="name"
          required
          :disabled="contactSubmitting"
          class="rounded-2xl border border-border bg-surface px-4 py-3 text-base text-text transition outline-none placeholder:text-muted focus:border-text focus:ring-4 focus:ring-text/10 disabled:cursor-not-allowed disabled:opacity-60 dark:focus:ring-white/10"
        />
      </div>
      <div class="flex flex-col gap-2">
        <label for="email" class="text-sm font-medium text-text">Email</label>
        <input
          v-model="contactForm.email"
          type="email"
          id="email"
          name="email"
          required
          :disabled="contactSubmitting"
          class="rounded-2xl border border-border bg-surface px-4 py-3 text-base text-text transition outline-none placeholder:text-muted focus:border-text focus:ring-4 focus:ring-text/10 disabled:cursor-not-allowed disabled:opacity-60 dark:focus:ring-white/10"
        />
      </div>
      <div class="flex flex-col gap-2">
        <label for="message" class="text-sm font-medium text-text">Message</label>
        <textarea
          v-model="contactForm.message"
          id="message"
          name="message"
          rows="5"
          required
          :disabled="contactSubmitting"
          class="min-h-[120px] resize-y rounded-2xl border border-border bg-surface px-4 py-3 text-base text-text transition outline-none placeholder:text-muted focus:border-text focus:ring-4 focus:ring-text/10 disabled:cursor-not-allowed disabled:opacity-60 dark:focus:ring-white/10"
        ></textarea>
      </div>

      <p v-if="contactError" class="text-sm text-red-500">{{ contactError }}</p>

      <button
        type="submit"
        class="inline-flex self-center rounded-full bg-text px-5 py-3 text-sm font-medium text-bg transition hover:-translate-y-0.5 hover:shadow-card disabled:cursor-not-allowed disabled:opacity-60"
        :disabled="contactSubmitting"
      >
        {{ contactSubmitting ? 'Sending...' : 'Send Message' }}
      </button>
    </form>
  </SectionShell>
</template>
