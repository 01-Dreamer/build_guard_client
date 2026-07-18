import { del, get, post, put, type PageResult } from './http'

export interface MonitorPointView {
  id: number
  typeName?: string | null
  deviceTypeName?: string | null
  deviceTypeCode?: string | null
  deviceId?: number | null
  code: string
  name: string
  metricCode?: string | null
  deviceName?: string | null
  metricName?: string | null
  unit?: string | null
  warnUpper?: string | number | null
  warnLower?: string | number | null
  alarmUpper?: string | number | null
  alarmLower?: string | number | null
  sort?: number | null
  status?: number | null
  ruleEnabled?: number | null
}

export interface EnvironmentMonitorRule {
  id?: number
  name?: string | null
  code?: string | null
  unit?: string | null
  warnUpper?: string | number | null
  warnLower?: string | number | null
  warningUpper?: string | number | null
  warningLower?: string | number | null
  alarmUpper?: string | number | null
  alarmLower?: string | number | null
  ruleEnabled?: number | null
}

export interface MonitorPointPayload {
  name: string
  code: string
  deviceId?: number | null
  metricCode: string
  metricName: string
  unit?: string
  sort?: number
  status?: number
  warnUpper?: string | number | null
  warnLower?: string | number | null
  alarmUpper?: string | number | null
  alarmLower?: string | number | null
  ruleEnabled?: number
}

export interface MonitorRulePayload {
  warnUpper?: string | number | null
  warnLower?: string | number | null
  alarmUpper?: string | number | null
  alarmLower?: string | number | null
  ruleEnabled?: number
}

export function listMonitorPoints(query: object = {}) {
  return get<PageResult<MonitorPointView>>('/monitor-config/device-points', query)
}

export function listEnvironmentMonitorRules() {
  return get<PageResult<EnvironmentMonitorRule>>('/monitor-config/environment-points', { page: 1, pageSize: 100 }).then(
    (result) =>
      result.records.map((record) => ({
        ...record,
        warningUpper: record.warningUpper ?? record.warnUpper,
        warningLower: record.warningLower ?? record.warnLower
      }))
  )
}

export function createMonitorPoint(payload: MonitorPointPayload) {
  return post<{ id: number }>('/monitor-config/points', payload)
}

export function updateMonitorPoint(id: number, payload: MonitorPointPayload) {
  return put<void>(`/monitor-config/points/${id}`, payload)
}

export function updateMonitorRule(id: number, payload: MonitorRulePayload) {
  return put<void>(`/monitor-config/points/${id}/rule`, payload)
}

export function deleteMonitorPoint(id: number) {
  return del<void>(`/monitor-config/points/${id}`)
}
