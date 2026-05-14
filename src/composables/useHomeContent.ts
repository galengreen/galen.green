import { onMounted, onServerPrefetch, ref } from 'vue'
import { useCmsState, type HomeContentState } from '@/composables/useCmsState'
import { api } from '@/services/payload'
import type { About, BlogPost, GitHubStats, Photo, Project } from '@/types'

const DEFAULT_ERROR_MESSAGE = 'Failed to load content. Please try again later.'
const PARTIAL_ERROR_MESSAGE = 'Some content is temporarily unavailable. Please try again later.'

export function useHomeContent() {
  const cmsState = useCmsState()
  const initialContent = cmsState.homeContent
  const shouldRetryFromInitialState = Boolean(initialContent?.error)
  const hasUsableInitialContent = initialContent !== null && !shouldRetryFromInitialState

  const about = ref<About | null>(initialContent?.about ?? null)
  const projects = ref<Project[]>(initialContent?.projects ?? [])
  const blogPosts = ref<BlogPost[]>(initialContent?.blogPosts ?? [])
  const photos = ref<Photo[]>(initialContent?.photos ?? [])
  const githubStats = ref<GitHubStats | null>(initialContent?.githubStats ?? null)
  const error = ref<string | null>(initialContent?.error ?? null)
  const hasLoaded = ref(hasUsableInitialContent)

  const loading = ref({
    about: initialContent === null,
    projects: initialContent === null,
    blog: initialContent === null,
    photos: initialContent === null,
    github: initialContent === null,
  })

  let request: Promise<void> | null = null

  async function loadContent(force = false): Promise<void> {
    if (hasLoaded.value && !force) {
      return
    }

    if (request) {
      return request
    }

    request = (async () => {
      try {
        const [aboutData, projectsData, blogData, photosData, githubData] =
          await Promise.allSettled([
            api.globals.getAbout(),
            api.projects.getFeatured(),
            api.blogPosts.getRecent(5),
            api.photos.getAll(30),
            api.github.getStats(),
          ])

        if (aboutData.status === 'fulfilled') {
          about.value = aboutData.value
        }
        loading.value.about = false

        if (projectsData.status === 'fulfilled') {
          projects.value = projectsData.value
        }
        loading.value.projects = false

        if (blogData.status === 'fulfilled') {
          blogPosts.value = blogData.value
        }
        loading.value.blog = false

        if (photosData.status === 'fulfilled') {
          photos.value = photosData.value
        }
        loading.value.photos = false

        if (githubData.status === 'fulfilled') {
          githubStats.value = githubData.value
        }
        loading.value.github = false

        const statuses = [aboutData, projectsData, blogData, photosData, githubData]
        const allFailed = statuses.every((result) => result.status === 'rejected')
        const anyFailed = statuses.some((result) => result.status === 'rejected')

        error.value = allFailed ? DEFAULT_ERROR_MESSAGE : anyFailed ? PARTIAL_ERROR_MESSAGE : null
      } catch (fetchError) {
        error.value = DEFAULT_ERROR_MESSAGE
        console.error('Failed to fetch data:', fetchError)
      } finally {
        hasLoaded.value = !error.value
        cmsState.homeContent = error.value
          ? null
          : ({
              about: about.value,
              projects: projects.value,
              blogPosts: blogPosts.value,
              photos: photos.value,
              githubStats: githubStats.value,
              error: error.value,
            } satisfies HomeContentState)
        request = null
      }
    })()

    return request
  }

  if (import.meta.env.SSR) {
    onServerPrefetch(loadContent)
  } else {
    onMounted(() => {
      void loadContent(hasUsableInitialContent || shouldRetryFromInitialState)
    })
  }

  return {
    about,
    projects,
    blogPosts,
    photos,
    githubStats,
    error,
    loading,
    loadContent,
  }
}
