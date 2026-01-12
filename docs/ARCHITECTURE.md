# System Architecture

This document describes the architecture of the galen.green hosting infrastructure.

## High-Level Overview

```mermaid
flowchart TB
    subgraph Internet
        User[User Browser]
        CF[Cloudflare Tunnel]
    end
    
    subgraph TrueNAS["TrueNAS Scale Host"]
        subgraph Apps["TrueNAS Apps (Custom Apps)"]
            FE["galen-frontend<br/>nginx:alpine<br/>Host :8081 → :80"]
            CMS["galen-cms<br/>Node.js<br/>Host :3000 → :3000"]
            DB[("MongoDB<br/>Host :27017 → :27017")]
        end
        
        subgraph Storage["ZFS Datasets"]
            MediaPath["/mnt/GreenVault/galen.green/media"]
            DBPath["/mnt/GreenVault/galen.green/mongodb"]
        end
    end
    
    User --> CF
    CF --> FE
    FE -->|"172.16.0.1:3000"| CMS
    CMS -->|"172.16.0.1:27017"| DB
    CMS -.-> MediaPath
    DB -.-> DBPath
```

## Deployment Model

The production environment uses **TrueNAS Scale Apps UI** (Custom Apps), not Docker Compose. Each container runs as an independent app:

| App Name         | Image                                    | Host Port | Container Port |
| ---------------- | ---------------------------------------- | --------- | -------------- |
| `galen-frontend` | `ghcr.io/galengreen/galen-frontend:latest` | 8081      | 80             |
| `galen-cms`      | `ghcr.io/galengreen/galen-cms:latest`      | 3000      | 3000           |
| `mongodb`        | `mongo:7` (or TrueNAS MongoDB app)         | 27017     | 27017          |

**Inter-container communication** uses the host gateway IP `172.16.0.1` rather than Docker DNS, since TrueNAS Apps run on isolated networks.

## Request Flow

```mermaid
sequenceDiagram
    participant U as User
    participant CF as Cloudflare Tunnel
    participant N as Nginx (8081)
    participant P as Payload CMS (3000)
    participant M as MongoDB (27017)

    U->>CF: HTTPS Request
    CF->>N: HTTP (via tunnel to :8081)
    
    alt Static Asset (/, /assets/*)
        N->>U: Serve from /usr/share/nginx/html
    else API Request (/api/*)
        N->>P: Proxy to 172.16.0.1:3000
        P->>M: Database Query
        M->>P: Result
        P->>N: JSON Response
        N->>U: API Response
    else Admin Panel (/admin)
        N->>P: Proxy to 172.16.0.1:3000
        P->>N: Next.js Page
        N->>U: Admin UI
    else Media (/media/*)
        N->>P: Proxy to 172.16.0.1:3000
        P->>N: Image/File
        N->>U: Cached Media
    end
```

## CI/CD Pipeline

```mermaid
flowchart LR
    subgraph GitHub
        Push[Push to main]
        CI[CI Workflow]
        Deploy[Deploy Workflow]
        GHCR[Container Registry]
    end
    
    subgraph TrueNAS["TrueNAS Scale"]
        Apps[Apps UI]
    end
    
    Push --> CI
    CI -->|Tests Pass| Deploy
    Deploy -->|Build & Push| GHCR
    Apps -->|Pull Policy: Always| GHCR
```

**Note**: TrueNAS Apps with "Always pull" policy will fetch the latest image on container restart. There's no Watchtower - you manually restart apps or use TrueNAS scheduled tasks.

## Component Details

### Frontend Container (`galen-frontend`)

```mermaid
flowchart TB
    subgraph Frontend["galen-frontend app"]
        Nginx[Nginx Server<br/>Port 80]
        
        subgraph Static["Static Files"]
            HTML[index.html]
            JS[*.js bundles]
            CSS[*.css files]
            Assets[images, fonts]
        end
        
        subgraph Proxy["Reverse Proxy Rules"]
            API["/api/* → 172.16.0.1:3000"]
            Admin["/admin → 172.16.0.1:3000"]
            Next["/_next/* → 172.16.0.1:3000"]
            Media["/media/* → 172.16.0.1:3000"]
        end
    end
    
    Nginx --> Static
    Nginx --> Proxy
```

**Configuration**:
- Image: `ghcr.io/galengreen/galen-frontend:latest`
- Pull Policy: Always
- Host Port: 8081 → Container Port: 80
- Timezone: Pacific/Auckland
- Restart Policy: No (managed by TrueNAS)
- Resource Limits: 2 CPUs, 4096 MB RAM

**Build Process (Dockerfile)**:
1. Stage 1 (`node:22-alpine`): Install deps, run `npm run build`
2. Stage 2 (`nginx:alpine`): Copy built assets + nginx config

### CMS Container (`galen-cms`)

```mermaid
flowchart TB
    subgraph CMS["galen-cms app"]
        Node[Node.js Server<br/>Port 3000]
        
        subgraph Payload["Payload CMS"]
            Collections[Collections<br/>BlogPosts, Projects, Photos]
            Globals[Globals<br/>SiteSettings, About]
            API[REST API]
            AdminUI[Admin UI]
        end
        
        subgraph NextJS["Next.js"]
            SSR[Server-Side Rendering]
            Static[Static Assets]
        end
        
        MediaDir["/app/media"]
    end
    
    Node --> Payload
    Node --> NextJS
    Payload --> MediaDir
```

**Configuration**:
- Image: `ghcr.io/galengreen/galen-cms:latest`
- Pull Policy: Always
- Host Port: 3000 → Container Port: 3000
- Timezone: Pacific/Auckland
- Restart Policy: Unless Stopped
- Resource Limits: 2 CPUs, 4096 MB RAM
- Storage: Host path `/mnt/GreenVault/galen.green/media` → `/app/media`

**Build Process (cms/Dockerfile)**:
1. Stage 1 (`node:22-alpine`): Install deps, generate importmap, build Next.js standalone
2. Stage 2 (`node:22-alpine`): Copy standalone output, run as non-root user

### Database (MongoDB)

```mermaid
flowchart TB
    subgraph MongoDB["MongoDB App"]
        Mongo[MongoDB 7<br/>Port 27017]
        
        subgraph Auth["Authentication"]
            User["User: galengreen"]
            AppDB["Database: galen-green"]
        end
        
        DataDir["/data/db"]
    end
    
    Mongo --> Auth
    Mongo --> DataDir
```

**Connection String Format**:
```
mongodb://galengreen:<password>@172.16.0.1:27017/galen-green?authSource=admin
```

## Network Architecture

```mermaid
flowchart TB
    subgraph TrueNAS["TrueNAS Scale Host"]
        Gateway["Host Gateway<br/>172.16.0.1"]
        
        subgraph FE_Net["Frontend Network"]
            FE["galen-frontend<br/>:8081 → :80"]
        end
        
        subgraph CMS_Net["CMS Network"]
            CMS["galen-cms<br/>:3000 → :3000"]
        end
        
        subgraph DB_Net["MongoDB Network"]
            DB["mongodb<br/>:27017 → :27017"]
        end
    end
    
    subgraph External["External Access"]
        CF[Cloudflare Tunnel]
    end
    
    CF --> FE
    FE -->|"172.16.0.1:3000"| Gateway
    Gateway --> CMS
    CMS -->|"172.16.0.1:27017"| Gateway
    Gateway --> DB
```

**Key Points**:
- Each TrueNAS app runs in its own isolated network
- Containers cannot resolve each other by hostname
- All inter-app communication uses `172.16.0.1` (host gateway)
- Ports must be published to the host for apps to communicate

## Nginx Routing

```mermaid
flowchart TD
    Request[Incoming Request]
    
    Request --> PathCheck{Check Path}
    
    PathCheck -->|/api/contact-submissions| RateLimit[Rate Limit<br/>5 req/min]
    RateLimit --> CMSProxy
    
    PathCheck -->|/api/*| CMSProxy["Proxy to 172.16.0.1:3000"]
    PathCheck -->|/admin| CMSProxy
    PathCheck -->|/_next/*| CMSProxy
    PathCheck -->|/media/*| MediaProxy[Proxy + 1 day Cache]
    MediaProxy --> CMSProxy
    
    PathCheck -->|/health| Health[Return 200 OK]
    PathCheck -->|/*| TryFiles{try_files}
    
    TryFiles -->|File exists| ServeStatic[Serve Static File]
    TryFiles -->|File not found| SPA[Serve index.html]
```

## Storage Persistence

| App              | Mount Path     | Host Path                              | Purpose                   |
| ---------------- | -------------- | -------------------------------------- | ------------------------- |
| `galen-cms`      | `/app/media`   | `/mnt/GreenVault/galen.green/media`    | Uploaded images and files |
| `mongodb`        | `/data/db`     | `/mnt/GreenVault/galen.green/mongodb`  | Database files            |

Both paths are on ZFS datasets, providing:
- Automatic snapshots (if configured)
- Data integrity via checksums
- Easy backup/restore
