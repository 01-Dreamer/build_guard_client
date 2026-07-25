<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { Cpu, DataLine, Odometer, Warning } from '@element-plus/icons-vue'
import {
  getConstructionAlarmTrend,
  getTowerCraneDashboard,
  type EquipmentAlarmTrendPoint,
  type EquipmentDashboard,
  type EquipmentInfoItem,
  type EquipmentMetric
} from '../../api/equipment'
import AppTopbar from '../../components/AppTopbar.vue'
import { usePolling } from '../../composables/usePolling'
import EquipmentChart from '../../components/equipment/EquipmentChart.vue'
import Equipment3DModel from '../../components/equipment/Equipment3DModel.vue'
import { formatDateTime } from '../../utils/format'
import { alarmTrendOption, gaugeOption, lineOption } from './chartOptions'

const dashboard = ref<EquipmentDashboard>({})
const alarmTrend = ref<EquipmentAlarmTrendPoint[]>([])
const towerTabs = computed(() => (dashboard.value.devices || []).map((device) => device.name))
const activeDevice = computed(() => dashboard.value.devices?.[0])
const towerInfo = computed(() =>
  (dashboard.value.info || []).map((item: EquipmentInfoItem) => ({
    ...item,
    value: String(item.value ?? '-'),
    tone: 'blue' as const
  }))
)
const workMetrics = computed(() =>
  (dashboard.value.workMetrics || []).map((metric: EquipmentMetric) => ({
    label: metric.label,
    value: `${metric.value ?? '-'}${metric.unit ?? ''}`
  }))
)
const realtimeIconMap = [Odometer, DataLine, Cpu, DataLine, Warning, Odometer]
const realtimeMetrics = computed(() =>
  (dashboard.value.realtimeMetrics || []).map((metric: EquipmentMetric, index) => ({
    label: metric.label,
    value: `${metric.value ?? '-'}${metric.unit ?? ''}`,
    icon: realtimeIconMap[index % realtimeIconMap.length]
  }))
)
const alarmSummary = computed(() => ({
  todayWarnings: dashboard.value.alarmSummary?.todayWarnings ?? 0,
  totalWarnings: dashboard.value.alarmSummary?.totalWarnings ?? 0,
  todayAlarms: dashboard.value.alarmSummary?.todayAlarms ?? 0,
  totalAlarms: dashboard.value.alarmSummary?.totalAlarms ?? 0
}))
const momentSeries = computed(() => (dashboard.value.telemetry || []).map((item) => Number(item.moment) || 0))
const weightSeries = computed(() => (dashboard.value.telemetry || []).map((item) => Number(item.weight) || 0))
const rotationValue = computed(() => Number(dashboard.value.telemetry?.at(-1)?.rotation) || 0)
const reportedAt = computed(() => formatDateTime(dashboard.value.telemetry?.at(-1)?.time))
const reportedAtParts = computed(() => splitDateTime(dashboard.value.telemetry?.at(-1)?.time))

function splitDateTime(value?: string | number | Date | null) {
  const formatted = formatDateTime(value)
  const [date = formatted, time = ''] = formatted.split(' ')
  return { date, time }
}

async function loadTowerDashboard() {
  try {
    const [dashboardResult, trendResult] = await Promise.all([
      getTowerCraneDashboard(),
      getConstructionAlarmTrend('tower_crane')
    ])
    dashboard.value = dashboardResult
    alarmTrend.value = trendResult
  } catch {
    dashboard.value = {}
    alarmTrend.value = []
  }
}

const towerPolling = usePolling(loadTowerDashboard, 3000)

onMounted(() => {
  towerPolling.start()
})
</script>

<template>
  <main class="equipment-page">
    <AppTopbar />

    <section class="equipment-content">
      <div class="equipment-stack">
        <div class="equipment-breadcrumb">施工设备 &gt; 塔吊监测分析</div>

        <section class="machine-layout">
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

            <EquipmentChart title="报警趋势" :option="alarmTrendOption(alarmTrend)" />

            <section class="equipment-panel">
              <h2>设备信息</h2>
              <div class="info-grid">
                <div
                  v-for="item in towerInfo"
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

          <section class="equipment-panel tower-workspace">
            <nav class="tab-list">
              <button
                v-for="tab in towerTabs"
                :key="tab"
                type="button"
                :class="{ active: tab === activeDevice?.name }"
              >
                {{ tab }}
                <span class="live-dot" />
              </button>
              <button v-if="!towerTabs.length" type="button" class="active">暂无设备</button>
            </nav>

            <div class="tower-hero">
              <div class="tower-model-info">
                <strong>设备编号 {{ activeDevice?.code || '-' }}</strong>
                <span class="data-time" :title="reportedAt">
                  <em>数据获取时间</em>
                  {{ reportedAtParts.date }}
                  <b v-if="reportedAtParts.time">{{ reportedAtParts.time }}</b>
                </span>
              </div>

              <div class="tower-model-card">
                <Equipment3DModel model="tower" />
              </div>

              <div class="work-list">
                <article v-for="metric in workMetrics" :key="metric.label" class="metric-card">
                  <strong>{{ metric.value }}</strong>
                  <span>{{ metric.label }}</span>
                </article>
              </div>

              <div class="gauge-wrap">
                <EquipmentChart title="回转角度" :option="gaugeOption(rotationValue)" />
              </div>
            </div>

            <section class="realtime-metrics">
              <h2>实时工作数据</h2>
              <div class="metric-tile-grid">
                <article v-for="metric in realtimeMetrics" :key="metric.label" class="metric-tile">
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
          </section>

          <aside class="machine-right">
            <EquipmentChart title="实时力矩" :option="lineOption('#5b7cfa', momentSeries)" />
            <EquipmentChart title="实时吊重" :option="lineOption('#5b7cfa', weightSeries, '吊重', 'T')" />
          </aside>
        </section>
      </div>
    </section>
  </main>
</template>

<style scoped>
.machine-layout {
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
  grid-template-rows: repeat(2, minmax(0, 1fr));
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

.tower-workspace {
  display: grid;
  grid-template-rows: auto minmax(300px, 1fr) minmax(158px, 214px);
  gap: 12px;
  height: 100%;
  overflow: hidden;
}

.tower-hero {
  display: grid;
  grid-template-columns: minmax(0, 1fr);
  grid-template-rows: auto minmax(360px, 1fr) auto;
  gap: 14px;
  align-items: stretch;
  min-height: 0;
  overflow: hidden;
  padding: 14px;
  background:
    linear-gradient(180deg, #fbfdff, #f7faff),
    radial-gradient(circle at 34% 28%, rgba(47, 111, 237, 0.12), transparent 38%);
  border: 1px solid #e6eefb;
  border-radius: 8px;
}

.tower-model-card {
  position: relative;
  display: grid;
  grid-template-rows: minmax(0, 1fr);
  grid-row: 2;
  min-width: 0;
  height: 100%;
  min-height: 360px;
  overflow: hidden;
  padding: 0;
  border-radius: 8px;
}

.tower-model-card :deep(.equipment-3d-model) {
  min-width: 0;
  min-height: 360px;
  border: 1px solid #e2eaf6;
}

.tower-model-info {
  grid-column: 1 / -1;
  grid-row: 1;
  display: flex;
  gap: 12px 18px;
  align-items: center;
  justify-content: space-between;
  min-width: 0;
  min-height: 44px;
  padding: 8px 12px;
  color: #2f3f58;
  background: rgba(255, 255, 255, 0.78);
  border: 1px solid rgba(203, 213, 225, 0.82);
  border-radius: 8px;
  box-shadow: 0 12px 26px rgba(30, 41, 59, 0.1);
  backdrop-filter: blur(10px);
}

.tower-model-info strong,
.tower-model-info span {
  overflow: hidden;
  font-weight: 900;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.tower-model-info strong {
  color: #1e3a8a;
  font-size: 13px;
}

.tower-model-info span {
  color: #64748b;
  font-size: 12px;
}

.tower-model-info .data-time {
  display: inline-flex;
  gap: 6px;
  justify-content: flex-end;
  min-width: 0;
  color: #315985;
  font-family: "DIN Alternate", "Roboto Mono", Consolas, monospace;
  font-size: 13px;
  line-height: 1.2;
}

.tower-model-info .data-time em {
  color: #64748b;
  font-family: inherit;
  font-style: normal;
}

.tower-model-info .data-time b {
  color: #2f3f58;
  font-weight: 900;
}

.work-list {
  display: grid;
  grid-row: 3;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 9px;
  align-self: stretch;
  align-content: start;
  min-width: 0;
}

.metric-card {
  display: flex;
  gap: 14px;
  align-items: center;
  justify-content: space-between;
  min-width: 0;
  min-height: 52px;
  padding: 8px 14px;
  background: #fff;
  border: 1px solid #e6eefb;
  border-radius: 8px;
}

.metric-card strong {
  flex: 0 0 auto;
}

.metric-card span {
  min-width: 0;
  overflow: hidden;
  color: #64748b;
  font-weight: 900;
  text-align: right;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.gauge-wrap {
  display: none;
}

.gauge-wrap :deep(.chart-card) {
  height: 280px;
  box-shadow: none;
}

.realtime-metrics h2 {
  margin: 0 0 10px;
  font-size: 16px;
}

.realtime-metrics {
  display: grid;
  grid-template-rows: auto minmax(0, 1fr);
  min-height: 0;
  overflow: hidden;
}

.realtime-metrics .metric-tile-grid {
  gap: 8px;
  min-height: 0;
  overflow: auto;
  scrollbar-gutter: stable;
}

.realtime-metrics :deep(.metric-tile),
.realtime-metrics .metric-tile {
  min-height: 56px;
  padding: 8px 12px;
}

.realtime-metrics :deep(.metric-tile strong),
.realtime-metrics .metric-tile strong {
  font-size: 18px;
}

@media (max-width: 1180px) {
  .machine-layout {
    grid-template-columns: 1fr;
  }
}
</style>
