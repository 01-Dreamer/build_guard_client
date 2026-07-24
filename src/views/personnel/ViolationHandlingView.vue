<script setup lang="ts">
import { onMounted, reactive, ref } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Bell, Edit, Refresh, Search } from '@element-plus/icons-vue'
import {
  listPersonnel,
  listViolations,
  refundViolationFine,
  remindViolationFine,
  updateViolationFine,
  type PersonnelView,
  type ViolationView
} from '../../api/personnel'
import { API_BASE_URL } from '../../api/http'
import AppTopbar from '../../components/AppTopbar.vue'

interface ViolationRecord {
  id: number
  personnelId?: number | null
  name: string
  item: string
  fineAmount: number
  fine: string
  paymentStatus: number
  payment: string
  snapshotUrl?: string | null
  remark?: string | null
}

const violationRecords = ref<ViolationRecord[]>([])
const personnelOptions = ref<PersonnelView[]>([])
const searchName = ref('')
const loading = ref(false)
const submitting = ref(false)
const editDialogVisible = ref(false)
const editingRecord = ref<ViolationRecord | null>(null)
const editForm = reactive({
  personnelId: null as number | null,
  fineAmount: 0,
  revoked: false,
  remark: ''
})

function paymentText(status?: number | null) {
  if (status === 1) return '已支付'
  if (status === 2) return '已退款'
  if (status === 3) return '已撤销'
  return '未支付'
}

function paymentClass(status?: number | null) {
  if (status === 1) return 'good'
  if (status === 2 || status === 3) return 'warning'
  return 'danger'
}

function fineText(amount?: number | string | null) {
  if (amount === undefined || amount === null || amount === '') return '0元'
  return `${Number(amount).toFixed(2)}元`
}

function toViolationRecord(row: ViolationView): ViolationRecord {
  return {
    id: row.id,
    personnelId: row.personnelId,
    name: row.personnelName || '-',
    item: row.violationItem || '-',
    fineAmount: Number(row.fineAmount || 0),
    fine: fineText(row.fineAmount),
    paymentStatus: Number(row.paymentStatus ?? 0),
    payment: paymentText(row.paymentStatus),
    snapshotUrl: row.snapshotUrl,
    remark: row.remark
  }
}

function personnelDisplay(record: ViolationRecord) {
  return record.personnelId && record.name !== '-' ? `${record.name}（ID: ${record.personnelId}）` : '待确认'
}

function canPay(record: ViolationRecord) {
  return record.paymentStatus === 0 && Boolean(record.personnelId) && record.name !== '-'
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
  const result = await listPersonnel({ page: 1, pageSize: 200 })
  personnelOptions.value = result.records
}

function resetSearch() {
  searchName.value = ''
  loadViolations()
}

function openEditDialog(record: ViolationRecord) {
  editingRecord.value = record
  editForm.personnelId = record.personnelId ?? null
  editForm.fineAmount = record.fineAmount
  editForm.revoked = record.paymentStatus === 3
  editForm.remark = record.remark || ''
  editDialogVisible.value = true
}

async function submitEdit() {
  if (!editingRecord.value) return
  if (!editForm.personnelId) {
    ElMessage.warning('请选择人员')
    return
  }
  submitting.value = true
  try {
    await updateViolationFine(editingRecord.value.id, {
      personnelId: editForm.personnelId,
      fineAmount: Number(editForm.fineAmount || 0),
      revoked: editForm.revoked,
      remark: editForm.remark.trim()
    })
    ElMessage.success('罚款信息已更新')
    editDialogVisible.value = false
    await loadViolations()
  } finally {
    submitting.value = false
  }
}

async function remind(record: ViolationRecord) {
  try {
    await remindViolationFine(record.id)
    ElMessage.success('罚款提醒邮件已发送')
  } catch (error) {
    ElMessage.error(error instanceof Error ? error.message : '提醒发送失败')
  }
}

async function refundFine() {
  if (!editingRecord.value) return
  try {
    await ElMessageBox.confirm('确认对这笔已支付罚款发起退款？', '退款确认', {
      confirmButtonText: '确认退款',
      cancelButtonText: '取消',
      type: 'warning'
    })
    await refundViolationFine(editingRecord.value.id)
    ElMessage.success('退款已提交')
    editDialogVisible.value = false
    await loadViolations()
  } catch {
    return
  }
}

function openPayment(record: ViolationRecord) {
  if (!canPay(record)) {
    ElMessage.warning('请先在修改中确认人员后再支付')
    return
  }
  window.open(`${API_BASE_URL}/payments/fines/${record.id}/pay`, '_blank', 'noopener,noreferrer')
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
        </section>

        <section class="equipment-panel personnel-table-card">
          <table class="equipment-table personnel-table">
            <colgroup>
              <col class="col-id" />
              <col />
              <col />
              <col />
              <col class="col-status" />
              <col class="col-actions-wide" />
            </colgroup>
            <thead>
              <tr>
                <th>序号</th>
                <th>姓名</th>
                <th>违规事项</th>
                <th>罚款金额</th>
                <th>支付结果</th>
                <th>操作</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="record in violationRecords" :key="record.id">
                <td>{{ record.id }}</td>
                <td>{{ personnelDisplay(record) }}</td>
                <td :title="record.item">{{ record.item }}</td>
                <td>{{ record.fine }}</td>
                <td>
                  <span class="status-pill" :class="paymentClass(record.paymentStatus)">
                    {{ record.payment }}
                  </span>
                </td>
                <td>
                  <button
                    v-if="record.paymentStatus === 0"
                    class="link-btn"
                    type="button"
                    @click="remind(record)"
                  >
                    <el-icon><Bell /></el-icon>
                    提醒
                  </button>
                  <button class="link-btn" type="button" @click="openEditDialog(record)">
                    <el-icon><Edit /></el-icon>
                    修改
                  </button>
                  <button
                    v-if="record.paymentStatus === 0"
                    class="link-btn"
                    type="button"
                    :disabled="!canPay(record)"
                    :title="canPay(record) ? '' : '请先确认人员'"
                    @click="openPayment(record)"
                  >
                    支付
                  </button>
                </td>
              </tr>
              <tr v-if="!violationRecords.length">
                <td colspan="6">暂无已审核违规罚款数据</td>
              </tr>
            </tbody>
          </table>
        </section>

        <el-dialog v-model="editDialogVisible" title="修改罚款" width="720px" destroy-on-close>
          <div v-if="editingRecord?.snapshotUrl" class="violation-snapshot">
            <img :src="editingRecord.snapshotUrl" alt="违规抓拍图片" />
          </div>
          <form class="personnel-dialog-form" @submit.prevent="submitEdit">
            <label>
              <span>人员</span>
              <select v-model.number="editForm.personnelId">
                <option :value="null">待确认</option>
                <option v-for="person in personnelOptions" :key="person.id" :value="person.id">
                  {{ person.name }}（ID: {{ person.id }}）
                </option>
              </select>
            </label>
            <label>
              <span>罚款金额</span>
              <input v-model.number="editForm.fineAmount" type="number" min="0" step="0.01" />
            </label>
            <label>
              <span>撤销罚款</span>
              <select v-model="editForm.revoked">
                <option :value="false">否</option>
                <option :value="true">是</option>
              </select>
            </label>
            <label>
              <span>支付结果</span>
              <input :value="paymentText(editingRecord?.paymentStatus)" disabled />
            </label>
            <label class="wide-dialog-field">
              <span>备注</span>
              <input v-model="editForm.remark" placeholder="请输入备注" />
            </label>
          </form>
          <template #footer>
            <button
              v-if="editingRecord?.paymentStatus === 1"
              class="plain-btn refund-btn"
              type="button"
              :disabled="submitting"
              @click="refundFine"
            >
              退款
            </button>
            <button class="plain-btn" type="button" @click="editDialogVisible = false">取消</button>
            <button class="primary-btn" type="button" :disabled="submitting" @click="submitEdit">保存修改</button>
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
  min-width: 860px;
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

.col-actions-wide {
  width: 240px;
}

.personnel-table .link-btn {
  display: inline-flex;
  gap: 4px;
  align-items: center;
  margin-right: 12px;
}

.personnel-table .link-btn:disabled {
  color: #94a3b8;
  cursor: not-allowed;
}

.personnel-dialog-form {
  gap: 12px 14px;
}

.violation-snapshot {
  display: grid;
  min-height: 220px;
  max-height: 360px;
  margin-bottom: 14px;
  overflow: hidden;
  background: #0f172a;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
}

.violation-snapshot img {
  display: block;
  width: 100%;
  height: 100%;
  object-fit: contain;
  background: #111827;
}

.refund-btn {
  margin-right: auto;
  color: #b45309;
}

@media (max-width: 640px) {
  .personnel-dialog-form {
    grid-template-columns: 1fr;
  }
}
</style>
