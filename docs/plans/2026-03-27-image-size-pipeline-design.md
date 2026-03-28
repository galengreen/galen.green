# Image Size Pipeline Design - 2026-03-27

## Problem Statement

The current media pipeline generates fixed width-based sizes and converts the uploaded source into WebP. This hurts panorama quality because extremely wide images get resized from their long edge, and it prevents the system from preserving the true original upload.

## Approved Design

- Preserve the uploaded file exactly as the `original`
- Generate responsive WebP sizes `xs`, `sm`, `md`, `lg`, `xl`, `xxl`
- Generate matching AVIF sizes `xs-avif`, `sm-avif`, `md-avif`, `lg-avif`, `xl-avif`, `xxl-avif`
- Generate `full` and `full-avif` at the original pixel dimensions
- Base responsive sizing on short-side targets: `320, 480, 768, 1024, 1400, 1920`
- Never enlarge beyond the uploaded dimensions
- Remove legacy alias sizes `thumbnail`, `medium`, `large`

## Rationale

Short-side sizing treats panoramas and tall images more fairly because the visually constrained dimension stays consistent. Keeping exact originals protects archival quality and gives the site a true source asset, while `full` and `full-avif` provide optimized delivery formats without losing the original.

## Implementation Considerations

- The existing static `imageSizes` config in Payload is width-based, so short-side generation may require a custom upload/generation path rather than only renaming widths
- Frontend helpers must stop assuming the old legacy aliases and should rely on real generated width metadata where possible
- Existing media documents will need regeneration after the new derivative naming scheme lands

## Success Criteria

- New uploads retain their exact original file and metadata
- Panoramas produce materially larger, less over-compressed responsive derivatives than before
- The frontend serves the new responsive WebP/AVIF assets correctly
- No code paths still depend on `thumbnail`, `medium`, or `large`
