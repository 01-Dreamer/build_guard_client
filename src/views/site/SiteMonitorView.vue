<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { FullScreen, VideoCamera } from '@element-plus/icons-vue'
import { listCameraVideos, listCameras, type CameraVideoView, type CameraView } from '../../api/site'
import AppTopbar from '../../components/AppTopbar.vue'
import { usePolling } from '../../composables/usePolling'

interface CameraItem {
  name: string
  area: string
  status: '在线' | '离线'
}

const rawCameras = ref<CameraView[]>([])
const cameraVideos = ref<CameraVideoView[]>([])
const selectedCameraCode = ref('')
const videoStartDate = ref('')
const videoEndDate = ref('')
const failedStreams = ref(new Set<string>())

function isOnlineStatus(status?: number | string | null) {
  return status === 1 || status === '在线' || status === 'online'
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
    snapshotUrl: camera.snapshotUrl || '',
    streamUrl: camera.streamUrl || '',
    online: isOnlineStatus(camera.onlineStatus),
    hasStream: isOnlineStatus(camera.onlineStatus) && Boolean(camera.streamUrl || camera.snapshotUrl) && !failedStreams.value.has(camera.code)
  }))
)

async function loadCameras() {
  try {
    const result = await listCameras({ page: 1, pageSize: 100 })
    rawCameras.value = result.records
    const onlineCodes = new Set(result.records.filter((camera) => isOnlineStatus(camera.onlineStatus)).map((camera) => camera.code))
    failedStreams.value = new Set([...failedStreams.value].filter((code) => onlineCodes.has(code)))
  } catch {
    rawCameras.value = []
  }
}

function markStreamFailed(code: string) {
  failedStreams.value = new Set([...failedStreams.value, code])
}

async function loadCameraVideos() {
  try {
    const result = await listCameraVideos({
      cameraCode: selectedCameraCode.value,
      startTime: videoStartDate.value,
      endTime: videoEndDate.value,
      page: 1,
      pageSize: 8
    })
    cameraVideos.value = result.records
  } catch {
    cameraVideos.value = []
  }
}

const cameraPolling = usePolling(loadCameras, 3000)

onMounted(() => {
  cameraPolling.start()
  loadCameraVideos()
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
          >
            <header>
              <span>{{ card.title }}</span>
            </header>
            <div class="video-frame">
              <img
                v-if="card.hasStream"
                :class="card.className"
                :src="card.streamUrl || card.snapshotUrl"
                alt="施工现场监控画面"
                @error="markStreamFailed(card.code)"
              />
              <div v-else class="video-placeholder">
                <el-icon>
                  <VideoCamera />
                </el-icon>
                <span>{{ card.online ? '等待摄像头帧' : '摄像头离线' }}</span>
              </div>
              <button type="button" title="全屏查看">
                <el-icon>
                  <FullScreen />
                </el-icon>
              </button>
              <span class="live-badge" :class="{ waiting: !card.hasStream }">
                <el-icon>
                  <VideoCamera />
                </el-icon>
                {{ card.hasStream ? 'LIVE' : card.online ? 'WAIT' : 'OFF' }}
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

        <section class="history-panel">
          <header>
            <h2>历史视频</h2>
            <div class="history-filters">
              <select v-model="selectedCameraCode">
                <option value="">全部摄像头</option>
                <option v-for="camera in rawCameras" :key="camera.code" :value="camera.code">
                  {{ camera.name }}
                </option>
              </select>
              <input v-model="videoStartDate" type="date" />
              <input v-model="videoEndDate" type="date" />
              <button type="button" @click="loadCameraVideos">查询</button>
            </div>
          </header>
          <div class="history-list">
            <a v-for="video in cameraVideos" :key="video.id" :href="video.url" target="_blank" rel="noreferrer">
              <strong>{{ video.cameraName || video.cameraCode || '摄像头视频' }}</strong>
              <span>{{ video.createdAt || video.fileName || video.objectKey }}</span>
            </a>
            <div v-if="!cameraVideos.length" class="history-empty">暂无历史视频</div>
          </div>
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
  min-width: 0;
  padding: 14px 16px;
  background: #fff;
  border: 1px solid #edf1f6;
  border-radius: 8px;
}

.history-panel header {
  display: flex;
  gap: 12px;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 10px;
}

.history-panel h2 {
  margin: 0;
  color: #1f2937;
  font-size: 16px;
}

.history-filters {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  justify-content: flex-end;
}

.history-filters select,
.history-filters input,
.history-filters button {
  height: 32px;
  padding: 0 10px;
  color: #334155;
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  border-radius: 6px;
}

.history-filters button {
  color: #fff;
  cursor: pointer;
  background: #315b91;
  border-color: #315b91;
}

.history-list {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 8px;
}

.history-list a,
.history-empty {
  display: grid;
  gap: 4px;
  min-width: 0;
  padding: 10px 12px;
  color: #334155;
  text-decoration: none;
  background: #f8fafc;
  border: 1px solid #edf1f6;
  border-radius: 6px;
}

.history-list strong,
.history-list span {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.history-list strong {
  font-size: 13px;
}

.history-list span,
.history-empty {
  color: #64748b;
  font-size: 12px;
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

  .history-panel header,
  .history-filters {
    align-items: stretch;
    flex-direction: column;
  }

  .history-list {
    grid-template-columns: 1fr;
  }
}
</style>
