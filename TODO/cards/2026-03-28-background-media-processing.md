# 2026-03-28 Background Media Processing

## Status

Review

## Goal

Make media uploads feel fast by storing the original immediately and generating responsive derivatives asynchronously in the background.

## Scope

- Keep the original upload usable immediately after upload
- Move derivative generation out of the upload request path
- Use Payload jobs for background processing instead of introducing external queue infrastructure
- Track processing status on media documents
- Allow the frontend and CMS to fall back to the original while derivatives are pending
- Preserve the existing regenerate-media flow by reusing the same processing pipeline

## Component Map

- `cms/src/collections/Media.ts`: upload hooks, status fields, and job queueing
- `cms/src/payload.config.ts`: Payload jobs/task autorun configuration
- `cms/src/lib/mediaImageSizes.ts`: derivative size definitions
- `cms/src/lib/*media processing*`: shared Sharp generation pipeline and file metadata updates
- `src/composables/useMedia.ts`: graceful fallback to original while sizes are missing
- CMS admin UI: show queued/processing/failed state where useful

## Implementation Checklist

- [x] Research Payload jobs/task setup and autorun model for this CMS deployment
- [x] Design media document fields for queued/processing/ready/failed state
- [x] Extract synchronous derivative generation into a reusable processing function
- [x] Queue processing jobs after upload/regeneration instead of generating inline
- [x] Update read paths to fall back to original while sizes are unavailable
- [x] Preserve manual regenerate behavior by routing it through the same async processor
- [x] Add regression tests for fallback/status behavior
- [x] Verify upload/build/test flows and note deployment requirements

## Design Notes

- Original upload should be available immediately and remain the source of truth
- Background generation should be eventually consistent rather than blocking publishability
- If processing fails, the media should remain usable from the original and surface a CMS warning
- Prefer Payload-native jobs over introducing Redis/BullMQ unless scale later demands it

## Verification Notes

- `cd cms && npm run build` - passed
- `cd cms && npm run generate:types` - passed
- `npm run test:unit -- cms/src/collections/__tests__/Media.spec.ts --run` - passed
- `npm run type-check` - passed
- Background processing now depends on Payload jobs autorun in the CMS process; this assumes the deployed CMS runs as a long-lived server rather than serverless
