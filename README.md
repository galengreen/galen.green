# [galen.green](https://galen.green)

Personal website and CMS stack built with Vue 3, Payload CMS, and MongoDB, then shipped as Docker images for self-hosting on TrueNAS Scale.

> The frontend is statically rendered with Vite SSG.
> The CMS runs separately on Next.js + Payload.
> The day-to-day dev loop is intentionally simple: run the frontend locally, point it at the real backend, and move quickly.

## At A Glance

| Area     | Stack                               |
| -------- | ----------------------------------- |
| Frontend | Vue 3, TypeScript, Vite, Vite SSG   |
| CMS      | Payload CMS 3, Next.js 15           |
| Data     | MongoDB 7                           |
| Delivery | Docker, Nginx, GitHub Actions, GHCR |

## Repo Layout

```text
.
├── src/                  # Vue frontend app
├── cms/                  # Payload CMS app
├── nginx/                # Nginx configs for local and production serving
├── public/               # Frontend public assets
├── .github/workflows/    # CI and deployment pipelines
└── TODO/                 # Local KanStack task board
```

## Recommended Workflow

For most frontend work, use the production CMS while running the frontend locally.

```sh
npm install
npm run dev:prod
```

That proxies `/api` and `/media` to `https://galen.green`, so you get real content without needing to boot the full local stack.

## Development Modes

### Frontend against a custom CMS

Use `CMS_URL` to point the Vite dev proxy at any CMS instance.

```sh
CMS_URL=http://localhost:3000 npm run dev
```

### Full local development

Use this when you need to work on the CMS itself, local schema changes, or local content.

1. Install dependencies:

```sh
npm install
npm --prefix cms install
```

2. Start MongoDB:

```sh
docker run -d --name mongodb -p 27017:27017 mongo:7
```

3. Create `cms/.env` from `cms/.env.example` and set at least:

- `MONGODB_URI`
- `PAYLOAD_SECRET`

4. Start the CMS:

```sh
npm --prefix cms run dev
```

5. Start the frontend:

```sh
CMS_URL=http://localhost:3000 npm run dev
```

## Environment Notes

| Variable           | Purpose                                          |
| ------------------ | ------------------------------------------------ |
| `CMS_URL`          | Dev-only Vite proxy target used by `npm run dev` |
| `VITE_PAYLOAD_URL` | CMS origin used during SSR/static builds         |

For local frontend builds against a local CMS:

```sh
VITE_PAYLOAD_URL=http://localhost:3000 npm run build
```

See `.env.example` and `cms/.env.example` for the current variable set.

## Commands

### Frontend

| Command              | Description                                     |
| -------------------- | ----------------------------------------------- |
| `npm run dev`        | Start Vite with the default local CMS proxy     |
| `npm run dev:prod`   | Start Vite against the production CMS           |
| `npm run build`      | Type-check and build the static frontend        |
| `npm run build-only` | Build the static frontend without type-checking |
| `npm run preview`    | Preview the built frontend locally              |
| `npm run lint`       | Run ESLint                                      |
| `npm run type-check` | Run `vue-tsc`                                   |
| `npm run format`     | Format `src/` with Prettier                     |

### CMS

| Command                                   | Description                       |
| ----------------------------------------- | --------------------------------- |
| `npm --prefix cms run dev`                | Start the Payload CMS dev server  |
| `npm --prefix cms run build`              | Build the CMS                     |
| `npm --prefix cms run start`              | Start the built CMS               |
| `npm --prefix cms run generate:types`     | Generate Payload TypeScript types |
| `npm --prefix cms run generate:importmap` | Generate the Payload import map   |

## CI And Deployment

- `.github/workflows/ci.yml` runs frontend lint, type-check, build, and a CMS build job.
- `.github/workflows/deploy.yml` builds and pushes versioned frontend and CMS images to GitHub Container Registry.
- The frontend Docker build expects `VITE_PAYLOAD_URL` so prerendering can fetch CMS content at build time.

## Reference

- [Vite documentation](https://vite.dev/config/)
- [Payload CMS documentation](https://payloadcms.com/docs)
