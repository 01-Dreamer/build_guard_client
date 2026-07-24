import { onBeforeUnmount } from 'vue'

export function usePolling(callback: () => Promise<void> | void, intervalMs = 3000) {
  let timer: number | null = null
  let running = false

  async function tick() {
    if (running) return
    running = true
    try {
      await callback()
    } finally {
      running = false
    }
  }

  function start(immediate = true) {
    stop()
    if (immediate) {
      void tick()
    }
    timer = window.setInterval(() => {
      void tick()
    }, intervalMs)
  }

  function stop() {
    if (timer !== null) {
      window.clearInterval(timer)
      timer = null
    }
  }

  onBeforeUnmount(stop)

  return { start, stop, tick }
}
