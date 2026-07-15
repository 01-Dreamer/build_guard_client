<script setup lang="ts">
import { computed } from 'vue'
import { Refresh, Search } from '@element-plus/icons-vue'
import AppTopbar from '../../components/AppTopbar.vue'
import { fillPageRows, useResponsivePageSize } from '../../composables/useResponsivePageSize'
import { envAlarmRecords, envStatusClass } from './data'

const totalRecords = 54
const { pageSize } = useResponsivePageSize()
const visibleRecords = computed(() => fillPageRows(envAlarmRecords, pageSize.value, totalRecords))
const totalPages = computed(() => Math.ceil(totalRecords / pageSize.value))
</script>

<template>
  <main class="equipment-page">
    <AppTopbar />
    <section class="equipment-content">
      <div class="records-stack">
        <div class="equipment-breadcrumb">施工环境 &gt; 环境监测报警记录</div>

        <section class="equipment-panel equipment-filter">
          <label>
            <span>监测类型</span>
            <select>
              <option></option>
              <option>预警</option>
              <option>报警</option>
            </select>
          </label>
          <label>
            <span>报警时间</span>
            <input type="date" />
          </label>
          <label>
            <span>结束时间</span>
            <input type="date" />
          </label>
          <label>
            <span>处理状态</span>
            <select>
              <option></option>
              <option>未处理</option>
              <option>处理中</option>
              <option>已处理</option>
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
        </section>

        <section class="equipment-panel env-table-panel">
          <div class="record-table-body">
            <table class="equipment-table">
              <thead>
                <tr>
                  <th>序号</th>
                  <th>监测类型类型</th>
                  <th>报警内容</th>
                  <th>报警值</th>
                  <th>单位</th>
                  <th>报警上限值</th>
                  <th>报警下限值</th>
                  <th>报警时间</th>
                  <th>处理状态</th>
                  <th>操作</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="record in visibleRecords" :key="record.id">
                  <td>{{ record.id }}</td>
                  <td>{{ record.type }}</td>
                  <td>{{ record.content }}</td>
                  <td>{{ record.value }}</td>
                  <td>{{ record.unit }}</td>
                  <td>{{ record.upper }}</td>
                  <td>{{ record.lower }}</td>
                  <td>{{ record.time }}</td>
                  <td>
                    <span class="status-pill" :class="envStatusClass(record.status)">
                      {{ record.status }}
                    </span>
                  </td>
                  <td>
                    <button class="link-btn" type="button">处理</button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
          <footer class="equipment-pagination">
            <span class="count">共{{ totalRecords }}条　{{ pageSize }}条/页</span>
            <button type="button">‹</button>
            <button class="active" type="button">1</button>
            <button type="button">2</button>
            <button type="button">3</button>
            <button type="button">4</button>
            <button type="button">5</button>
            <button type="button">...</button>
            <button type="button">{{ totalPages }}</button>
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
