import { API_BASE_URL, del, get, post, put, type PageResult } from './http'

export interface PersonnelView {
  id: number
  name: string
  phone?: string | null
  email?: string | null
  avatarUrl?: string | null
  jobTitle?: string | null
  teamName?: string | null
  status?: number | null
  createdAt?: string | null
}

export interface ViolationView {
  id: number
  personnelId?: number | null
  personnelName?: string | null
  violationItem: string
  fineAmount?: number | string | null
  paymentStatus?: number | null
  sourceAlarmId?: number | null
  snapshotUrl?: string | null
  reviewStatus?: number | null
  occurredAt?: string | null
  remark?: string | null
  createdAt?: string | null
}

export interface PersonnelQuery {
  name?: string
  page?: number
  pageSize?: number
}

export interface PersonnelPayload {
  name: string
  phone?: string
  email?: string
  jobTitle?: string
  teamName?: string
  status?: number
}

export interface ViolationPayload {
  personnelId?: number | null
  violationItem: string
  fineAmount?: number | string
  paymentStatus?: number
  remark?: string
}

export interface ViolationFinePayload {
  personnelId?: number | null
  fineAmount?: number | string
  remark?: string
  revoked?: boolean
}

export function listPersonnel(query: PersonnelQuery = {}) {
  return get<PageResult<PersonnelView>>('/personnel', query).then((result) => ({
    ...result,
    records: result.records.map((person) => ({
      ...person,
      avatarUrl: normalizeAssetUrl(person.avatarUrl)
    }))
  }))
}

export function listViolations(query: PersonnelQuery = {}) {
  return get<PageResult<ViolationView>>('/personnel/violations', query).then((result) => ({
    ...result,
    records: result.records.map((record) => ({
      ...record,
      snapshotUrl: normalizeAssetUrl(record.snapshotUrl)
    }))
  }))
}

export function createPersonnel(payload: PersonnelPayload) {
  return post<{ id: number }>('/personnel', payload)
}

export function updatePersonnel(id: number, payload: PersonnelPayload) {
  return put<void>(`/personnel/${id}`, payload)
}

export function deletePersonnel(id: number) {
  return del<void>(`/personnel/${id}`)
}

export function createViolation(payload: ViolationPayload) {
  return post<{ id: number }>('/personnel/violations', payload)
}

export function reviewViolation(id: number, payload: Partial<ViolationPayload>) {
  return put<void>(`/personnel/violations/${id}/review`, payload)
}

export function updateViolationFine(id: number, payload: ViolationFinePayload) {
  return put<void>(`/personnel/violations/${id}/fine`, payload)
}

export function remindViolationFine(id: number) {
  return post<void>(`/personnel/violations/${id}/remind`)
}

export function refundViolationFine(id: number) {
  return post<void>(`/payments/fines/${id}/refund`)
}

export function uploadPersonnelAvatar(id: number, file: File) {
  const form = new FormData()
  form.append('file', file)
  return post<PersonnelView>(`/personnel/${id}/avatar`, form)
}

function normalizeAssetUrl(url?: string | null) {
  if (!url) return null
  if (/^(https?:)?\/\//.test(url) || url.startsWith('data:')) return url
  const apiRoot = API_BASE_URL.replace(/\/api\/?$/, '')
  const path = url.startsWith('/') ? url : `/${url}`
  return `${apiRoot}${path}`
}
