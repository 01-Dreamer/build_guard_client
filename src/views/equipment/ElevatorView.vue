<script setup lang="ts">
import { Bottom, DataLine, Odometer, Top, User, Warning } from '@element-plus/icons-vue'
import AppTopbar from '../../components/AppTopbar.vue'
import EquipmentChart from '../../components/equipment/EquipmentChart.vue'
import { elevatorInfo } from './data'
import { lineOption } from './chartOptions'

const elevatorTabs = ['东区一号升降机', '基坑升降机#2']
const statusCards = [
  { label: '实时重量', value: '926.93KG', icon: Odometer },
  { label: '实时高度', value: '55m', icon: Top },
  { label: '实时速度', value: '27.87m/s', icon: DataLine },
  { label: '实时倾斜度', value: '8.48度', icon: Warning },
  { label: '实时人数', value: '5', icon: User }
]
const bottomMetrics = [
  { value: '上升', label: '方向', icon: Top },
  { value: '前门：关闭 后门：关闭', label: '门锁状态', icon: Bottom },
  { value: '超重报警', label: '运行状态', icon: Warning, danger: true }
]
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
                  <strong>0</strong>
                  <span>当日预警</span>
                  <b>17</b>
                  <em>累计预警</em>
                </article>
                <article class="red">
                  <strong>0</strong>
                  <span>当日报警</span>
                  <b>2</b>
                  <em>累计报警</em>
                </article>
              </div>
            </section>

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
              <RouterLink
                v-for="tab in elevatorTabs"
                :key="tab"
                to="/equipment/elevator"
                :class="{ active: tab === '东区一号升降机' }"
              >
                {{ tab }}
                <span class="live-dot" />
              </RouterLink>
            </nav>

            <div class="elevator-scene">
              <div class="device-meta">
                <span>设备编号 <strong>TJ-019</strong></span>
                <span>数据获取时间 <strong>2025-11-27 15:33:51</strong></span>
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
            <EquipmentChart title="实时速度" :option="lineOption('#60a5fa', [25.4, 24.6, 26.6, 29.1, 23.9, 28.8, 27.9], '速度', 'm/s')" />
            <EquipmentChart title="实时载重" :option="lineOption('#22c55e', [930, 805, 925, 924, 924, 835, 919], '载重', 'KG')" />
            <EquipmentChart title="实时高度" :option="lineOption('#f59e0b', [52, 56, 53, 52, 50, 63, 55], '高度', 'm')" />
          </aside>
        </section>
      </div>
    </section>
  </main>
</template>

<style scoped>
.elevator-layout {
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

.elevator-main {
  display: grid;
  grid-template-rows: auto minmax(440px, 1fr) auto;
  gap: 12px;
}

.elevator-scene {
  position: relative;
  display: grid;
  grid-template-columns: minmax(220px, 1fr) 230px minmax(220px, 1fr);
  gap: 26px;
  align-items: center;
  min-height: 0;
  padding: 44px 30px 26px;
  background: linear-gradient(180deg, #fbfdff, #f7faff);
  border-radius: 8px;
}

.device-meta {
  position: absolute;
  top: 18px;
  left: 24px;
  display: flex;
  gap: 34px;
  color: #64748b;
  font-weight: 900;
}

.device-meta strong {
  color: #6d95ff;
}

.status-column {
  display: grid;
  gap: 34px;
}

.sensor-card {
  display: grid;
  grid-template-columns: 48px 1fr;
  gap: 4px 12px;
  align-items: center;
  min-height: 100px;
  padding: 18px;
  background: #fff;
  border: 1px solid #e6eefb;
  border-radius: 8px;
  box-shadow: 0 12px 24px rgba(59, 130, 246, 0.08);
}

.sensor-card .el-icon {
  grid-row: 1 / 3;
  display: grid;
  width: 48px;
  height: 48px;
  place-items: center;
  color: #60a5fa;
  font-size: 26px;
  background: #eaf2ff;
  border-radius: 50%;
}

.sensor-card span {
  color: #64748b;
  font-weight: 900;
}

.sensor-card strong {
  color: #6d95ff;
  font-size: 20px;
}

.elevator-shaft {
  position: relative;
  height: 390px;
}

.shaft-rail {
  position: absolute;
  left: 50%;
  bottom: 12px;
  width: 42px;
  height: 338px;
  background:
    repeating-linear-gradient(45deg, transparent 0 16px, rgba(255, 255, 255, 0.94) 16px 20px),
    #7db0ff;
  border: 3px solid #3f6fed;
  transform: translateX(-50%);
}

.shaft-rail::before {
  position: absolute;
  left: -42px;
  right: -42px;
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
  right: 42px;
  top: 178px;
  width: 58px;
  height: 76px;
}

.counterweight {
  left: 42px;
  top: 86px;
  width: 52px;
  height: 72px;
}

.bottom-status {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 14px;
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
