<script setup lang="ts">
import { computed, onMounted, reactive, ref, watch } from 'vue'
import { Refresh, Search } from '@element-plus/icons-vue'
import { listDeviceOnlineRecords, type DeviceOnlineRecordView } from '../../api/devices'
import AppTopbar from '../../components/AppTopbar.vue'
import { useResponsivePageSize } from '../../composables/useResponsivePageSize'
import { formatDateTime } from '../../utils/format'
import { statusClass } from './data'

const { pageSize } = useResponsivePageSize()
const currentPage = ref(1)
const totalRecords = ref(0)
const records = ref<DeviceOnlineRecordView[]>([])
const filters = reactive({
  deviceName: '',
  deviceCode: '',
  startTime: '',
  endTime: ''
})
const totalPages = computed(() => Math.max(1, Math.ceil(totalRecords.value / pageSize.value)))

function statusText(status?: number | string | null) {
  return status === 1 || status === 'online' || status === '在线' ? '在线' : '离线'
}

async function loadRecords() {
  try {
    const result = await listDeviceOnlineRecords({
      ...filters,
      page: currentPage.value,
      pageSize: pageSize.value
    })
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
  filters.deviceName = ''
  filters.deviceCode = ''
  filters.startTime = ''
  filters.endTime = ''
  searchRecords()
}

watch(pageSize, searchRecords)
onMounted(loadRecords)
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
            <input v-model="filters.deviceName" placeholder="请输入设备名称" />
          </label>
          <label>
            <span>设备id</span>
            <input v-model="filters.deviceCode" placeholder="请输入设备id" />
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
              <el-icon>
                <Search />
              </el-icon>
              搜索
            </button>
            <button class="plain-btn" type="button" @click="resetFilters">
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
                <col class="col-time" />
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
                <tr v-for="record in records" :key="record.id">
                  <td>{{ record.id }}</td>
                  <td :title="record.deviceName || '-'">{{ record.deviceName || '-' }}</td>
                  <td>{{ record.deviceCode || '-' }}</td>
                  <td>{{ record.deviceType || '-' }}</td>
                  <td class="time-cell" :title="formatDateTime(record.reportedAt)">
                    {{ formatDateTime(record.reportedAt) }}
                  </td>
                  <td>
                    <span class="status-pill" :class="statusClass(statusText(record.onlineStatus))">
                      {{ statusText(record.onlineStatus) }}
                    </span>
                  </td>
                </tr>
                <tr v-if="!records.length">
                  <td colspan="6">暂无上下线记录</td>
                </tr>
              </tbody>
            </table>
          </div>

          <footer class="equipment-pagination">
            <span class="count">共{{ totalRecords }}条　{{ pageSize }}条/页</span>
            <button class="active" type="button">1</button>
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

.table-panel {
  display: grid;
  grid-template-rows: minmax(0, 1fr) auto;
  padding: 0;
}

.record-table-body {
  min-height: 0;
  overflow: auto;
}

.equipment-table {
  min-width: 920px;
}

.col-id {
  width: 76px;
}

.col-time {
  width: 172px;
}

.col-status {
  width: 108px;
}

.time-cell {
  font-size: 13px;
}
</style>
