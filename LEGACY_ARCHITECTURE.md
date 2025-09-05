# Legacy jQuery Digital Counter Application - Complete Analysis

## Architecture Overview

The legacy version is a single-page application built with jQuery that provides a digital counter system with multiple features:

### Core Structure
- `index.HTML` - Main application
- `prayers.html` - Prayer times widget (iframe to MuslimPro)
- `assets/app.js` - Main application logic
- `assets/Classes.js` - Data models and Firebase integration
- `assets/styles.css` - Styling

## Key Components & Data Flow

### 1. Data Models (Classes.js)

#### Record
Individual counter with properties:
- `id`, `title`, `counter` (reset-able), `goal` (daily target)
- `total`, `counterDay`, `counterWeek` (tracking metrics)

#### History
Container for all logbooks:
- `logBooks[]` - Array of Logbook instances
- `lastWriting` - Timestamp for daily logging

#### Logbook
Logs for specific record:
- `recordId` - Links to Record
- `logs[]` - Array of daily Log entries

#### Log
Single day's count:
- `date`, `value`

#### Settings
App configuration:
- `delayRefresh` - Controls counter update frequency

#### User
User profile:
- `displayName`, `email`

#### Database
Firebase wrapper class:
- Handles authentication, data sync, backups

### 2. Application Flow (app.js)

#### Initialization (`init()`)
1. Check cookies for TOKEN and USER
2. If logged in → Initialize Database → Call `x_signin()`
3. Otherwise → Call `bootApp()` directly

#### Boot Process (`bootApp()`)
1. `fillValues()` - Initialize DOM references and STORE
2. Load data from cookies or Firebase
3. Create default record if none exist
4. Initialize event listeners
5. Start daily logging system

#### Main Counter Interaction
1. User clicks `#clicker` div
2. `increaseCounter()` triggered
3. Updates: `counter`, `counterDay`, `counterWeek`, `total`
4. Updates progress bar based on daily goal
5. Saves to cookies or Firebase

### 3. Storage Strategy

#### Dual Persistence

**Guest Users**: Browser cookies via js-cookie
- 10-year expiration
- Stores: records, history, selectedIndex, settings

**Authenticated Users**: Firebase Firestore
- Collection: `counter-users`
- Document ID: user email
- Auto-backup to `_BACKUP-counter-users` daily

### 4. Key Features

#### Counter Management
- Multiple counters/records
- Switch between counters
- Set daily goals per counter
- Visual progress bars (0-100%+)
- Reset individual counter (yellow counter)

#### Statistics
- Today's count
- Week's count (resets weekly)
- Total count (all-time)
- Percentage of daily goal

#### Daily Logging
- Automatic at midnight (based on lastWriting timestamp)
- Creates Log entry with previous day's count
- Resets daily counter to 0
- Weekly counter resets on new week

#### Charts (CanvasJS)
- Multiple view options:
  - **7-days**: Last 7 days with daily data points
  - **30-days**: Last 30 days with daily data points
  - **Week**: Current week (Sunday to Saturday) with daily data
  - **Month**: All days in current month with daily intervals
  - **Year**: Monthly totals for current year
  - **Today-all**: Today's current count (single point)
- Area charts with tooltips
- Dynamic axis formatting based on view type
- Automatic total calculation for each view

#### Settings Panel
- Add/edit/delete records
- Change titles and goals
- Toggle delay refresh (performance setting)
- Authentication buttons

### 5. Firebase Integration

#### Authentication
- Google Sign-in
- Facebook Sign-in
- Uses Firebase v7.x (loaded via script tags)

#### Sign-in Flow
1. User clicks sign-in button
2. `signin()` → Creates provider → `db.do_signin(provider)`
3. Firebase popup authentication
4. On success: Store TOKEN and USER in cookies
5. `x_signin()` → Fetch or create user data
6. If new user: Upload cookie data to cloud
7. If existing: Replace local with cloud data

#### Data Sync
- Every counter increment triggers save
- Logged-in users: Direct Firestore save
- Guest users: Cookie save
- Daily automatic backup for logged users

### 6. UI Components

#### Main Screen
- Large clickable area (`#clicker`)
- Counter display (resettable)
- Progress circle with percentage
- User info and statistics
- Settings gear icon

#### Panel (Slide-in)
- Records list with progress indicators
- Settings section (add record, delay refresh)
- Login buttons (Google/Facebook)
- Prayers button → prayers.html
- Logout button
- App information

#### Chart Panel
- Record-specific charts
- Date range selector
- Total count display
- Interactive tooltips

### 7. Event Handling

Key listeners initialized in `initListeners()`:
- Touch/click handling (prevents double-counting)
- Panel show/hide animations
- Record CRUD operations
- Authentication actions
- Chart display controls

### 8. Performance Optimizations

- **Delay Refresh**: Updates UI every 10/100 counts instead of every count
- **Pulse Animations**: Visual feedback without constant redraws
- **Touch Detection**: Prevents double-counting on touch devices
- **Selective Saves**: Can save specific data parts

## Global Variables

Key global variables used throughout the application:
- `STORE` - Main data object containing records, history, settings
- `selectedRecord` - Currently active counter
- `USER` - User object with displayName and email
- `TOKEN` - Authentication token
- `db` - Database instance
- `firebase_db` - Firestore reference
- `cookieOptions` - Cookie configuration (10-year expiry)

## Critical Functions

### Core Operations
- `init()` - Application entry point
- `bootApp()` - Main initialization
- `fillValues()` - Set up initial state
- `increaseCounter()` - Main counter logic
- `save()` - Persistence logic (cookies or Firebase)
- `logging()` - Daily log management

### UI Updates
- `fillSelectedRecord()` - Update display for active counter
- `setProgress()` - Update progress bar
- `goalPercent()` - Calculate daily goal percentage
- `pulse()` - Trigger animations

### Data Management
- `createRecord()` - Add new counter
- `deleteRecord()` - Remove counter
- `changeTitle()` - Edit counter name
- `changeGoal()` - Edit daily target
- `selectRecord()` - Switch active counter

### Authentication
- `signin()` - Initiate sign-in
- `logout()` - Sign out and clear data
- `isLoggedIn()` - Check auth status

## Recent Updates

### Chart Functionality Enhancement (showBy Options)
Implemented all six chart view options in the `drawChart()` function:

1. **Data Collection Functions**:
   - `makeChartData(days)` - Handles 7-day and 30-day views
   - `makeWeekData()` - Shows last 30 weeks with weekly totals
   - `makeMonthData()` - Shows last 30 months with monthly aggregates
   - `makeYearData()` - Shows last 10 years with yearly totals
   - `makeTodayAllData()` - Shows all records with non-zero values for today

2. **View Specifications**:
   - **Today-all**: Bar for each record with counterDay > 0, labeled with record title
   - **Week**: Last 30 weeks with weekly totals
   - **Month**: Last 30 months formatted as M-YYYY (e.g., 3-2025)
   - **Year**: Last 10 years formatted as YYYY

3. **Axis Configuration**:
   - Dynamic `axisXConfig` based on selected view
   - Custom label formatters for today-all view
   - Appropriate intervals and date formatting
   - Compact inline code style maintained

## Known Issues & Limitations

1. Firebase v7.x loaded via script tags (should migrate to npm)
2. Heavy reliance on global variables
3. jQuery-based DOM manipulation (could benefit from modern framework)
4. No offline support for authenticated users
5. Today-all view shows single point (app doesn't track hourly data)