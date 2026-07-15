<script setup lang="ts">
import { Cpu, DataLine, Odometer, Warning } from '@element-plus/icons-vue'
import AppTopbar from '../../components/AppTopbar.vue'
import EquipmentChart from '../../components/equipment/EquipmentChart.vue'
import { equipmentMenuItems, towerInfo } from './data'
import { gaugeOption, lineOption } from './chartOptions'

const towerTabs = ['东区塔吊#1', '西区塔吊#2', '基坑塔吊#3']
const workMetrics = [
  { value: '6.00min', label: '工作时长' },
  { value: '8次', label: '今日吊次' },
  { value: '121.27T', label: '今日吊重' },
  { value: '56.11T/min', label: '今日功效' },
  { value: '2次', label: '今日报警' }
]
const realtimeMetrics = [
  { value: '18.55T', label: '吊量', icon: Odometer },
  { value: '50M', label: '幅度', icon: DataLine },
  { value: '0.45度', label: '倾度', icon: Cpu },
  { value: '10.44m/s', label: '风速', icon: DataLine },
  { value: '927.50 M·T', label: '力矩', icon: Warning },
  { value: '10.76M', label: '高度', icon: Odometer }
]
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
                  <strong>1</strong>
                  <span>当日预警</span>
                  <b>16</b>
                  <em>累计预警</em>
                </article>
                <article class="red">
                  <strong>1</strong>
                  <span>当日报警</span>
                  <b>39</b>
                  <em>累计报警</em>
                </article>
              </div>
            </section>

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
              <RouterLink
                v-for="tab in towerTabs"
                :key="tab"
                to="/equipment/tower-crane"
                :class="{ active: tab === '西区塔吊#2' }"
              >
                {{ tab }}
                <span class="live-dot" />
              </RouterLink>
            </nav>

            <div class="tower-hero">
              <div class="tower-drawing">
                <div class="tower-mast" />
                <div class="tower-jib" />
                <div class="tower-counter" />
                <div class="tower-hook" />
                <strong>设备编号 td002</strong>
                <span>数据获取时间 2025-11-28 11:16:39</span>
              </div>

              <div class="work-list">
                <article v-for="metric in workMetrics" :key="metric.label" class="metric-card">
                  <strong>{{ metric.value }}</strong>
                  <span>{{ metric.label }}</span>
                </article>
              </div>

              <div class="gauge-wrap">
                <EquipmentChart title="回转角度" :option="gaugeOption(121)" />
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
            <EquipmentChart title="实时力矩" :option="lineOption('#5b7cfa', [398, 376, 384, 397, 306, 392, 312])" />
            <EquipmentChart title="实时吊重" :option="lineOption('#5b7cfa', [14.6, 13.9, 15.7, 14.0, 15.1, 12.0, 18.5], '吊重', 'T')" />
          </aside>
        </section>
      </div>
    </section>
  </main>
</template>

<style scoped>
.machine-layout {
  display: grid;
  grid-template-columns: 300px minmax(560px, 1fr) 330px;
  gap: 12px;
  min-height: 0;
}

.machine-left,
.machine-right {
  display: grid;
  align-content: start;
  gap: 12px;
  min-height: 0;
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
  grid-template-rows: auto minmax(360px, 1fr) auto;
  gap: 12px;
}

.tower-hero {
  display: grid;
  grid-template-columns: minmax(260px, 0.9fr) minmax(260px, 1fr) 280px;
  gap: 18px;
  align-items: center;
  min-height: 0;
  padding: 28px;
  background: linear-gradient(180deg, #fbfdff, #f7faff);
  border-radius: 8px;
}

.tower-drawing {
  position: relative;
  min-height: 360px;
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
  bottom: 70px;
  width: 24px;
  height: 220px;
  background:
    repeating-linear-gradient(45deg, transparent 0 14px, rgba(255, 255, 255, 0.9) 14px 18px),
    #6fa0ff;
  border: 3px solid #3f6fed;
}

.tower-jib {
  left: 33%;
  top: 80px;
  width: 58%;
  height: 16px;
  transform: skewX(22deg);
  transform-origin: left center;
}

.tower-counter {
  left: 19%;
  top: 82px;
  width: 70px;
  height: 22px;
  background: #f59e0b;
}

.tower-hook {
  left: 78%;
  top: 96px;
  width: 3px;
  height: 96px;
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

.work-list {
  display: grid;
  gap: 12px;
}

.metric-card {
  display: flex;
  align-items: center;
  justify-content: space-between;
  min-height: 58px;
  padding: 0 18px;
  background: #fff;
  border: 1px solid #e6eefb;
  border-radius: 8px;
}

.gauge-wrap :deep(.chart-card) {
  height: 320px;
  box-shadow: none;
}

.realtime-metrics h2 {
  margin: 0 0 12px;
  font-size: 16px;
}

@media (max-width: 1180px) {
  .machine-layout,
  .tower-hero {
    grid-template-columns: 1fr;
  }
}
</style>
