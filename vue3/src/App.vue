<template>
	<div class="container">
		<h4 id="loading-panel" class="p-2">
			<i class="fas fa-balance-scale fa-3x pb-3"></i>
			<div class="title my-3">DIGITAL COUNTER</div>
			<div class="welcomeback my-3"></div>
			<i class="fas fa-compact-disc fa-spin loading fa-3x my-3 color-dark"></i>
		</h4>

		<!-- Digital Counter (Main Content) -->
		<DigitalCounter />

		<!-- Panel (Records, Settings, etc.) -->
		<Panel v-show="STORE.isShowPanel" />

		<!-- Chart Panel (hidden by default, toggled on demand) -->
		<ChartPanel v-show="STORE.isChartPanelVisible" />

	<footer class="d-flex justify-content-between">
		<p class="ml-auto">Digital Counter v8.0.2</p>
		<p id="percent" class="color-white">{{ (STORE.goalPercent() || '--') + ' %'}}</p>
	</footer>

	</div>
</template>

<script setup>
	import { onMounted } from 'vue'
	import { store as STORE } from '@/store'
	import Cookies from 'js-cookie'
	import { Database, RecordHistory, User } from '@/assets/Classes.js'
	import DigitalCounter from './components/DigitalCounter.vue'
	import Panel from './components/Panel.vue'
	import ChartPanel from './components/ChartPanel.vue'


	// Simulate your init() function from the old code
	async function initApp() {
		STORE.TOKEN = Cookies.get('token') || undefined;
		STORE.USER = Cookies.get('user') || null; // dont pass undefined here!
		STORE.USER = JSON.parse(STORE.USER) || undefined;
		if(STORE.TOKEN && STORE.USER){
			STORE.db = new Database();
			STORE.db.x_signin();
			console.log('User "'+STORE.USER.email+'" is logged in.');
		}
		else{
			bootApp();
		}
	}

	// Example placeholder functions (adapt these with your actual logic)
	function bootApp() {
		console.log('bootApp: setting initial values...');
		fillValues();
		if(STORE.selectedRecord === undefined){
			STORE.setProgress(0);
		}else{
			STORE.setProgress(STORE.goalPercent());
		}
    STORE.isShowSettings = false;
	}

	function fillValues(){
		// if(!STORE.isLoggedIn){
		// 	STORE = Cookies.get();
		// 	if(STORE.records !== undefined) STORE.records = JSON.parse(STORE.records);
		// 	if(STORE.history !== undefined) STORE.history = JSON.parse(STORE.history);
		// }
    //

    const storedData = Cookies.get('store');
    if (storedData) {
      const parsedStore = JSON.parse(storedData);
      Object.assign(STORE, parsedStore);
    }



		// No STORE, meaning cookie is empty, happens on first visit
		if(STORE === undefined) STORE = {};
		if(STORE.history === undefined) STORE.history = new RecordHistory(); // All histories of records
		if(STORE.history.logBooks === undefined) STORE.history.logBooks = [];
		if(STORE.selectedIndex === undefined) STORE.selectedIndex = 0;
		if(STORE.records === undefined) {
			alert("No records yet. Create one ! e.g. أستغفر الله");
			let newRec = new Record(1);
			STORE.records = [newRec];
			STORE.selectedIndex = 0;
		}
		if(STORE.USER === undefined) STORE.USER = new User();
		// /* ensure that every record has Logbook */
		// $.each(STORE.records, function(i, rec){
		// 	if(rec == null){ // delete empty records
		// 		delete STORE.records[i];
		// 	}else{
		// 		if(!STORE.history.logBooks.some(el => el.recordId == rec.id)){
		// 			console.log("Generating daily Log for record ("+rec.title+")");
		// 			STORE.history.logBooks.push(new Logbook(rec.id));
		// 		}
		// 	}
		// });
    // First, remove null elements from the array
    STORE.records = STORE.records.filter(rec => rec !== null);

    // Then, for each remaining record, ensure it has a logbook
    STORE.records.forEach(rec => {
      if (!STORE.history.logBooks.some(el => el.recordId === rec.id)) {
        console.log("Generating daily Log for record (" + rec.title + ")");
        STORE.history.logBooks.push(new Logbook(rec.id));
      }
    });

    STORE.fillSelectedRecord();
		STORE.username = STORE.isLoggedIn ? STORE.USER.displayName : 'Guest';
		STORE.logging();
		if(STORE.settings === undefined){
			STORE.settings = new Settings();
		}
		STORE.save();
		STORE.delayRefreshArr = STORE.settings.delayRefresh ? [10, 100] : [1,1];
	}





	onMounted(async () => {
		try {
			await initApp(); // Run initialization (reading cookies, setting up DB, etc.)
			// Once initialization is done, set isAnimated to true in your store
			STORE.isAnimated = true;
		} catch (error) {
			console.error('Initialization failed:', error);
			initialized.value = true; // Even on error, show the app
		}
	});
</script>


