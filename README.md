# galen.green

Personal website built with Vue 3, Payload CMS, and MongoDB.

## Project Structure

- **Frontend**: Vue 3 + Vite (root directory)
- **CMS**: Payload CMS (cms directory)
- **Database**: MongoDB

## Development Setup

### Prerequisites

- Node.js ^20.19.0 or >=22.12.0
- Docker (for MongoDB)

### Getting Started

1. Clone and install dependencies:

```sh
npm install
cd cms && npm install
```

2. Start MongoDB, CMS, and Vue dev servers in separate terminals:

```sh
# Terminal 1 - MongoDB
docker run -d --name mongodb -p 27017:27017 mongo:7

# Terminal 2 - CMS
cd cms && npm run dev

# Terminal 3 - Vue
npm run dev
```

Alternatively, use Docker Compose:

```sh
docker-compose up -d
```

## Recommended IDE Setup

[VS Code](https://code.visualstudio.com/) + [Vue (Official)](https://marketplace.visualstudio.com/items?itemName=Vue.volar) (and disable Vetur).

## Recommended Browser Setup

- Chromium-based browsers (Chrome, Edge, Brave, etc.):
  - [Vue.js devtools](https://chromewebstore.google.com/detail/vuejs-devtools/nhdogjmejiglipccpnnnanhbledajbpd)
  - [Turn on Custom Object Formatter in Chrome DevTools](http://bit.ly/object-formatters)
- Firefox:
  - [Vue.js devtools](https://addons.mozilla.org/en-US/firefox/addon/vue-js-devtools/)
  - [Turn on Custom Object Formatter in Firefox DevTools](https://fxdx.dev/firefox-devtools-custom-object-formatters/)

## Type Support for `.vue` Imports in TS

TypeScript cannot handle type information for `.vue` imports by default, so we replace the `tsc` CLI with `vue-tsc` for type checking. In editors, we need [Volar](https://marketplace.visualstudio.com/items?itemName=Vue.volar) to make the TypeScript language service aware of `.vue` types.

## Customize configuration

See [Vite Configuration Reference](https://vite.dev/config/) and [Payload CMS Documentation](https://payloadcms.com/docs).

## Build for Production

### Vue Frontend

```sh
npm run build
```

### Payload CMS

```sh
cd cms && npm run build
```

### Type-Check, Compile and Minify for Production

```sh
npm run build
```

### Run Unit Tests with [Vitest](https://vitest.dev/)

```sh
npm run test:unit
```

### Run End-to-End Tests with [Playwright](https://playwright.dev)

```sh
# Install browsers for the first run
npx playwright install

# When testing on CI, must build the project first
npm run build

# Runs the end-to-end tests
npm run test:e2e
# Runs the tests only on Chromium
npm run test:e2e -- --project=chromium
# Runs the tests of a specific file
npm run test:e2e -- tests/example.spec.ts
# Runs the tests in debug mode
npm run test:e2e -- --debug
```

### Lint with [ESLint](https://eslint.org/)

```sh
npm run lint
```
