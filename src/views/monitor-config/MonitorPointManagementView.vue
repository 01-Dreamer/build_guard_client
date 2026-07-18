<script setup lang="ts">
import { computed, onMounted, reactive, ref } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Delete, Edit, Plus, Search } from '@element-plus/icons-vue'
import { listDevices, type DeviceView } from '../../api/devices'
import {
  createMonitorPoint,
  deleteMonitorPoint,
  listMonitorPoints,
  updateMonitorPoint,
  type MonitorPointPayload,
  type MonitorPointView
} from '../../api/monitor'
import AppTopbar from '../../components/AppTopbar.vue'

const monitorPointRows = ref<MonitorPointView[]>([])
const devices = ref<DeviceView[]>([])
const filters = reactive({ type: '', name: '' })
const page = ref(1)
const pageSize = ref(10)
const total = ref(0)
const loading = ref(false)
const saving = ref(false)
const dialogVisible = ref(false)
const editingId = ref<number | null>(null)

const pointForm = reactive<MonitorPointPayload>({
  name: '',
  code: '',
  deviceId: null,
  metricCode: '',
  metricName: '',
  unit: '',
  sort: 99,
  status: 1,
  warnUpper: null,
  warnLower: null,
  alarmUpper: null,
  alarmLower: null,
  ruleEnabled: 1
})

const totalPages = computed(() => Math.max(1, Math.ceil(total.value / pageSize.value)))
const deviceTypeOptions = computed(() => {
  const names = new Set<string>()
  monitorPointRows.value.forEach((row) => {
    const name = row.deviceTypeName || row.typeName
    if (name) names.add(name)
  })
  return [...names]
})

function resetForm() {
  editingId.value = null
  pointForm.name = ''
  pointForm.code = ''
  pointForm.deviceId = devices.value[0]?.id ?? null
  pointForm.metricCode = ''
  pointForm.metricName = ''
  pointForm.unit = ''
  pointForm.sort = 99
  pointForm.status = 1
  pointForm.warnUpper = null
  pointForm.warnLower = null
  pointForm.alarmUpper = null
  pointForm.alarmLower = null
  pointForm.ruleEnabled = 1
}

function openCreateDialog() {
  resetForm()
  dialogVisible.value = true
}

function openEditDialog(row: MonitorPointView) {
  editingId.value = row.id
  pointForm.name = row.name || row.metricName || ''
  pointForm.code = row.code
  pointForm.deviceId = row.deviceId ?? null
  pointForm.metricCode = row.metricCode || row.code
  pointForm.metricName = row.metricName || row.name || ''
  pointForm.unit = row.unit || ''
  pointForm.sort = row.sort ?? 99
  pointForm.status = row.status ?? 1
  pointForm.warnUpper = row.warnUpper ?? null
  pointForm.warnLower = row.warnLower ?? null
  pointForm.alarmUpper = row.alarmUpper ?? null
  pointForm.alarmLower = row.alarmLower ?? null
  pointForm.ruleEnabled = row.ruleEnabled ?? 1
  dialogVisible.value = true
}

function payload(): MonitorPointPayload {
  return {
    name: pointForm.name.trim(),
    code: pointForm.code.trim(),
    deviceId: pointForm.deviceId || null,
    metricCode: pointForm.metricCode.trim(),
    metricName: pointForm.metricName.trim(),
    unit: pointForm.unit?.trim(),
    sort: Number(pointForm.sort ?? 99),
    status: Number(pointForm.status ?? 1),
    warnUpper: pointForm.warnUpper === '' ? null : pointForm.warnUpper,
    warnLower: pointForm.warnLower === '' ? null : pointForm.warnLower,
    alarmUpper: pointForm.alarmUpper === '' ? null : pointForm.alarmUpper,
    alarmLower: pointForm.alarmLower === '' ? null : pointForm.alarmLower,
    ruleEnabled: Number(pointForm.ruleEnabled ?? 1)
  }
}

async function loadDevices() {
  try {
    const result = await listDevices({ page: 1, pageSize: 100 })
    devices.value = result.records
  } catch {
    devices.value = []
  }
}

async function loadMonitorPoints(resetPage = false) {
  if (resetPage) page.value = 1
  loading.value = true
  try {
    const result = await listMonitorPoints({ ...filters, page: page.value, pageSize: pageSize.value })
    monitorPointRows.value = result.records
    total.value = result.total
  } catch {
    monitorPointRows.value = []
    total.value = 0
  } finally {
    loading.value = false
  }
}

async function savePoint() {
  const data = payload()
  if (!data.name || !data.code || !data.metricCode || !data.metricName) {
    ElMessage.warning('请填写监测点名称、编号、数据编码和指标名称')
    return
  }
  saving.value = true
  try {
    if (editingId.value) {
      await updateMonitorPoint(editingId.value, data)
      ElMessage.success('监测点已更新')
    } else {
      await createMonitorPoint(data)
      ElMessage.success('监测点已新增')
    }
    dialogVisible.value = false
    await loadMonitorPoints()
  } finally {
    saving.value = false
  }
}

async function removePoint(row: MonitorPointView) {
  try {
    await ElMessageBox.confirm(`确认删除监测点「${row.name || row.metricName}」？`, '删除确认', {
      type: 'warning',
      confirmButtonText: '删除',
      cancelButtonText: '取消'
    })
  } catch {
    return
  }
  await deleteMonitorPoint(row.id)
  ElMessage.success('监测点已删除')
  await loadMonitorPoints()
}

function changePage(nextPage: number) {
  page.value = Math.min(Math.max(1, nextPage), totalPages.value)
  loadMonitorPoints()
}

onMounted(async () => {
  await Promise.all([loadDevices(), loadMonitorPoints()])
})
</script>

<template>
  <main class="equipment-page">
    <AppTopbar />
    <section class="equipment-content">
      <div class="equipment-stack">
        <div class="equipment-breadcrumb">监测配置 &gt; 设备监测点管理</div>

        <section class="monitor-config-list-page">
          <section class="equipment-panel monitor-config-filter">
            <div class="filter-fields">
              <label>
                <span>监测点类型</span>
                <select v-model="filters.type">
                  <option value=""></option>
                  <option v-for="item in deviceTypeOptions" :key="item" :value="item">{{ item }}</option>
                </select>
              </label>
              <label>
                <span>监测点名称</span>
                <input v-model="filters.name" placeholder="请输入监测点名称" @keydown.enter="loadMonitorPoints(true)" />
              </label>
              <button class="primary-btn" type="button" @click="loadMonitorPoints(true)">
                <el-icon><Search /></el-icon>
                搜索
              </button>
            </div>

            <button class="primary-btn" type="button" @click="openCreateDialog">
              <el-icon><Plus /></el-icon>
              新增
            </button>
          </section>

          <section class="equipment-panel monitor-config-table-card">
            <div class="monitor-table-body">
              <table class="equipment-table" :aria-busy="loading">
                <colgroup>
                  <col class="point-id-col" />
                  <col />
                  <col />
                  <col class="point-name-col" />
                  <col />
                  <col class="point-unit-col" />
                  <col />
                  <col />
                  <col class="point-sort-col" />
                  <col class="point-action-col" />
                </colgroup>
                <thead>
                  <tr>
                    <th>序号</th>
                    <th>监测点类型</th>
                    <th>监测点编号</th>
                    <th>监测点名称</th>
                    <th>设备名称</th>
                    <th>单位</th>
                    <th>预警上限阈值</th>
                    <th>预警下限阈值</th>
                    <th>排序</th>
                    <th>操作</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="(row, index) in monitorPointRows" :key="row.id">
                    <td>{{ (page - 1) * pageSize + index + 1 }}</td>
                    <td>{{ row.deviceTypeName || row.typeName || '-' }}</td>
                    <td>{{ row.code }}</td>
                    <td>{{ row.name || row.metricName }}</td>
                    <td>{{ row.deviceName || '-' }}</td>
                    <td>{{ row.unit || '-' }}</td>
                    <td>{{ row.warnUpper ?? '-' }}</td>
                    <td>{{ row.warnLower ?? '-' }}</td>
                    <td>{{ row.sort ?? '-' }}</td>
                    <td>
                      <div class="monitor-action-links">
                        <button class="link-btn" type="button" @click="openEditDialog(row)">
                          <el-icon><Edit /></el-icon>
                          修改
                        </button>
                        <button class="link-btn danger-link" type="button" @click="removePoint(row)">
                          <el-icon><Delete /></el-icon>
                          删除
                        </button>
                      </div>
                    </td>
                  </tr>
                  <tr v-if="!monitorPointRows.length">
                    <td colspan="10">暂无监测点数据</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <div class="equipment-pagination monitor-pagination">
              <span>共{{ total }}条</span>
              <button type="button" aria-label="上一页" @click="changePage(page - 1)">‹</button>
              <button class="active" type="button">{{ page }}</button>
              <button type="button" aria-label="下一页" @click="changePage(page + 1)">›</button>
            </div>
          </section>
        </section>

        <el-dialog v-model="dialogVisible" :title="editingId ? '修改监测点' : '新增监测点'" width="760px" destroy-on-close>
          <form class="management-dialog-form" @submit.prevent="savePoint">
            <label>
              <span>监测点名称</span>
              <input v-model="pointForm.name" placeholder="请输入监测点名称" />
            </label>
            <label>
              <span>监测点编号</span>
              <input v-model="pointForm.code" placeholder="请输入监测点编号" />
            </label>
            <label>
              <span>关联设备</span>
              <select v-model.number="pointForm.deviceId">
                <option :value="null">请选择设备</option>
                <option v-for="device in devices" :key="device.id" :value="device.id">
                  {{ device.name }}（{{ device.code }}）
                </option>
              </select>
            </label>
            <label>
              <span>设备数据编码</span>
              <input v-model="pointForm.metricCode" placeholder="如 weight、pm25" />
            </label>
            <label>
              <span>指标名称</span>
              <input v-model="pointForm.metricName" placeholder="请输入指标名称" />
            </label>
            <label>
              <span>单位</span>
              <input v-model="pointForm.unit" placeholder="请输入单位" />
            </label>
            <label>
              <span>预警上限</span>
              <input v-model="pointForm.warnUpper" type="number" step="0.01" />
            </label>
            <label>
              <span>预警下限</span>
              <input v-model="pointForm.warnLower" type="number" step="0.01" />
            </label>
            <label>
              <span>报警上限</span>
              <input v-model="pointForm.alarmUpper" type="number" step="0.01" />
            </label>
            <label>
              <span>报警下限</span>
              <input v-model="pointForm.alarmLower" type="number" step="0.01" />
            </label>
            <label>
              <span>排序</span>
              <input v-model.number="pointForm.sort" type="number" />
            </label>
            <label>
              <span>启用状态</span>
              <select v-model.number="pointForm.ruleEnabled">
                <option :value="1">启用</option>
                <option :value="0">禁用</option>
              </select>
            </label>
          </form>
          <template #footer>
            <button class="plain-btn" type="button" @click="dialogVisible = false">取消</button>
            <button class="primary-btn" type="button" :disabled="saving" @click="savePoint">保存</button>
          </template>
        </el-dialog>
      </div>
    </section>
  </main>
</template>

<style scoped>
.monitor-config-filter {
  gap: 14px;
}

.filter-fields {
  flex-wrap: wrap;
}

.monitor-table-body {
  overflow: auto;
}

.monitor-table-body .equipment-table {
  min-width: 1180px;
}

.monitor-table-body .equipment-table th,
.monitor-table-body .equipment-table td {
  height: 40px;
  padding: 7px 12px;
}

.monitor-action-links {
  flex-wrap: wrap;
  gap: 8px;
}

.management-dialog-form {
  gap: 12px 14px;
}

@media (max-width: 760px) {
  .management-dialog-form {
    grid-template-columns: 1fr;
  }
}
</style>
