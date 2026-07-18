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

const deviceManagementMenuItems = [
  { label: '设备类型管理', path: '/device-management/types' },
  { label: '设备位置管理', path: '/device-management/locations' },
  { label: '设备管理', path: '/device-management/devices' }
]

const monitorConfigMenuItems = [
  { label: '设备监测点管理', path: '/monitor-config/points' },
  { label: '环境监测管理', path: '/monitor-config/environment' }
]

const personnelMenuItems = [
  { label: '人员信息', path: '/personnel/info' },
  { label: '违规处理', path: '/personnel/violations' }
]

const isSiteActive = computed(() => route.path.startsWith('/site'))
const isEquipmentActive = computed(() => route.path.startsWith('/equipment'))
const isEnvironmentActive = computed(() => route.path.startsWith('/environment'))
const isDeviceManagementActive = computed(() => route.path.startsWith('/device-management'))
const isMonitorConfigActive = computed(() => route.path.startsWith('/monitor-config'))
const isPersonnelActive = computed(() => route.path.startsWith('/personnel'))

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

function handleDeviceManagementCommand(path: string) {
  router.push(path)
}

function handleMonitorConfigCommand(path: string) {
  router.push(path)
}

function handlePersonnelCommand(path: string) {
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
      <el-dropdown
        popper-class="site-nav-popper"
        trigger="click"
        @command="handleDeviceManagementCommand"
      >
        <button :class="{ active: isDeviceManagementActive }" class="nav-dropdown" type="button">
          设备管理
          <el-icon>
            <ArrowDown />
          </el-icon>
        </button>
        <template #dropdown>
          <el-dropdown-menu>
            <el-dropdown-item
              v-for="item in deviceManagementMenuItems"
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
        @command="handleMonitorConfigCommand"
      >
        <button :class="{ active: isMonitorConfigActive }" class="nav-dropdown" type="button">
          监测配置
          <el-icon>
            <ArrowDown />
          </el-icon>
        </button>
        <template #dropdown>
          <el-dropdown-menu>
            <el-dropdown-item
              v-for="item in monitorConfigMenuItems"
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
        @command="handlePersonnelCommand"
      >
        <button :class="{ active: isPersonnelActive }" class="nav-dropdown" type="button">
          人员管理
          <el-icon>
            <ArrowDown />
          </el-icon>
        </button>
        <template #dropdown>
          <el-dropdown-menu>
            <el-dropdown-item
              v-for="item in personnelMenuItems"
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
  grid-template-columns: minmax(260px, 310px) minmax(0, 1fr) auto;
  gap: 18px;
  align-items: center;
  height: 58px;
  min-height: 58px;
  padding: 0 24px;
  color: #e5edf7;
  background: linear-gradient(180deg, #2f4a70 0%, #253d5f 100%);
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  box-shadow: 0 10px 26px rgba(28, 45, 78, 0.2);
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
  width: 40px;
  height: 40px;
  object-fit: cover;
  background: #fff;
  border-radius: 8px;
  box-shadow: inset 0 0 0 1px rgba(226, 232, 240, 0.9);
}

.system-brand span {
  display: grid;
  gap: 4px;
  min-width: 0;
}

.system-brand strong {
  overflow: hidden;
  font-size: 16px;
  letter-spacing: 0;
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
  gap: 6px;
  align-items: center;
  min-width: 0;
  overflow-x: auto;
  overflow-y: hidden;
  scrollbar-width: none;
}

.topnav::-webkit-scrollbar {
  display: none;
}

.topnav button {
  display: inline-flex;
  gap: 5px;
  flex: 0 0 auto;
  align-items: center;
  height: 36px;
  padding: 0 11px;
  color: rgba(229, 237, 247, 0.88);
  font-size: 14px;
  font-weight: 800;
  line-height: 1;
  white-space: nowrap;
  cursor: pointer;
  background: rgba(255, 255, 255, 0.02);
  border: 0;
  border-radius: 8px;
}

.topnav button.active {
  color: #fff;
  background: rgba(255, 255, 255, 0.14);
  box-shadow: inset 0 0 0 1px rgba(255, 255, 255, 0.1);
}

.topnav button:hover {
  color: #fff;
  background: rgba(255, 255, 255, 0.1);
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
  min-width: max-content;
}

.top-actions :deep(.el-button.is-text) {
  color: rgba(229, 237, 247, 0.9);
}

.top-actions :deep(.el-button.is-text:hover) {
  color: #fff;
  background: rgba(255, 255, 255, 0.12);
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
  width: 36px;
  height: 36px;
  place-items: center;
  color: #244b86;
  font-weight: 800;
  background: #f8fafc;
  border-radius: 50%;
  box-shadow: 0 0 0 3px rgba(255, 255, 255, 0.08);
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
    grid-template-columns: minmax(0, 1fr) auto;
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
