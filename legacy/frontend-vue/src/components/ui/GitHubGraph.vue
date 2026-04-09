<script setup lang="ts">
import { computed, ref } from 'vue'
import Card from '@/components/ui/CustomCard.vue'
import type { ContributionWeek } from '@/types'

const props = defineProps<{
  contributionGraph: ContributionWeek[]
  totalContributions: number
}>()

// Constants
const SQUARE_SIZE = 11
const SQUARE_GAP = 3
const SQUARE_RADIUS = 2
const DAYS_IN_WEEK = 7
const LEFT_LABEL_WIDTH = 32
const TOP_LABEL_HEIGHT = 16
const LEGEND_HEIGHT = 24

// Tooltip state (using pixel positions relative to the card wrapper)
const tooltipVisible = ref(false)
const tooltipContent = ref('')
const tooltipX = ref(0)
const tooltipY = ref(0)
const cardWrapperRef = ref<HTMLElement | null>(null)

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
  const weeks = Array.isArray(props.contributionGraph) ? props.contributionGraph : []

  return weeks.map((week) => ({
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

// Handle tooltip events - position relative to the card wrapper
const showTooltip = (event: MouseEvent, day: { date: string; count: number }) => {
  const rect = event.target as SVGRectElement
  const wrapper = cardWrapperRef.value

  if (!wrapper) return

  const wrapperRect = wrapper.getBoundingClientRect()
  const rectBounds = rect.getBoundingClientRect()

  // Position tooltip centred above the hovered square (in pixels relative to wrapper)
  tooltipX.value = rectBounds.left - wrapperRect.left + rectBounds.width / 2
  tooltipY.value = rectBounds.top - wrapperRect.top - 8

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

const contributionFill = (level: number) => `var(--gh-level-${level})`
</script>

<template>
  <div ref="cardWrapperRef" class="relative">
    <Card padding="lg" :opacity="80" :blur="12">
      <template #header>
        <div class="flex flex-wrap items-baseline justify-between gap-2">
          <span class="font-semibold text-text">GitHub Activity</span>
          <span class="text-sm text-muted"
            >{{ totalContributions }} contributions in the last year</span
          >
        </div>
      </template>

      <div class="w-full overflow-x-hidden pb-2">
        <svg :viewBox="viewBox" class="contribution-svg">
          <!-- Month labels -->
          <g>
            <text
              v-for="(label, index) in monthLabels"
              :key="index"
              :x="label.x"
              :y="12"
              class="fill-muted text-[10px] [font-family:var(--font-sans)]"
            >
              {{ label.month }}
            </text>
          </g>

          <!-- Day labels -->
          <g>
            <text
              v-for="label in dayLabels"
              :key="label.day"
              :x="0"
              :y="label.y"
              class="fill-muted text-[10px] [font-family:var(--font-sans)]"
            >
              {{ label.day }}
            </text>
          </g>

          <!-- Contribution grid -->
          <g>
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
                :fill="contributionFill(day.level)"
                class="cursor-pointer transition-opacity duration-150 hover:opacity-80"
                @mouseenter="showTooltip($event, day)"
                @mouseleave="hideTooltip"
              />
            </g>
          </g>

          <!-- Legend -->
          <g :transform="`translate(${legendX}, ${legendY})`">
            <text x="0" y="10" class="fill-muted text-[10px] [font-family:var(--font-sans)]">
              Less
            </text>
            <rect
              v-for="(level, index) in legendLevels"
              :key="level"
              :x="30 + index * (SQUARE_SIZE + 2)"
              :y="0"
              :width="SQUARE_SIZE"
              :height="SQUARE_SIZE"
              :rx="SQUARE_RADIUS"
              :ry="SQUARE_RADIUS"
              :fill="contributionFill(level)"
            />
            <text
              :x="30 + legendLevels.length * (SQUARE_SIZE + 2) + 4"
              y="10"
              class="fill-muted text-[10px] [font-family:var(--font-sans)]"
            >
              More
            </text>
          </g>
        </svg>
      </div>
    </Card>

    <!-- HTML Tooltip (positioned relative to wrapper, outside overflow:hidden container) -->
    <div
      v-if="tooltipVisible"
      class="pointer-events-none absolute z-10 -translate-x-1/2 -translate-y-full rounded bg-[var(--gh-tooltip-bg)] px-2 py-1 text-[11px] whitespace-nowrap text-[var(--gh-tooltip-text)]"
      :style="{ left: `${tooltipX}px`, top: `${tooltipY}px` }"
    >
      {{ tooltipContent }}
    </div>
  </div>
</template>
