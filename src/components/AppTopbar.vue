<script setup lang="ts">
import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ArrowDown, Bell } from '@element-plus/icons-vue'
import { useAuthStore } from '../stores/auth'
import logoUrl from '../assets/logo.ico'

const route = useRoute()
const router = useRouter()
const authStore = useAuthStore()

const siteMenuItems = [
  { label: '现场监控', path: '/site/monitor' },
  { label: '风险识别设置', path: '/site/risk-settings' },
  { label: 'AI风险识别与处理', path: '/site/ai-risks' }
]

const equipmentMenuItems = [
  { label: '总览', path: '/equipment/overview' },
  { label: '塔吊监测分析', path: '/equipment/tower-crane' },
  { label: '升降机监测分析', path: '/equipment/elevator' },
  { label: '高支模监测分析', path: '/equipment/formwork' },
  { label: '深基坑监测分析', path: '/equipment/deep-pit' },
  { label: '设备上下线记录', path: '/equipment/online-records' },
  { label: '监测报警记录', path: '/equipment/alarms' }
]

const environmentMenuItems = [
  { label: '环境实时监测', path: '/environment/realtime' },
  { label: '环境监测历史数据', path: '/environment/history' },
  { label: '喷淋任务', path: '/environment/spray-tasks' },
  { label: '自动喷淋记录', path: '/environment/spray-records' },
  { label: '环境监测报警记录', path: '/environment/alarms' }
]

const isSiteActive = computed(() => route.path.startsWith('/site'))
const isEquipmentActive = computed(() => route.path.startsWith('/equipment'))
const isEnvironmentActive = computed(() => route.path.startsWith('/environment'))

function goHome() {
  router.push('/')
}

function handleSiteCommand(path: string) {
  router.push(path)
}

function handleEquipmentCommand(path: string) {
  router.push(path)
}

function handleEnvironmentCommand(path: string) {
  router.push(path)
}

function handleLogout() {
  authStore.logout()
  router.replace('/login')
}
</script>

<template>
  <header class="app-topbar">
    <button class="system-brand" type="button" title="建筑安全智能监控平台" @click="goHome">
      <img :src="logoUrl" alt="BuildGuard" />
      <span>
        <strong>建筑安全智能监控平台</strong>
        <em>Intelligent Building Safety Monitoring Platform</em>
      </span>
    </button>

    <nav class="topnav" aria-label="主导航">
      <button :class="{ active: route.path === '/' }" type="button" @click="goHome">
        首页
      </button>

      <el-dropdown
        popper-class="site-nav-popper"
        trigger="click"
        @command="handleSiteCommand"
      >
        <button :class="{ active: isSiteActive }" class="nav-dropdown" type="button">
          施工场地
          <el-icon>
            <ArrowDown />
          </el-icon>
        </button>
        <template #dropdown>
          <el-dropdown-menu>
            <el-dropdown-item
              v-for="item in siteMenuItems"
              :key="item.path"
              :class="{ 'is-current': route.path === item.path }"
              :command="item.path"
              :title="item.label"
            >
              {{ item.label }}
            </el-dropdown-item>
          </el-dropdown-menu>
        </template>
      </el-dropdown>

      <el-dropdown
        popper-class="site-nav-popper"
        trigger="click"
        @command="handleEquipmentCommand"
      >
        <button :class="{ active: isEquipmentActive }" class="nav-dropdown" type="button">
          施工设备
          <el-icon>
            <ArrowDown />
          </el-icon>
        </button>
        <template #dropdown>
          <el-dropdown-menu>
            <el-dropdown-item
              v-for="item in equipmentMenuItems"
              :key="item.path"
              :class="{ 'is-current': route.path === item.path }"
              :command="item.path"
              :title="item.label"
            >
              {{ item.label }}
            </el-dropdown-item>
          </el-dropdown-menu>
        </template>
      </el-dropdown>
      <el-dropdown
        popper-class="site-nav-popper"
        trigger="click"
        @command="handleEnvironmentCommand"
      >
        <button :class="{ active: isEnvironmentActive }" class="nav-dropdown" type="button">
          施工环境
          <el-icon>
            <ArrowDown />
          </el-icon>
        </button>
        <template #dropdown>
          <el-dropdown-menu>
            <el-dropdown-item
              v-for="item in environmentMenuItems"
              :key="item.path"
              :class="{ 'is-current': route.path === item.path }"
              :command="item.path"
              :title="item.label"
            >
              {{ item.label }}
            </el-dropdown-item>
          </el-dropdown-menu>
        </template>
      </el-dropdown>
      <button type="button">
        设备管理
        <el-icon>
          <ArrowDown />
        </el-icon>
      </button>
      <button type="button">
        监测配置
        <el-icon>
          <ArrowDown />
        </el-icon>
      </button>
    </nav>

    <div class="top-actions">
      <el-button circle text>
        <el-icon>
          <Bell />
        </el-icon>
      </el-button>
      <button class="user-menu" type="button" title="退出登录" @click="handleLogout">
        <span>{{ authStore.user?.name?.slice(0, 1) || '管' }}</span>
        <el-icon>
          <ArrowDown />
        </el-icon>
      </button>
    </div>
  </header>
</template>

<style scoped>
.app-topbar {
  display: grid;
  grid-template-columns: 280px 1fr auto;
  gap: 18px;
  align-items: center;
  height: 54px;
  min-height: 54px;
  padding: 0 22px;
  color: #e5edf7;
  background: #314768;
  box-shadow: 0 2px 12px rgba(15, 23, 42, 0.12);
}

.system-brand {
  display: flex;
  gap: 10px;
  align-items: center;
  min-width: 0;
  padding: 0;
  color: inherit;
  text-align: left;
  cursor: pointer;
  background: transparent;
  border: 0;
}

.system-brand img {
  width: 42px;
  height: 42px;
  object-fit: cover;
  background: #fff;
  border-radius: 7px;
  box-shadow: inset 0 0 0 1px rgba(226, 232, 240, 0.9);
}

.system-brand span {
  display: grid;
  gap: 4px;
  min-width: 0;
}

.system-brand strong {
  overflow: hidden;
  font-size: 15px;
  letter-spacing: 0.04em;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.system-brand em {
  overflow: hidden;
  color: #d5deeb;
  font-size: 10px;
  font-style: normal;
  font-weight: 700;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.topnav {
  display: flex;
  gap: 10px;
  align-items: center;
  min-width: 0;
}

.topnav button {
  display: inline-flex;
  gap: 4px;
  align-items: center;
  height: 34px;
  padding: 0 8px;
  color: #e5edf7;
  font-size: 14px;
  font-weight: 700;
  cursor: pointer;
  background: transparent;
  border: 0;
  border-bottom: 2px solid transparent;
}

.topnav button.active {
  color: #fff;
  border-bottom-color: #fbbf24;
}

.topnav button:focus-visible,
.system-brand:focus-visible,
.user-menu:focus-visible {
  outline: 2px solid rgba(251, 191, 36, 0.86);
  outline-offset: 4px;
}

:global(.site-nav-popper.el-popper) {
  overflow: hidden;
  background: #fff;
  border: 1px solid #dfe6f1;
  border-radius: 8px;
  box-shadow: 0 16px 36px rgba(15, 23, 42, 0.16);
}

:global(.site-nav-popper .el-popper__arrow) {
  display: none;
}

:global(.site-nav-popper .el-dropdown-menu) {
  min-width: 172px;
  padding: 6px;
  border: 0;
  box-shadow: none;
}

:global(.site-nav-popper .el-dropdown-menu__item) {
  position: relative;
  box-sizing: border-box;
  height: 38px;
  padding: 0 14px;
  color: #334155;
  font-size: 14px;
  font-weight: 700;
  line-height: 38px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  border: 1px solid transparent;
  border-radius: 6px;
  outline: none !important;
  box-shadow: none !important;
}

:global(.site-nav-popper .el-dropdown-menu__item.is-current) {
  color: #1f2937;
  background: #f8fafc;
}

:global(.site-nav-popper .el-dropdown-menu__item.is-current::before) {
  position: absolute;
  left: 7px;
  top: 9px;
  width: 3px;
  height: 20px;
  content: "";
  background: #fbbf24;
  border-radius: 999px;
}

:global(.site-nav-popper .el-dropdown-menu__item:hover),
:global(.site-nav-popper .el-dropdown-menu__item:focus) {
  color: #1d4ed8;
  background: #e8f1ff;
  border-color: #a8c7ff;
  box-shadow: inset 0 0 0 1px #d7e6ff !important;
}

:global(.site-nav-popper .el-dropdown-menu__item:hover::before),
:global(.site-nav-popper .el-dropdown-menu__item:focus::before) {
  background: #3b82f6;
}

.top-actions {
  display: flex;
  gap: 10px;
  align-items: center;
}

.user-menu {
  display: inline-flex;
  gap: 6px;
  align-items: center;
  color: #e5edf7;
  cursor: pointer;
  background: transparent;
  border: 0;
}

.user-menu span {
  display: grid;
  width: 34px;
  height: 34px;
  place-items: center;
  color: #314768;
  font-weight: 800;
  background: linear-gradient(135deg, #f8fafc, #fbbf24);
  border-radius: 50%;
}

@media (max-width: 920px) {
  .app-topbar {
    grid-template-columns: 1fr auto;
  }

  .topnav {
    display: none;
  }
}

@media (max-width: 560px) {
  .app-topbar {
    padding: 0 16px;
  }

  .system-brand strong {
    font-size: 15px;
  }

  .system-brand em {
    display: none;
  }
}
</style>
