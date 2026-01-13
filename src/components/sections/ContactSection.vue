<script setup lang="ts">
import { ref } from 'vue'
import { api } from '@/services/payload'

defineProps<{
  title: string
  visible: boolean
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
  <section id="contact" class="section fade-in" :class="{ visible }">
    <div class="container container-narrow">
      <h2 class="section-title">{{ title }}</h2>

      <div v-if="contactSuccess" class="contact-success">
        <p>Thanks for your message! I'll get back to you soon.</p>
      </div>

      <form v-else class="contact-form" @submit.prevent="submitContact">
        <div class="form-group">
          <label for="name">Name</label>
          <input
            v-model="contactForm.name"
            type="text"
            id="name"
            name="name"
            required
            :disabled="contactSubmitting"
          />
        </div>
        <div class="form-group">
          <label for="email">Email</label>
          <input
            v-model="contactForm.email"
            type="email"
            id="email"
            name="email"
            required
            :disabled="contactSubmitting"
          />
        </div>
        <div class="form-group">
          <label for="message">Message</label>
          <textarea
            v-model="contactForm.message"
            id="message"
            name="message"
            rows="5"
            required
            :disabled="contactSubmitting"
          ></textarea>
        </div>

        <p v-if="contactError" class="form-error">{{ contactError }}</p>

        <button type="submit" class="btn btn-primary" :disabled="contactSubmitting">
          {{ contactSubmitting ? 'Sending...' : 'Send Message' }}
        </button>
      </form>
    </div>
  </section>
</template>

<style scoped>
.contact-form {
  display: flex;
  flex-direction: column;
  gap: var(--space-5);
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: var(--space-2);
}

.form-group label {
  font-size: var(--text-sm);
  font-weight: 500;
}

.form-group input,
.form-group textarea {
  padding: var(--space-3) var(--space-4);
  font-size: var(--text-base);
  color: var(--color-text);
  background-color: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--space-2);
  transition:
    border-color var(--duration-fast) var(--ease-out),
    box-shadow var(--duration-fast) var(--ease-out);
}

.form-group input:focus,
.form-group textarea:focus {
  border-color: var(--color-text);
  box-shadow: 0 0 0 3px rgba(0, 0, 0, 0.1);
}

.dark .form-group input:focus,
.dark .form-group textarea:focus {
  box-shadow: 0 0 0 3px rgba(255, 255, 255, 0.1);
}

.form-group input:disabled,
.form-group textarea:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.form-group textarea {
  resize: vertical;
  min-height: 120px;
}

.form-error {
  color: #ef4444;
  font-size: var(--text-sm);
}

.contact-success {
  padding: var(--space-6);
  background-color: var(--color-surface);
  border-radius: var(--space-2);
  text-align: center;
  box-shadow: var(--shadow-md);
}

@media (max-width: 480px) {
  .contact-form {
    gap: var(--space-4);
  }
}
</style>
