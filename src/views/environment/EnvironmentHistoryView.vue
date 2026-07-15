<script setup lang="ts">
import { Refresh, Search } from '@element-plus/icons-vue'
import AppTopbar from '../../components/AppTopbar.vue'
import { historyRecords } from './data'
</script>

<template>
  <main class="equipment-page">
    <AppTopbar />
    <section class="equipment-content">
      <div class="records-stack">
        <div class="equipment-breadcrumb">施工环境 &gt; 环境监测历史数据</div>

        <section class="equipment-panel equipment-filter">
          <label class="wide-field">
            <span>监测点名称</span>
            <input placeholder="请输入监测点名称" />
          </label>
          <label>
            <span>监测时间</span>
            <input type="date" />
          </label>
          <label>
            <span>结束时间</span>
            <input type="date" />
          </label>
          <div class="equipment-actions">
            <button class="primary-btn" type="button">
              <el-icon><Search /></el-icon>
              搜索
            </button>
            <button class="plain-btn" type="button">
              <el-icon><Refresh /></el-icon>
              重置
            </button>
          </div>
        </section>

        <section class="equipment-panel env-table-panel">
          <div class="record-table-body">
            <table class="equipment-table">
              <thead>
                <tr>
                  <th>序号</th>
                  <th>监测点编号</th>
                  <th>监测点名称</th>
                  <th>监测值</th>
                  <th>单位</th>
                  <th>报警上限</th>
                  <th>报警下限</th>
                  <th>监测时间</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="record in historyRecords" :key="record.id">
                  <td>{{ record.id }}</td>
                  <td>{{ record.code }}</td>
                  <td>{{ record.name }}</td>
                  <td>{{ record.value }}</td>
                  <td>{{ record.unit }}</td>
                  <td>{{ record.upper }}</td>
                  <td>{{ record.lower }}</td>
                  <td>{{ record.time }}</td>
                </tr>
              </tbody>
            </table>
          </div>
          <footer class="equipment-pagination">
            <span class="count">共194页</span>
            <button type="button">‹</button>
            <button class="active" type="button">1</button>
            <button type="button">2</button>
            <button type="button">3</button>
            <button type="button">4</button>
            <button type="button">5</button>
            <button type="button">...</button>
            <button type="button">194</button>
            <button type="button">›</button>
          </footer>
        </section>
      </div>
    </section>
  </main>
</template>

<style scoped>
.records-stack {
  display: grid;
  grid-template-rows: auto auto minmax(0, 1fr);
  gap: 14px;
  height: 100%;
  min-height: 0;
  padding: 4px 16px 24px;
}

.wide-field {
  width: 420px;
}

.env-table-panel {
  display: grid;
  grid-template-rows: minmax(0, 1fr) auto;
  padding: 0;
}

.record-table-body {
  min-height: 0;
  overflow: auto;
}
</style>
