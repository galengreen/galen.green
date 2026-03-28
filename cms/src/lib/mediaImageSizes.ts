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

// Generate image size config for a given short-side target and format
const createResponsiveImageSize = (
  name: string,
  shortSide: number,
  format: 'webp' | 'avif',
  quality: number,
) => ({
  name: format === 'webp' ? name : `${name}-avif`,
  width: shortSide,
  height: shortSide,
  fit: 'outside' as const,
  position: 'centre' as const,
  withoutEnlargement: true,
  formatOptions: {
    format,
    options: { quality },
  },
})

const createFullImageSize = (format: 'webp' | 'avif', quality: number) => ({
  name: format === 'webp' ? 'full' : 'full-avif',
  width: FULL_SIZE_TARGET,
  height: FULL_SIZE_TARGET,
  fit: 'inside' as const,
  position: 'centre' as const,
  withoutEnlargement: true,
  formatOptions: {
    format,
    options: { quality },
  },
  admin: {
    disableGroupBy: true,
    disableListColumn: true,
    disableListFilter: true,
  },
})

// Generate all responsive sizes for both formats
export const generateImageSizes = () => {
  const sizes: Array<
    ReturnType<typeof createResponsiveImageSize> | ReturnType<typeof createFullImageSize>
  > = []

  for (const [name, shortSide] of Object.entries(IMAGE_SHORT_SIDES)) {
    sizes.push(createResponsiveImageSize(name, shortSide, 'webp', 85))
  }
  sizes.push(createFullImageSize('webp', 85))

  for (const [name, shortSide] of Object.entries(IMAGE_SHORT_SIDES)) {
    sizes.push(createResponsiveImageSize(name, shortSide, 'avif', 70))
  }
  sizes.push(createFullImageSize('avif', 70))

  return sizes
}
