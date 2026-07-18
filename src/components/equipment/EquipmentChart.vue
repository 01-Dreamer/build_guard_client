<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref, watch } from 'vue'
import * as echarts from 'echarts'
import type { EChartsOption } from 'echarts'
import { Aim } from '@element-plus/icons-vue'

const props = defineProps<{
  title: string
  option: EChartsOption
}>()

const chartRef = ref<HTMLDivElement>()
let chart: echarts.ECharts | null = null
let resizeObserver: ResizeObserver | null = null

function renderChart() {
  if (!chartRef.value) return

  if (!chart) {
    chart = echarts.init(chartRef.value)
  }

  chart.setOption(props.option, true)
}

onMounted(() => {
  renderChart()
  if (chartRef.value) {
    resizeObserver = new ResizeObserver(() => chart?.resize())
    resizeObserver.observe(chartRef.value)
  }
})

watch(() => props.option, renderChart, { deep: true })

onBeforeUnmount(() => {
  resizeObserver?.disconnect()
  chart?.dispose()
})
</script>

<template>
  <section class="equipment-panel chart-card">
    <h2>
      <el-icon>
        <Aim />
      </el-icon>
      {{ title }}
    </h2>
    <div ref="chartRef" class="chart-canvas" />
  </section>
</template>

<style scoped>
.chart-card {
  display: grid;
  grid-template-rows: auto minmax(0, 1fr);
  min-height: 0;
}

.chart-canvas {
  width: 100%;
  min-width: 0;
  min-height: 140px;
}
</style>
