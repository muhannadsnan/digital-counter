<template>
    <div class="record-list">
      <div v-for="record in store.records" :key="record.id" @click="storeselectRecord(record.id)" 
	  		data-id="record.id" data-title="record.title" data-counter-log="record.counterDay" data-goal="record.goal"
			class="record d-flex flex-col" :class="{'color-primary active': store.selectedRecord.id == record.id}">
        <div class="record-body">
            <span class="today">{{ (record.counterDay || 0) + ' today' }}</span>
            <span class="progress">{{ store.goalPercent(record.counterDay, record.goal) }}</span>
            <div class="title">
				<i class="done fas fa-check color-green p-0" :class="{'d-none': percent < 100}"></i>
				<span class="label">{{ record.title }}</span>
			</div>
        </div>
        <button class="details pos-right px-3 py-2"><i class="fas fa-ellipsis-v show"></i> <i class="fas fa-angle-up close"></i></button>
        <div class="dropdown transition trans-height px-2 float-right">
            <div class="mt-1 col-6">
                <p class="d-flex justify-content-between total">TOTAL <span>{{ record.total }}</span></p>
                <p class="d-flex justify-content-between goal">DAILY GOAL <span>{{ record.goal }}</span></p>
            </div>
            <div class="buttons d-flex justify-content-between mt-1">
                <button class="deleteRecord px-0 mx-0"><i class="far fa-trash-alt px-3"></i><small>remove</small></button>
                <button class="changeTitle px-0 mx-0"><i class="far fa-pen-square px-3"></i><small>edit</small></button>
                <button class="changeGoal px-0 mx-0"><i class="fas fa-sort-amount-up px-3"></i><small>goal</small></button>
                <button class="showChart px-0 mx-0"><i class="fas fa-chart-line px-3"></i><small>charts</small></button>
            </div>
        </div>
    </div>
    </div>
  </template>
  
  <script setup>
  	import { store } from '@/store'
  </script>
  