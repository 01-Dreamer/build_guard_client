import { computed, onBeforeUnmount, onMounted, ref } from 'vue'

export function useResponsivePageSize() {
  const viewportHeight = ref(900)

  function updateViewportHeight() {
    viewportHeight.value = window.innerHeight
  }

  onMounted(() => {
    updateViewportHeight()
    window.addEventListener('resize', updateViewportHeight)
  })

  onBeforeUnmount(() => {
    window.removeEventListener('resize', updateViewportHeight)
  })

  const pageSize = computed(() => {
    if (viewportHeight.value >= 960) return 14
    if (viewportHeight.value >= 880) return 13
    if (viewportHeight.value >= 800) return 12
    if (viewportHeight.value >= 740) return 9
    if (viewportHeight.value >= 680) return 8
    if (viewportHeight.value >= 620) return 7
    return 6
  })

  return {
    pageSize
  }
}

export function fillPageRows<T extends { id: number }>(
  records: T[],
  pageSize: number,
  totalRecords: number
) {
  const count = Math.min(pageSize, totalRecords)

  return Array.from({ length: count }, (_, index) => {
    const source = records[index % records.length]
    return {
      ...source,
      id: index + 1
    }
  })
}
