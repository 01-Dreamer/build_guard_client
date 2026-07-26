<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'
import { FullScreen, VideoCamera } from '@element-plus/icons-vue'
import { listCameraVideos, listCameras, type CameraVideoView, type CameraView } from '../../api/site'
import AppPagination from '../../components/AppPagination.vue'
import AppTopbar from '../../components/AppTopbar.vue'
import LiveCameraPlayer from '../../components/site/LiveCameraPlayer.vue'
import { usePolling } from '../../composables/usePolling'

interface CameraItem {
  name: string
  area: string
  status: '在线' | '离线'
}

const rawCameras = ref<CameraView[]>([])
const cameraVideos = ref<CameraVideoView[]>([])
const selectedHistoryVideo = ref<CameraVideoView | null>(null)
const selectedCameraCode = ref('')
const videoStartDate = ref('')
const videoEndDate = ref('')
const videoPage = ref(1)
const videoPageSize = 12
const videoTotal = ref(0)
const historyCollapsed = ref(true)
const videoFrameRefs = ref<Record<string, HTMLElement>>({})
const streamReloadTokens = ref<Record<string, number>>({})
let streamReconnectTimer: number | null = null

function isOnlineStatus(status?: number | string | null) {
  return status === 1 || status === '在线' || status === 'online'
}

/** 浏览器在本地时直连 127.0.0.1 摄像头，线上 HTTPS 统一走 data.zxylearn.top */
function useLocalUrl(url: string): string {
  if (!url) return ''
  const isLocal = location.hostname === '127.0.0.1' || location.hostname === 'localhost'
  if (isLocal) {
    return url.replace('110.41.166.11', '127.0.0.1')
  }
  if (location.protocol === 'https:') {
    return url
      .replace(/^http:\/\/(?:110\.41\.166\.11|127\.0\.0\.1|localhost):19100/i, 'https://data.zxylearn.top')
      .replace(/^http:\/\/(?:110\.41\.166\.11|127\.0\.0\.1|localhost):18080/i, 'https://data.zxylearn.top')
  }
  return url
}

function withStreamReloadToken(url: string, code: string): string {
  if (!url) return ''
  const token = streamReloadTokens.value[code]
  if (!token) return url
  try {
    const parsed = new URL(url, location.href)
    parsed.searchParams.set('_stream', String(token))
    return parsed.toString()
  } catch {
    const joiner = url.includes('?') ? '&' : '?'
    return `${url}${joiner}_stream=${token}`
  }
}

function refreshStream(code: string) {
  if (!code) return
  streamReloadTokens.value = {
    ...streamReloadTokens.value,
    [code]: Date.now()
  }
}

const cameras = computed<CameraItem[]>(() =>
  rawCameras.value.map((camera) => ({
    name: camera.name,
    area: camera.locationName || '-',
    status: isOnlineStatus(camera.onlineStatus) ? '在线' : '离线'
  }))
)
const monitorCards = computed(() =>
  rawCameras.value.slice(0, 4).map((camera, index) => ({
    code: camera.code,
    title: camera.name || `摄像头 ${index + 1}`,
    className: ['feed-one', 'feed-two', 'feed-three', 'feed-four'][index],
    snapshotUrl: useLocalUrl(camera.snapshotUrl || ''),
    streamUrl: withStreamReloadToken(useLocalUrl(camera.streamUrl || ''), camera.code),
    online: isOnlineStatus(camera.onlineStatus),
    hasStream: isOnlineStatus(camera.onlineStatus) && Boolean(camera.streamUrl || camera.snapshotUrl)
  }))
)

async function loadCameras() {
  try {
    const result = await listCameras({ page: 1, pageSize: 100 })
    rawCameras.value = result.records
  } catch {
    rawCameras.value = []
  }
}

async function loadCameraVideos() {
  try {
    const result = await listCameraVideos({
      cameraCode: selectedCameraCode.value,
      startTime: videoStartDate.value,
      endTime: videoEndDate.value,
      page: videoPage.value,
      pageSize: videoPageSize
    })
    cameraVideos.value = result.records
    videoTotal.value = result.total
    if (!result.records.some((video) => video.id === selectedHistoryVideo.value?.id)) {
      selectedHistoryVideo.value = result.records[0] || null
    }
  } catch {
    cameraVideos.value = []
    videoTotal.value = 0
    selectedHistoryVideo.value = null
  }
}

function searchCameraVideos() {
  videoPage.value = 1
  loadCameraVideos()
}

function changeVideoPage(nextPage: number) {
  if (nextPage === videoPage.value) return
  videoPage.value = nextPage
  loadCameraVideos()
}

function playHistoryVideo(video: CameraVideoView) {
  selectedHistoryVideo.value = video
}

function setVideoFrameRef(code: string, element: Element | null) {
  const nextRefs = { ...videoFrameRefs.value }
  if (element instanceof HTMLElement) {
    nextRefs[code] = element
  } else {
    delete nextRefs[code]
  }
  videoFrameRefs.value = nextRefs
}

async function toggleFullscreen(code: string) {
  const target = videoFrameRefs.value[code]
  if (!target) return
  try {
    if (document.fullscreenElement) {
      await document.exitFullscreen()
    } else {
      await target.requestFullscreen()
    }
  } catch {
    // Fullscreen can be blocked by browser policy; keep the normal preview usable.
  }
}

const cameraPolling = usePolling(loadCameras, 3000)

onMounted(() => {
  cameraPolling.start()
  loadCameraVideos()
  streamReconnectTimer = window.setInterval(() => {
    const nextTokens = { ...streamReloadTokens.value }
    for (const camera of rawCameras.value) {
      if (isOnlineStatus(camera.onlineStatus) && camera.streamUrl) {
        nextTokens[camera.code] = Date.now()
      }
    }
    streamReloadTokens.value = nextTokens
  }, 45000)
})

onBeforeUnmount(() => {
  if (streamReconnectTimer !== null) {
    window.clearInterval(streamReconnectTimer)
    streamReconnectTimer = null
  }
})
</script>

<template>
  <main class="site-page">
    <AppTopbar />

    <section class="site-shell monitor-shell">
      <aside class="camera-sidebar">
        <div class="breadcrumb">施工场地 &gt; 现场监控</div>
        <section class="camera-panel">
          <h2>摄像头列表</h2>
          <article v-for="camera in cameras" :key="camera.name" class="camera-item">
            <span class="camera-arrow">›</span>
            <div>
              <strong :title="camera.name">{{ camera.name }}</strong>
              <em :title="camera.area">{{ camera.area }}</em>
            </div>
            <b :class="{ offline: camera.status === '离线' }" :title="camera.status">
              {{ camera.status }}
            </b>
          </article>
          <article v-if="!cameras.length" class="camera-item">
            <span class="camera-arrow">›</span>
            <div>
              <strong>暂无摄像头</strong>
              <em>-</em>
            </div>
            <b class="offline">-</b>
          </article>
        </section>
      </aside>

      <section class="monitor-main">
        <div class="monitor-grid" aria-label="现场摄像头">
          <article
            v-for="card in monitorCards"
            :key="card.title"
            class="monitor-card"
            :ref="(element) => setVideoFrameRef(card.code, element as Element | null)"
          >
            <header>
              <span>{{ card.title }}</span>
            </header>
            <div class="video-frame">
              <LiveCameraPlayer
                v-if="card.hasStream"
                :class-name="card.className"
                :stream-url="card.streamUrl"
                :snapshot-url="card.snapshotUrl"
              />
              <div v-else class="video-placeholder">
                <el-icon>
                  <VideoCamera />
                </el-icon>
                <span>{{ card.online ? '等待摄像头帧' : '摄像头离线' }}</span>
              </div>
              <button type="button" title="全屏查看" @click="toggleFullscreen(card.code)">
                <el-icon>
                  <FullScreen />
                </el-icon>
              </button>
              <span class="live-badge" :class="{ waiting: !card.hasStream }">
                <el-icon>
                  <VideoCamera />
                </el-icon>
                {{ card.hasStream ? '直播' : card.online ? '等待' : '离线' }}
              </span>
            </div>
          </article>
          <article v-if="!monitorCards.length" class="monitor-card">
            <header>
              <span>暂无摄像头</span>
            </header>
            <div class="video-frame empty-frame">
              <el-icon>
                <VideoCamera />
              </el-icon>
              <span>暂无摄像头设备</span>
            </div>
          </article>
        </div>

        <section class="history-panel" :class="{ collapsed: historyCollapsed }">
          <header>
            <h2>历史视频 <span v-if="videoTotal">共{{ videoTotal }}条</span></h2>
            <button class="history-toggle" type="button" @click="historyCollapsed = !historyCollapsed">
              {{ historyCollapsed ? '展开历史' : '隐藏历史' }}
            </button>
            <div v-show="!historyCollapsed" class="history-filters">
              <select v-model="selectedCameraCode">
                <option value="">全部摄像头</option>
                <option v-for="camera in rawCameras" :key="camera.code" :value="camera.code">
                  {{ camera.name }}
                </option>
              </select>
              <input v-model="videoStartDate" type="date" />
              <input v-model="videoEndDate" type="date" />
              <button type="button" @click="searchCameraVideos">查询</button>
            </div>
          </header>
          <div v-show="!historyCollapsed" class="history-body">
            <div v-if="selectedHistoryVideo" class="history-player">
              <video
                :key="selectedHistoryVideo.id"
                controls
                preload="metadata"
                playsinline
                :src="selectedHistoryVideo.url"
              />
              <div>
                <strong>{{ selectedHistoryVideo.cameraName || selectedHistoryVideo.cameraCode || '摄像头视频' }}</strong>
                <span>{{ selectedHistoryVideo.createdAt || selectedHistoryVideo.fileName || selectedHistoryVideo.objectKey }}</span>
              </div>
            </div>
            <div v-else class="history-empty history-player-empty">暂无历史视频</div>
            <div class="history-list">
              <button
                v-for="video in cameraVideos"
                :key="video.id"
                type="button"
                :class="{ active: selectedHistoryVideo?.id === video.id }"
                @click="playHistoryVideo(video)"
              >
                <strong>{{ video.cameraName || video.cameraCode || '摄像头视频' }}</strong>
                <span>{{ video.createdAt || video.fileName || video.objectKey }}</span>
              </button>
              <div v-if="!cameraVideos.length" class="history-empty">暂无历史视频</div>
            </div>
          </div>
          <AppPagination
            v-if="!historyCollapsed && videoTotal > videoPageSize"
            :page="videoPage"
            :total="videoTotal"
            :page-size="videoPageSize"
            @change="changeVideoPage"
          />
        </section>
      </section>
    </section>
  </main>
</template>

<style scoped>
.site-page {
  height: 100vh;
  overflow: hidden;
  color: #334155;
  background: #f3f6fa;
}

.site-shell {
  height: calc(100vh - 54px);
  padding: 12px;
  overflow: hidden;
}

.monitor-shell {
  display: grid;
  grid-template-columns: 320px minmax(0, 1fr);
  gap: 28px;
}

.camera-sidebar {
  min-width: 0;
}

.monitor-main {
  display: grid;
  grid-template-rows: minmax(0, 1fr) auto;
  gap: 14px;
  min-width: 0;
  min-height: 0;
}

.breadcrumb {
  display: flex;
  align-items: center;
  height: 28px;
  padding: 0;
  margin-bottom: 10px;
  color: #64748b;
  font-size: 16px;
  font-weight: 700;
  line-height: 28px;
}

.camera-panel {
  height: calc(100% - 38px);
  min-height: 0;
  padding: 20px 16px;
  overflow: auto;
  background: #fff;
  border: 1px solid #edf1f6;
  border-radius: 8px;
}

.camera-panel h2 {
  margin: 0 0 18px;
  color: #1f2937;
  font-size: 16px;
}

.camera-item {
  display: grid;
  grid-template-columns: 18px minmax(0, 1fr) auto;
  gap: 8px;
  align-items: start;
  padding: 10px 6px;
}

.camera-arrow {
  color: #94a3b8;
  font-size: 24px;
  line-height: 18px;
}

.camera-item strong,
.camera-item em {
  display: block;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.camera-item strong {
  color: #334155;
  font-size: 14px;
}

.camera-item em {
  margin-top: 6px;
  color: #64748b;
  font-size: 12px;
  font-style: normal;
}

.camera-item b {
  max-width: 64px;
  padding: 4px 9px;
  overflow: hidden;
  color: #16a34a;
  font-size: 12px;
  text-overflow: ellipsis;
  white-space: nowrap;
  background: #dcfce7;
  border-radius: 6px;
}

.camera-item b.offline {
  color: #dc2626;
  background: #fee2e2;
}

.monitor-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(300px, 1fr));
  grid-template-rows: repeat(2, minmax(0, 1fr));
  gap: 16px 18px;
  min-height: 0;
  max-width: 1420px;
  padding: 0;
  overflow: hidden;
}

.history-panel {
  display: grid;
  grid-template-rows: auto minmax(0, 1fr) auto;
  gap: 8px;
  min-width: 0;
  max-height: min(34vh, 330px);
  padding: 12px 16px;
  overflow: hidden;
  background: #fff;
  border: 1px solid #edf1f6;
  border-radius: 8px;
}

.history-panel.collapsed {
  grid-template-rows: auto;
  max-height: 58px;
}

.history-panel header {
  display: grid;
  grid-template-columns: auto auto minmax(0, 1fr);
  gap: 10px;
  align-items: center;
  margin-bottom: 0;
}

.history-panel h2 {
  margin: 0;
  color: #1f2937;
  font-size: 16px;
}

.history-panel h2 span {
  margin-left: 8px;
  color: #64748b;
  font-size: 12px;
  font-weight: 800;
}

.history-toggle {
  height: 32px;
  padding: 0 12px;
  color: #315b91;
  font-size: 13px;
  font-weight: 900;
  white-space: nowrap;
  cursor: pointer;
  background: #eef5ff;
  border: 1px solid #dbe7fb;
  border-radius: 6px;
}

.history-filters {
  display: flex;
  flex-wrap: nowrap;
  gap: 7px;
  justify-content: flex-end;
  min-width: 0;
}

.history-filters select,
.history-filters input,
.history-filters button {
  height: 32px;
  padding: 0 10px;
  min-width: 0;
  color: #334155;
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  border-radius: 6px;
}

.history-filters select {
  width: 150px;
}

.history-filters input {
  width: 132px;
}

.history-filters button {
  width: 56px;
  flex: 0 0 auto;
  color: #fff;
  cursor: pointer;
  background: #315b91;
  border-color: #315b91;
}

.history-body {
  display: grid;
  grid-template-columns: minmax(300px, 0.9fr) minmax(420px, 1.1fr);
  gap: 12px;
  min-height: 0;
  overflow: hidden;
}

.history-player {
  display: grid;
  grid-template-columns: minmax(190px, 280px) minmax(0, 1fr);
  gap: 12px;
  align-items: stretch;
  min-width: 0;
  min-height: 0;
  padding: 8px;
  background: #f8fafc;
  border: 1px solid #e6edf7;
  border-radius: 8px;
}

.history-player video {
  display: block;
  width: 100%;
  max-height: 150px;
  aspect-ratio: 16 / 9;
  object-fit: contain;
  background: #0f172a;
  border-radius: 6px;
}

.history-player div {
  display: grid;
  gap: 6px;
  min-width: 0;
}

.history-player strong,
.history-player span {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.history-player strong {
  color: #1f2937;
  font-size: 14px;
}

.history-player span {
  color: #64748b;
  font-size: 12px;
}

.history-player-empty {
  min-height: 130px;
  align-content: center;
}

.history-list {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 7px;
  min-height: 0;
  max-height: 166px;
  padding-right: 4px;
  overflow-y: auto;
  overflow-x: hidden;
}

.history-list button,
.history-empty {
  display: grid;
  gap: 4px;
  min-width: 0;
  padding: 8px 10px;
  color: #334155;
  text-align: left;
  text-decoration: none;
  background: #f8fafc;
  border: 1px solid #edf1f6;
  border-radius: 6px;
}

.history-list button {
  cursor: pointer;
}

.history-list button.active {
  background: #eef5ff;
  border-color: #3f6fed;
  box-shadow: inset 3px 0 0 #3f6fed;
}

.history-list strong,
.history-list span {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.history-list strong {
  font-size: 12px;
}

.history-list span,
.history-empty {
  color: #64748b;
  font-size: 11px;
}

.monitor-card {
  min-width: 0;
  min-height: 0;
  overflow: hidden;
  background: #111827;
  border: 1px solid rgba(15, 23, 42, 0.24);
  border-radius: 8px;
  box-shadow: 0 8px 24px rgba(15, 23, 42, 0.08);
}

.monitor-card:fullscreen {
  display: grid;
  grid-template-rows: 46px minmax(0, 1fr);
  width: 100vw;
  height: 100vh;
  background: #0f172a;
  border: 0;
  border-radius: 0;
}

.monitor-card:fullscreen header {
  height: 46px;
}

.monitor-card:fullscreen .video-frame {
  height: 100%;
}

.monitor-card header {
  display: grid;
  height: 38px;
  place-items: center;
  color: #f8fafc;
  font-size: 14px;
  font-weight: 800;
  background: #323232;
}

.video-frame {
  position: relative;
  height: calc(100% - 38px);
  min-height: 0;
  overflow: hidden;
  background: #0f172a;
}

.video-frame img {
  display: block;
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.video-placeholder,
.empty-frame {
  display: grid;
  width: 100%;
  height: 100%;
  place-items: center;
  color: #cbd5e1;
  background:
    linear-gradient(135deg, rgba(30, 41, 59, 0.96), rgba(15, 23, 42, 0.98)),
    repeating-linear-gradient(45deg, rgba(148, 163, 184, 0.08) 0 8px, transparent 8px 16px);
}

.video-placeholder {
  grid-template-rows: auto auto;
  align-content: center;
  gap: 10px;
}

.video-placeholder .el-icon,
.empty-frame .el-icon {
  color: #94a3b8;
  font-size: 34px;
}

.video-placeholder span,
.empty-frame span {
  font-size: 13px;
  font-weight: 700;
}

.feed-one {
  object-position: 28% center;
  filter: saturate(0.82) contrast(0.92);
}

.feed-two {
  object-position: 74% center;
  filter: brightness(0.78) saturate(0.72);
}

.feed-three {
  object-position: center;
  filter: saturate(0.9);
}

.feed-four {
  object-position: 88% center;
  filter: grayscale(0.25) brightness(0.82);
}

.video-frame button {
  position: absolute;
  top: 10px;
  right: 10px;
  display: grid;
  width: 30px;
  height: 30px;
  place-items: center;
  color: #f8fafc;
  cursor: pointer;
  background: rgba(15, 23, 42, 0.58);
  border: 0;
  border-radius: 6px;
  z-index: 3;
}

.live-badge {
  position: absolute;
  left: 10px;
  bottom: 10px;
  display: inline-flex;
  gap: 5px;
  align-items: center;
  padding: 4px 7px;
  color: #ecfeff;
  font-size: 11px;
  font-weight: 800;
  background: rgba(15, 23, 42, 0.58);
  border-radius: 6px;
}

.live-badge.waiting {
  color: #fef3c7;
  background: rgba(120, 53, 15, 0.68);
}

@media (max-width: 1180px) {
  .monitor-shell {
    grid-template-columns: 1fr;
  }

  .monitor-grid {
    padding-top: 0;
  }

  .history-list {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

@media (max-width: 820px) {
  .monitor-grid {
    grid-template-columns: 1fr;
    padding-inline: 0;
  }

  .history-panel header {
    grid-template-columns: 1fr;
  }

  .history-filters {
    align-items: stretch;
    flex-direction: column;
  }

  .history-player {
    grid-template-columns: 1fr;
  }

  .history-list {
    grid-template-columns: 1fr;
  }
}
</style>
