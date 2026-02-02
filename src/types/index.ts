// Payload CMS Types
// These mirror the collections defined in the CMS

export interface Media {
  id: string
  alt: string
  url: string
  filename: string
  mimeType: string
  width: number
  height: number
  sizes: {
    // WebP responsive sizes
    xs?: MediaSize
    sm?: MediaSize
    md?: MediaSize
    lg?: MediaSize
    xl?: MediaSize
    xxl?: MediaSize
    // AVIF responsive sizes
    'xs-avif'?: MediaSize
    'sm-avif'?: MediaSize
    'md-avif'?: MediaSize
    'lg-avif'?: MediaSize
    'xl-avif'?: MediaSize
    'xxl-avif'?: MediaSize
    // Legacy sizes (for backwards compatibility)
    thumbnail?: MediaSize
    medium?: MediaSize
    large?: MediaSize
  }
}

// WebP size names (base sizes)
export type ImageSizeName =
  | 'xs'
  | 'sm'
  | 'md'
  | 'lg'
  | 'xl'
  | 'xxl'
  | 'thumbnail'
  | 'medium'
  | 'large'

// AVIF size names
export type ImageSizeNameAvif =
  | 'xs-avif'
  | 'sm-avif'
  | 'md-avif'
  | 'lg-avif'
  | 'xl-avif'
  | 'xxl-avif'

// All size names
export type AllImageSizeName = ImageSizeName | ImageSizeNameAvif

export interface MediaSize {
  url: string
  width: number
  height: number
}

export interface Photo {
  id: string
  title: string
  description?: string
  image: Media
  date: string
  featured: boolean
}

export interface ProjectImage {
  image: Media
  caption?: string
}

export interface Project {
  id: string
  title: string
  slug: string
  excerpt: string
  description: unknown // Rich text content
  images: ProjectImage[]
  techStack: { tech: string }[]
  liveUrl?: string
  githubUrl?: string
  date: string
  featured: boolean
}

export interface BlogPost {
  id: string
  title: string
  slug: string
  excerpt?: string
  content: unknown // Rich text content
  coverImage?: Media
  date: string
  published: boolean
}

export interface About {
  content: unknown // Rich text content
  photo?: Media
  subtitle?: string
}

export interface SocialLink {
  platform: 'github' | 'linkedin' | 'instagram' | 'twitter' | 'youtube' | 'email'
  url: string
}

export interface LoadingMessage {
  message: string
}

export interface SiteSettings {
  name: {
    first: string
    last: string
  }
  email: string
  heroBackground?: {
    light?: Media
    dark?: Media
  }
  heroForeground?: {
    light?: Media
    dark?: Media
  }
  socials: SocialLink[]
  seo?: {
    description?: string
    jobTitle?: string
    ogImage?: Media
  }
  sectionTitles: {
    about: string
    projects: string
    blog: string
    photos: string
    contact: string
  }
  loadingMessages?: LoadingMessage[]
}

export interface GitHubStats {
  username: string
  contributionGraph: ContributionWeek[]
  currentStreak: number
  longestStreak: number
  totalContributions: number
  lastUpdated: string
}

export interface ContributionWeek {
  contributionDays: ContributionDay[]
}

export interface ContributionDay {
  date: string
  contributionCount: number
}

// API Response types
export interface PaginatedResponse<T> {
  docs: T[]
  totalDocs: number
  limit: number
  totalPages: number
  page: number
  pagingCounter: number
  hasPrevPage: boolean
  hasNextPage: boolean
  prevPage: number | null
  nextPage: number | null
}
