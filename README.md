# galen.green

Personal website built with Vue 3, Payload CMS, and MongoDB, self-hosted on TrueNAS Scale.

## Tech Stack

| Layer    | Technology                        |
| -------- | --------------------------------- |
| Frontend | Vue 3, TypeScript, Vite, PrimeVue |
| CMS      | Payload CMS 3, Next.js 15         |
| Database | MongoDB 7                         |
| Hosting  | TrueNAS Scale (Docker)            |
| CI/CD    | GitHub Actions                    |
| Registry | GitHub Container Registry         |

## Project Structure

```
├── src/                  # Vue 3 frontend
├── cms/                  # Payload CMS
├── nginx/                # Nginx reverse proxy config
├── docs/                 # Hosting and deployment documentation
└── .github/workflows/    # CI/CD pipelines
```

## Documentation

| Document                                     | Description                          |
| -------------------------------------------- | ------------------------------------ |
| [docs/HOSTING.md](docs/HOSTING.md)           | Hosting overview and quick reference |
| [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) | System architecture diagrams         |
| [docs/DEPLOYMENT.md](docs/DEPLOYMENT.md)     | Deployment procedures                |
| [docs/ENVIRONMENT.md](docs/ENVIRONMENT.md)   | Environment variables reference      |

## Development Setup

### Prerequisites

- Node.js ^20.19.0 or >=22.12.0
- Docker (for MongoDB, or use remote CMS)

### Option 1: Local Frontend with Production CMS (Recommended)

The fastest way to develop frontend features using production data:

```sh
# Install frontend dependencies
npm install

# Start with production CMS (proxied through Vite)
npm run dev:prod
```

### Option 2: Full Local Stack

For CMS development or offline work:

```sh
# Install dependencies
npm install
cd cms && npm install && cd ..

# Start everything with Docker Compose
docker-compose up -d
```

### Option 3: Individual Services

```sh
# Terminal 1 - MongoDB
docker run -d --name mongodb -p 27017:27017 mongo:7

# Terminal 2 - CMS
cd cms && npm run dev

# Terminal 3 - Vue (connects to local CMS by default)
npm run dev
```

### Custom CMS URL

You can point to any CMS instance:

```sh
# Via Tailscale
CMS_URL=http://100.99.201.124:3000 npm run dev

# Via public URL
CMS_URL=https://galen.green npm run dev
```

## Commands

| Command              | Description                       |
| -------------------- | --------------------------------- |
| `npm run dev`        | Start dev server (local CMS)      |
| `npm run dev:prod`   | Start dev server (production CMS) |
| `npm run build`      | Build for production              |
| `npm run lint`       | Lint with ESLint                  |
| `npm run type-check` | Type check with vue-tsc           |
| `npm run test:unit`  | Run unit tests (Vitest)           |
| `npm run test:e2e`   | Run E2E tests (Playwright)        |

### CMS Commands

| Command                            | Description               |
| ---------------------------------- | ------------------------- |
| `cd cms && npm run dev`            | Start Payload dev server  |
| `cd cms && npm run build`          | Build for production      |
| `cd cms && npm run generate:types` | Generate TypeScript types |

## IDE Setup

[VS Code](https://code.visualstudio.com/) + [Vue (Official)](https://marketplace.visualstudio.com/items?itemName=Vue.volar) extension.

## Browser DevTools

- **Chrome/Edge**: [Vue.js devtools](https://chromewebstore.google.com/detail/vuejs-devtools/nhdogjmejiglipccpnnnanhbledajbpd)
- **Firefox**: [Vue.js devtools](https://addons.mozilla.org/en-US/firefox/addon/vue-js-devtools/)

## Configuration

- [Vite Configuration](https://vite.dev/config/)
- [Payload CMS Documentation](https://payloadcms.com/docs)
