<script setup lang="ts">
import { Refresh, Search } from '@element-plus/icons-vue'
import AppTopbar from '../../components/AppTopbar.vue'
import { sprayRecords } from './data'
</script>

<template>
  <main class="equipment-page">
    <AppTopbar />
    <section class="equipment-content">
      <div class="records-stack">
        <div class="equipment-breadcrumb">施工环境 &gt; 自动喷淋记录</div>

        <section class="equipment-panel equipment-filter">
          <label>
            <span>操作类型</span>
            <select>
              <option>请选择</option>
              <option>开启</option>
              <option>停止</option>
            </select>
          </label>
          <label class="wide-field">
            <span>设备名称</span>
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
              <colgroup>
                <col class="col-id" />
                <col class="col-device" />
                <col class="col-location" />
                <col class="col-action" />
                <col />
                <col class="col-time" />
              </colgroup>
              <thead>
                <tr>
                  <th>序号</th>
                  <th>设备名称</th>
                  <th>设备位置</th>
                  <th>操作类型</th>
                  <th>操作原因</th>
                  <th>操作时间</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="record in sprayRecords" :key="record.id">
                  <td>{{ record.id }}</td>
                  <td>{{ record.device }}</td>
                  <td>{{ record.location }}</td>
                  <td class="danger-text">{{ record.action }}</td>
                  <td :title="record.reason">{{ record.reason }}</td>
                  <td>{{ record.time }}</td>
                </tr>
              </tbody>
            </table>
          </div>
          <footer class="equipment-pagination">
            <span class="count">共44条　10条/页</span>
            <button type="button">‹</button>
            <button class="active" type="button">1</button>
            <button type="button">2</button>
            <button type="button">3</button>
            <button type="button">4</button>
            <button type="button">5</button>
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
  width: 340px;
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

.col-id {
  width: 7%;
}

.col-device,
.col-location,
.col-time {
  width: 18%;
}

.col-action {
  width: 12%;
}

.danger-text {
  color: #ef4444 !important;
}
</style>
