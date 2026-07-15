import { createRouter, createWebHistory, type RouteRecordRaw } from 'vue-router'
import { useAuthStore } from '../stores/auth'

const routes: RouteRecordRaw[] = [
  {
    path: '/',
    name: 'home',
    component: () => import('../views/DashboardView.vue')
  },
  {
    path: '/login',
    name: 'login',
    component: () => import('../views/LoginView.vue'),
    meta: {
      guestOnly: true
    }
  },
  {
    path: '/dashboard',
    redirect: '/'
  },
  {
    path: '/site',
    redirect: '/site/monitor'
  },
  {
    path: '/site/monitor',
    name: 'site-monitor',
    component: () => import('../views/site/SiteMonitorView.vue')
  },
  {
    path: '/site/risk-settings',
    name: 'site-risk-settings',
    component: () => import('../views/site/SiteRiskSettingsView.vue')
  },
  {
    path: '/site/ai-risks',
    name: 'site-ai-risks',
    component: () => import('../views/site/SiteAiRisksView.vue')
  },
  {
    path: '/equipment',
    redirect: '/equipment/overview'
  },
  {
    path: '/equipment/overview',
    name: 'equipment-overview',
    component: () => import('../views/equipment/EquipmentOverviewView.vue')
  },
  {
    path: '/equipment/tower-crane',
    name: 'equipment-tower-crane',
    component: () => import('../views/equipment/TowerCraneView.vue')
  },
  {
    path: '/equipment/elevator',
    name: 'equipment-elevator',
    component: () => import('../views/equipment/ElevatorView.vue')
  },
  {
    path: '/equipment/formwork',
    name: 'equipment-formwork',
    component: () => import('../views/equipment/FormworkView.vue')
  },
  {
    path: '/equipment/deep-pit',
    name: 'equipment-deep-pit',
    component: () => import('../views/equipment/DeepPitView.vue')
  },
  {
    path: '/equipment/online-records',
    name: 'equipment-online-records',
    component: () => import('../views/equipment/DeviceOnlineRecordsView.vue')
  },
  {
    path: '/equipment/alarms',
    name: 'equipment-alarms',
    component: () => import('../views/equipment/DeviceAlarmRecordsView.vue')
  },
  {
    path: '/environment',
    redirect: '/environment/realtime'
  },
  {
    path: '/environment/realtime',
    name: 'environment-realtime',
    component: () => import('../views/environment/EnvironmentRealtimeView.vue')
  },
  {
    path: '/environment/history',
    name: 'environment-history',
    component: () => import('../views/environment/EnvironmentHistoryView.vue')
  },
  {
    path: '/environment/spray-tasks',
    name: 'environment-spray-tasks',
    component: () => import('../views/environment/SprayTasksView.vue')
  },
  {
    path: '/environment/spray-records',
    name: 'environment-spray-records',
    component: () => import('../views/environment/AutoSprayRecordsView.vue')
  },
  {
    path: '/environment/alarms',
    name: 'environment-alarms',
    component: () => import('../views/environment/EnvironmentAlarmRecordsView.vue')
  },
  {
    path: '/:pathMatch(.*)*',
    redirect: '/'
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

router.beforeEach((to) => {
  const authStore = useAuthStore()

  if (to.meta.requiresAuth && !authStore.isAuthenticated) {
    return {
      path: '/login',
      query: { redirect: to.fullPath }
    }
  }

  if (to.meta.guestOnly && authStore.isAuthenticated) {
    const redirect = to.query.redirect
    return typeof redirect === 'string' ? redirect : '/'
  }

  return true
})

export default router
