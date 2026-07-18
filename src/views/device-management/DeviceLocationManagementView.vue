<script setup lang="ts">
import { onMounted, reactive, ref } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Delete, Plus } from '@element-plus/icons-vue'
import {
  createDeviceLocation,
  deleteDeviceLocation,
  listDeviceLocations,
  updateDeviceLocation,
  type DeviceLocationPayload,
  type DeviceLocationView
} from '../../api/devices'
import AppTopbar from '../../components/AppTopbar.vue'
import ManagementTree from './ManagementTree.vue'
import { type TreeItem } from './data'

interface LocationForm extends DeviceLocationPayload {
  parentCode: string
  parentName: string
}

const emptyLocationForm: LocationForm = {
  areaId: null,
  parentCode: '',
  parentName: '',
  code: '',
  name: '',
  sort: 99,
  status: 1
}

const locationTree = ref<TreeItem[]>([])
const locationRows = ref<DeviceLocationView[]>([])
const activeLocationId = ref<number | null>(null)
const locationForm = reactive<LocationForm>({ ...emptyLocationForm })
const saving = ref(false)

function toLocationTree(locations: DeviceLocationView[], activeId: number | null) {
  return locations.map<TreeItem>((location, index) => ({
    id: location.id,
    label: location.name,
    active: activeId ? location.id === activeId : index === 0
  }))
}

function fillForm(location?: DeviceLocationView) {
  if (!location) {
    Object.assign(locationForm, emptyLocationForm)
    return
  }
  locationForm.areaId = location.areaId ?? null
  locationForm.parentCode = ''
  locationForm.parentName = ''
  locationForm.code = location.code
  locationForm.name = location.name
  locationForm.sort = location.sort ?? 99
  locationForm.status = location.status ?? 1
}

async function loadLocations() {
  try {
    const locations = await listDeviceLocations()
    locationRows.value = locations
    if (!locations.length) return

    const activeLocation = activeLocationId.value
      ? locations.find((item) => item.id === activeLocationId.value) || locations[0]
      : locations[0]
    activeLocationId.value = activeLocation.id
    locationTree.value = toLocationTree(locations, activeLocation.id)
    fillForm(activeLocation)
  } catch {
    locationTree.value = []
    locationRows.value = []
    fillForm()
  }
}

function selectLocation(item: TreeItem) {
  activeLocationId.value = item.id ?? null
  locationTree.value = toLocationTree(locationRows.value, activeLocationId.value)
  fillForm(locationRows.value.find((location) => location.id === activeLocationId.value))
}

function createNewLocation() {
  activeLocationId.value = null
  locationTree.value = toLocationTree(locationRows.value, null)
  fillForm()
}

function payload(): DeviceLocationPayload {
  return {
    areaId: locationForm.areaId || null,
    code: locationForm.code.trim(),
    name: locationForm.name.trim(),
    sort: Number(locationForm.sort || 99),
    status: Number(locationForm.status ?? 1)
  }
}

async function saveLocation() {
  const data = payload()
  if (!data.code || !data.name) {
    ElMessage.warning('请输入位置编号和位置名称')
    return
  }
  saving.value = true
  try {
    if (activeLocationId.value) {
      await updateDeviceLocation(activeLocationId.value, data)
      ElMessage.success('设备位置已更新')
    } else {
      const result = await createDeviceLocation(data)
      activeLocationId.value = result.id
      ElMessage.success('设备位置已新增')
    }
    await loadLocations()
  } finally {
    saving.value = false
  }
}

async function removeLocation() {
  if (!activeLocationId.value) {
    ElMessage.warning('请选择要删除的设备位置')
    return
  }
  try {
    await ElMessageBox.confirm('确认删除当前设备位置？', '删除确认', {
      type: 'warning',
      confirmButtonText: '删除',
      cancelButtonText: '取消'
    })
  } catch {
    return
  }
  await deleteDeviceLocation(activeLocationId.value)
  ElMessage.success('设备位置已删除')
  activeLocationId.value = null
  await loadLocations()
}

onMounted(loadLocations)
</script>

<template>
  <main class="equipment-page">
    <AppTopbar />
    <section class="equipment-content">
      <div class="equipment-stack">
        <div class="equipment-breadcrumb">设备管理 &gt; 设备位置管理</div>
        <section class="management-layout">
          <ManagementTree title="位置信息" :items="locationTree" @select="selectLocation" />

          <section class="management-main">
            <div class="management-actions">
              <button class="primary-btn" type="button" @click="createNewLocation">
                <el-icon><Plus /></el-icon>
                新增
              </button>
              <button class="danger-btn" type="button" @click="removeLocation">
                <el-icon><Delete /></el-icon>
                删除
              </button>
            </div>

            <section class="form-card">
              <h2>基本信息</h2>
              <form class="management-form">
                <label>
                  <span>上级位置编号</span>
                  <input v-model="locationForm.parentCode" readonly />
                </label>
                <label>
                  <span>上级位置名称</span>
                  <input v-model="locationForm.parentName" readonly />
                </label>
                <label class="required">
                  <span>位置编号</span>
                  <input v-model="locationForm.code" />
                </label>
                <label class="required">
                  <span>位置名称</span>
                  <input v-model="locationForm.name" />
                </label>
                <label class="required">
                  <span>排序</span>
                  <input v-model.number="locationForm.sort" type="number" />
                </label>
                <div class="form-save-row">
                  <button class="primary-btn" type="button" :disabled="saving" @click="saveLocation">保存</button>
                </div>
              </form>
            </section>
          </section>
        </section>
      </div>
    </section>
  </main>
</template>

<style scoped>
.management-main {
  overflow: auto;
}

.form-card {
  max-width: 820px;
}

.management-form {
  gap: 16px 18px;
}

.management-form input {
  min-width: 0;
}

@media (max-width: 760px) {
  .management-form {
    grid-template-columns: 1fr;
  }
}
</style>
