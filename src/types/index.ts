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
    thumbnail?: MediaSize
    medium?: MediaSize
    large?: MediaSize
  }
}

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
