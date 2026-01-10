import { NextResponse } from 'next/server'
import { getPayload } from 'payload'
import config from '@payload-config'

// CORS headers for development
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
}

// Handle preflight requests
export async function OPTIONS() {
  return NextResponse.json({}, { headers: corsHeaders })
}

interface ContributionDay {
  date: string
  contributionCount: number
}

interface ContributionWeek {
  contributionDays: ContributionDay[]
}

interface GitHubContributionData {
  totalContributions: number
  weeks: ContributionWeek[]
}

async function fetchGitHubContributions(
  username: string,
  token?: string,
): Promise<GitHubContributionData | null> {
  const query = `
    query($username: String!) {
      user(login: $username) {
        contributionsCollection {
          contributionCalendar {
            totalContributions
            weeks {
              contributionDays {
                date
                contributionCount
              }
            }
          }
        }
      }
    }
  `

  try {
    const response = await fetch('https://api.github.com/graphql', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token || process.env.GITHUB_TOKEN}`,
      },
      body: JSON.stringify({ query, variables: { username } }),
    })

    if (!response.ok) {
      console.error('GitHub API error:', response.status)
      return null
    }

    const data = await response.json()
    const calendar = data?.data?.user?.contributionsCollection?.contributionCalendar

    if (!calendar) {
      console.error('No contribution data found')
      return null
    }

    return {
      totalContributions: calendar.totalContributions,
      weeks: calendar.weeks,
    }
  } catch (error) {
    console.error('Failed to fetch GitHub contributions:', error)
    return null
  }
}

function calculateStreaks(weeks: ContributionWeek[]): { current: number; longest: number } {
  const allDays = weeks
    .flatMap((week) => week.contributionDays)
    .sort((a, b) => a.date.localeCompare(b.date))

  let currentStreak = 0
  let longestStreak = 0
  let tempStreak = 0

  const today = new Date().toISOString().split('T')[0]

  for (let i = allDays.length - 1; i >= 0; i--) {
    const day = allDays[i]

    if (day.contributionCount > 0) {
      tempStreak++
      if (i === allDays.length - 1 || day.date === today) {
        currentStreak = tempStreak
      }
    } else {
      if (tempStreak > longestStreak) {
        longestStreak = tempStreak
      }
      tempStreak = 0
      if (currentStreak === 0 && day.date !== today) {
        // Still counting current streak
      } else if (currentStreak > 0) {
        break // Current streak ended
      }
    }
  }

  if (tempStreak > longestStreak) {
    longestStreak = tempStreak
  }

  return { current: currentStreak, longest: longestStreak }
}

// GET: Retrieve cached stats
export async function GET() {
  try {
    const payload = await getPayload({ config })
    const stats = await payload.findGlobal({ slug: 'github-stats' })

    return NextResponse.json(stats, { headers: corsHeaders })
  } catch (error) {
    console.error('Failed to get GitHub stats:', error)
    return NextResponse.json(
      { error: 'Failed to retrieve stats' },
      { status: 500, headers: corsHeaders },
    )
  }
}

// POST: Refresh stats from GitHub (can be called by cron job)
export async function POST(request: Request) {
  try {
    // Optional: Add a secret key check for the cron job
    const authHeader = request.headers.get('authorization')
    const cronSecret = process.env.CRON_SECRET

    if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401, headers: corsHeaders })
    }

    const payload = await getPayload({ config })
    const currentStats = await payload.findGlobal({ slug: 'github-stats' })
    const username = currentStats.username

    if (!username) {
      return NextResponse.json(
        { error: 'GitHub username not configured in CMS' },
        { status: 400, headers: corsHeaders },
      )
    }

    const contributions = await fetchGitHubContributions(username)

    if (!contributions) {
      return NextResponse.json(
        { error: 'Failed to fetch from GitHub' },
        { status: 502, headers: corsHeaders },
      )
    }

    const streaks = calculateStreaks(contributions.weeks)

    const updatedStats = await payload.updateGlobal({
      slug: 'github-stats',
      data: {
        contributionGraph: contributions.weeks,
        totalContributions: contributions.totalContributions,
        currentStreak: streaks.current,
        longestStreak: streaks.longest,
        lastUpdated: new Date().toISOString(),
      },
    })

    return NextResponse.json(updatedStats, { headers: corsHeaders })
  } catch (error) {
    console.error('Failed to update GitHub stats:', error)
    return NextResponse.json(
      { error: 'Failed to update stats' },
      { status: 500, headers: corsHeaders },
    )
  }
}
