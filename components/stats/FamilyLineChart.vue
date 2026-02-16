<template>
  <Bar :data="chartData" :options="chartOptions" />
</template>

<script setup lang="ts">
import { Bar } from 'vue-chartjs'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js'

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend)

const props = defineProps<{
  data: Array<{ name: string; count: number }>
}>()

const colors = [
  '#f59e0b', '#3b82f6', '#10b981', '#ef4444', '#8b5cf6',
  '#ec4899', '#06b6d4', '#84cc16', '#f97316', '#6366f1',
]

const chartData = computed(() => ({
  labels: props.data.map((d) => d.name),
  datasets: [
    {
      label: 'Số thành viên',
      data: props.data.map((d) => d.count),
      backgroundColor: props.data.map((_, i) => colors[i % colors.length]),
      borderColor: props.data.map((_, i) => colors[i % colors.length]),
      borderWidth: 1,
      borderRadius: 4,
    },
  ],
}))

const chartOptions = {
  indexAxis: 'y' as const,
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: { display: false },
    title: {
      display: true,
      text: 'Số thành viên theo dòng họ',
      font: { size: 14, weight: 'bold' as const },
    },
  },
  scales: {
    x: {
      beginAtZero: true,
      ticks: { stepSize: 1 },
    },
  },
}
</script>
