'use client'

import React, { useState, useCallback, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Button, toast, Drawer, useModal } from '@payloadcms/ui'

interface MediaItem {
  id: string
  filename?: string
  url?: string
  thumbnailURL?: string | null
}

const DRAWER_SLUG = 'bulk-create-photos'

export const BulkCreatePhotos: React.FC = () => {
  const router = useRouter()
  const { openModal, closeModal, isModalOpen } = useModal()
  const [isCreating, setIsCreating] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [mediaItems, setMediaItems] = useState<MediaItem[]>([])
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())

  const isOpen = isModalOpen(DRAWER_SLUG)

  // Fetch media items when drawer opens
  useEffect(() => {
    if (isOpen) {
      setIsLoading(true)
      fetch('/api/media?limit=100&sort=-createdAt', {
        credentials: 'include',
      })
        .then((res) => res.json())
        .then((data) => {
          setMediaItems(data.docs || [])
        })
        .catch(() => {
          toast.error('Failed to load media')
        })
        .finally(() => {
          setIsLoading(false)
        })
    }
  }, [isOpen])

  const handleToggle = useCallback((id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev)
      if (next.has(id)) {
        next.delete(id)
      } else {
        next.add(id)
      }
      return next
    })
  }, [])

  const handleSelectAll = useCallback(() => {
    setSelectedIds(new Set(mediaItems.map((item) => item.id)))
  }, [mediaItems])

  const handleSelectNone = useCallback(() => {
    setSelectedIds(new Set())
  }, [])

  const handleCreate = useCallback(async () => {
    if (selectedIds.size === 0) {
      toast.error('No media selected')
      return
    }

    setIsCreating(true)

    try {
      const res = await fetch('/api/photos/bulk-create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ mediaIds: Array.from(selectedIds) }),
      })

      const data = await res.json()

      if (data.error) {
        toast.error(data.error)
      } else {
        toast.success(data.message)
        closeModal(DRAWER_SLUG)
        setSelectedIds(new Set())
        router.refresh()
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to create photos')
    } finally {
      setIsCreating(false)
    }
  }, [selectedIds, closeModal, router])

  const handleOpen = useCallback(() => {
    setSelectedIds(new Set())
    openModal(DRAWER_SLUG)
  }, [openModal])

  return (
    <>
      <Button buttonStyle="secondary" size="small" onClick={handleOpen}>
        Bulk Create from Media
      </Button>
      <Drawer slug={DRAWER_SLUG} title="Select Media for Bulk Photo Creation">
        <div style={{ padding: '1rem' }}>
          <div
            style={{
              display: 'flex',
              gap: '0.5rem',
              marginBottom: '1rem',
              alignItems: 'center',
            }}
          >
            <Button buttonStyle="secondary" size="small" onClick={handleSelectAll}>
              Select All
            </Button>
            <Button buttonStyle="secondary" size="small" onClick={handleSelectNone}>
              Select None
            </Button>
            <span style={{ marginLeft: 'auto' }}>{selectedIds.size} selected</span>
          </div>

          {isLoading ? (
            <p>Loading media...</p>
          ) : mediaItems.length === 0 ? (
            <p>No media found. Upload some images first.</p>
          ) : (
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(120px, 1fr))',
                gap: '0.75rem',
                marginBottom: '1rem',
              }}
            >
              {mediaItems.map((item) => {
                const isSelected = selectedIds.has(item.id)
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => handleToggle(item.id)}
                    style={{
                      cursor: 'pointer',
                      border: isSelected
                        ? '3px solid var(--theme-success-500)'
                        : '3px solid transparent',
                      borderRadius: '4px',
                      overflow: 'hidden',
                      aspectRatio: '1',
                      background: 'var(--theme-elevation-100)',
                      padding: 0,
                    }}
                  >
                    {item.thumbnailURL || item.url ? (
                      <img
                        src={item.thumbnailURL || item.url}
                        alt={item.filename || ''}
                        style={{
                          width: '100%',
                          height: '100%',
                          objectFit: 'cover',
                          opacity: isSelected ? 1 : 0.7,
                        }}
                      />
                    ) : (
                      <span
                        style={{
                          width: '100%',
                          height: '100%',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: '0.75rem',
                          padding: '0.5rem',
                          textAlign: 'center',
                        }}
                      >
                        {item.filename || item.id}
                      </span>
                    )}
                  </button>
                )
              })}
            </div>
          )}

          <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
            <Button buttonStyle="secondary" size="small" onClick={() => closeModal(DRAWER_SLUG)}>
              Cancel
            </Button>
            <Button
              size="small"
              onClick={handleCreate}
              disabled={isCreating || selectedIds.size === 0}
            >
              {isCreating ? 'Creating...' : `Create ${selectedIds.size} Photos`}
            </Button>
          </div>
        </div>
      </Drawer>
    </>
  )
}
