<script setup lang="ts">
import { onBeforeUnmount, onMounted, type Component, ref } from 'vue'
import * as echarts from 'echarts'
import {
  ArrowDown,
  Cloudy,
  HomeFilled,
  Lightning,
  Location,
  MostlyCloudy,
  OfficeBuilding,
  Odometer,
  Setting,
  Sunny,
  Tools,
  TrendCharts,
  Warning,
  WindPower
} from '@element-plus/icons-vue'
import AppTopbar from '../components/AppTopbar.vue'
import { getDashboardOverview, type DashboardAlarm, type DashboardDeviceSummary, type DashboardMetric, type DashboardSprayLog } from '../api/dashboard'
import heroUrl from '../assets/dashboard-hero.png'
import { formatDateTime } from '../utils/format'

interface MetricCard {
  label: string
  value: string
  numericValue: string
  unit: string
  icon: Component
  tone: 'blue' | 'purple' | 'green' | 'yellow' | 'red' | 'orange'
}

interface DeviceSummary {
  name: string
  total: number
  online: number
  alarms: number
  icon: Component
  tone: string
}

interface SprayLog {
  content: string
  mode: string
  time: string
}

interface AlarmRecord {
  content: string
  location: string
  time: string
  level: '中危' | '高危'
  status: '未处理' | '处理中'
}

const riskChartRef = ref<HTMLDivElement>()

let riskChart: echarts.ECharts | null = null
let resizeObserver: ResizeObserver | null = null

const metricIconMap: Record<string, Component> = {
  温度: MostlyCloudy,
  湿度: Cloudy,
  风力: WindPower,
  风速: WindPower,
  噪音: Odometer,
  PM25: Warning,
  'PM2.5': Warning,
  PM10: Sunny
}
const metricTones: MetricCard['tone'][] = ['blue', 'purple', 'green', 'yellow', 'red', 'orange']
const deviceIconMap: Record<string, Component> = {
  塔机: Tools,
  塔吊: Tools,
  升降机: ArrowDown,
  高支模: OfficeBuilding,
  深基坑: Location
}
const deviceTones = ['#f59e0b', '#fbbf24', '#22c55e', '#38bdf8', '#3f6fed']

const environmentMetrics = ref<MetricCard[]>([])
const riskLabels = ref<string[]>([])
const riskValues = ref<number[]>([])
const sprayLogs = ref<SprayLog[]>([])
const deviceSummaries = ref<DeviceSummary[]>([])
const alarmRecords = ref<AlarmRecord[]>([])

function formatRiskLabel(value: string) {
  const labelMap: Record<string, string> = {
    AI检测预警: 'AI检测\n预警',
    环境检测预警: '环境检测\n预警',
    大风超载: '大风\n超载',
    深基坑监测: '深基坑\n监测',
    设备离线: '设备\n离线'
  }

  return labelMap[value] || value
}

function initRiskChart() {
  if (!riskChartRef.value) return

  riskChart = echarts.init(riskChartRef.value)
  updateRiskChart()

  resizeObserver = new ResizeObserver(() => riskChart?.resize())
  resizeObserver.observe(riskChartRef.value)
}

function updateRiskChart() {
  if (!riskChart) return

  riskChart.setOption({
    grid: {
      left: 6,
      right: 8,
      top: 24,
      bottom: 2,
      containLabel: true
    },
    tooltip: {
      trigger: 'axis'
    },
    xAxis: {
      type: 'category',
      data: riskLabels.value,
      axisTick: { show: false },
      axisLine: { lineStyle: { color: '#e5e7eb' } },
      axisLabel: {
        color: '#667085',
        interval: 0,
        formatter: formatRiskLabel,
        fontSize: 10,
        lineHeight: 13,
        margin: 8
      }
    },
    yAxis: {
      type: 'value',
      splitLine: { lineStyle: { color: '#eef2f7' } },
      axisLabel: {
        color: '#667085',
        fontSize: 10,
        margin: 4
      }
    },
    series: [
      {
        type: 'bar',
        barWidth: 24,
        data: riskValues.value.map((value, index) => ({
          value,
          itemStyle: {
            color: ['#ef4444', '#f97316', '#eab308', '#dc2626', '#a855f7', '#22c55e', '#3b82f6'][index]
          }
        })),
        label: {
          show: true,
          position: 'top',
          distance: 2,
          color: '#334155',
          fontSize: 10,
          fontWeight: 700
        }
      }
    ]
  })
}

function formatMetric(metric: DashboardMetric, index: number): MetricCard {
  const label = metric.label
  const numericValue = metric.value === undefined || metric.value === null ? '-' : String(metric.value)
  const unit = metric.unit ?? ''
  return {
    label,
    value: `${numericValue}${unit}`,
    numericValue,
    unit,
    icon: metricIconMap[label] || metricIconMap[label.toUpperCase()] || Odometer,
    tone: metricTones[index % metricTones.length]
  }
}

function formatDeviceSummary(device: DashboardDeviceSummary, index: number): DeviceSummary {
  return {
    name: device.name,
    total: device.total ?? 0,
    online: device.online ?? 0,
    alarms: device.alarms ?? 0,
    icon: deviceIconMap[device.name] || Setting,
    tone: deviceTones[index % deviceTones.length]
  }
}

function statusText(status?: string | number | null): AlarmRecord['status'] {
  if (status === 1 || status === 'processing' || status === '处理中') return '处理中'
  return '未处理'
}

function levelText(level?: string | null): AlarmRecord['level'] {
  return level === 'high' || level === '高危' ? '高危' : '中危'
}

function formatAlarm(record: DashboardAlarm): AlarmRecord {
  return {
    content: record.content || '-',
    location: record.location || '-',
    time: formatDateTime(record.occurredAt),
    level: levelText(record.level),
    status: statusText(record.status)
  }
}

function formatSprayLog(log: DashboardSprayLog): SprayLog {
  return {
    content: log.content || '-',
    mode: log.mode || '-',
    time: formatDateTime(log.time)
  }
}

async function loadDashboard() {
  try {
    const overview = await getDashboardOverview()
    environmentMetrics.value = (overview.environmentMetrics || []).map(formatMetric)
    deviceSummaries.value = (overview.deviceSummaries || []).map(formatDeviceSummary)
    alarmRecords.value = (overview.alarmRecords || []).map(formatAlarm)
    sprayLogs.value = (overview.sprayLogs || []).map(formatSprayLog)
    riskLabels.value = (overview.riskStats || []).map((item) => item.label)
    riskValues.value = (overview.riskStats || []).map((item) => Number(item.value) || 0)
  } catch {
    environmentMetrics.value = []
    deviceSummaries.value = []
    alarmRecords.value = []
    sprayLogs.value = []
    riskLabels.value = []
    riskValues.value = []
  }
  updateRiskChart()
}

onMounted(() => {
  initRiskChart()
  loadDashboard()
})

onBeforeUnmount(() => {
  resizeObserver?.disconnect()
  riskChart?.dispose()
})
</script>

<template>
  <main class="dashboard-page">
    <AppTopbar />

    <section class="dashboard-body">
      <div class="page-heading">首页</div>

      <aside class="left-column">
        <section class="panel environment-panel">
          <h2>
            <el-icon>
              <HomeFilled />
            </el-icon>
            环境实时数据
          </h2>
          <div class="metric-grid">
            <article
              v-for="metric in environmentMetrics"
              :key="metric.label"
              class="metric-card"
              :class="`tone-${metric.tone}`"
            >
              <span class="metric-icon">
                <el-icon>
                  <component :is="metric.icon" />
                </el-icon>
              </span>
              <span class="metric-label">{{ metric.label }}</span>
              <strong>
                {{ metric.numericValue }}
                <small>{{ metric.unit }}</small>
              </strong>
            </article>
            <article v-if="!environmentMetrics.length" class="metric-card tone-blue">
              <span class="metric-icon">
                <el-icon><Odometer /></el-icon>
              </span>
              <span class="metric-label">暂无数据</span>
              <strong>-</strong>
            </article>
          </div>
        </section>

        <section class="panel chart-panel">
          <h2>
            <el-icon>
              <TrendCharts />
            </el-icon>
            安全隐患柱状图
          </h2>
          <div ref="riskChartRef" class="risk-chart" />
        </section>

        <section class="panel spray-panel">
          <h2>
            <el-icon>
              <Lightning />
            </el-icon>
            喷淋记录
          </h2>
          <div class="spray-list">
            <article v-for="log in sprayLogs" :key="`${log.content}-${log.time}`" class="spray-item">
              <p :title="log.content">{{ log.content }}</p>
              <span>{{ log.time }}</span>
              <em :title="log.mode">{{ log.mode }}</em>
            </article>
            <article v-if="!sprayLogs.length" class="spray-item">
              <p>暂无喷淋记录</p>
              <span>-</span>
              <em>-</em>
            </article>
          </div>
        </section>
      </aside>

      <section class="center-column">
        <section class="panel hero-panel">
          <img :src="heroUrl" alt="施工现场安全监管" />
        </section>
      </section>

      <aside class="right-column">
        <section class="panel device-panel">
          <h2>
            <el-icon>
              <Setting />
            </el-icon>
            机械设备
          </h2>

          <article
            v-for="device in deviceSummaries"
            :key="device.name"
            class="device-card"
          >
            <span class="device-icon" :style="{ color: device.tone }">
              <el-icon>
                <component :is="device.icon" />
              </el-icon>
            </span>
            <div class="device-info">
              <strong :title="device.name">{{ device.name }}</strong>
              <div class="device-stats">
                <span>
                  总台数
                  <b>{{ device.total }}</b>
                </span>
                <span>
                  在线
                  <b class="online">{{ device.online }}</b>
                </span>
                <span>
                  报警
                  <b class="alarm">{{ device.alarms }}</b>
                </span>
              </div>
            </div>
          </article>
          <article v-if="!deviceSummaries.length" class="device-card">
            <span class="device-icon">
              <el-icon><Setting /></el-icon>
            </span>
            <div class="device-info">
              <strong>暂无设备统计</strong>
              <div class="device-stats">
                <span>总台数 <b>0</b></span>
                <span>在线 <b class="online">0</b></span>
                <span>报警 <b class="alarm">0</b></span>
              </div>
            </div>
          </article>
        </section>
      </aside>

      <section class="panel alarm-panel">
        <h2>
          <el-icon>
            <Warning />
          </el-icon>
          报警列表
        </h2>
        <div class="table-wrap">
          <table>
            <thead>
              <tr>
                <th>报警内容</th>
                <th>位置</th>
                <th class="time-head">时间</th>
                <th>危险等级</th>
                <th>状态</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="record in alarmRecords" :key="`${record.content}-${record.time}`">
                <td :title="record.content">{{ record.content }}</td>
                <td :title="record.location">{{ record.location }}</td>
                <td class="time-cell" :title="record.time">{{ record.time }}</td>
                <td>
                  <span
                    class="level-tag"
                    :class="{ high: record.level === '高危' }"
                    :title="record.level"
                  >
                    {{ record.level }}
                  </span>
                </td>
                <td>
                  <span
                    class="status-text"
                    :class="{ pending: record.status === '未处理' }"
                    :title="record.status"
                  >
                    {{ record.status }}
                  </span>
                </td>
              </tr>
              <tr v-if="!alarmRecords.length">
                <td colspan="5">暂无报警记录</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>
    </section>
  </main>
</template>

<style scoped>
.dashboard-page {
  height: 100vh;
  overflow: hidden;
  color: #24324a;
  background:
    linear-gradient(180deg, rgba(236, 243, 252, 0.94), rgba(247, 250, 253, 0.98)),
    #f4f7fb;
}

.dashboard-body {
  box-sizing: border-box;
  display: grid;
  grid-template-columns: minmax(330px, 380px) minmax(660px, 1fr) minmax(290px, 330px);
  grid-template-rows: 28px minmax(0, 1fr) 230px;
  gap: 12px 14px;
  height: calc(100vh - 58px);
  min-height: 0;
  padding: 12px 18px 16px;
  overflow: hidden;
}

.left-column,
.center-column,
.right-column {
  display: grid;
  min-height: 0;
  gap: 12px;
  overflow: hidden;
}

.left-column {
  grid-column: 1;
  grid-row: 2 / 4;
  grid-template-rows: minmax(240px, 0.95fr) minmax(150px, 0.56fr) minmax(112px, 0.36fr);
}

.center-column {
  grid-column: 2;
  grid-row: 2;
  grid-template-rows: minmax(0, 1fr);
}

.right-column {
  grid-column: 3;
  grid-row: 2;
  grid-template-rows: minmax(0, 1fr);
  align-self: start;
}

.panel {
  min-height: 0;
  padding: 15px 18px;
  overflow: hidden;
  background: rgba(255, 255, 255, 0.96);
  border: 1px solid rgba(216, 226, 239, 0.86);
  border-radius: 10px;
  box-shadow: 0 12px 30px rgba(31, 45, 71, 0.06);
}

.page-heading {
  grid-column: 1 / -1;
  grid-row: 1;
  display: flex;
  align-items: center;
  height: 28px;
  color: #52627a;
  font-size: 17px;
  font-weight: 900;
  line-height: 28px;
}

.panel h2 {
  display: flex;
  gap: 8px;
  align-items: center;
  margin: 0 0 12px;
  color: #24324a;
  font-size: 16px;
  font-weight: 900;
  line-height: 1.2;
}

.panel h2 .el-icon {
  color: #365d8f;
}

.environment-panel {
  padding: 15px 16px;
}

.metric-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  grid-auto-rows: calc((100% - 18px) / 3);
  gap: 9px;
  align-content: start;
  min-height: 0;
  height: calc(100% - 32px);
  overflow-y: auto;
  padding-right: 3px;
}

.metric-card {
  position: relative;
  display: grid;
  grid-template-columns: 38px minmax(0, 1fr);
  grid-template-rows: auto auto;
  gap: 4px 10px;
  align-content: center;
  min-height: 0;
  padding: 9px 11px;
  overflow: hidden;
  border: 1px solid rgba(226, 232, 240, 0.92);
  border-radius: 10px;
}

.metric-card::after {
  position: absolute;
  right: -22px;
  bottom: -22px;
  width: 72px;
  height: 72px;
  content: "";
  background: currentColor;
  border-radius: 50%;
  opacity: 0.08;
}

.metric-icon {
  display: grid;
  grid-row: 1 / 3;
  width: 36px;
  height: 36px;
  place-items: center;
  align-self: center;
  background: #fff;
  border-radius: 9px;
  box-shadow: inset 0 0 0 1px rgba(226, 232, 240, 0.96);
}

.metric-icon .el-icon {
  font-size: 18px;
}

.metric-label {
  overflow: hidden;
  color: #64748b;
  font-size: 12px;
  font-weight: 900;
  line-height: 1.1;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.metric-card strong {
  display: grid;
  gap: 1px;
  align-items: start;
  min-width: 0;
  color: currentColor;
  font-size: 20px;
  font-weight: 950;
  line-height: 1.1;
  letter-spacing: 0;
}

.metric-card small {
  margin-left: 0;
  color: #64748b;
  font-size: 10px;
  font-weight: 900;
  line-height: 1;
  white-space: nowrap;
}

.tone-blue {
  color: #315edb;
  background: #eef5ff;
}

.tone-purple {
  color: #7c3aed;
  background: #f5f0ff;
}

.tone-green {
  color: #0f9f6e;
  background: #ecfdf5;
}

.tone-yellow {
  color: #b86a00;
  background: #fff8e6;
}

.tone-red {
  color: #e03131;
  background: #fff0f0;
}

.tone-orange {
  color: #ea580c;
  background: #fff4e8;
}

.risk-chart {
  width: 100%;
  height: calc(100% - 26px);
  min-height: 0;
}

.chart-panel h2 {
  margin-bottom: 6px;
}

.spray-list {
  display: grid;
  align-content: start;
  gap: 7px;
  min-height: 0;
  height: calc(100% - 32px);
  overflow: hidden;
}

.spray-item {
  display: grid;
  grid-template-columns: minmax(0, 1fr) 132px auto;
  gap: 10px;
  align-items: center;
  min-width: 0;
  min-height: 42px;
  padding: 7px 10px;
  background: #f8fbff;
  border: 1px solid #edf2f8;
  border-radius: 9px;
}

.spray-item p {
  overflow: hidden;
  margin: 0;
  color: #2f3d55;
  font-size: 13px;
  font-weight: 850;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.spray-item span {
  color: #59677d;
  font-size: 12px;
  font-weight: 800;
  white-space: nowrap;
}

.spray-item em {
  min-width: 48px;
  padding: 5px 9px;
  color: #1e4e8c;
  font-size: 12px;
  font-style: normal;
  font-weight: 900;
  text-align: center;
  background: #e7f0ff;
  border-radius: 999px;
}

.hero-panel {
  padding: 12px;
  background: linear-gradient(180deg, rgba(255, 255, 255, 0.98), rgba(248, 251, 255, 0.98));
}

.hero-panel img {
  display: block;
  width: 100%;
  height: 100%;
  max-height: 100%;
  object-fit: cover;
  border-radius: 10px;
}

.alarm-panel {
  grid-column: 2 / 4;
  grid-row: 3;
  min-height: 0;
}

.alarm-panel h2 {
  margin-bottom: 10px;
}

.table-wrap {
  height: calc(100% - 31px);
  min-height: 0;
  overflow: hidden;
  border: 1px solid #edf2f8;
  border-radius: 10px;
}

table {
  width: 100%;
  border-collapse: separate;
  border-spacing: 0;
  table-layout: fixed;
}

th,
td {
  padding: 0 14px;
  text-align: left;
  border-bottom: 1px solid #edf2f8;
}

th {
  height: 34px;
  color: #637083;
  font-size: 14px;
  font-weight: 900;
  background: #f8fbff;
}

td {
  height: 32px;
  overflow: hidden;
  color: #334155;
  font-size: 13px;
  font-weight: 760;
  text-overflow: ellipsis;
  white-space: nowrap;
}

tbody tr:last-child td {
  border-bottom: 0;
}

.time-head,
.time-cell {
  width: 190px;
}

.time-cell {
  color: #2f3d55;
  font-variant-numeric: tabular-nums;
  font-weight: 900;
  white-space: nowrap;
}

.level-tag {
  display: inline-flex;
  min-width: 50px;
  justify-content: center;
  padding: 4px 8px;
  color: #b45309;
  font-weight: 900;
  background: #fff2c6;
  border-radius: 8px;
}

.level-tag.high {
  color: #c0262d;
  background: #ffe2e2;
}

.status-text {
  color: #f97316;
  font-weight: 950;
}

.status-text.pending {
  color: #ef4444;
}

.device-panel {
  display: grid;
  grid-template-rows: auto;
  grid-auto-rows: max-content;
  align-content: start;
  gap: 10px;
  min-height: 0;
}

.device-panel h2 {
  margin-bottom: 0;
}

.device-card {
  display: grid;
  grid-template-columns: 48px minmax(0, 1fr);
  gap: 12px;
  align-items: center;
  min-height: 0;
  padding: 10px 12px;
  background: #fbfdff;
  border: 1px solid #e7edf6;
  border-radius: 10px;
}

.device-icon {
  display: grid;
  width: 46px;
  height: 46px;
  place-items: center;
  font-size: 24px;
  background: #fff;
  border-radius: 10px;
  box-shadow: inset 0 0 0 1px #e4ebf5;
}

.device-info {
  min-width: 0;
}

.device-info > strong {
  display: block;
  overflow: hidden;
  margin-bottom: 9px;
  color: #24324a;
  font-size: 17px;
  font-weight: 950;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.device-stats {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 8px;
}

.device-stats span {
  display: grid;
  gap: 3px;
  color: #667085;
  font-size: 11px;
  font-weight: 800;
  text-align: center;
}

.device-stats b {
  color: #24324a;
  font-size: 18px;
  font-weight: 950;
  line-height: 1;
}

.device-stats .online {
  color: #16a34a;
}

.device-stats .alarm {
  color: #ef4444;
}

@media (max-width: 1440px) {
  .dashboard-body {
    grid-template-columns: minmax(310px, 350px) minmax(500px, 1fr) minmax(290px, 320px);
    grid-template-rows: 28px minmax(0, 1fr) 210px;
    gap: 12px;
    padding: 12px 14px 14px;
  }

  .left-column {
    grid-template-rows: minmax(220px, 0.95fr) minmax(140px, 0.56fr) minmax(104px, 0.36fr);
    gap: 12px;
  }

  .panel {
    padding: 16px;
  }

  .device-card {
    padding: 9px 10px;
  }
}

@media (max-width: 1120px) {
  .dashboard-page {
    overflow: auto;
  }

  .dashboard-body {
    grid-template-columns: 1fr;
    grid-template-rows: auto;
    height: auto;
    min-height: calc(100vh - 58px);
    overflow: visible;
  }

  .left-column,
  .center-column,
  .right-column,
  .page-heading,
  .alarm-panel {
    grid-column: 1;
    grid-row: auto;
    overflow: visible;
  }

  .left-column {
    grid-template-rows: auto 260px auto;
  }

  .hero-panel {
    min-height: 360px;
  }
}

@media (max-width: 640px) {
  .dashboard-body {
    padding: 10px;
  }

  .metric-grid,
  .device-stats {
    grid-template-columns: 1fr;
  }

  .metric-grid {
    grid-auto-rows: minmax(64px, auto);
  }

  .spray-item {
    grid-template-columns: 1fr;
  }

  .table-wrap {
    overflow-x: auto;
  }

  table {
    min-width: 680px;
  }
}
</style>
