/**
 * Media Regeneration Script
 *
 * Regenerates all existing media files with the new image sizes and WebP format.
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

import fs from 'fs'
import path from 'path'

interface MediaDoc {
  id: string
  filename: string
  mimeType: string
  url: string
}

async function regenerateMedia() {
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

  // Get all media documents
  console.log('Fetching media documents...')
  const { docs: allMedia, totalDocs } = await payload.find({
    collection: 'media',
    limit: 0, // Get count only first
  })

  console.log(`Found ${totalDocs} media documents to process`)
  console.log('')

  if (dryRun) {
    console.log('DRY RUN - No changes will be made')
    console.log('')
  }

  // Process in batches
  let processed = 0
  let failed = 0
  let page = 1

  while (processed < totalDocs) {
    const { docs } = await payload.find({
      collection: 'media',
      limit: batchSize,
      page,
    })

    for (const media of docs as MediaDoc[]) {
      processed++
      const progress = `[${processed}/${totalDocs}]`

      try {
        console.log(`${progress} Processing: ${media.filename}`)

        if (dryRun) {
          console.log(`  Would regenerate sizes for: ${media.filename}`)
          continue
        }

        // Get the original file path
        const mediaDir = process.env.MEDIA_DIR || path.join(process.cwd(), '..', 'media')
        const filePath = path.join(mediaDir, media.filename)

        if (!fs.existsSync(filePath)) {
          console.log(`  WARNING: Original file not found: ${filePath}`)
          failed++
          continue
        }

        // Read the file
        const fileBuffer = fs.readFileSync(filePath)

        // Update the media document - this will trigger Payload to regenerate sizes
        await payload.update({
          collection: 'media',
          id: media.id,
          data: {
            // Touch the document to trigger regeneration
            // The actual regeneration happens via Payload's upload handling
          },
          file: {
            data: fileBuffer,
            name: media.filename,
            mimetype: media.mimeType,
            size: fileBuffer.length,
          },
        })

        console.log(`  Regenerated successfully`)
      } catch (error) {
        console.error(`  ERROR: ${error instanceof Error ? error.message : 'Unknown error'}`)
        failed++
      }
    }

    page++
  }

  console.log('')
  console.log('=========================')
  console.log('Regeneration Complete')
  console.log(`Processed: ${processed}`)
  console.log(`Failed: ${failed}`)
  console.log(`Success: ${processed - failed}`)

  process.exit(failed > 0 ? 1 : 0)
}

regenerateMedia().catch((err) => {
  console.error('Fatal error:', err)
  process.exit(1)
})
