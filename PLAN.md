# Galen Green – Personal Website Plan

> A single-page portfolio website showcasing software engineering and photography, powered by Payload CMS and Vue 3.

---

## Table of Contents

1. [Overview](#overview)
2. [Design System](#design-system)
3. [Site Structure](#site-structure)
4. [Section Specifications](#section-specifications)
5. [Technical Architecture](#technical-architecture)
6. [Payload CMS Schema](#payload-cms-schema)
7. [Vue Project Structure](#vue-project-structure)
8. [Performance Strategy](#performance-strategy)
9. [Development Phases](#development-phases)
10. [Configuration & Credentials](#configuration--credentials)

---

## Overview

### Project Summary

| Attribute    | Value                                                       |
| ------------ | ----------------------------------------------------------- |
| **Owner**    | Galen Green                                                 |
| **Purpose**  | Personal portfolio & blog                                   |
| **Domain**   | galen.green                                                 |
| **Audience** | Potential employers, collaborators, photography enthusiasts |

### Core Features

- Hero section with photo and name
- About section
- Projects showcase (2-column grid, expandable)
- Blog with markdown posts
- Photography masonry gallery
- GitHub contribution graph and stats (auto-updating)
- Contact form
- Dark mode support

### Tech Stack

| Layer             | Technology                          |
| ----------------- | ----------------------------------- |
| **Frontend**      | Vue 3 (Composition API, TypeScript) |
| **Build**         | Vite + vite-ssg                     |
| **Styling**       | Vanilla CSS (no Tailwind)           |
| **UI Components** | PrimeVue (selective usage)          |
| **CMS**           | Payload CMS 3.x                     |
| **Database**      | MongoDB                             |
| **Hosting**       | TrueNAS (Docker)                    |
| **Proxy**         | Nginx + Cloudflare Tunnel           |

---

## Design System

### Colour Palette

```css
/* Light Mode */
--color-border: #000000;
--color-background: #ffffff;
--color-text: #111111;
--color-text-muted: #666666;

/* Dark Mode */
--color-border: #000000;
--color-background: #0a0a0a;
--color-text: #f5f5f5;
--color-text-muted: #999999;

/* Shared */
--color-accent: #ffffff;
```

### Typography

- **Font Family**: System sans-serif stack or Inter
- **Headings**: Bold, clean, generous spacing
- **Body**: Regular weight, comfortable line-height (~1.6)
- **Code**: Monospace for technical content

### Viewport Frame

A distinctive black border frames the entire viewport with rounded inner corners.

```
┌────────────────────────────────────────────────────────┐
│ ██████████████████████████████████████████████████████ │
│ ██┌────────────────────────────────────────────────┐██ │
│ ██│                                                │██ │
│ ██│              Scrollable Content                │██ │
│ ██│                                                │██ │
│ ██└────────────────────────────────────────────────┘██ │
│ ██████████████████████████████████████████████████████ │
└────────────────────────────────────────────────────────┘
```

| Property     | Value                   |
| ------------ | ----------------------- |
| Border width | ~20px (adjustable)      |
| Inner radius | ~24-32px                |
| Mobile       | Reduced or hidden (TBD) |

### Interactions

| Element      | Hover Effect                      |
| ------------ | --------------------------------- |
| Cards/Images | Scale 1.02-1.03x, shadow increase |
| Links/Text   | Opacity reduction or darkening    |
| Buttons      | Scale + shadow shift              |
| Nav items    | Underline animation or opacity    |

### Animations

| Animation       | Trigger          | Duration        |
| --------------- | ---------------- | --------------- |
| Fade-in-up      | Scroll into view | 300ms ease-out  |
| Expand/collapse | Click            | 250ms ease-out  |
| Hero elements   | Page load        | 400ms staggered |

---

## Site Structure

### Routes

| Route         | Description           |
| ------------- | --------------------- |
| `/`           | Main single-page site |
| `/blog/:slug` | Individual blog post  |

### Section Order

1. **Navbar** – Fixed notch-style navigation
2. **Hero** – Photo + name
3. **About** – Brief bio
4. **Projects** – Software work
5. **Blog** – Recent posts
6. **Photography** – Gallery
7. **Contact** – Form
8. **Footer** – Socials, copyright

---

## Section Specifications

### Navbar

- **Style**: Pill/notch shape, centred at top
- **Position**: Fixed, always visible
- **Background**: Solid black
- **Contents**: Section links + dark mode toggle
- **Dark mode toggle**: Sun/moon icon, defaults to system preference

```
       ┌──────────────────────────────────────────────┐
       │  About  Projects  Blog  Photos  Contact   ◐  │
       └──────────────────────────────────────────────┘
```

### Hero

- **Layout**: Large photo + name on opposite side
- **Name**: "Galen Green" in large, minimal typography
- **Subtitle**: "Software Engineer & Photographer" (optional)
- **Animation**: Fade-in on load

```
┌────────────────────────────────────────────────┐
│                                                │
│    ┌──────────┐                                │
│    │          │           GALEN                │
│    │  Photo   │           GREEN                │
│    │          │                                │
│    └──────────┘           Software Engineer    │
│                           & Photographer       │
│                                                │
└────────────────────────────────────────────────┘
```

### About

- **Content**: 2-3 paragraphs
- **Source**: Payload CMS global
- **Width**: Constrained for readability (~65ch)

### Projects

- **Layout**: 2-column responsive grid
- **Card (collapsed)**:
  - Thumbnail image
  - Title
  - Brief description (1-2 lines)
  - Tech stack badges
- **Card (expanded)**:
  - Image carousel (arrows + dots)
  - Full description
  - Live link button
  - GitHub link button
- **Behaviour**: Accordion (one expanded at a time)
- **Animation**: Smooth height transition

```
Collapsed:
┌─────────────────┐  ┌─────────────────┐
│ [Thumbnail]     │  │ [Thumbnail]     │
│ Project Title   │  │ Project Title   │
│ Brief desc...   │  │ Brief desc...   │
│ [Vue] [TS]      │  │ [React] [Node]  │
└─────────────────┘  └─────────────────┘

Expanded:
┌───────────────────────────────────────┐
│  ◄  [   Image Carousel   ]  ►         │
│        ● ○ ○ ○                        │
│                                       │
│  Project Title                        │
│  Full description text here...        │
│                                       │
│  [View Live]  [View Source]           │
└───────────────────────────────────────┘
```

### Blog

- **Layout**: Vertical list
- **Each item**: Title, date, excerpt
- **Sorted**: Newest first
- **Click action**: Navigate to `/blog/:slug`
- **Post page**: Full markdown content, back link

### Photography

- **Layout**: 3-column masonry
- **Ordering**: Left-to-right, top-to-bottom (newest first)
- **Implementation**: JavaScript-based for correct ordering
- **Images**: Lazy-loaded with blur placeholder
- **Click action**: Inline expansion below image
- **Expanded state**: Larger view + description text
- **Behaviour**: One expanded at a time

```
Row 1:  [Photo 1] [Photo 2] [Photo 3]
Row 2:  [Photo 4] [Photo 5] [Photo 6]
        ...newest at top...
```

### Contact

- **Fields**: Name, Email, Message
- **Submission**: POST to Payload API
- **Storage**: Payload ContactSubmissions collection
- **Notification**: Email to dev@galen.green
- **Validation**: Client + server-side
- **Security**: Rate limiting, honeypot, CSRF

### Footer

- **Contents**: Social icons, email, copyright
- **Style**: Minimal, centred

---

## Technical Architecture

### System Diagram

```
                          Internet
                              │
                     Cloudflare Tunnel
                              │
                      ┌───────┴───────┐
                      │     Nginx     │
                      │ (reverse proxy)│
                      └───────┬───────┘
                              │
            ┌─────────────────┼─────────────────┐
            │                 │                 │
            ▼                 ▼                 ▼
     ┌───────────┐    ┌─────────────┐   ┌─────────────┐
     │  Static   │    │  Payload    │   │  Payload    │
     │   Files   │    │    API      │   │   Admin     │
     │           │    │  /api/*     │   │   /admin    │
     │ galen.green    │             │   │             │
     └───────────┘    └──────┬──────┘   └─────────────┘
                             │
                      ┌──────┴──────┐
                      │   MongoDB   │
                      └──────┬──────┘
                             │
                      ┌──────┴──────┐
                      │   Media     │
                      │  (local)    │
                      └─────────────┘
```

### Data Flow

1. **Build**: Vite SSG fetches content from Payload → generates static HTML
2. **Deploy**: Static files served by Nginx
3. **Content update**: Payload webhook → triggers rebuild → deploy
4. **Contact form**: Client POST → Payload API → DB + email
5. **GitHub stats**: Payload cron (daily) → GitHub API → cache in DB

### GitHub Stats Integration

- **Endpoint**: Custom Payload endpoint `/api/github-stats`
- **Data fetched**:
  - Contribution graph (last year)
  - Current streak
  - Total contributions
  - Last updated timestamp
- **Update frequency**: Daily via cron job
- **Caching**: Stored in Payload global, served from cache

---

## Payload CMS Schema

### Collections

#### Photos

```typescript
{
  slug: 'photos',
  fields: [
    { name: 'image', type: 'upload', relationTo: 'media', required: true },
    { name: 'title', type: 'text', required: true },
    { name: 'description', type: 'textarea' },
    { name: 'date', type: 'date', required: true },
    { name: 'featured', type: 'checkbox', defaultValue: false },
  ],
  defaultSort: '-date',
}
```

#### Projects

```typescript
{
  slug: 'projects',
  fields: [
    { name: 'title', type: 'text', required: true },
    { name: 'slug', type: 'text', required: true, unique: true },
    { name: 'description', type: 'richText', required: true },
    { name: 'images', type: 'array', fields: [
      { name: 'image', type: 'upload', relationTo: 'media' },
    ]},
    { name: 'techStack', type: 'array', fields: [
      { name: 'tech', type: 'text' },
    ]},
    { name: 'liveUrl', type: 'text' },
    { name: 'githubUrl', type: 'text' },
    { name: 'featured', type: 'checkbox', defaultValue: false },
    { name: 'date', type: 'date', required: true },
  ],
  defaultSort: '-date',
}
```

#### Blog Posts

```typescript
{
  slug: 'blog-posts',
  fields: [
    { name: 'title', type: 'text', required: true },
    { name: 'slug', type: 'text', required: true, unique: true },
    { name: 'content', type: 'richText', required: true }, // or markdown field
    { name: 'excerpt', type: 'textarea' },
    { name: 'date', type: 'date', required: true },
    { name: 'published', type: 'checkbox', defaultValue: false },
  ],
  defaultSort: '-date',
}
```

#### Contact Submissions

```typescript
{
  slug: 'contact-submissions',
  fields: [
    { name: 'name', type: 'text', required: true },
    { name: 'email', type: 'email', required: true },
    { name: 'message', type: 'textarea', required: true },
  ],
  hooks: {
    afterChange: [sendEmailNotification],
  },
}
```

### Globals

#### About

```typescript
{
  slug: 'about',
  fields: [
    { name: 'content', type: 'richText', required: true },
  ],
}
```

#### GitHub Stats

```typescript
{
  slug: 'github-stats',
  fields: [
    { name: 'contributionGraph', type: 'json' },
    { name: 'currentStreak', type: 'number' },
    { name: 'longestStreak', type: 'number' },
    { name: 'totalContributions', type: 'number' },
    { name: 'lastUpdated', type: 'date' },
  ],
}
```

### Media Collection

```typescript
{
  slug: 'media',
  upload: {
    staticDir: '../media',
    imageSizes: [
      { name: 'thumbnail', width: 400, height: undefined },
      { name: 'medium', width: 800, height: undefined },
      { name: 'large', width: 1400, height: undefined },
    ],
  },
}
```

---

## Vue Project Structure

```
src/
├── assets/
│   └── styles/
│       ├── variables.css       # CSS custom properties
│       ├── reset.css           # CSS reset
│       ├── global.css          # Global styles
│       └── transitions.css     # Animation classes
│
├── components/
│   ├── layout/
│   │   ├── ViewportFrame.vue   # Black border frame
│   │   ├── NavBar.vue          # Notch navigation
│   │   └── FooterSection.vue
│   │
│   ├── sections/
│   │   ├── HeroSection.vue
│   │   ├── AboutSection.vue
│   │   ├── ProjectsSection.vue
│   │   ├── BlogSection.vue
│   │   ├── PhotosSection.vue
│   │   └── ContactSection.vue
│   │
│   └── ui/
│       ├── ProjectCard.vue
│       ├── PhotoCard.vue
│       ├── BlogPostItem.vue
│       ├── TechBadge.vue
│       ├── ImageCarousel.vue   # Wraps PrimeVue Galleria
│       ├── LazyImage.vue       # Blur placeholder + lazy load
│       ├── GitHubGraph.vue
│       └── SocialIcons.vue
│
├── composables/
│   ├── useScrollAnimation.ts   # Intersection Observer fade-in
│   ├── useTheme.ts             # Dark mode toggle
│   ├── useAccordion.ts         # Single-expand logic
│   └── useMasonry.ts           # Photo grid positioning
│
├── services/
│   └── payload.ts              # API client
│
├── types/
│   └── index.ts                # TypeScript interfaces
│
├── views/
│   ├── HomeView.vue            # Main single-page
│   └── BlogPostView.vue        # Individual post
│
├── router/
│   └── index.ts
│
├── App.vue
└── main.ts
```

### Key Components

#### ViewportFrame.vue

Wraps entire app content with the black border effect.

#### NavBar.vue

Fixed notch navigation with section links and theme toggle.

#### LazyImage.vue

Handles:

- Blur placeholder (low-res base64)
- Intersection Observer for lazy loading
- Fade transition on load

#### useMasonry.ts

Calculates photo positions for left-to-right, top-to-bottom ordering while maintaining masonry layout.

---

## Performance Strategy

| Technique             | Implementation                           |
| --------------------- | ---------------------------------------- |
| **SSG**               | Pre-render all pages at build time       |
| **Lazy loading**      | Images load on scroll into viewport      |
| **Blur placeholders** | Inline base64 thumbnails, swap on load   |
| **Image sizes**       | Payload generates thumbnail/medium/large |
| **Code splitting**    | Dynamic import for blog post pages       |
| **Minimal JS**        | CSS animations where possible            |
| **Font optimisation** | System fonts or `font-display: swap`     |

---

## Development Phases

### Phase 1: Infrastructure ✅

- [x] Initialise Payload CMS project
- [x] Configure MongoDB connection
- [x] Create all collections and globals
- [x] Set up media uploads with image sizes
- [x] Configure admin panel
- [x] Create GitHub stats API endpoint

### Phase 2: Vue Foundation ✅

- [x] Set up Vue 3 + TypeScript + Vite SSG
- [x] Configure PrimeVue (unstyled mode with custom preset)
- [x] Create CSS design system (variables, reset, global, transitions)
- [x] Build ViewportFrame component
- [x] Build NavBar component (notch-style with theme toggle)
- [x] Implement dark mode toggle (system/light/dark)
- [x] Set up Payload API client

### Phase 3: Core Sections ✅

- [x] Hero section (photo + name layout)
- [x] About section (with GitHub stats integration)
- [x] Projects section with accordion expansion
- [x] Image carousel component (PrimeVue Galleria)
- [x] Tech badges

### Phase 4: Blog ✅

- [x] Blog list section
- [x] Blog post page with rich text rendering
- [x] Lexical/rich text rendering (RichText component)
- [x] Routing (`/blog/:slug`)

### Phase 5: Photography ✅

- [x] Masonry layout with correct left-to-right ordering
- [x] Lazy loading + blur placeholders (LazyImage component)
- [x] Inline expansion

### Phase 6: Contact & GitHub ✅

- [x] Contact form (with validation)
- [x] Payload submission handling
- [ ] Email notifications (requires SMTP config)
- [x] GitHub stats API endpoint (in CMS)
- [x] GitHub graph component

### Phase 7: Polish ✅

- [x] Scroll animations (Intersection Observer fade-in)
- [x] All hover effects
- [x] Footer with social icons
- [x] Mobile responsiveness
- [x] Border behaviour on mobile (reduced frame width/radius)

### Phase 8: Deployment 🔄

- [x] Docker configuration (docker-compose.yml, Dockerfile)
- [x] Nginx setup (reverse proxy config)
- [ ] Cloudflare Tunnel configuration
- [ ] Webhook for rebuilds
- [ ] Final testing

---

## Configuration & Credentials

### Social Links

| Platform  | URL                                          |
| --------- | -------------------------------------------- |
| GitHub    | https://github.com/galengreen/               |
| LinkedIn  | https://www.linkedin.com/in/galen-green-dev/ |
| Instagram | https://www.instagram.com/galengreen.space/  |
| Email     | dev@galen.green                              |

### GitHub API

- **Username**: galengreen
- **Required**: Personal access token for higher rate limits (optional but recommended)

### Domain

- **Domain**: galen.green
- **Status**: Owned, to be configured

---

## Notes

- PrimeVue components to use: `Button`, `InputText`, `Textarea`, `Galleria`, `Image`, `Tag`
- All PrimeVue styling will be overridden to match design system
- Mobile viewport border behaviour to be determined during development
- Favicon and Open Graph meta to be added when branding is finalised
