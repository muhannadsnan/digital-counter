import { reactive } from 'vue';
import { Record } from './assets/Classes';

export const store = reactive({
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
	settings: {},
	delayRefreshArr: [],
	isAnimated: false,
	isTouched: false,
	activeChanged: false,


	// UI toggles for showing/hiding panels
	isShowPanel: false,
	isShowSettings: false,
	isShowChartPanel: false,

	// Computed property as a getter
	get isLoggedIn(){
		return !(this.TOKEN === undefined || this.TOKEN === '' || this.USER === undefined || this.USER.email === 'null');
	},

	goalPercent(counterDay, goal){
		if(counterDay === undefined) counterDay = parseInt(this.selectedRecord.counterDay);
		if(goal === undefined) goal = parseInt(this.selectedRecord.goal);
		if(counterDay == 0) 
			return 0;
		if(goal == 0 || goal === null || goal === undefined) 
			goal = 100;
		return parseInt(counterDay/goal*100);
	},

	// Computed property for progress percentage
	get progressPercentage() {
		return Math.min(100, (this.count / this.target) * 100);
	},

	fillSelectedRecord(){
		this.setProgress(gPercent);
		this.activeChanged = true;
	},

	setProgress(value, refreshPercent, counter, today, week, total){
		if(refreshPercent !== undefined) this.percent = value+' %';
		if(counter !== undefined) this.counter = counter;
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
			$.each(this.records, function(i, rec){
				if(rec == null) return;
				if(lastWriting.getWeekNumber() != today.getWeekNumber()){ // new week
					rec.counterWeek = 0;
					this.week = 0;
				}
				$.each(this.history.logBooks, function(j, logBook){
					if(rec.id == logBook.recordId && rec.counterDay > 0){ // no logging if today's log is 0
						let yesterday = new Date();
						yesterday.setDate(yesterday.getDate()-1);
						logBook.logs.push(new Log(yesterday.toLocaleString("en")/* timestamp */, rec.counterDay)); // save the daily every time you save
						rec.counterDay = 0;
					}
				});
			});
			this.save();
			console.log("Logging saved! history: ", this.history);
			if(this.isLoggedIn && db !== undefined){
				this.db.BACKUP_USER();
			}
			this.fillSelectedRecord(); /* to refresh cached page when loading app the next day */
		}
	},

	save(toSave){
		if(this.isLoggedIn()){
			this.db.save();
		}else{
			this.saveSTORE(toSave);
		}
	},

	saveSTORE(toSave){
		if(toSave === undefined) toSave = "all";
		if(toSave == "all" || toSave == "records"){
			Cookies.set("records", this.records, this.cookieOptions);
		}
		if(toSave == "all" || toSave == "selectedIndex"){
			Cookies.set("selectedIndex", this.selectedIndex, this.cookieOptions);
		}
		if(toSave == "all" || toSave == "history"){
			Cookies.set("history", this.history, this.cookieOptions);
		}
		if(toSave == "logging"){
			var today = new Date();
			var lastWriting = new Date(Date.parse(this.history.lastWriting));
			if(lastWriting.getDate() != today.getDate() || lastWriting.getMonth() != today.getMonth() || lastWriting.getFullYear() != today.getFullYear()){
				this.history.lastWriting = today.toLocaleString("en"); // timestamp
				console.log("History is lastWritten today", today.toLocaleString("en"));
				$.each(this.records, function(i, rec){
					$.each(this.history.all, function(j, logBook){
						if(rec.id == logBook.recordId){
							var yesterday = new Date();
							yesterday.setDate(yesterday.getDate()-1);
							logBook.logs.push(new Log(yesterday.toLocaleString("en")/* timestamp */, rec.counterLog)); // save the daily every time you save
							rec.counterLog = 0;
						}
					});
				});
				Cookies.set("history", this.history, this.cookieOptions);
				console.log("Logging saved!");
			}
		}
		console.log(toSave == "all" || toSave == "records" ? 'records':'', toSave == "all" || toSave == "selectedIndex" ? 'selectedIndex':'', toSave == "all" || toSave == "history" ? 'history':'', 'saved !'); 
	},

	increaseCounter(e){
		if(!(this.isTouched && e.type == 'click')){
			if(e.type == 'touchend') this.isTouched = true;
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
		this.save();
	},

	reset() {
		this.count = 0;
		this.selectedRecord.counter = 0; 
		this.saveSelectedRecord();
	},

	togglePannel(){
		if(this.isShowPanel){
			this.isShowSettings = false;
		}
		this.isShowPanel = !this.isShowPanel;
	},

	showPanel(){
		this.togglePannel();
	},

	closePanel(){
		// this.pulse($('#showPanel'), 2); // pulse action is best to remain in the component directly not in store
		if(this.activeChanged){
			// this.pulseAll();
			this.activeChanged = false;
		}
		this.togglePannel();
	},

	selectRecord(recID){
		if(recID === undefined){
			this.selectedIndex = 0;
			return;
		}
		else{
			$.each(this.records, function(i, rec){
				if(rec.id == recID){
					this.selectedIndex = i;
					return false;
				}
			});   
		}
		this.save();
	},

	get selectedRecord() {
		if(this.records.length === 0){
			return { id: 1, title: 'Default Record', counter: 0, counterDay: 0, counterWeek: 0, total: 0 };
		}else{
			return this.records[this.selectedIndex];
		}
	},

	







	// HELPERS
	thousandFormat(n){
		if (n < 1000) return n;
		else if (n >= 1000 && n < 1000000) return +(n / 1000).toFixed(1) + "K";
		else if (n >= 1000000 && n < 1000000000) return +(n / 1000000).toFixed(1) + "M";
	},
	

});
