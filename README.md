# [galen.green](https://galen.green)

Personal website built with Vue 3 on the frontend and Payload CMS on the backend. The frontend is statically built with Vite SSG, the CMS runs on Next.js, and both are shipped as Docker images for deployment on TrueNAS Scale.

## Stack

| Layer      | Technology                          |
| ---------- | ----------------------------------- |
| Frontend   | Vue 3, TypeScript, Vite, Vite SSG   |
| CMS        | Payload CMS 3, Next.js 15           |
| Data       | MongoDB 7                           |
| Deployment | Docker, Nginx, GitHub Actions, GHCR |

## Development

### Recommended: frontend against production CMS

This is the fastest way to work on the UI with real content.

Best option: run the frontend locally, but point it at the production CMS over Tailscale rather than the public domain. That keeps traffic private, avoids public edge behavior while developing, and still gives you real production data.

```sh
npm install
CMS_URL=http://<tailscale-cms-host>:3000 npm run dev
```

If you specifically want to use the public URL instead, `npm run dev:prod` proxies `/api` and `/media` to `https://galen.green`.

### Frontend against a custom CMS

Use `CMS_URL` to change the Vite dev proxy target.

```sh
CMS_URL=http://localhost:3000 npm run dev
```

### Full local development

If you need to work on the CMS too, run MongoDB locally, start the CMS, then run the frontend.

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

- `CMS_URL` controls the Vite dev proxy target used by `npm run dev`.

- `VITE_PAYLOAD_URL` is used by SSR/static builds to fetch CMS data during `npm run build`.

For local frontend builds against a local CMS:

```sh
VITE_PAYLOAD_URL=http://localhost:3000 npm run build
```

See `.env.example` and `cms/.env.example` for the current variable set.

## Commands

### Frontend

| Command              | Description                                 |
| -------------------- | ------------------------------------------- |
| `npm run dev`        | Start Vite with the default local CMS proxy |
| `npm run dev:prod`   | Start Vite against the production CMS       |
| `npm run build`      | Type-check and build the static frontend    |
| `npm run build-only` | Build the static frontend without typecheck |
| `npm run preview`    | Preview the built frontend locally          |
| `npm run lint`       | Run ESLint                                  |
| `npm run type-check` | Run `vue-tsc`                               |
| `npm run format`     | Format `src/` with Prettier                 |

### CMS

| Command                                   | Description                       |
| ----------------------------------------- | --------------------------------- |
| `npm --prefix cms run dev`                | Start the Payload CMS dev server  |
| `npm --prefix cms run build`              | Build the CMS                     |
| `npm --prefix cms run start`              | Start the built CMS               |
| `npm --prefix cms run generate:types`     | Generate Payload TypeScript types |
| `npm --prefix cms run generate:importmap` | Generate Payload import map       |

## CI And Deployment

- `.github/workflows/ci.yml` runs frontend lint/type-check/build plus a CMS build job.

- `.github/workflows/deploy.yml` builds and pushes versioned frontend and CMS images to GitHub Container Registry.

- The frontend Docker build expects `VITE_PAYLOAD_URL` so prerendering can fetch CMS content at build time.

## References

- [Vite documentation](https://vite.dev/config/)

- [Payload CMS documentation](https://payloadcms.com/docs)

⠀
