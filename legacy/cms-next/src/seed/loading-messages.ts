/**
 * Seed data for loading screen messages
 * Self-deprecating dev humour for the loading screen
 *
 * Run with: npx tsx src/seed/loading-messages.ts
 */

export const loadingMessages = [
  // Dev Incompetence
  { message: 'Untangling spaghetti code...' },
  { message: 'Mass googling error messages...' },
  { message: 'Asking ChatGPT why this works...' },
  { message: 'Blaming the previous developer (it was me)...' },
  { message: 'Consulting Stack Overflow...' },
  { message: 'Reading my own documentation (lol)...' },
  { message: "Wondering why I didn't comment this..." },
  { message: 'Fixing bugs I created yesterday...' },
  { message: 'Pretending I understand regex...' },
  { message: 'Questioning career choices...' },

  // Slow Internet/Loading
  { message: 'Waiting for the slow server I chose...' },
  { message: 'Downloading more RAM...' },
  { message: 'Buffering at 56k speeds...' },
  { message: 'Still faster than my NBN...' },
  { message: 'Your WiFi is judging you...' },
  { message: 'Packet loss is a feature...' },
  { message: 'Sending carrier pigeon...' },
  { message: 'Waiting for the cloud to rain data...' },
  { message: 'Dial-up noises intensify...' },
  { message: 'Loading... eventually...' },

  // Self-Deprecating
  { message: "Hoping you don't view source..." },
  { message: 'This looked better in my head...' },
  { message: 'Built with mass amounts of caffeine...' },
  { message: "I promise I'm a real developer..." },
  { message: 'Crafted with mass amounts of imposter syndrome...' },
  { message: "At least it's not Comic Sans..." },
  { message: 'Professional amateur at work...' },
  { message: 'Trust me, I have a degree...' },
  { message: 'Fuelled by coffee and anxiety...' },
  { message: 'I definitely tested this...' },

  // Tech Humour
  { message: 'Clearing cache for the millionth time...' },
  { message: 'It works on my machine...' },
  { message: 'Have you tried turning it off and on?' },
  { message: 'rm -rf problems...' },
  { message: 'git push --force-ing my way through...' },
  { message: 'npm install patience...' },
  { message: 'Compiling excuses...' },
  { message: 'Deploying hopes and dreams...' },
  { message: 'Refactoring my life choices...' },
  { message: "console.log('please work')..." },

  // NZ/Local Flavour
  { message: 'Brewing a flat white...' },
  { message: 'Waiting for the ferry...' },
  { message: 'Stuck behind a campervan...' },
  { message: 'Sweet as, just loading...' },
  { message: "She'll be right..." },

  // Random Absurdist
  { message: 'Convincing electrons to cooperate...' },
  { message: 'Negotiating with the server...' },
  { message: 'Bribing the CPU...' },
  { message: 'Summoning the render gods...' },
  { message: 'Almost there... probably...' },
]

// Type for site settings with loading messages
interface SiteSettingsWithMessages {
  loadingMessages?: Array<{ message: string }>
}

// Seed function to populate the database
async function seed() {
  const { getPayload } = await import('payload')
  const config = await import('../payload.config').then((m) => m.default)

  const payload = await getPayload({ config })

  console.log('Seeding loading messages...')

  // Get current site settings
  const siteSettings = (await payload.findGlobal({
    slug: 'site-settings',
  })) as SiteSettingsWithMessages

  // Only seed if loadingMessages is empty or doesn't exist
  if (!siteSettings.loadingMessages || siteSettings.loadingMessages.length === 0) {
    await payload.updateGlobal({
      slug: 'site-settings',
      data: {
        loadingMessages,
      } as Record<string, unknown>,
    })
    console.log(`Seeded ${loadingMessages.length} loading messages`)
  } else {
    console.log(`Skipping seed - ${siteSettings.loadingMessages.length} messages already exist`)
  }

  process.exit(0)
}

// Run if called directly
seed().catch((err) => {
  console.error('Error seeding:', err)
  process.exit(1)
})
