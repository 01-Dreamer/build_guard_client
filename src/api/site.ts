import { API_BASE_URL, get, post, type PageResult } from './http'

export interface CameraView {
  id: number
  name: string
  code: string
  locationName?: string | null
  cameraSource?: string | null
  streamCode?: string | null
  aiMonitorTypes?: string[] | string | null
  onlineStatus?: number | string | null
  enabled?: number | boolean | null
  snapshotUrl?: string | null
  streamUrl?: string | null
}

export interface AiRiskRecordView {
  id: number
  taskId?: number | null
  cameraDeviceId?: number | null
  personnelId?: number | null
  personnelName?: string | null
  deviceCode?: string | null
  cameraCode?: string | null
  deviceName?: string | null
  cameraName?: string | null
  occurredAt?: string | null
  alarmTime?: string | null
  detectType?: string | null
  alarmType?: string | null
  content?: string | null
  confidence?: number | null
  resultJson?: string | null
  snapshotUrl?: string | null
  sourceAlarmId?: number | null
  alarmStatus?: number | string | null
  alarmLevel?: string | null
  handleByName?: string | null
  handler?: string | null
  handledAt?: string | null
  handleTime?: string | null
  handleContent?: string | null
  result?: string | null
  status?: number | string | null
}

export interface AiRiskReviewPayload {
  personnelId?: number | null
  fineAmount?: number | string | null
  decision?: 'approve' | 'reject'
  remark?: string
}

export interface CameraVideoView {
  id: number
  cameraDeviceId?: number | null
  cameraCode?: string | null
  cameraName?: string | null
  url: string
  objectKey?: string | null
  fileName?: string | null
  contentType?: string | null
  sizeBytes?: number | null
  createdAt?: string | null
}

export function listCameras(query: object = {}) {
  return get<PageResult<CameraView>>('/site/cameras', query).then((result) => ({
    ...result,
    records: result.records.map((camera) => ({
      ...camera,
      snapshotUrl: normalizeAssetUrl(camera.snapshotUrl),
      streamUrl: normalizeAssetUrl(camera.streamUrl)
    }))
  }))
}

export function listAiMonitorRules(query: object = {}) {
  return get<PageResult<CameraView>>('/site/ai-monitor-rules', query)
}

export function listAiRiskRecords(query: object = {}) {
  return get<PageResult<AiRiskRecordView>>('/site/ai-risks', query).then((result) => ({
    ...result,
    records: result.records.map((record) => {
      const detectType = record.detectType || record.alarmType || 'AI识别报警'
      const confidence = record.confidence === undefined || record.confidence === null
        ? ''
        : `，置信度 ${(record.confidence * 100).toFixed(1)}%`
      return {
        ...record,
        deviceCode: record.deviceCode || record.cameraCode,
        deviceName: record.deviceName || record.cameraName,
        alarmTime: record.alarmTime || record.occurredAt,
        alarmType: detectType,
        content: record.content || `${record.personnelName || '现场人员'}触发${detectType}${confidence}`,
        snapshotUrl: normalizeAssetUrl(record.snapshotUrl),
        status: record.status ?? record.alarmStatus ?? 0
      }
    })
  }))
}

export function reviewAiRiskRecord(id: number, payload: AiRiskReviewPayload) {
  return post<{ violationId?: number | null }>(`/site/ai-risks/${id}/review`, payload)
}

export function listCameraVideos(query: object = {}) {
  return get<PageResult<CameraVideoView>>('/site/camera-videos', query).then((result) => ({
    ...result,
    records: result.records.map((video) => ({
      ...video,
      url: normalizeAssetUrl(video.url) || video.url
    }))
  }))
}

function normalizeAssetUrl(url?: string | null) {
  if (!url) return null
  if (/^(https?:)?\/\//.test(url) || url.startsWith('data:')) return url

  const apiRoot = API_BASE_URL.replace(/\/api\/?$/, '')
  const path = url.startsWith('/') ? url : `/${url}`
  return `${apiRoot}${path}`
}
