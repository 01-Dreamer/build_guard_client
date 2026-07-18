<script setup lang="ts">
import { computed, onMounted, reactive, ref } from 'vue'
import { ElMessage } from 'element-plus'
import {
  listEnvironmentMonitorRules,
  updateMonitorRule,
  type EnvironmentMonitorRule,
  type MonitorRulePayload
} from '../../api/monitor'
import AppTopbar from '../../components/AppTopbar.vue'
import ManagementTree from '../device-management/ManagementTree.vue'
import { type TreeItem } from '../device-management/data'

const rules = ref<EnvironmentMonitorRule[]>([])
const activeId = ref<number | null>(null)
const saving = ref(false)
const environmentConfigForm = reactive<MonitorRulePayload & { code: string; unit: string }>({
  warnUpper: null,
  warnLower: null,
  alarmUpper: null,
  alarmLower: null,
  ruleEnabled: 1,
  code: '',
  unit: ''
})

const environmentConfigTree = computed<TreeItem[]>(() =>
  rules.value.map((rule, index) => ({
    id: rule.id,
    label: rule.name || rule.code || '-',
    active: activeId.value ? rule.id === activeId.value : index === 0
  }))
)

function applyRule(rule?: EnvironmentMonitorRule) {
  if (!rule) {
    activeId.value = null
    environmentConfigForm.warnUpper = null
    environmentConfigForm.warnLower = null
    environmentConfigForm.alarmUpper = null
    environmentConfigForm.alarmLower = null
    environmentConfigForm.ruleEnabled = 1
    environmentConfigForm.code = ''
    environmentConfigForm.unit = ''
    return
  }
  activeId.value = rule.id ?? null
  environmentConfigForm.warnUpper = rule.warningUpper ?? rule.warnUpper ?? null
  environmentConfigForm.warnLower = rule.warningLower ?? rule.warnLower ?? null
  environmentConfigForm.alarmUpper = rule.alarmUpper ?? null
  environmentConfigForm.alarmLower = rule.alarmLower ?? null
  environmentConfigForm.ruleEnabled = rule.ruleEnabled ?? 1
  environmentConfigForm.code = rule.code || ''
  environmentConfigForm.unit = rule.unit || ''
}

async function loadRules() {
  try {
    rules.value = await listEnvironmentMonitorRules()
    applyRule(rules.value[0])
  } catch {
    rules.value = []
    applyRule()
  }
}

function selectRule(item: TreeItem) {
  const rule = rules.value.find((rule) => rule.id === item.id)
  applyRule(rule)
}

async function saveRule() {
  if (!activeId.value) {
    ElMessage.warning('请选择环境监测项')
    return
  }
  saving.value = true
  try {
    await updateMonitorRule(activeId.value, {
      warnUpper: environmentConfigForm.warnUpper === '' ? null : environmentConfigForm.warnUpper,
      warnLower: environmentConfigForm.warnLower === '' ? null : environmentConfigForm.warnLower,
      alarmUpper: environmentConfigForm.alarmUpper === '' ? null : environmentConfigForm.alarmUpper,
      alarmLower: environmentConfigForm.alarmLower === '' ? null : environmentConfigForm.alarmLower,
      ruleEnabled: Number(environmentConfigForm.ruleEnabled ?? 1)
    })
    ElMessage.success('环境监测阈值已保存')
    await loadRules()
  } finally {
    saving.value = false
  }
}

onMounted(loadRules)
</script>

<template>
  <main class="equipment-page">
    <AppTopbar />
    <section class="equipment-content">
      <div class="equipment-stack">
        <div class="equipment-breadcrumb">监测配置 &gt; 环境监测管理</div>

        <section class="management-layout monitor-config-management">
          <ManagementTree title="环境信息" :items="environmentConfigTree" @select="selectRule" />

          <section class="management-main">
            <article class="form-card monitor-config-form-card">
              <h2>报警配置信息</h2>
              <form class="management-form" @submit.prevent="saveRule">
                <label class="required">
                  <span>预警上限阈值</span>
                  <input v-model="environmentConfigForm.warnUpper" type="number" step="0.01" />
                </label>
                <label class="required">
                  <span>预警下限阈值</span>
                  <input v-model="environmentConfigForm.warnLower" type="number" step="0.01" />
                </label>
                <label class="required">
                  <span>报警上限阈值</span>
                  <input v-model="environmentConfigForm.alarmUpper" type="number" step="0.01" />
                </label>
                <label class="required">
                  <span>报警下限阈值</span>
                  <input v-model="environmentConfigForm.alarmLower" type="number" step="0.01" />
                </label>
                <label class="required">
                  <span>设备数据编码</span>
                  <input v-model="environmentConfigForm.code" readonly />
                </label>
                <label class="required">
                  <span>单位</span>
                  <input v-model="environmentConfigForm.unit" readonly />
                </label>
                <label class="required">
                  <span>启用状态</span>
                  <select v-model.number="environmentConfigForm.ruleEnabled">
                    <option :value="1">启用</option>
                    <option :value="0">禁用</option>
                  </select>
                </label>
                <div class="form-save-row">
                  <button class="primary-btn" type="submit" :disabled="saving">保存</button>
                </div>
              </form>
            </article>
          </section>
        </section>
      </div>
    </section>
  </main>
</template>

<style scoped>
.monitor-config-management .management-main {
  overflow: auto;
}

.monitor-config-form-card {
  max-width: 820px;
}

.management-form {
  gap: 16px 18px;
}

.management-form input,
.management-form select {
  min-width: 0;
}

@media (max-width: 760px) {
  .management-form {
    grid-template-columns: 1fr;
  }
}
</style>
