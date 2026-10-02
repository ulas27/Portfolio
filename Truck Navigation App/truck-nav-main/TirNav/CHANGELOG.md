# Changelog

All notable changes to TırNav will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Planned
- Offline map support
- Voice navigation
- Fuel station and truck parking locations
- Social features
- Fleet management

---

## [1.0.0] - 2026-01-30

### Added

#### 🎯 Core Features
- **Smart Route Calculation**
  - Vehicle dimension-based routing (height, width, length, weight)
  - Dangerous goods consideration
  - Alternative routes (fastest/shortest)
  - Avoid highways and toll roads options

- **Community Warnings System**
  - Warning types: low bridge, narrow road, traffic, police, accident, road closed
  - Photo upload support
  - Upvote/downvote system
  - Real-time warning display on map
  - Warning detail screen with location map

- **User Authentication**
  - Email/password authentication
  - User registration with validation
  - Profile management
  - Secure Firebase integration

- **Map Features**
  - Google Maps integration
  - Real-time user location tracking
  - Custom warning markers
  - Route polyline display
  - Search functionality
  - Nearby warnings bottom sheet

#### 📱 Screens

**Authentication**
- Onboarding screen (3 pages with carousel)
- Login screen
- Register screen

**Map & Navigation**
- Main map screen
- Route search modal
- Route detail screen
- Route history screen

**Warnings**
- Add warning screen
- Warning detail screen

**Profile**
- Profile screen with statistics
- Vehicle info screen
- Settings screen

#### 🛠️ Technical Implementation

**State Management**
- Zustand stores for auth, vehicle, route, and warnings
- AsyncStorage persistence
- Type-safe store implementation

**Services**
- Firebase Authentication service
- Firestore database service
- Firebase Storage service
- GraphHopper routing service with retry mechanism

**UI Components**
- Reusable common components (Button, Input, Card, Loading, ErrorView, EmptyState)
- Map-specific components (SearchBar, WarningMarker, FloatingButtons)
- Custom tab bar with animations

**Navigation**
- React Navigation v6 setup
- Stack and Tab navigators
- Deep linking support
- Type-safe navigation

**Utilities**
- Form validators (email, password, phone)
- Environment variable management
- Firebase test utilities
- Location hooks

**Configuration**
- Environment variables setup
- Firebase configuration
- EAS Build configuration
- TypeScript strict mode
- Path aliases

#### 📚 Documentation
- Comprehensive README.md
- Firebase setup guide
- Environment variables guide
- Contributing guidelines
- API documentation
- Component documentation

#### 🔐 Security
- Firestore security rules
- Storage security rules
- Environment variable protection
- Input validation
- Secure authentication flow

### Technical Details

**Dependencies**
- React Native (Expo SDK 51)
- TypeScript 5.3
- Firebase 10.x
- React Navigation 6.x
- Zustand 4.x
- React Native Maps
- React Native Reanimated 3.x

**Development Tools**
- ESLint configuration
- Prettier configuration
- TypeScript configuration
- Babel configuration
- Git hooks (planned)

**Build System**
- EAS Build integration
- Development, preview, and production profiles
- Android and iOS support

---

## [0.1.0] - 2026-01-15

### Added
- Initial project setup
- Basic folder structure
- TypeScript configuration
- Expo configuration

---

## Version History

### Version Numbering
- **Major (X.0.0)**: Breaking changes, major new features
- **Minor (1.X.0)**: New features, backwards compatible
- **Patch (1.0.X)**: Bug fixes, minor improvements

### Release Schedule
- **Major releases**: Every 6 months
- **Minor releases**: Monthly
- **Patch releases**: As needed

---

## Migration Guides

### Upgrading to 1.0.0

This is the initial release, no migration needed.

---

## Deprecations

None yet.

---

## Known Issues

### v1.0.0
- Offline maps not yet implemented
- Voice navigation not yet implemented
- Some Firebase errors may not have Turkish translations
- Map performance may be slow on older devices

---

## Contributors

Thanks to all contributors who helped with this release!

- [@yourusername](https://github.com/yourusername) - Lead Developer

---

## Links

- [GitHub Repository](https://github.com/yourusername/tirnav)
- [Documentation](https://docs.tirnav.com)
- [Website](https://tirnav.com)
- [Discord Community](https://discord.gg/tirnav)

---

[Unreleased]: https://github.com/yourusername/tirnav/compare/v1.0.0...HEAD
[1.0.0]: https://github.com/yourusername/tirnav/releases/tag/v1.0.0
[0.1.0]: https://github.com/yourusername/tirnav/releases/tag/v0.1.0
