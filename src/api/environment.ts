import { del, get, post, put, type PageResult } from './http'

export interface EnvironmentMetric {
  label: string
  value: string | number
  unit?: string | null
  metricCode?: string | null
}

export interface EnvironmentTrendPoint {
  time: string
  pm25?: number | null
  pm10?: number | null
  noise?: number | null
  temperature?: number | null
  minTemperature?: number | null
  maxTemperature?: number | null
  aqi?: number | null
}

export interface EnvironmentRealtime {
  metrics?: EnvironmentMetric[]
  airQualityTrend?: EnvironmentTrendPoint[]
  noiseTrend?: EnvironmentTrendPoint[]
  temperatureTrend?: EnvironmentTrendPoint[]
  sevenDayAirQuality?: EnvironmentTrendPoint[]
  airQualityDistribution?: Array<{ name: string; value: number }>
  gauges?: Array<{ name: string; value: number; max?: number; unit?: string | null }>
  sprayLogs?: Array<{ id?: number; device: string; status: string; time: string }>
}

export interface EnvironmentHistoryRecord {
  id: number
  code?: string | null
  name?: string | null
  value?: string | number | null
  unit?: string | null
  upper?: string | number | null
  lower?: string | number | null
  reportedAt?: string | null
  time?: string | null
}

export interface SprayTaskView {
  id: number
  name: string
  sprayDeviceId?: number | null
  sprayDeviceName?: string | null
  startTime?: string | null
  durationMinutes?: number | null
  duration?: number | null
  cycleValue?: number | null
  cycle?: number | null
  cycleUnit?: string | null
  unit?: string | null
  enabled?: number | boolean | null
  nextRunAt?: string | null
  nextTime?: string | null
}

export interface SprayTaskPayload {
  name: string
  sprayDeviceId?: number | null
  startTime?: string | null
  durationMinutes?: number | null
  cycleValue?: number | null
  cycleUnit?: string | null
  enabled?: number
  nextRunAt?: string | null
}

export interface SprayRecordView {
  id: number
  sprayDeviceName?: string | null
  deviceName?: string | null
  locationName?: string | null
  operationType?: string | null
  triggerType?: string | null
  reason?: string | null
  startedAt?: string | null
  endedAt?: string | null
  operationTime?: string | null
}

export interface EnvironmentAlarmView {
  id: number
  alarmType?: string | null
  alarmLevel?: string | null
  content?: string | null
  alarmValue?: string | number | null
  unit?: string | null
  warnUpper?: string | number | null
  warnLower?: string | number | null
  alarmUpper?: string | number | null
  alarmLower?: string | number | null
  occurredAt?: string | null
  status?: string | number | null
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

interface BackendEnvironmentRealtime {
  deviceCode?: string | null
  deviceName?: string | null
  metrics?: BackendMetric[]
  trend?: BackendChartPoint[]
}

interface BackendMonitorRule {
  id?: number
  code?: string | null
  name?: string | null
  metricCode?: string | null
  metricName?: string | null
  unit?: string | null
  warnUpper?: string | number | null
  warnLower?: string | number | null
  alarmUpper?: string | number | null
  alarmLower?: string | number | null
}

const metricNames: Record<string, string> = {
  pm25: 'PM2.5',
  pm10: 'PM10',
  noise: '噪音',
  temperature: '温度',
  humidity: '湿度',
  windSpeed: '风速',
  windDirection: '风向',
  tsp: 'TSP',
  airPressure: '气压'
}

const metricUnits: Record<string, string> = {
  pm25: 'μg/m³',
  pm10: 'μg/m³',
  noise: 'dB',
  temperature: '℃',
  humidity: '%RH',
  windSpeed: 'm/s',
  windDirection: '°',
  tsp: 'μg/m³',
  airPressure: 'hPa'
}

function timeLabel(time: string) {
  const date = new Date(time)
  if (Number.isNaN(date.getTime())) return time
  return `${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`
}

function dayLabel(time: string) {
  const date = new Date(time)
  if (Number.isNaN(date.getTime())) return time
  return `${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`
}

function normalizeTrend(point: BackendChartPoint): EnvironmentTrendPoint {
  const values = point.values || {}
  const temperature = values.temperature ?? null
  return {
    time: timeLabel(point.time),
    pm25: values.pm25 ?? null,
    pm10: values.pm10 ?? null,
    noise: values.noise ?? null,
    temperature,
    minTemperature: temperature === null ? null : Number((temperature - 4).toFixed(2)),
    maxTemperature: temperature === null ? null : Number((temperature + 4).toFixed(2)),
    aqi: Math.round(Math.max(values.pm25 ?? 0, values.pm10 ?? 0))
  }
}

function buildQualityDistribution(points: EnvironmentTrendPoint[]) {
  const buckets = [
    { name: '优', value: 0 },
    { name: '良', value: 0 },
    { name: '轻度污染', value: 0 },
    { name: '中度污染', value: 0 },
    { name: '重度污染', value: 0 }
  ]
  points.forEach((point) => {
    const value = point.aqi ?? 0
    if (value <= 35) buckets[0].value += 1
    else if (value <= 75) buckets[1].value += 1
    else if (value <= 115) buckets[2].value += 1
    else if (value <= 150) buckets[3].value += 1
    else buckets[4].value += 1
  })
  return buckets.filter((bucket) => bucket.value > 0)
}

function buildSevenDay(points: BackendChartPoint[]) {
  return points.slice(-7).map((point) => ({
    ...normalizeTrend(point),
    time: dayLabel(point.time)
  }))
}

function ruleMap(rules: BackendMonitorRule[]) {
  const entries: Array<[string, BackendMonitorRule]> = []
  rules.forEach((rule) => {
    const key = rule.metricCode || rule.code || rule.name || ''
    if (key) {
      entries.push([key, rule])
    }
  })
  return new Map(entries)
}

export function getEnvironmentRealtime() {
  return Promise.all([
    get<BackendEnvironmentRealtime>('/environment/realtime'),
    get<PageResult<SprayRecordView>>('/environment/spray-records', { page: 1, pageSize: 8 })
  ]).then(([realtime, sprayRecords]) => {
    const points = (realtime.trend || []).map(normalizeTrend)
    const metrics = realtime.metrics || []
    const metricByCode = new Map(metrics.map((metric) => [metric.code, metric]))
    return {
      metrics: metrics.map((metric) => ({
        label: metricNames[metric.code] || metric.name,
        value: metric.value,
        unit: metricUnits[metric.code] || metric.unit,
        metricCode: metric.code
      })),
      airQualityTrend: points,
      noiseTrend: points,
      temperatureTrend: points,
      sevenDayAirQuality: buildSevenDay(realtime.trend || []),
      airQualityDistribution: buildQualityDistribution(points),
      gauges: ['tsp', 'pm10', 'pm25'].map((code) => ({
        name: metricNames[code] || code,
        value: Number(metricByCode.get(code)?.value || 0),
        max: code === 'tsp' ? 500 : 200,
        unit: metricUnits[code]
      })),
      sprayLogs: (sprayRecords.records || []).map((record) => ({
        id: record.id,
        device: record.sprayDeviceName || record.deviceName || '喷淋设备',
        status: record.operationType || record.triggerType || '-',
        time: record.startedAt || record.operationTime || '-'
      }))
    }
  })
}

export function listEnvironmentHistory(query: object = {}) {
  return Promise.all([
    get<PageResult<BackendChartPoint>>('/environment/history', query),
    get<PageResult<BackendMonitorRule>>('/monitor-config/environment-points', { page: 1, pageSize: 100 })
  ]).then(([history, rules]) => {
    const rulesByMetric = ruleMap(rules.records || [])
    const records = (history.records || []).flatMap((point, pointIndex) =>
      Object.entries(point.values || {}).map(([code, value], metricIndex) => {
        const rule = rulesByMetric.get(code)
        return {
          id: (history.page - 1) * history.pageSize * 10 + pointIndex * 10 + metricIndex + 1,
          code: rule?.code || code,
          name: rule?.metricName || rule?.name || metricNames[code] || code,
          value,
          unit: rule?.unit || metricUnits[code] || '-',
          upper: rule?.alarmUpper ?? rule?.warnUpper ?? '-',
          lower: rule?.alarmLower ?? rule?.warnLower ?? '-',
          reportedAt: point.time,
          time: point.time
        }
      })
    )
    return {
      records,
      total: history.total * Math.max(1, records.length / Math.max(1, history.records.length)),
      page: history.page,
      pageSize: records.length || history.pageSize
    }
  })
}

export function listSprayTasks(query: object = {}) {
  return get<PageResult<SprayTaskView>>('/environment/spray-tasks', query)
}

export function createSprayTask(payload: SprayTaskPayload) {
  return post<{ id: number }>('/environment/spray-tasks', payload)
}

export function updateSprayTask(id: number, payload: SprayTaskPayload) {
  return put<void>(`/environment/spray-tasks/${id}`, payload)
}

export function deleteSprayTask(id: number) {
  return del<void>(`/environment/spray-tasks/${id}`)
}

export function listSprayRecords(query: object = {}) {
  return get<PageResult<SprayRecordView>>('/environment/spray-records', query)
}

export function listEnvironmentAlarms(query: object = {}) {
  return get<PageResult<EnvironmentAlarmView>>('/environment/alarms', query)
}
