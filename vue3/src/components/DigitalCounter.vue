<template>
    <!-- Clickable area to increment counter -->
    <div id="clicker" @click="store.increaseCounter" @touchend="store.increaseCounter"></div>

    <button id="reset" @click="store.reset" class="p-2"><i class="fas fa-redo"></i></button>
    <p id="counter" class="pt-2">{{ store.selectedRecord.counter }}</p>
    <button id="showPanel" @click="store.togglePanel" class="position-right p-2" ref="showPanelBtn"><i class="fas fa-cog"></i></button>

    <div class="main">
        <p id="recordTitle">{{ store.selectedRecord.title }}</p>
        <div id="progress" :class="{'color-green': store.percent >= 100}">
            <div class="val c-0 trans-all-5s trans-width-delay-08s" :class="{'c-100 goal-achieved': store.percent >= 100, [`c-${store.percent%100}`]: store.percent < 100}">
                <span class="goal-achieved-label label justify-content-center align-items-center"><i class="fas fa-star fa-2x mb-2 pb-2 "></i>DAILY GOAL</span>
            </div>
        </div>
        <div class="info">
            <div class="user color-secondary mb-3">
                <i class="far fa-user"></i>
                <span id="user" class="number">{{ store.username }}</span>
            </div>
            <div class="today d-flex justify-content-center color-white mb-1">
                <span class="label mr-2">Today</span>
                <span id="today" class="number">{{ store.selectedRecord.counterDay }}</span>
            </div>
            <div class="week d-flex justify-content-center mb-1">
                <span class="label mr-2">This week</span>
                <span id="week" class="number m-0">{{ store.selectedRecord.counterWeek }}</span>
            </div>
            <div class="total d-flex justify-content-center mb-1">
                <span class="label mr-2">Total</span>
                <span id="total" class="number m-0">{{ store.selectedRecord.total }}</span>
            </div>
        </div>
    </div>
</template>

<script setup>
    import { ref } from 'vue'
    import { store } from '@/store'

    function pulse($element, i){
		if(i === undefined) i = 0;
		var types = ['pulse', 'pulseText', 'pulseTextLong', 'pulseLong'];
		$element.removeClass(types);
		$element.width();
		$element.addClass(types[i]);
	}
</script>
