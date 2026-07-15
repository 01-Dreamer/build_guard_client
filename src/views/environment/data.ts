import type { Component } from 'vue'
import {
  Bell,
  Clock,
  DataAnalysis,
  Document,
  MagicStick,
  Monitor,
  Operation
} from '@element-plus/icons-vue'

export interface EnvironmentMenuItem {
  label: string
  path: string
  icon: Component
}

export interface HistoryRecord {
  id: number
  code: string
  name: string
  value: string
  unit: string
  upper: string
  lower: string
  time: string
}

export interface SprayTask {
  id: number
  name: string
  startTime: string
  duration: number
  cycle: number
  unit: string
  status: '启动' | '停止'
  nextTime: string
}

export interface SprayRecord {
  id: number
  device: string
  location: string
  action: '开启' | '停止'
  reason: string
  time: string
}

export interface EnvAlarmRecord {
  id: number
  type: '预警' | '报警'
  content: string
  value: string
  unit: string
  upper: string
  lower: string
  time: string
  status: '未处理' | '处理中' | '已处理'
}

export const environmentMenuItems: EnvironmentMenuItem[] = [
  { label: '环境实时监测', path: '/environment/realtime', icon: Monitor },
  { label: '环境监测历史数据', path: '/environment/history', icon: DataAnalysis },
  { label: '喷淋任务', path: '/environment/spray-tasks', icon: MagicStick },
  { label: '自动喷淋记录', path: '/environment/spray-records', icon: Operation },
  { label: '环境监测报警记录', path: '/environment/alarms', icon: Bell }
]

export const realtimeMetrics = [
  { label: '温度', value: '9.08', tone: '#22c55e', icon: Clock },
  { label: '湿度', value: '32.39', tone: '#60a5fa', icon: Monitor },
  { label: '风速', value: '10.71', tone: '#fbbf24', icon: MagicStick },
  { label: '噪声', value: '62.36', tone: '#38bdf8', icon: DataAnalysis },
  { label: '风向', value: '200', tone: '#38bdf8', icon: Operation },
  { label: '气压', value: '995.5', tone: '#f59e0b', icon: Document }
]

export const sprayStopLogs = [
  { device: '环境监测传感器#12', status: '异常', time: '2025-11-24 10:18:39' },
  { device: '环境监测传感器#12', status: '关闭', time: '2025-11-13 16:56:40' },
  { device: '环境监测传感器#12', status: '异常', time: '2025-11-06 15:30:45' },
  { device: '环境监测传感器#12', status: '关闭', time: '2025-11-06 15:20:38' },
  { device: '环境监测传感器#12', status: '关闭', time: '2025-11-06 15:18:14' },
  { device: '环境监测传感器#12', status: '异常', time: '2025-11-05 17:17:24' },
  { device: '环境监测传感器#12', status: '异常', time: '2025-10-29 16:51:19' }
]

export const historyRecords: HistoryRecord[] = [
  { id: 1, code: 'pm25', name: 'PM2.5', value: '100', unit: 'ug/m', upper: '100', lower: '50', time: '2025-09-24 14:00:00' },
  { id: 2, code: 'pm10', name: 'PM10', value: '145.66375', unit: 'μg/m³', upper: '500', lower: '20', time: '2025-09-24 14:00:00' },
  { id: 3, code: 'noise', name: '噪音', value: '53.99', unit: 'dB', upper: '60', lower: '0', time: '2025-09-24 14:00:00' },
  { id: 4, code: 'temp', name: '温度', value: '11.98375', unit: '℃', upper: '40', lower: '5', time: '2025-09-24 14:00:00' },
  { id: 5, code: 'humi', name: '湿度', value: '63.8675', unit: '% RH', upper: '70', lower: '30', time: '2025-09-24 14:00:00' },
  { id: 6, code: 'windDir', name: '风向', value: '140.625', unit: '°', upper: '25', lower: '8', time: '2025-09-24 14:00:00' },
  { id: 7, code: 'windSpeed', name: '风速', value: '4.66125', unit: 'm/s', upper: '8', lower: '0', time: '2025-09-24 14:00:00' },
  { id: 8, code: 'tsp', name: 'TSP', value: '246.585', unit: 'μg/m³', upper: '100', lower: '0', time: '2025-09-24 14:00:00' },
  { id: 9, code: 'airPres', name: '气压', value: '1008.89125', unit: 'hPa', upper: '12005', lower: '30', time: '2025-09-24 14:00:00' },
  { id: 10, code: 'pm25', name: 'PM2.5', value: '43.6275', unit: 'ug/m', upper: '100', lower: '50', time: '2025-09-24 14:00:00' }
]

export const sprayTasks: SprayTask[] = [
  { id: 1, name: '西区大门喷淋', startTime: '2025-10-02 16:45:24', duration: 27, cycle: 1, unit: 'WEEKS', status: '启动', nextTime: '2025-10-10 15:19:28' },
  { id: 2, name: '东区每日定期喷淋', startTime: '2025-09-03 16:45:24', duration: 10, cycle: 2, unit: 'MONTHS', status: '停止', nextTime: '2025-10-05 16:45:24' },
  { id: 3, name: '西区东侧外墙', startTime: '2025-09-30 12:00:00', duration: 60, cycle: 2, unit: 'HOURS', status: '启动', nextTime: '2025-10-10 12:23:00' },
  { id: 4, name: '东区每日定期喷淋222', startTime: '2025-09-25 16:45:24', duration: 10, cycle: 10, unit: 'DAYS', status: '停止', nextTime: '2025-09-25 16:45:21' },
  { id: 5, name: '东门喷淋任务', startTime: '2025-11-25 14:36:00', duration: 30, cycle: 3, unit: 'DAYS', status: '启动', nextTime: '2025-12-20 14:37:00' }
]

export const sprayRecords: SprayRecord[] = [
  { id: 1, device: '环境监测传感器#12', location: '青银高速以东改造项目', action: '停止', reason: '喷淋执行失败，设备ID：366,设备名：环境监测传感器#12，原因：设备离线', time: '2025-11-24 10:18:39' },
  { id: 2, device: '环境监测传感器#12', location: '青银高速以东改造项目', action: '停止', reason: '设备id为366 监测数据超喷淋上限值，开启喷淋操作', time: '2025-11-13 16:56:40' },
  { id: 3, device: '环境监测传感器#12', location: '青银高速以东改造项目', action: '停止', reason: '喷淋执行失败，设备ID：366,设备名：环境监测传感器#12，原因：设备离线', time: '2025-11-06 15:30:45' },
  { id: 4, device: '环境监测传感器#12', location: '青银高速以东改造项目', action: '停止', reason: '设备id为366 监测数据超喷淋上限值，开启喷淋操作', time: '2025-11-06 15:20:38' },
  { id: 5, device: '环境监测传感器#12', location: '青银高速以东改造项目', action: '停止', reason: '设备id为366 监测数据超喷淋上限值，开启喷淋操作', time: '2025-11-06 15:18:14' },
  { id: 6, device: '环境监测传感器#12', location: '青银高速以东改造项目', action: '停止', reason: '喷淋执行失败，设备ID：366,设备名：环境监测传感器#12，原因：设备离线', time: '2025-11-05 17:17:24' },
  { id: 7, device: '环境监测传感器#12', location: '青银高速以东改造项目', action: '停止', reason: '喷淋执行失败，设备ID：366,设备名：环境监测传感器#12，原因：设备离线', time: '2025-10-29 16:51:19' },
  { id: 8, device: '环境监测传感器#12', location: '青银高速以东改造项目', action: '停止', reason: '设备id为366 监测数据超喷淋上限值，开启喷淋操作', time: '2025-10-29 16:27:23' },
  { id: 9, device: '环境监测传感器#12', location: '青银高速以东改造项目', action: '停止', reason: '喷淋执行失败，设备ID：366,设备名：环境监测传感器#12，原因：设备离线', time: '2025-10-29 16:26:02' },
  { id: 10, device: '环境监测传感器#12', location: '青银高速以东改造项目', action: '停止', reason: '喷淋执行失败，设备ID：366,设备名：环境监测传感器#12，原因：设备离线', time: '2025-10-29 16:11:51' }
]

export const envAlarmRecords: EnvAlarmRecord[] = [
  { id: 1, type: '预警', content: '噪音报警', value: '64.01', unit: 'dB', upper: '60', lower: '0', time: '2025-11-26 16:21:56', status: '未处理' },
  { id: 2, type: '预警', content: 'TSP报警', value: '354.45', unit: 'μg/m³', upper: '100', lower: '0', time: '2025-11-26 16:21:56', status: '未处理' },
  { id: 3, type: '预警', content: 'PM2.5报警', value: '21.23', unit: 'ug/m', upper: '100', lower: '50', time: '2025-11-26 16:21:56', status: '未处理' },
  { id: 4, type: '预警', content: 'PM10报警', value: '4.38', unit: 'μg/m³', upper: '500', lower: '20', time: '2025-11-26 16:21:56', status: '未处理' },
  { id: 5, type: '预警', content: '风向报警', value: '95.0', unit: '°', upper: '25', lower: '8', time: '2025-11-26 16:21:56', status: '未处理' },
  { id: 6, type: '预警', content: '温度报警', value: '13.68', unit: '℃', upper: '40', lower: '5', time: '2025-11-26 16:21:56', status: '未处理' },
  { id: 7, type: '预警', content: '气压报警', value: '991.08', unit: 'hPa', upper: '12005', lower: '30', time: '2025-11-26 16:21:56', status: '未处理' },
  { id: 8, type: '预警', content: '湿度报警', value: '22.25', unit: '% RH', upper: '70', lower: '30', time: '2025-11-26 16:21:56', status: '未处理' },
  { id: 9, type: '预警', content: '风速报警', value: '0.77', unit: 'm/s', upper: '8', lower: '0', time: '2025-11-26 16:21:56', status: '未处理' },
  { id: 10, type: '预警', content: '风速报警', value: '9.92', unit: 'm/s', upper: '8', lower: '0', time: '2025-11-24 10:48:48', status: '未处理' }
]

export function envStatusClass(status: string) {
  if (status === '启动' || status === '已处理') return 'good'
  if (status === '处理中') return 'warning'
  return 'danger'
}
