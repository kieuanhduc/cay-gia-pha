<template>
  <Doughnut :data="chartData" :options="chartOptions" />
</template>

<script setup lang="ts">
import { Doughnut } from 'vue-chartjs'
import {
  Chart as ChartJS,
  ArcElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js'

ChartJS.register(ArcElement, Title, Tooltip, Legend)

const props = defineProps<{
  data: { male: number; female: number }
}>()

const chartData = computed(() => ({
  labels: ['Nam', 'Nữ'],
  datasets: [
    {
      data: [props.data.male, props.data.female],
      backgroundColor: ['#3b82f6', '#ec4899'],
      borderColor: ['#2563eb', '#db2777'],
      borderWidth: 2,
    },
  ],
}))

const chartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      position: 'bottom' as const,
      labels: { padding: 20, usePointStyle: true },
    },
    title: {
      display: true,
      text: 'Tỷ lệ giới tính',
      font: { size: 14, weight: 'bold' as const },
    },
  },
}
</script>
