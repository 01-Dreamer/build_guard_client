<script setup lang="ts">
import { Aim } from '@element-plus/icons-vue'
import AppTopbar from '../../components/AppTopbar.vue'
import EquipmentChart from '../../components/equipment/EquipmentChart.vue'
import { realtimeMetrics, sprayStopLogs } from './data'
import {
  airGaugeOption,
  airQualityLineOption,
  noiseLineOption,
  qualityRingOption,
  sevenDayBarOption,
  temperatureLineOption
} from './chartOptions'
</script>

<template>
  <main class="equipment-page">
    <AppTopbar />

    <section class="equipment-content environment-content">
      <div class="equipment-stack">
        <div class="equipment-breadcrumb">施工环境 &gt; 环境实时监测</div>

        <section class="environment-dashboard">
          <EquipmentChart title="24小时空气质量数据" :option="airQualityLineOption()" />

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
                  <strong>{{ metric.value }}</strong>
                </div>
              </article>
            </div>
          </section>

          <EquipmentChart title="历史空气质量分析" :option="qualityRingOption()" />
          <EquipmentChart title="噪声 单位：分贝" :option="noiseLineOption()" />

          <section class="equipment-panel air-gauge-panel">
            <h2>
              <el-icon>
                <Aim />
              </el-icon>
              空气质量
            </h2>
            <div class="gauge-grid">
              <EquipmentChart title="" :option="airGaugeOption('TSP', 337.06, 500)" />
              <EquipmentChart title="" :option="airGaugeOption('PM10', 9.54, 200)" />
              <EquipmentChart title="" :option="airGaugeOption('PM2.5', 17.34, 200)" />
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
                <strong>{{ log.time }}</strong>
              </article>
            </div>
          </section>

          <EquipmentChart title="近一周温度" :option="temperatureLineOption()" />
          <EquipmentChart title="近7日空气质量" :option="sevenDayBarOption()" />
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
  gap: 14px;
  min-height: 0;
}

.environment-dashboard :deep(.chart-card) {
  min-height: 238px;
}

.realtime-panel,
.air-gauge-panel,
.spray-log-panel {
  display: grid;
  grid-template-rows: auto minmax(0, 1fr);
}

.env-metric-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 12px;
}

.env-metric {
  display: grid;
  grid-template-columns: 52px minmax(0, 1fr);
  gap: 10px;
  align-items: center;
  min-height: 58px;
  padding: 8px 12px;
  border: 1px solid #e6eefb;
  border-radius: 8px;
  box-shadow: 0 6px 14px rgba(59, 130, 246, 0.08);
}

.env-metric-icon {
  display: grid;
  width: 42px;
  height: 42px;
  place-items: center;
  font-size: 24px;
  background: #eef5ff;
  border-radius: 8px;
}

.env-metric em {
  display: block;
  color: #64748b;
  font-size: 12px;
  font-style: normal;
  font-weight: 900;
}

.env-metric strong {
  color: #334155;
  font-size: 20px;
  line-height: 1.2;
}

.gauge-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 10px;
}

.gauge-grid :deep(.chart-card) {
  min-height: 178px;
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
  min-height: 42px;
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
}
</style>
