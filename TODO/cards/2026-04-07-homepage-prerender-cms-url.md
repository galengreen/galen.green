# 2026-04-07 Homepage Prerender CMS URL

## Status

Review

## Goal

Restore prerendered homepage content by ensuring the frontend Docker build passes the CMS origin Vite needs during `vite-ssg build`.

## Scope

- Confirm why `https://galen.green/` is prerendering the error fallback
- Fix Docker build-time env wiring for `VITE_PAYLOAD_URL`
- Rebuild locally with the production CMS URL and verify `dist/index.html` contains real CMS content

## Component Map

- `Dockerfile`: expose build args to the Vite build step
- `.github/workflows/deploy.yml`: already supplies `VITE_PAYLOAD_URL`; verify it matches the Dockerfile fix

## Implementation Checklist

- [x] Reproduce the broken prerendered homepage state from the live site/source
- [x] Expose `VITE_PAYLOAD_URL` in the frontend Docker build stage
- [x] Run a local production build with `VITE_PAYLOAD_URL=https://galen.green`
- [x] Verify the built `dist/index.html` serializes CMS content instead of the error fallback

## Design Notes

- Keep the fix minimal and deployment-focused; no runtime app code changes should be needed if prerendering receives the correct CMS origin.

## Verification Notes

- Live HTML currently contains `Failed to load content. Please try again later.` and `window.__INITIAL_STATE__={"cms":{"siteSettings":null,"homeContent":null}}`.
- Direct CMS endpoint check succeeds: `https://galen.green/api/globals/about?depth=2` returns `200` with content.
- Updated `Dockerfile` to expose `ARG VITE_PAYLOAD_URL` and `ENV VITE_PAYLOAD_URL=${VITE_PAYLOAD_URL}` to the Vite build stage.
- `VITE_PAYLOAD_URL=https://galen.green npm run build` passed.
- `dist/index.html` no longer contains the fallback error/empty-state strings and now serializes populated CMS state in `window.__INITIAL_STATE__`.
