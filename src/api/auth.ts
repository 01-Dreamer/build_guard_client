import { post } from './http'

export interface LoginRequest {
  username: string
  password: string
}

export interface LoginResponse {
  token: string
  adminId: number
  username: string
  realName: string
  email: string
}

export function loginApi(payload: LoginRequest) {
  return post<LoginResponse>('/auth/login', payload)
}
