import { reactive } from 'vue';
import Cookies from 'js-cookie';

import { Record, RecordHistory, Logbook, Log, Settings, autoID } from './assets/Classes';

export const store = reactive({
  version: '8.4',
	// Database & Cookie
	TOKEN: '',
	USER: {},
	db: null,
	cookieOptions: {expires: 3650},
	username: '',
	// Counter & record data
	count: 0,
	today: 0,
	week: 0,
	total: 0,
	target: 100,
	percent: 0,
	selectedIndex: 0,
	records: [],
	settings: {delayRefresh: false},
	delayRefreshArr: [],
	isTouched: false,
	activeChanged: false,
	saveTimeout: null,
	// UI toggles for showing/hiding panels
	isShowPanel: false,
	isShowSettings: false,
	isShowChartPanel: false,
  // App initiated and values loaded - start with false to show loading screen
  isReady: false,

	// Computed property as a getter
	get isLoggedIn(){
		return !(this.TOKEN === undefined || this.TOKEN === '' || this.USER === undefined || this.USER === null || !this.USER.email || this.USER.email === 'null');
	},
  get isShowSettingsBtn(){
    return !this.isShowSettings
  },

	goalPercent(record){
    if(record === undefined) record = this.selectedRecord;
    if(!record) return 0;
		if(record.counterDay === 0)
			return 0;
		if(!record.goal)
			record.goal = 100;
		return parseInt(record.counterDay / record.goal * 100);
	},

	fillSelectedRecord(){
		this.setProgress(this.goalPercent());
		this.activeChanged = true;
	},

	setProgress(value, refreshPercent, counter, today, week, total){
		if(refreshPercent !== undefined && refreshPercent === true) {
			this.percent = value;
		}
		if(counter !== undefined) this.count = counter;
		if(today !== undefined) this.today = today;
		if(week !== undefined) this.week = week;
		if(total !== undefined) this.total = this.thousandFormat(total);
		// this.pulse($progress);
	},

	logging(){
		let today = new Date();
		let lastWriting = new Date(Date.parse(this.history.lastWriting));
		if(lastWriting.getDate() != today.getDate() || lastWriting.getMonth() != today.getMonth() || lastWriting.getFullYear() != today.getFullYear()){
			this.history.lastWriting = today.toLocaleString("en"); // timestamp
			console.log("History is lastWritten today", today.toLocaleString("en"));
			// $.each(this.records, function(i, rec){
			// 	if(rec == null) return;
			// 	if(lastWriting.getWeekNumber() != today.getWeekNumber()){ // new week
			// 		rec.counterWeek = 0;
			// 		this.week = 0;
			// 	}
			// 	$.each(this.history.logBooks, function(j, logBook){
			// 		if(rec.id == logBook.recordId && rec.counterDay > 0){ // no logging if today's log is 0
			// 			let yesterday = new Date();
			// 			yesterday.setDate(yesterday.getDate()-1);
			// 			logBook.logs.push(new Log(yesterday.toLocaleString("en")/* timestamp */, rec.counterDay)); // save the daily every time you save
			// 			rec.counterDay = 0;
			// 		}
			// 	});
			// });
      this.records.forEach(rec => {
        if (!rec) return;
        if (lastWriting.getWeekNumber() !== today.getWeekNumber()) { // new week
          rec.counterWeek = 0;
          this.week = 0;
        }
        this.history.logBooks.forEach(logBook => {
          if (rec.id === logBook.recordId && rec.counterDay > 0) {
            let yesterday = new Date();
            yesterday.setDate(yesterday.getDate() - 1);
            logBook.logs.push(new Log(yesterday.toLocaleString("en"), rec.counterDay));
            rec.counterDay = 0;
          }
        });
      });

      this.save();
			console.log("Logging saved! history: ", this.history);
			// Disable automatic backup for now to prevent conflicts
			// if(this.isLoggedIn && this.db !== undefined && this.db !== null){
			// 	this.db.BACKUP_USER();
			// }
			this.fillSelectedRecord(); /* to refresh cached page when loading app the next day */
		}
	},

	save(toSave){
		if(this.isLoggedIn && this.db){
			this.db.save();
		}else{
			this.saveSTORE(toSave);
		}
	},

	saveSTORE(toSave){
		if(toSave === undefined) toSave = "all";
		if(toSave == "all" || toSave == "records"){
			Cookies.set("records", JSON.stringify(this.records), this.cookieOptions);
		}
		if(toSave == "all" || toSave == "selectedIndex"){
			Cookies.set("selectedIndex", this.selectedIndex, this.cookieOptions);
		}
		if(toSave == "all" || toSave == "history"){
			Cookies.set("history", JSON.stringify(this.history), this.cookieOptions);
		}
		if(toSave == "all" || toSave == "settings"){
			Cookies.set("settings", JSON.stringify(this.settings), this.cookieOptions);
		}
		if(toSave == "logging"){
			var today = new Date();
			var lastWriting = new Date(Date.parse(this.history.lastWriting));
			if(lastWriting.getDate() != today.getDate() || lastWriting.getMonth() != today.getMonth() || lastWriting.getFullYear() != today.getFullYear()){
				this.history.lastWriting = today.toLocaleString("en"); // timestamp
				console.log("History is lastWritten today", today.toLocaleString("en"));
				this.records.forEach((rec, i) => {
					this.history.logBooks.forEach((logBook, j) => {
						if(rec.id == logBook.recordId){
							var yesterday = new Date();
							yesterday.setDate(yesterday.getDate()-1);
							logBook.logs.push(new Log(yesterday.toLocaleString("en")/* timestamp */, rec.counterDay)); // save the daily every time you save
							rec.counterDay = 0;
						}
					});
				});
				Cookies.set("history", this.history, this.cookieOptions);
				console.log("Logging saved!");
			}
		}
		// console.log(toSave == "all" || toSave == "records" ? 'records':'', toSave == "all" || toSave == "selectedIndex" ? 'selectedIndex':'', toSave == "all" || toSave == "history" ? 'history':'', 'saved !');
	},

	increaseCounter(e){
		if(!this.selectedRecord) return;
		if(!e || !(this.isTouched && e.type == 'click')){
			if(e && e.type == 'touchend') this.isTouched = true;
			this.selectedRecord.counter++;
			this.selectedRecord.counterDay++;
			this.selectedRecord.counterWeek++;
			this.selectedRecord.total++;
			let counter = this.selectedRecord.counter % this.delayRefreshArr[0] == 0 ? this.selectedRecord.counter : undefined;
			let today = this.selectedRecord.counterDay % this.delayRefreshArr[0] == 0 ? this.selectedRecord.counterDay : undefined;
			let week = this.selectedRecord.counterWeek % this.delayRefreshArr[1] == 0 ? this.selectedRecord.counterWeek : undefined;
			let total = this.selectedRecord.total % this.delayRefreshArr[1] == 0 ? this.selectedRecord.total : undefined;
			this.setProgress(this.goalPercent(), true, counter, today, week, total);
			this.saveSelectedRecord();
			// if(this.selectedRecord.counter % 100 == 0) this.pulse($counter, 1);
			// if(this.selectedRecord.counterDay % 100 == 0) this.pulse($today, 2);
			// if(this.selectedRecord.counterWeek % 100 == 0) this.pulse($week, 1);
			// if(this.selectedRecord.total % 100 == 0) this.pulse($total, 1);
		}
	},

	saveSelectedRecord(){
		this.records[this.selectedIndex] = this.selectedRecord;
		// Debounce saves to prevent too frequent Firestore writes
		if (this.saveTimeout) {
			clearTimeout(this.saveTimeout);
		}
		this.saveTimeout = setTimeout(() => {
			this.save();
		}, 1000); // Save after 1 second of no activity
	},

	reset() {
		this.count = 0;
		this.selectedRecord.counter = 0;
		this.saveSelectedRecord();
	},

	togglePanel(){
		this.isShowPanel = !this.isShowPanel;
    this.isShowSettings = !this.isShowPanel;
	},

	showPanel(){
		this.isShowPanel = true;
	},

	showRecords(){
		// This will be handled by the Panel component
		console.log('showRecords called');
	},

	bootApp(){
		console.log('bootApp called from store');
		// Most of the bootApp logic is already in App.vue's fillValues
	},

	closePanel(){
		// this.pulse($('#showPanel'), 2); // pulse action is best to remain in the component directly not in store
		if(this.activeChanged){
			// this.pulseAll();
			this.activeChanged = false;
		}
    this.isShowPanel = false;
	},

  doSelectRecord(recID){
		if(recID === undefined){
			this.selectedIndex = 0;
			return;
		}
		else{
			for(let i = 0; i < this.records.length; i++){
				if(this.records[i].id == recID){
					this.selectedIndex = i;
					break;
				}
			}
		}
		// Use debounced save for selecting records too
		if (this.saveTimeout) {
			clearTimeout(this.saveTimeout);
		}
		this.saveTimeout = setTimeout(() => {
			this.save();
		}, 1000); // Increased delay to prevent conflicts
	},

	get selectedRecord() {
		if(this.records.length === 0){
			return new Record();
		}else{
			return this.records[this.selectedIndex];
		}
	},







  toggleSettings(){
    this.isShowSettings = !this.isShowSettings;
    // $panel.find('#add-record-input').focus();
    // pulse($('#showSettings'), 2);
  },

	// HELPERS
	thousandFormat(n){
		if (n < 1000) return n;
		else if (n >= 1000 && n < 1000000) return +(n / 1000).toFixed(1) + "K";
		else if (n >= 1000000 && n < 1000000000) return +(n / 1000000).toFixed(1) + "M";
	},


});
