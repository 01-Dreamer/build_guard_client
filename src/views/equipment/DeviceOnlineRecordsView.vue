<script setup lang="ts">
import { Refresh, Search } from '@element-plus/icons-vue'
import AppTopbar from '../../components/AppTopbar.vue'
import { onlineRecords, statusClass } from './data'
</script>

<template>
  <main class="equipment-page">
    <AppTopbar />

    <section class="equipment-content">
      <div class="records-stack">
        <div class="equipment-breadcrumb">施工设备 &gt; 设备上下线记录</div>

        <section class="equipment-panel equipment-filter">
          <label>
            <span>设备名称</span>
            <input placeholder="请输入设备名称" />
          </label>
          <label>
            <span>设备id</span>
            <input placeholder="请输入设备id" />
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
              <el-icon>
                <Search />
              </el-icon>
              搜索
            </button>
            <button class="plain-btn" type="button">
              <el-icon>
                <Refresh />
              </el-icon>
              重置
            </button>
          </div>
        </section>

        <section class="equipment-panel table-panel">
          <div class="record-table-body">
            <table class="equipment-table">
              <colgroup>
                <col class="col-id" />
                <col />
                <col />
                <col />
                <col />
                <col class="col-status" />
              </colgroup>
              <thead>
                <tr>
                  <th>序号</th>
                  <th>设备名称</th>
                  <th>设备编号</th>
                  <th>设备类型</th>
                  <th>监测时间</th>
                  <th>状态</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="record in onlineRecords" :key="record.id">
                  <td>{{ record.id }}</td>
                  <td :title="record.name">{{ record.name }}</td>
                  <td>{{ record.code }}</td>
                  <td>{{ record.type }}</td>
                  <td>{{ record.time }}</td>
                  <td>
                    <span class="status-pill" :class="statusClass(record.status)">
                      {{ record.status }}
                    </span>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <footer class="equipment-pagination">
            <span class="count">共109条　10条/页</span>
            <button class="active" type="button">1</button>
            <button type="button">2</button>
            <button type="button">3</button>
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

.table-panel {
  display: grid;
  grid-template-rows: minmax(0, 1fr) auto;
  padding: 0;
}

.record-table-body {
  min-height: 0;
  overflow: auto;
}

.col-id {
  width: 10%;
}

.col-status {
  width: 12%;
}
</style>
