<script setup lang="ts">
import { computed, onMounted, reactive, ref, watch } from 'vue'
import { Refresh, Search } from '@element-plus/icons-vue'
import { listSprayRecords, type SprayRecordView } from '../../api/environment'
import AppTopbar from '../../components/AppTopbar.vue'
import { useResponsivePageSize } from '../../composables/useResponsivePageSize'
import { formatDateTime } from '../../utils/format'

const { pageSize } = useResponsivePageSize()
const currentPage = ref(1)
const totalRecords = ref(0)
const records = ref<SprayRecordView[]>([])
const filters = reactive({ operationType: '', deviceName: '', startTime: '', endTime: '' })
const totalPages = computed(() => Math.max(1, Math.ceil(totalRecords.value / pageSize.value)))

async function loadRecords() {
  try {
    const result = await listSprayRecords({ ...filters, page: currentPage.value, pageSize: pageSize.value })
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
  filters.operationType = ''
  filters.deviceName = ''
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
        <div class="equipment-breadcrumb">施工环境 &gt; 自动喷淋记录</div>

        <section class="equipment-panel equipment-filter">
          <label>
            <span>操作类型</span>
            <select v-model="filters.operationType">
              <option value="">请选择</option>
              <option value="开启">开启</option>
              <option value="停止">停止</option>
            </select>
          </label>
          <label class="wide-field">
            <span>设备名称</span>
            <input v-model="filters.deviceName" placeholder="请输入设备名称" />
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
                <tr v-for="record in records" :key="record.id">
                  <td>{{ record.id }}</td>
                  <td>{{ record.sprayDeviceName || record.deviceName || '-' }}</td>
                  <td>{{ record.locationName || '-' }}</td>
                  <td class="danger-text">{{ record.operationType || '-' }}</td>
                  <td :title="record.reason || record.triggerType || '-'">{{ record.reason || record.triggerType || '-' }}</td>
                  <td class="time-cell" :title="formatDateTime(record.operationTime || record.startedAt)">
                    {{ formatDateTime(record.operationTime || record.startedAt) }}
                  </td>
                </tr>
                <tr v-if="!records.length">
                  <td colspan="6">暂无喷淋记录</td>
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
  width: 340px;
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
  min-width: 1080px;
}

.record-table-body .equipment-table th {
  height: 46px;
}

.record-table-body .equipment-table td {
  height: 48px;
}

.equipment-pagination {
  flex: 0 0 58px;
  background: rgba(255, 255, 255, 0.98);
}

.col-id {
  width: 7%;
}

.col-device,
.col-location {
  width: 18%;
}

.col-action {
  width: 12%;
}

.col-time {
  width: 190px;
}

.danger-text {
  color: #ef4444 !important;
}
</style>
