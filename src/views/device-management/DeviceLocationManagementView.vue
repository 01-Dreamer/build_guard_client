<script setup lang="ts">
import { Delete, Plus } from '@element-plus/icons-vue'
import AppTopbar from '../../components/AppTopbar.vue'
import ManagementTree from './ManagementTree.vue'
import { locationForm, locationTree } from './data'
</script>

<template>
  <main class="equipment-page">
    <AppTopbar />
    <section class="equipment-content">
      <div class="equipment-stack">
        <div class="equipment-breadcrumb">设备管理 &gt; 设备位置管理</div>
        <section class="management-layout">
          <ManagementTree title="位置信息" :items="locationTree" />

          <section class="management-main">
            <div class="management-actions">
              <button class="primary-btn" type="button">
                <el-icon><Plus /></el-icon>
                新增
              </button>
              <button class="danger-btn" type="button">
                <el-icon><Delete /></el-icon>
                删除
              </button>
            </div>

            <section class="form-card">
              <h2>基本信息</h2>
              <form class="management-form">
                <label>
                  <span>上级位置编号</span>
                  <input :value="locationForm.parentCode" readonly />
                </label>
                <label>
                  <span>上级位置名称</span>
                  <input :value="locationForm.parentName" readonly />
                </label>
                <label class="required">
                  <span>位置编号</span>
                  <input :value="locationForm.code" />
                </label>
                <label class="required">
                  <span>位置名称</span>
                  <input :value="locationForm.name" />
                </label>
                <label class="required">
                  <span>排序</span>
                  <input :value="locationForm.sort" />
                </label>
                <div class="form-save-row">
                  <button class="primary-btn" type="button">保存</button>
                </div>
              </form>
            </section>
          </section>
        </section>
      </div>
    </section>
  </main>
</template>
