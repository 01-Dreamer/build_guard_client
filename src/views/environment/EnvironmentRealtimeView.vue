<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { Aim, Clock, DataAnalysis, Document, MagicStick, Monitor, Operation } from '@element-plus/icons-vue'
import { getEnvironmentRealtime, type EnvironmentRealtime } from '../../api/environment'
import AppTopbar from '../../components/AppTopbar.vue'
import { usePolling } from '../../composables/usePolling'
import EquipmentChart from '../../components/equipment/EquipmentChart.vue'
import { formatDateTime } from '../../utils/format'
import {
  airGaugeOption,
  airQualityLineOption,
  noiseLineOption,
  qualityRingOption,
  sevenDayBarOption,
  temperatureLineOption
} from './chartOptions'

const realtime = ref<EnvironmentRealtime>({})
const metricIcons = [Clock, Monitor, MagicStick, DataAnalysis, Operation, Document]
const metricTones = ['#22c55e', '#60a5fa', '#fbbf24', '#38bdf8', '#38bdf8', '#f59e0b']
const realtimeMetrics = computed(() =>
  (realtime.value.metrics || []).map((metric, index) => ({
    label: metric.label,
    numericValue: String(metric.value ?? '-'),
    unit: metric.unit || '',
    tone: metricTones[index % metricTones.length],
    icon: metricIcons[index % metricIcons.length]
  }))
)
const sprayStopLogs = computed(() =>
  (realtime.value.sprayLogs || []).map((log) => ({
    ...log,
    time: formatDateTime(log.time)
  }))
)
const gauges = computed(() => realtime.value.gauges || [])

async function loadRealtime() {
  try {
    realtime.value = await getEnvironmentRealtime()
  } catch {
    realtime.value = {}
  }
}

const realtimePolling = usePolling(loadRealtime, 3000)

onMounted(() => {
  realtimePolling.start()
})
</script>

<template>
  <main class="equipment-page">
    <AppTopbar />

    <section class="equipment-content environment-content">
      <div class="equipment-stack">
        <div class="equipment-breadcrumb">施工环境 &gt; 环境实时监测</div>

        <section class="environment-dashboard">
          <EquipmentChart title="24小时空气质量数据" :option="airQualityLineOption(realtime.airQualityTrend)" />

          <section class="equipment-panel realtime-panel">
            <h2>
              <el-icon>
                <Aim />
              </el-icon>
              实时数据
            </h2>
            <div class="env-metric-grid">
              <article v-for="metric in realtimeMetrics" :key="metric.label" class="env-metric">
                <span class="env-metric-icon" :style="{ color: metric.tone }">
                  <el-icon>
                    <component :is="metric.icon" />
                  </el-icon>
                </span>
                <div>
                  <em>{{ metric.label }}</em>
                  <strong>{{ metric.numericValue }}<small>{{ metric.unit }}</small></strong>
                </div>
              </article>
              <article v-if="!realtimeMetrics.length" class="env-metric">
                <span class="env-metric-icon">
                  <el-icon><Aim /></el-icon>
                </span>
                <div>
                  <em>暂无数据</em>
                  <strong>-</strong>
                </div>
              </article>
            </div>
          </section>

          <EquipmentChart title="历史空气质量分析" :option="qualityRingOption(realtime.airQualityDistribution)" />
          <EquipmentChart title="噪声 单位：分贝" :option="noiseLineOption(realtime.noiseTrend)" />

          <section class="equipment-panel air-gauge-panel">
            <h2>
              <el-icon>
                <Aim />
              </el-icon>
              空气质量
            </h2>
            <div class="gauge-grid">
              <EquipmentChart
                v-for="gauge in gauges"
                :key="gauge.name"
                title=""
                :option="airGaugeOption(gauge.name, Number(gauge.value) || 0, gauge.max || 100)"
              />
              <EquipmentChart v-if="!gauges.length" title="" :option="airGaugeOption('暂无数据', 0, 100)" />
            </div>
          </section>

          <section class="equipment-panel spray-log-panel">
            <h2>
              <el-icon>
                <Aim />
              </el-icon>
              喷淋启停记录
            </h2>
            <div class="spray-log-list">
              <article v-for="log in sprayStopLogs" :key="`${log.status}-${log.time}`">
                <span :title="log.device">{{ log.device }}</span>
                <em :class="{ closed: log.status === '关闭' }">{{ log.status }}</em>
                <strong class="time-cell" :title="log.time">{{ log.time }}</strong>
              </article>
              <article v-if="!sprayStopLogs.length">
                <span>暂无喷淋启停记录</span>
                <em>-</em>
                <strong>-</strong>
              </article>
            </div>
          </section>

          <EquipmentChart title="近一周温度" :option="temperatureLineOption(realtime.temperatureTrend)" />
          <EquipmentChart title="近7日空气质量" :option="sevenDayBarOption(realtime.sevenDayAirQuality)" />
        </section>
      </div>
    </section>
  </main>
</template>

<style scoped>
.environment-content {
  overflow: auto;
}

.environment-dashboard {
  display: grid;
  grid-template-columns: repeat(3, minmax(320px, 1fr));
  gap: 18px;
  min-height: 0;
  padding: 2px 0 10px;
  align-items: stretch;
}

.environment-dashboard :deep(.chart-card) {
  min-height: 272px;
}

.realtime-panel,
.air-gauge-panel,
.spray-log-panel {
  display: grid;
  grid-template-rows: auto minmax(0, 1fr);
  min-height: 272px;
}

.env-metric-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 10px;
  align-content: start;
  min-height: 0;
  overflow: auto;
  padding-right: 2px;
}

.env-metric {
  display: grid;
  grid-template-columns: 42px minmax(0, 1fr);
  gap: 10px;
  align-items: center;
  min-height: 60px;
  padding: 8px 10px;
  overflow: hidden;
  background: linear-gradient(135deg, rgba(248, 251, 255, 0.98), rgba(255, 255, 255, 0.92));
  border: 1px solid #e6eefb;
  border-radius: 8px;
  box-shadow: 0 6px 14px rgba(59, 130, 246, 0.08);
}

.env-metric-icon {
  display: grid;
  width: 38px;
  height: 38px;
  place-items: center;
  font-size: 21px;
  background: #eef5ff;
  border-radius: 8px;
}

.env-metric > div {
  min-width: 0;
}

.env-metric em {
  display: block;
  color: #64748b;
  font-size: 12px;
  font-style: normal;
  font-weight: 900;
}

.env-metric strong {
  display: flex;
  gap: 3px;
  align-items: baseline;
  min-width: 0;
  overflow: hidden;
  color: #334155;
  font-size: 21px;
  line-height: 1.2;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.env-metric small {
  flex: 0 0 auto;
  color: #6b7c93;
  font-size: 12px;
  font-weight: 900;
}

.gauge-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 10px;
}

.gauge-grid :deep(.chart-card) {
  min-height: 196px;
  padding: 0;
  border: 0;
  box-shadow: none;
}

.gauge-grid :deep(h2) {
  display: none;
}

.spray-log-list {
  min-height: 0;
  overflow: hidden;
}

.spray-log-list article {
  display: grid;
  grid-template-columns: minmax(0, 1fr) 48px 150px;
  gap: 12px;
  align-items: center;
  min-height: 46px;
  border-bottom: 1px solid #edf1f6;
}

.spray-log-list span,
.spray-log-list strong {
  overflow: hidden;
  color: #64748b;
  font-size: 13px;
  font-weight: 800;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.spray-log-list em {
  justify-self: start;
  padding: 4px 8px;
  color: #475569;
  font-size: 12px;
  font-style: normal;
  font-weight: 900;
  background: #f1f5f9;
  border-radius: 6px;
}

.spray-log-list em.closed {
  color: #ef4444;
  background: #fee2e2;
}

@media (max-width: 1180px) {
  .environment-dashboard {
    grid-template-columns: 1fr;
  }

  .env-metric-grid {
    grid-template-columns: repeat(3, minmax(180px, 1fr));
  }
}

@media (max-width: 760px) {
  .env-metric-grid {
    grid-template-columns: 1fr;
  }

  .gauge-grid {
    grid-template-columns: 1fr;
  }
}
</style>
