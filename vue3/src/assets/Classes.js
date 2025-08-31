import Cookies from 'js-cookie';

export class Record{
    constructor(id, title, counter, goal, total, isActive, counterDay, counterWeek){
        // this.id = uniqID();
        this.id = id || null;
        this.title = title || "Counter 01";
        this.counter = counter || 0;
        this.goal = goal || 100;
        this.total = total || 0;
        this.counterDay = counterDay || 0;
        this.counterWeek = counterWeek || 0;
        this.print();
    }
    print(){
        // console.log("Record instantiated!");
    }
}

export class RecordHistory{
    constructor(logBooks, lastWriting){
        this.logBooks = logBooks || [];
        this.lastWriting = lastWriting || 0;
        this.print();
    }
    print(){
        // console.log("RecordHistory instantiated!");
    }
}

export class Log{
    constructor(date, value){
        this.date = date || null;
        this.value = value || 0;
        this.print();
    }
    print(){
        // console.log("Log instantiated!");
    }
}

export class Logbook{
    constructor(recordId, logs, weekly, monthly, yearly){
        this.recordId = recordId || 0;
        this.logs = [];
        if(logs !== undefined && logs !== null)
            this.logs.push(logs);
        this.print();
    }
    print(){
        // console.log("Logbook instantiated! id: "+this.recordId);
    }
}

export class Settings{
    constructor(delayRefresh){
        this.delayRefresh = delayRefresh || true;
        this.print();
    }
    print(){
        // console.log("Settings initiated..", this);
    }
}

export class User{
    constructor(displayName, email){
        this.displayName = displayName || 'Guest';
        this.email = email || '';
    }
}

export class Database{
    constructor(store){
        this.store = store;
        this.firebase_db = null;
        this.dbCollection = null;
        this.isSaving = false;
        this.isFetching = false;
        this.saveQueue = [];
        this.init();
    }

    init(){
        if (typeof firebase !== 'undefined') {
            try {
                // Check if Firebase app is already initialized
                if (!firebase.apps.length) {
                    firebase.initializeApp({
                        apiKey: 'AIzaSyBP196irDbj3NgzWnTggEV_5XQJlNhRL5k',
                        authDomain: 'test-firebase-597da.firebaseapp.com',
                        projectId: 'test-firebase-597da'
                    });
                }
                
                this.firebase_db = firebase.firestore();
                
                // Disable persistence to avoid conflicts
                // The assertion error might be related to persistence cache conflicts
                
                this.dbCollection = this.firebase_db.collection("counter-users");
                console.log("DB connection established.");
            } catch (error) {
                console.error("Error initializing Firebase:", error);
            }
        } else {
            console.error("Firebase SDK not loaded");
        }
    }

    fetchUser(username){
        if (!this.dbCollection) {
            return Promise.reject("Database not initialized");
        }
        
        // Create a timeout promise to prevent hanging
        const timeoutPromise = new Promise((_, reject) => {
            setTimeout(() => reject(new Error("Firestore fetch timeout")), 5000);
        });
        
        // Race between the actual fetch and the timeout
        const fetchPromise = this.dbCollection.doc(username).get();
        
        return Promise.race([fetchPromise, timeoutPromise]);
    }

    do_signin(provider){
        const self = this;
        // IMPORTANT: when running from localhost, use a web server to load the html page, so that google signin works:
        // > python3 -m http.server 1234  // then go to http://localhost:1234/
        firebase.auth().signInWithPopup(provider)
            .then(function(result) {
                self.store.TOKEN = result.credential.accessToken;
                self.store.USER = result.user;
                console.log(self.store.isLoggedIn ? "You are signed in!!" : "still stated as not signed in..");
                Cookies.set("token", self.store.TOKEN, self.store.cookieOptions);
                Cookies.set("user", JSON.stringify(self.store.USER), self.store.cookieOptions);
                // Always call x_signin after successful login
                self.x_signin();
           });
    }

    x_signin(callback){
        const self = this;
        // Add a delay to ensure Firebase is fully initialized
        setTimeout(() => {
            this.fetchUserData().then(function(result){
                if(result == "NO SUCH EMAIL EXISTS BEFORE"){ // SAVE cookie-store, WARNING: overwrite database in cloud
                    // json-parse the cookie-store before it is saved to cloud
                    if(Cookies.get('history') !== undefined && typeof Cookies.get('history') == 'string')
                        self.store.history = JSON.parse(Cookies.get('history'));
                    if(Cookies.get('records') !== undefined && typeof Cookies.get('records') == 'string')
                        self.store.records = JSON.parse(Cookies.get('records'));
                    if(Cookies.get('settings') !== undefined && typeof Cookies.get('settings') == 'string')
                        self.store.settings = JSON.parse(Cookies.get('settings'));
                    // Delay the initial save to prevent conflicts
                    setTimeout(() => {
                        self.save(); // !! cookies-store upload !!
                    }, 500);
                    self.store.bootApp();
                }else{
                    self.store.bootApp();
                    self.store.showRecords();
                }
                if (callback) callback();
            })
            .catch(function(error){
                console.error("Failed to signin:", error);
                // Continue with local storage if Firebase fails
                self.store.bootApp();
                if (callback) callback();
            })
        }, 100);
    }

    fetchUserData(){
        const self = this;
        return new Promise(function(resolve, reject) {
            if (!self.store.USER || !self.store.USER.email) {
                resolve("NO SUCH EMAIL EXISTS BEFORE");
                return;
            }
            
            // Check if Firebase is properly initialized
            if (!self.dbCollection) {
                console.log("Database collection not ready, using local storage");
                resolve("NO SUCH EMAIL EXISTS BEFORE");
                return;
            }
            
            // Prevent multiple simultaneous fetches
            if (self.isFetching) {
                console.log("Already fetching user data, skipping...");
                resolve("NO SUCH EMAIL EXISTS BEFORE");
                return;
            }
            
            self.isFetching = true;
            
            self.fetchUser(self.store.USER.email).then(function(docRef){
                if(!docRef.exists || docRef.data() === undefined){ // SAVE cookie-store
                    resolve("NO SUCH EMAIL EXISTS BEFORE");
                }else{
                    const userData = docRef.data() || false;
                    if(userData){
                        // Update store with fetched data, but preserve the database instance
                        const currentDb = self.store.db;
                        if (userData.records) self.store.records = userData.records;
                        if (userData.history) self.store.history = userData.history;
                        if (userData.selectedIndex !== undefined) self.store.selectedIndex = userData.selectedIndex;
                        if (userData.settings) self.store.settings = userData.settings;
                        self.store.db = currentDb; // Restore database instance
                        self.isFetching = false;
                        resolve(true); // when successful
                    }else{
                        self.isFetching = false;
                        reject("No data found. Try another account.");
                    }
                }
                self.isFetching = false;
            })
            .catch(function(error){
                self.isFetching = false;
                // If document doesn't exist, that's okay for new users
                if (error.code === 'not-found' || error.code === 'permission-denied') {
                    resolve("NO SUCH EMAIL EXISTS BEFORE");
                } else {
                    console.error("Firestore fetch error:", error);
                    // Continue with local storage on any error
                    resolve("NO SUCH EMAIL EXISTS BEFORE");
                }
            });
        });
    }

    signOut(){
        firebase.auth().signOut();
    }

    save(){
        if(this.store.records === undefined || this.store.records.length == 0){
            console.log("Cannot save empty STORE!");
            return Promise.resolve();
        }
        if (!this.dbCollection) {
            console.error("Database not initialized");
            return Promise.resolve();
        }
        if (!this.store.USER || !this.store.USER.email) {
            console.error("No user email for saving");
            return Promise.resolve();
        }
        
        // If already saving, queue this save for later
        if (this.isSaving) {
            return new Promise((resolve) => {
                this.saveQueue.push(resolve);
            });
        }
        
        this.isSaving = true;
        
        // Create a clean copy of store data for saving
        const dataToSave = {
            records: JSON.parse(JSON.stringify(this.store.records)),
            history: JSON.parse(JSON.stringify(this.store.history)),
            selectedIndex: this.store.selectedIndex,
            settings: JSON.parse(JSON.stringify(this.store.settings || {})),
            USER: {
                email: this.store.USER.email,
                displayName: this.store.USER.displayName || 'User'
            },
            lastUpdated: new Date().toISOString()
        };
        
        // Use set with merge option to create or update document
        return this.dbCollection.doc(this.store.USER.email).set(dataToSave, { merge: true })
            .then(() => {
                console.log("Data saved to Firestore");
                this.isSaving = false;
                // Process any queued saves
                if (this.saveQueue.length > 0) {
                    const resolve = this.saveQueue.shift();
                    this.save().then(resolve);
                }
            })
            .catch((error) => {
                console.error("Error saving DB: ", error);
                this.isSaving = false;
                // Clear the queue on error
                this.saveQueue = [];
            });
    }

    BACKUP_USER(){
        const self = this;
        var lastWriting = this.store.history.lastWriting;
        if (!this.firebase_db) return;
        var _db = this.firebase_db;
        _db.collection("_BACKUP-counter-users").doc(this.store.USER.email).get().then(function(docRef){
            lastWriting = new Date(Date.parse(lastWriting));
            var lastBackup = false;
            if(docRef.data() !== undefined){
                lastBackup = new Date(docRef.data().history.lastWriting) || false;
            }
            if(!lastBackup /*first-time backup*/ || (lastWriting.getDate() != lastBackup.getDate() || lastWriting.getMonth() != lastBackup.getMonth() || lastWriting.getFullYear() != lastBackup.getFullYear()) ){
                const dataToBackup = {
                    records: self.store.records,
                    history: self.store.history,
                    selectedIndex: self.store.selectedIndex,
                    settings: self.store.settings,
                    USER: self.store.USER,
                    lastBackup: new Date().toISOString()
                };
                _db.collection("_BACKUP-counter-users").doc(self.store.USER.email).set(JSON.parse(JSON.stringify(dataToBackup)), { merge: true })
                    .then(function() {
                        console.log("User auto backup was taken!");
                    })
                    .catch(function(error) {
                        console.error("Couldn't take auto backup! (#5502) ", error);
                        alert("Couldn't take auto backup! (#5502) " + error);
                    });
            }
        })
        .catch(function(error) {
            console.error("Error backing up User: (#5503) ", error);
            alert("Couldn't take auto backup! (#5503) " + error);
        });
    }
}

export function uniqID(){
    return Date.now().toString(36) + Math.random().toString(36).substr(2, 5);
}

export function autoID(){
    return uniqID();
}

Date.prototype.getWeekNumber = function(){
    var d = new Date(Date.UTC(this.getFullYear(), this.getMonth(), this.getDate()));
    var dayNum = d.getUTCDay() || 7;
    d.setUTCDate(d.getUTCDate() + 4 - dayNum);
    var yearStart = new Date(Date.UTC(d.getUTCFullYear(),0,1));
    return Math.ceil((((d - yearStart) / 86400000) + 1)/7);
  };
/*
GRAPHS:
    - show chart for a certain record
    - can add another record to the chart for comparison
    https://www.chartjs.org/samples/latest/

    - Each Record has History
    - A History is an array of Logs
    - On startup, we check if the last writing is today OR >=today-7 OR month is Date.month OR year is Date.year.
 */
