export interface TreeItem {
  id?: number
  label: string
  active?: boolean
  children?: TreeItem[]
}

export interface ManagedDevice {
  id: number
  name: string
  code: string
  location: string
  type: string
  order: number
  status: '在线' | '离线'
  enabled: boolean
}
