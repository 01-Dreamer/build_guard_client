<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount, watch } from 'vue'

const props = defineProps<{
  snapshotUrl: string
  fps?: number       // 播放帧率，默认 4
  bufferSeconds?: number  // 缓冲秒数，默认 3
  pollIntervalMs?: number  // 轮询间隔
}>()

const canvasRef = ref<HTMLCanvasElement>()
const placeholder = ref(true)
const badge = ref('缓冲中...')

const FPS = props.fps || 4
const BUFFER_SIZE = (props.bufferSeconds || 3) * FPS
const POLL_MS = props.pollIntervalMs || 250  // 每秒拉 4 帧

let frameBuffer: ImageBitmap[] = []
let pollTimer: ReturnType<typeof setInterval> | null = null
let playTimer: ReturnType<typeof setInterval> | null = null
let abortController: AbortController | null = null
let canvasCtx: CanvasRenderingContext2D | null = null

async function fetchFrame(): Promise<ImageBitmap | null> {
  if (!props.snapshotUrl) return null
  abortController = new AbortController()
  try {
    const resp = await fetch(props.snapshotUrl, {
      signal: abortController.signal,
      cache: 'no-store'
    })
    if (!resp.ok) return null
    const blob = await resp.blob()
    return await createImageBitmap(blob)
  } catch {
    return null
  }
}

function startPlayback() {
  if (!canvasCtx || !canvasRef.value) return

  playTimer = setInterval(() => {
    if (frameBuffer.length === 0) return
    const frame = frameBuffer.shift()!
    const canvas = canvasRef.value!
    canvas.width = frame.width
    canvas.height = frame.height
    canvasCtx!.drawImage(frame, 0, 0)
    frame.close() // 释放内存

    if (frameBuffer.length >= BUFFER_SIZE / 2) {
      badge.value = '直播'
      placeholder.value = false
    } else if (frameBuffer.length > 0) {
      badge.value = `缓冲 ${frameBuffer.length}/${BUFFER_SIZE}`
    }
  }, 1000 / FPS)
}

function startPolling() {
  pollTimer = setInterval(async () => {
    const frame = await fetchFrame()
    if (frame) {
      frameBuffer.push(frame)
      // 限制缓冲区大小，超出就丢最老的
      while (frameBuffer.length > BUFFER_SIZE * 2) {
        const old = frameBuffer.shift()
        old?.close()
      }
    }
  }, POLL_MS)
}

onMounted(() => {
  canvasCtx = canvasRef.value?.getContext('2d') || null
  if (props.snapshotUrl) {
    startPolling()
    // 等缓冲区攒够再开始播放
    setTimeout(() => {
      if (frameBuffer.length > 0) {
        startPlayback()
      }
    }, 1500)
  }
})

onBeforeUnmount(() => {
  abortController?.abort()
  if (pollTimer) clearInterval(pollTimer)
  if (playTimer) clearInterval(playTimer)
  frameBuffer.forEach(f => f.close())
  frameBuffer = []
})

watch(() => props.snapshotUrl, (url) => {
  if (url) {
    startPolling()
    setTimeout(() => { if (frameBuffer.length > 0) startPlayback() }, 1500)
  }
})
</script>

<template>
  <div class="buffered-player">
    <canvas ref="canvasRef" class="player-canvas" />
    <div v-if="placeholder" class="player-placeholder">
      <span>{{ badge }}</span>
    </div>
  </div>
</template>

<style scoped>
.buffered-player {
  position: relative;
  width: 100%;
  height: 100%;
  background: #0f172a;
}
.player-canvas {
  display: block;
  width: 100%;
  height: 100%;
  object-fit: cover;
}
.player-placeholder {
  position: absolute;
  inset: 0;
  display: grid;
  place-items: center;
  color: #94a3b8;
  font-size: 13px;
  font-weight: 700;
  background: linear-gradient(135deg, rgba(30,41,59,0.96), rgba(15,23,42,0.98));
}
</style>
