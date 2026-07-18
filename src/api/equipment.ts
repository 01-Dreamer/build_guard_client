import { get, type PageResult } from './http'

export interface EquipmentMetric {
  label: string
  value: string | number
  unit?: string | null
}

export interface EquipmentInfoItem {
  label: string
  value: string | number
}

export interface EquipmentRealtimePoint {
  time?: string | null
  [key: string]: string | number | null | undefined
}

export interface EquipmentDashboard {
  devices?: Array<{ id?: number; name: string; code: string; onlineStatus?: number | string | null }>
  info?: EquipmentInfoItem[]
  workMetrics?: EquipmentMetric[]
  realtimeMetrics?: EquipmentMetric[]
  alarmSummary?: {
    todayWarnings?: number
    totalWarnings?: number
    todayAlarms?: number
    totalAlarms?: number
  }
  telemetry?: EquipmentRealtimePoint[]
  monitorRows?: Array<{
    name: string
    value: string | number
    unit?: string | null
    time?: string | null
    alert?: boolean
  }>
  settlementRows?: Array<{
    time: string
    value: string | number
    status?: string | null
  }>
}

interface BackendMetric {
  code: string
  name: string
  value: number | string
  unit?: string | null
  status?: string | null
}

interface BackendChartPoint {
  time?: string | null
  values?: Record<string, number | string | null>
}

interface BackendDeviceCard {
  id?: number
  name: string
  code: string
  onlineStatus?: number | string | null
  metrics?: BackendMetric[]
}

interface BackendDeviceMonitor {
  device?: BackendDeviceCard
  realtime?: BackendMetric[]
  trend?: BackendChartPoint[]
  workStats?: Array<{
    startTime?: string | null
    endTime?: string | null
    maxWeight?: number | null
    maxHeight?: number | null
    maxMoment?: number | null
    maxWindSpeed?: number | null
  }>
}

function metricLabel(metric: BackendMetric) {
  return metric.name || metric.code
}

function toMetric(metric: BackendMetric): EquipmentMetric {
  return {
    label: metricLabel(metric),
    value: metric.value,
    unit: metric.unit
  }
}

function toTelemetryPoint(point: BackendChartPoint): EquipmentRealtimePoint {
  return {
    time: point.time,
    ...(point.values || {})
  }
}

function formatDuration(start?: string | null, end?: string | null) {
  if (!start || !end) return '-'
  const minutes = Math.max(0, Math.round((Date.parse(end) - Date.parse(start)) / 60000))
  return Number.isFinite(minutes) ? minutes : '-'
}

function transformDashboard(result: PageResult<BackendDeviceMonitor>): EquipmentDashboard {
  const first = result.records[0]
  const realtime = first?.realtime || first?.device?.metrics || []
  const latest = first?.trend?.at(-1)
  const latestTime = latest?.time || null
  const work = first?.workStats?.[0]
  const devices = result.records
    .map((record) => record.device)
    .filter((device): device is BackendDeviceCard => Boolean(device))

  return {
    devices,
    info: first?.device?.metrics?.slice(0, 8).map(toMetric) || realtime.slice(0, 8).map(toMetric),
    workMetrics: work
      ? [
          { label: '工作时长', value: formatDuration(work.startTime, work.endTime), unit: 'min' },
          { label: '最大吊重', value: work.maxWeight ?? '-', unit: 'T' },
          { label: '最大高度', value: work.maxHeight ?? '-', unit: 'm' },
          { label: '最大力矩', value: work.maxMoment ?? '-', unit: 'kN.m' },
          { label: '最大风速', value: work.maxWindSpeed ?? '-', unit: 'm/s' }
        ]
      : realtime.slice(0, 5).map(toMetric),
    realtimeMetrics: realtime.map(toMetric),
    alarmSummary: {
      todayWarnings: 0,
      totalWarnings: 0,
      todayAlarms: 0,
      totalAlarms: 0
    },
    telemetry: (first?.trend || []).map(toTelemetryPoint),
    monitorRows: realtime.map((metric) => ({
      name: metricLabel(metric),
      value: metric.value,
      unit: metric.unit,
      time: latestTime,
      alert: metric.status === 'warn' || metric.status === 'alarm'
    })),
    settlementRows: (first?.trend || []).map((point) => ({
      time: point.time || '-',
      value: point.values?.settlement ?? '-',
      status: Number(point.values?.settlement || 0) >= 5 ? '报警' : '正常'
    }))
  }
}

export function getTowerCraneDashboard(deviceCode?: string) {
  return get<PageResult<BackendDeviceMonitor>>('/construction-devices/tower-cranes', { deviceCode }).then(transformDashboard)
}

export function getElevatorDashboard(deviceCode?: string) {
  return get<PageResult<BackendDeviceMonitor>>('/construction-devices/elevators', { deviceCode }).then(transformDashboard)
}

export function getFormworkDashboard(deviceCode?: string) {
  return get<PageResult<BackendDeviceMonitor>>('/construction-devices/formworks', { deviceCode }).then(transformDashboard)
}

export function getDeepPitDashboard(deviceCode?: string) {
  return get<PageResult<BackendDeviceMonitor>>('/construction-devices/deep-pits', { deviceCode }).then(transformDashboard)
}

export function listEquipmentWorkRecords<T>(type: string, query: object = {}) {
  return get<PageResult<T>>(`/equipment/${type}/work-records`, query)
}
