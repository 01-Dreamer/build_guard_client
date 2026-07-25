<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { DataAnalysis, Memo } from '@element-plus/icons-vue'
import {
  getConstructionAlarmTypeSummary,
  getConstructionAlarmTrend,
  getDeepPitDashboard,
  type EquipmentAlarmTypeSummary,
  type EquipmentAlarmTrendPoint,
  type EquipmentDashboard
} from '../../api/equipment'
import AppTopbar from '../../components/AppTopbar.vue'
import { usePolling } from '../../composables/usePolling'
import Equipment3DModel from '../../components/equipment/Equipment3DModel.vue'
import EquipmentChart from '../../components/equipment/EquipmentChart.vue'
import { formatDateTime } from '../../utils/format'
import { alarmTrendOption, pieOption } from './chartOptions'

const dashboard = ref<EquipmentDashboard>({})
const alarmTrend = ref<EquipmentAlarmTrendPoint[]>([])
const alarmTypeSummary = ref<EquipmentAlarmTypeSummary[]>([])
const tabs = computed(() => (dashboard.value.devices || []).map((device) => device.name))
const activeDevice = computed(() => dashboard.value.devices?.[0])
const pitRows = computed(() =>
  (dashboard.value.monitorRows || []).map((row) => ({
    name: row.name,
    value: String(row.value ?? '-'),
    unit: row.unit || '-',
    time: formatDateTime(row.time),
    timeParts: splitDateTime(row.time),
    alert: row.alert
  }))
)
const settlementRows = computed(() =>
  (dashboard.value.settlementRows || []).map((row) => ({
    time: formatDateTime(row.time),
    timeParts: splitDateTime(row.time),
    value: String(row.value ?? '-'),
    status: row.status || '-'
  }))
)
const modelReadouts = computed(() => [
  readoutValue(['土压力', 'soilPressure'], '土压力'),
  readoutValue(['应变', 'strain'], '应变拉力'),
  readoutValue(['地下水位', 'waterLevel'], '地下水位')
])

function splitDateTime(value?: string | number | Date | null) {
  const formatted = formatDateTime(value)
  const [date = formatted, time = ''] = formatted.split(' ')
  return { date, time }
}

function readoutValue(keywords: string[], label: string) {
  const row = pitRows.value.find((item) =>
    keywords.some((keyword) => item.name.toLowerCase().includes(keyword.toLowerCase()))
  )
  const unit = row?.unit && row.unit !== '-' ? ` ${row.unit}` : ''
  return {
    label,
    value: row ? `${row.value}${unit}` : '-'
  }
}

async function loadDeepPitDashboard() {
  try {
    const [dashboardResult, trendResult, typeSummaryResult] = await Promise.all([
      getDeepPitDashboard(),
      getConstructionAlarmTrend('deep_pit'),
      getConstructionAlarmTypeSummary('deep_pit')
    ])
    dashboard.value = dashboardResult
    alarmTrend.value = trendResult
    alarmTypeSummary.value = typeSummaryResult
  } catch {
    dashboard.value = {}
    alarmTrend.value = []
    alarmTypeSummary.value = []
  }
}

const deepPitPolling = usePolling(loadDeepPitDashboard, 3000)

onMounted(() => {
  deepPitPolling.start()
})
</script>

<template>
  <main class="equipment-page">
    <AppTopbar />

    <section class="equipment-content">
      <div class="equipment-stack">
        <div class="equipment-breadcrumb">施工设备 &gt; 深基坑监测分析</div>

        <section class="structure-layout">
          <aside class="structure-left">
            <section class="equipment-panel">
              <h2>
                <el-icon>
                  <DataAnalysis />
                </el-icon>
                实时监测数据
              </h2>
              <div class="table-scroll realtime-table-scroll">
                <table class="monitor-table">
                  <colgroup>
                    <col class="col-monitor-name" />
                    <col class="col-monitor-value" />
                    <col class="col-monitor-unit" />
                    <col class="col-monitor-time" />
                  </colgroup>
                  <thead>
                    <tr>
                      <th>监测项名称</th>
                      <th>采集值</th>
                      <th>单位</th>
                      <th>监测时间</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr v-for="row in pitRows" :key="row.name">
                      <td :title="row.name">{{ row.name }}</td>
                      <td :class="{ alert: row.alert }">{{ row.value }}</td>
                      <td>{{ row.unit }}</td>
                      <td class="time-cell detail-time-cell" :title="row.time">
                        <span>{{ row.timeParts.date }}</span>
                        <strong>{{ row.timeParts.time }}</strong>
                      </td>
                    </tr>
                    <tr v-if="!pitRows.length">
                      <td colspan="4">暂无实时监测数据</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </section>

            <section class="equipment-panel">
              <h2>
                <el-icon>
                  <Memo />
                </el-icon>
                沉降数据
              </h2>
              <div class="table-scroll settlement-table-scroll">
                <table class="monitor-table compact">
                  <colgroup>
                    <col class="col-settlement-time" />
                    <col />
                    <col class="col-settlement-status" />
                  </colgroup>
                  <thead>
                    <tr>
                      <th>时间</th>
                      <th>沉降量(mm)</th>
                      <th>状态</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr v-for="row in settlementRows" :key="row.time + row.value">
                      <td class="time-cell detail-time-cell" :title="row.time">
                        <span>{{ row.timeParts.date }}</span>
                        <strong>{{ row.timeParts.time }}</strong>
                      </td>
                      <td>{{ row.value }}</td>
                      <td class="alert">{{ row.status }}</td>
                    </tr>
                    <tr v-if="!settlementRows.length">
                      <td colspan="3">暂无沉降数据</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </section>
          </aside>

          <section class="equipment-panel structure-center">
            <nav class="tab-list">
              <RouterLink
                v-for="tab in tabs"
                :key="tab"
                to="/equipment/deep-pit"
                :class="{ active: tab === activeDevice?.name }"
              >
                {{ tab }}
                <span class="live-dot" />
              </RouterLink>
              <RouterLink v-if="!tabs.length" to="/equipment/deep-pit" class="active">暂无设备</RouterLink>
            </nav>

            <div class="model-wrap">
              <div class="model-scene">
                <Equipment3DModel model="pit" />
              </div>
              <div class="model-readouts">
                <div v-for="item in modelReadouts" :key="item.label" class="model-label">
                  {{ item.label }}<br />{{ item.value }}
                </div>
              </div>
              <div class="legend-row pit-legend">
                <span class="blue" />正常网格墙
                <span class="yellow" />预警网格墙
                <span class="red" />报警网格墙
                <span class="purple" />格栅支撑
                <span class="gray" />基坑底部
              </div>
            </div>
          </section>

          <aside class="structure-right">
            <EquipmentChart title="一周预警报警数据" :option="alarmTrendOption(alarmTrend)" />
            <EquipmentChart title="累计报警类型占比" :option="pieOption(alarmTypeSummary)" />
          </aside>
        </section>
      </div>
    </section>
  </main>
</template>

<style scoped>
.structure-layout {
  display: grid;
  grid-template-columns: minmax(360px, 0.9fr) minmax(560px, 1.35fr) minmax(340px, 0.9fr);
  gap: 14px;
  align-items: stretch;
  height: 100%;
  min-height: 0;
  overflow: hidden;
}

.structure-left,
.structure-right {
  display: grid;
  align-content: stretch;
  gap: 12px;
  height: 100%;
  min-height: 0;
  overflow: hidden;
}

.structure-left {
  grid-template-rows: minmax(0, 0.56fr) minmax(0, 0.44fr);
}

.structure-left > .equipment-panel {
  display: flex;
  flex-direction: column;
  min-height: 0;
  padding: 14px 16px;
}

.structure-right {
  grid-template-rows: repeat(2, minmax(0, 1fr));
}

.structure-center {
  display: grid;
  grid-template-rows: auto minmax(0, 1fr);
  height: 100%;
  padding: 18px;
  overflow: hidden;
}

.model-wrap {
  position: relative;
  display: grid;
  grid-template-columns: minmax(0, 1fr) 156px;
  grid-template-rows: minmax(0, 1fr) auto;
  gap: 12px;
  height: 100%;
  min-height: 0;
  overflow: hidden;
  padding: 12px;
  background:
    linear-gradient(180deg, rgba(251, 253, 255, 0.98), rgba(242, 247, 255, 0.96)),
    radial-gradient(circle at 42% 38%, rgba(47, 111, 237, 0.12), transparent 44%);
  border: 1px solid #e6eefb;
  border-radius: 8px;
  box-shadow: inset 0 0 0 1px rgba(255, 255, 255, 0.72);
}

.model-scene {
  min-width: 0;
  min-height: 0;
  overflow: hidden;
  border-radius: 8px;
}

.model-scene :deep(.equipment-3d-model) {
  min-height: 0;
}

.model-readouts {
  display: grid;
  align-content: start;
  gap: 10px;
  min-width: 0;
}

.model-label {
  min-width: 0;
  padding: 9px 11px;
  color: #24324a;
  font-size: 15px;
  font-weight: 900;
  line-height: 1.28;
  text-align: left;
  text-shadow: none;
  background: rgba(255, 255, 255, 0.78);
  border: 1px solid rgba(203, 213, 225, 0.8);
  border-radius: 8px;
  box-shadow: 0 14px 30px rgba(15, 23, 42, 0.1);
  backdrop-filter: blur(9px);
}

.legend-row {
  grid-column: 1 / -1;
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  align-items: center;
  color: #475569;
  font-size: 13px;
  font-weight: 900;
  padding: 7px 10px;
  background: rgba(255, 255, 255, 0.68);
  border: 1px solid rgba(226, 232, 240, 0.76);
  border-radius: 999px;
  backdrop-filter: blur(8px);
}

.legend-row span {
  width: 12px;
  height: 12px;
  border-radius: 3px;
}

.legend-row .blue {
  background: #3f6fed;
}

.legend-row .yellow {
  background: #eab308;
}

.legend-row .red {
  background: #ef4444;
}

.legend-row .purple {
  background: #8b5cf6;
}

.legend-row .gray {
  background: #64748b;
}

.compact th,
.compact td {
  height: 40px;
}

.monitor-table {
  table-layout: fixed;
}

.table-scroll {
  flex: 1;
  min-height: 0;
  overflow: auto;
}

.table-scroll .monitor-table {
  min-width: 100%;
}

.table-scroll thead th {
  position: sticky;
  top: 0;
  z-index: 1;
}

.monitor-table th,
.monitor-table td {
  height: 40px;
  padding: 0 10px;
}

.col-monitor-name {
  width: 31%;
}

.col-monitor-value {
  width: 18%;
}

.col-monitor-unit {
  width: 14%;
}

.col-monitor-time,
.col-settlement-time {
  width: 37%;
}

.col-settlement-status {
  width: 62px;
}

.detail-time-cell {
  line-height: 1.18;
  white-space: normal;
}

.detail-time-cell span,
.detail-time-cell strong {
  display: block;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.detail-time-cell span {
  color: #64748b;
  font-size: 12px;
}

.detail-time-cell strong {
  color: #2f3f58;
  font-size: 13px;
}

@media (max-width: 1180px) {
  .structure-layout {
    grid-template-columns: 1fr;
    height: auto;
    overflow: visible;
  }

  .structure-left,
  .structure-right,
  .structure-center {
    height: auto;
    overflow: visible;
  }

  .structure-left {
    grid-template-rows: none;
  }
}
</style>
