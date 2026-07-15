import type { Component } from 'vue'
import {
  Bell,
  Connection,
  DataAnalysis,
  Histogram,
  Location,
  OfficeBuilding,
  Odometer,
  Search,
  SetUp,
  SwitchButton,
  Tools,
  TrendCharts,
  Warning
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

export interface InfoItem {
  label: string
  value: string
  tone?: 'blue' | 'green' | 'yellow' | 'red' | 'cyan'
}

export interface MonitorRow {
  name: string
  value: string
  unit: string
  time: string
  alert?: boolean
}

export interface TableRecord {
  id: number
  name: string
  code: string
  type: string
  time: string
  status: string
}

export interface AlarmRecord {
  id: number
  name: string
  type: string
  content: string
  value: string
  unit: string
  upper: string
  lower: string
  time: string
  status: '未处理' | '处理中' | '已处理'
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

export const overviewDevices: EquipmentDevice[] = [
  { name: '东区塔吊#1', code: 'TD-001', type: '塔吊', area: '东区主体楼', online: true, x: 66, y: 34, warning: 1, alarm: 0 },
  { name: '西区塔吊#2', code: 'TD-002', type: '塔吊', area: '西区商业楼', online: true, x: 43, y: 78, warning: 1, alarm: 2 },
  { name: '基坑塔吊#3', code: 'TD-003', type: '塔吊', area: '基坑南侧', online: true, x: 28, y: 66, warning: 0, alarm: 0 },
  { name: '东区一号升降机', code: 'TJ-019', type: '升降机', area: '东区外立面', online: false, x: 76, y: 51, warning: 0, alarm: 0 },
  { name: '基坑升降机#2', code: 'TJ-020', type: '升降机', area: '材料转运口', online: true, x: 55, y: 72, warning: 0, alarm: 1 },
  { name: '东区1#高支模', code: 'GZM-361', type: '高支模', area: '东区裙楼', online: true, x: 82, y: 76, warning: 9, alarm: 16 },
  { name: '东区1#深基坑', code: 'JK-362', type: '深基坑', area: '基坑东侧', online: true, x: 18, y: 58, warning: 7, alarm: 15 }
]

export const onlineRecords: TableRecord[] = [
  { id: 1, name: '东区1#深基坑', code: 'JK-362', type: '基坑监测', time: '2025-11-28 16:22:14', status: '离线' },
  { id: 2, name: '东区1#高支模', code: 'GZM-361', type: '高支模监测', time: '2025-11-28 16:14:40', status: '离线' },
  { id: 3, name: '西区塔吊#2', code: 'TD-002', type: '塔吊', time: '2025-11-28 11:16:42', status: '离线' },
  { id: 4, name: '东区一号升降机', code: 'TJ-019', type: '升降机', time: '2025-11-27 15:48:12', status: '离线' },
  { id: 5, name: '基坑塔吊#3', code: 'TD-003', type: '塔吊', time: '2025-11-27 11:49:20', status: '在线' },
  { id: 6, name: '西区2#深基坑', code: 'JK-365', type: '基坑监测', time: '2025-11-26 17:28:05', status: '在线' },
  { id: 7, name: '西区2#高支模', code: 'GZM-366', type: '高支模监测', time: '2025-11-26 16:39:44', status: '在线' },
  { id: 8, name: '基坑升降机#2', code: 'TJ-020', type: '升降机', time: '2025-11-26 14:17:36', status: '在线' },
  { id: 9, name: '东区塔吊#1', code: 'TD-001', type: '塔吊', time: '2025-11-26 10:28:33', status: '在线' },
  { id: 10, name: '材料转运升降机', code: 'TJ-021', type: '升降机', time: '2025-11-25 18:22:03', status: '离线' }
]

export const alarmRecords: AlarmRecord[] = [
  { id: 1, name: '东区1#深基坑', type: '1', content: '沉降值超下限报警', value: '8.92', unit: 'cm', upper: '--', lower: '--', time: '2025-11-28 16:22:18', status: '未处理' },
  { id: 2, name: '东区1#深基坑', type: '1', content: '沉降率超下限报警', value: '2.99', unit: 'mm/d', upper: '--', lower: '--', time: '2025-11-28 16:22:14', status: '未处理' },
  { id: 3, name: '东区1#深基坑', type: '1', content: '土压力超上限报警', value: '53.79', unit: 'kPa', upper: '--', lower: '--', time: '2025-11-28 16:22:14', status: '未处理' },
  { id: 4, name: '东区1#高支模', type: '2', content: '设备电量超上限报警', value: '78', unit: 'w/h', upper: '--', lower: '--', time: '2025-11-28 16:16:04', status: '处理中' },
  { id: 5, name: '东区1#高支模', type: '2', content: '沉降量超上限报警', value: '78', unit: 'mm', upper: '--', lower: '--', time: '2025-11-28 16:15:58', status: '未处理' },
  { id: 6, name: '西区塔吊#2', type: '3', content: '力矩超限报警', value: '927.50', unit: 'M·T', upper: '900', lower: '--', time: '2025-11-28 11:16:39', status: '已处理' },
  { id: 7, name: '东区一号升降机', type: '4', content: '运行状态超重报警', value: '926.93', unit: 'KG', upper: '900', lower: '--', time: '2025-11-27 15:33:51', status: '未处理' },
  { id: 8, name: '基坑升降机#2', type: '4', content: '倾斜角度超限报警', value: '8.48', unit: '°', upper: '8', lower: '--', time: '2025-11-27 15:32:33', status: '未处理' },
  { id: 9, name: '东区塔吊#1', type: '3', content: '吊重接近上限预警', value: '10.62', unit: 'T', upper: '11', lower: '--', time: '2025-11-26 10:28:44', status: '已处理' },
  { id: 10, name: '西区2#深基坑', type: '1', content: '应变拉力超上限报警', value: '184.79', unit: 'kN', upper: '180', lower: '--', time: '2025-11-25 17:42:09', status: '处理中' }
]

export const towerInfo: InfoItem[] = [
  { label: '设备名称', value: '西区塔吊#2', tone: 'blue' },
  { label: '设备编号', value: 'TD-002', tone: 'blue' },
  { label: '最大吊重', value: '11.0T', tone: 'cyan' },
  { label: '额定力矩', value: '11.0T·M', tone: 'green' },
  { label: '前臂长', value: '11.0米', tone: 'green' },
  { label: '后臂长', value: '11.0米', tone: 'yellow' },
  { label: '最大吊高', value: '12.0米', tone: 'red' },
  { label: '额定吊量', value: '11.0T', tone: 'red' }
]

export const elevatorInfo: InfoItem[] = [
  { label: '设备名称', value: '东区一号升降机', tone: 'blue' },
  { label: '设备编号', value: 'TJ-019', tone: 'blue' },
  { label: '额定载重', value: '44.0KG', tone: 'cyan' },
  { label: '额定速度', value: '46.0m/s', tone: 'green' },
  { label: '吊笼尺寸', value: '546.0', tone: 'green' },
  { label: '额定人数', value: '15', tone: 'yellow' },
  { label: '最大高度', value: '15.6m', tone: 'red' },
  { label: '基本高度', value: '65.0', tone: 'red' }
]

export const formworkRows: MonitorRow[] = [
  { name: '沉降量（mm）', value: '78', unit: 'mm', time: '2025-11-28 16:16:04', alert: true },
  { name: '设备电量', value: '78', unit: 'w/h', time: '2025-11-28 16:15:20', alert: true },
  { name: 'Y轴倾斜角度', value: '-0.01', unit: '°', time: '2025-11-28 16:16:01' },
  { name: '电池电量', value: '0.94', unit: '%', time: '2025-11-28 16:16:01', alert: true },
  { name: '压力值（kPa）', value: '6.21', unit: 'kPa', time: '2025-11-28 16:15:58', alert: true },
  { name: '传感器状态', value: '1', unit: '-', time: '2025-11-28 16:15:53', alert: true },
  { name: '倾斜状态', value: '1', unit: '-', time: '2025-11-28 16:15:48', alert: true },
  { name: 'X轴倾斜角度', value: '-0.04', unit: '°', time: '2025-11-28 16:15:57' }
]

export const pitRows: MonitorRow[] = [
  { name: '地下水位', value: '-2.88', unit: 'm', time: '2025-11-28 16:22:19' },
  { name: 'X轴倾角', value: '0.19', unit: '°', time: '2025-11-28 16:22:19' },
  { name: 'Y轴倾角', value: '0.06', unit: '°', time: '2025-11-28 16:22:19' },
  { name: '沉降值', value: '9.42', unit: 'cm', time: '2025-11-28 16:22:19', alert: true },
  { name: '应变拉力', value: '165.13', unit: 'kN', time: '2025-11-28 16:22:19', alert: true },
  { name: '沉降率', value: '2.28', unit: 'mm/d', time: '2025-11-28 16:22:19', alert: true },
  { name: '土压力', value: '45.02', unit: 'kPa', time: '2025-11-28 16:22:19', alert: true }
]

export const equipmentStats = [
  { label: '在线设备', value: '8', icon: Connection, tone: '#3b82f6' },
  { label: '报警总数', value: '0', icon: Warning, tone: '#22c55e' },
  { label: '预警总数', value: '0', icon: TrendCharts, tone: '#38bdf8' },
  { label: '设备总数', value: '10', icon: Odometer, tone: '#f59e0b' },
  { label: '今日吊次', value: '8次', icon: Histogram, tone: '#8b5cf6' },
  { label: '待处理', value: '6', icon: Search, tone: '#ef4444' }
]

export const chartTimes = ['11:16:21', '11:16:24', '11:16:27', '11:16:30', '11:16:33', '11:16:36', '11:16:39']

export function statusClass(status: string) {
  if (status === '在线' || status === '已处理') return 'good'
  if (status === '处理中') return 'warning'
  return 'danger'
}
