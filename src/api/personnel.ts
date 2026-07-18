import { del, get, post, put, type PageResult } from './http'

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

export function listPersonnel(query: PersonnelQuery = {}) {
  return get<PageResult<PersonnelView>>('/personnel', query)
}

export function listViolations(query: PersonnelQuery = {}) {
  return get<PageResult<ViolationView>>('/personnel/violations', query)
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
