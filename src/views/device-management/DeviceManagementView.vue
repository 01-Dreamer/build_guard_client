<script setup lang="ts">
import { onMounted, reactive, ref } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Delete, Edit, Plus } from '@element-plus/icons-vue'
import {
  createDevice,
  deleteDevice,
  listDeviceLocations,
  listDevices,
  listDeviceTypes,
  updateDevice,
  updateDeviceEnabled,
  type DeviceLocationView,
  type DevicePayload,
  type DeviceTypeView,
  type DeviceView
} from '../../api/devices'
import AppTopbar from '../../components/AppTopbar.vue'
import ManagementTree from './ManagementTree.vue'
import { type ManagedDevice, type TreeItem } from './data'

interface ManagedDeviceRow extends ManagedDevice {
  typeId?: number | null
  locationId?: number | null
  model?: string | null
  manufacturer?: string | null
  installDate?: string | null
  onlineStatus?: number | null
}

const deviceTree = ref<TreeItem[]>([])
const managedDevices = ref<ManagedDeviceRow[]>([])
const deviceTypes = ref<DeviceTypeView[]>([])
const deviceLocations = ref<DeviceLocationView[]>([])
const loading = ref(false)
const saving = ref(false)
const activeTypeId = ref<number | null>(null)
const deviceDialogVisible = ref(false)
const editingId = ref<number | null>(null)
const deviceForm = reactive<DevicePayload>({
  name: '',
  code: '',
  typeId: null,
  locationId: null,
  model: '',
  manufacturer: '',
  installDate: '',
  onlineStatus: 0,
  enabled: 1,
  x: null,
  y: null
})

function toManagedDevice(device: DeviceView, index: number): ManagedDeviceRow {
  return {
    id: device.id,
    name: device.name,
    code: device.code,
    location: device.locationName || '-',
    type: device.typeName || '-',
    order: index + 1,
    status: device.onlineStatus === 1 ? '在线' : '离线',
    enabled: device.enabled !== 0,
    typeId: device.typeId,
    locationId: device.locationId,
    model: device.model,
    manufacturer: device.manufacturer,
    installDate: device.installDate,
    onlineStatus: device.onlineStatus
  }
}

function toTreeItems(types: DeviceTypeView[], activeId: number | null) {
  const childrenByParent = new Map<number | null, DeviceTypeView[]>()

  types.forEach((item) => {
    const parentId = item.parentId ?? null
    childrenByParent.set(parentId, [...(childrenByParent.get(parentId) || []), item])
  })

  const roots = childrenByParent.get(null) || types.filter((item) => !types.some((other) => other.id === item.parentId))
  let activeSet = false

  return roots.map<TreeItem>((root) => {
    const children = childrenByParent.get(root.id) || []

    return {
      id: root.id,
      label: root.name,
      active: root.id === activeId || (!activeId && !children.length && !activeSet ? (activeSet = true) : false),
      children: children.map((child) => {
        const active = child.id === activeId || (!activeId && !activeSet)
        if (active) activeSet = true
        return {
          id: child.id,
          label: child.name,
          active
        }
      })
    }
  })
}

async function loadDevices() {
  loading.value = true

  try {
    const [deviceResult, typeResult, locationResult] = await Promise.all([
      listDevices({ page: 1, pageSize: 100 }),
      listDeviceTypes(),
      listDeviceLocations()
    ])

    deviceTypes.value = typeResult
    deviceLocations.value = locationResult
    const filtered = activeTypeId.value
      ? deviceResult.records.filter((device) => device.typeId === activeTypeId.value)
      : deviceResult.records
    managedDevices.value = filtered.map(toManagedDevice)
    if (typeResult.length) {
      deviceTree.value = toTreeItems(typeResult, activeTypeId.value)
    }
  } catch {
    deviceTree.value = []
    managedDevices.value = []
  } finally {
    loading.value = false
  }
}

function selectType(item: TreeItem) {
  activeTypeId.value = item.id ?? null
  deviceTree.value = toTreeItems(deviceTypes.value, activeTypeId.value)
  loadDevices()
}

function resetDeviceForm() {
  editingId.value = null
  deviceForm.name = ''
  deviceForm.code = ''
  deviceForm.typeId = activeTypeId.value || deviceTypes.value.find((type) => type.parentId)?.id || deviceTypes.value[0]?.id || null
  deviceForm.locationId = deviceLocations.value[0]?.id || null
  deviceForm.model = ''
  deviceForm.manufacturer = ''
  deviceForm.installDate = ''
  deviceForm.onlineStatus = 0
  deviceForm.enabled = 1
  deviceForm.x = null
  deviceForm.y = null
}

function openCreateDialog() {
  resetDeviceForm()
  deviceDialogVisible.value = true
}

function openEditDialog(device: ManagedDeviceRow) {
  editingId.value = device.id
  deviceForm.name = device.name
  deviceForm.code = device.code
  deviceForm.typeId = device.typeId ?? null
  deviceForm.locationId = device.locationId ?? null
  deviceForm.model = device.model || ''
  deviceForm.manufacturer = device.manufacturer || ''
  deviceForm.installDate = device.installDate || ''
  deviceForm.onlineStatus = device.onlineStatus ?? 0
  deviceForm.enabled = device.enabled ? 1 : 0
  deviceForm.x = null
  deviceForm.y = null
  deviceDialogVisible.value = true
}

function payload(): DevicePayload {
  return {
    name: deviceForm.name.trim(),
    code: deviceForm.code.trim(),
    typeId: deviceForm.typeId || null,
    locationId: deviceForm.locationId || null,
    model: deviceForm.model?.trim(),
    manufacturer: deviceForm.manufacturer?.trim(),
    installDate: deviceForm.installDate || undefined,
    onlineStatus: Number(deviceForm.onlineStatus ?? 0),
    enabled: Number(deviceForm.enabled ?? 1),
    x: deviceForm.x ?? null,
    y: deviceForm.y ?? null
  }
}

async function saveDevice() {
  const data = payload()
  if (!data.name || !data.code) {
    ElMessage.warning('请输入设备名称和设备编号')
    return
  }
  saving.value = true
  try {
    if (editingId.value) {
      await updateDevice(editingId.value, data)
      ElMessage.success('设备已更新')
    } else {
      await createDevice(data)
      ElMessage.success('设备已新增')
    }
    deviceDialogVisible.value = false
    await loadDevices()
  } finally {
    saving.value = false
  }
}

async function toggleEnabled(device: ManagedDeviceRow) {
  const nextEnabled = device.enabled ? 0 : 1
  await updateDeviceEnabled(device.id, nextEnabled)
  device.enabled = nextEnabled === 1
  ElMessage.success(device.enabled ? '设备已启用' : '设备已禁用')
}

async function removeDevice(device: ManagedDeviceRow) {
  try {
    await ElMessageBox.confirm(`确认删除设备「${device.name}」？`, '删除确认', {
      type: 'warning',
      confirmButtonText: '删除',
      cancelButtonText: '取消'
    })
  } catch {
    return
  }
  await deleteDevice(device.id)
  ElMessage.success('设备已删除')
  await loadDevices()
}

onMounted(loadDevices)
</script>

<template>
  <main class="equipment-page">
    <AppTopbar />
    <section class="equipment-content">
      <div class="equipment-stack">
        <div class="equipment-breadcrumb">设备管理 &gt; 设备管理</div>
        <section class="management-layout">
          <ManagementTree title="" :items="deviceTree" @select="selectType" />

          <section class="management-main device-table-panel">
            <div class="management-actions">
              <button class="primary-btn" type="button" @click="openCreateDialog">
                <el-icon><Plus /></el-icon>
                新增
              </button>
            </div>

            <table class="equipment-table" :aria-busy="loading">
              <colgroup>
                <col class="col-id" />
                <col />
                <col />
                <col />
                <col />
                <col class="col-sort" />
                <col class="col-status" />
                <col class="col-switch" />
                <col class="col-actions" />
              </colgroup>
              <thead>
                <tr>
                  <th>序号</th>
                  <th>设备名称</th>
                  <th>设备编号</th>
                  <th>设备位置</th>
                  <th>设备类型</th>
                  <th>排序</th>
                  <th>状态</th>
                  <th>启用/禁用</th>
                  <th>操作</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="device in managedDevices" :key="device.id">
                  <td>{{ device.id }}</td>
                  <td>
                    <button class="link-btn" type="button">{{ device.name }}</button>
                  </td>
                  <td>{{ device.code }}</td>
                  <td>{{ device.location }}</td>
                  <td>{{ device.type }}</td>
                  <td>{{ device.order }}</td>
                  <td>
                    <span class="status-text">{{ device.status }}</span>
                  </td>
                  <td>
                    <button
                      class="switch-pill"
                      :class="{ disabled: !device.enabled }"
                      type="button"
                      :aria-label="device.enabled ? '禁用设备' : '启用设备'"
                      @click="toggleEnabled(device)"
                    />
                  </td>
                  <td>
                    <div class="device-link-group">
                      <button class="link-btn" type="button">对接配置</button>
                      <button class="link-btn" type="button" @click="openEditDialog(device)">
                        <el-icon><Edit /></el-icon>
                        编辑
                      </button>
                      <button class="link-btn danger-link" type="button" @click="removeDevice(device)">
                        <el-icon><Delete /></el-icon>
                        删除
                      </button>
                    </div>
                  </td>
                </tr>
                <tr v-if="!managedDevices.length">
                  <td colspan="9">暂无设备数据</td>
                </tr>
              </tbody>
            </table>

            <el-dialog v-model="deviceDialogVisible" :title="editingId ? '编辑设备' : '新增设备'" width="720px" destroy-on-close>
              <form class="management-dialog-form" @submit.prevent="saveDevice">
                <label>
                  <span>设备名称</span>
                  <input v-model="deviceForm.name" placeholder="请输入设备名称" />
                </label>
                <label>
                  <span>设备编号</span>
                  <input v-model="deviceForm.code" placeholder="请输入设备编号" />
                </label>
                <label>
                  <span>设备类型</span>
                  <select v-model.number="deviceForm.typeId">
                    <option :value="null">请选择设备类型</option>
                    <option v-for="type in deviceTypes" :key="type.id" :value="type.id">{{ type.name }}</option>
                  </select>
                </label>
                <label>
                  <span>设备位置</span>
                  <select v-model.number="deviceForm.locationId">
                    <option :value="null">请选择设备位置</option>
                    <option v-for="location in deviceLocations" :key="location.id" :value="location.id">
                      {{ location.name }}
                    </option>
                  </select>
                </label>
                <label>
                  <span>型号</span>
                  <input v-model="deviceForm.model" placeholder="请输入型号" />
                </label>
                <label>
                  <span>厂家</span>
                  <input v-model="deviceForm.manufacturer" placeholder="请输入厂家" />
                </label>
                <label>
                  <span>安装日期</span>
                  <input v-model="deviceForm.installDate" type="date" />
                </label>
                <label>
                  <span>启用状态</span>
                  <select v-model.number="deviceForm.enabled">
                    <option :value="1">启用</option>
                    <option :value="0">禁用</option>
                  </select>
                </label>
              </form>
              <template #footer>
                <button class="plain-btn" type="button" @click="deviceDialogVisible = false">取消</button>
                <button class="primary-btn" type="button" :disabled="saving" @click="saveDevice">保存</button>
              </template>
            </el-dialog>
          </section>
        </section>
      </div>
    </section>
  </main>
</template>

<style scoped>
.col-id {
  width: 70px;
}

.col-sort,
.col-status,
.col-switch {
  width: 110px;
}

.col-actions {
  width: 250px;
}

.device-table-panel {
  display: grid;
  grid-template-rows: auto minmax(0, 1fr);
  overflow: auto;
}

.device-table-panel .equipment-table {
  min-width: 1080px;
}

.device-table-panel .equipment-table th,
.device-table-panel .equipment-table td {
  height: 44px;
  padding: 8px 12px;
}

.status-text {
  color: #16a34a;
  font-weight: 900;
}

.switch-pill.disabled {
  background: #94a3b8;
}

.switch-pill.disabled::after {
  left: 3px;
  right: auto;
}

.device-link-group {
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
