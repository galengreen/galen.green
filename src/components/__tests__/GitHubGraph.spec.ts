import { describe, expect, it } from 'vitest'
import { mount } from '@vue/test-utils'
import GitHubGraph from '../ui/GitHubGraph.vue'

describe('GitHubGraph', () => {
  it('renders normally with valid contribution data', () => {
    const wrapper = mount(GitHubGraph, {
      props: {
        contributionGraph: [{ contributionDays: [{ date: '2026-03-26', contributionCount: 4 }] }],
        totalContributions: 4,
      },
    })

    expect(wrapper.text()).toContain('GitHub Activity')
    expect(wrapper.findAll('.contribution-day').length).toBeGreaterThan(0)
  })

  it('does not crash when contributionGraph is malformed', () => {
    expect(() =>
      mount(GitHubGraph, {
        props: {
          contributionGraph: null as unknown as [],
          totalContributions: 0,
        },
      }),
    ).not.toThrow()
  })
})
