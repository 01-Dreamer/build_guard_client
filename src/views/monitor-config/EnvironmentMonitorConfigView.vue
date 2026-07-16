<script setup lang="ts">
import AppTopbar from '../../components/AppTopbar.vue'
import ManagementTree from '../device-management/ManagementTree.vue'
import { environmentConfigForm, environmentConfigTree } from './data'
</script>

<template>
  <main class="equipment-page">
    <AppTopbar />
    <section class="equipment-content">
      <div class="equipment-stack">
        <div class="equipment-breadcrumb">监测配置 &gt; 环境监测管理</div>

        <section class="management-layout monitor-config-management">
          <ManagementTree title="环境信息" :items="environmentConfigTree" />

          <section class="management-main">
            <article class="form-card monitor-config-form-card">
              <h2>报警配置信息</h2>
              <form class="management-form">
                <label class="required">
                  <span>预警上限阈值</span>
                  <input :value="environmentConfigForm.warningUpper" />
                </label>
                <label class="required">
                  <span>预警下限阈值</span>
                  <input :value="environmentConfigForm.warningLower" />
                </label>
                <label class="required">
                  <span>报警上限阈值</span>
                  <input :value="environmentConfigForm.alarmUpper" />
                </label>
                <label class="required">
                  <span>报警下限阈值</span>
                  <input :value="environmentConfigForm.alarmLower" />
                </label>
                <label class="required">
                  <span>设备数据编码</span>
                  <input :value="environmentConfigForm.code" />
                </label>
                <label class="required">
                  <span>单位</span>
                  <input :value="environmentConfigForm.unit" />
                </label>
                <div class="form-save-row">
                  <button class="primary-btn" type="button">保存</button>
                </div>
              </form>
            </article>
          </section>
        </section>
      </div>
    </section>
  </main>
</template>
