/**
 * Media Regeneration Script
 *
 * Queues and optionally runs regeneration of all existing media files with the current
 * responsive WebP / AVIF sizes.
 * This script should be run after updating the Media collection config.
 *
 * Usage:
 *   cd cms
 *   npx tsx src/scripts/regenerate-media.ts
 *
 * Options:
 *   --dry-run    Show what would be regenerated without making changes
 *   --batch=N    Process N items at a time (default: 5)
 */

import { regenerateMedia } from '../lib/regenerateMedia'

async function runRegenerateMedia() {
  const args = process.argv.slice(2)
  const dryRun = args.includes('--dry-run')
  const batchArg = args.find((a) => a.startsWith('--batch='))
  const batchSize = batchArg ? parseInt(batchArg.split('=')[1], 10) : 5

  console.log('Media Regeneration Script')
  console.log('=========================')
  console.log(`Mode: ${dryRun ? 'DRY RUN' : 'LIVE'}`)
  console.log(`Batch size: ${batchSize}`)
  console.log('')

  // Import Payload
  const { getPayload } = await import('payload')
  const config = await import('../payload.config').then((m) => m.default)

  const payload = await getPayload({ config })

  if (dryRun) {
    console.log('DRY RUN - No changes will be made')
    console.log('')
  }

  const result = await regenerateMedia({
    batchSize,
    dryRun,
    logger: console.log,
    payload,
    runJobs: !dryRun,
  })

  console.log('')
  console.log('=========================')
  console.log('Regeneration Complete')
  console.log(`Processed: ${result.processed}`)
  console.log(`Failed: ${result.failed}`)
  console.log(`Success: ${result.success}`)

  process.exit(result.failed > 0 ? 1 : 0)
}

runRegenerateMedia().catch((err) => {
  console.error('Fatal error:', err)
  process.exit(1)
})
