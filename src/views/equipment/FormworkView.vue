<script setup lang="ts">
import { DataAnalysis, Memo } from '@element-plus/icons-vue'
import AppTopbar from '../../components/AppTopbar.vue'
import Equipment3DModel from '../../components/equipment/Equipment3DModel.vue'
import EquipmentChart from '../../components/equipment/EquipmentChart.vue'
import { formworkRows } from './data'
import { alarmTrendOption, pieOption } from './chartOptions'

const tabs = ['西区2#高支模', '东区2#高支模', '东区1#高支模']
const settlementRows = [
  ['16:16:04', '78.00', '报警'],
  ['16:14:42', '75.00', '报警'],
  ['16:12:05', '76.00', '报警'],
  ['16:10:34', '72.00', '预警'],
  ['16:08:11', '69.00', '正常']
]
</script>

<template>
  <main class="equipment-page">
    <AppTopbar />

    <section class="equipment-content">
      <div class="equipment-stack">
        <div class="equipment-breadcrumb">施工设备 &gt; 高支模监测分析</div>

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
                  <tr v-for="row in formworkRows" :key="row.name">
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
                to="/equipment/formwork"
                :class="{ active: tab === '东区1#高支模' }"
              >
                {{ tab }}
                <span class="live-dot" />
              </RouterLink>
            </nav>

            <div class="model-wrap">
              <Equipment3DModel model="formwork" />
              <div class="model-label label-one">设备电量<br />78 w/h</div>
              <div class="model-label label-two">倾斜状态<br />1</div>
              <div class="model-label label-three">压力值<br />6.21 kPa</div>
              <div class="legend-row">
                <span class="blue" />正常值
                <span class="yellow" />超出预警值
                <span class="red" />超出报警值
              </div>
            </div>
          </section>

          <aside class="structure-right">
            <EquipmentChart title="一周预警报警数据" :option="alarmTrendOption()" />
            <EquipmentChart title="累计报警类型占比" :option="pieOption(['设备电量超上限', '沉降超下限报警', '沉降超上限报警', '电池状态超下限', '倾斜状态超上限', '传感器状态'])" />
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
  font-size: 14px;
  font-weight: 900;
  text-align: center;
  text-shadow: 0 1px 0 #fff;
}

.label-one {
  left: 35%;
  top: 33%;
}

.label-two {
  left: 45%;
  top: 42%;
}

.label-three {
  left: 45%;
  top: 64%;
}

.legend-row {
  position: absolute;
  left: 12px;
  bottom: 10px;
  display: flex;
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
