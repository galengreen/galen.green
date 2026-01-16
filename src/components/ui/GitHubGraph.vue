<script setup lang="ts">
import { computed, ref } from 'vue'
import type { ContributionWeek } from '@/types'

const props = defineProps<{
  contributionGraph: ContributionWeek[]
  totalContributions: number
  currentStreak: number
  longestStreak: number
}>()

// Constants
const SQUARE_SIZE = 11
const SQUARE_GAP = 3
const SQUARE_RADIUS = 2
const DAYS_IN_WEEK = 7
const LEFT_LABEL_WIDTH = 32
const TOP_LABEL_HEIGHT = 16
const LEGEND_HEIGHT = 24

// Tooltip state
const tooltipVisible = ref(false)
const tooltipContent = ref('')
const tooltipX = ref(0)
const tooltipY = ref(0)

// Month labels
const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

// Get the contribution level (0-4) based on count
const getContributionLevel = (count: number): number => {
  if (count === 0) return 0
  if (count <= 3) return 1
  if (count <= 6) return 2
  if (count <= 9) return 3
  return 4
}

// Format the weeks data for display
const displayWeeks = computed(() => {
  return props.contributionGraph.map((week) => ({
    days: week.contributionDays.map((day) => ({
      date: day.date,
      count: day.contributionCount,
      level: getContributionLevel(day.contributionCount),
    })),
  }))
})

// Calculate SVG dimensions
const weekCount = computed(() => displayWeeks.value.length)

const svgWidth = computed(() => {
  return LEFT_LABEL_WIDTH + weekCount.value * (SQUARE_SIZE + SQUARE_GAP)
})

const svgHeight = computed(() => {
  return TOP_LABEL_HEIGHT + DAYS_IN_WEEK * (SQUARE_SIZE + SQUARE_GAP) + LEGEND_HEIGHT
})

const viewBox = computed(() => `0 0 ${svgWidth.value} ${svgHeight.value}`)

// Get month labels with their positions
const monthLabels = computed(() => {
  const labels: { month: string; x: number }[] = []
  let lastMonth = -1

  displayWeeks.value.forEach((week, weekIndex) => {
    if (week.days.length > 0) {
      const firstDay = week.days[0]
      if (firstDay && firstDay.date) {
        const date = new Date(firstDay.date)
        const month = date.getMonth()
        if (month !== lastMonth && month >= 0 && month < 12) {
          labels.push({
            month: MONTHS[month] as string,
            x: LEFT_LABEL_WIDTH + weekIndex * (SQUARE_SIZE + SQUARE_GAP),
          })
          lastMonth = month
        }
      }
    }
  })

  return labels
})

// Day labels (show Mon, Wed, Fri)
const dayLabels = computed(() => {
  return [
    { day: DAYS[1], y: TOP_LABEL_HEIGHT + 1 * (SQUARE_SIZE + SQUARE_GAP) + SQUARE_SIZE / 2 + 3 },
    { day: DAYS[3], y: TOP_LABEL_HEIGHT + 3 * (SQUARE_SIZE + SQUARE_GAP) + SQUARE_SIZE / 2 + 3 },
    { day: DAYS[5], y: TOP_LABEL_HEIGHT + 5 * (SQUARE_SIZE + SQUARE_GAP) + SQUARE_SIZE / 2 + 3 },
  ]
})

// Format date for tooltip
const formatDateForTooltip = (dateString: string): string => {
  const date = new Date(dateString)
  const options: Intl.DateTimeFormatOptions = {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }
  return date.toLocaleDateString('en-NZ', options)
}

// Get contribution text
const getContributionText = (count: number): string => {
  if (count === 0) return 'No contributions'
  if (count === 1) return '1 contribution'
  return `${count} contributions`
}

// Handle tooltip events
const showTooltip = (event: MouseEvent, day: { date: string; count: number }) => {
  const rect = event.target as SVGRectElement
  const svgRect = rect.closest('svg')?.getBoundingClientRect()

  if (svgRect) {
    const rectBounds = rect.getBoundingClientRect()
    tooltipX.value = rectBounds.left - svgRect.left + SQUARE_SIZE / 2
    tooltipY.value = rectBounds.top - svgRect.top - 8
  }

  tooltipContent.value = `${getContributionText(day.count)} on ${formatDateForTooltip(day.date)}`
  tooltipVisible.value = true
}

const hideTooltip = () => {
  tooltipVisible.value = false
}

// Legend data
const legendLevels = [0, 1, 2, 3, 4]
const legendX = computed(() => svgWidth.value - 140)
const legendY = computed(() => TOP_LABEL_HEIGHT + DAYS_IN_WEEK * (SQUARE_SIZE + SQUARE_GAP) + 8)
</script>

<template>
  <div class="github-graph">
    <div class="graph-header">
      <span class="graph-title">GitHub Activity</span>
      <span class="graph-total">{{ totalContributions }} contributions in the last year</span>
    </div>

    <div class="graph-container">
      <svg :viewBox="viewBox" class="contribution-svg">
        <!-- Month labels -->
        <g class="month-labels">
          <text
            v-for="(label, index) in monthLabels"
            :key="index"
            :x="label.x"
            :y="12"
            class="month-label"
          >
            {{ label.month }}
          </text>
        </g>

        <!-- Day labels -->
        <g class="day-labels">
          <text v-for="label in dayLabels" :key="label.day" :x="0" :y="label.y" class="day-label">
            {{ label.day }}
          </text>
        </g>

        <!-- Contribution grid -->
        <g class="contribution-grid">
          <g
            v-for="(week, weekIndex) in displayWeeks"
            :key="weekIndex"
            :transform="`translate(${LEFT_LABEL_WIDTH + weekIndex * (SQUARE_SIZE + SQUARE_GAP)}, ${TOP_LABEL_HEIGHT})`"
          >
            <rect
              v-for="(day, dayIndex) in week.days"
              :key="day.date"
              :y="dayIndex * (SQUARE_SIZE + SQUARE_GAP)"
              :width="SQUARE_SIZE"
              :height="SQUARE_SIZE"
              :rx="SQUARE_RADIUS"
              :ry="SQUARE_RADIUS"
              :data-level="day.level"
              class="contribution-day"
              @mouseenter="showTooltip($event, day)"
              @mouseleave="hideTooltip"
            />
          </g>
        </g>

        <!-- Legend -->
        <g class="legend" :transform="`translate(${legendX}, ${legendY})`">
          <text x="0" y="10" class="legend-label">Less</text>
          <rect
            v-for="(level, index) in legendLevels"
            :key="level"
            :x="30 + index * (SQUARE_SIZE + 2)"
            :y="0"
            :width="SQUARE_SIZE"
            :height="SQUARE_SIZE"
            :rx="SQUARE_RADIUS"
            :ry="SQUARE_RADIUS"
            :data-level="level"
            class="contribution-day"
          />
          <text :x="30 + legendLevels.length * (SQUARE_SIZE + 2) + 4" y="10" class="legend-label">
            More
          </text>
        </g>

        <!-- Tooltip -->
        <g
          v-if="tooltipVisible"
          class="tooltip-group"
          :transform="`translate(${tooltipX}, ${tooltipY})`"
        >
          <rect
            :x="-tooltipContent.length * 3"
            y="-28"
            :width="tooltipContent.length * 6"
            height="22"
            rx="4"
            ry="4"
            class="tooltip-bg"
          />
          <text y="-12" text-anchor="middle" class="tooltip-text">
            {{ tooltipContent }}
          </text>
          <polygon points="-5,0 5,0 0,6" class="tooltip-arrow" />
        </g>
      </svg>
    </div>

    <div class="graph-stats">
      <div class="stat">
        <span class="stat-value">{{ currentStreak }}</span>
        <span class="stat-label">Current Streak</span>
      </div>
      <div class="stat">
        <span class="stat-value">{{ longestStreak }}</span>
        <span class="stat-label">Longest Streak</span>
      </div>
    </div>
  </div>
</template>

<style scoped>
.github-graph {
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);
  padding: var(--space-6);
  box-shadow: var(--shadow-md);
}

.graph-header {
  display: flex;
  justify-content: space-between;
  align-items: baseline;
  margin-bottom: var(--space-4);
  flex-wrap: wrap;
  gap: var(--space-2);
}

.graph-title {
  font-weight: 600;
  color: var(--color-text);
}

.graph-total {
  font-size: var(--text-sm);
  color: var(--color-muted);
}

.graph-container {
  width: 100%;
  overflow-x: auto;
  padding-bottom: var(--space-2);
}

.contribution-svg {
  display: block;
  width: 100%;
  height: auto;
  min-width: 700px;
}

.month-label,
.day-label,
.legend-label {
  font-size: 10px;
  fill: var(--color-muted);
  font-family: var(--font-sans);
}

.day-label {
  font-size: 9px;
}

/* Contribution day squares */
.contribution-day {
  transition: opacity var(--duration-fast) var(--ease-out);
  cursor: pointer;
  outline: none;
}

.contribution-day:hover {
  opacity: 0.8;
}

.contribution-day:focus {
  outline: 2px solid var(--color-primary);
  outline-offset: 1px;
}

/* GitHub colour scheme - light mode */
.contribution-day[data-level='0'] {
  fill: #ebedf0;
}

.contribution-day[data-level='1'] {
  fill: #9be9a8;
}

.contribution-day[data-level='2'] {
  fill: #40c463;
}

.contribution-day[data-level='3'] {
  fill: #30a14e;
}

.contribution-day[data-level='4'] {
  fill: #216e39;
}

/* GitHub colour scheme - dark mode */
:root[data-theme='dark'] .contribution-day[data-level='0'] {
  fill: #161b22;
}

:root[data-theme='dark'] .contribution-day[data-level='1'] {
  fill: #0e4429;
}

:root[data-theme='dark'] .contribution-day[data-level='2'] {
  fill: #006d32;
}

:root[data-theme='dark'] .contribution-day[data-level='3'] {
  fill: #26a641;
}

:root[data-theme='dark'] .contribution-day[data-level='4'] {
  fill: #39d353;
}

/* Tooltip styles */
.tooltip-group {
  pointer-events: none;
}

.tooltip-bg {
  fill: rgba(36, 41, 47, 0.95);
}

.tooltip-text {
  font-size: 11px;
  fill: #ffffff;
  font-family: var(--font-sans);
}

.tooltip-arrow {
  fill: rgba(36, 41, 47, 0.95);
}

:root[data-theme='dark'] .tooltip-bg {
  fill: rgba(255, 255, 255, 0.95);
}

:root[data-theme='dark'] .tooltip-text {
  fill: #24292f;
}

:root[data-theme='dark'] .tooltip-arrow {
  fill: rgba(255, 255, 255, 0.95);
}

/* Stats section */
.graph-stats {
  display: flex;
  gap: var(--space-8);
  margin-top: var(--space-6);
  padding-top: var(--space-4);
  border-top: 1px solid var(--color-border);
}

.stat {
  display: flex;
  flex-direction: column;
  gap: var(--space-1);
}

.stat-value {
  font-size: var(--text-2xl);
  font-weight: 700;
  color: var(--color-text);
  font-family: var(--font-mono);
}

.stat-label {
  font-size: var(--text-sm);
  color: var(--color-muted);
}

/* Responsive adjustments */
@media (max-width: 768px) {
  .github-graph {
    padding: var(--space-4);
  }

  .contribution-svg {
    min-width: 600px;
  }
}

@media (max-width: 480px) {
  .github-graph {
    padding: var(--space-3);
  }

  .graph-header {
    flex-direction: column;
  }

  .contribution-svg {
    min-width: 500px;
  }

  .graph-stats {
    gap: var(--space-4);
  }

  .stat-value {
    font-size: var(--text-xl);
  }
}
</style>
