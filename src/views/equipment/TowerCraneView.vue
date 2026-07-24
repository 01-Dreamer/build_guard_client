<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { Cpu, DataLine, Odometer, Warning } from '@element-plus/icons-vue'
import { getTowerCraneDashboard, type EquipmentDashboard, type EquipmentInfoItem, type EquipmentMetric } from '../../api/equipment'
import AppTopbar from '../../components/AppTopbar.vue'
import { usePolling } from '../../composables/usePolling'
import EquipmentChart from '../../components/equipment/EquipmentChart.vue'
import { formatDateTime } from '../../utils/format'
import { alarmTrendOption, gaugeOption, lineOption } from './chartOptions'

const dashboard = ref<EquipmentDashboard>({})
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
    dashboard.value = await getTowerCraneDashboard()
  } catch {
    dashboard.value = {}
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

            <EquipmentChart title="报警趋势" :option="alarmTrendOption()" />

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
              <div class="tower-drawing">
                <div class="tower-mast" />
                <div class="tower-jib" />
                <div class="tower-counter" />
                <div class="tower-hook" />
                <strong>设备编号 {{ activeDevice?.code || '-' }}</strong>
                <span class="data-time" :title="reportedAt">
                  <em>数据获取时间</em>
                  {{ reportedAtParts.date }}
                  <b v-if="reportedAtParts.time">{{ reportedAtParts.time }}</b>
                </span>
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
  grid-template-rows: auto minmax(300px, 1fr) auto;
  gap: 12px;
}

.tower-hero {
  display: grid;
  grid-template-columns: minmax(180px, 0.85fr) minmax(220px, 1fr) minmax(180px, 0.8fr);
  gap: 14px;
  align-items: center;
  min-height: 0;
  overflow: hidden;
  padding: 20px;
  background: linear-gradient(180deg, #fbfdff, #f7faff);
  border: 1px solid #e6eefb;
  border-radius: 8px;
}

.tower-drawing {
  position: relative;
  height: 100%;
  min-height: 260px;
}

.tower-mast,
.tower-jib,
.tower-counter,
.tower-hook {
  position: absolute;
  background: #6fa0ff;
}

.tower-mast {
  left: 44%;
  bottom: 58px;
  width: 24px;
  height: 190px;
  background:
    repeating-linear-gradient(45deg, transparent 0 14px, rgba(255, 255, 255, 0.9) 14px 18px),
    #6fa0ff;
  border: 3px solid #3f6fed;
}

.tower-jib {
  left: 33%;
  top: 56px;
  width: 58%;
  height: 16px;
  transform: skewX(22deg);
  transform-origin: left center;
}

.tower-counter {
  left: 19%;
  top: 58px;
  width: 70px;
  height: 22px;
  background: #f59e0b;
}

.tower-hook {
  left: 78%;
  top: 72px;
  width: 3px;
  height: 82px;
}

.tower-hook::after {
  position: absolute;
  left: -22px;
  bottom: -30px;
  width: 48px;
  height: 22px;
  content: "";
  background: #60a5fa;
  border-radius: 3px;
}

.tower-drawing strong,
.tower-drawing span {
  position: absolute;
  left: 22%;
  right: 0;
  overflow: hidden;
  color: #64748b;
  font-weight: 900;
  text-align: center;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.tower-drawing strong {
  bottom: 32px;
}

.tower-drawing span {
  bottom: 2px;
  color: #6d95ff;
}

.tower-drawing .data-time {
  display: inline-flex;
  gap: 6px;
  justify-content: center;
  color: #315985;
  font-family: "DIN Alternate", "Roboto Mono", Consolas, monospace;
  font-size: 13px;
  line-height: 1.2;
}

.tower-drawing .data-time em {
  color: #64748b;
  font-family: inherit;
  font-style: normal;
}

.tower-drawing .data-time b {
  color: #2f3f58;
  font-weight: 900;
}

.work-list {
  display: grid;
  gap: 10px;
  min-width: 0;
}

.metric-card {
  display: flex;
  align-items: center;
  justify-content: space-between;
  min-height: 52px;
  padding: 0 16px;
  background: #fff;
  border: 1px solid #e6eefb;
  border-radius: 8px;
}

.gauge-wrap :deep(.chart-card) {
  height: 280px;
  box-shadow: none;
}

.realtime-metrics h2 {
  margin: 0 0 10px;
  font-size: 16px;
}

.realtime-metrics .metric-tile-grid {
  gap: 8px;
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
  .machine-layout,
  .tower-hero {
    grid-template-columns: 1fr;
  }
}
</style>
