<script setup lang="ts">
import { markRaw, onMounted, ref } from 'vue'
import { Monitor, TrendCharts } from '@element-plus/icons-vue'
import { getEquipmentOverview, type EquipmentOverviewDevice } from '../../api/equipment'
import AppTopbar from '../../components/AppTopbar.vue'
import {
  equipmentMenuItems,
  type EquipmentDevice
} from './data'

const overviewMenuPaths = [
  '/equipment/overview',
  '/equipment/tower-crane',
  '/equipment/elevator',
  '/equipment/formwork',
  '/equipment/deep-pit'
]

const overviewMenuItems = equipmentMenuItems.filter((item) => overviewMenuPaths.includes(item.path))
const overviewDevices = ref<EquipmentDevice[]>([])
const loadingOverview = ref(true)
const overviewStats = ref(createOverviewStats())

function createOverviewStats(values?: { online?: number; alarms?: number; warnings?: number; total?: number }) {
  return [
    { label: '在线设备', value: formatStat(values?.online), icon: markRaw(Monitor), tone: '#3b82f6' },
    { label: '报警总数', value: formatStat(values?.alarms), icon: markRaw(TrendCharts), tone: '#ef4444' },
    { label: '预警总数', value: formatStat(values?.warnings), icon: markRaw(TrendCharts), tone: '#f59e0b' },
    { label: '设备总数', value: formatStat(values?.total), icon: markRaw(Monitor), tone: '#22c55e' }
  ]
}

function formatStat(value?: number) {
  return value === undefined ? '-' : String(value)
}

function normalizeDeviceType(typeName?: string | null) {
  const name = typeName || '其他'
  if (name.includes('塔吊')) return '塔吊'
  if (name.includes('升降')) return '升降机'
  if (name.includes('高支模')) return '高支模'
  if (name.includes('基坑')) return '深基坑'
  return name
}

function coordinateByIndex(index: number, axis: 'x' | 'y') {
  const column = index % 4
  const row = Math.floor(index / 4) % 3
  return axis === 'x' ? 18 + column * 22 : 22 + row * 24
}

function toOverviewDevice(device: EquipmentOverviewDevice, index: number): EquipmentDevice {
  const alarm = (device.metrics || []).filter((metric) => metric.status === 'alarm').length
  const warning = (device.metrics || []).filter((metric) => metric.status === 'warn').length

  return {
    name: device.name,
    code: device.code,
    type: normalizeDeviceType(device.typeName),
    area: device.locationName || '-',
    online: device.onlineStatus === 1,
    x: device.x ?? coordinateByIndex(index, 'x'),
    y: device.y ?? coordinateByIndex(index, 'y'),
    warning,
    alarm
  }
}

async function loadOverviewDevices() {
  loadingOverview.value = true
  try {
    const result = await getEquipmentOverview()
    overviewDevices.value = result.devices.map(toOverviewDevice)
    overviewStats.value = createOverviewStats({
      online: result.online ?? 0,
      alarms: result.totalAlarms ?? 0,
      warnings: result.totalWarnings ?? 0,
      total: result.total ?? 0
    })
  } catch {
    overviewDevices.value = []
    overviewStats.value = createOverviewStats({ online: 0, alarms: 0, warnings: 0, total: 0 })
  } finally {
    loadingOverview.value = false
  }
}

onMounted(loadOverviewDevices)
</script>

<template>
  <main class="equipment-page">
    <AppTopbar />

    <section class="equipment-content">
      <div class="equipment-stack">
        <div class="equipment-breadcrumb">施工设备 &gt; 总览</div>

        <section class="overview-layout">
          <aside class="overview-nav equipment-panel">
            <RouterLink
              v-for="item in overviewMenuItems"
              :key="item.path"
              :to="item.path"
              :class="{ active: item.path === '/equipment/overview' }"
            >
              <el-icon>
                <component :is="item.icon" />
              </el-icon>
              <span>{{ item.label.replace('监测分析', '') }}</span>
            </RouterLink>
          </aside>

          <section class="site-map equipment-panel" aria-label="施工设备点位总览">
            <div class="map-canvas">
              <div class="map-shade" />
              <button
                v-for="device in overviewDevices"
                :key="device.code"
                class="device-pin"
                :class="[device.type, { offline: !device.online, alarm: device.alarm > 0 }]"
                :style="{ left: `${device.x}%`, top: `${device.y}%` }"
                type="button"
                :title="`${device.name} ${device.online ? '在线' : '离线'}`"
              >
                <i />
                <span>
                  <strong>{{ device.type }}</strong>
                  <em>{{ device.code }}</em>
                </span>
              </button>
            </div>
          </section>

          <aside class="overview-side">
            <section class="equipment-panel">
              <h2>
                <el-icon>
                  <TrendCharts />
                </el-icon>
                设备运行概况
              </h2>
              <div class="metric-tile-grid">
                <article v-for="stat in overviewStats" :key="stat.label" class="metric-tile">
                  <span class="icon" :style="{ color: stat.tone }">
                    <el-icon>
                      <component :is="stat.icon" />
                    </el-icon>
                  </span>
                  <div>
                    <strong>{{ stat.value }}</strong>
                    <span>{{ stat.label }}</span>
                  </div>
                </article>
              </div>
            </section>

            <section class="equipment-panel realtime-list">
              <h2>
                <el-icon>
                  <Monitor />
                </el-icon>
                设备实时运行列表
              </h2>
              <div class="runtime-list-body">
                <div class="runtime-row" v-for="device in overviewDevices" :key="device.code">
                  <strong :title="device.name">{{ device.name }}</strong>
                  <span>{{ device.code }}</span>
                  <em :class="{ offline: !device.online }">{{ device.online ? '运行' : '离线' }}</em>
                </div>
                <div v-if="!overviewDevices.length" class="runtime-row">
                  <strong>{{ loadingOverview ? '设备数据加载中' : '暂无设备数据' }}</strong>
                  <span>-</span>
                  <em class="offline">-</em>
                </div>
              </div>
            </section>
          </aside>
        </section>
      </div>
    </section>
  </main>
</template>

<style scoped>
.overview-layout {
  display: grid;
  grid-template-columns: 92px minmax(0, 1fr) 360px;
  gap: 14px;
  height: 100%;
  min-height: 0;
}

.overview-nav {
  display: grid;
  align-content: start;
  gap: 10px;
  padding: 12px 10px;
}

.overview-nav a {
  display: grid;
  grid-template-rows: auto auto;
  gap: 4px;
  align-content: center;
  justify-items: center;
  min-height: 74px;
  color: #7aa5f8;
  font-size: 12px;
  font-weight: 900;
  text-align: center;
  text-decoration: none;
  background: #f8fbff;
  border: 1px solid #e6eefb;
  border-radius: 8px;
}

.overview-nav a.active {
  color: #fff;
  background: #314768;
  border-color: #314768;
}

.overview-nav .el-icon {
  font-size: 22px;
}

.site-map {
  padding: 0;
  overflow: hidden;
  background: #f8fbff;
}

.map-canvas {
  position: relative;
  width: 100%;
  height: 100%;
  min-height: 640px;
  overflow: hidden;
  background:
    linear-gradient(90deg, rgba(247, 250, 252, 0.05), rgba(247, 250, 252, 0.16)),
    url("/images/equipment-overview-map.png") center / cover no-repeat;
}

.map-canvas::before {
  position: absolute;
  inset: 0;
  pointer-events: none;
  content: "";
  background:
    linear-gradient(180deg, rgba(10, 20, 35, 0.04), rgba(10, 20, 35, 0.18)),
    radial-gradient(circle at 52% 48%, transparent 0 42%, rgba(15, 23, 42, 0.08) 75%);
}

.map-shade {
  position: absolute;
  inset: 18px;
  pointer-events: none;
  border: 1px solid rgba(255, 255, 255, 0.5);
  box-shadow:
    inset 0 0 0 1px rgba(15, 23, 42, 0.06),
    inset 0 -90px 110px rgba(15, 23, 42, 0.06);
}

.device-pin {
  position: absolute;
  z-index: 3;
  display: inline-flex;
  gap: 8px;
  align-items: center;
  min-width: 84px;
  height: 36px;
  padding: 0 10px 0 5px;
  color: #f97316;
  cursor: pointer;
  background: rgba(255, 255, 255, 0.86);
  border: 1px solid rgba(255, 255, 255, 0.92);
  border-radius: 999px;
  box-shadow:
    0 12px 26px rgba(15, 23, 42, 0.16),
    inset 0 0 0 1px rgba(15, 23, 42, 0.04);
  transform: translate(-50%, -50%);
  backdrop-filter: blur(8px);
}

.device-pin i {
  position: relative;
  display: block;
  width: 26px;
  height: 26px;
  background: currentColor;
  clip-path: polygon(50% 0, 100% 50%, 50% 100%, 0 50%);
  box-shadow: 0 10px 20px rgba(249, 115, 22, 0.24);
}

.device-pin i::after {
  position: absolute;
  inset: 8px;
  content: "";
  background: #fff;
  clip-path: inherit;
}

.device-pin span {
  display: grid;
  gap: 1px;
  min-width: 0;
  text-align: left;
}

.device-pin strong,
.device-pin em {
  overflow: hidden;
  max-width: 72px;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.device-pin strong {
  color: #26364f;
  font-size: 11px;
  line-height: 1;
}

.device-pin em {
  color: #64748b;
  font-size: 10px;
  font-style: normal;
  font-weight: 900;
}

.device-pin.升降机 {
  color: #3b82f6;
}

.device-pin.高支模 {
  color: #22c55e;
}

.device-pin.深基坑 {
  color: #8b5cf6;
}

.device-pin.offline {
  color: #ef4444;
}

.device-pin.alarm i {
  animation: pulse 1.4s infinite;
}

.overview-side {
  display: grid;
  grid-template-rows: auto minmax(0, 1fr);
  gap: 14px;
  min-height: 0;
}

.overview-side .metric-tile-grid {
  gap: 12px;
}

.overview-side .metric-tile {
  min-height: 76px;
  background: linear-gradient(180deg, #fbfdff, #f7faff);
}

.realtime-list {
  display: grid;
  grid-template-rows: auto minmax(0, 1fr);
}

.runtime-list-body {
  min-height: 0;
  overflow: auto;
}

.runtime-row {
  display: grid;
  grid-template-columns: minmax(0, 1fr) 80px 54px;
  gap: 10px;
  align-items: center;
  min-height: 48px;
  border-bottom: 1px solid #edf1f6;
}

.runtime-row strong,
.runtime-row span {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.runtime-row strong {
  color: #334155;
  font-size: 14px;
}

.runtime-row span {
  color: #64748b;
  font-size: 13px;
  font-weight: 800;
}

.runtime-row em {
  color: #059669;
  font-style: normal;
  font-weight: 900;
}

.runtime-row em.offline {
  color: #ef4444;
}

@keyframes pulse {
  0%,
  100% {
    transform: scale(1);
  }

  50% {
    transform: scale(1.16);
  }
}

@media (max-width: 1180px) {
  .overview-layout {
    grid-template-columns: 1fr;
  }

  .overview-nav {
    grid-template-columns: repeat(4, minmax(0, 1fr));
  }

  .map-canvas {
    height: 560px;
    min-height: 560px;
  }
}
</style>
