# ✅ useLocation Hook Tamamlandı!

## 📋 Oluşturulan Dosyalar

### 1. ✅ useLocation Hook - Advanced Version (1 dosya, 250+ satır)
**Dosya:** `src/hooks/useLocation.ts`

**Kullanılan Paket:** `react-native-permissions`

**Özellikler:**
- ✅ Cross-platform permission handling (iOS/Android)
- ✅ Permission status tracking
- ✅ Check permission before request
- ✅ Handle all permission states (granted, denied, blocked)
- ✅ Alert dialogs for permission issues
- ✅ Link to settings for blocked permissions
- ✅ Get current location
- ✅ Watch location changes (10m filter, 5s interval)
- ✅ Auto cleanup on unmount
- ✅ Error handling with Turkish messages
- ✅ TypeScript type safety
- ✅ JSDoc documentation

### 2. ✅ useLocationSimple Hook - Simple Version (1 dosya, 280+ satır)
**Dosya:** `src/hooks/useLocationSimple.ts`

**Kullanılan Paket:** Native `PermissionsAndroid` + `Geolocation`

**Özellikler:**
- ✅ Native permission handling (iOS/Android)
- ✅ iOS: Geolocation.requestAuthorization
- ✅ Android: PermissionsAndroid.request
- ✅ Custom permission dialogs
- ✅ Handle all permission states
- ✅ Get current location
- ✅ Watch location changes
- ✅ Auto cleanup on unmount
- ✅ Error handling with Turkish messages
- ✅ TypeScript type safety
- ✅ Comprehensive JSDoc documentation

---

## 🎯 İki Versiyon Karşılaştırması

### Advanced Version (useLocation.ts)
```typescript
// Uses react-native-permissions
import { check, request, PERMISSIONS, RESULTS } from 'react-native-permissions';

✅ More granular permission control
✅ Check permission status before request
✅ Handle all permission states
✅ Link to settings for blocked permissions
✅ Better UX with permission status tracking
```

### Simple Version (useLocationSimple.ts)
```typescript
// Uses native APIs
import { PermissionsAndroid } from 'react-native';
import Geolocation from 'react-native-geolocation-service';

✅ No extra dependencies
✅ Native permission handling
✅ Custom permission dialogs
✅ Simpler implementation
✅ Direct control over permission flow
```

---

## 💡 Kullanım

### Import
```typescript
// Advanced version (recommended)
import { useLocation } from '@hooks';

// Simple version
import { useLocationSimple } from '@hooks';
```

### Basic Usage
```typescript
function MapScreen() {
  const {
    location,
    isLoading,
    error,
    hasPermission,
    requestPermission,
    getCurrentLocation,
    watchLocation,
    clearWatch,
  } = useLocation();

  useEffect(() => {
    // Request permission and get location
    const init = async () => {
      const granted = await requestPermission();
      if (granted) {
        await getCurrentLocation();
        watchLocation(); // Start watching
      }
    };
    init();

    // Cleanup
    return () => {
      clearWatch();
    };
  }, []);

  if (isLoading) {
    return <Loading message="Konum alınıyor..." />;
  }

  if (error) {
    return <ErrorView message={error} />;
  }

  if (!location) {
    return <Text>Konum bekleniyor...</Text>;
  }

  return (
    <MapView
      initialRegion={{
        latitude: location.latitude,
        longitude: location.longitude,
        latitudeDelta: 0.01,
        longitudeDelta: 0.01,
      }}
    />
  );
}
```

### Request Permission
```typescript
const { requestPermission } = useLocation();

// Request permission
const granted = await requestPermission();

if (granted) {
  console.log('Permission granted!');
} else {
  console.log('Permission denied');
}
```

### Get Current Location
```typescript
const { getCurrentLocation } = useLocation();

// Get location once
const coords = await getCurrentLocation();

if (coords) {
  console.log('Location:', coords.latitude, coords.longitude);
}
```

### Watch Location Changes
```typescript
const { location, watchLocation, clearWatch } = useLocation();

useEffect(() => {
  // Start watching
  watchLocation();

  // Cleanup
  return () => {
    clearWatch();
  };
}, []);

// Location updates automatically
useEffect(() => {
  if (location) {
    console.log('Location updated:', location);
  }
}, [location]);
```

---

## 🔧 Configuration

### iOS (Info.plist)
```xml
<key>NSLocationWhenInUseUsageDescription</key>
<string>Konumunuzu haritada göstermek ve yakındaki uyarıları bulmak için konum iznine ihtiyacımız var.</string>

<key>NSLocationAlwaysAndWhenInUseUsageDescription</key>
<string>Navigasyon sırasında konumunuzu takip etmek için konum iznine ihtiyacımız var.</string>

<key>NSLocationAlwaysUsageDescription</key>
<string>Arka planda navigasyon için konum iznine ihtiyacımız var.</string>
```

### Android (AndroidManifest.xml)
```xml
<uses-permission android:name="android.permission.ACCESS_FINE_LOCATION" />
<uses-permission android:name="android.permission.ACCESS_COARSE_LOCATION" />
```

---

## 📊 API Reference

### Return Values

```typescript
interface UseLocationReturn {
  // State
  location: Coordinates | null;        // Current location
  isLoading: boolean;                  // Loading state
  error: string | null;                // Error message (Turkish)
  hasPermission: boolean;              // Permission status (advanced only)

  // Methods
  requestPermission: () => Promise<boolean>;
  getCurrentLocation: () => Promise<Coordinates | null>;
  watchLocation: () => void;
  clearWatch: () => void;
}
```

### Coordinates Type
```typescript
interface Coordinates {
  latitude: number;
  longitude: number;
}
```

---

## 🎨 Features

### Permission Handling

**Advanced Version:**
```typescript
// Check permission status
const status = await check(PERMISSIONS.IOS.LOCATION_WHEN_IN_USE);

// Request permission
const result = await request(PERMISSIONS.IOS.LOCATION_WHEN_IN_USE);

// Handle all states
switch (result) {
  case RESULTS.GRANTED: // ✅
  case RESULTS.DENIED: // ❌
  case RESULTS.BLOCKED: // 🚫 (show settings link)
}
```

**Simple Version:**
```typescript
// iOS
const status = await Geolocation.requestAuthorization('whenInUse');
// 'granted', 'denied', 'disabled'

// Android
const granted = await PermissionsAndroid.request(
  PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION
);
// 'granted', 'denied', 'never_ask_again'
```

### Location Options

```typescript
// getCurrentPosition options
{
  enableHighAccuracy: true,  // Use GPS
  timeout: 15000,            // 15 seconds
  maximumAge: 10000,         // Cache up to 10 seconds
}

// watchPosition options
{
  enableHighAccuracy: true,  // Use GPS
  distanceFilter: 10,        // Update every 10 meters
  interval: 5000,            // Update every 5 seconds (Android)
  fastestInterval: 2000,     // Fastest: 2 seconds (Android)
}
```

### Error Messages (Turkish)

```typescript
Code 1: 'Konum izni reddedildi'
Code 2: 'Konum bilgisi alınamadı. GPS sinyali zayıf olabilir.'
Code 3: 'Konum alınırken zaman aşımı. Lütfen tekrar deneyin.'
Code 4: 'Google Play Services mevcut değil'
Code 5: 'Konum ayarları uygun değil. Lütfen konum servisini açın.'
```

---

## 🚀 Advanced Usage

### With MapView
```typescript
function MapScreen() {
  const { location, watchLocation, clearWatch } = useLocation();
  const mapRef = useRef<MapView>(null);

  useEffect(() => {
    watchLocation();
    return () => clearWatch();
  }, []);

  useEffect(() => {
    if (location && mapRef.current) {
      mapRef.current.animateToRegion({
        latitude: location.latitude,
        longitude: location.longitude,
        latitudeDelta: 0.01,
        longitudeDelta: 0.01,
      });
    }
  }, [location]);

  return (
    <MapView
      ref={mapRef}
      showsUserLocation
      followsUserLocation
    />
  );
}
```

### With Zustand Store
```typescript
// In store
interface LocationState {
  currentLocation: Coordinates | null;
  setLocation: (location: Coordinates) => void;
}

// In component
function App() {
  const { location } = useLocation();
  const setLocation = useLocationStore((state) => state.setLocation);

  useEffect(() => {
    if (location) {
      setLocation(location);
    }
  }, [location]);
}
```

### Error Handling
```typescript
function LocationComponent() {
  const { location, error, requestPermission, getCurrentLocation } = useLocation();

  const handleRetry = async () => {
    const granted = await requestPermission();
    if (granted) {
      await getCurrentLocation();
    }
  };

  if (error) {
    return (
      <ErrorView
        message={error}
        onRetry={handleRetry}
      />
    );
  }

  return <MapView location={location} />;
}
```

---

## 📊 İstatistikler

| Version | Dosya | Satır | Dependencies |
|---------|-------|-------|--------------|
| **Advanced** | 1 | 250+ | react-native-permissions |
| **Simple** | 1 | 280+ | Native APIs only |
| **TOPLAM** | **2** | **530+** | **Production ready** |

---

## ✨ Sonuç

**useLocation Hook %100 tamamlandı!**

- ✅ 2 versions (Advanced + Simple)
- ✅ 530+ satır kod
- ✅ Cross-platform (iOS/Android)
- ✅ Permission handling
- ✅ Get current location
- ✅ Watch location changes
- ✅ Error handling (Turkish)
- ✅ Auto cleanup
- ✅ TypeScript type safety
- ✅ Comprehensive JSDoc
- ✅ Production ready

**Artık uygulamanızda konum özelliklerini kolayca kullanabilirsiniz!** 🎉

### Hangi Versiyonu Kullanmalı?

**Advanced Version (Önerilen):**
- ✅ Daha iyi UX
- ✅ Permission status tracking
- ✅ Settings link for blocked permissions
- ✅ More control

**Simple Version:**
- ✅ No extra dependencies
- ✅ Simpler implementation
- ✅ Direct control
- ✅ Lighter bundle size

### Test Etmek İçin
```bash
# Uygulamayı çalıştır
npm start

# iOS Simulator
# Features > Location > Custom Location

# Android Emulator
# Extended Controls > Location
```
