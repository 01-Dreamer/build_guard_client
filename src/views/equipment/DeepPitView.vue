<script setup lang="ts">
import { DataAnalysis, Memo } from '@element-plus/icons-vue'
import AppTopbar from '../../components/AppTopbar.vue'
import Equipment3DModel from '../../components/equipment/Equipment3DModel.vue'
import EquipmentChart from '../../components/equipment/EquipmentChart.vue'
import { pitRows } from './data'
import { alarmTrendOption, pieOption } from './chartOptions'

const tabs = ['西区2#深基坑', '山东省', '东区1#深基坑']
const settlementRows = [
  ['16:22', '9.42', '报警'],
  ['16:22', '8.92', '报警'],
  ['16:22', '11.89', '报警'],
  ['16:22', '9.24', '报警'],
  ['16:22', '11.06', '报警'],
  ['16:22', '8.18', '报警']
]
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
              <table class="monitor-table">
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
                    <td :title="row.time">{{ row.time }}</td>
                  </tr>
                </tbody>
              </table>
            </section>

            <section class="equipment-panel">
              <h2>
                <el-icon>
                  <Memo />
                </el-icon>
                沉降数据
              </h2>
              <table class="monitor-table compact">
                <thead>
                  <tr>
                    <th>时间</th>
                    <th>沉降量(mm)</th>
                    <th>状态</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="row in settlementRows" :key="row[0] + row[1]">
                    <td>{{ row[0] }}</td>
                    <td>{{ row[1] }}</td>
                    <td class="alert">{{ row[2] }}</td>
                  </tr>
                </tbody>
              </table>
            </section>
          </aside>

          <section class="equipment-panel structure-center">
            <nav class="tab-list">
              <RouterLink
                v-for="tab in tabs"
                :key="tab"
                to="/equipment/deep-pit"
                :class="{ active: tab === '东区1#深基坑' }"
              >
                {{ tab }}
                <span class="live-dot" />
              </RouterLink>
            </nav>

            <div class="model-wrap">
              <Equipment3DModel model="pit" />
              <div class="model-label label-one">土压力<br />45.02 kPa</div>
              <div class="model-label label-two">应变拉力<br />165.13 kN</div>
              <div class="model-label label-three">地下水位<br />-2.88 m</div>
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
            <EquipmentChart title="一周预警报警数据" :option="alarmTrendOption()" />
            <EquipmentChart title="累计报警类型占比" :option="pieOption(['沉降值超下限', 'x倾角超下限', 'y倾角超下限', '应变拉力超上限', '应变拉力超下限', '土压力超上限'])" />
          </aside>
        </section>
      </div>
    </section>
  </main>
</template>

<style scoped>
.structure-layout {
  display: grid;
  grid-template-columns: 320px minmax(560px, 1fr) 360px;
  gap: 12px;
  min-height: 0;
}

.structure-left,
.structure-right {
  display: grid;
  align-content: start;
  gap: 12px;
  min-height: 0;
}

.structure-center {
  display: grid;
  grid-template-rows: auto minmax(0, 1fr);
}

.model-wrap {
  position: relative;
  min-height: 0;
}

.model-label {
  position: absolute;
  color: #111827;
  font-size: 15px;
  font-weight: 900;
  text-align: center;
  text-shadow: 0 1px 0 #fff;
}

.label-one {
  left: 28%;
  top: 29%;
}

.label-two {
  left: 49%;
  top: 27%;
}

.label-three {
  left: 49%;
  top: 42%;
}

.legend-row {
  position: absolute;
  left: 12px;
  bottom: 10px;
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  align-items: center;
  color: #475569;
  font-size: 13px;
  font-weight: 900;
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
  height: 42px;
}

@media (max-width: 1180px) {
  .structure-layout {
    grid-template-columns: 1fr;
  }
}
</style>
