import sharp from 'sharp'
import { describe, expect, it } from 'vitest'
import { Media } from '../Media'

describe('Media upload config', () => {
  const uploadConfig = Media.upload && typeof Media.upload === 'object' ? Media.upload : null

  it('disables focal point cropping for short-side responsive sizes', () => {
    expect(uploadConfig?.focalPoint).toBe(false)
  })

  it('keeps panorama aspect ratio when resizing with responsive bounds', async () => {
    const xsSize = uploadConfig?.imageSizes?.find((size) => size.name === 'xs')

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
