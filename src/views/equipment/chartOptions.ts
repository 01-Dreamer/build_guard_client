import type { EChartsOption } from 'echarts'

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

export function alarmTrendOption(): EChartsOption {
  return {
    grid: { left: 8, right: 10, top: 28, bottom: 8, containLabel: true },
    tooltip: { trigger: 'axis' },
    legend: { bottom: 0, itemWidth: 10, itemHeight: 10, textStyle: axisLabel },
    xAxis: {
      type: 'category',
      data: ['11-25', '11-26', '11-27', '11-28', '11-29', '11-30', '12-01'],
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
        data: [0, 0, 1, 9, 0, 0, 0],
        lineStyle: { width: 3, color: '#ef4444' },
        itemStyle: { color: '#ef4444' },
        areaStyle: { color: '#ef444422' }
      },
      {
        name: '预警数量',
        type: 'line',
        smooth: true,
        data: [0, 0, 0, 1, 0, 0, 0],
        lineStyle: { width: 2, color: '#f59e0b' },
        itemStyle: { color: '#f59e0b' }
      }
    ]
  }
}

export function pieOption(labels: string[]): EChartsOption {
  return {
    tooltip: { trigger: 'item' },
    series: [
      {
        type: 'pie',
        radius: ['28%', '68%'],
        center: ['52%', '54%'],
        data: labels.map((name, index) => ({
          name,
          value: [36, 22, 18, 10, 8, 6, 4][index] ?? 5
        })),
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
