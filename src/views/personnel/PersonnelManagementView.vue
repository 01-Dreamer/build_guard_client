<script setup lang="ts">
import { onMounted, reactive, ref } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Delete, Edit, Plus, Refresh, Search } from '@element-plus/icons-vue'
import {
  createPersonnel,
  deletePersonnel,
  listPersonnel,
  updatePersonnel,
  type PersonnelPayload,
  type PersonnelView
} from '../../api/personnel'
import AppTopbar from '../../components/AppTopbar.vue'

interface Personnel {
  id: number
  name: string
  phone: string
  email: string
  avatar: string
  tone: string
  jobTitle: string
  teamName: string
  status: number
}

const tonePalette = ['#3f6fed', '#22c55e', '#f59e0b', '#a855f7', '#06b6d4', '#ef4444', '#14b8a6', '#64748b']
const personnelList = ref<Personnel[]>([])
const searchName = ref('')
const loading = ref(false)
const submitting = ref(false)
const personnelDialogVisible = ref(false)
const editingId = ref<number | null>(null)
const personnelForm = reactive<PersonnelPayload>({
  name: '',
  phone: '',
  email: '',
  jobTitle: '',
  teamName: '',
  status: 1
})

function toPersonnel(row: PersonnelView, index: number): Personnel {
  const name = row.name || '未命名'

  return {
    id: row.id,
    name,
    phone: row.phone || '-',
    email: row.email || '-',
    avatar: name.slice(0, 1),
    tone: tonePalette[index % tonePalette.length],
    jobTitle: row.jobTitle || '',
    teamName: row.teamName || '',
    status: row.status ?? 1
  }
}

async function loadPersonnel() {
  loading.value = true

  try {
    const result = await listPersonnel({
      name: searchName.value.trim(),
      page: 1,
      pageSize: 100
    })
    personnelList.value = result.records.map(toPersonnel)
  } catch {
    personnelList.value = []
  } finally {
    loading.value = false
  }
}

function resetSearch() {
  searchName.value = ''
  loadPersonnel()
}

function resetForm() {
  editingId.value = null
  personnelForm.name = ''
  personnelForm.phone = ''
  personnelForm.email = ''
  personnelForm.jobTitle = ''
  personnelForm.teamName = ''
  personnelForm.status = 1
}

function openCreateDialog() {
  resetForm()
  personnelDialogVisible.value = true
}

function openEditDialog(person: Personnel) {
  editingId.value = person.id
  personnelForm.name = person.name
  personnelForm.phone = person.phone === '-' ? '' : person.phone
  personnelForm.email = person.email === '-' ? '' : person.email
  personnelForm.jobTitle = person.jobTitle
  personnelForm.teamName = person.teamName
  personnelForm.status = person.status
  personnelDialogVisible.value = true
}

function normalizedPayload() {
  return {
    name: personnelForm.name.trim(),
    phone: personnelForm.phone?.trim(),
    email: personnelForm.email?.trim(),
    jobTitle: personnelForm.jobTitle?.trim(),
    teamName: personnelForm.teamName?.trim(),
    status: Number(personnelForm.status ?? 1)
  }
}

async function submitPersonnel() {
  const payload = normalizedPayload()
  if (!payload.name) {
    ElMessage.warning('请输入姓名')
    return
  }

  submitting.value = true
  try {
    if (editingId.value) {
      await updatePersonnel(editingId.value, payload)
      ElMessage.success('人员信息已更新')
    } else {
      await createPersonnel(payload)
      ElMessage.success('人员已新增')
    }
    personnelDialogVisible.value = false
    await loadPersonnel()
  } finally {
    submitting.value = false
  }
}

async function removePersonnel(person: Personnel) {
  await ElMessageBox.confirm(`确认删除人员「${person.name}」？`, '删除确认', {
    type: 'warning',
    confirmButtonText: '删除',
    cancelButtonText: '取消'
  })
  await deletePersonnel(person.id)
  ElMessage.success('人员已删除')
  await loadPersonnel()
}

onMounted(loadPersonnel)
</script>

<template>
  <main class="equipment-page">
    <AppTopbar />
    <section class="equipment-content">
      <div class="personnel-stack">
        <div class="equipment-breadcrumb">人员管理 &gt; 人员信息</div>

        <section class="equipment-panel personnel-filter">
          <label>
            <span>姓名</span>
            <input v-model="searchName" placeholder="请输入姓名" @keyup.enter="loadPersonnel" />
          </label>
          <div class="equipment-actions">
            <button class="primary-btn" type="button" :disabled="loading" @click="loadPersonnel">
              <el-icon><Search /></el-icon>
              搜索
            </button>
            <button class="plain-btn" type="button" :disabled="loading" @click="resetSearch">
              <el-icon><Refresh /></el-icon>
              重置
            </button>
          </div>
          <span class="filter-spacer"></span>
          <button class="primary-btn" type="button" @click="openCreateDialog">
            <el-icon><Plus /></el-icon>
            新增
          </button>
        </section>

        <section class="equipment-panel personnel-table-card">
          <table class="equipment-table personnel-table">
            <colgroup>
              <col class="col-id" />
              <col />
              <col />
              <col />
              <col class="col-avatar" />
              <col class="col-actions" />
            </colgroup>
            <thead>
              <tr>
                <th>序号</th>
                <th>姓名</th>
                <th>电话</th>
                <th>邮箱</th>
                <th>头像</th>
                <th>操作</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="person in personnelList" :key="person.id">
                <td>{{ person.id }}</td>
                <td>{{ person.name }}</td>
                <td>{{ person.phone }}</td>
                <td :title="person.email">{{ person.email }}</td>
                <td>
                  <span class="person-avatar" :style="{ background: person.tone }">
                    {{ person.avatar }}
                  </span>
                </td>
                <td>
                  <div class="personnel-actions">
                    <button class="link-btn" type="button" @click="openEditDialog(person)">
                      <el-icon><Edit /></el-icon>
                      编辑
                    </button>
                    <button class="link-btn danger-link" type="button" @click="removePersonnel(person)">
                      <el-icon><Delete /></el-icon>
                      删除
                    </button>
                  </div>
                </td>
              </tr>
              <tr v-if="!personnelList.length">
                <td colspan="6">暂无人员数据</td>
              </tr>
            </tbody>
          </table>
        </section>

        <el-dialog
          v-model="personnelDialogVisible"
          :title="editingId ? '编辑人员' : '新增人员'"
          width="540px"
          destroy-on-close
        >
          <form class="personnel-dialog-form" @submit.prevent="submitPersonnel">
            <label>
              <span>姓名</span>
              <input v-model="personnelForm.name" placeholder="请输入姓名" />
            </label>
            <label>
              <span>电话</span>
              <input v-model="personnelForm.phone" placeholder="请输入电话" />
            </label>
            <label>
              <span>邮箱</span>
              <input v-model="personnelForm.email" placeholder="请输入邮箱" />
            </label>
            <label>
              <span>岗位</span>
              <input v-model="personnelForm.jobTitle" placeholder="请输入岗位" />
            </label>
            <label>
              <span>班组</span>
              <input v-model="personnelForm.teamName" placeholder="请输入班组" />
            </label>
            <label>
              <span>状态</span>
              <select v-model.number="personnelForm.status">
                <option :value="1">正常</option>
                <option :value="0">停用</option>
              </select>
            </label>
          </form>
          <template #footer>
            <button class="plain-btn" type="button" @click="personnelDialogVisible = false">取消</button>
            <button class="primary-btn" type="button" :disabled="submitting" @click="submitPersonnel">保存</button>
          </template>
        </el-dialog>
      </div>
    </section>
  </main>
</template>

<style scoped>
@import './personnel.css';

.personnel-filter {
  flex-wrap: wrap;
  min-height: auto;
}

.personnel-filter label {
  flex: 0 1 300px;
}

.personnel-table-card {
  overflow: auto;
}

.personnel-table {
  min-width: 820px;
}

.personnel-table th,
.personnel-table td {
  height: 48px;
  padding: 8px 14px;
}

.personnel-table td {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.personnel-actions {
  flex-wrap: wrap;
  gap: 8px;
}

.personnel-dialog-form {
  gap: 12px 14px;
}

@media (max-width: 640px) {
  .personnel-dialog-form {
    grid-template-columns: 1fr;
  }
}
</style>
