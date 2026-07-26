<script setup lang="ts">
import { computed, onMounted, reactive, ref, watch } from 'vue'
import { Refresh, Search } from '@element-plus/icons-vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { handleAlarm } from '../../api/alarms'
import { listDeviceAlarmRecords, type AlarmRecordView } from '../../api/devices'
import AppPagination from '../../components/AppPagination.vue'
import AppTopbar from '../../components/AppTopbar.vue'
import { useResponsivePageSize } from '../../composables/useResponsivePageSize'
import { formatDateTime } from '../../utils/format'
import { statusClass } from './data'

const { pageSize } = useResponsivePageSize()
const currentPage = ref(1)
const totalRecords = ref(0)
const records = ref<AlarmRecordView[]>([])
const filters = reactive({
  alarmType: '',
  deviceName: '',
  status: '',
  startTime: '',
  endTime: ''
})
const totalPages = computed(() => Math.max(1, Math.ceil(totalRecords.value / pageSize.value)))

function statusText(status?: number | string | null) {
  if (status === 2 || status === '已处理' || status === 'handled') return '已处理'
  if (status === 1 || status === '处理中' || status === 'processing') return '处理中'
  return '未处理'
}

async function loadRecords() {
  try {
    const result = await listDeviceAlarmRecords({
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
  filters.alarmType = ''
  filters.deviceName = ''
  filters.status = ''
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

async function handleRecord(record: AlarmRecordView) {
  if (statusText(record.status) === '已处理') {
    ElMessage.info('该报警已处理')
    return
  }

  try {
    const { value } = await ElMessageBox.prompt('请输入报警处理内容', '报警处理', {
      confirmButtonText: '确认处理',
      cancelButtonText: '取消',
      inputPattern: /\S+/,
      inputErrorMessage: '处理内容不能为空'
    })
    await handleAlarm(record.id, { handleBy: '系统管理员', handleContent: value })
    ElMessage.success('报警已处理')
    loadRecords()
  } catch {
    return
  }
}

watch(pageSize, searchRecords)
onMounted(loadRecords)
</script>

<template>
  <main class="equipment-page">
    <AppTopbar />

    <section class="equipment-content">
      <div class="records-stack">
        <div class="equipment-breadcrumb">施工设备 &gt; 监测报警记录</div>

        <section class="equipment-panel equipment-filter alarm-filter">
          <label>
            <span>报警类型</span>
            <select v-model="filters.alarmType">
              <option value="">请选择报警类型</option>
              <option>基坑监测报警</option>
              <option>高支模监测报警</option>
              <option>塔吊报警</option>
              <option>升降机报警</option>
            </select>
          </label>
          <label>
            <span>报警时间</span>
            <input v-model="filters.startTime" type="date" />
          </label>
          <label>
            <span>结束时间</span>
            <input v-model="filters.endTime" type="date" />
          </label>
          <label>
            <span>设备名称</span>
            <input v-model="filters.deviceName" placeholder="请输入设备名称" />
          </label>
          <label>
            <span>处理状态</span>
            <select v-model="filters.status">
              <option value="">请选择处理状态</option>
              <option value="0">未处理</option>
              <option value="1">处理中</option>
              <option value="2">已处理</option>
            </select>
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
            <table class="equipment-table alarm-table">
              <colgroup>
                <col class="col-index" />
                <col class="col-device" />
                <col class="col-type" />
                <col class="col-content" />
                <col class="col-value" />
                <col class="col-unit" />
                <col class="col-limit" />
                <col class="col-limit" />
                <col class="col-time" />
                <col class="col-status" />
                <col class="col-action" />
              </colgroup>
              <thead>
                <tr>
                  <th>序号</th>
                  <th>设备名称</th>
                  <th>报警类型</th>
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
                <tr v-for="record in records" :key="record.id">
                  <td class="index-cell">{{ record.id }}</td>
                  <td :title="record.deviceName || '-'">{{ record.deviceName || '-' }}</td>
                  <td>{{ record.alarmType || '-' }}</td>
                  <td :title="record.content || '-'">{{ record.content || '-' }}</td>
                  <td>{{ record.alarmValue ?? '-' }}</td>
                  <td>{{ record.unit || '-' }}</td>
                  <td>{{ record.alarmUpper ?? record.warnUpper ?? '-' }}</td>
                  <td>{{ record.alarmLower ?? record.warnLower ?? '-' }}</td>
                  <td class="time-cell" :title="formatDateTime(record.occurredAt)">
                    {{ formatDateTime(record.occurredAt) }}
                  </td>
                  <td>
                    <span class="status-pill" :class="statusClass(statusText(record.status))">
                      {{ statusText(record.status) }}
                    </span>
                  </td>
                  <td>
                    <button class="link-btn" type="button" @click="handleRecord(record)">处理</button>
                  </td>
                </tr>
                <tr v-if="!records.length">
                  <td colspan="11">暂无报警记录</td>
                </tr>
              </tbody>
            </table>
          </div>

          <AppPagination :page="currentPage" :total="totalRecords" :page-size="pageSize" @change="changePage" />
        </section>
      </div>
    </section>
  </main>
</template>

<style scoped>
.records-stack {
  display: grid;
  grid-template-rows: auto auto minmax(0, 1fr);
  gap: 12px;
  height: 100%;
  min-height: 0;
  padding: 4px 16px 24px;
}

.alarm-filter {
  display: grid;
  grid-template-columns: repeat(5, minmax(0, 1fr)) auto;
  gap: 10px 12px;
  align-items: end;
  padding: 14px 18px;
}

.alarm-filter label {
  width: auto;
  min-width: 0;
}

.alarm-filter .equipment-actions {
  flex-wrap: nowrap;
  white-space: nowrap;
}

.table-panel {
  display: grid;
  grid-template-rows: minmax(0, 1fr) auto;
  padding: 0;
}

.record-table-body {
  min-height: 0;
  overflow-x: hidden;
  overflow-y: auto;
}

.alarm-table {
  min-width: 0;
}

.col-index {
  width: 82px;
}

.col-device {
  width: 140px;
}

.col-content {
  width: auto;
}

.col-time {
  width: 150px;
}

.col-type {
  width: 112px;
}

.col-value,
.col-limit {
  width: 88px;
}

.col-unit {
  width: 64px;
}

.col-status {
  width: 92px;
}

.col-action {
  width: 66px;
}

.time-cell {
  font-size: 13px;
}

.alarm-table :is(th, td):first-child,
.index-cell {
  overflow-wrap: normal !important;
  white-space: nowrap !important;
  word-break: keep-all;
}

@media (max-width: 1380px) {
  .alarm-filter {
    grid-template-columns: repeat(3, minmax(0, 1fr));
  }

  .alarm-filter .equipment-actions {
    grid-column: 1 / -1;
  }
}
</style>
