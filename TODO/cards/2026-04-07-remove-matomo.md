# 2026-04-07 Remove Matomo

## Status

Review

## Goal

Remove Matomo analytics and all related references from the frontend app, config, deployment, and documentation.

## Scope

- Remove the runtime analytics integration from the Vue app
- Remove Matomo dependencies, env vars, Vite proxying, and deploy build args
- Remove Nginx CSP allowances that only existed for Matomo
- Update README and any type declarations or config files that still mention Matomo
- Verify lint, type-check, and build still pass

## Component Map

- `src/main.ts`: remove Matomo bootstrap logic
- `package.json` and `package-lock.json`: remove `vue-matomo`
- `env.d.ts`, `.env.example`, `vite.config.ts`, `Dockerfile`: remove Matomo env/config wiring
- `nginx/default.conf` and `nginx/default.local.conf`: remove analytics-specific CSP allowances
- `.github/workflows/deploy.yml`, `README.md`: remove deployment/docs references

## Implementation Checklist

- [x] Remove Matomo from app runtime code and dependencies
- [x] Remove Matomo-related env vars, build args, and Vite proxy config
- [x] Remove Matomo-specific Nginx policy allowances and docs references
- [x] Run lint, type-check, and build to verify the cleanup

## Design Notes

- Prefer full deletion over feature-flagging so the repo no longer carries dead analytics code or config.

## Verification Notes

- Removed the dynamic `vue-matomo` bootstrap from `src/main.ts`.
- Removed `vue-matomo` from `package.json` and regenerated `package-lock.json` via `npm uninstall vue-matomo`.
- Removed Matomo-related env/config wiring from `env.d.ts`, `.env.example`, `vite.config.ts`, `Dockerfile`, and `.github/workflows/deploy.yml`.
- Removed analytics-specific CSP allowances from `nginx/default.conf` and `nginx/default.local.conf`.
- Updated `README.md` to remove Matomo references.
- Repo-wide grep for `MATOMO|matomo|analytics.galen.green|vue-matomo` returned no matches.
- `npm run lint` passed.
- `npm run type-check` passed.
- `npm run build` passed.
