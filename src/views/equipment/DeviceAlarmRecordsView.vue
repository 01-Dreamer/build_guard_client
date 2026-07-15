<script setup lang="ts">
import { Refresh, Search } from '@element-plus/icons-vue'
import AppTopbar from '../../components/AppTopbar.vue'
import { alarmRecords, statusClass } from './data'
</script>

<template>
  <main class="equipment-page">
    <AppTopbar />

    <section class="equipment-content">
      <div class="records-stack">
        <div class="equipment-breadcrumb">施工设备 &gt; 监测报警记录</div>

        <section class="equipment-panel equipment-filter alarm-filter">
          <label>
            <span>报警类型</span>
            <select>
              <option>请选择报警类型</option>
              <option>基坑监测报警</option>
              <option>高支模监测报警</option>
              <option>塔吊报警</option>
              <option>升降机报警</option>
            </select>
          </label>
          <label>
            <span>报警时间</span>
            <input type="date" />
          </label>
          <label>
            <span>结束时间</span>
            <input type="date" />
          </label>
          <label>
            <span>设备名称</span>
            <input placeholder="请输入设备名称" />
          </label>
          <label>
            <span>处理状态</span>
            <select>
              <option>请选择处理状态</option>
              <option>未处理</option>
              <option>处理中</option>
              <option>已处理</option>
            </select>
          </label>
          <div class="equipment-actions">
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

        <section class="equipment-panel table-panel">
          <div class="record-table-body">
            <table class="equipment-table alarm-table">
              <colgroup>
                <col class="col-index" />
                <col class="col-device" />
                <col class="col-type" />
                <col class="col-content" />
                <col class="col-value" />
                <col class="col-unit" />
                <col class="col-limit" />
                <col class="col-limit" />
                <col class="col-time" />
                <col class="col-status" />
                <col class="col-action" />
              </colgroup>
              <thead>
                <tr>
                  <th>序号</th>
                  <th>设备名称</th>
                  <th>报警类型</th>
                  <th>报警内容</th>
                  <th>报警值</th>
                  <th>单位</th>
                  <th>报警上限值</th>
                  <th>报警下限值</th>
                  <th>报警时间</th>
                  <th>处理状态</th>
                  <th>操作</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="record in alarmRecords" :key="record.id">
                  <td>{{ record.id }}</td>
                  <td :title="record.name">{{ record.name }}</td>
                  <td>{{ record.type }}</td>
                  <td :title="record.content">{{ record.content }}</td>
                  <td>{{ record.value }}</td>
                  <td>{{ record.unit }}</td>
                  <td>{{ record.upper }}</td>
                  <td>{{ record.lower }}</td>
                  <td>{{ record.time }}</td>
                  <td>
                    <span class="status-pill" :class="statusClass(record.status)">
                      {{ record.status }}
                    </span>
                  </td>
                  <td>
                    <button class="link-btn" type="button">处理</button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <footer class="equipment-pagination">
            <span class="count">共166条　10条/页</span>
            <button class="active" type="button">1</button>
            <button type="button">2</button>
            <button type="button">3</button>
            <button type="button">›</button>
          </footer>
        </section>
      </div>
    </section>
  </main>
</template>

<style scoped>
.records-stack {
  display: grid;
  grid-template-rows: auto auto minmax(0, 1fr);
  gap: 14px;
  height: 100%;
  min-height: 0;
  padding: 4px 16px 24px;
}

.alarm-filter label {
  width: 230px;
}

.table-panel {
  display: grid;
  grid-template-rows: minmax(0, 1fr) auto;
  padding: 0;
}

.record-table-body {
  min-height: 0;
  overflow: auto;
}

.col-index {
  width: 6%;
}

.col-device {
  width: 12%;
}

.col-type,
.col-value,
.col-unit,
.col-limit,
.col-status,
.col-action {
  width: 8%;
}

.col-content {
  width: 18%;
}

.col-time {
  width: 14%;
}
</style>
