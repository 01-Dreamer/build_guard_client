<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue'

const props = defineProps<{
  streamUrl?: string | null
  snapshotUrl?: string | null
  className?: string
}>()

const canvasRef = ref<HTMLCanvasElement>()
const hasFrame = ref(false)
const sseFailed = ref(false)

let eventSource: EventSource | null = null
let reconnectTimer: number | null = null
const reconnectToken = ref(Date.now())

const fallbackUrl = computed(() => props.streamUrl || props.snapshotUrl || '')

const sseUrl = computed(() => {
  if (!props.streamUrl) return ''
  try {
    const parsed = new URL(props.streamUrl, location.href)
    if (!parsed.pathname.endsWith('/stream')) return ''
    parsed.pathname = parsed.pathname.replace(/\/stream$/, '/sse')
    parsed.searchParams.set('_sse', String(reconnectToken.value))
    return parsed.toString()
  } catch {
    if (!props.streamUrl.endsWith('/stream')) return ''
    const joiner = props.streamUrl.includes('?') ? '&' : '?'
    return `${props.streamUrl.replace(/\/stream$/, '/sse')}${joiner}_sse=${reconnectToken.value}`
  }
})

function closeSource() {
  if (eventSource) {
    eventSource.close()
    eventSource = null
  }
}

function clearReconnectTimer() {
  if (reconnectTimer !== null) {
    window.clearTimeout(reconnectTimer)
    reconnectTimer = null
  }
}

function drawBase64Frame(frameBase64: string) {
  const canvas = canvasRef.value
  const context = canvas?.getContext('2d')
  if (!canvas || !context || !frameBase64) return

  const image = new Image()
  image.onload = () => {
    if (canvas.width !== image.naturalWidth) {
      canvas.width = image.naturalWidth
    }
    if (canvas.height !== image.naturalHeight) {
      canvas.height = image.naturalHeight
    }
    context.drawImage(image, 0, 0, canvas.width, canvas.height)
    hasFrame.value = true
    sseFailed.value = false
  }
  image.src = `data:image/jpeg;base64,${frameBase64}`
}

function connectSse() {
  clearReconnectTimer()
  closeSource()
  if (!sseUrl.value) {
    sseFailed.value = true
    return
  }

  const source = new EventSource(sseUrl.value)
  eventSource = source
  source.addEventListener('frame', (event) => {
    drawBase64Frame((event as MessageEvent<string>).data)
  })
  source.onerror = () => {
    sseFailed.value = true
    closeSource()
    reconnectTimer = window.setTimeout(() => {
      reconnectToken.value = Date.now()
      connectSse()
    }, 1500)
  }
}

onMounted(connectSse)

onBeforeUnmount(() => {
  clearReconnectTimer()
  closeSource()
})

watch(
  () => props.streamUrl,
  () => {
    hasFrame.value = false
    sseFailed.value = false
    reconnectToken.value = Date.now()
    connectSse()
  }
)
</script>

<template>
  <div class="live-camera-player">
    <canvas
      v-show="hasFrame"
      ref="canvasRef"
      :class="['player-media', className]"
    />
    <img
      v-if="!hasFrame && (sseFailed || !sseUrl) && fallbackUrl"
      :class="['player-media', className]"
      :src="fallbackUrl"
      alt="施工现场监控画面"
    />
    <div v-if="!hasFrame && !fallbackUrl" class="player-placeholder">等待摄像头帧</div>
  </div>
</template>

<style scoped>
.live-camera-player {
  position: absolute;
  inset: 0;
  overflow: hidden;
  background: #0f172a;
}

.player-media {
  display: block;
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.player-placeholder {
  display: grid;
  width: 100%;
  height: 100%;
  place-items: center;
  color: #cbd5e1;
  font-size: 13px;
  font-weight: 700;
  background:
    linear-gradient(135deg, rgba(30, 41, 59, 0.96), rgba(15, 23, 42, 0.98)),
    repeating-linear-gradient(45deg, rgba(148, 163, 184, 0.08) 0 8px, transparent 8px 16px);
}
</style>
