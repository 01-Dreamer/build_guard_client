<script setup lang="ts">
import { computed, onMounted, reactive, ref, watch } from 'vue'
import { Refresh, Search } from '@element-plus/icons-vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { handleAlarm } from '../../api/alarms'
import { listEnvironmentAlarms, type EnvironmentAlarmView } from '../../api/environment'
import AppTopbar from '../../components/AppTopbar.vue'
import { useResponsivePageSize } from '../../composables/useResponsivePageSize'
import { formatDateTime } from '../../utils/format'
import { envStatusClass } from './data'

const { pageSize } = useResponsivePageSize()
const currentPage = ref(1)
const totalRecords = ref(0)
const records = ref<EnvironmentAlarmView[]>([])
const filters = reactive({ alarmLevel: '', status: '', startTime: '', endTime: '' })
const totalPages = computed(() => Math.max(1, Math.ceil(totalRecords.value / pageSize.value)))

function statusText(status?: string | number | null) {
  if (status === 2 || status === '已处理' || status === 'handled') return '已处理'
  if (status === 1 || status === '处理中' || status === 'processing') return '处理中'
  return '未处理'
}

async function loadRecords() {
  try {
    const result = await listEnvironmentAlarms({ ...filters, page: currentPage.value, pageSize: pageSize.value })
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
  filters.alarmLevel = ''
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

async function handleRecord(record: EnvironmentAlarmView) {
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
    <section class="equipment-content environment-record-content">
      <div class="records-stack">
        <div class="equipment-breadcrumb">施工环境 &gt; 环境监测报警记录</div>

        <section class="equipment-panel equipment-filter">
          <label>
            <span>监测类型</span>
            <select v-model="filters.alarmLevel">
              <option value=""></option>
              <option value="warning">预警</option>
              <option value="alarm">报警</option>
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
            <span>处理状态</span>
            <select v-model="filters.status">
              <option value=""></option>
              <option value="0">未处理</option>
              <option value="1">处理中</option>
              <option value="2">已处理</option>
            </select>
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
                <col class="col-status" />
                <col class="col-action" />
              </colgroup>
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
                <tr v-for="record in records" :key="record.id">
                  <td>{{ record.id }}</td>
                  <td>{{ record.alarmLevel || record.alarmType || '-' }}</td>
                  <td>{{ record.content || '-' }}</td>
                  <td>{{ record.alarmValue ?? '-' }}</td>
                  <td>{{ record.unit || '-' }}</td>
                  <td>{{ record.alarmUpper ?? record.warnUpper ?? '-' }}</td>
                  <td>{{ record.alarmLower ?? record.warnLower ?? '-' }}</td>
                  <td class="time-cell" :title="formatDateTime(record.occurredAt)">
                    {{ formatDateTime(record.occurredAt) }}
                  </td>
                  <td>
                    <span class="status-pill" :class="envStatusClass(statusText(record.status))">
                      {{ statusText(record.status) }}
                    </span>
                  </td>
                  <td>
                    <button class="link-btn" type="button" @click="handleRecord(record)">处理</button>
                  </td>
                </tr>
                <tr v-if="!records.length">
                  <td colspan="10">暂无环境报警记录</td>
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
  min-width: 1320px;
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

.col-unit {
  width: 84px;
}

.col-time {
  width: 190px;
}

.col-status {
  width: 120px;
}

.col-action {
  width: 110px;
}
</style>
