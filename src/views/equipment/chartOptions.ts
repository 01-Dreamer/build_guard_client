import type { EChartsOption } from 'echarts'
import type { EquipmentAlarmTrendPoint, EquipmentAlarmTypeSummary } from '../../api/equipment'

const axisLabel = {
  color: '#64748b',
  fontSize: 11,
  fontWeight: 700
}

export function lineOption(
  color: string,
  values: number[],
  name = '实时数据',
  unit = ''
): EChartsOption {
  const chartTimes = values.map((_, index) => String(index + 1))

  return {
    grid: { left: 10, right: 22, top: 24, bottom: 18, containLabel: true },
    tooltip: { trigger: 'axis' },
    xAxis: {
      type: 'category',
      data: chartTimes,
      boundaryGap: false,
      axisTick: { show: false },
      axisLine: { lineStyle: { color: '#e5e7eb' } },
      axisLabel
    },
    yAxis: {
      type: 'value',
      axisLabel: { ...axisLabel, formatter: `{value}${unit}` },
      splitLine: { lineStyle: { color: '#eef2f7' } }
    },
    series: [
      {
        name,
        type: 'line',
        smooth: true,
        symbolSize: 7,
        data: values,
        lineStyle: { width: 3, color },
        itemStyle: { color },
        areaStyle: { color: `${color}22` }
      }
    ]
  }
}

function shortDate(value?: string | null) {
  if (!value) return '-'
  const normalized = String(value)
  const match = normalized.match(/(\d{4})-(\d{2})-(\d{2})/)
  if (match) return `${match[2]}-${match[3]}`
  return normalized.slice(0, 5)
}

function emptyTrend() {
  const now = new Date()
  return Array.from({ length: 7 }, (_, index) => {
    const date = new Date(now)
    date.setDate(now.getDate() - 6 + index)
    return {
      time: date.toISOString().slice(0, 10),
      values: { alarm: 0, warning: 0 }
    }
  })
}

export function alarmTrendOption(points: EquipmentAlarmTrendPoint[] = []): EChartsOption {
  const trendPoints = points.length ? points : emptyTrend()
  const labels = trendPoints.map((point) => shortDate(point.time))
  const alarms = trendPoints.map((point) => Number(point.values?.alarm ?? 0))
  const warnings = trendPoints.map((point) => Number(point.values?.warning ?? 0))

  return {
    grid: { left: 8, right: 10, top: 28, bottom: 34, containLabel: true },
    tooltip: { trigger: 'axis' },
    legend: {
      bottom: 2,
      left: 'center',
      itemWidth: 10,
      itemHeight: 10,
      itemGap: 18,
      textStyle: axisLabel
    },
    xAxis: {
      type: 'category',
      data: labels,
      axisTick: { show: false },
      axisLine: { lineStyle: { color: '#e5e7eb' } },
      axisLabel
    },
    yAxis: {
      type: 'value',
      axisLabel,
      splitLine: { lineStyle: { color: '#eef2f7' } }
    },
    series: [
      {
        name: '报警数量',
        type: 'line',
        smooth: true,
        data: alarms,
        lineStyle: { width: 3, color: '#ef4444' },
        itemStyle: { color: '#ef4444' },
        areaStyle: { color: '#ef444422' }
      },
      {
        name: '预警数量',
        type: 'line',
        smooth: true,
        data: warnings,
        lineStyle: { width: 2, color: '#f59e0b' },
        itemStyle: { color: '#f59e0b' }
      }
    ]
  }
}

export function pieOption(items: string[] | EquipmentAlarmTypeSummary[]): EChartsOption {
  const data = items.map((item) =>
    typeof item === 'string'
      ? { name: item, value: 0 }
      : { name: item.name || item.code, value: Number(item.value) || 0 }
  )
  const chartData = data.length ? data : [{ name: '暂无报警', value: 0 }]

  return {
    tooltip: { trigger: 'item' },
    series: [
      {
        type: 'pie',
        radius: ['28%', '68%'],
        center: ['52%', '54%'],
        data: chartData,
        label: {
          color: '#475569',
          fontSize: 11,
          fontWeight: 700,
          overflow: 'truncate',
          width: 82
        }
      }
    ]
  }
}

export function gaugeOption(value: number): EChartsOption {
  return {
    series: [
      {
        type: 'gauge',
        min: 0,
        max: 360,
        splitNumber: 10,
        axisLine: {
          lineStyle: {
            width: 8,
            color: [
              [0.7, '#60a5fa'],
              [0.88, '#f59e0b'],
              [1, '#ef4444']
            ]
          }
        },
        pointer: { width: 5 },
        axisLabel: { color: '#64748b', fontSize: 11 },
        splitLine: { distance: -8, length: 12, lineStyle: { color: '#94a3b8' } },
        detail: {
          valueAnimation: true,
          formatter: '{value}°',
          color: '#3f6fed',
          fontSize: 24,
          fontWeight: 900,
          offsetCenter: [0, '66%']
        },
        data: [{ value }]
      }
    ]
  }
}
