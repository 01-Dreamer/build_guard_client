<script setup lang="ts">
import { Plus } from '@element-plus/icons-vue'
import AppTopbar from '../../components/AppTopbar.vue'
import ManagementTree from './ManagementTree.vue'
import { deviceTree, managedDevices } from './data'
</script>

<template>
  <main class="equipment-page">
    <AppTopbar />
    <section class="equipment-content">
      <div class="equipment-stack">
        <div class="equipment-breadcrumb">设备管理 &gt; 设备管理</div>
        <section class="management-layout">
          <ManagementTree title="" :items="deviceTree" />

          <section class="management-main device-table-panel">
            <div class="management-actions">
              <button class="primary-btn" type="button">
                <el-icon><Plus /></el-icon>
                新增
              </button>
            </div>

            <table class="equipment-table">
              <colgroup>
                <col class="col-id" />
                <col />
                <col />
                <col />
                <col />
                <col class="col-sort" />
                <col class="col-status" />
                <col class="col-switch" />
                <col class="col-actions" />
              </colgroup>
              <thead>
                <tr>
                  <th>序号</th>
                  <th>设备名称</th>
                  <th>设备编号</th>
                  <th>设备位置</th>
                  <th>设备类型</th>
                  <th>排序</th>
                  <th>状态</th>
                  <th>启用/禁用</th>
                  <th>操作</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="device in managedDevices" :key="device.id">
                  <td>{{ device.id }}</td>
                  <td>
                    <button class="link-btn" type="button">{{ device.name }}</button>
                  </td>
                  <td>{{ device.code }}</td>
                  <td>{{ device.location }}</td>
                  <td>{{ device.type }}</td>
                  <td>{{ device.order }}</td>
                  <td>
                    <span class="status-text">{{ device.status }}</span>
                  </td>
                  <td>
                    <span class="switch-pill" />
                  </td>
                  <td>
                    <div class="device-link-group">
                      <button class="link-btn" type="button">对接配置</button>
                      <button class="link-btn" type="button">编辑</button>
                      <button class="link-btn" type="button">删除</button>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </section>
        </section>
      </div>
    </section>
  </main>
</template>

<style scoped>
.col-id {
  width: 70px;
}

.col-sort,
.col-status,
.col-switch {
  width: 110px;
}

.col-actions {
  width: 280px;
}

.status-text {
  color: #16a34a;
  font-weight: 900;
}
</style>
