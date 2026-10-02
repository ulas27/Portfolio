# 🔥 Firebase Setup Guide - TirNav

## 📋 Firebase Console Setup

### 1. Create Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click "Add project"
3. Project name: **TirNav**
4. Enable Google Analytics (optional)
5. Create project

---

## 📱 Add Apps to Firebase

### Android App Setup

1. **Add Android App**
   - Click "Add app" → Android icon
   - Android package name: `com.tirnav.app`
   - App nickname: `TirNav Android`
   - Click "Register app"

2. **Download google-services.json**
   - Download the `google-services.json` file
   - For Expo managed workflow, you'll configure this in `app.json`

3. **SHA-1 Certificate (for Google Sign-In)**
   ```bash
   # Development
   keytool -list -v -keystore ~/.android/debug.keystore -alias androiddebugkey -storepass android -keypass android
   
   # Production
   keytool -list -v -keystore your-release-key.keystore -alias your-key-alias
   ```
   - Copy SHA-1 fingerprint
   - Add to Firebase Console → Project Settings → Your apps → Android → Add fingerprint

### iOS App Setup

1. **Add iOS App**
   - Click "Add app" → iOS icon
   - iOS bundle ID: `com.tirnav.app`
   - App nickname: `TirNav iOS`
   - Click "Register app"

2. **Download GoogleService-Info.plist**
   - Download the `GoogleService-Info.plist` file
   - For Expo managed workflow, you'll configure this in `app.json`

---

## 🔐 Authentication Setup

### Enable Sign-in Methods

1. Go to **Authentication** → **Sign-in method**
2. Enable **Email/Password**
   - Click "Email/Password"
   - Enable
   - Save

3. Enable **Google** (Optional)
   - Click "Google"
   - Enable
   - Project support email: your-email@example.com
   - Save

### Email Templates (Optional)

1. Go to **Authentication** → **Templates**
2. Customize:
   - Email verification
   - Password reset
   - Email address change

---

## 📦 Firestore Database Setup

### 1. Create Database

1. Go to **Firestore Database**
2. Click "Create database"
3. Start in **test mode** (we'll add rules later)
4. Choose location: `europe-west3` (Frankfurt) - closest to Turkey
5. Click "Enable"

### 2. Firestore Security Rules

Go to **Firestore Database** → **Rules** and paste:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    
    // Helper functions
    function isSignedIn() {
      return request.auth != null;
    }
    
    function isOwner(userId) {
      return isSignedIn() && request.auth.uid == userId;
    }
    
    // Users collection
    match /users/{userId} {
      // Anyone can read user profiles
      allow read: if true;
      // Only the user can write their own profile
      allow write: if isOwner(userId);
    }
    
    // Warnings collection
    match /warnings/{warningId} {
      // Anyone can read warnings
      allow read: if true;
      
      // Only authenticated users can create warnings
      allow create: if isSignedIn() 
                    && request.resource.data.createdBy == request.auth.uid
                    && request.resource.data.isActive == true
                    && request.resource.data.upvotes == 0
                    && request.resource.data.downvotes == 0;
      
      // Anyone can update (for upvotes/downvotes)
      allow update: if isSignedIn();
      
      // Only the creator can delete
      allow delete: if isSignedIn() 
                    && resource.data.createdBy == request.auth.uid;
      
      // Votes subcollection
      match /votes/{voteId} {
        allow read: if true;
        allow write: if isSignedIn();
      }
    }
    
    // Routes collection (optional - for saved routes)
    match /routes/{routeId} {
      allow read: if isSignedIn();
      allow create: if isSignedIn() 
                    && request.resource.data.userId == request.auth.uid;
      allow update: if isSignedIn() 
                    && resource.data.userId == request.auth.uid;
      allow delete: if isSignedIn() 
                    && resource.data.userId == request.auth.uid;
    }
  }
}
```

Click **Publish**

### 3. Firestore Indexes

Go to **Firestore Database** → **Indexes** → **Composite**

**Index 1: Active warnings by creation date**
- Collection ID: `warnings`
- Fields indexed:
  - `isActive` (Ascending)
  - `createdAt` (Descending)
- Query scope: Collection

**Index 2: Popular warnings**
- Collection ID: `warnings`
- Fields indexed:
  - `isActive` (Ascending)
  - `upvotes` (Descending)
- Query scope: Collection

**Index 3: User's warnings**
- Collection ID: `warnings`
- Fields indexed:
  - `createdBy` (Ascending)
  - `createdAt` (Descending)
- Query scope: Collection

Click **Create index** for each

---

## 📁 Storage Setup

### 1. Create Storage Bucket

1. Go to **Storage**
2. Click "Get started"
3. Start in **test mode** (we'll add rules later)
4. Choose location: `europe-west3` (Frankfurt)
5. Click "Done"

### 2. Storage Security Rules

Go to **Storage** → **Rules** and paste:

```javascript
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    
    // Helper functions
    function isSignedIn() {
      return request.auth != null;
    }
    
    function isOwner(userId) {
      return isSignedIn() && request.auth.uid == userId;
    }
    
    function isImage() {
      return request.resource.contentType.matches('image/.*');
    }
    
    // Warning images
    match /warnings/{userId}/{warningId}/{fileName} {
      // Anyone can read
      allow read: if true;
      
      // Only the owner can upload
      allow write: if isOwner(userId)
                   && isImage()
                   && request.resource.size < 5 * 1024 * 1024; // 5MB max
    }
    
    // User avatars
    match /users/{userId}/avatar/{fileName} {
      // Anyone can read
      allow read: if true;
      
      // Only the owner can upload
      allow write: if isOwner(userId)
                   && isImage()
                   && request.resource.size < 2 * 1024 * 1024; // 2MB max
    }
    
    // Route images (optional)
    match /routes/{userId}/{routeId}/{fileName} {
      allow read: if true;
      allow write: if isOwner(userId)
                   && isImage()
                   && request.resource.size < 3 * 1024 * 1024; // 3MB max
    }
  }
}
```

Click **Publish**

---

## ⚙️ Expo Configuration

### 1. Install EAS CLI (if not already)

```bash
npm install -g eas-cli
eas login
```

### 2. Update app.json

Add Firebase configuration to `app.json`:

```json
{
  "expo": {
    "name": "TirNav",
    "slug": "tirnav",
    "version": "1.0.0",
    "orientation": "portrait",
    "icon": "./assets/icon.png",
    "userInterfaceStyle": "light",
    "splash": {
      "image": "./assets/splash-icon.png",
      "resizeMode": "contain",
      "backgroundColor": "#ffffff"
    },
    "assetBundlePatterns": [
      "**/*"
    ],
    "ios": {
      "supportsTablet": true,
      "bundleIdentifier": "com.tirnav.app",
      "googleServicesFile": "./GoogleService-Info.plist",
      "infoPlist": {
        "NSLocationWhenInUseUsageDescription": "TırNav konumunuzu kullanarak size en iyi rotayı gösterebilir.",
        "NSLocationAlwaysAndWhenInUseUsageDescription": "TırNav navigasyon sırasında konumunuzu takip eder.",
        "NSCameraUsageDescription": "Uyarı fotoğrafı eklemek için kamera erişimi gereklidir.",
        "NSPhotoLibraryUsageDescription": "Uyarı fotoğrafı eklemek için galeri erişimi gereklidir."
      }
    },
    "android": {
      "adaptiveIcon": {
        "foregroundImage": "./assets/adaptive-icon.png",
        "backgroundColor": "#ffffff"
      },
      "package": "com.tirnav.app",
      "googleServicesFile": "./google-services.json",
      "permissions": [
        "ACCESS_COARSE_LOCATION",
        "ACCESS_FINE_LOCATION",
        "CAMERA",
        "READ_EXTERNAL_STORAGE",
        "WRITE_EXTERNAL_STORAGE"
      ]
    },
    "web": {
      "favicon": "./assets/favicon.png"
    },
    "plugins": [
      "@react-native-firebase/app",
      "@react-native-firebase/auth",
      "@react-native-firebase/firestore",
      "@react-native-firebase/storage",
      [
        "expo-location",
        {
          "locationAlwaysAndWhenInUsePermission": "TırNav navigasyon sırasında konumunuzu takip eder."
        }
      ],
      [
        "expo-image-picker",
        {
          "photosPermission": "Uyarı fotoğrafı eklemek için galeri erişimi gereklidir.",
          "cameraPermission": "Uyarı fotoğrafı eklemek için kamera erişimi gereklidir."
        }
      ]
    ]
  }
}
```

### 3. Place Configuration Files

**For Android:**
- Place `google-services.json` in project root: `./google-services.json`

**For iOS:**
- Place `GoogleService-Info.plist` in project root: `./GoogleService-Info.plist`

### 4. Build Configuration

Create `eas.json`:

```json
{
  "cli": {
    "version": ">= 5.0.0"
  },
  "build": {
    "development": {
      "developmentClient": true,
      "distribution": "internal"
    },
    "preview": {
      "distribution": "internal",
      "android": {
        "buildType": "apk"
      }
    },
    "production": {
      "autoIncrement": true
    }
  },
  "submit": {
    "production": {}
  }
}
```

---

## 🔑 Environment Variables

Update `.env.example`:

```env
# Firebase Configuration
FIREBASE_API_KEY=your_api_key_here
FIREBASE_AUTH_DOMAIN=your_project_id.firebaseapp.com
FIREBASE_PROJECT_ID=your_project_id
FIREBASE_STORAGE_BUCKET=your_project_id.appspot.com
FIREBASE_MESSAGING_SENDER_ID=your_sender_id
FIREBASE_APP_ID=your_app_id

# GraphHopper API
GRAPHHOPPER_API_KEY=your_graphhopper_api_key

# Google Maps API (if needed)
GOOGLE_MAPS_API_KEY=your_google_maps_api_key
```

Create `.env` file with actual values (don't commit this!)

---

## 🧪 Testing Firebase Setup

### 1. Test Authentication

```typescript
// In LoginScreen or RegisterScreen
import auth from '@react-native-firebase/auth';

// Test sign up
const testSignUp = async () => {
  try {
    const userCredential = await auth().createUserWithEmailAndPassword(
      'test@example.com',
      'password123'
    );
    console.log('User created:', userCredential.user.uid);
  } catch (error) {
    console.error('Sign up error:', error);
  }
};

// Test sign in
const testSignIn = async () => {
  try {
    const userCredential = await auth().signInWithEmailAndPassword(
      'test@example.com',
      'password123'
    );
    console.log('User signed in:', userCredential.user.uid);
  } catch (error) {
    console.error('Sign in error:', error);
  }
};
```

### 2. Test Firestore

```typescript
import firestore from '@react-native-firebase/firestore';

// Test write
const testFirestore = async () => {
  try {
    await firestore().collection('test').add({
      message: 'Hello Firebase!',
      timestamp: firestore.FieldValue.serverTimestamp(),
    });
    console.log('Document written!');
  } catch (error) {
    console.error('Firestore error:', error);
  }
};

// Test read
const testRead = async () => {
  try {
    const snapshot = await firestore().collection('test').get();
    snapshot.forEach(doc => {
      console.log(doc.id, '=>', doc.data());
    });
  } catch (error) {
    console.error('Read error:', error);
  }
};
```

### 3. Test Storage

```typescript
import storage from '@react-native-firebase/storage';

// Test upload
const testUpload = async (imageUri: string) => {
  try {
    const filename = `test_${Date.now()}.jpg`;
    const reference = storage().ref(`test/${filename}`);
    
    await reference.putFile(imageUri);
    const url = await reference.getDownloadURL();
    
    console.log('Upload successful:', url);
  } catch (error) {
    console.error('Upload error:', error);
  }
};
```

---

## 🚀 Building the App

### Development Build

```bash
# Install dependencies
npm install

# Start development server
npm start

# For testing on device with Firebase
eas build --profile development --platform android
# or
eas build --profile development --platform ios
```

### Preview Build (APK for testing)

```bash
eas build --profile preview --platform android
```

### Production Build

```bash
eas build --profile production --platform android
eas build --profile production --platform ios
```

---

## 📊 Firebase Console Checklist

- [ ] Project created: TirNav
- [ ] Android app added (com.tirnav.app)
- [ ] iOS app added (com.tirnav.app)
- [ ] Authentication enabled (Email/Password)
- [ ] Firestore database created
- [ ] Firestore rules configured
- [ ] Firestore indexes created
- [ ] Storage bucket created
- [ ] Storage rules configured
- [ ] google-services.json downloaded
- [ ] GoogleService-Info.plist downloaded
- [ ] Configuration files placed in project
- [ ] app.json updated with Firebase config
- [ ] Environment variables configured
- [ ] Test user created
- [ ] Test data added to Firestore
- [ ] Test image uploaded to Storage

---

## 🔧 Troubleshooting

### Common Issues

**1. "Default Firebase app has not been initialized"**
- Make sure `google-services.json` and `GoogleService-Info.plist` are in the correct location
- Rebuild the app after adding config files

**2. "Permission denied" on Firestore**
- Check Firestore rules
- Make sure user is authenticated
- Verify field names match rules

**3. "Storage upload failed"**
- Check Storage rules
- Verify file size is within limits
- Check file type is allowed

**4. Authentication errors**
- Verify email/password is enabled in Firebase Console
- Check network connection
- Verify API keys are correct

### Debug Commands

```bash
# Check Firebase configuration
npx expo config --type introspect

# Clear cache
npx expo start --clear

# Check logs
npx react-native log-android
npx react-native log-ios
```

---

## 📚 Resources

- [Firebase Console](https://console.firebase.google.com/)
- [React Native Firebase Docs](https://rnfirebase.io/)
- [Expo Firebase Guide](https://docs.expo.dev/guides/using-firebase/)
- [Firestore Security Rules](https://firebase.google.com/docs/firestore/security/get-started)
- [Storage Security Rules](https://firebase.google.com/docs/storage/security/start)

---

## ✨ Next Steps

After Firebase setup is complete:

1. **Test all features:**
   - [ ] User registration
   - [ ] User login
   - [ ] User logout
   - [ ] Add warning to Firestore
   - [ ] Upload image to Storage
   - [ ] Read warnings from Firestore
   - [ ] Update warning (upvote/downvote)
   - [ ] Delete warning

2. **Production preparation:**
   - [ ] Update Firestore rules for production
   - [ ] Update Storage rules for production
   - [ ] Set up Firebase Analytics
   - [ ] Configure Cloud Messaging (push notifications)
   - [ ] Set up Crashlytics
   - [ ] Configure Performance Monitoring

3. **Security:**
   - [ ] Enable App Check
   - [ ] Set up rate limiting
   - [ ] Configure CORS for Storage
   - [ ] Review and tighten security rules

---

**Firebase setup tamamlandı! 🎉**

Test ederek tüm özelliklerin çalıştığından emin olun.
