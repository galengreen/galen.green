import sharp from 'sharp'
import { describe, expect, it } from 'vitest'
import { MEDIA_IMAGE_SIZE_DEFINITIONS } from '../../lib/mediaImageSizes'

describe('Media upload config', () => {
  const imageSizes = MEDIA_IMAGE_SIZE_DEFINITIONS

  it('disables focal point cropping for short-side responsive sizes', () => {
    const xsSize = imageSizes.find((size) => size.name === 'xs')

    expect(xsSize?.fit).toBe('outside')
    expect(xsSize?.withoutEnlargement).toBe(true)
  })

  it('keeps panorama aspect ratio when resizing with responsive bounds', async () => {
    const xsSize = imageSizes.find((size) => size.name === 'xs')

    expect(xsSize).toBeDefined()

    const panoramaBuffer = await sharp({
      create: {
        width: 4000,
        height: 1000,
        channels: 3,
        background: '#334455',
      },
    })
      .jpeg()
      .toBuffer()

    const { info } = await sharp(panoramaBuffer)
      .resize({
        width: xsSize?.width,
        height: xsSize?.height,
        fit: xsSize?.fit,
        withoutEnlargement: xsSize?.withoutEnlargement,
      })
      .toBuffer({ resolveWithObject: true })

    expect(info.width).toBe(1280)
    expect(info.height).toBe(320)
  })
})
