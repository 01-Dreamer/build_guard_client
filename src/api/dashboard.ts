import { get, type PageResult } from './http'

export interface DashboardMetric {
  label: string
  value: string | number
  unit?: string | null
}

export interface DashboardDeviceSummary {
  name: string
  total: number
  online: number
  alarms: number
}

export interface DashboardAlarm {
  id?: number
  content: string
  location?: string | null
  occurredAt?: string | null
  level?: string | null
  status?: string | number | null
}

export interface DashboardSprayLog {
  id?: number
  content: string
  mode?: string | null
  time?: string | null
}

export interface DashboardRiskStat {
  label: string
  value: number
}

export interface DashboardOverview {
  environmentMetrics?: DashboardMetric[]
  deviceSummaries?: DashboardDeviceSummary[]
  alarmRecords?: DashboardAlarm[]
  sprayLogs?: DashboardSprayLog[]
  riskStats?: DashboardRiskStat[]
}

interface BackendMetric {
  code: string
  name: string
  value: number
  unit?: string | null
  status?: string | null
}

interface BackendChartPoint {
  time: string
  values: Record<string, number>
}

interface BackendAlarm {
  id?: number
  alarmType?: string | null
  alarmLevel?: string | null
  deviceId?: number | null
  deviceName?: string | null
  deviceCode?: string | null
  monitorPointName?: string | null
  content?: string | null
  occurredAt?: string | null
  status?: string | number | null
}

interface BackendDashboardOverview {
  totalDevices?: number
  onlineDevices?: number
  openAlarms?: number
  aiRisks?: number
  environment?: BackendMetric[]
  alarmTrend?: BackendChartPoint[]
  latestAlarms?: BackendAlarm[]
}

interface BackendDeviceCard {
  id: number
  name: string
  code: string
  typeCode?: string | null
  typeName?: string | null
  onlineStatus?: number | null
}

interface BackendDeviceOverview {
  devices?: BackendDeviceCard[]
  latestAlarms?: BackendAlarm[]
}

interface BackendSprayRecord {
  id?: number
  sprayDeviceName?: string | null
  taskName?: string | null
  operationType?: string | null
  triggerType?: string | null
  startedAt?: string | null
}

const deviceTypeNames: Record<string, string> = {
  tower_crane: '塔吊',
  elevator: '升降机',
  formwork: '高支模',
  deep_pit: '深基坑'
}

function normalizeStatus(status?: string | number | null) {
  if (status === 2 || status === 'handled' || status === '已处理') return 2
  if (status === 1 || status === 'processing' || status === '处理中') return 1
  return 0
}

function buildDeviceSummaries(deviceOverview?: BackendDeviceOverview): DashboardDeviceSummary[] {
  const devices = deviceOverview?.devices || []
  const alarms = deviceOverview?.latestAlarms || []

  return Object.entries(deviceTypeNames).map(([typeCode, name]) => {
    const typeDevices = devices.filter((device) => device.typeCode === typeCode)
    const deviceIds = new Set(typeDevices.map((device) => device.id))
    return {
      name,
      total: typeDevices.length,
      online: typeDevices.filter((device) => device.onlineStatus === 1).length,
      alarms: alarms.filter((alarm) => alarm.deviceId && deviceIds.has(alarm.deviceId)).length
    }
  })
}

function buildRiskStats(overview: BackendDashboardOverview): DashboardRiskStat[] {
  const grouped = new Map<string, number>()
  ;(overview.latestAlarms || []).forEach((alarm) => {
    const key = alarm.alarmType === 'ai' ? 'AI检测预警' : alarm.content?.slice(0, 8) || alarm.alarmType || '报警'
    grouped.set(key, (grouped.get(key) || 0) + 1)
  })

  if (overview.aiRisks) {
    grouped.set('AI检测预警', Math.max(grouped.get('AI检测预警') || 0, overview.aiRisks))
  }
  if (overview.openAlarms && !grouped.size) {
    grouped.set('未处理报警', overview.openAlarms)
  }
  return Array.from(grouped.entries()).map(([label, value]) => ({ label, value }))
}

export function getDashboardOverview() {
  return Promise.all([
    get<BackendDashboardOverview>('/dashboard/overview'),
    get<BackendDeviceOverview>('/construction-devices/overview'),
    get<PageResult<BackendSprayRecord>>('/environment/spray-records', { page: 1, pageSize: 4 })
  ]).then(([overview, deviceOverview, sprayRecords]) => ({
    environmentMetrics: (overview.environment || []).map((metric) => ({
      label: metric.name,
      value: metric.value,
      unit: metric.unit
    })),
    deviceSummaries: buildDeviceSummaries(deviceOverview),
    alarmRecords: (overview.latestAlarms || []).map((alarm) => ({
      id: alarm.id,
      content: alarm.content || '-',
      location: alarm.deviceName || alarm.deviceCode || alarm.monitorPointName || '-',
      occurredAt: alarm.occurredAt,
      level: alarm.alarmLevel,
      status: normalizeStatus(alarm.status)
    })),
    sprayLogs: (sprayRecords.records || []).map((record) => ({
      id: record.id,
      content: record.sprayDeviceName || record.taskName || '喷淋设备',
      mode: record.operationType || record.triggerType || '-',
      time: record.startedAt || '-'
    })),
    riskStats: buildRiskStats(overview)
  }))
}
