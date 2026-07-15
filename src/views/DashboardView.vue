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
import heroUrl from '../assets/dashboard-hero.png'

interface MetricCard {
  label: string
  value: string
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

const environmentMetrics: MetricCard[] = [
  { label: '温度', value: '13.07°C', icon: MostlyCloudy, tone: 'blue' },
  { label: '湿度', value: '29.07%', icon: Cloudy, tone: 'purple' },
  { label: '风力', value: '0.55级', icon: WindPower, tone: 'green' },
  { label: '噪音', value: '70.4dB', icon: Odometer, tone: 'yellow' },
  { label: 'PM2.5', value: '23.84μg/m³', icon: Warning, tone: 'red' },
  { label: 'PM10', value: '3.65μg/m³', icon: Sunny, tone: 'orange' }
]

const riskLabels = ['AI检测预警', '环境检测预警', '吸烟', '大风超载', '烟雾', '深基坑监测', '设备离线']
const riskValues = [17, 14, 14, 12, 10, 10, 6]

const sprayLogs: SprayLog[] = [
  { content: '青棠高速以东改造项目 pm2.5污染检测 环境监测传感器#12', mode: '自动模式', time: '15:20:38' },
  { content: '青棠高速以东改造项目 pm10超标检测 环境监测传感器#08', mode: '自动模式', time: '15:20:37' },
  { content: '青棠高速以东改造项目 扬尘超限 喷淋联动任务', mode: '自动模式', time: '15:20:33' },
  { content: '基坑2区周边道路降尘任务执行完成', mode: '定时模式', time: '15:20:32' }
]

const deviceSummaries: DeviceSummary[] = [
  { name: '塔机', total: 3, online: 3, alarms: 0, icon: Tools, tone: '#f59e0b' },
  { name: '升降机', total: 2, online: 0, alarms: 0, icon: ArrowDown, tone: '#fbbf24' },
  { name: '高支模', total: 2, online: 1, alarms: 25, icon: OfficeBuilding, tone: '#22c55e' },
  { name: '深基坑', total: 2, online: 1, alarms: 22, icon: Location, tone: '#38bdf8' }
]

const alarmRecords: AlarmRecord[] = [
  { content: 'AI检测预警', location: '基坑2区', time: '2025-11-12 17:08:36', level: '中危', status: '未处理' },
  { content: 'AI检测预警', location: '基坑2区', time: '2025-11-12 17:08:30', level: '中危', status: '未处理' },
  { content: 'AI检测预警', location: '基坑2区', time: '2025-11-12 17:08:24', level: '中危', status: '未处理' },
  { content: '塔吊力矩异常', location: '塔吊1号', time: '2025-11-12 17:08:18', level: '高危', status: '处理中' },
  { content: '环境噪音超标', location: '生活区东侧', time: '2025-11-12 17:08:06', level: '中危', status: '未处理' },
  { content: '深基坑位移预警', location: '基坑2区', time: '2025-11-12 17:07:57', level: '中危', status: '未处理' }
]

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
      data: riskLabels,
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
        data: riskValues.map((value, index) => ({
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

  resizeObserver = new ResizeObserver(() => riskChart?.resize())
  resizeObserver.observe(riskChartRef.value)
}

onMounted(() => {
  initRiskChart()
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
      <aside class="left-column">
        <div class="breadcrumb-card">首页</div>

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
              <span>{{ metric.label }}</span>
              <strong>{{ metric.value }}</strong>
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
                <th>时间</th>
                <th>危险等级</th>
                <th>状态</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="record in alarmRecords" :key="`${record.content}-${record.time}`">
                <td :title="record.content">{{ record.content }}</td>
                <td :title="record.location">{{ record.location }}</td>
                <td :title="record.time">{{ record.time }}</td>
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
  color: #334155;
  background: #f3f6fa;
}

.topbar {
  display: grid;
  grid-template-columns: 280px 1fr auto;
  gap: 18px;
  align-items: center;
  height: 54px;
  min-height: 54px;
  padding: 0 22px;
  color: #e5edf7;
  background: #314768;
  box-shadow: 0 2px 12px rgba(15, 23, 42, 0.12);
}

.system-brand {
  display: flex;
  gap: 10px;
  align-items: center;
  min-width: 0;
}

.system-brand img {
  width: 42px;
  height: 42px;
  object-fit: cover;
  background: #fff;
  border-radius: 7px;
  box-shadow: inset 0 0 0 1px rgba(226, 232, 240, 0.9);
}

.system-brand div {
  display: grid;
  gap: 4px;
  min-width: 0;
}

.system-brand strong {
  overflow: hidden;
  font-size: 15px;
  letter-spacing: 0.04em;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.system-brand span {
  overflow: hidden;
  color: #d5deeb;
  font-size: 10px;
  font-weight: 700;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.topnav {
  display: flex;
  gap: 10px;
  align-items: center;
  min-width: 0;
}

.topnav button {
  display: inline-flex;
  gap: 4px;
  align-items: center;
  height: 34px;
  padding: 0 8px;
  color: #e5edf7;
  font-size: 14px;
  font-weight: 700;
  cursor: pointer;
  background: transparent;
  border: 0;
  border-bottom: 2px solid transparent;
}

.topnav button.active {
  color: #fff;
  border-bottom-color: #fbbf24;
}

.top-actions {
  display: flex;
  gap: 10px;
  align-items: center;
}

.user-menu {
  display: inline-flex;
  gap: 6px;
  align-items: center;
  color: #e5edf7;
  cursor: pointer;
  background: transparent;
  border: 0;
}

.user-menu span {
  display: grid;
  width: 34px;
  height: 34px;
  place-items: center;
  color: #314768;
  font-weight: 800;
  background: linear-gradient(135deg, #f8fafc, #fbbf24);
  border-radius: 50%;
}

.dashboard-body {
  display: grid;
  grid-template-columns: 360px minmax(520px, 1fr) 360px;
  grid-template-rows: minmax(420px, 1fr) minmax(260px, 0.58fr);
  gap: 12px;
  height: calc(100vh - 54px);
  padding: 10px;
  overflow: hidden;
}

.left-column,
.center-column,
.right-column {
  display: grid;
  min-height: 0;
  gap: 10px;
  overflow: hidden;
}

.left-column {
  grid-row: 1 / 3;
  grid-template-rows: 28px 300px 190px minmax(220px, 1fr);
}

.center-column {
  grid-column: 2;
  grid-row: 1;
  grid-template-rows: minmax(0, 1fr);
}

.right-column {
  grid-column: 3;
  grid-row: 1;
  grid-template-rows: 1fr;
}

.panel {
  background: #fff;
  border: 1px solid #edf1f6;
  border-radius: 8px;
  box-shadow: 0 8px 24px rgba(15, 23, 42, 0.04);
}

.breadcrumb-card {
  display: flex;
  align-items: center;
  height: 28px;
  padding: 0;
  color: #64748b;
  font-size: 16px;
  font-weight: 700;
  line-height: 28px;
}

.panel {
  min-height: 0;
  padding: 14px;
  overflow: hidden;
}

.environment-panel {
  padding: 12px;
}

.panel h2 {
  display: flex;
  gap: 8px;
  align-items: center;
  margin: 0 0 12px;
  color: #334155;
  font-size: 16px;
  line-height: 1.2;
}

.panel h2 .el-icon {
  color: #314768;
}

.metric-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 8px;
  height: calc(100% - 32px);
}

.metric-card {
  display: grid;
  grid-template-rows: 22px 18px 22px;
  gap: 2px;
  min-height: 0;
  align-content: center;
  place-items: center;
  padding: 6px;
  border-radius: 8px;
}

.metric-icon {
  display: grid;
  width: 22px;
  height: 22px;
  place-items: center;
  border-radius: 50%;
}

.metric-icon .el-icon {
  font-size: 13px;
}

.metric-card span {
  color: #64748b;
  font-size: 11px;
  font-weight: 700;
  line-height: 1;
}

.metric-card strong {
  font-size: 14px;
  line-height: 1.05;
}

.tone-blue {
  background: #edf4ff;
}

.tone-blue .metric-icon,
.tone-blue strong {
  color: #5b7cfa;
}

.tone-purple {
  background: #f7efff;
}

.tone-purple .metric-icon,
.tone-purple strong {
  color: #a855f7;
}

.tone-green {
  background: #ecfdf3;
}

.tone-green .metric-icon,
.tone-green strong {
  color: #22c55e;
}

.tone-yellow {
  background: #fffbeb;
}

.tone-yellow .metric-icon,
.tone-yellow strong {
  color: #d97706;
}

.tone-red {
  background: #fff1f2;
}

.tone-red .metric-icon,
.tone-red strong {
  color: #ef4444;
}

.tone-orange {
  background: #fff7ed;
}

.tone-orange .metric-icon,
.tone-orange strong {
  color: #f97316;
}

.risk-chart {
  width: 100%;
  height: calc(100% - 24px);
  min-height: 140px;
}

.chart-panel h2 {
  margin-bottom: 4px;
}

.spray-list {
  display: grid;
  gap: 4px;
  height: calc(100% - 30px);
  overflow: auto;
  padding-right: 4px;
}

.spray-item {
  display: grid;
  grid-template-columns: 1fr auto auto;
  gap: 8px;
  align-items: center;
  min-width: 0;
  padding: 6px 0;
  border-bottom: 1px solid #edf1f6;
}

.spray-item p {
  overflow: hidden;
  margin: 0;
  color: #475569;
  font-size: 13px;
  font-weight: 700;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.spray-item span {
  color: #64748b;
  font-size: 12px;
}

.spray-item em {
  overflow: hidden;
  padding: 4px 8px;
  color: #314768;
  font-size: 12px;
  font-style: normal;
  font-weight: 700;
  text-overflow: ellipsis;
  white-space: nowrap;
  background: #edf4ff;
  border-radius: 6px;
}

.hero-panel {
  padding: 16px;
}

.hero-panel img {
  display: block;
  width: 100%;
  height: 100%;
  max-height: 100%;
  object-fit: cover;
  border-radius: 8px;
}

.alarm-panel {
  grid-column: 2 / 4;
  grid-row: 2;
  min-height: 0;
}

.table-wrap {
  height: calc(100% - 34px);
  overflow: auto;
}

table {
  width: 100%;
  border-collapse: collapse;
  table-layout: fixed;
}

th,
td {
  padding: 10px 14px;
  text-align: left;
  border-bottom: 1px solid #edf1f6;
}

th {
  color: #64748b;
  font-size: 14px;
  font-weight: 800;
}

td {
  overflow: hidden;
  color: #475569;
  font-size: 14px;
  font-weight: 700;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.level-tag {
  display: inline-flex;
  min-width: 42px;
  justify-content: center;
  padding: 4px 8px;
  color: #b45309;
  background: #fef3c7;
  border-radius: 6px;
}

.level-tag.high {
  color: #dc2626;
  background: #fee2e2;
}

.status-text {
  color: #f97316;
}

.status-text.pending {
  color: #ef4444;
}

.device-panel {
  min-height: 0;
}

.device-card {
  display: grid;
  grid-template-columns: 62px 1fr;
  gap: 16px;
  align-items: center;
  padding: 12px;
  background: #fbfcfe;
  border: 1px solid #f1f5f9;
  border-radius: 8px;
}

.device-card + .device-card {
  margin-top: 12px;
}

.device-icon {
  display: grid;
  width: 52px;
  height: 52px;
  place-items: center;
  font-size: 36px;
  background: #fff;
  border-radius: 8px;
  box-shadow: inset 0 0 0 1px #edf1f6;
}

.device-info {
  min-width: 0;
}

.device-info > strong {
  display: block;
  overflow: hidden;
  margin-bottom: 12px;
  color: #334155;
  font-size: 16px;
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
  gap: 5px;
  color: #64748b;
  font-size: 12px;
  text-align: center;
}

.device-stats b {
  color: #334155;
  font-size: 15px;
}

.device-stats .online {
  color: #22c55e;
}

.device-stats .alarm {
  color: #ef4444;
}

@media (max-width: 1280px) {
  .topbar {
    grid-template-columns: 260px 1fr auto;
  }

  .dashboard-body {
    grid-template-columns: 320px minmax(480px, 1fr);
  }

  .right-column {
    grid-column: 1 / -1;
  }

  .device-panel {
    min-height: auto;
  }
}

@media (max-width: 920px) {
  .topbar {
    grid-template-columns: 1fr auto;
  }

  .topnav {
    display: none;
  }

  .dashboard-body {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 560px) {
  .topbar {
    padding: 0 16px;
  }

  .system-brand strong {
    font-size: 15px;
  }

  .system-brand span {
    display: none;
  }

  .metric-grid,
  .device-stats {
    grid-template-columns: 1fr;
  }

  .panel {
    padding: 14px;
  }
}
</style>
