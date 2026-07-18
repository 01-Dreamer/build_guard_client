<script setup lang="ts">
import { computed, onMounted, reactive, ref, watch } from 'vue'
import { Refresh, Search } from '@element-plus/icons-vue'
import { listEnvironmentHistory, type EnvironmentHistoryRecord } from '../../api/environment'
import AppTopbar from '../../components/AppTopbar.vue'
import { useResponsivePageSize } from '../../composables/useResponsivePageSize'
import { formatDateTime } from '../../utils/format'

const { pageSize } = useResponsivePageSize()
const currentPage = ref(1)
const totalRecords = ref(0)
const records = ref<EnvironmentHistoryRecord[]>([])
const filters = reactive({ name: '', startTime: '', endTime: '' })
const totalPages = computed(() => Math.max(1, Math.ceil(totalRecords.value / pageSize.value)))

async function loadRecords() {
  try {
    const result = await listEnvironmentHistory({ ...filters, page: currentPage.value, pageSize: pageSize.value })
    records.value = result.records
    totalRecords.value = result.total
  } catch {
    records.value = []
    totalRecords.value = 0
  }
}

function searchRecords() {
  currentPage.value = 1
  loadRecords()
}

function resetFilters() {
  filters.name = ''
  filters.startTime = ''
  filters.endTime = ''
  searchRecords()
}

function changePage(nextPage: number) {
  const normalizedPage = Math.min(Math.max(1, nextPage), totalPages.value)
  if (normalizedPage === currentPage.value) return
  currentPage.value = normalizedPage
  loadRecords()
}

watch(pageSize, searchRecords)
onMounted(loadRecords)
</script>

<template>
  <main class="equipment-page">
    <AppTopbar />
    <section class="equipment-content environment-record-content">
      <div class="records-stack">
        <div class="equipment-breadcrumb">施工环境 &gt; 环境监测历史数据</div>

        <section class="equipment-panel equipment-filter">
          <label class="wide-field">
            <span>监测点名称</span>
            <input v-model="filters.name" placeholder="请输入监测点名称" />
          </label>
          <label>
            <span>监测时间</span>
            <input v-model="filters.startTime" type="date" />
          </label>
          <label>
            <span>结束时间</span>
            <input v-model="filters.endTime" type="date" />
          </label>
          <div class="equipment-actions">
            <button class="primary-btn" type="button" @click="searchRecords">
              <el-icon><Search /></el-icon>
              搜索
            </button>
            <button class="plain-btn" type="button" @click="resetFilters">
              <el-icon><Refresh /></el-icon>
              重置
            </button>
          </div>
        </section>

        <section class="equipment-panel env-table-panel">
          <div class="record-table-body">
            <table class="equipment-table">
              <colgroup>
                <col class="col-index" />
                <col />
                <col />
                <col />
                <col class="col-unit" />
                <col />
                <col />
                <col class="col-time" />
              </colgroup>
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
                <tr v-for="record in records" :key="record.id">
                  <td>{{ record.id }}</td>
                  <td>{{ record.code }}</td>
                  <td>{{ record.name }}</td>
                  <td>{{ record.value }}</td>
                  <td>{{ record.unit }}</td>
                  <td>{{ record.upper }}</td>
                  <td>{{ record.lower }}</td>
                  <td class="time-cell" :title="formatDateTime(record.reportedAt || record.time)">
                    {{ formatDateTime(record.reportedAt || record.time) }}
                  </td>
                </tr>
                <tr v-if="!records.length">
                  <td colspan="8">暂无环境历史数据</td>
                </tr>
              </tbody>
            </table>
          </div>
          <footer class="equipment-pagination">
            <span class="count">共{{ totalRecords }}条　{{ pageSize }}条/页</span>
            <button type="button" :disabled="currentPage <= 1" @click="changePage(currentPage - 1)">‹</button>
            <button class="active" type="button">{{ currentPage }}</button>
            <button v-if="totalPages > currentPage" type="button" @click="changePage(totalPages)">{{ totalPages }}</button>
            <button type="button" :disabled="currentPage >= totalPages" @click="changePage(currentPage + 1)">›</button>
          </footer>
        </section>
      </div>
    </section>
  </main>
</template>

<style scoped>
.environment-record-content {
  overflow: hidden;
}

.records-stack {
  display: grid;
  grid-template-rows: auto auto minmax(0, 1fr);
  gap: 18px;
  height: 100%;
  min-height: 0;
  padding: 4px 16px 20px;
}

.wide-field {
  width: 420px;
}

.env-table-panel {
  display: grid;
  grid-template-rows: minmax(0, 1fr) auto;
  padding: 0;
  overflow: hidden;
}

.record-table-body {
  min-height: 0;
  overflow: auto;
}

.record-table-body .equipment-table {
  min-width: 1160px;
}

.record-table-body .equipment-table th {
  height: 46px;
}

.record-table-body .equipment-table td {
  height: 48px;
}

.equipment-table .time-cell {
  min-width: 172px;
}

.equipment-pagination {
  flex: 0 0 58px;
  background: rgba(255, 255, 255, 0.98);
}

.col-unit {
  width: 88px;
}

.col-time {
  width: 190px;
}
</style>
