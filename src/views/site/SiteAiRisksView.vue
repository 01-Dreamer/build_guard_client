<script setup lang="ts">
import { computed, onMounted, reactive, ref } from 'vue'
import { Refresh, Search } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'
import { listPersonnel, type PersonnelView } from '../../api/personnel'
import { listAiRiskRecords, reviewAiRiskRecord, type AiRiskRecordView } from '../../api/site'
import AppTopbar from '../../components/AppTopbar.vue'
import { formatDateTime } from '../../utils/format'

interface RiskRecord {
  id: number
  code: string
  device: string
  alarmTime: string
  type: string
  rawType: string
  content: string
  personnelId?: number | null
  personnelName: string
  confidence?: number | null
  snapshotUrl?: string | null
  handled: boolean
  handleContent: string
}

const rawRecords = ref<AiRiskRecordView[]>([])
const personnelOptions = ref<PersonnelView[]>([])
const filters = reactive({ deviceCode: '', alarmType: '', startTime: '', endTime: '' })
const loading = ref(false)
const submitting = ref(false)
const reviewDialogVisible = ref(false)
const selectedRecord = ref<RiskRecord | null>(null)
const page = ref(1)
const pageSize = 10
const total = ref(0)
const reviewForm = reactive({
  personnelId: null as number | null,
  fineAmount: 50,
  decision: 'approve' as 'approve' | 'reject',
  remark: ''
})

const records = computed<RiskRecord[]>(() =>
  rawRecords.value.map((record) => {
    const rawType = record.detectType || record.alarmType || 'ai_risk'
    const handled = record.status === 2 || record.alarmStatus === 2 || record.status === '已处理'
    return {
      id: record.id,
      code: record.deviceCode || record.cameraCode || '-',
      device: record.deviceName || record.cameraName || '-',
      alarmTime: formatDateTime(record.occurredAt || record.alarmTime),
      type: riskTypeText(rawType),
      rawType,
      content: record.content || `${record.personnelName || '现场人员'}触发${riskTypeText(rawType)}`,
      personnelId: record.personnelId,
      personnelName: record.personnelName || '待确认',
      confidence: record.confidence,
      snapshotUrl: record.snapshotUrl,
      handled,
      handleContent: record.handleContent || '-'
    }
  })
)

function riskTypeText(type?: string | null) {
  const value = String(type || '').toLowerCase()
  if (value.includes('helmet')) return '未佩戴安全帽'
  if (value.includes('vest') || value.includes('reflective')) return '未穿反光衣'
  if (value.includes('smok')) return '工作现场抽烟'
  if (value.includes('fire')) return '工作现场明火'
  return type || 'AI风险'
}

function confidenceText(value?: number | null) {
  if (value === undefined || value === null) return '-'
  return `${(Number(value) * 100).toFixed(1)}%`
}

function defaultFine(type: string) {
  const value = type.toLowerCase()
  if (value.includes('smok') || value.includes('fire')) return 100
  return 50
}

async function loadRecords() {
  loading.value = true
  try {
    const result = await listAiRiskRecords({ ...filters, page: page.value, pageSize })
    rawRecords.value = result.records
    total.value = result.total
  } catch {
    rawRecords.value = []
    total.value = 0
  } finally {
    loading.value = false
  }
}

async function loadPersonnelOptions() {
  const result = await listPersonnel({ page: 1, pageSize: 200 })
  personnelOptions.value = result.records
}

function searchRecords() {
  page.value = 1
  loadRecords()
}

function resetFilters() {
  filters.deviceCode = ''
  filters.alarmType = ''
  filters.startTime = ''
  filters.endTime = ''
  searchRecords()
}

function openReviewDialog(record: RiskRecord) {
  selectedRecord.value = record
  reviewForm.personnelId = record.personnelId ?? null
  reviewForm.fineAmount = defaultFine(record.rawType)
  reviewForm.decision = 'approve'
  reviewForm.remark = record.personnelId ? 'AI识别结果自动带入，待管理员确认' : 'AI未确认人员，请管理员选择'
  reviewDialogVisible.value = true
}

async function submitReview() {
  if (!selectedRecord.value) return
  if (reviewForm.decision === 'approve' && !reviewForm.personnelId) {
    ElMessage.warning('审核通过前请选择违规人员')
    return
  }
  submitting.value = true
  try {
    const result = await reviewAiRiskRecord(selectedRecord.value.id, {
      personnelId: reviewForm.personnelId,
      fineAmount: reviewForm.fineAmount,
      decision: reviewForm.decision,
      remark: reviewForm.remark.trim()
    })
    ElMessage.success(result?.violationId ? '审核完成，已生成罚款记录' : '审核完成')
    reviewDialogVisible.value = false
    await loadRecords()
  } finally {
    submitting.value = false
  }
}

function previousPage() {
  if (page.value <= 1) return
  page.value -= 1
  loadRecords()
}

function nextPage() {
  if (page.value * pageSize >= total.value) return
  page.value += 1
  loadRecords()
}

onMounted(async () => {
  await Promise.all([loadRecords(), loadPersonnelOptions()])
})
</script>

<template>
  <main class="site-page">
    <AppTopbar />

    <section class="site-content">
      <div class="breadcrumb">施工场地 &gt; AI风险识别与处理</div>

      <section class="filter-card">
        <label>
          <span>设备编号</span>
          <input v-model="filters.deviceCode" placeholder="请输入设备编号" @keyup.enter="searchRecords" />
        </label>
        <label>
          <span>报警类型</span>
          <select v-model="filters.alarmType">
            <option value="">全部类型</option>
            <option value="helmet">未佩戴安全帽</option>
            <option value="vest">未穿反光衣</option>
            <option value="smoking">工作现场抽烟</option>
            <option value="fire">工作现场明火</option>
          </select>
        </label>
        <div class="date-range">
          <label class="date-field">
            <span>报警时间</span>
            <input v-model="filters.startTime" type="date" />
          </label>
          <span class="date-separator">至</span>
          <label class="date-field no-caption">
            <span>结束时间</span>
            <input v-model="filters.endTime" type="date" />
          </label>
        </div>
        <div class="filter-actions">
          <button class="primary-btn" type="button" :disabled="loading" @click="searchRecords">
            <el-icon><Search /></el-icon>
            搜索
          </button>
          <button class="plain-btn" type="button" :disabled="loading" @click="resetFilters">
            <el-icon><Refresh /></el-icon>
            重置
          </button>
        </div>
      </section>

      <section class="table-card">
        <div class="risk-table-body">
          <table>
            <colgroup>
              <col class="col-index" />
              <col class="col-shot" />
              <col class="col-code" />
              <col class="col-device" />
              <col class="col-time" />
              <col class="col-type" />
              <col class="col-person" />
              <col class="col-confidence" />
              <col class="col-status" />
              <col class="col-action" />
            </colgroup>
            <thead>
              <tr>
                <th>序号</th>
                <th>抓拍</th>
                <th>设备编号</th>
                <th>设备名称</th>
                <th>报警时间</th>
                <th>报警类型</th>
                <th>候选人员</th>
                <th>置信度</th>
                <th>审核状态</th>
                <th>操作</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="record in records" :key="record.id">
                <td>{{ record.id }}</td>
                <td>
                  <img v-if="record.snapshotUrl" class="risk-thumb" :src="record.snapshotUrl" alt="AI标注截图" />
                  <span v-else class="empty-thumb">无图</span>
                </td>
                <td :title="record.code">{{ record.code }}</td>
                <td :title="record.device">{{ record.device }}</td>
                <td class="time-cell" :title="record.alarmTime">{{ record.alarmTime }}</td>
                <td><span class="type-tag">{{ record.type }}</span></td>
                <td :title="record.personnelName">{{ record.personnelName }}</td>
                <td>{{ confidenceText(record.confidence) }}</td>
                <td>
                  <span class="status-tag" :class="{ done: record.handled }">
                    {{ record.handled ? '已审核' : '待审核' }}
                  </span>
                </td>
                <td>
                  <button class="success-link" type="button" @click="openReviewDialog(record)">
                    {{ record.handled ? '查看' : '审核' }}
                  </button>
                </td>
              </tr>
              <tr v-if="!records.length">
                <td colspan="10">暂无 AI 风险记录</td>
              </tr>
            </tbody>
          </table>
        </div>

        <footer class="pagination">
          <span class="count">共 {{ total }} 条</span>
          <button type="button" :disabled="page <= 1" @click="previousPage">‹</button>
          <button class="active" type="button">{{ page }}</button>
          <button type="button" :disabled="page * pageSize >= total" @click="nextPage">›</button>
        </footer>
      </section>
    </section>

    <el-dialog v-model="reviewDialogVisible" title="违规审核" width="980px" destroy-on-close>
      <div class="review-layout">
        <section class="review-image">
          <img v-if="selectedRecord?.snapshotUrl" :src="selectedRecord.snapshotUrl" alt="AI识别标注图" />
          <div v-else class="image-empty">暂无 AI 标注截图</div>
        </section>
        <section class="review-side">
          <div class="review-summary">
            <strong>{{ selectedRecord?.type }}</strong>
            <span>{{ selectedRecord?.device }} · {{ selectedRecord?.alarmTime }}</span>
            <span>AI候选人员：{{ selectedRecord?.personnelName || '待确认' }}</span>
            <span>置信度：{{ confidenceText(selectedRecord?.confidence) }}</span>
          </div>
          <form class="review-form" @submit.prevent="submitReview">
            <label>
              <span>审核结果</span>
              <select v-model="reviewForm.decision">
                <option value="approve">确认违规并生成罚款</option>
                <option value="reject">驳回，不生成罚款</option>
              </select>
            </label>
            <label>
              <span>违规人员</span>
              <select v-model.number="reviewForm.personnelId" :disabled="reviewForm.decision === 'reject'">
                <option :value="null">待确认</option>
                <option v-for="person in personnelOptions" :key="person.id" :value="person.id">
                  {{ person.name }}
                </option>
              </select>
            </label>
            <label>
              <span>罚款金额</span>
              <input
                v-model.number="reviewForm.fineAmount"
                type="number"
                min="0"
                step="0.01"
                :disabled="reviewForm.decision === 'reject'"
              />
            </label>
            <label class="wide-field">
              <span>处理说明</span>
              <textarea v-model="reviewForm.remark" rows="4" placeholder="请输入审核说明" />
            </label>
          </form>
        </section>
      </div>
      <template #footer>
        <button class="plain-btn" type="button" @click="reviewDialogVisible = false">取消</button>
        <button class="primary-btn" type="button" :disabled="submitting" @click="submitReview">保存审核</button>
      </template>
    </el-dialog>
  </main>
</template>

<style scoped>
.site-page {
  height: 100vh;
  overflow: hidden;
  color: #334155;
  background: #f3f6fa;
}

.site-content {
  display: grid;
  grid-template-rows: auto auto minmax(0, 1fr);
  gap: 14px;
  height: calc(100vh - 58px);
  padding: 16px 28px 14px;
  overflow: hidden;
}

.breadcrumb {
  display: flex;
  align-items: center;
  height: 28px;
  color: #64748b;
  font-size: 16px;
  font-weight: 700;
}

.filter-card,
.table-card {
  background: rgba(255, 255, 255, 0.96);
  border: 1px solid var(--line-soft);
  border-radius: var(--radius-panel);
  box-shadow: var(--shadow-panel);
}

.filter-card {
  display: grid;
  grid-template-columns: 260px 260px minmax(380px, 1fr) auto;
  gap: 14px 18px;
  align-items: flex-end;
  padding: 18px 24px;
}

.filter-card label,
.review-form label {
  display: grid;
  gap: 9px;
  min-width: 0;
  color: #334155;
  font-size: 13px;
  font-weight: 800;
}

.date-range {
  display: grid;
  grid-template-columns: minmax(170px, 1fr) auto minmax(170px, 1fr);
  gap: 12px;
  align-items: flex-end;
  min-width: 0;
}

.filter-card .no-caption span {
  opacity: 0;
}

.filter-card input,
.filter-card select,
.review-form input,
.review-form select,
.review-form textarea {
  width: 100%;
  min-width: 0;
  padding: 0 12px;
  color: #334155;
  background: #fff;
  border: 1px solid #d7dde6;
  border-radius: 8px;
  outline: none;
}

.filter-card input,
.filter-card select,
.review-form input,
.review-form select {
  height: 38px;
}

.review-form textarea {
  padding-top: 10px;
  line-height: 1.5;
  resize: vertical;
}

.date-separator {
  align-self: end;
  height: 38px;
  color: #64748b;
  font-weight: 800;
  line-height: 38px;
}

.filter-actions {
  display: flex;
  gap: 8px;
  justify-content: flex-end;
  min-width: 190px;
}

.primary-btn,
.plain-btn {
  display: inline-flex;
  gap: 6px;
  align-items: center;
  justify-content: center;
  height: 38px;
  padding: 0 18px;
  font-weight: 800;
  cursor: pointer;
  border-radius: 8px;
}

.primary-btn {
  color: #fff;
  background: #3f6fed;
  border: 1px solid #2b63d4;
}

.plain-btn {
  color: #334155;
  background: #fff;
  border: 1px solid #d7dde6;
}

.table-card {
  display: grid;
  grid-template-rows: minmax(0, 1fr) auto;
  min-height: 0;
  overflow: hidden;
}

.risk-table-body {
  min-height: 0;
  overflow: auto;
}

table {
  width: 100%;
  min-width: 1180px;
  border-collapse: collapse;
  table-layout: fixed;
}

.col-index {
  width: 70px;
}

.col-shot {
  width: 96px;
}

.col-code,
.col-person,
.col-confidence,
.col-status {
  width: 120px;
}

.col-device {
  width: 150px;
}

.col-time {
  width: 172px;
}

.col-type {
  width: 150px;
}

.col-action {
  width: 90px;
}

th,
td {
  height: 54px;
  padding: 8px 12px;
  text-align: left;
  border-bottom: 1px solid #edf1f6;
}

th {
  height: 42px;
  color: #64748b;
  font-size: 13px;
  font-weight: 800;
  white-space: nowrap;
  background: #fbfcfe;
}

td {
  overflow: hidden;
  color: #334155;
  font-size: 13px;
  font-weight: 700;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.risk-thumb {
  display: block;
  width: 70px;
  height: 42px;
  object-fit: cover;
  background: #0f172a;
  border: 1px solid #dbe3ee;
  border-radius: 6px;
}

.empty-thumb {
  display: inline-grid;
  width: 70px;
  height: 42px;
  place-items: center;
  color: #94a3b8;
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  border-radius: 6px;
}

.time-cell {
  color: #2f3f58;
  font-family: "DIN Alternate", "Roboto Mono", Consolas, monospace;
  font-feature-settings: "tnum";
  font-variant-numeric: tabular-nums;
  font-weight: 800;
}

.type-tag,
.status-tag {
  display: inline-flex;
  max-width: 100%;
  padding: 4px 9px;
  overflow: hidden;
  font-size: 12px;
  font-weight: 900;
  text-overflow: ellipsis;
  white-space: nowrap;
  border-radius: 999px;
}

.type-tag {
  color: #dc2626;
  background: #fee2e2;
}

.status-tag {
  color: #d97706;
  background: #fef3c7;
}

.status-tag.done {
  color: #16a34a;
  background: #dcfce7;
}

.success-link {
  padding: 0;
  color: #22c55e;
  font-size: 13px;
  font-weight: 900;
  cursor: pointer;
  background: transparent;
  border: 0;
}

.pagination {
  display: flex;
  gap: 8px;
  align-items: center;
  justify-content: flex-end;
  min-height: 54px;
  padding: 8px 24px 12px;
  border-top: 1px solid #edf1f6;
}

.pagination .count {
  margin-right: auto;
  color: #64748b;
  font-weight: 800;
}

.pagination button {
  min-width: 30px;
  height: 30px;
  color: #64748b;
  cursor: pointer;
  background: #fff;
  border: 1px solid #dbe3ee;
  border-radius: 6px;
}

.pagination .active {
  color: #fff;
  background: #3f6fed;
  border-color: #3f6fed;
}

.review-layout {
  display: grid;
  grid-template-columns: minmax(0, 1.35fr) minmax(320px, 0.65fr);
  gap: 18px;
}

.review-image {
  display: grid;
  min-height: 420px;
  overflow: hidden;
  background: #0f172a;
  border: 1px solid #dbe3ee;
  border-radius: 8px;
}

.review-image img {
  width: 100%;
  height: 100%;
  object-fit: contain;
}

.image-empty {
  display: grid;
  place-items: center;
  color: #94a3b8;
  font-weight: 800;
}

.review-side {
  display: grid;
  align-content: start;
  gap: 14px;
}

.review-summary {
  display: grid;
  gap: 8px;
  padding: 14px;
  color: #475569;
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
}

.review-summary strong {
  color: #1e293b;
  font-size: 18px;
}

.review-form {
  display: grid;
  gap: 14px;
}

.wide-field {
  grid-column: 1 / -1;
}

@media (max-width: 1180px) {
  .filter-card,
  .review-layout {
    grid-template-columns: 1fr;
  }
}
</style>
