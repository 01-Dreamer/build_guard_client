<script setup lang="ts">
import { Edit, Plus, Refresh, Search, Delete } from '@element-plus/icons-vue'
import AppTopbar from '../../components/AppTopbar.vue'
import { envStatusClass, sprayTasks } from './data'
</script>

<template>
  <main class="equipment-page">
    <AppTopbar />
    <section class="equipment-content">
      <div class="records-stack">
        <div class="equipment-breadcrumb">施工环境 &gt; 喷淋任务</div>

        <section class="equipment-panel equipment-filter task-filter">
          <label>
            <span>计划名称</span>
            <input placeholder="请输入计划名称" />
          </label>
          <label>
            <span>启用状态</span>
            <select>
              <option>请选择启停状态</option>
              <option>启动</option>
              <option>停止</option>
            </select>
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
          <button class="add-btn" type="button">
            <el-icon><Plus /></el-icon>
            新增
          </button>
        </section>

        <section class="equipment-panel env-table-panel">
          <div class="record-table-body">
            <table class="equipment-table">
              <colgroup>
                <col class="col-index" />
                <col class="col-name" />
                <col class="col-time" />
                <col class="col-duration" />
                <col class="col-cycle" />
                <col class="col-unit" />
                <col class="col-status" />
                <col class="col-time" />
                <col class="col-actions" />
              </colgroup>
              <thead>
                <tr>
                  <th>序号</th>
                  <th>任务名称</th>
                  <th>启动时间</th>
                  <th>喷淋时长(分钟)</th>
                  <th>执行周期</th>
                  <th>执行周期单位</th>
                  <th>启停状态</th>
                  <th>下次执行时间</th>
                  <th>操作</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="task in sprayTasks" :key="task.id">
                  <td>{{ task.id }}</td>
                  <td>{{ task.name }}</td>
                  <td>{{ task.startTime }}</td>
                  <td>{{ task.duration }}</td>
                  <td>{{ task.cycle }}</td>
                  <td>{{ task.unit }}</td>
                  <td>
                    <span class="status-pill" :class="envStatusClass(task.status)">{{ task.status }}</span>
                  </td>
                  <td>{{ task.nextTime }}</td>
                  <td class="action-cell">
                    <button class="link-btn" type="button"><el-icon><Edit /></el-icon> 修改</button>
                    <button class="link-btn" type="button"><el-icon><Delete /></el-icon> 删除</button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
          <footer class="equipment-pagination">
            <span class="count">共5条　10条/页</span>
            <button type="button">‹</button>
            <button class="active" type="button">1</button>
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

.task-filter {
  position: relative;
}

.add-btn {
  display: inline-flex;
  gap: 6px;
  align-items: center;
  height: 38px;
  padding: 0 18px;
  margin-left: auto;
  color: #fff;
  font-weight: 900;
  cursor: pointer;
  background: #3f6fed;
  border: 0;
  border-radius: 6px;
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

.link-btn {
  display: inline-flex;
  gap: 4px;
  align-items: center;
  height: 28px;
  padding: 0 4px;
  margin-right: 0;
  white-space: nowrap;
}

.action-cell {
  display: flex;
  gap: 10px;
  align-items: center;
  overflow: visible;
}

.col-index {
  width: 70px;
}

.col-name {
  width: 210px;
}

.col-time {
  width: 220px;
}

.col-duration {
  width: 160px;
}

.col-cycle {
  width: 120px;
}

.col-unit {
  width: 160px;
}

.col-status {
  width: 120px;
}

.col-actions {
  width: 190px;
}
</style>
