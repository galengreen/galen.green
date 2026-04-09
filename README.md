# galen.green

Fresh rebuild of the site on a React-first stack focused on simplicity and a cleaner long-term structure.

## Current Direction

- `Next.js 15`
- `React 19`
- `TypeScript`
- `Tailwind CSS v4`

The current legacy code has been preserved under `legacy/` while the new app is rebuilt from a cleaner foundation.

## Current State

The old code has been moved into `legacy/`.

The new root app is intentionally minimal right now:

- one simple homepage
- no custom shell or section system yet
- no CMS wiring yet

The goal is to rebuild from a clean base instead of carrying early design decisions forward.

## Commands

```sh
npm install
npm run dev
npm run lint
npm run type-check
npm run build
```
