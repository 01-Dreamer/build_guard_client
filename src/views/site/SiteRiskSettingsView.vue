<script setup lang="ts">
import { computed, onMounted, reactive, ref } from 'vue'
import { Refresh, Search } from '@element-plus/icons-vue'
import { listAiMonitorRules, type CameraView } from '../../api/site'
import AppTopbar from '../../components/AppTopbar.vue'

interface DeviceRule {
  id: number
  name: string
  code: string
  stream: string
  categories: string
  status: '在线' | '离线'
}

const rawRules = ref<CameraView[]>([])
const filters = reactive({ name: '', code: '' })
const rules = computed<DeviceRule[]>(() =>
  rawRules.value.map((rule) => ({
    id: rule.id,
    name: rule.name,
    code: rule.code,
    stream: rule.streamCode || rule.cameraSource || '-',
    categories: Array.isArray(rule.aiMonitorTypes) ? rule.aiMonitorTypes.join('、') : rule.aiMonitorTypes || '-',
    status: rule.onlineStatus === 1 || rule.onlineStatus === '在线' || rule.onlineStatus === 'online' ? '在线' : '离线'
  }))
)

async function loadRules() {
  try {
    const result = await listAiMonitorRules({ ...filters, page: 1, pageSize: 100 })
    rawRules.value = result.records
  } catch {
    rawRules.value = []
  }
}

function resetFilters() {
  filters.name = ''
  filters.code = ''
  loadRules()
}

onMounted(loadRules)
</script>

<template>
  <main class="site-page">
    <AppTopbar />

    <section class="site-content">
      <div class="breadcrumb">施工场地 &gt; 风险识别设置</div>

      <section class="filter-card">
        <label>
          <span>设备名称</span>
          <input v-model="filters.name" placeholder="请输入设备名称" />
        </label>
        <label>
          <span>设备编号</span>
          <input v-model="filters.code" placeholder="请输入设备编号" />
        </label>
        <div class="filter-actions">
          <button class="primary-btn" type="button" @click="loadRules">
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
        <table>
          <colgroup>
            <col class="col-index" />
            <col class="col-name" />
            <col class="col-code" />
            <col class="col-stream" />
            <col class="col-category" />
            <col class="col-status" />
            <col class="col-action" />
          </colgroup>
          <thead>
            <tr>
              <th>序号</th>
              <th>设备名称</th>
              <th>设备编号</th>
              <th>推流码</th>
              <th>AI识别类别</th>
              <th>设备状态</th>
              <th>操作</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="rule in rules" :key="rule.id">
              <td>{{ rule.id }}</td>
              <td :title="rule.name">
                <strong>{{ rule.name }}</strong>
              </td>
              <td :title="rule.code">{{ rule.code }}</td>
              <td :title="rule.stream">{{ rule.stream }}</td>
              <td class="category-cell" :title="rule.categories">{{ rule.categories }}</td>
              <td>
                <span
                  class="status-tag"
                  :class="{ offline: rule.status === '离线' }"
                  :title="rule.status"
                >
                  {{ rule.status }}
                </span>
              </td>
              <td>
                <button class="link-btn" type="button">修改</button>
              </td>
            </tr>
            <tr v-if="!rules.length">
              <td colspan="7">暂无风险识别设置</td>
            </tr>
          </tbody>
        </table>

        <footer class="pagination">
          <button type="button">‹</button>
          <button class="active" type="button">1</button>
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
  height: calc(100vh - 54px);
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
  background: #fff;
  border: 1px solid #edf1f6;
  border-radius: 8px;
  box-shadow: 0 6px 20px rgba(15, 23, 42, 0.04);
}

.filter-card {
  display: flex;
  flex-wrap: wrap;
  gap: 14px 16px;
  align-items: flex-end;
  padding: 18px 24px;
}

.filter-card label {
  display: grid;
  gap: 9px;
  width: 340px;
  max-width: 100%;
  min-width: 0;
  color: #334155;
  font-size: 13px;
  font-weight: 800;
}

.filter-card input {
  width: 100%;
  min-width: 0;
  height: 38px;
  padding: 0 12px;
  color: #334155;
  border: 1px solid #d7dde6;
  border-radius: 6px;
  outline: none;
}

.filter-card input:focus {
  border-color: #3b82f6;
}

.filter-actions {
  display: flex;
  gap: 8px;
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
  align-self: start;
  display: block;
  min-height: 0;
  overflow: auto;
}

table {
  width: 100%;
  min-width: 920px;
  border-collapse: collapse;
  table-layout: fixed;
}

.col-index {
  width: 7%;
}

.col-name {
  width: 18%;
}

.col-code {
  width: 12%;
}

.col-stream {
  width: 11%;
}

.col-category {
  width: 34%;
}

.col-status {
  width: 10%;
}

.col-action {
  width: 8%;
}

th,
td {
  height: 46px;
  padding: 0 16px;
  text-align: left;
  border-bottom: 1px solid #edf1f6;
}

th {
  color: #64748b;
  font-size: 13px;
  font-weight: 800;
  white-space: nowrap;
  background: #fbfcfe;
}

td {
  overflow: hidden;
  color: #334155;
  font-size: 14px;
  font-weight: 700;
  text-overflow: ellipsis;
  white-space: nowrap;
}

td strong {
  display: block;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.category-cell {
  min-width: 0;
}

.status-tag {
  display: inline-flex;
  max-width: 100%;
  padding: 4px 9px;
  overflow: hidden;
  color: #16a34a;
  font-size: 12px;
  font-weight: 800;
  text-overflow: ellipsis;
  white-space: nowrap;
  background: #dcfce7;
  border-radius: 999px;
}

.status-tag.offline {
  color: #dc2626;
  background: #fee2e2;
}

.link-btn {
  color: #3b82f6;
  font-weight: 800;
  cursor: pointer;
  background: transparent;
  border: 0;
}

.pagination {
  display: flex;
  gap: 8px;
  justify-content: flex-end;
  padding: 10px 24px;
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

@media (max-width: 900px) {
  .site-content {
    padding-inline: 12px;
  }

  .table-card {
    overflow-x: auto;
  }
}
</style>
