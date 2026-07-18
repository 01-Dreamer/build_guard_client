<script setup lang="ts">
import { onMounted, reactive, ref } from 'vue'
import { ElMessage } from 'element-plus'
import { Plus, Refresh, Search } from '@element-plus/icons-vue'
import {
  createViolation,
  listPersonnel,
  listViolations,
  type PersonnelView,
  type ViolationPayload,
  type ViolationView
} from '../../api/personnel'
import AppTopbar from '../../components/AppTopbar.vue'

interface ViolationRecord {
  id: number
  name: string
  item: string
  fine: string
  payment: '未支付' | '已支付'
}

const violationRecords = ref<ViolationRecord[]>([])
const personnelOptions = ref<PersonnelView[]>([])
const searchName = ref('')
const loading = ref(false)
const submitting = ref(false)
const violationDialogVisible = ref(false)
const violationForm = reactive<ViolationPayload>({
  personnelId: null,
  violationItem: '',
  fineAmount: 0,
  paymentStatus: 0,
  remark: ''
})

function paymentText(status?: number | null): ViolationRecord['payment'] {
  return status === 1 ? '已支付' : '未支付'
}

function fineText(amount?: number | string | null) {
  if (amount === undefined || amount === null || amount === '') return '0元'
  return `${Number(amount).toFixed(0)}元`
}

function toViolationRecord(row: ViolationView): ViolationRecord {
  return {
    id: row.id,
    name: row.personnelName || '-',
    item: row.violationItem || '-',
    fine: fineText(row.fineAmount),
    payment: paymentText(row.paymentStatus)
  }
}

async function loadViolations() {
  loading.value = true

  try {
    const result = await listViolations({
      name: searchName.value.trim(),
      page: 1,
      pageSize: 100
    })
    violationRecords.value = result.records.map(toViolationRecord)
  } catch {
    violationRecords.value = []
  } finally {
    loading.value = false
  }
}

async function loadPersonnelOptions() {
  const result = await listPersonnel({ page: 1, pageSize: 100 })
  personnelOptions.value = result.records
}

function resetSearch() {
  searchName.value = ''
  loadViolations()
}

function resetViolationForm() {
  violationForm.personnelId = personnelOptions.value[0]?.id ?? null
  violationForm.violationItem = ''
  violationForm.fineAmount = 0
  violationForm.paymentStatus = 0
  violationForm.remark = ''
}

function openCreateDialog() {
  resetViolationForm()
  violationDialogVisible.value = true
}

async function submitViolation() {
  if (!violationForm.personnelId) {
    ElMessage.warning('请选择人员')
    return
  }
  if (!violationForm.violationItem.trim()) {
    ElMessage.warning('请输入违规事项')
    return
  }

  submitting.value = true
  try {
    await createViolation({
      personnelId: violationForm.personnelId,
      violationItem: violationForm.violationItem.trim(),
      fineAmount: Number(violationForm.fineAmount || 0),
      paymentStatus: Number(violationForm.paymentStatus ?? 0),
      remark: violationForm.remark?.trim()
    })
    ElMessage.success('违规记录已新增')
    violationDialogVisible.value = false
    await loadViolations()
  } finally {
    submitting.value = false
  }
}

onMounted(async () => {
  await Promise.all([loadViolations(), loadPersonnelOptions()])
})
</script>

<template>
  <main class="equipment-page">
    <AppTopbar />
    <section class="equipment-content">
      <div class="personnel-stack">
        <div class="equipment-breadcrumb">人员管理 &gt; 违规处理</div>

        <section class="equipment-panel personnel-filter">
          <label>
            <span>姓名</span>
            <input v-model="searchName" placeholder="请输入姓名" @keyup.enter="loadViolations" />
          </label>
          <div class="equipment-actions">
            <button class="primary-btn" type="button" :disabled="loading" @click="loadViolations">
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
              <col class="col-status" />
            </colgroup>
            <thead>
              <tr>
                <th>序号</th>
                <th>姓名</th>
                <th>违规事项</th>
                <th>罚款金额</th>
                <th>支付结果</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="record in violationRecords" :key="record.id">
                <td>{{ record.id }}</td>
                <td>{{ record.name }}</td>
                <td :title="record.item">{{ record.item }}</td>
                <td>{{ record.fine }}</td>
                <td>
                  <span
                    class="status-pill"
                    :class="{
                      danger: record.payment === '未支付',
                      good: record.payment === '已支付'
                    }"
                  >
                    {{ record.payment }}
                  </span>
                </td>
              </tr>
              <tr v-if="!violationRecords.length">
                <td colspan="5">暂无违规处理数据</td>
              </tr>
            </tbody>
          </table>
        </section>

        <el-dialog v-model="violationDialogVisible" title="新增违规处理" width="540px" destroy-on-close>
          <form class="personnel-dialog-form" @submit.prevent="submitViolation">
            <label>
              <span>人员</span>
              <select v-model.number="violationForm.personnelId">
                <option :value="null">请选择人员</option>
                <option v-for="person in personnelOptions" :key="person.id" :value="person.id">
                  {{ person.name }}
                </option>
              </select>
            </label>
            <label>
              <span>违规事项</span>
              <input v-model="violationForm.violationItem" placeholder="请输入违规事项" />
            </label>
            <label>
              <span>罚款金额</span>
              <input v-model="violationForm.fineAmount" type="number" min="0" step="0.01" />
            </label>
            <label>
              <span>支付结果</span>
              <select v-model.number="violationForm.paymentStatus">
                <option :value="0">未支付</option>
                <option :value="1">已支付</option>
              </select>
            </label>
            <label class="wide-dialog-field">
              <span>备注</span>
              <input v-model="violationForm.remark" placeholder="请输入备注" />
            </label>
          </form>
          <template #footer>
            <button class="plain-btn" type="button" @click="violationDialogVisible = false">取消</button>
            <button class="primary-btn" type="button" :disabled="submitting" @click="submitViolation">保存</button>
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
  min-width: 760px;
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

.personnel-dialog-form {
  gap: 12px 14px;
}

@media (max-width: 640px) {
  .personnel-dialog-form {
    grid-template-columns: 1fr;
  }
}
</style>
