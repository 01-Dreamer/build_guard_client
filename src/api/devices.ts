import { del, get, patch, post, put, type PageResult } from './http'

export interface DeviceView {
  id: number
  name: string
  code: string
  typeId?: number | null
  typeName?: string | null
  locationId?: number | null
  locationName?: string | null
  model?: string | null
  manufacturer?: string | null
  installDate?: string | null
  onlineStatus?: number | null
  enabled?: number | null
  x?: number | null
  y?: number | null
}

export interface DeviceTypeView {
  id: number
  parentId?: number | null
  name: string
  code: string
  sort?: number | null
  status?: number | null
}

export interface DeviceLocationView {
  id: number
  areaId?: number | null
  name: string
  code: string
  sort?: number | null
  status?: number | null
}

export interface DeviceQuery {
  name?: string
  typeId?: number
  deviceName?: string
  deviceCode?: string
  status?: string | number
  startTime?: string
  endTime?: string
  page?: number
  pageSize?: number
}

export interface DevicePayload {
  name: string
  code: string
  typeId?: number | null
  locationId?: number | null
  model?: string
  manufacturer?: string
  installDate?: string
  onlineStatus?: number
  enabled?: number
  x?: number | null
  y?: number | null
}

export interface DeviceTypePayload {
  parentId?: number | null
  name: string
  code: string
  sort?: number
  status?: number
}

export interface DeviceLocationPayload {
  areaId?: number | null
  name: string
  code: string
  sort?: number
  status?: number
}

export interface DeviceOnlineRecordView {
  id: number
  deviceId?: number | null
  deviceName?: string | null
  deviceCode?: string | null
  deviceType?: string | null
  onlineStatus?: number | string | null
  reportedAt?: string | null
  source?: string | null
}

export interface AlarmRecordView {
  id: number
  alarmType?: string | null
  alarmLevel?: string | null
  deviceId?: number | null
  deviceName?: string | null
  deviceCode?: string | null
  monitorPointName?: string | null
  content?: string | null
  alarmValue?: number | string | null
  unit?: string | null
  warnUpper?: number | string | null
  warnLower?: number | string | null
  alarmUpper?: number | string | null
  alarmLower?: number | string | null
  occurredAt?: string | null
  status?: number | string | null
}

export function listDevices(query: DeviceQuery = {}) {
  return get<PageResult<DeviceView>>('/devices', query)
}

export function listDeviceTypes() {
  return get<DeviceTypeView[]>('/devices/types')
}

export function listDeviceLocations() {
  return get<DeviceLocationView[]>('/devices/locations')
}

export function listDeviceOnlineRecords(query: DeviceQuery = {}) {
  return get<PageResult<DeviceOnlineRecordView>>('/construction-devices/online-records', query)
}

export function listDeviceAlarmRecords(query: DeviceQuery = {}) {
  return get<PageResult<AlarmRecordView>>('/construction-devices/alarms', query)
}

export function createDevice(payload: DevicePayload) {
  return post<{ id: number }>('/devices', payload)
}

export function updateDevice(id: number, payload: DevicePayload) {
  return put<void>(`/devices/${id}`, payload)
}

export function updateDeviceEnabled(id: number, enabled: number) {
  return patch<void>(`/devices/${id}/enabled`, { enabled })
}

export function deleteDevice(id: number) {
  return del<void>(`/devices/${id}`)
}

export function createDeviceType(payload: DeviceTypePayload) {
  return post<{ id: number }>('/devices/types', payload)
}

export function updateDeviceType(id: number, payload: DeviceTypePayload) {
  return put<void>(`/devices/types/${id}`, payload)
}

export function deleteDeviceType(id: number) {
  return del<void>(`/devices/types/${id}`)
}

export function createDeviceLocation(payload: DeviceLocationPayload) {
  return post<{ id: number }>('/devices/locations', payload)
}

export function updateDeviceLocation(id: number, payload: DeviceLocationPayload) {
  return put<void>(`/devices/locations/${id}`, payload)
}

export function deleteDeviceLocation(id: number) {
  return del<void>(`/devices/locations/${id}`)
}
