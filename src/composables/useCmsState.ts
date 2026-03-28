import { inject, type InjectionKey } from 'vue'
import type { About, BlogPost, GitHubStats, Photo, Project, SiteSettings } from '@/types'

export interface HomeContentState {
  about: About | null
  projects: Project[]
  blogPosts: BlogPost[]
  photos: Photo[]
  githubStats: GitHubStats | null
  error: string | null
}

export interface CmsState {
  siteSettings: SiteSettings | null
  homeContent: HomeContentState | null
}

export const cmsStateKey: InjectionKey<CmsState> = Symbol('cms-state')

export const createCmsState = (value?: Partial<CmsState>): CmsState => ({
  siteSettings: value?.siteSettings ?? null,
  homeContent: value?.homeContent ?? null,
})

export const useCmsState = () => inject(cmsStateKey, createCmsState())
