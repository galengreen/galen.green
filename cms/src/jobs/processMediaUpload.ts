import type { TaskConfig } from 'payload'
import { processMedia, MEDIA_PROCESSING_TASK } from '../lib/processMedia'

interface MediaDocument {
  filename?: string | null
  id: string | number
  sizes?: Record<string, { filename?: string | null } | null> | null
}

export const processMediaUploadTask: TaskConfig<any> = {
  slug: MEDIA_PROCESSING_TASK,
  inputSchema: [
    {
      name: 'mediaId',
      type: 'text',
      required: true,
    },
  ],
  retries: 1,
  handler: async ({ input, req }) => {
    const typedInput = input as { mediaId: string }
    const media = (await req.payload.findByID({
      collection: 'media',
      id: typedInput.mediaId,
    })) as MediaDocument

    if (!media.filename) {
      await req.payload.update({
        collection: 'media',
        id: typedInput.mediaId,
        data: {
          processingError: 'Original file metadata is missing.',
          processingStatus: 'failed',
        } as any,
      })

      return {
        output: {
          status: 'failed',
        },
      }
    }

    await req.payload.update({
      collection: 'media',
      id: typedInput.mediaId,
      data: {
        processingError: null,
        processingStatus: 'processing',
      } as any,
    })

    try {
      const result = await processMedia({
        media: {
          filename: media.filename,
          id: String(media.id),
          sizes: media.sizes as Record<string, { filename?: string | null } | null> | null,
        },
        logger: (message) => req.payload.logger.info(message),
      })

      await req.payload.update({
        collection: 'media',
        id: typedInput.mediaId,
        data: {
          processedAt: new Date().toISOString(),
          processingError: null,
          processingStatus: 'ready',
          sizes: result.sizes,
        } as any,
      })

      return {
        output: {
          status: 'ready',
        },
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown processing error'

      await req.payload.update({
        collection: 'media',
        id: typedInput.mediaId,
        data: {
          processingError: message,
          processingStatus: 'failed',
        } as any,
      })

      throw error
    }
  },
}
