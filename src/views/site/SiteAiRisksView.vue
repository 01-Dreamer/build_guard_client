<script setup lang="ts">
import { computed, onMounted, reactive, ref } from 'vue'
import { Refresh, Search } from '@element-plus/icons-vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { handleAlarm } from '../../api/alarms'
import { listAiRiskRecords, type AiRiskRecordView } from '../../api/site'
import AppTopbar from '../../components/AppTopbar.vue'
import { formatDateTime } from '../../utils/format'

interface RiskRecord {
  id: number
  code: string
  device: string
  alarmTime: string
  type: '工作现场抽烟' | '未戴安全帽'
  content: string
  handler: string
  handleTime: string
  result: string
  handled: boolean
  sourceAlarmId?: number | null
}

const rawRecords = ref<AiRiskRecordView[]>([])
const filters = reactive({ deviceCode: '', alarmType: '', startTime: '', endTime: '' })
const records = computed<RiskRecord[]>(() =>
  rawRecords.value.map((record) => {
    const status = record.status
    const handled = status === 2 || status === '已处理' || status === 'handled'
    return {
      id: record.id,
      code: record.deviceCode || record.cameraCode || '-',
      device: record.deviceName || record.cameraName || '-',
      alarmTime: formatDateTime(record.occurredAt || record.alarmTime),
      type: (record.detectType || record.alarmType || '-') as RiskRecord['type'],
      content: record.content || '-',
      handler: record.handleByName || record.handler || '-',
      handleTime: formatDateTime(record.handledAt || record.handleTime),
      result: record.handleContent || record.result || '-',
      handled,
      sourceAlarmId: record.sourceAlarmId
    }
  })
)

async function loadRecords() {
  try {
    const result = await listAiRiskRecords({ ...filters, page: 1, pageSize: 100 })
    rawRecords.value = result.records
  } catch {
    rawRecords.value = []
  }
}

function resetFilters() {
  filters.deviceCode = ''
  filters.alarmType = ''
  filters.startTime = ''
  filters.endTime = ''
  loadRecords()
}

async function handleRisk(record: RiskRecord) {
  if (!record.sourceAlarmId) {
    ElMessage.warning('该 AI 记录未关联报警，暂不能处理')
    return
  }

  try {
    const { value } = await ElMessageBox.prompt('请输入风险处理内容', 'AI风险处理', {
      confirmButtonText: '确认处理',
      cancelButtonText: '取消',
      inputPattern: /\S+/,
      inputErrorMessage: '处理内容不能为空'
    })
    await handleAlarm(record.sourceAlarmId, { handleBy: '系统管理员', handleContent: value })
    ElMessage.success('AI风险已处理')
    loadRecords()
  } catch {
    return
  }
}

onMounted(loadRecords)
</script>

<template>
  <main class="site-page">
    <AppTopbar />

    <section class="site-content">
      <div class="breadcrumb">施工场地 &gt; AI风险识别与处理</div>

      <section class="filter-card">
        <label>
          <span>设备编号</span>
          <input v-model="filters.deviceCode" placeholder="请输入设备编号" />
        </label>
        <label>
          <span>报警类型</span>
          <select v-model="filters.alarmType">
            <option value="">请选择报警类型</option>
            <option>未戴安全帽</option>
            <option>未穿安全衣</option>
            <option>工作现场抽烟</option>
            <option>工作现场明火</option>
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
          <button class="primary-btn" type="button" @click="loadRecords">
            <el-icon>
              <Search />
            </el-icon>
            搜索
          </button>
          <button class="plain-btn" type="button" @click="resetFilters">
            <el-icon>
              <Refresh />
            </el-icon>
            重置
          </button>
        </div>
      </section>

      <section class="table-card">
        <div class="risk-table-body">
          <table>
            <colgroup>
              <col class="col-index" />
              <col class="col-code" />
              <col class="col-device" />
              <col class="col-time" />
              <col class="col-type" />
              <col class="col-content" />
              <col class="col-handler" />
              <col class="col-time" />
              <col class="col-result" />
              <col class="col-action" />
            </colgroup>
            <thead>
              <tr>
                <th>序号</th>
                <th>设备编号</th>
                <th>设备名称</th>
                <th>报警时间</th>
                <th>报警类型</th>
                <th>报警内容</th>
                <th>处理人</th>
                <th>处理时间</th>
                <th>处理内容</th>
                <th>操作</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="record in records" :key="record.id">
                <td>{{ record.id }}</td>
                <td :title="record.code">{{ record.code }}</td>
                <td :title="record.device">{{ record.device }}</td>
                <td class="time-cell" :title="record.alarmTime">{{ record.alarmTime }}</td>
                <td>
                  <span class="type-tag" :title="record.type">{{ record.type }}</span>
                </td>
                <td class="content-cell" :title="record.content">{{ record.content }}</td>
                <td :title="record.handler">{{ record.handler }}</td>
                <td class="time-cell" :title="record.handleTime">{{ record.handleTime }}</td>
                <td class="result-cell" :title="record.result">{{ record.result }}</td>
                <td>
                  <button class="link-btn" type="button">详情</button>
                  <button v-if="!record.handled" class="success-link" type="button" @click="handleRisk(record)">处理</button>
                </td>
              </tr>
              <tr v-if="!records.length">
                <td colspan="10">暂无 AI 风险记录</td>
              </tr>
            </tbody>
          </table>
        </div>

        <footer class="pagination">
          <button type="button">‹</button>
          <button class="active" type="button">1</button>
          <button type="button">2</button>
          <button type="button">›</button>
        </footer>
      </section>
    </section>
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
  line-height: 28px;
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
  grid-template-columns: 280px 280px minmax(440px, 1fr) auto;
  gap: 14px 20px;
  align-items: flex-end;
  padding: 18px 24px;
}

.filter-card label {
  display: grid;
  gap: 9px;
  min-width: 0;
  color: #334155;
  font-size: 13px;
  font-weight: 800;
}

.date-range {
  display: grid;
  grid-template-columns: minmax(190px, 1fr) auto minmax(190px, 1fr);
  gap: 12px;
  align-items: flex-end;
  min-width: 0;
}

.date-range .date-field {
  min-width: 0;
}

.filter-card .no-caption span {
  opacity: 0;
}

.filter-card input,
.filter-card select {
  width: 100%;
  min-width: 0;
  height: 38px;
  padding: 0 12px;
  color: #334155;
  background: #fff;
  border: 1px solid #d7dde6;
  border-radius: 8px;
  outline: none;
}

.filter-card input:focus,
.filter-card select:focus {
  border-color: #3b82f6;
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
  min-width: 210px;
}

.primary-btn,
.plain-btn {
  display: inline-flex;
  gap: 6px;
  align-items: center;
  height: 38px;
  padding: 0 18px;
  color: #fff;
  font-weight: 800;
  cursor: pointer;
  border: 0;
  border-radius: 6px;
}

.primary-btn {
  background: #3f6fed;
}

.plain-btn {
  background: #6b7280;
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
  min-width: 1240px;
  border-collapse: collapse;
  table-layout: fixed;
}

.col-index {
  width: 4%;
}

.col-code {
  width: 7%;
}

.col-device {
  width: 10%;
}

.col-time {
  width: 176px;
}

.col-type {
  width: 9%;
}

.col-content {
  width: 22%;
}

.col-handler {
  width: 6%;
}

.col-result {
  width: 10%;
}

.col-action {
  width: 90px;
}

th,
td {
  height: 46px;
  padding: 0 12px;
  text-align: left;
  border-bottom: 1px solid #edf1f6;
}

th {
  height: 40px;
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

.time-cell {
  color: #2f3f58;
  font-family: "DIN Alternate", "Roboto Mono", Consolas, monospace;
  font-size: 12px;
  font-feature-settings: "tnum";
  font-variant-numeric: tabular-nums;
  font-weight: 800;
  letter-spacing: 0;
}

.content-cell {
  min-width: 0;
  white-space: nowrap;
}

.result-cell {
  min-width: 0;
  white-space: nowrap;
}

.type-tag {
  display: inline-flex;
  max-width: 100%;
  padding: 4px 9px;
  overflow: hidden;
  color: #dc2626;
  font-size: 12px;
  font-weight: 800;
  text-overflow: ellipsis;
  white-space: nowrap;
  background: #fee2e2;
  border-radius: 999px;
}

.link-btn,
.success-link {
  padding: 0;
  margin-right: 6px;
  font-size: 13px;
  font-weight: 800;
  cursor: pointer;
  background: transparent;
  border: 0;
}

.link-btn {
  color: #3b82f6;
}

.success-link {
  color: #22c55e;
}

.pagination {
  display: flex;
  gap: 8px;
  align-items: center;
  justify-content: flex-end;
  min-height: 54px;
  padding: 8px 24px 12px;
}

.pagination button {
  min-width: 30px;
  height: 30px;
  color: #64748b;
  cursor: pointer;
  background: #fff;
  border: 1px solid #dbe3ee;
  border-radius: 5px;
}

.pagination .active {
  color: #fff;
  background: #3f6fed;
  border-color: #3f6fed;
}

@media (max-width: 1180px) {
  .filter-card {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  .filter-actions {
    justify-content: flex-start;
  }

  .table-card {
    overflow-x: auto;
  }
}

@media (max-width: 760px) {
  .site-content {
    padding-inline: 12px;
  }

  .filter-card,
  .date-range {
    grid-template-columns: 1fr;
  }

  .filter-card .no-caption span {
    display: none;
  }

  .date-separator {
    display: none;
  }
}
</style>
