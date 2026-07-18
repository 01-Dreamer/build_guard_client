<script setup lang="ts">
import { onMounted, reactive, ref } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Delete, Plus } from '@element-plus/icons-vue'
import {
  createDeviceType,
  deleteDeviceType,
  listDeviceTypes,
  updateDeviceType,
  type DeviceTypePayload,
  type DeviceTypeView
} from '../../api/devices'
import AppTopbar from '../../components/AppTopbar.vue'
import ManagementTree from './ManagementTree.vue'
import { type TreeItem } from './data'

interface TypeForm extends DeviceTypePayload {
  parentCode: string
  parentName: string
}

const emptyTypeForm: TypeForm = {
  parentId: null,
  parentCode: '',
  parentName: '',
  code: '',
  name: '',
  sort: 99,
  status: 1
}

const typeTree = ref<TreeItem[]>([])
const typeRows = ref<DeviceTypeView[]>([])
const activeTypeId = ref<number | null>(null)
const typeForm = reactive<TypeForm>({ ...emptyTypeForm })
const saving = ref(false)

function buildTypeTree(types: DeviceTypeView[], activeId: number | null) {
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

function findActiveType(types: DeviceTypeView[]) {
  return types.find((item) => item.parentId !== null && item.parentId !== undefined) || types[0]
}

function fillForm(type?: DeviceTypeView) {
  if (!type) {
    Object.assign(typeForm, emptyTypeForm)
    return
  }
  const parentType = typeRows.value.find((item) => item.id === type.parentId)
  typeForm.parentId = type.parentId ?? null
  typeForm.parentCode = parentType?.code || ''
  typeForm.parentName = parentType?.name || ''
  typeForm.code = type.code
  typeForm.name = type.name
  typeForm.sort = type.sort ?? 99
  typeForm.status = type.status ?? 1
}

async function loadTypes() {
  try {
    const types = await listDeviceTypes()
    typeRows.value = types
    if (!types.length) return

    const activeType = activeTypeId.value
      ? types.find((item) => item.id === activeTypeId.value) || findActiveType(types)
      : findActiveType(types)
    activeTypeId.value = activeType.id
    typeTree.value = buildTypeTree(types, activeType.id)
    fillForm(activeType)
  } catch {
    typeTree.value = []
    typeRows.value = []
    fillForm()
  }
}

function selectType(item: TreeItem) {
  activeTypeId.value = item.id ?? null
  typeTree.value = buildTypeTree(typeRows.value, activeTypeId.value)
  fillForm(typeRows.value.find((type) => type.id === activeTypeId.value))
}

function createNewType() {
  activeTypeId.value = null
  typeTree.value = buildTypeTree(typeRows.value, null)
  fillForm()
}

function payload(): DeviceTypePayload {
  return {
    parentId: typeForm.parentId || null,
    code: typeForm.code.trim(),
    name: typeForm.name.trim(),
    sort: Number(typeForm.sort || 99),
    status: Number(typeForm.status ?? 1)
  }
}

async function saveType() {
  const data = payload()
  if (!data.code || !data.name) {
    ElMessage.warning('请输入类型编号和类型名称')
    return
  }
  saving.value = true
  try {
    if (activeTypeId.value) {
      await updateDeviceType(activeTypeId.value, data)
      ElMessage.success('设备类型已更新')
    } else {
      const result = await createDeviceType(data)
      activeTypeId.value = result.id
      ElMessage.success('设备类型已新增')
    }
    await loadTypes()
  } finally {
    saving.value = false
  }
}

async function removeType() {
  if (!activeTypeId.value) {
    ElMessage.warning('请选择要删除的设备类型')
    return
  }
  try {
    await ElMessageBox.confirm('确认删除当前设备类型？', '删除确认', {
      type: 'warning',
      confirmButtonText: '删除',
      cancelButtonText: '取消'
    })
  } catch {
    return
  }
  await deleteDeviceType(activeTypeId.value)
  ElMessage.success('设备类型已删除')
  activeTypeId.value = null
  await loadTypes()
}

onMounted(loadTypes)
</script>

<template>
  <main class="equipment-page">
    <AppTopbar />
    <section class="equipment-content">
      <div class="equipment-stack">
        <div class="equipment-breadcrumb">设备管理 &gt; 设备类型管理</div>
        <section class="management-layout">
          <ManagementTree title="类型信息" :items="typeTree" @select="selectType" />

          <section class="management-main">
            <div class="management-actions">
              <button class="primary-btn" type="button" @click="createNewType">
                <el-icon><Plus /></el-icon>
                新增
              </button>
              <button class="danger-btn" type="button" @click="removeType">
                <el-icon><Delete /></el-icon>
                删除
              </button>
            </div>

            <section class="form-card">
              <h2>基本信息</h2>
              <form class="management-form">
                <label>
                  <span>上级类型编号</span>
                  <input v-model="typeForm.parentCode" readonly />
                </label>
                <label>
                  <span>上级类型名称</span>
                  <input v-model="typeForm.parentName" readonly />
                </label>
                <label class="required">
                  <span>类型编号</span>
                  <input v-model="typeForm.code" />
                </label>
                <label class="required">
                  <span>类型名称</span>
                  <input v-model="typeForm.name" />
                </label>
                <label class="required">
                  <span>排序</span>
                  <input v-model.number="typeForm.sort" type="number" />
                </label>
                <div class="form-save-row">
                  <button class="primary-btn" type="button" :disabled="saving" @click="saveType">保存</button>
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
