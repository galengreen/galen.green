export type GeneratedImageFormat = 'webp' | 'avif'

export interface GeneratedMediaSizeDefinition {
  fit: 'inside' | 'outside'
  format: GeneratedImageFormat
  height: number
  name:
    | 'xs'
    | 'sm'
    | 'md'
    | 'lg'
    | 'xl'
    | 'xxl'
    | 'full'
    | 'xs-avif'
    | 'sm-avif'
    | 'md-avif'
    | 'lg-avif'
    | 'xl-avif'
    | 'xxl-avif'
    | 'full-avif'
  quality: number
  withoutEnlargement: boolean
  width: number
}

// Responsive image short-side targets
export const IMAGE_SHORT_SIDES = {
  xs: 320,
  sm: 480,
  md: 768,
  lg: 1024,
  xl: 1400,
  xxl: 1920,
} as const

const FULL_SIZE_TARGET = 999999

const createResponsiveSize = (
  name: keyof typeof IMAGE_SHORT_SIDES,
  shortSide: number,
  format: GeneratedImageFormat,
  quality: number,
): GeneratedMediaSizeDefinition => ({
  fit: 'outside',
  format,
  height: shortSide,
  name: format === 'webp' ? name : `${name}-avif`,
  quality,
  withoutEnlargement: true,
  width: shortSide,
})

const createFullSize = (
  format: GeneratedImageFormat,
  quality: number,
): GeneratedMediaSizeDefinition => ({
  fit: 'inside',
  format,
  height: FULL_SIZE_TARGET,
  name: format === 'webp' ? 'full' : 'full-avif',
  quality,
  withoutEnlargement: true,
  width: FULL_SIZE_TARGET,
})

export const MEDIA_IMAGE_SIZE_DEFINITIONS: GeneratedMediaSizeDefinition[] = [
  ...Object.entries(IMAGE_SHORT_SIDES).map(([name, shortSide]) =>
    createResponsiveSize(name as keyof typeof IMAGE_SHORT_SIDES, shortSide, 'webp', 85),
  ),
  createFullSize('webp', 85),
  ...Object.entries(IMAGE_SHORT_SIDES).map(([name, shortSide]) =>
    createResponsiveSize(name as keyof typeof IMAGE_SHORT_SIDES, shortSide, 'avif', 70),
  ),
  createFullSize('avif', 70),
]
