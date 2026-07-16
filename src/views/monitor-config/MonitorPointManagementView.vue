<script setup lang="ts">
import { Plus, Search } from '@element-plus/icons-vue'
import AppTopbar from '../../components/AppTopbar.vue'
import { monitorPointRows } from './data'
</script>

<template>
  <main class="equipment-page">
    <AppTopbar />
    <section class="equipment-content">
      <div class="equipment-stack">
        <div class="equipment-breadcrumb">监测配置 &gt; 设备监测点管理</div>

        <section class="monitor-config-list-page">
          <section class="equipment-panel monitor-config-filter">
            <div class="filter-fields">
              <label>
                <span>监测点类型</span>
                <select>
                  <option value=""></option>
                  <option>高支模监测</option>
                  <option>深基坑监测</option>
                  <option>塔吊检测</option>
                </select>
              </label>
              <label>
                <span>监测点名称</span>
                <input placeholder="请输入监测点名称" />
              </label>
              <button class="primary-btn" type="button">
                <el-icon><Search /></el-icon>
                搜索
              </button>
            </div>

            <button class="primary-btn" type="button">
              <el-icon><Plus /></el-icon>
              新增
            </button>
          </section>

          <section class="equipment-panel monitor-config-table-card">
            <div class="monitor-table-body">
              <table class="equipment-table">
                <colgroup>
                  <col class="point-id-col" />
                  <col />
                  <col />
                  <col class="point-name-col" />
                  <col />
                  <col class="point-unit-col" />
                  <col />
                  <col />
                  <col class="point-sort-col" />
                  <col class="point-action-col" />
                </colgroup>
                <thead>
                  <tr>
                    <th>序号</th>
                    <th>监测点类型</th>
                    <th>监测点编号</th>
                    <th>监测点名称</th>
                    <th>设备名称</th>
                    <th>单位</th>
                    <th>预警上限阈值</th>
                    <th>预警下限阈值</th>
                    <th>排序</th>
                    <th>操作</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="row in monitorPointRows" :key="row.id">
                    <td>{{ row.id }}</td>
                    <td>{{ row.type }}</td>
                    <td>{{ row.code }}</td>
                    <td>{{ row.name }}</td>
                    <td>{{ row.device }}</td>
                    <td>{{ row.unit }}</td>
                    <td>{{ row.upper }}</td>
                    <td>{{ row.lower }}</td>
                    <td>{{ row.sort }}</td>
                    <td>
                      <div class="monitor-action-links">
                        <button class="link-btn" type="button">修改</button>
                        <button class="link-btn" type="button">删除</button>
                      </div>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            <div class="equipment-pagination monitor-pagination">
              <button type="button" aria-label="上一页">‹</button>
              <button class="active" type="button">1</button>
              <button type="button">2</button>
              <button type="button" aria-label="下一页">›</button>
            </div>
          </section>
        </section>
      </div>
    </section>
  </main>
</template>
