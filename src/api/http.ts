export const API_BASE_URL =
  (import.meta.env.VITE_API_BASE_URL as string | undefined)?.replace(/\/+$/, '') ||
  'http://127.0.0.1:18080/api'

export interface PageResult<T> {
  records: T[]
  total: number
  page: number
  pageSize: number
}

interface ApiResponse<T> {
  code: number
  message: string
  data: T
}

interface RequestOptions extends RequestInit {
  query?: object
}

const TOKEN_KEY = 'build_guard_token'

export class ApiError extends Error {
  constructor(
    message: string,
    public readonly status?: number,
    public readonly code?: number
  ) {
    super(message)
    this.name = 'ApiError'
  }
}

function buildUrl(path: string, query?: RequestOptions['query']) {
  const normalizedPath = path.startsWith('/') ? path : `/${path}`
  const url = new URL(`${API_BASE_URL}${normalizedPath}`)

  Object.entries(query || {}).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      url.searchParams.set(key, String(value))
    }
  })

  return url.toString()
}

async function parseJson(response: Response) {
  const text = await response.text()
  if (!text) return null

  try {
    return JSON.parse(text) as unknown
  } catch {
    throw new ApiError('接口返回内容不是有效 JSON', response.status)
  }
}

function isApiResponse<T>(payload: unknown): payload is ApiResponse<T> {
  return (
    payload !== null &&
    typeof payload === 'object' &&
    'code' in payload &&
    'message' in payload &&
    'data' in payload
  )
}

export async function request<T>(path: string, options: RequestOptions = {}) {
  const { query, headers, body, ...fetchOptions } = options
  const token = localStorage.getItem(TOKEN_KEY)
  const requestHeaders = new Headers(headers)

  if (token && !requestHeaders.has('Authorization')) {
    requestHeaders.set('Authorization', `Bearer ${token}`)
  }

  if (body && !(body instanceof FormData) && !requestHeaders.has('Content-Type')) {
    requestHeaders.set('Content-Type', 'application/json')
  }

  const response = await fetch(buildUrl(path, query), {
    ...fetchOptions,
    body,
    headers: requestHeaders
  })
  const payload = await parseJson(response)

  if (!response.ok) {
    const errorPayload = isApiResponse<unknown>(payload) ? payload : null
    const message = errorPayload?.message || `接口请求失败 (${response.status})`
    throw new ApiError(message, response.status)
  }

  if (isApiResponse<T>(payload)) {
    if (payload.code !== 200) {
      throw new ApiError(payload.message || '接口请求失败', response.status, payload.code)
    }

    return payload.data
  }

  return payload as T
}

export function get<T>(path: string, query?: RequestOptions['query']) {
  return request<T>(path, { method: 'GET', query })
}

export function post<T>(path: string, body?: unknown) {
  return request<T>(path, {
    method: 'POST',
    body: body instanceof FormData ? body : body === undefined ? undefined : JSON.stringify(body)
  })
}

export function put<T>(path: string, body?: unknown) {
  return request<T>(path, {
    method: 'PUT',
    body: body instanceof FormData ? body : body === undefined ? undefined : JSON.stringify(body)
  })
}

export function patch<T>(path: string, body?: unknown) {
  return request<T>(path, {
    method: 'PATCH',
    body: body instanceof FormData ? body : body === undefined ? undefined : JSON.stringify(body)
  })
}

export function del<T>(path: string) {
  return request<T>(path, { method: 'DELETE' })
}
