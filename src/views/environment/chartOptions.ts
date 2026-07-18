import type { EChartsOption } from 'echarts'

const axisLabel = {
  color: '#64748b',
  fontSize: 11,
  fontWeight: 700
}

const dayLabels = ['12时', '15时', '18时', '21时', '00时', '03时', '06时', '09时']

export interface TrendPoint {
  time: string
  pm25?: number | null
  pm10?: number | null
  noise?: number | null
  temperature?: number | null
  minTemperature?: number | null
  maxTemperature?: number | null
  aqi?: number | null
}

export function airQualityLineOption(points: TrendPoint[] = []): EChartsOption {
  const labels = points.map((point) => point.time)
  return {
    grid: { left: 16, right: 18, top: 28, bottom: 26, containLabel: true },
    legend: { bottom: 0, itemWidth: 10, itemHeight: 10, textStyle: axisLabel },
    tooltip: { trigger: 'axis' },
    xAxis: {
      type: 'category',
      data: labels,
      boundaryGap: false,
      axisTick: { show: false },
      axisLine: { lineStyle: { color: '#e5e7eb' } },
      axisLabel
    },
    yAxis: {
      type: 'value',
      name: 'μg/m³',
      nameTextStyle: axisLabel,
      axisLabel,
      splitLine: { lineStyle: { color: '#eef2f7' } }
    },
    series: [
      {
        name: 'PM2.5',
        type: 'line',
        smooth: true,
        data: points.map((point) => point.pm25 ?? 0),
        lineStyle: { width: 3, color: '#22c55e' },
        itemStyle: { color: '#22c55e' }
      },
      {
        name: 'PM10',
        type: 'line',
        smooth: true,
        data: points.map((point) => point.pm10 ?? 0),
        lineStyle: { width: 3, color: '#5b8cff' },
        itemStyle: { color: '#5b8cff' },
        areaStyle: { color: '#5b8cff22' }
      }
    ]
  }
}

export function noiseLineOption(points: TrendPoint[] = []): EChartsOption {
  const labels = points.map((point) => point.time)
  return {
    grid: { left: 16, right: 18, top: 28, bottom: 8, containLabel: true },
    tooltip: { trigger: 'axis' },
    xAxis: {
      type: 'category',
      data: labels,
      boundaryGap: false,
      axisTick: { show: false },
      axisLine: { lineStyle: { color: '#e5e7eb' } },
      axisLabel
    },
    yAxis: {
      type: 'value',
      name: '分贝',
      nameTextStyle: axisLabel,
      axisLabel,
      splitLine: { lineStyle: { color: '#eef2f7' } }
    },
    series: [
      {
        type: 'line',
        smooth: true,
        data: points.map((point) => point.noise ?? 0),
        lineStyle: { width: 3, color: '#5b8cff' },
        itemStyle: { color: '#5b8cff' },
        areaStyle: { color: '#5b8cff22' }
      }
    ]
  }
}

export function temperatureLineOption(points: TrendPoint[] = []): EChartsOption {
  const labels = points.map((point) => point.time)
  return {
    grid: { left: 16, right: 18, top: 28, bottom: 26, containLabel: true },
    legend: { bottom: 0, itemWidth: 10, itemHeight: 10, textStyle: axisLabel },
    tooltip: { trigger: 'axis' },
    xAxis: {
      type: 'category',
      data: labels,
      axisTick: { show: false },
      axisLine: { lineStyle: { color: '#e5e7eb' } },
      axisLabel
    },
    yAxis: {
      type: 'value',
      name: '℃',
      nameTextStyle: axisLabel,
      axisLabel,
      splitLine: { lineStyle: { color: '#eef2f7' } }
    },
    series: [
      {
        name: '最高气温',
        type: 'line',
        smooth: true,
        data: points.map((point) => point.maxTemperature ?? point.temperature ?? 0),
        lineStyle: { width: 3, color: '#f59e0b' },
        itemStyle: { color: '#f59e0b' }
      },
      {
        name: '最低气温',
        type: 'line',
        smooth: true,
        data: points.map((point) => point.minTemperature ?? point.temperature ?? 0),
        lineStyle: { width: 3, color: '#5b8cff' },
        itemStyle: { color: '#5b8cff' }
      }
    ]
  }
}

export function qualityRingOption(data: Array<{ name: string; value: number }> = []): EChartsOption {
  return {
    legend: { bottom: 0, itemWidth: 10, itemHeight: 10, textStyle: axisLabel },
    tooltip: { trigger: 'item' },
    series: [
      {
        type: 'pie',
        radius: ['48%', '68%'],
        center: ['50%', '44%'],
        data: data.map((item, index) => ({
          ...item,
          itemStyle: { color: ['#34d399', '#3b82f6', '#5b8cff', '#f59e0b', '#ef4444'][index % 5] }
        })),
        label: { show: false }
      }
    ]
  }
}

export function airGaugeOption(name: string, value: number, max: number): EChartsOption {
  return {
    series: [
      {
        type: 'gauge',
        min: 0,
        max,
        radius: '92%',
        axisLine: {
          lineStyle: {
            width: 8,
            color: [
              [0.35, '#34d399'],
              [0.72, '#f59e0b'],
              [1, '#ef4444']
            ]
          }
        },
        pointer: { width: 3 },
        axisTick: { distance: -8, length: 4, lineStyle: { color: '#cbd5e1' } },
        splitLine: { distance: -8, length: 8, lineStyle: { color: '#cbd5e1' } },
        axisLabel: { color: '#f59e0b', fontSize: 9, distance: -22 },
        detail: {
          formatter: `${value} μg/m³`,
          color: '#fb7185',
          fontSize: 12,
          fontWeight: 900,
          offsetCenter: [0, '42%']
        },
        title: {
          color: '#334155',
          fontSize: 16,
          fontWeight: 900,
          offsetCenter: [0, '75%']
        },
        data: [{ value, name }]
      }
    ]
  }
}

export function sevenDayBarOption(points: TrendPoint[] = []): EChartsOption {
  return {
    grid: { left: 16, right: 18, top: 28, bottom: 36, containLabel: true },
    xAxis: {
      type: 'category',
      data: points.map((point) => point.time),
      axisTick: { show: false },
      axisLine: { lineStyle: { color: '#e5e7eb' } },
      axisLabel
    },
    yAxis: {
      type: 'value',
      name: 'AQI',
      nameTextStyle: axisLabel,
      axisLabel,
      splitLine: { lineStyle: { color: '#eef2f7' } }
    },
    series: [
      {
        type: 'bar',
        barWidth: 30,
        data: points.map((point) => point.aqi ?? 0).map((value, index) => ({
          value,
          itemStyle: {
            color: ['#34d399', '#34d399', '#f59e0b', '#3b82f6', '#34d399', '#3b82f6', '#34d399'][index]
          }
        }))
      }
    ]
  }
}
