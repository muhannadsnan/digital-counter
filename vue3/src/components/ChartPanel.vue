<template>
    <div id="chart-panel" class="chart-panel d-flex transition trans-left trans-right">
        <div class="w-100 container border border-grey">
            <button @click="store.toggleChartPanel" class="close p-2 pos-right"><i class="fas fa-times-circle"></i></button>
            <div class="title p-1">
                <label class="color-grey">Show</label>
                <select v-model="showBy" @change="updateChart" class="showBy">
                    <option value="7-days">7 days</option>
                    <option value="30-days">30 days</option>
                    <option value="today-all" disabled>Today - all</option>
                    <option value="week" disabled>Week</option>
                    <option value="month" disabled>Month</option>
                    <option value="year" disabled>Year</option>
                </select>
            </div>
            <p class="total font-4"><small>TOTAL</small> <span></span></p>
            <div id="chart-container" class="chart-container"></div>
            <div v-if="loading" class="loading d-flex"><i class="fas fa-compact-disc fa-spin"></i></div>
        </div>
    </div>
  </template>
  
  <script setup>
  import { ref } from 'vue'
  import { store } from '@/store'
  
  const showBy = ref('7-days')
  const loading = ref(false)
  
  function updateChart() {
    loading.value = true
    // Insert chart drawing logic here (e.g. using CanvasJS or Chart.js)
    // For demonstration, simulate a short delay
    setTimeout(() => {
      loading.value = false
    }, 800)
  }
  </script>
  