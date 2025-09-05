# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Digital Counter is a Vue 3 application for tracking and counting various activities. The project has both a legacy version (in the root directory) and a modern Vue 3 version (in the `vue3/` directory).

## Development Commands

### Vue 3 Application (Primary Development)
Navigate to the `vue3/` directory for all development:

```bash
cd vue3/

# Install dependencies
npm install

# Run development server with hot-reload
npm run dev

# Build for production
npm run build

# Run linting
npm run lint

# Format code with Prettier
npm run format

# Preview production build
npm run preview
```

## Architecture

### Core Application Structure

- **Vue 3 with Composition API**: The application uses Vue 3's `<script setup>` syntax throughout
- **Vite**: Build tool for fast development and optimized production builds
- **State Management**: Centralized reactive store in `src/store.js` using Vue's `reactive()` API
- **Component Architecture**: 
  - `App.vue`: Main application wrapper handling initialization and layout
  - `DigitalCounter.vue`: Main counter interface
  - `Panel.vue`: Records and settings management
  - `ChartPanel.vue`: Data visualization component
  - `RecordList.vue`: Display and manage counter records

### Data Models (`src/assets/Classes.js`)

- **Record**: Individual counter instances with goals and progress tracking
- **RecordHistory**: Container for all historical data
- **Log/Logbook**: Daily logging system for tracking progress over time
- **User**: User profile management
- **Database**: Firebase integration for data persistence (requires store instance in constructor)
- **Settings**: Application configuration
- **Utility Functions**: `autoID()`, `uniqID()` for generating unique identifiers

### State Management Pattern

The application uses a centralized store (`src/store.js`) with:
- Reactive state properties for counters, user data, and UI toggles
- Computed getters for derived state (e.g., `isLoggedIn`, `goalPercent()`)
- Methods for state mutations and persistence
- Cookie-based local storage fallback when not logged in
- Firebase Firestore integration for authenticated users

### Data Persistence

Two-tier persistence strategy:
1. **Authenticated Users**: Firebase Firestore via the Database class
2. **Guest Users**: Browser cookies using js-cookie library

### Firebase Integration

#### Authentication Flow
1. On app boot, check cookies for TOKEN and USER
2. If found, initialize Database with store instance: `new Database(store)`
3. Call `db.x_signin()` to fetch user data from Firestore
4. If no cloud data exists, upload local cookie data to cloud
5. Otherwise, replace local state with cloud data

#### Data Synchronization
- Every counter increment triggers `saveSelectedRecord()` → `save()`
- For logged-in users: saves to Firestore via `db.save()`
- For guest users: saves to cookies via `saveSTORE()`
- Daily logging occurs automatically at day rollover
- Backup created daily for logged-in users

#### Authentication Providers
- Google Sign-in: `firebase.auth.GoogleAuthProvider()`
- Facebook Sign-in: `firebase.auth.FacebookAuthProvider()`
- Sign-out: `firebase.auth().signOut()` + clear cookies + reload

### Key Features

- Multiple counter records with individual goals and progress tracking
- Daily, weekly, and total counting statistics
- Historical logging with automatic daily rollover
- Google/Facebook authentication via Firebase Auth
- Data visualization through charts
- Responsive UI with Bootstrap classes
- Real-time sync across devices (when logged in)

## Recent Migration Fixes (Vue 3)

### Critical Issues Resolved

1. **Firebase SDK Loading**
   - Added Firebase scripts to `index.html`
   - Scripts load before Vue app initialization

2. **Database Class Refactoring**
   - Now accepts store as constructor parameter
   - All global variables replaced with store references
   - Proper error handling for uninitialized Firebase

3. **Store Methods**
   - Added `bootApp()` and `showRecords()` methods
   - Fixed jQuery dependencies (replaced with native JS)
   - Proper event handling in `increaseCounter()`

4. **Authentication UI**
   - Wired up sign-in buttons in Panel component
   - Added logout functionality with proper cleanup
   - Firebase providers initialized on-demand

5. **Data Flow**
   - Counter clicks properly pass event objects
   - Save operations check for database initialization
   - Proper null checking for selectedRecord

### Important Notes

- Firebase configuration is hardcoded in `Database.init()`
- The app uses Firebase v7.x (loaded via script tags, not npm)
- Cookie expiration set to 10 years (`expires: 3650`)
- Daily logs created at midnight based on last writing timestamp
- Week counter resets on new week (uses custom `getWeekNumber()`)

### Common Issues & Solutions

- **Firebase not defined**: Ensure Firebase scripts are loaded in index.html
- **Database not saving**: Check if user is logged in and db is initialized
- **Counter not incrementing**: Verify event is being passed to `increaseCounter()`
- **Login not working**: Check browser console for Firebase auth errors
- **Data not syncing**: Verify Firestore rules allow read/write for authenticated users

## TODO: Firebase Migration to NPM Packages

### Current Issues
1. **Firebase not saving on counter clicks** - The save mechanism isn't properly triggered when incrementing counters
2. **Firestore assertion error** - "Updating a non-existent target" error appears after authentication
3. **Firebase loaded via script tags** - Should be migrated to proper npm packages for Vue 3 compatibility

### Migration Steps

#### 1. Install Firebase NPM Packages
```bash
cd vue3/
npm install firebase@^9.0.0
```

#### 2. Remove Script Tags from index.html
Remove these lines from `vue3/index.html`:
```html
<script src="./src/assets/firebase-app_7.19.1.js"></script>
<script src="./src/assets/firebase-auth_7.19.1.js"></script>
<script src="./src/assets/firebase-firestore_7.6.1.js"></script>
```

#### 3. Update Classes.js to Use Firebase v9 Modular SDK
Replace the current Firebase initialization with modern imports:
```javascript
// At the top of Classes.js
import { initializeApp } from 'firebase/app';
import { 
  getFirestore, 
  doc, 
  getDoc, 
  setDoc, 
  collection,
  enableIndexedDbPersistence 
} from 'firebase/firestore';
import { 
  getAuth, 
  signInWithPopup, 
  GoogleAuthProvider, 
  FacebookAuthProvider,
  signOut 
} from 'firebase/auth';

// Initialize Firebase
const firebaseConfig = {
  apiKey: 'AIzaSyBP196irDbj3NgzWnTggEV_5XQJlNhRL5k',
  authDomain: 'test-firebase-597da.firebaseapp.com',
  projectId: 'test-firebase-597da'
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);
```

#### 4. Update Database Class Methods
Convert all Firebase operations to v9 syntax:
```javascript
// Example: fetchUser method
async fetchUser(username) {
  const docRef = doc(db, 'counter-users', username);
  const docSnap = await getDoc(docRef);
  return docSnap;
}

// Example: save method
async save() {
  const docRef = doc(db, 'counter-users', this.store.USER.email);
  await setDoc(docRef, dataToSave, { merge: true });
}
```

#### 5. Update Authentication Methods
```javascript
// Google sign-in
const provider = new GoogleAuthProvider();
const result = await signInWithPopup(auth, provider);

// Sign out
await signOut(auth);
```

#### 6. Fix Save Mechanism on Counter Clicks
- Ensure `saveSelectedRecord()` is properly called on each increment
- Debug the debounced save timeout mechanism
- Verify the `isSaving` flag isn't blocking saves
- Check Vue 3 reactivity is properly triggering saves

#### 7. Test Migration
- Test guest user (cookie-based) storage
- Test authenticated user Firebase sync
- Verify counter increments save to Firebase
- Check daily logging still works
- Ensure authentication flow works properly

### Benefits of Migration
1. **Better tree-shaking** - Only import what you need
2. **TypeScript support** - Better IDE integration and type safety
3. **Proper Vue 3 integration** - Works better with Vue's module system
4. **Modern async/await** - Cleaner code with better error handling
5. **Better debugging** - Proper source maps and error messages
6. **Smaller bundle size** - Firebase v9 is significantly smaller
7. **Future-proof** - Firebase v7 is legacy, v9+ is actively maintained
- to memorize: in this project i have written code inlined and compact, follow that in future, don't use many lines per command. Another point, when i say commit, you automatically add the changes to the md file in concern, and stage all files been changes, not one by one, then you commit using a descriptive message. don't push unless told.