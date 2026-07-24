<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { Bottom, DataLine, Odometer, Top, User, Warning } from '@element-plus/icons-vue'
import { getElevatorDashboard, type EquipmentDashboard, type EquipmentInfoItem, type EquipmentMetric } from '../../api/equipment'
import AppTopbar from '../../components/AppTopbar.vue'
import { usePolling } from '../../composables/usePolling'
import EquipmentChart from '../../components/equipment/EquipmentChart.vue'
import { formatDateTime } from '../../utils/format'
import { alarmTrendOption, lineOption } from './chartOptions'

const dashboard = ref<EquipmentDashboard>({})
const elevatorTabs = computed(() => (dashboard.value.devices || []).map((device) => device.name))
const activeDevice = computed(() => dashboard.value.devices?.[0])
const elevatorInfo = computed(() =>
  (dashboard.value.info || []).map((item: EquipmentInfoItem) => ({
    ...item,
    value: String(item.value ?? '-'),
    tone: 'blue' as const
  }))
)
const statusIcons = [Odometer, Top, DataLine, Warning, User]
const statusCards = computed(() =>
  (dashboard.value.realtimeMetrics || []).slice(0, 5).map((metric: EquipmentMetric, index) => ({
    label: metric.label,
    value: `${metric.value ?? '-'}${metric.unit ?? ''}`,
    icon: statusIcons[index % statusIcons.length]
  }))
)
const bottomMetrics = computed(() =>
  (dashboard.value.workMetrics || []).slice(0, 3).map((metric: EquipmentMetric, index) => ({
    label: metric.label,
    value: `${metric.value ?? '-'}${metric.unit ?? ''}`,
    icon: [Top, Bottom, Warning][index],
    danger: index === 2
  }))
)
const alarmSummary = computed(() => ({
  todayWarnings: dashboard.value.alarmSummary?.todayWarnings ?? 0,
  totalWarnings: dashboard.value.alarmSummary?.totalWarnings ?? 0,
  todayAlarms: dashboard.value.alarmSummary?.todayAlarms ?? 0,
  totalAlarms: dashboard.value.alarmSummary?.totalAlarms ?? 0
}))
const speedSeries = computed(() => (dashboard.value.telemetry || []).map((item) => Number(item.speed) || 0))
const loadSeries = computed(() => (dashboard.value.telemetry || []).map((item) => Number(item.loadWeight) || 0))
const heightSeries = computed(() => (dashboard.value.telemetry || []).map((item) => Number(item.height) || 0))
const reportedAt = computed(() => formatDateTime(dashboard.value.telemetry?.at(-1)?.time))
const reportedAtParts = computed(() => splitDateTime(dashboard.value.telemetry?.at(-1)?.time))

function splitDateTime(value?: string | number | Date | null) {
  const formatted = formatDateTime(value)
  const [date = formatted, time = ''] = formatted.split(' ')
  return { date, time }
}

async function loadElevatorDashboard() {
  try {
    dashboard.value = await getElevatorDashboard()
  } catch {
    dashboard.value = {}
  }
}

const elevatorPolling = usePolling(loadElevatorDashboard, 3000)

onMounted(() => {
  elevatorPolling.start()
})
</script>

<template>
  <main class="equipment-page">
    <AppTopbar />

    <section class="equipment-content">
      <div class="equipment-stack">
        <div class="equipment-breadcrumb">施工设备 &gt; 升降机监测分析</div>

        <section class="elevator-layout">
          <aside class="machine-left">
            <section class="equipment-panel alarm-summary">
              <h2>
                <el-icon>
                  <Warning />
                </el-icon>
                设备报警
              </h2>
              <div class="alarm-counts">
                <article>
                  <strong>{{ alarmSummary.todayWarnings }}</strong>
                  <span>当日预警</span>
                  <b>{{ alarmSummary.totalWarnings }}</b>
                  <em>累计预警</em>
                </article>
                <article class="red">
                  <strong>{{ alarmSummary.todayAlarms }}</strong>
                  <span>当日报警</span>
                  <b>{{ alarmSummary.totalAlarms }}</b>
                  <em>累计报警</em>
                </article>
              </div>
            </section>

            <EquipmentChart title="报警趋势" :option="alarmTrendOption()" />

            <section class="equipment-panel">
              <h2>设备信息</h2>
              <div class="info-grid">
                <div
                  v-for="item in elevatorInfo"
                  :key="item.label"
                  class="info-item"
                  :class="`tone-${item.tone}`"
                >
                  <i />
                  <span>{{ item.label }}</span>
                  <strong>{{ item.value }}</strong>
                </div>
              </div>
            </section>
          </aside>

          <section class="equipment-panel elevator-main">
            <nav class="tab-list">
              <button
                v-for="tab in elevatorTabs"
                :key="tab"
                type="button"
                :class="{ active: tab === activeDevice?.name }"
              >
                {{ tab }}
                <span class="live-dot" />
              </button>
              <button v-if="!elevatorTabs.length" type="button" class="active">暂无设备</button>
            </nav>

            <div class="elevator-scene">
              <div class="device-meta">
                <span>设备编号 <strong>{{ activeDevice?.code || '-' }}</strong></span>
                <span class="data-time" :title="reportedAt">
                  数据获取时间
                  <strong>{{ reportedAtParts.date }}<b v-if="reportedAtParts.time"> {{ reportedAtParts.time }}</b></strong>
                </span>
              </div>

              <div class="status-column left">
                <article v-for="card in statusCards.slice(0, 2)" :key="card.label" class="sensor-card">
                  <el-icon>
                    <component :is="card.icon" />
                  </el-icon>
                  <span>{{ card.label }}</span>
                  <strong>{{ card.value }}</strong>
                </article>
              </div>

              <div class="elevator-shaft">
                <div class="shaft-rail" />
                <div class="cab" />
                <div class="counterweight" />
              </div>

              <div class="status-column right">
                <article v-for="card in statusCards.slice(2)" :key="card.label" class="sensor-card">
                  <el-icon>
                    <component :is="card.icon" />
                  </el-icon>
                  <span>{{ card.label }}</span>
                  <strong>{{ card.value }}</strong>
                </article>
              </div>
            </div>

            <div class="bottom-status">
              <article
                v-for="metric in bottomMetrics"
                :key="metric.label"
                class="metric-tile"
                :class="{ danger: metric.danger }"
              >
                <span class="icon">
                  <el-icon>
                    <component :is="metric.icon" />
                  </el-icon>
                </span>
                <div>
                  <strong>{{ metric.value }}</strong>
                  <span>{{ metric.label }}</span>
                </div>
              </article>
            </div>
          </section>

          <aside class="machine-right">
            <EquipmentChart title="实时速度" :option="lineOption('#60a5fa', speedSeries, '速度', 'm/s')" />
            <EquipmentChart title="实时载重" :option="lineOption('#22c55e', loadSeries, '载重', 'KG')" />
            <EquipmentChart title="实时高度" :option="lineOption('#f59e0b', heightSeries, '高度', 'm')" />
          </aside>
        </section>
      </div>
    </section>
  </main>
</template>

<style scoped>
.elevator-layout {
  display: grid;
  grid-template-columns: 300px minmax(0, 1fr) 330px;
  gap: 14px;
  min-height: 0;
}

.tab-list button {
  display: inline-flex;
  gap: 8px;
  align-items: center;
  height: 34px;
  padding: 0 16px;
  color: #475569;
  font-size: 14px;
  font-weight: 900;
  cursor: pointer;
  background: #f8fafc;
  border: 1px solid #dbe3ee;
  border-radius: 6px;
}

.tab-list button.active {
  color: #fff;
  background: #3f6fed;
  border-color: #3f6fed;
}

.machine-left,
.machine-right {
  display: grid;
  align-content: start;
  gap: 12px;
  min-height: 0;
}

.machine-right {
  grid-template-rows: repeat(3, minmax(0, 1fr));
  align-content: stretch;
}

.alarm-counts {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 14px;
}

.alarm-counts article {
  display: grid;
  place-items: center;
  min-height: 112px;
  color: #3f6fed;
  background: #f8fbff;
  border: 1px solid #e6eefb;
  border-radius: 8px;
}

.alarm-counts article.red {
  color: #ef4444;
}

.alarm-counts strong,
.alarm-counts b {
  font-size: 24px;
  line-height: 1;
}

.alarm-counts span,
.alarm-counts em {
  color: #64748b;
  font-style: normal;
  font-weight: 800;
}

.elevator-main {
  display: grid;
  grid-template-rows: auto minmax(300px, 1fr) auto;
  gap: 12px;
}

.elevator-scene {
  position: relative;
  display: grid;
  grid-template-columns: minmax(150px, 1fr) 170px minmax(150px, 1fr);
  gap: 14px;
  align-items: center;
  min-height: 0;
  overflow: hidden;
  padding: 42px 20px 20px;
  background: linear-gradient(180deg, #fbfdff, #f7faff);
  border: 1px solid #e6eefb;
  border-radius: 8px;
}

.device-meta {
  position: absolute;
  top: 16px;
  left: 24px;
  display: flex;
  right: 24px;
  flex-wrap: wrap;
  gap: 8px 26px;
  color: #64748b;
  font-weight: 900;
}

.device-meta strong {
  display: inline-block;
  color: #6d95ff;
}

.device-meta .data-time strong {
  color: #6d95ff;
  font-family: "DIN Alternate", "Roboto Mono", Consolas, monospace;
  letter-spacing: 0;
}

.device-meta .data-time b {
  color: #2f3f58;
}

.status-column {
  display: grid;
  gap: 18px;
}

.sensor-card {
  display: grid;
  grid-template-columns: 42px minmax(0, 1fr);
  gap: 4px 10px;
  align-items: center;
  min-height: 86px;
  padding: 14px;
  background: #fff;
  border: 1px solid #e6eefb;
  border-radius: 8px;
  box-shadow: 0 12px 24px rgba(59, 130, 246, 0.08);
}

.sensor-card .el-icon {
  grid-row: 1 / 3;
  display: grid;
  width: 42px;
  height: 42px;
  place-items: center;
  color: #60a5fa;
  font-size: 22px;
  background: #eaf2ff;
  border-radius: 50%;
}

.sensor-card span {
  overflow: hidden;
  color: #64748b;
  font-weight: 900;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.sensor-card strong {
  overflow: hidden;
  color: #6d95ff;
  font-size: 18px;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.elevator-shaft {
  position: relative;
  height: 330px;
}

.shaft-rail {
  position: absolute;
  left: 50%;
  bottom: 12px;
  width: 38px;
  height: 286px;
  background:
    repeating-linear-gradient(45deg, transparent 0 16px, rgba(255, 255, 255, 0.94) 16px 20px),
    #7db0ff;
  border: 3px solid #3f6fed;
  transform: translateX(-50%);
}

.shaft-rail::before {
  position: absolute;
  left: -36px;
  right: -36px;
  bottom: -8px;
  height: 8px;
  content: "";
  background: #7db0ff;
  border-radius: 999px;
}

.cab,
.counterweight {
  position: absolute;
  background: #fbbf24;
  border: 3px solid #f59e0b;
  border-radius: 4px;
}

.cab {
  right: 24px;
  top: 154px;
  width: 52px;
  height: 68px;
}

.counterweight {
  left: 24px;
  top: 76px;
  width: 48px;
  height: 64px;
}

.bottom-status {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 10px;
}

.bottom-status .metric-tile {
  min-height: 56px;
  padding: 8px 12px;
}

.bottom-status .metric-tile strong {
  font-size: 18px;
}

.metric-tile.danger strong {
  color: #ef4444;
}

@media (max-width: 1180px) {
  .elevator-layout,
  .elevator-scene,
  .bottom-status {
    grid-template-columns: 1fr;
  }
}
</style>
