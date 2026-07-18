<script setup lang="ts">
import { computed, onMounted, reactive, ref } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Edit, Plus, Refresh, Search, Delete } from '@element-plus/icons-vue'
import { listDevices, type DeviceView } from '../../api/devices'
import {
  createSprayTask,
  deleteSprayTask,
  listSprayTasks,
  updateSprayTask,
  type SprayTaskPayload,
  type SprayTaskView
} from '../../api/environment'
import AppTopbar from '../../components/AppTopbar.vue'
import { formatDateTime } from '../../utils/format'
import { envStatusClass } from './data'

const sprayTasks = ref<SprayTaskView[]>([])
const sprayDevices = ref<DeviceView[]>([])
const totalRecords = ref(0)
const page = ref(1)
const pageSize = ref(10)
const loading = ref(false)
const saving = ref(false)
const dialogVisible = ref(false)
const editingId = ref<number | null>(null)
const filters = reactive({ name: '', enabled: '' })
const taskForm = reactive<SprayTaskPayload>({
  name: '',
  sprayDeviceId: null,
  startTime: '',
  durationMinutes: 10,
  cycleValue: 1,
  cycleUnit: 'DAYS',
  enabled: 1,
  nextRunAt: ''
})

const totalPages = computed(() => Math.max(1, Math.ceil(totalRecords.value / pageSize.value)))

function statusText(task: SprayTaskView) {
  return task.enabled === 0 || task.enabled === false ? '停止' : '启动'
}

function toDateTimeLocal(value?: string | null) {
  if (!value) return ''
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return value.slice(0, 16)
  const pad = (part: number) => String(part).padStart(2, '0')
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`
}

function normalizeDateTime(value?: string | null) {
  return value || null
}

function resetForm() {
  editingId.value = null
  taskForm.name = ''
  taskForm.sprayDeviceId = sprayDevices.value[0]?.id ?? null
  taskForm.startTime = ''
  taskForm.durationMinutes = 10
  taskForm.cycleValue = 1
  taskForm.cycleUnit = 'DAYS'
  taskForm.enabled = 1
  taskForm.nextRunAt = ''
}

function openCreateDialog() {
  resetForm()
  dialogVisible.value = true
}

function openEditDialog(task: SprayTaskView) {
  editingId.value = task.id
  taskForm.name = task.name
  taskForm.sprayDeviceId = task.sprayDeviceId ?? null
  taskForm.startTime = toDateTimeLocal(task.startTime)
  taskForm.durationMinutes = task.durationMinutes ?? task.duration ?? 10
  taskForm.cycleValue = task.cycleValue ?? task.cycle ?? 1
  taskForm.cycleUnit = task.cycleUnit ?? task.unit ?? 'DAYS'
  taskForm.enabled = task.enabled === 0 || task.enabled === false ? 0 : 1
  taskForm.nextRunAt = toDateTimeLocal(task.nextRunAt ?? task.nextTime)
  dialogVisible.value = true
}

function payload(): SprayTaskPayload {
  return {
    name: taskForm.name.trim(),
    sprayDeviceId: taskForm.sprayDeviceId || null,
    startTime: normalizeDateTime(taskForm.startTime),
    durationMinutes: Number(taskForm.durationMinutes ?? 0),
    cycleValue: taskForm.cycleValue === null ? null : Number(taskForm.cycleValue ?? 1),
    cycleUnit: taskForm.cycleUnit || null,
    enabled: Number(taskForm.enabled ?? 1),
    nextRunAt: normalizeDateTime(taskForm.nextRunAt)
  }
}

async function loadSprayDevices() {
  try {
    const result = await listDevices({ page: 1, pageSize: 100 })
    sprayDevices.value = result.records.filter(
      (device) => device.typeName?.includes('喷淋') || device.name.includes('喷淋') || device.code.startsWith('SP-')
    )
  } catch {
    sprayDevices.value = []
  }
}

async function loadTasks(resetPage = false) {
  if (resetPage) page.value = 1
  loading.value = true
  try {
    const result = await listSprayTasks({ ...filters, page: page.value, pageSize: pageSize.value })
    sprayTasks.value = result.records
    totalRecords.value = result.total
  } catch {
    sprayTasks.value = []
    totalRecords.value = 0
  } finally {
    loading.value = false
  }
}

function resetFilters() {
  filters.name = ''
  filters.enabled = ''
  loadTasks(true)
}

async function saveTask() {
  const data = payload()
  if (!data.name || !data.sprayDeviceId || !data.startTime || !data.durationMinutes) {
    ElMessage.warning('请填写计划名称、喷淋设备、启动时间和喷淋时长')
    return
  }
  saving.value = true
  try {
    if (editingId.value) {
      await updateSprayTask(editingId.value, data)
      ElMessage.success('喷淋任务已更新')
    } else {
      await createSprayTask(data)
      ElMessage.success('喷淋任务已新增')
    }
    dialogVisible.value = false
    await loadTasks()
  } finally {
    saving.value = false
  }
}

async function removeTask(task: SprayTaskView) {
  try {
    await ElMessageBox.confirm(`确认删除喷淋任务「${task.name}」？`, '删除确认', {
      type: 'warning',
      confirmButtonText: '删除',
      cancelButtonText: '取消'
    })
  } catch {
    return
  }
  await deleteSprayTask(task.id)
  ElMessage.success('喷淋任务已删除')
  await loadTasks()
}

function changePage(nextPage: number) {
  page.value = Math.min(Math.max(1, nextPage), totalPages.value)
  loadTasks()
}

onMounted(async () => {
  await Promise.all([loadSprayDevices(), loadTasks()])
})
</script>

<template>
  <main class="equipment-page">
    <AppTopbar />
    <section class="equipment-content environment-record-content">
      <div class="records-stack">
        <div class="equipment-breadcrumb">施工环境 &gt; 喷淋任务</div>

        <section class="equipment-panel equipment-filter task-filter">
          <label>
            <span>计划名称</span>
            <input v-model="filters.name" placeholder="请输入计划名称" />
          </label>
          <label>
            <span>启用状态</span>
            <select v-model="filters.enabled">
              <option value="">请选择启停状态</option>
              <option value="1">启动</option>
              <option value="0">停止</option>
            </select>
          </label>
          <div class="equipment-actions">
            <button class="primary-btn" type="button" @click="loadTasks(true)">
              <el-icon><Search /></el-icon>
              搜索
            </button>
            <button class="plain-btn" type="button" @click="resetFilters">
              <el-icon><Refresh /></el-icon>
              重置
            </button>
          </div>
          <button class="add-btn" type="button" @click="openCreateDialog">
            <el-icon><Plus /></el-icon>
            新增
          </button>
        </section>

        <section class="equipment-panel env-table-panel">
          <div class="record-table-body">
            <table class="equipment-table" :aria-busy="loading">
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
                <tr v-for="(task, index) in sprayTasks" :key="task.id">
                  <td>{{ (page - 1) * pageSize + index + 1 }}</td>
                  <td>{{ task.name }}</td>
                  <td class="time-cell" :title="formatDateTime(task.startTime)">
                    {{ formatDateTime(task.startTime) }}
                  </td>
                  <td>{{ task.durationMinutes ?? task.duration ?? '-' }}</td>
                  <td>{{ task.cycleValue ?? task.cycle ?? '-' }}</td>
                  <td>{{ task.cycleUnit ?? task.unit ?? '-' }}</td>
                  <td>
                    <span class="status-pill" :class="envStatusClass(statusText(task))">{{ statusText(task) }}</span>
                  </td>
                  <td class="time-cell" :title="formatDateTime(task.nextRunAt ?? task.nextTime)">
                    {{ formatDateTime(task.nextRunAt ?? task.nextTime) }}
                  </td>
                  <td class="action-cell">
                    <button class="link-btn" type="button" @click="openEditDialog(task)">
                      <el-icon><Edit /></el-icon>
                      修改
                    </button>
                    <button class="link-btn danger-link" type="button" @click="removeTask(task)">
                      <el-icon><Delete /></el-icon>
                      删除
                    </button>
                  </td>
                </tr>
                <tr v-if="!sprayTasks.length">
                  <td colspan="9">暂无喷淋任务</td>
                </tr>
              </tbody>
            </table>
          </div>
          <footer class="equipment-pagination">
            <span class="count">共{{ totalRecords }}条　{{ pageSize }}条/页</span>
            <button type="button" @click="changePage(page - 1)">‹</button>
            <button class="active" type="button">{{ page }}</button>
            <button type="button" @click="changePage(page + 1)">›</button>
          </footer>
        </section>

        <el-dialog v-model="dialogVisible" :title="editingId ? '修改喷淋任务' : '新增喷淋任务'" width="760px" destroy-on-close>
          <form class="management-dialog-form" @submit.prevent="saveTask">
            <label>
              <span>计划名称</span>
              <input v-model="taskForm.name" placeholder="请输入计划名称" />
            </label>
            <label>
              <span>喷淋设备</span>
              <select v-model.number="taskForm.sprayDeviceId">
                <option :value="null">请选择喷淋设备</option>
                <option v-for="device in sprayDevices" :key="device.id" :value="device.id">
                  {{ device.name }}（{{ device.code }}）
                </option>
              </select>
            </label>
            <label>
              <span>启动时间</span>
              <input v-model="taskForm.startTime" type="datetime-local" />
            </label>
            <label>
              <span>喷淋时长(分钟)</span>
              <input v-model.number="taskForm.durationMinutes" type="number" min="1" />
            </label>
            <label>
              <span>执行周期</span>
              <input v-model.number="taskForm.cycleValue" type="number" min="1" />
            </label>
            <label>
              <span>执行周期单位</span>
              <select v-model="taskForm.cycleUnit">
                <option value="MINUTES">MINUTES</option>
                <option value="HOURS">HOURS</option>
                <option value="DAYS">DAYS</option>
                <option value="WEEKS">WEEKS</option>
                <option value="MONTHS">MONTHS</option>
              </select>
            </label>
            <label>
              <span>启停状态</span>
              <select v-model.number="taskForm.enabled">
                <option :value="1">启动</option>
                <option :value="0">停止</option>
              </select>
            </label>
            <label>
              <span>下次执行时间</span>
              <input v-model="taskForm.nextRunAt" type="datetime-local" />
            </label>
          </form>
          <template #footer>
            <button class="plain-btn" type="button" @click="dialogVisible = false">取消</button>
            <button class="primary-btn" type="button" :disabled="saving" @click="saveTask">保存</button>
          </template>
        </el-dialog>
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
  overflow: hidden;
}

.record-table-body {
  min-height: 0;
  overflow: auto;
}

.record-table-body .equipment-table {
  min-width: 1340px;
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
  min-width: 0;
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

@media (max-width: 920px) {
  .add-btn {
    margin-left: 0;
  }
}
</style>
