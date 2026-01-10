import { Resend } from 'resend'

// Initialise Resend client (only if API key is configured)
const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null

interface ContactNotificationData {
  name: string
  email: string
  message: string
  notificationEmail?: string
}

/**
 * Send email notification for new contact form submissions
 */
export async function sendContactNotification(data: ContactNotificationData): Promise<boolean> {
  const notificationEmail = data.notificationEmail || process.env.NOTIFICATION_EMAIL

  if (!notificationEmail) {
    console.error(
      'No notification email configured - set email in Site Settings or NOTIFICATION_EMAIL env var',
    )
    return false
  }

  if (!resend) {
    console.warn('RESEND_API_KEY not configured - skipping email notification')
    console.log(`New contact submission from ${data.name} (${data.email})`)
    return false
  }

  try {
    const { error } = await resend.emails.send({
      from: 'Contact Form <noreply@galen.green>',
      to: notificationEmail,
      replyTo: data.email,
      subject: `New contact from ${data.name}`,
      html: `
        <h2>New Contact Form Submission</h2>
        <p><strong>Name:</strong> ${escapeHtml(data.name)}</p>
        <p><strong>Email:</strong> <a href="mailto:${escapeHtml(data.email)}">${escapeHtml(data.email)}</a></p>
        <hr />
        <p><strong>Message:</strong></p>
        <p style="white-space: pre-wrap;">${escapeHtml(data.message)}</p>
      `,
      text: `
New Contact Form Submission

Name: ${data.name}
Email: ${data.email}

Message:
${data.message}
      `.trim(),
    })

    if (error) {
      console.error('Failed to send contact notification email:', error)
      return false
    }

    console.log(`Contact notification sent to ${notificationEmail}`)
    return true
  } catch (error) {
    console.error('Error sending contact notification email:', error)
    return false
  }
}

/**
 * Escape HTML to prevent XSS in email content
 */
function escapeHtml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;')
}
