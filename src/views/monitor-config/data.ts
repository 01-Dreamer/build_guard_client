import type { TreeItem } from '../device-management/data'

export interface MonitorPoint {
  id: number
  type: string
  code: string
  name: string
  device: string
  unit: string
  upper: string
  lower: string
  sort: number
}

export const monitorPointRows: MonitorPoint[] = [
  { id: 1, type: '测试监测', code: 'DL003-PM2.5', name: '东楼3号PM2.5监测点', device: '东区塔吊#1', unit: 'μg/m³', upper: '37', lower: '32', sort: 1 },
  { id: 2, type: '高支模监测', code: 'GZM1_DL', name: '设备电量', device: '东区1#高支模', unit: 'w/h', upper: '33', lower: '35', sort: 2 },
  { id: 3, type: '高支模监测', code: 'GZM1_x', name: 'x倾角', device: '东区1#高支模', unit: '°（度）', upper: '1', lower: '-1', sort: 3 },
  { id: 4, type: '高支模监测', code: 'GZM1_y', name: 'y倾角', device: '东区1#高支模', unit: '°', upper: '1', lower: '-1', sort: 4 },
  { id: 5, type: '高支模监测', code: 'SJK1_YBLL', name: '应变拉力', device: '东区1#深基坑', unit: 'kN', upper: '--', lower: '--', sort: 99 },
  { id: 6, type: '深基坑监测', code: 'SJK1_CJ', name: '沉降值', device: '东区1#深基坑', unit: 'cm', upper: '--', lower: '--', sort: 99 },
  { id: 7, type: '深基坑监测', code: 'SJK1_x', name: 'x倾角', device: '东区1#深基坑', unit: '°', upper: '-1', lower: '-2', sort: 99 },
  { id: 8, type: '深基坑监测', code: 'SJK1_y', name: 'y倾角', device: '东区1#深基坑', unit: '°', upper: '-1', lower: '-2', sort: 99 },
  { id: 9, type: '深基坑监测', code: 'SJK1_WL', name: '地下水位', device: '东区1#深基坑', unit: 'm', upper: '--', lower: '--', sort: 99 },
  { id: 10, type: '塔吊检测', code: 'TD1_DZ', name: '吊重', device: '东区塔吊#1', unit: 'kg', upper: '--', lower: '--', sort: 99 }
]

export const environmentConfigTree: TreeItem[] = [
  { label: 'PM2.5' },
  { label: 'PM10' },
  { label: '噪音' },
  { label: '温度' },
  { label: '湿度' },
  { label: '风向' },
  { label: '风速' },
  { label: 'TSP' },
  { label: '气压', active: true }
]

export const environmentConfigForm = {
  warningUpper: '11000',
  warningLower: '11000',
  alarmUpper: '12005',
  alarmLower: '30',
  code: 'airPres',
  unit: 'hPa'
}
