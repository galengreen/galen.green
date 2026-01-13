<script setup lang="ts">
import { computed } from 'vue'
import type { ContributionWeek } from '@/types'

const props = defineProps<{
  contributionGraph: ContributionWeek[]
  totalContributions: number
  currentStreak: number
  longestStreak: number
}>()

// Get the contribution level (0-4) based on count
const getContributionLevel = (count: number): number => {
  if (count === 0) return 0
  if (count <= 3) return 1
  if (count <= 6) return 2
  if (count <= 9) return 3
  return 4
}

// Format the weeks data for display (full year - 53 weeks)
const displayWeeks = computed(() => {
  return props.contributionGraph.map((week) => ({
    days: week.contributionDays.map((day) => ({
      date: day.date,
      count: day.contributionCount,
      level: getContributionLevel(day.contributionCount),
    })),
  }))
})

// Format date for tooltip
const formatDate = (dateString: string): string => {
  const date = new Date(dateString)
  return date.toLocaleDateString('en-NZ', {
    weekday: 'short',
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })
}

// Get contribution text
const getContributionText = (count: number): string => {
  if (count === 0) return 'No contributions'
  if (count === 1) return '1 contribution'
  return `${count} contributions`
}
</script>

<template>
  <div class="github-graph">
    <div class="graph-header">
      <span class="graph-title">GitHub Activity</span>
      <span class="graph-total">{{ totalContributions }} contributions in the last year</span>
    </div>

    <div class="graph-container">
      <div class="graph-grid">
        <div v-for="(week, weekIndex) in displayWeeks" :key="weekIndex" class="graph-week">
          <div
            v-for="day in week.days"
            :key="day.date"
            class="graph-day"
            :class="`level-${day.level}`"
            :title="`${getContributionText(day.count)} on ${formatDate(day.date)}`"
          ></div>
        </div>
      </div>

      <div class="graph-legend">
        <span class="legend-label">Less</span>
        <div class="legend-squares">
          <div class="graph-day level-0"></div>
          <div class="graph-day level-1"></div>
          <div class="graph-day level-2"></div>
          <div class="graph-day level-3"></div>
          <div class="graph-day level-4"></div>
        </div>
        <span class="legend-label">More</span>
      </div>
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
}

.graph-grid {
  display: grid;
  grid-template-columns: repeat(53, 1fr);
  gap: 3px;
  width: 100%;
}

.graph-week {
  display: grid;
  grid-template-rows: repeat(7, 1fr);
  gap: 3px;
}

.graph-day {
  aspect-ratio: 1;
  width: 100%;
  border-radius: 2px;
  transition: transform var(--duration-fast) var(--ease-out);
  cursor: pointer;
}

.graph-day:hover {
  transform: scale(1.1);
}

/* Contribution levels - light mode */
.graph-day.level-0 {
  background: var(--color-border);
}

.graph-day.level-1 {
  background: #9be9a8;
}

.graph-day.level-2 {
  background: #40c463;
}

.graph-day.level-3 {
  background: #30a14e;
}

.graph-day.level-4 {
  background: #216e39;
}

/* Dark mode contribution levels */
:root[data-theme='dark'] .graph-day.level-0 {
  background: var(--color-border);
}

:root[data-theme='dark'] .graph-day.level-1 {
  background: #0e4429;
}

:root[data-theme='dark'] .graph-day.level-2 {
  background: #006d32;
}

:root[data-theme='dark'] .graph-day.level-3 {
  background: #26a641;
}

:root[data-theme='dark'] .graph-day.level-4 {
  background: #39d353;
}

.graph-legend {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: var(--space-2);
  margin-top: var(--space-3);
}

.legend-label {
  font-size: var(--text-xs);
  color: var(--color-muted);
}

.legend-squares {
  display: flex;
  gap: 2px;
}

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

@media (max-width: 768px) {
  .graph-grid,
  .graph-week,
  .legend-squares {
    gap: 2px;
  }
}

@media (max-width: 480px) {
  .graph-header {
    flex-direction: column;
  }

  .graph-grid,
  .graph-week,
  .legend-squares {
    gap: 1px;
  }

  .graph-stats {
    gap: var(--space-4);
  }

  .stat-value {
    font-size: var(--text-xl);
  }
}
</style>
