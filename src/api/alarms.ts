import { post } from './http'

export interface AlarmHandlePayload {
  handleBy?: string
  handleContent: string
}

export function handleAlarm(id: number, payload: AlarmHandlePayload) {
  return post<void>(`/alarms/${id}/handle`, payload)
}
