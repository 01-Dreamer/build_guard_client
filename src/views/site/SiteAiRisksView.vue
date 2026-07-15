<script setup lang="ts">
import { Refresh, Search } from '@element-plus/icons-vue'
import AppTopbar from '../../components/AppTopbar.vue'

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
}

const records: RiskRecord[] = [
  {
    id: 1,
    code: 'CM-001',
    device: '东区大门口摄像头',
    alarmTime: '2025-11-25 14:26:12',
    type: '工作现场抽烟',
    content: '检测到异常目标，异常类型：工作现场吸烟,检测人数:1',
    handler: '--',
    handleTime: '--',
    result: '--',
    handled: false
  },
  {
    id: 2,
    code: 'CM-001',
    device: '东区大门口摄像头',
    alarmTime: '2025-11-25 14:25:21',
    type: '工作现场抽烟',
    content: '检测到异常目标，异常类型：工作现场吸烟,检测人数:1',
    handler: '--',
    handleTime: '--',
    result: '--',
    handled: false
  },
  {
    id: 3,
    code: 'CM-001',
    device: '东区大门口摄像头',
    alarmTime: '2025-11-25 14:19:06',
    type: '工作现场抽烟',
    content: '检测到异常目标，异常类型：工作现场吸烟,检测人数:1',
    handler: '--',
    handleTime: '--',
    result: '--',
    handled: false
  },
  {
    id: 4,
    code: 'CM-001',
    device: '东区大门口摄像头',
    alarmTime: '2025-09-16 17:01:54',
    type: '工作现场抽烟',
    content: '检测到异常目标，异常类型：工作现场吸烟,检测人数:1',
    handler: '--',
    handleTime: '--',
    result: '--',
    handled: false
  },
  {
    id: 5,
    code: 'CM-001',
    device: '东区大门口摄像头',
    alarmTime: '2025-09-16 17:00:42',
    type: '工作现场抽烟',
    content: '检测到异常目标，异常类型：工作现场吸烟,检测人数:1',
    handler: '--',
    handleTime: '--',
    result: '--',
    handled: false
  },
  {
    id: 6,
    code: 'CM-001',
    device: '东区大门口摄像头',
    alarmTime: '2025-09-16 16:54:07',
    type: '工作现场抽烟',
    content: '检测到异常目标，异常类型：工作现场吸烟,检测人数:1',
    handler: '--',
    handleTime: '--',
    result: '--',
    handled: false
  },
  {
    id: 7,
    code: 'CM-001',
    device: '东区大门口摄像头',
    alarmTime: '2025-09-16 16:48:37',
    type: '未戴安全帽',
    content: '检测到异常目标，异常类型：未带安全帽,检测人数:1',
    handler: '王艳',
    handleTime: '2025-11-10 17:34:07',
    result: '对其批评责令整改',
    handled: true
  },
  {
    id: 8,
    code: 'CM-001',
    device: '东区大门口摄像头',
    alarmTime: '2025-09-16 16:38:22',
    type: '未戴安全帽',
    content: '检测到异常目标，异常类型：未带安全帽,检测人数:1',
    handler: '张三',
    handleTime: '2025-11-14 11:45:52',
    result: '对李四、王五进行批评教育',
    handled: true
  },
  {
    id: 9,
    code: 'CM-001',
    device: '东区大门口摄像头',
    alarmTime: '2025-09-16 16:34:18',
    type: '工作现场抽烟',
    content: '检测到异常目标，异常类型：工作现场吸烟,检测人数:2',
    handler: '--',
    handleTime: '--',
    result: '--',
    handled: false
  },
  {
    id: 10,
    code: 'CM-001',
    device: '东区大门口摄像头',
    alarmTime: '2025-09-16 16:27:32',
    type: '工作现场抽烟',
    content: '检测到异常目标，异常类型：工作现场吸烟,检测人数:1',
    handler: '--',
    handleTime: '--',
    result: '--',
    handled: false
  }
]
</script>

<template>
  <main class="site-page">
    <AppTopbar />

    <section class="site-content">
      <div class="breadcrumb">施工场地 &gt; AI风险识别与处理</div>

      <section class="filter-card">
        <label>
          <span>设备编号</span>
          <input placeholder="请输入设备编号" />
        </label>
        <label>
          <span>报警类型</span>
          <select>
            <option>请选择报警类型</option>
            <option>未戴安全帽</option>
            <option>未穿安全衣</option>
            <option>工作现场抽烟</option>
            <option>工作现场明火</option>
          </select>
        </label>
        <label class="date-field">
          <span>报警时间</span>
          <input type="date" />
        </label>
        <span class="date-separator">至</span>
        <label class="date-field no-caption">
          <span>结束时间</span>
          <input type="date" />
        </label>
        <div class="filter-actions">
          <button class="primary-btn" type="button">
            <el-icon>
              <Search />
            </el-icon>
            搜索
          </button>
          <button class="plain-btn" type="button">
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
              <td :title="record.alarmTime">{{ record.alarmTime }}</td>
              <td>
                <span class="type-tag" :title="record.type">{{ record.type }}</span>
              </td>
              <td class="content-cell" :title="record.content">{{ record.content }}</td>
              <td :title="record.handler">{{ record.handler }}</td>
              <td :title="record.handleTime">{{ record.handleTime }}</td>
              <td class="result-cell" :title="record.result">{{ record.result }}</td>
              <td>
                <button class="link-btn" type="button">详情</button>
                <button v-if="!record.handled" class="success-link" type="button">处理</button>
              </td>
            </tr>
          </tbody>
        </table>

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
  gap: 12px 14px;
  align-items: flex-end;
  padding: 18px 24px;
}

.filter-card label {
  display: grid;
  gap: 9px;
  width: 205px;
  min-width: 0;
  color: #334155;
  font-size: 13px;
  font-weight: 800;
}

.filter-card .date-field {
  width: 310px;
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
  border-radius: 6px;
  outline: none;
}

.filter-card input:focus,
.filter-card select:focus {
  border-color: #3b82f6;
}

.date-separator {
  align-self: center;
  margin-top: 22px;
  color: #64748b;
  font-weight: 800;
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
  display: flex;
  min-height: 0;
  flex-direction: column;
  overflow: hidden;
}

table {
  flex: 1;
  width: 100%;
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
  width: 12%;
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
  width: 7%;
}

th,
td {
  padding: 10px 10px;
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
  font-size: 13px;
  font-weight: 700;
  text-overflow: ellipsis;
  white-space: nowrap;
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
  padding: 4px 9px;
  color: #dc2626;
  font-size: 12px;
  font-weight: 800;
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

@media (max-width: 1180px) {
  .table-card {
    overflow-x: auto;
  }
}

@media (max-width: 760px) {
  .site-content {
    padding-inline: 12px;
  }

  .filter-card label,
  .filter-card .date-field {
    width: 100%;
  }

  .filter-card .no-caption span {
    display: none;
  }

  .date-separator {
    display: none;
  }
}
</style>
