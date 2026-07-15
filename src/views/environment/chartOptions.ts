import type { EChartsOption } from 'echarts'

const axisLabel = {
  color: '#64748b',
  fontSize: 11,
  fontWeight: 700
}

const dayLabels = ['12时', '15时', '18时', '21时', '00时', '03时', '06时', '09时']

export function airQualityLineOption(): EChartsOption {
  return {
    grid: { left: 16, right: 18, top: 28, bottom: 26, containLabel: true },
    legend: { bottom: 0, itemWidth: 10, itemHeight: 10, textStyle: axisLabel },
    tooltip: { trigger: 'axis' },
    xAxis: {
      type: 'category',
      data: dayLabels,
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
        data: [20, 20, 2, 1, 1, 1, 1, 22],
        lineStyle: { width: 3, color: '#22c55e' },
        itemStyle: { color: '#22c55e' }
      },
      {
        name: 'PM10',
        type: 'line',
        smooth: true,
        data: [24, 158, 2, 0, 0, 0, 0, 24],
        lineStyle: { width: 3, color: '#5b8cff' },
        itemStyle: { color: '#5b8cff' },
        areaStyle: { color: '#5b8cff22' }
      }
    ]
  }
}

export function noiseLineOption(): EChartsOption {
  return {
    grid: { left: 16, right: 18, top: 28, bottom: 8, containLabel: true },
    tooltip: { trigger: 'axis' },
    xAxis: {
      type: 'category',
      data: dayLabels,
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
        data: [22, 61, 4, 1, 1, 1, 1, 21],
        lineStyle: { width: 3, color: '#5b8cff' },
        itemStyle: { color: '#5b8cff' },
        areaStyle: { color: '#5b8cff22' }
      }
    ]
  }
}

export function temperatureLineOption(): EChartsOption {
  return {
    grid: { left: 16, right: 18, top: 28, bottom: 26, containLabel: true },
    legend: { bottom: 0, itemWidth: 10, itemHeight: 10, textStyle: axisLabel },
    tooltip: { trigger: 'axis' },
    xAxis: {
      type: 'category',
      data: ['09-19', '09-21', '09-23', '09-24', '09-26', '09-28', '09-30'],
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
        data: [0, 0, 0, 36, 30, 30, 8],
        lineStyle: { width: 3, color: '#f59e0b' },
        itemStyle: { color: '#f59e0b' }
      },
      {
        name: '最低气温',
        type: 'line',
        smooth: true,
        data: [0, 0, 0, -9, 14, 14, 7],
        lineStyle: { width: 3, color: '#5b8cff' },
        itemStyle: { color: '#5b8cff' }
      }
    ]
  }
}

export function qualityRingOption(): EChartsOption {
  return {
    legend: { bottom: 0, itemWidth: 10, itemHeight: 10, textStyle: axisLabel },
    tooltip: { trigger: 'item' },
    series: [
      {
        type: 'pie',
        radius: ['48%', '68%'],
        center: ['50%', '44%'],
        data: [
          { name: '优', value: 16, itemStyle: { color: '#34d399' } },
          { name: '良', value: 42, itemStyle: { color: '#3b82f6' } },
          { name: '轻度污染', value: 18, itemStyle: { color: '#5b8cff' } },
          { name: '中度污染', value: 7, itemStyle: { color: '#f59e0b' } },
          { name: '重度污染', value: 6, itemStyle: { color: '#ef4444' } }
        ],
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

export function sevenDayBarOption(): EChartsOption {
  return {
    grid: { left: 16, right: 18, top: 28, bottom: 36, containLabel: true },
    xAxis: {
      type: 'category',
      data: ['09-23', '09-24', '09-25', '09-26', '09-28', '09-29', '09-30'],
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
        data: [0, 22, 104, 91, 22, 62, 46].map((value, index) => ({
          value,
          itemStyle: {
            color: ['#34d399', '#34d399', '#f59e0b', '#3b82f6', '#34d399', '#3b82f6', '#34d399'][index]
          }
        }))
      }
    ]
  }
}
