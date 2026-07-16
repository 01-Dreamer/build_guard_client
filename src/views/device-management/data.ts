export interface TreeItem {
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

export const typeTree: TreeItem[] = [
  {
    label: '监测仪表',
    children: [
      { label: '噪音监测', active: true },
      { label: '扬尘监测' },
      { label: '钢丝绳损伤监测' },
      { label: '喷淋设备' },
      { label: '空气检测仪' }
    ]
  },
  {
    label: '大型设备',
    children: [
      { label: '高支模监测' },
      { label: '基坑监测' },
      { label: '塔吊' },
      { label: '升降机' }
    ]
  },
  {
    label: '监控设备',
    children: [{ label: '视频监控' }]
  },
  { label: '其他' }
]

export const locationTree: TreeItem[] = [
  { label: '基坑1区' },
  { label: '基坑2区' },
  { label: '出入口' },
  { label: '1号住宅小区' },
  {
    label: '2号住宅小区',
    active: true,
    children: [{ label: '绿化中心' }]
  },
  { label: '基坑2区' },
  { label: '青银高速以东改造项目' }
]

export const deviceTree: TreeItem[] = [
  {
    label: '监测仪表',
    children: [
      { label: '噪音监测' },
      { label: '扬尘监测' },
      { label: '钢丝绳损伤监测' },
      { label: '喷淋设备' },
      { label: '空气检测仪' }
    ]
  },
  {
    label: '大型设备',
    children: [
      { label: '高支模监测' },
      { label: '基坑监测' },
      { label: '塔吊', active: true },
      { label: '升降机' }
    ]
  },
  {
    label: '监控设备',
    children: [{ label: '视频监控' }]
  },
  { label: '其他' }
]

export const managedDevices: ManagedDevice[] = [
  { id: 1, name: '西区塔吊#2', code: 'td002', location: '基坑2区', type: '塔吊', order: 1, status: '在线', enabled: true },
  { id: 2, name: '基坑塔吊#3', code: 'TD002', location: '基坑2区', type: '塔吊', order: 3, status: '在线', enabled: true },
  { id: 3, name: '东区塔吊#1', code: 'HJJC-001', location: '绿化中心', type: '塔吊', order: 10, status: '在线', enabled: true }
]

export const typeForm = {
  parentCode: '001',
  parentName: '监测仪表',
  code: '001-02',
  name: '噪音监测',
  sort: '2'
}

export const locationForm = {
  parentCode: '',
  parentName: '',
  code: 'WSC-01',
  name: '2号住宅小区',
  sort: '20'
}
