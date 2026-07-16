<script setup lang="ts">
import { Delete, Plus } from '@element-plus/icons-vue'
import AppTopbar from '../../components/AppTopbar.vue'
import ManagementTree from './ManagementTree.vue'
import { typeForm, typeTree } from './data'
</script>

<template>
  <main class="equipment-page">
    <AppTopbar />
    <section class="equipment-content">
      <div class="equipment-stack">
        <div class="equipment-breadcrumb">设备管理 &gt; 设备类型管理</div>
        <section class="management-layout">
          <ManagementTree title="类型信息" :items="typeTree" />

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
                  <span>上级类型编号</span>
                  <input :value="typeForm.parentCode" readonly />
                </label>
                <label>
                  <span>上级类型名称</span>
                  <input :value="typeForm.parentName" readonly />
                </label>
                <label class="required">
                  <span>类型编号</span>
                  <input :value="typeForm.code" />
                </label>
                <label class="required">
                  <span>类型名称</span>
                  <input :value="typeForm.name" />
                </label>
                <label class="required">
                  <span>排序</span>
                  <input :value="typeForm.sort" />
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
