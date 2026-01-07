import type { GlobalConfig } from 'payload'

export const GitHubStats: GlobalConfig = {
  slug: 'github-stats',
  label: 'GitHub Stats',
  admin: {
    description: 'Cached GitHub contribution data (auto-updated daily)',
  },
  access: {
    read: () => true,
  },
  fields: [
    {
      name: 'username',
      type: 'text',
      defaultValue: 'galengreen',
      admin: {
        description: 'Your GitHub username',
      },
    },
    {
      name: 'contributionGraph',
      type: 'json',
      admin: {
        description: 'Contribution data for the graph (auto-populated)',
      },
    },
    {
      name: 'currentStreak',
      type: 'number',
      admin: {
        description: 'Current consecutive days with contributions',
      },
    },
    {
      name: 'longestStreak',
      type: 'number',
      admin: {
        description: 'Longest streak of consecutive contribution days',
      },
    },
    {
      name: 'totalContributions',
      type: 'number',
      admin: {
        description: 'Total contributions in the last year',
      },
    },
    {
      name: 'lastUpdated',
      type: 'date',
      admin: {
        description: 'When this data was last fetched from GitHub',
      },
    },
  ],
}
