# Environment Variables Reference

This document lists all environment variables used in the galen.green infrastructure.

## Overview

```mermaid
flowchart TB
    subgraph Frontend["Frontend (Vite Dev)"]
        FE_ENV["CMS_URL<br/>MATOMO_URL<br/>(runtime, for Vite proxy)"]
        FE_BUILD["VITE_MATOMO_URL<br/>(build-time)"]
    end

    subgraph CMS["CMS (Payload/Next.js)"]
        CMS_REQ["Required:<br/>MONGODB_URI<br/>PAYLOAD_SECRET<br/>NEXT_PUBLIC_SERVER_URL<br/>FRONTEND_URL"]
        CMS_OPT["Optional:<br/>GITHUB_TOKEN<br/>RESEND_API_KEY<br/>NOTIFICATION_EMAIL<br/>CRON_SECRET<br/>DEV_FRONTEND_URL<br/>MEDIA_DIR"]
    end

    subgraph MongoDB["MongoDB"]
        DB_ENV["MONGO_INITDB_ROOT_USERNAME<br/>MONGO_INITDB_ROOT_PASSWORD"]
    end

    FE_ENV -->|"proxy /api, /media"| CMS
    CMS_REQ -->|"172.16.0.1:27017"| MongoDB
```

## Production Configuration (TrueNAS Apps)

### galen-frontend

No environment variables required. The nginx config and static assets are baked into the image.

**Build-time variable** (set during `npm run build`):

| Variable          | Required | Example Value                   |
| ----------------- | -------- | ------------------------------- |
| `VITE_MATOMO_URL` | No       | `https://analytics.galen.green` |

### galen-cms

| Variable                 | Required | Example Value                                                       |
| ------------------------ | -------- | ------------------------------------------------------------------- |
| `MONGODB_URI`            | Yes      | `mongodb://user:pass@172.16.0.1:27017/galen-green?authSource=admin` |
| `PAYLOAD_SECRET`         | Yes      | `A4t9UzX/g0Ytz3S6VV1le/WZJUzMb6clRSFCCup1OgM=`                      |
| `NEXT_PUBLIC_SERVER_URL` | Yes      | `https://galen.green`                                               |
| `FRONTEND_URL`           | Yes      | `https://galen.green`                                               |
| `GITHUB_TOKEN`           | No       | `ghp_xxxxxxxxxxxxxxxxxxxx`                                          |
| `RESEND_API_KEY`         | No       | `re_xxxxxxxxxxxxxxxxxxxx`                                           |
| `NOTIFICATION_EMAIL`     | No       | `dev@galen.green`                                                   |
| `CRON_SECRET`            | No       | `Ps9nzC3CdvQMLjckUp6++Z31lZNw5acSvvSp86lcwvE=`                      |
| `DEV_FRONTEND_URL`       | No       | `http://localhost:5173,http://127.0.0.1:5173`                       |
| `MONGO_USERNAME`         | No       | `galengreen` (used by some hooks)                                   |
| `MONGO_PASSWORD`         | No       | `your-password` (used by some hooks)                                |

### MongoDB

| Variable                     | Required | Example Value   |
| ---------------------------- | -------- | --------------- |
| `MONGO_INITDB_ROOT_USERNAME` | Yes      | `galengreen`    |
| `MONGO_INITDB_ROOT_PASSWORD` | Yes      | `your-password` |

## Variable Details

### MONGODB_URI

MongoDB connection string with authentication.

**Format**:

```
mongodb://<username>:<password>@<host>:<port>/<database>?authSource=admin
```

**Important**: Special characters in the password must be URL-encoded:
| Character | Encoded |
| --------- | ------- |
| `$` | `%24` |
| `*` | `%2A` |
| `^` | `%5E` |
| `@` | `%40` |
| `#` | `%23` |
| `&` | `%26` |

**Example** (password: `QTHJ2EYPVCkf$h3QE*^k1PYcnyP8H7`):

```
mongodb://galengreen:QTHJ2EYPVCkf%24h3QE%2A%5Ek1PYcnyP8H7@172.16.0.1:27017/galen-green?authSource=admin
```

### PAYLOAD_SECRET

Encryption key used by Payload CMS for sessions and password hashing.

**Requirements**:

- At least 32 characters
- Should be randomly generated
- Must be the same across restarts (or sessions will invalidate)

**Generate**:

```sh
openssl rand -base64 32
```

### NEXT_PUBLIC_SERVER_URL

The public URL where the CMS is accessible. Used by Next.js for generating absolute URLs.

**Production**: `https://galen.green`
**Development**: `http://localhost:3000`

### FRONTEND_URL

The URL of the frontend, used for CORS configuration.

**Production**: `https://galen.green`

### DEV_FRONTEND_URL

Additional origins allowed for CORS during development. Comma-separated list.

**Example**:

```
http://localhost:5173,http://127.0.0.1:5173,http://100.89.52.22:5173
```

This allows local Vite dev servers and Tailscale IP to access the remote CMS.

### GITHUB_TOKEN

GitHub Personal Access Token for fetching contribution graph data.

**Required Scopes**: `read:user` (public repos only)

### RESEND_API_KEY

API key for [Resend](https://resend.com) email service, used for contact form notifications.

### NOTIFICATION_EMAIL

Email address to receive contact form submissions.

### CRON_SECRET

Secret token for authenticating scheduled task endpoints.

**Generate**:

```sh
openssl rand -base64 32
```

## Local Development

### Frontend

The frontend uses a Vite proxy for all `/api` and `/media` requests. No `.env` file is needed.

```sh
# Local CMS (default)
npm run dev

# Production CMS
npm run dev:prod

# Custom CMS URL
CMS_URL=http://100.99.201.124:3000 npm run dev
```

The `CMS_URL` environment variable controls where Vite proxies requests:

- **Default**: `http://localhost:3000` (local CMS)
- **Production**: `https://galen.green`
- **Tailscale**: `http://100.99.201.124:3000`

The `MATOMO_URL` environment variable controls where Vite proxies `/analytics` requests:

- **Default**: `http://localhost:8080`
- **Tailscale**: `http://100.99.201.124:8083`

The `VITE_MATOMO_URL` variable is baked into the frontend at build time for analytics tracking:

- **Production**: `https://analytics.galen.green`

### CMS (cms/.env)

```sh
# Required
MONGODB_URI=mongodb://localhost:27017/galen-green
PAYLOAD_SECRET=dev-secret-not-for-production-use

# Optional
GITHUB_TOKEN=
RESEND_API_KEY=
NOTIFICATION_EMAIL=
CRON_SECRET=
```

### Docker Compose (.env in root)

```sh
# MongoDB auth
MONGO_USERNAME=admin
MONGO_PASSWORD=devpassword

# CMS
PAYLOAD_SECRET=dev-secret-not-for-production-use
CMS_URL=http://localhost:3000

# Analytics (Matomo)
VITE_MATOMO_URL=https://analytics.galen.green
MATOMO_URL=http://localhost:8080
```

## Security Notes

1. **Never commit `.env` files** to version control
2. **Rotate secrets immediately** if exposed (like in this conversation)
3. **URL-encode passwords** in MongoDB connection strings
4. **Use strong, unique passwords** for production
5. **Limit GitHub token scope** to minimum required permissions
6. **Different secrets for dev/prod** - never use production secrets locally

## Generating Secure Secrets

```sh
# Generate a 32-byte base64 secret (good for PAYLOAD_SECRET, CRON_SECRET)
openssl rand -base64 32

# Generate a URL-safe password
openssl rand -base64 24 | tr '+/' '-_'

# Generate a hex secret
openssl rand -hex 32
```
