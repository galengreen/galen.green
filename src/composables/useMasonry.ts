import { ref, computed, onMounted, onUnmounted } from 'vue'

interface MasonryItem {
  id: string
  height: number // Aspect ratio height (relative to width)
}

interface MasonryPosition {
  id: string
  column: number
  top: number
  height: number
}

/**
 * Masonry layout composable that maintains left-to-right, top-to-bottom ordering
 * while minimising gaps between items of varying heights.
 */
export function useMasonry(columnCount = 3, gap = 16) {
  const columns = ref(columnCount)
  const containerWidth = ref(0)

  // Calculate column width based on container
  const columnWidth = computed(() => {
    if (containerWidth.value === 0) return 0
    const totalGap = gap * (columns.value - 1)
    return (containerWidth.value - totalGap) / columns.value
  })

  /**
   * Calculate positions for items maintaining reading order.
   * Items are placed left-to-right, then the shortest column receives the next item.
   */
  const calculatePositions = (items: MasonryItem[]): MasonryPosition[] => {
    if (items.length === 0 || columnWidth.value === 0) return []

    const positions: MasonryPosition[] = []
    const columnHeights: number[] = Array(columns.value).fill(0)

    // For each row of items, place them left to right
    // Then find shortest column for overflow
    let itemIndex = 0

    while (itemIndex < items.length) {
      // Find the row with minimum height (leftmost shortest column)
      const minHeight = Math.min(...columnHeights)

      // Place items in columns at this height level, left to right
      for (let col = 0; col < columns.value && itemIndex < items.length; col++) {
        // Only place in this column if it's at or near the minimum height
        // This ensures left-to-right ordering within each "row"
        if ((columnHeights[col] ?? 0) <= minHeight + gap) {
          const item = items[itemIndex]
          if (item) {
            const itemHeight = (item.height / 100) * columnWidth.value // Convert aspect ratio to pixels

            positions.push({
              id: item.id,
              column: col,
              top: columnHeights[col] ?? 0,
              height: itemHeight,
            })

            columnHeights[col] = (columnHeights[col] ?? 0) + itemHeight + gap
            itemIndex++
          }
        }
      }

      // If we didn't place any items (all columns too high), place in shortest
      if (positions.length < itemIndex + 1 && itemIndex < items.length) {
        const shortestCol = columnHeights.indexOf(Math.min(...columnHeights))
        const item = items[itemIndex]
        if (item) {
          const itemHeight = (item.height / 100) * columnWidth.value

          positions.push({
            id: item.id,
            column: shortestCol,
            top: columnHeights[shortestCol] ?? 0,
            height: itemHeight,
          })

          columnHeights[shortestCol] = (columnHeights[shortestCol] ?? 0) + itemHeight + gap
          itemIndex++
        }
      }
    }

    return positions
  }

  /**
   * Alternative: Simple row-based layout for strict left-to-right ordering
   * Places items in rows, each row has `columns` items
   */
  const calculateRowPositions = (items: MasonryItem[]): MasonryPosition[] => {
    if (items.length === 0 || columnWidth.value === 0) return []

    const positions: MasonryPosition[] = []
    const columnHeights: number[] = Array(columns.value).fill(0)

    items.forEach((item, index) => {
      const col = index % columns.value
      const itemHeight = (item.height / 100) * columnWidth.value

      // For first row, start at 0. For subsequent items in same column, stack below
      positions.push({
        id: item.id,
        column: col,
        top: columnHeights[col] ?? 0,
        height: itemHeight,
      })

      columnHeights[col] = (columnHeights[col] ?? 0) + itemHeight + gap
    })

    return positions
  }

  // Get total height of the masonry container
  const getTotalHeight = (positions: MasonryPosition[]): number => {
    if (positions.length === 0) return 0

    const columnHeights: number[] = Array(columns.value).fill(0)

    positions.forEach((pos) => {
      const bottom = pos.top + pos.height
      if (bottom > (columnHeights[pos.column] ?? 0)) {
        columnHeights[pos.column] = bottom
      }
    })

    return Math.max(...columnHeights)
  }

  // Responsive column count
  const updateColumns = () => {
    if (typeof window === 'undefined') return

    const width = window.innerWidth
    if (width < 480) {
      columns.value = 1
    } else if (width < 768) {
      columns.value = 2
    } else {
      columns.value = columnCount
    }
  }

  // Set container width
  const setContainerWidth = (width: number) => {
    containerWidth.value = width
  }

  onMounted(() => {
    updateColumns()
    window.addEventListener('resize', updateColumns)
  })

  onUnmounted(() => {
    window.removeEventListener('resize', updateColumns)
  })

  return {
    columns,
    columnWidth,
    gap,
    calculatePositions,
    calculateRowPositions,
    getTotalHeight,
    setContainerWidth,
    updateColumns,
  }
}
