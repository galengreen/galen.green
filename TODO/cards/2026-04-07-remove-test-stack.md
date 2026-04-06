# 2026-04-07 Remove Test Stack

## Status

Review

## Goal

Remove the frontend test stack the project no longer wants, including unit tests, Playwright E2E coverage, Lighthouse CI wiring, and related CI/lint/docs references.

## Scope

- Remove Vitest, Playwright, and Lighthouse scripts/config/dependencies from the frontend workspace
- Delete tracked unit test and E2E test files
- Remove CI workflow jobs that execute tests
- Update project docs/config to stop referencing the removed test setup
- Verify the remaining lint, type-check, and build workflow still passes

## Component Map

- `package.json` and `package-lock.json`: remove test scripts and dev dependencies
- `eslint.config.ts`: remove Vitest and Playwright plugin config
- `.github/workflows/ci.yml` and `.github/workflows/e2e-tests.yml`: remove test workflows/jobs
- `.gitignore`, `AGENTS.md`: remove stale test-related references
- `src/**/__tests__`, `cms/src/**/__tests__`, `e2e/**`: delete test files and helpers

## Implementation Checklist

- [x] Remove frontend test scripts and related dev dependencies
- [x] Delete Vitest, Playwright, Lighthouse config files and tracked test files
- [x] Remove CI and lint integration for the deleted test stack
- [x] Update local agent/docs references that still mention test commands or folders
- [x] Run lint, type-check, and build to verify the reduced setup still works

## Design Notes

- Keep the cleanup broad enough to remove stale references, but do not alter unrelated CMS build behavior.

## Verification Notes

- `npm uninstall @axe-core/playwright @lhci/cli @playwright/test @types/jsdom @vitest/eslint-plugin @vue/test-utils eslint-plugin-playwright jsdom vitest` removed the frontend test-related packages and rewrote `package-lock.json`.
- Deleted the tracked Vitest, Playwright, Lighthouse, and test file surface from the frontend workspace plus the one CMS collection test.
- Removed test jobs from `.github/workflows/ci.yml` and deleted `.github/workflows/e2e-tests.yml`.
- Updated `README.md`, `AGENTS.md`, `eslint.config.ts`, `tsconfig.json`, `tsconfig.app.json`, `tsconfig.node.json`, and `.gitignore` to match the no-tests setup.
- Removed the now-empty `e2e/` and `__tests__/` directories after deleting the tracked test files.
- `npm run lint` passed.
- `npm run type-check` passed.
- `npm run build` passed.
- `package-lock.json` still mentions `@playwright/test` only as an optional peer dependency of `next`; it is no longer a direct dependency of this project.
