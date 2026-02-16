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
  data: Array<{ generation: number; count: number }>
}>()

const chartData = computed(() => ({
  labels: props.data.map((d) => `Đời ${d.generation}`),
  datasets: [
    {
      label: 'Số thành viên theo đời',
      data: props.data.map((d) => d.count),
      backgroundColor: '#f59e0b',
      borderColor: '#d97706',
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
      text: 'Số thành viên theo đời',
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
