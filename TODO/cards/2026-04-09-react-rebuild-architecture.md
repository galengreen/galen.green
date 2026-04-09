# 2026-04-09 React Rebuild Architecture

## Status

Review

## Goal

Define the target architecture for rebuilding the site as a simpler React-based application, while isolating the current implementation under a `legacy/` area and reducing long-term maintenance overhead.

## Scope

- Evaluate a small set of React-based architecture options against the current split frontend and CMS setup
- Recommend a single target stack and repository layout
- Define the target application boundaries for public site, admin, content, media, and server logic
- Outline the migration shape from the current Vue frontend and separate Payload app to the new structure
- Capture key risks, trade-offs, and verification expectations for the rebuild

## Component Map

- `src/`: current Vue public site to be treated as legacy during planning
- `cms/src/`: current Payload app and schemas to be the primary source for content/admin concerns
- `README.md`: project and workflow documentation that will need updating once the target architecture is approved
- `docs/plans/`: approved design and migration plan destination

## Implementation Checklist

- [x] Confirm rebuild priorities and target site shape
- [x] Compare candidate React-based architectures
- [x] Define the recommended target architecture and folder layout
- [x] Define runtime and data-flow boundaries
- [x] Move legacy code into a dedicated `legacy/` area
- [x] Scaffold the new root React application
- [x] Replace the initial layout-heavy homepage with a minimal placeholder page
- [x] Build the fixed viewport frame block
- [x] Build the floating menu pill block
- [x] Animate the floating menu hover pill
- [x] Add a working theme toggle to the menu
- [x] Organize the new app file structure by role
- [x] Extract repeated custom shadows into reusable globals
- [x] Standardize light/dark transition timing sitewide
- [x] Add haptic feedback to menu interactions
- [x] Verify lint, type-check, and build

## Design Notes

- Current complexity comes mostly from the split between the Vue/Vite SSG frontend and the separate Next/Payload CMS app.
- The preferred direction is a single-app architecture unless a strong reason appears to keep the split.
- The rebuilt site should stay content-first rather than becoming a heavy product-style application.

## Verification Notes

- Legacy frontend moved to `legacy/frontend-vue`.
- Legacy CMS moved to `legacy/cms-next`.
- Replaced the first layout-heavy homepage pass with a single simple page and minimal global styling.
- Added a first reusable viewport frame block with a fixed black border and inner scrolling surface.
- Added a placeholder floating menu pill as a frame overlay so it stays fixed while content scrolls underneath.
- Upgraded the floating menu to use one shared hover pill that slides quickly between placeholder items.
- Added a real theme button on the right side of the menu with localStorage persistence, system fallback, and root theme class wiring.
- Reorganized the new app components into `layout`, `navigation`, `sections`, and `theme` folders so the file structure matches the component roles.
- Extracted the repeated custom shadow stacks into reusable global utility classes and replaced the inline shadow strings in the frame and floating menu.
- Centralized theme-motion timing in a reusable global `transition-ui` utility and applied it consistently to surfaces, menu elements, theme controls, and text color changes.
- Added `web-haptics` support for menu taps and the theme toggle through a small shared client hook.
- `npm run lint` passed.
- `npm run type-check` passed.
- `npm run build` passed, with the same non-blocking Next `@next/swc` version warning from the installed binary package.
- `npm run lint` passed.
- `npm run type-check` passed.
- `npm run build` passed, with the same non-blocking Next `@next/swc` version warning from the installed binary package.
- `npm run lint` passed.
- `npm run type-check` passed.
- `npm run build` passed, with the same non-blocking Next `@next/swc` version warning from the installed binary package.
- `npm run lint` passed.
- `npm run type-check` passed.
- `npm run build` passed, with the same non-blocking Next `@next/swc` version warning from the installed binary package.
