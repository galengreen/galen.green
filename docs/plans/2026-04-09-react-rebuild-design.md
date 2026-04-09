# React Rebuild Design

## Goal

Rebuild the site from a cleaner foundation while preserving its single-page character, restrained visual identity, and content-first focus.

## Approved Direction

- The public site remains centered on a single homepage experience.
- The new stack is React-based and starts with a root Next.js application.
- The current Vue frontend and separate CMS are preserved under `legacy/`.
- The first implementation phase focuses on shell and layout rather than CMS integration.

## Target Architecture

- Root application: `Next.js`
- UI layer: `React` with server-first rendering
- Styling: `Tailwind CSS v4` plus a very small global token layer
- Future CMS direction: unify around Payload inside the new app once the shell is approved

## Visual Direction

- Keep the strong dark frame around the viewport.
- Keep the floating capsule navigation.
- Keep the single-page flow and section anchors.
- Evolve the typography and spacing toward something calmer and more editorial.
- Prefer fewer, better primitives over many specialized components.

## Phase 1 Scope

- Create the new Next.js root app
- Build a layout shell with frame, navigation, hero, and section scaffolding
- Use temporary static content to shape the experience
- Avoid bringing over old runtime assumptions such as the custom scroll root and client-side content fan-out

## Migration Notes

- Legacy frontend moved to `legacy/frontend-vue`
- Legacy CMS moved to `legacy/cms-next`
- Repo workflow docs remain at the root so planning and implementation history stay discoverable

## Risks

- Rebuilding too much too early would recreate complexity instead of reducing it.
- A visually similar shell can still regress if it keeps the old interaction model unnecessarily.
- CMS integration should wait until the new layout primitives feel settled.

## Verification

- `npm run lint`
- `npm run type-check`
- `npm run build`
