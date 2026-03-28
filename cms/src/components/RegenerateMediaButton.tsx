'use client'

import React, { useCallback, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button, Drawer, toast, useModal } from '@payloadcms/ui'

const DRAWER_SLUG = 'regenerate-media'

export const RegenerateMediaButton: React.FC = () => {
  const router = useRouter()
  const { closeModal, isModalOpen, openModal } = useModal()
  const [isRegenerating, setIsRegenerating] = useState(false)

  const isOpen = isModalOpen(DRAWER_SLUG)

  const handleOpen = useCallback(() => {
    openModal(DRAWER_SLUG)
  }, [openModal])

  const handleClose = useCallback(() => {
    if (isRegenerating) return
    closeModal(DRAWER_SLUG)
  }, [closeModal, isRegenerating])

  const handleRegenerate = useCallback(async () => {
    setIsRegenerating(true)

    try {
      const response = await fetch('/api/media/regenerate', {
        method: 'POST',
        credentials: 'include',
      })

      const data = (await response.json()) as {
        error?: string
        failed?: number
        processed?: number
        success?: number
      }

      if (!response.ok || data.error) {
        throw new Error(data.error || 'Failed to regenerate media')
      }

      toast.success(
        `Regenerated ${data.success ?? 0} of ${data.processed ?? 0} media items${
          data.failed ? ` (${data.failed} failed)` : ''
        }`,
      )
      closeModal(DRAWER_SLUG)
      router.refresh()
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to regenerate media')
    } finally {
      setIsRegenerating(false)
    }
  }, [closeModal, router])

  return (
    <>
      <Button buttonStyle="secondary" size="small" onClick={handleOpen}>
        Regenerate Media
      </Button>
      <Drawer slug={DRAWER_SLUG} title="Regenerate All Media">
        <div style={{ padding: '1rem' }}>
          <p style={{ marginTop: 0 }}>
            This will reprocess every media item using the current derivative settings. Existing
            generated image sizes will be replaced.
          </p>
          <p>
            This can take a while for large libraries, and older uploads will regenerate from the
            file currently stored on disk.
          </p>
          <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
            <Button buttonStyle="secondary" size="small" onClick={handleClose}>
              Cancel
            </Button>
            <Button size="small" onClick={handleRegenerate} disabled={isRegenerating}>
              {isRegenerating ? 'Regenerating...' : 'Regenerate All Media'}
            </Button>
          </div>
        </div>
      </Drawer>
    </>
  )
}
