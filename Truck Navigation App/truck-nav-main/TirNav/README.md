# 🚛 TırNav - Kamyon Navigasyon Uygulaması

> Türkiye'deki tır ve kamyon şoförleri için özel olarak tasarlanmış, akıllı navigasyon uygulaması.

[![React Native](https://img.shields.io/badge/React%20Native-0.74-blue.svg)](https://reactnative.dev/)
[![Expo](https://img.shields.io/badge/Expo-51-black.svg)](https://expo.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.3-blue.svg)](https://www.typescriptlang.org/)
[![Firebase](https://img.shields.io/badge/Firebase-10.x-orange.svg)](https://firebase.google.com/)
[![License](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)

---

## 📱 Ekran Görüntüleri

| Harita | Rota Detay | Uyarılar | Profil |
|--------|-----------|----------|--------|
| 🗺️ | 📍 | ⚠️ | 👤 |

---

## 🎯 Özellikler

### ✅ Akıllı Rota Hesaplama
- Araç boyutlarına (yükseklik, genişlik, uzunluk, ağırlık) göre özel rota
- Tehlikeli madde taşıma durumuna göre alternatif rotalar
- En hızlı ve en kısa rota seçenekleri
- Otoyol ve paralı yollardan kaçınma

### ✅ Topluluk Uyarıları
- Alçak köprü uyarıları
- Dar sokak bildirimleri
- Trafik durumu
- Polis kontrol noktaları
- Kaza ve yol kapanışları
- Fotoğraflı uyarı paylaşımı

### ✅ Gerçek Zamanlı Bilgiler
- Canlı trafik durumu
- Topluluk tabanlı güncel bilgiler
- Upvote/downvote sistemi ile güvenilir içerik

### ✅ Kullanıcı Dostu Arayüz
- Modern ve sezgisel tasarım
- Kolay kullanım
- Türkçe dil desteği
- Gece modu (yakında)

### 🔜 Yakında Gelecek Özellikler
- Offline harita desteği
- Sesli navigasyon
- Yakıt istasyonu ve tır parkı noktaları
- Rota geçmişi ve favoriler
- Sosyal özellikler

---

## 🛠️ Teknolojiler

### Frontend
- **React Native** (Expo SDK 51) - Cross-platform mobile framework
- **TypeScript** - Type safety
- **React Navigation v6** - Navigation
- **Zustand** - State management
- **React Native Reanimated** - Animations

### Backend & Services
- **Firebase Authentication** - User authentication
- **Cloud Firestore** - Real-time database
- **Firebase Storage** - Image storage
- **GraphHopper API** - Truck routing
- **Google Maps** - Map rendering

### UI Components
- **react-native-maps** - Map component
- **@gorhom/bottom-sheet** - Bottom sheets
- **react-native-gesture-handler** - Gestures
- **react-native-toast-message** - Toast notifications
- **react-native-image-picker** - Camera & gallery

---

## 📋 Gereksinimler

### Sistem Gereksinimleri
- **Node.js** 18.x veya üzeri
- **npm** 9.x veya **yarn** 1.22.x
- **Expo CLI** (otomatik yüklenir)

### Geliştirme Ortamı
- **Android Studio** (Android geliştirme için)
- **Xcode** (iOS geliştirme için, sadece macOS)
- **VS Code** (önerilen IDE)

### API Keys
- GraphHopper API Key
- Google Maps API Key
- Firebase Project

---

## 🚀 Kurulum

### 1. Projeyi Klonla

```bash
git clone https://github.com/yourusername/tirnav.git
cd TirNav
```

### 2. Bağımlılıkları Yükle

```bash
npm install
# veya
yarn install
```

### 3. Environment Variables

```bash
# .env dosyası oluştur
cp .env.template .env

# .env dosyasını düzenle ve API key'lerini ekle
nano .env
```

**Gerekli API Keys:**
- `GRAPHHOPPER_API_KEY` - [GraphHopper](https://www.graphhopper.com/) üzerinden alın
- `GOOGLE_MAPS_API_KEY` - [Google Cloud Console](https://console.cloud.google.com/) üzerinden alın

### 4. Firebase Setup

#### a. Firebase Console'da Proje Oluştur
1. [Firebase Console](https://console.firebase.google.com/) açın
2. Yeni proje oluştur: **TirNav**
3. Google Analytics'i etkinleştir (opsiyonel)

#### b. Android App Ekle
1. Android app ekle (package: `com.tirnav.app`)
2. `google-services.json` dosyasını indir
3. Proje root'una yerleştir: `./google-services.json`

#### c. iOS App Ekle
1. iOS app ekle (bundle ID: `com.tirnav.app`)
2. `GoogleService-Info.plist` dosyasını indir
3. Proje root'una yerleştir: `./GoogleService-Info.plist`

#### d. Firebase Services'i Etkinleştir
- **Authentication** → Email/Password'ü aktifleştir
- **Firestore Database** → Veritabanı oluştur
- **Storage** → Storage bucket oluştur

Detaylı Firebase setup için: [`FIREBASE_SETUP_GUIDE.md`](./FIREBASE_SETUP_GUIDE.md)

### 5. Uygulamayı Çalıştır

```bash
# Development server'ı başlat
npm start

# Android emulator'de çalıştır
npm run android

# iOS simulator'de çalıştır (sadece macOS)
npm run ios

# Web'de çalıştır
npm run web
```

---

## 📁 Proje Yapısı

```
TirNav/
├── src/
│   ├── screens/              # Tüm ekranlar
│   │   ├── auth/            # Giriş, kayıt, onboarding
│   │   ├── map/             # Harita, rota, geçmiş
│   │   ├── profile/         # Profil, ayarlar, araç bilgileri
│   │   └── warnings/        # Uyarı ekleme ve detay
│   │
│   ├── components/          # Reusable componentler
│   │   ├── common/         # Button, Input, Card, vb.
│   │   └── map/            # Harita componentleri
│   │
│   ├── navigation/          # Navigation yapısı
│   │   ├── RootNavigator.tsx
│   │   ├── AuthNavigator.tsx
│   │   ├── MainNavigator.tsx
│   │   └── MapNavigator.tsx
│   │
│   ├── services/            # API servisleri
│   │   ├── firebase/       # Auth, Firestore, Storage
│   │   └── routing/        # GraphHopper routing
│   │
│   ├── store/              # Zustand store'lar
│   │   ├── authStore.ts
│   │   ├── vehicleStore.ts
│   │   ├── routeStore.ts
│   │   └── warningStore.ts
│   │
│   ├── utils/              # Helper fonksiyonlar
│   │   ├── validators.ts
│   │   ├── env.ts
│   │   └── firebaseTest.ts
│   │
│   ├── constants/          # Sabitler
│   │   ├── colors.ts
│   │   ├── spacing.ts
│   │   ├── typography.ts
│   │   └── config.ts
│   │
│   ├── types/              # TypeScript type definitions
│   │   ├── user.ts
│   │   ├── vehicle.ts
│   │   ├── route.ts
│   │   ├── warning.ts
│   │   └── navigation.ts
│   │
│   ├── hooks/              # Custom hooks
│   │   └── useLocation.ts
│   │
│   └── assets/             # Görseller, fontlar
│
├── App.tsx                 # Ana uygulama dosyası
├── app.json               # Expo configuration
├── package.json           # Dependencies
├── tsconfig.json          # TypeScript config
├── babel.config.js        # Babel config
├── .env.example           # Environment variables template
├── firestore.rules        # Firestore security rules
├── storage.rules          # Storage security rules
└── eas.json              # EAS Build configuration
```

---

## 🔧 Geliştirme

### Kod Standartları

```typescript
// ✅ Camel case for functions
function calculateRoute() { }

// ✅ PascalCase for components
function MapScreen() { }

// ✅ UPPER_SNAKE_CASE for constants
const API_KEY = 'xxx';

// ✅ Boolean prefix with is/has/should
const isLoading = true;
const hasError = false;

// ✅ JSDoc comments
/**
 * Calculate truck route
 * @param start - Start coordinates
 * @param end - End coordinates
 * @returns Route object
 */
```

### Git Workflow

```bash
# Feature branch oluştur
git checkout -b feature/new-feature

# Değişiklikleri commit et
git add .
git commit -m "feat: add new feature"

# Push et
git push origin feature/new-feature

# Pull request oluştur
```

### Commit Message Format

```
feat: yeni özellik
fix: bug düzeltme
docs: dokümantasyon
style: formatting
refactor: kod iyileştirme
test: test ekleme
chore: build, dependencies
```

---

## 🧪 Testing

### Unit Tests

```bash
# Testleri çalıştır
npm test

# Coverage raporu
npm run test:coverage
```

### E2E Tests

```bash
# Detox testleri
npm run test:e2e
```

### Firebase Test

```typescript
import { testAllFirebaseServices } from '@utils/firebaseTest';

// Tüm Firebase servislerini test et
await testAllFirebaseServices();
```

---

## 📦 Build & Deploy

### Development Build

```bash
# Android
eas build --profile development --platform android

# iOS
eas build --profile development --platform ios
```

### Production Build

```bash
# Her iki platform
eas build --profile production --platform all

# Sadece Android
eas build --profile production --platform android

# Sadece iOS
eas build --profile production --platform ios
```

### Submit to Stores

```bash
# Google Play Store
eas submit --platform android

# Apple App Store
eas submit --platform ios
```

---

## 🐛 Troubleshooting

### Metro Bundler Sorunları

```bash
# Cache'i temizle ve yeniden başlat
npm start -- --reset-cache
```

### Build Sorunları

```bash
# Node modules'u temizle
rm -rf node_modules
npm install

# iOS pods'u temizle (macOS)
cd ios && pod install && cd ..
```

### Firebase Sorunları

```bash
# Config dosyalarını kontrol et
ls -la google-services.json
ls -la GoogleService-Info.plist

# Firebase test et
# App içinde firebaseTest fonksiyonlarını çalıştır
```

---

## 📚 Dokümantasyon

- [Firebase Setup Guide](./FIREBASE_SETUP_GUIDE.md)
- [Environment Variables](./ENV_USAGE_EXAMPLES.md)
- [API Documentation](./docs/API.md)
- [Component Library](./docs/COMPONENTS.md)
- [State Management](./docs/STATE_MANAGEMENT.md)

---

## 🤝 Katkıda Bulunma

Katkılarınızı bekliyoruz! Lütfen şu adımları takip edin:

1. Fork edin
2. Feature branch oluşturun (`git checkout -b feature/amazing-feature`)
3. Değişikliklerinizi commit edin (`git commit -m 'feat: add amazing feature'`)
4. Branch'inizi push edin (`git push origin feature/amazing-feature`)
5. Pull Request açın

### Katkı Kuralları

- Kod standartlarına uyun
- Test yazın
- Dokümantasyon güncelleyin
- Commit message formatını kullanın

---

## 📄 Lisans

Bu proje MIT lisansı altında lisanslanmıştır. Detaylar için [LICENSE](LICENSE) dosyasına bakın.

---

## 👥 Ekip

- **Product Owner** - [@yourusername](https://github.com/yourusername)
- **Lead Developer** - [@yourusername](https://github.com/yourusername)

---

## 📞 İletişim

- **Email**: info@tirnav.com
- **Website**: https://tirnav.com
- **Twitter**: [@tirnav](https://twitter.com/tirnav)
- **Discord**: [TırNav Community](https://discord.gg/tirnav)

---

## 🙏 Teşekkürler

- [GraphHopper](https://www.graphhopper.com/) - Routing API
- [Firebase](https://firebase.google.com/) - Backend services
- [Expo](https://expo.dev/) - Development platform
- [React Native Community](https://reactnative.dev/) - Amazing framework

---

## 📈 Roadmap

### v1.0 (Mevcut)
- ✅ Temel navigasyon
- ✅ Topluluk uyarıları
- ✅ Kullanıcı profili
- ✅ Rota geçmişi

### v1.1 (Yakında)
- 🔄 Offline harita
- 🔄 Sesli navigasyon
- 🔄 Yakıt istasyonları
- 🔄 Tır parkları

### v1.2 (Planlanan)
- 📋 Sosyal özellikler
- 📋 Rota paylaşımı
- 📋 Grup navigasyonu
- 📋 Filo yönetimi

### v2.0 (Gelecek)
- 🎯 AI destekli rota önerileri
- 🎯 Hava durumu entegrasyonu
- 🎯 Yakıt tüketimi takibi
- 🎯 Bakım hatırlatıcıları

---

<div align="center">

**⭐ Projeyi beğendiyseniz yıldız vermeyi unutmayın! ⭐**

Made with ❤️ by TırNav Team

</div>
