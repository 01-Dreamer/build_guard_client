import type { Component } from 'vue'
import {
  Bell,
  DataAnalysis,
  Location,
  OfficeBuilding,
  SetUp,
  SwitchButton,
  Tools
} from '@element-plus/icons-vue'

export interface EquipmentMenuItem {
  label: string
  path: string
  icon: Component
}

export interface EquipmentDevice {
  name: string
  code: string
  type: string
  area: string
  online: boolean
  x: number
  y: number
  warning: number
  alarm: number
}

export const equipmentMenuItems: EquipmentMenuItem[] = [
  { label: '总览', path: '/equipment/overview', icon: DataAnalysis },
  { label: '塔吊监测分析', path: '/equipment/tower-crane', icon: Tools },
  { label: '升降机监测分析', path: '/equipment/elevator', icon: SetUp },
  { label: '高支模监测分析', path: '/equipment/formwork', icon: OfficeBuilding },
  { label: '深基坑监测分析', path: '/equipment/deep-pit', icon: Location },
  { label: '设备上下线记录', path: '/equipment/online-records', icon: SwitchButton },
  { label: '监测报警记录', path: '/equipment/alarms', icon: Bell }
]

export function statusClass(status: string) {
  if (status === '在线' || status === '已处理') return 'good'
  if (status === '处理中') return 'warning'
  return 'danger'
}
