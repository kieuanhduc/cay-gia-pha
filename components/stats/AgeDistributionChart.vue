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
  data: Array<{ range: string; count: number }>
}>()

const rangeLabels: Record<string, string> = {
  '0-20': '0 - 20 tuổi',
  '21-40': '21 - 40 tuổi',
  '41-60': '41 - 60 tuổi',
  '61-80': '61 - 80 tuổi',
  '80+': 'Trên 80 tuổi',
}

const chartData = computed(() => ({
  labels: props.data.map((d) => rangeLabels[d.range] || d.range),
  datasets: [
    {
      label: 'Số người',
      data: props.data.map((d) => d.count),
      backgroundColor: ['#34d399', '#60a5fa', '#fbbf24', '#f87171', '#a78bfa'],
      borderColor: ['#059669', '#2563eb', '#d97706', '#dc2626', '#7c3aed'],
      borderWidth: 1,
      borderRadius: 4,
    },
  ],
}))

const chartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: { display: false },
    title: {
      display: true,
      text: 'Phân bố độ tuổi',
      font: { size: 14, weight: 'bold' as const },
    },
  },
  scales: {
    y: {
      beginAtZero: true,
      ticks: { stepSize: 1 },
    },
  },
}
</script>
