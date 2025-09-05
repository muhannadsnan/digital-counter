# Setting Up Your Own Firebase Project for Digital Counter

## Create a New Firebase Project

1. **Go to Firebase Console**
   - Visit: https://console.firebase.google.com/
   - Click "Create a project" or "Add project"

2. **Set up your project**
   - Enter project name: "digital-counter" (or any name you want)
   - Accept the terms
   - Disable Google Analytics (optional, not needed for this app)
   - Click "Create project"

3. **Enable Authentication**
   - In left sidebar, click "Authentication"
   - Click "Get started"
   - Go to "Sign-in method" tab
   - Enable "Google" provider:
     - Click on Google
     - Toggle "Enable"
     - Add your email as Project support email
     - Click "Save"
   - Enable "Facebook" provider (optional):
     - Click on Facebook
     - Toggle "Enable"
     - You'll need Facebook App ID and App secret from Facebook Developers
     - Click "Save"

4. **Set up Firestore Database**
   - In left sidebar, click "Firestore Database"
   - Click "Create database"
   - Choose "Start in test mode" for now
   - Select your region
   - Click "Enable"

5. **Add Authorized Domains**
   - Go to Authentication → Settings
   - Under "Authorized domains", add:
     - localhost
     - 127.0.0.1
     - Your production domain (if you have one)

6. **Get Your Firebase Configuration**
   - Click the gear icon ⚙️ next to "Project Overview"
   - Click "Project settings"
   - Scroll down to "Your apps"
   - Click "</>" (Web) icon
   - Register app with nickname "Digital Counter"
   - Copy the firebaseConfig object

7. **Update Your Code**
   Replace the configuration in `assets/Classes.js`:

   ```javascript
   init(){
       firebase.initializeApp({
           apiKey: 'YOUR_API_KEY_HERE',
           authDomain: 'YOUR_PROJECT_ID.firebaseapp.com',
           projectId: 'YOUR_PROJECT_ID'
       });
       firebase_db = firebase.firestore();
       dbCollection = firebase_db.collection("counter-users");
       console.log("DB connection established.");
   }
   ```

## Firestore Security Rules (Important!)

After testing, update your Firestore rules for security:

1. Go to Firestore Database → Rules
2. Replace with:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Users can only read/write their own data
    match /counter-users/{email} {
      allow read, write: if request.auth != null && request.auth.token.email == email;
    }
    
    // Backup collection with same rules
    match /_BACKUP-counter-users/{email} {
      allow read, write: if request.auth != null && request.auth.token.email == email;
    }
  }
}
```

3. Click "Publish"

## Test Your Setup

1. Run your local server:
   ```bash
   # Using VS Code Live Server or Python
   python -m http.server 8000
   ```

2. Open http://localhost:8000/index.HTML

3. Try signing in with Google

## Troubleshooting

- **Error: unauthorized-domain**: Make sure localhost and 127.0.0.1 are in authorized domains
- **Error: permission-denied**: Check Firestore rules
- **Error: invalid-api-key**: Double-check your Firebase config
- **Sign-in popup blocked**: Allow popups for localhost in your browser

## Free Tier Limits

Firebase free tier includes:
- 1GB Firestore storage
- 50K reads/day, 20K writes/day
- Unlimited authentication users
- Perfect for this counter app!