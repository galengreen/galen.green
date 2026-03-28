# 2026-03-27 Image Size Pipeline

## Status

Review

## Goal

Redesign media generation so originals remain untouched, responsive derivatives are based on the short side, and converted full-size WebP/AVIF assets are available.

## Scope

- Preserve the uploaded original file without recompression or format conversion
- Generate responsive WebP and AVIF derivatives from short-side targets `320, 480, 768, 1024, 1400, 1920`
- Generate full-size converted assets for both WebP and AVIF at the original pixel dimensions
- Remove legacy derivative names `thumbnail`, `medium`, and `large`
- Update frontend/media helpers to use the new canonical size set
- Keep regeneration of existing media as a follow-up path

## Component Map

- `cms/src/collections/Media.ts`: upload config and derivative generation strategy
- `cms/src/scripts/regenerate-media.ts`: regeneration path for existing media
- `src/composables/useMedia.ts`: size names, srcset generation, and fallback behavior
- `src/types/index.ts`: media size typings
- `src/App.vue` and image-consuming UI components: size selection assumptions

## Implementation Checklist

- [x] Audit all remaining uses of legacy size aliases
- [x] Design Payload/sharp generation flow for preserved originals plus derived assets
- [x] Implement short-side derivative generation for WebP and AVIF
- [x] Add `full` and `full-avif` outputs and remove legacy aliases
- [x] Update frontend helpers/types to the new size set
- [x] Verify original upload remains unchanged
- [x] Run targeted tests/build and note regeneration follow-up

## Design Notes

- `original` means exact uploaded bytes, not an optimized master
- Responsive derivatives should be skipped when they would upscale or duplicate a larger generated size
- AVIF and WebP should stay parallel for all generated sizes

## Verification Notes

- `npm run test:unit -- src/composables/__tests__/useMedia.spec.ts --run` - passed
- `npm run test:unit -- --run` - passed (68 tests)
- `npm run type-check` - passed
- `npm run lint` - passed
- `cd cms && npm run generate:types` - passed
- `npm run build` - passed
- Existing media uploaded before this change still require regeneration, and those old source files cannot recover bytes lost by the previous pipeline
