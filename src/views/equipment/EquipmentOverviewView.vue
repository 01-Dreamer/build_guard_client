<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { Monitor, TrendCharts } from '@element-plus/icons-vue'
import { listDevices, type DeviceView } from '../../api/devices'
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
const overviewStats = ref([
  { label: '在线设备', value: '0', icon: Monitor, tone: '#3b82f6' },
  { label: '报警总数', value: '0', icon: TrendCharts, tone: '#22c55e' },
  { label: '预警总数', value: '0', icon: TrendCharts, tone: '#38bdf8' },
  { label: '设备总数', value: '0', icon: Monitor, tone: '#f59e0b' }
])

function normalizeDeviceType(typeName?: string | null) {
  const name = typeName || '其他'
  if (name.includes('塔吊')) return '塔吊'
  if (name.includes('升降')) return '升降机'
  if (name.includes('高支模')) return '高支模'
  if (name.includes('基坑')) return '深基坑'
  return name
}

function coordinateByIndex(index: number, axis: 'x' | 'y') {
  const xValues = [66, 43, 28, 76, 55, 82, 18, 36, 62, 72]
  const yValues = [34, 78, 66, 51, 72, 76, 58, 42, 24, 62]
  return axis === 'x' ? xValues[index % xValues.length] : yValues[index % yValues.length]
}

function toOverviewDevice(device: DeviceView, index: number): EquipmentDevice {
  return {
    name: device.name,
    code: device.code,
    type: normalizeDeviceType(device.typeName),
    area: device.locationName || '-',
    online: device.onlineStatus === 1,
    x: device.x ?? coordinateByIndex(index, 'x'),
    y: device.y ?? coordinateByIndex(index, 'y'),
    warning: 0,
    alarm: 0
  }
}

async function loadOverviewDevices() {
  try {
    const result = await listDevices({ page: 1, pageSize: 100 })
    overviewDevices.value = result.records.map(toOverviewDevice)
    const total = overviewDevices.value.length
    const online = overviewDevices.value.filter((device) => device.online).length
    const warnings = overviewDevices.value.reduce((sum, device) => sum + device.warning, 0)
    const alarms = overviewDevices.value.reduce((sum, device) => sum + device.alarm, 0)
    overviewStats.value = [
      { label: '在线设备', value: String(online), icon: Monitor, tone: '#3b82f6' },
      { label: '报警总数', value: String(alarms), icon: TrendCharts, tone: '#22c55e' },
      { label: '预警总数', value: String(warnings), icon: TrendCharts, tone: '#38bdf8' },
      { label: '设备总数', value: String(total), icon: Monitor, tone: '#f59e0b' }
    ]
  } catch {
    overviewDevices.value = []
    overviewStats.value = overviewStats.value.map((stat) => ({ ...stat, value: '0' }))
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
              <div class="building building-a" />
              <div class="building building-b" />
              <div class="building building-c" />
              <div class="pit-area" />
              <div class="road road-main" />
              <div class="road road-cross" />
              <button
                v-for="device in overviewDevices"
                :key="device.code"
                class="device-pin"
                :class="[device.type, { offline: !device.online, alarm: device.alarm > 0 }]"
                :style="{ left: `${device.x}%`, top: `${device.y}%` }"
                type="button"
                :title="`${device.name} ${device.online ? '在线' : '离线'}`"
              >
                <span />
                <strong>{{ device.type }}</strong>
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
                  <strong>暂无设备数据</strong>
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
  background: #f8fbff;
}

.map-canvas {
  position: relative;
  width: 100%;
  height: 100%;
  min-height: 640px;
  overflow: hidden;
  background:
    linear-gradient(135deg, rgba(248, 250, 252, 0.94), rgba(241, 245, 249, 0.72)),
    repeating-linear-gradient(45deg, transparent 0 26px, rgba(148, 163, 184, 0.08) 26px 27px);
}

.building,
.pit-area,
.road {
  position: absolute;
  border: 1px solid #d7dee9;
  transform: rotate(-16deg);
}

.building {
  background: linear-gradient(135deg, #fff, #e9eef5);
  box-shadow: 18px 22px 34px rgba(15, 23, 42, 0.1);
}

.building::after {
  position: absolute;
  inset: 10px;
  content: "";
  background:
    repeating-linear-gradient(90deg, transparent 0 38px, rgba(49, 71, 104, 0.2) 38px 42px),
    repeating-linear-gradient(0deg, transparent 0 34px, rgba(49, 71, 104, 0.14) 34px 38px);
}

.building-a {
  left: 17%;
  top: 7%;
  width: 42%;
  height: 31%;
}

.building-b {
  right: 8%;
  top: 15%;
  width: 20%;
  height: 34%;
}

.building-c {
  right: 14%;
  bottom: 9%;
  width: 36%;
  height: 23%;
}

.pit-area {
  left: 8%;
  bottom: 13%;
  width: 31%;
  height: 30%;
  background:
    linear-gradient(135deg, rgba(245, 158, 11, 0.26), rgba(217, 119, 6, 0.08)),
    repeating-linear-gradient(90deg, rgba(120, 53, 15, 0.24) 0 8px, transparent 8px 24px);
  border-color: rgba(180, 83, 9, 0.26);
}

.road {
  background: rgba(226, 232, 240, 0.9);
  border-color: transparent;
}

.road-main {
  left: 15%;
  top: 45%;
  width: 76%;
  height: 8%;
}

.road-cross {
  left: 45%;
  top: 28%;
  width: 8%;
  height: 55%;
}

.device-pin {
  position: absolute;
  display: grid;
  gap: 2px;
  width: 48px;
  height: 54px;
  place-items: center;
  color: #f97316;
  cursor: pointer;
  background: transparent;
  border: 0;
  transform: translate(-50%, -50%);
}

.device-pin span {
  width: 28px;
  height: 28px;
  background: currentColor;
  clip-path: polygon(50% 0, 100% 50%, 50% 100%, 0 50%);
  box-shadow: 0 10px 20px rgba(249, 115, 22, 0.24);
}

.device-pin strong {
  color: currentColor;
  font-size: 11px;
  line-height: 1;
  text-shadow: 0 1px 0 #fff;
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

.device-pin.alarm span {
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
