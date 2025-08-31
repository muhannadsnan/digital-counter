<template>
  <main>
    <div class="container" :class="{animated: STORE.isReady}">
      <h4 id="loading-panel" class="p-2" v-show="!STORE.isReady">
        <i class="fas fa-balance-scale fa-3x pb-3"></i>
        <div class="title my-3">DIGITAL COUNTER</div>
        <div class="my-3">
          <i class="fas fa-compact-disc fa-spin loading fa-3x my-3 color-dark"></i>
        </div>
      </h4>

      <!-- Digital Counter (Main Content) -->
      <DigitalCounter v-show="STORE.isReady" />

      <!-- Panel (Records, Settings, etc.) -->
      <Panel v-show="STORE.isShowPanel && STORE.isReady" />

      <!-- Chart Panel (hidden by default, toggled on demand) -->
      <ChartPanel v-show="STORE.isChartPanelVisible" />

      <footer class="d-flex justify-content-between" v-show="STORE.isReady">
        <p class="ml-auto">Digital Counter v{{ STORE.version }}</p>
        <p id="percent" class="color-white">{{ STORE.goalPercent() + '%' }}</p>
      </footer>

    </div>
  </main>
</template>

<script setup>
	import { onMounted } from 'vue'
	import { store as STORE } from '@/store'
	import Cookies from 'js-cookie'
	import { Database, RecordHistory, User, Record, Logbook, Settings, Log } from '@/assets/Classes.js'
	import DigitalCounter from './components/DigitalCounter.vue'
	import Panel from './components/Panel.vue'
	import ChartPanel from './components/ChartPanel.vue'

	// Simulate your init() function from the old code
	async function initApp() {
		// Only initialize Database once
		if (!STORE.db) {
			STORE.db = new Database(STORE);
		}
		
		STORE.TOKEN = Cookies.get('token') || undefined;
		STORE.USER = Cookies.get('user') || null; // dont pass undefined here!
		try {
			STORE.USER = STORE.USER ? JSON.parse(STORE.USER) : undefined;
		} catch(e) {
			STORE.USER = undefined;
		}
		
		if(STORE.TOKEN && STORE.USER){
			console.log('User "'+STORE.USER.email+'" is logged in.');
			// Return a promise that resolves when x_signin is complete
			return new Promise((resolve) => {
				// Wait for Firebase to fully stabilize
				setTimeout(() => {
					if (STORE.db && STORE.db.firebase_db) {
						STORE.db.x_signin(() => {
							// Callback when x_signin is complete
							resolve();
						});
					} else {
						console.log('Firebase not ready yet, using local storage');
						bootApp();
						resolve();
					}
				}, 2000);
			});
		}
		else{
			console.log('User is not logged in - using local storage');
			bootApp();
			return Promise.resolve();
		}
	}
	
	// Make bootApp available on store for Database class
	STORE.bootApp = bootApp;
	STORE.showRecords = () => {
		// Trigger a re-render of records
		console.log('showRecords called from store');
	};

	// Example placeholder functions (adapt these with your actual logic)
	function bootApp() {
		// console.log('bootApp: setting initial values...');
		fillValues();
		if(STORE.selectedRecord === undefined){
			STORE.setProgress(0);
		}else{
			STORE.setProgress(STORE.goalPercent());
		}
    STORE.isShowSettings = false;
	}

	function fillValues(){
		// Load data from cookies if not logged in
		if(!STORE.isLoggedIn){
			// Load individual cookie values
			if(Cookies.get('records') !== undefined) {
				try {
					STORE.records = JSON.parse(Cookies.get('records'));
				} catch(e) {
					console.error('Error parsing records from cookie:', e);
				}
			}
			if(Cookies.get('history') !== undefined) {
				try {
					STORE.history = JSON.parse(Cookies.get('history'));
				} catch(e) {
					console.error('Error parsing history from cookie:', e);
				}
			}
			if(Cookies.get('selectedIndex') !== undefined) {
				STORE.selectedIndex = parseInt(Cookies.get('selectedIndex')) || 0;
			}
			if(Cookies.get('settings') !== undefined) {
				try {
					STORE.settings = JSON.parse(Cookies.get('settings'));
				} catch(e) {
					console.error('Error parsing settings from cookie:', e);
				}
			}
		}

		// Initialize missing properties
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
		if(STORE.settings === undefined) STORE.settings = new Settings();
    STORE.delayRefreshArr = STORE.settings.delayRefresh ? [10, 100] : [1,1];
    STORE.save();
	}





	onMounted(async () => {
		try {
			await initApp(); // Run initialization and wait for data to be fetched
			// Now that data is fully loaded, show the app
			STORE.isReady = true;
		} catch (error) {
			console.error('Initialization failed:', error);
			STORE.isReady = true; // Even on error, show the app
		}
	});
</script>


