<script setup lang="ts">
import { FullScreen, VideoCamera } from '@element-plus/icons-vue'
import AppTopbar from '../../components/AppTopbar.vue'
import heroUrl from '../../assets/dashboard-hero.png'

interface CameraItem {
  name: string
  area: string
  status: '在线' | '离线'
}

const cameras: CameraItem[] = [
  { name: '住宅区施工处', area: '1号住宅小区', status: '在线' },
  { name: '基坑1区摄像头', area: '基坑1区', status: '在线' },
  { name: '西区大门口摄像头', area: '出入口', status: '在线' },
  { name: '东区大门口摄像头', area: '基坑1区', status: '在线' }
]

const monitorCards = [
  { title: '摄像头 1', className: 'feed-one' },
  { title: '摄像头 2', className: 'feed-two' },
  { title: '摄像头 3', className: 'feed-three' },
  { title: '摄像头 4', className: 'feed-four' }
]
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
        </section>
      </aside>

      <section class="monitor-grid" aria-label="现场摄像头">
        <article
          v-for="card in monitorCards"
          :key="card.title"
          class="monitor-card"
        >
          <header>
            <span>{{ card.title }}</span>
          </header>
          <div class="video-frame">
            <img :class="card.className" :src="heroUrl" alt="施工现场监控画面" />
            <button type="button" title="全屏查看">
              <el-icon>
                <FullScreen />
              </el-icon>
            </button>
            <span class="live-badge">
              <el-icon>
                <VideoCamera />
              </el-icon>
              LIVE
            </span>
          </div>
        </article>
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
  overflow: hidden;
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
  grid-template-columns: 18px 1fr auto;
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
  padding: 4px 9px;
  color: #16a34a;
  font-size: 12px;
  background: #dcfce7;
  border-radius: 6px;
}

.camera-item b.offline {
  color: #dc2626;
  background: #fee2e2;
}

.monitor-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(360px, 1fr));
  grid-template-rows: repeat(2, minmax(0, 1fr));
  gap: 16px 18px;
  min-height: 0;
  max-width: 1420px;
  padding: 24px 18px 18px;
  overflow: hidden;
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

@media (max-width: 1180px) {
  .monitor-shell {
    grid-template-columns: 1fr;
  }

  .monitor-grid {
    padding-top: 0;
  }
}

@media (max-width: 820px) {
  .monitor-grid {
    grid-template-columns: 1fr;
    padding-inline: 0;
  }
}
</style>
