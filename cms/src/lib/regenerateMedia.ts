import { MEDIA_PROCESSING_QUEUE, MEDIA_PROCESSING_TASK } from './processMedia'

interface MediaDoc {
  id: string
  filename: string
}

export interface RegenerateMediaOptions {
  batchSize?: number
  dryRun?: boolean
  logger?: (message: string) => void
  runJobs?: boolean
  payload: {
    find: (args: any) => Promise<{ docs: unknown[]; totalDocs: number }>
    jobs: {
      queue: (args: any) => Promise<unknown>
      run?: (args: any) => Promise<unknown>
    }
    update: (args: any) => Promise<unknown>
  }
}

export interface RegenerateMediaResult {
  failed: number
  processed: number
  success: number
  totalDocs: number
}

export async function regenerateMedia({
  batchSize = 5,
  dryRun = false,
  logger,
  payload,
  runJobs = false,
}: RegenerateMediaOptions): Promise<RegenerateMediaResult> {
  logger?.('Fetching media documents...')

  const { totalDocs } = await payload.find({
    collection: 'media',
    limit: 1,
  })

  logger?.(`Found ${totalDocs} media documents to process`)

  let processed = 0
  let failed = 0
  let page = 1

  while (processed < totalDocs) {
    const { docs } = await payload.find({
      collection: 'media',
      limit: batchSize,
      page,
    })

    if (docs.length === 0) {
      break
    }

    for (const media of docs as MediaDoc[]) {
      processed++
      const progress = `[${processed}/${totalDocs}]`

      try {
        logger?.(`${progress} Processing: ${media.filename}`)

        if (dryRun) {
          logger?.(`  Would regenerate sizes for: ${media.filename}`)
          continue
        }

        await payload.update({
          collection: 'media',
          id: media.id,
          data: {
            processingError: null,
            processingStatus: 'queued',
          },
        })

        await payload.jobs.queue({
          input: {
            mediaId: media.id,
          },
          queue: MEDIA_PROCESSING_QUEUE,
          task: MEDIA_PROCESSING_TASK,
        })

        logger?.('  Queued for regeneration')
      } catch (error) {
        logger?.(`  ERROR: ${error instanceof Error ? error.message : 'Unknown error'}`)
        failed++
      }
    }

    page++
  }

  if (!dryRun && runJobs && payload.jobs.run) {
    logger?.('Running queued jobs...')
    await payload.jobs.run({
      limit: totalDocs,
      overrideAccess: true,
      queue: MEDIA_PROCESSING_QUEUE,
      sequential: true,
      silent: true,
    })
  }

  return {
    failed,
    processed,
    success: processed - failed,
    totalDocs,
  }
}
