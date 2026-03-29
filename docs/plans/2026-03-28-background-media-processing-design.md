# Background Media Processing Design - 2026-03-28

## Problem Statement

Media uploads are slow because Payload generates every responsive derivative during the upload request. With the current media pipeline, each upload can trigger many WebP and AVIF conversions before the user gets control back.

## Approved Design

- Store the original upload immediately and make it usable right away
- Track media processing state on each document (`queued`, `processing`, `ready`, `failed`)
- Generate responsive WebP / AVIF derivatives in the background using Payload jobs
- Reuse one shared processing pipeline for uploads and manual regeneration
- Fall back to the original file on the frontend and in the CMS until derivatives are ready
- If processing fails, keep the media usable and surface the failure in the CMS

## Why This Approach

This keeps the best user experience without introducing extra infrastructure. Payload already includes a job system, so the CMS can queue work without adding Redis or a separate worker stack yet. The original remains the source of truth, while optimized variants become eventually consistent.

## Tradeoffs

- Upload UX becomes much faster
- Newly uploaded media may briefly serve the original instead of optimized variants
- The implementation is more involved than static `upload.imageSizes`, because derivative generation must be owned in application code

## Success Criteria

- Upload requests complete quickly after storing the original
- The site and CMS can use the original immediately after upload
- Derivatives are generated asynchronously and update the media document when ready
- Manual regeneration uses the same background pipeline
