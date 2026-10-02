# 🔐 Environment Variables Usage Examples

## 📋 Setup

### 1. Copy Template
```bash
cp .env.template .env
# or
cp .env.example .env
```

### 2. Fill in Values
Edit `.env` file with your actual API keys and configuration.

---

## 💡 Usage Examples

### Method 1: Direct Import from @env

```typescript
import { GRAPHHOPPER_API_KEY, APP_VERSION } from '@env';

console.log('API Key:', GRAPHHOPPER_API_KEY);
console.log('Version:', APP_VERSION);
```

### Method 2: Using ENV Helper (Recommended)

```typescript
import { ENV } from '@utils/env';

// Access values
const apiKey = ENV.GRAPHHOPPER_API_KEY;
const version = ENV.APP_VERSION;
const timeout = ENV.API_TIMEOUT; // Already parsed to number
const debugMode = ENV.DEBUG_MODE; // Already parsed to boolean

// Feature flags
if (ENV.FEATURES.OFFLINE_MAPS) {
  // Enable offline maps
}

// Firebase config
const firebaseConfig = {
  apiKey: ENV.FIREBASE.API_KEY,
  authDomain: ENV.FIREBASE.AUTH_DOMAIN,
  projectId: ENV.FIREBASE.PROJECT_ID,
  storageBucket: ENV.FIREBASE.STORAGE_BUCKET,
};
```

### Method 3: Using Helper Functions

```typescript
import {
  ENV,
  isDevelopment,
  isProduction,
  isDebugMode,
  getApiTimeout,
  getMaxImageSize,
  getMaxImageSizeMB,
  isFeatureEnabled,
  getGraphHopperApiKey,
  validateEnv,
  logEnvConfig,
} from '@utils/env';

// Check environment
if (isDevelopment()) {
  console.log('Running in development mode');
}

if (isDebugMode()) {
  console.log('Debug mode enabled');
}

// Get values with validation
try {
  const apiKey = getGraphHopperApiKey(); // Throws if not set
} catch (error) {
  console.error('API key not configured');
}

// Get parsed values
const timeout = getApiTimeout(); // number
const maxSize = getMaxImageSize(); // bytes
const maxSizeMB = getMaxImageSizeMB(); // MB

// Check feature flags
if (isFeatureEnabled('OFFLINE_MAPS')) {
  // Enable feature
}

// Validate on app startup
const validation = validateEnv();
if (!validation.valid) {
  console.error('Missing env vars:', validation.missing);
}

// Log config (only in debug mode)
logEnvConfig();
```

---

## 🎯 Real-World Examples

### 1. GraphHopper Service

```typescript
// src/services/routing/graphhopper.ts
import { ENV } from '@utils/env';
import axios from 'axios';

const graphHopperService = {
  async calculateRoute(request: RouteRequest) {
    const response = await axios.get(`${ENV.GRAPHHOPPER_BASE_URL}/route`, {
      params: {
        key: ENV.GRAPHHOPPER_API_KEY,
        // ... other params
      },
      timeout: ENV.API_TIMEOUT,
    });
    
    return response.data;
  },
};
```

### 2. Image Upload with Size Validation

```typescript
// src/services/firebase/storage.ts
import { ENV } from '@utils/env';
import storage from '@react-native-firebase/storage';

export const uploadImage = async (uri: string) => {
  // Get file size
  const fileInfo = await getFileInfo(uri);
  
  // Validate size
  if (fileInfo.size > ENV.MAX_IMAGE_SIZE) {
    throw new Error(
      `Image too large. Max size: ${ENV.MAX_IMAGE_SIZE / (1024 * 1024)}MB`
    );
  }
  
  // Upload
  const reference = storage().ref(`images/${Date.now()}.jpg`);
  await reference.putFile(uri);
  
  return reference.getDownloadURL();
};
```

### 3. Feature Flag Usage

```typescript
// src/screens/map/MapScreen/index.tsx
import { ENV } from '@utils/env';

export default function MapScreen() {
  // Conditionally render based on feature flags
  return (
    <View>
      <MapView />
      
      {ENV.FEATURES.TRAFFIC_UPDATES && <TrafficLayer />}
      
      {ENV.FEATURES.COMMUNITY_WARNINGS && <WarningMarkers />}
      
      {ENV.FEATURES.OFFLINE_MAPS && <OfflineMapDownloader />}
    </View>
  );
}
```

### 4. Debug Logging

```typescript
// src/utils/logger.ts
import { ENV, isDebugMode } from '@utils/env';

export const log = (...args: any[]) => {
  if (isDebugMode()) {
    console.log('[TirNav]', ...args);
  }
};

export const logError = (...args: any[]) => {
  if (isDebugMode()) {
    console.error('[TirNav Error]', ...args);
  }
};

// Usage
log('User logged in:', user.email);
logError('API request failed:', error);
```

### 5. API Configuration

```typescript
// src/services/api/client.ts
import { ENV } from '@utils/env';
import axios from 'axios';

const apiClient = axios.create({
  baseURL: ENV.API_BASE_URL,
  timeout: ENV.API_TIMEOUT,
  headers: {
    'Content-Type': 'application/json',
    'X-App-Version': ENV.APP_VERSION,
  },
});

// Add request interceptor
apiClient.interceptors.request.use((config) => {
  if (ENV.DEBUG_MODE) {
    console.log('API Request:', config.method, config.url);
  }
  return config;
});

export default apiClient;
```

### 6. Analytics Setup

```typescript
// src/services/analytics/index.ts
import { ENV } from '@utils/env';
import analytics from '@react-native-firebase/analytics';

export const initializeAnalytics = async () => {
  if (ENV.ANALYTICS.GOOGLE_ANALYTICS_ID) {
    await analytics().setAnalyticsCollectionEnabled(true);
    console.log('Analytics initialized');
  }
};

export const logEvent = async (event: string, params?: any) => {
  if (ENV.ANALYTICS.GOOGLE_ANALYTICS_ID) {
    await analytics().logEvent(event, params);
  }
};
```

### 7. Environment-Specific Behavior

```typescript
// src/App.tsx
import { ENV, isDevelopment, logEnvConfig } from '@utils/env';

export default function App() {
  useEffect(() => {
    // Log config in development
    if (isDevelopment()) {
      logEnvConfig();
    }
    
    // Validate environment
    const validation = validateEnv();
    if (!validation.valid) {
      Alert.alert(
        'Configuration Error',
        `Missing environment variables: ${validation.missing.join(', ')}`
      );
    }
  }, []);
  
  return <RootNavigator />;
}
```

### 8. Conditional API Endpoints

```typescript
// src/services/api/endpoints.ts
import { ENV, isDevelopment } from '@utils/env';

export const API_ENDPOINTS = {
  // Use different endpoints based on environment
  auth: {
    login: `${ENV.API_BASE_URL}/auth/login`,
    register: `${ENV.API_BASE_URL}/auth/register`,
  },
  
  // Mock endpoints in development
  warnings: isDevelopment()
    ? 'http://localhost:3000/api/warnings'
    : `${ENV.API_BASE_URL}/warnings`,
};
```

---

## 🔧 TypeScript Support

### Auto-completion

```typescript
import { ENV } from '@utils/env';

// TypeScript knows all available properties
ENV.GRAPHHOPPER_API_KEY // ✅ string
ENV.API_TIMEOUT         // ✅ number
ENV.DEBUG_MODE          // ✅ boolean
ENV.FEATURES.OFFLINE_MAPS // ✅ boolean
```

### Type-safe Access

```typescript
// Type definitions in src/types/env.d.ts
declare module '@env' {
  export const GRAPHHOPPER_API_KEY: string;
  export const API_TIMEOUT: string;
  // ... etc
}

// Helper provides parsed types
import { ENV } from '@utils/env';

const timeout: number = ENV.API_TIMEOUT; // Already parsed
const debug: boolean = ENV.DEBUG_MODE;   // Already parsed
```

---

## 🧪 Testing

### Mock Environment Variables

```typescript
// __tests__/setup.ts
jest.mock('@env', () => ({
  GRAPHHOPPER_API_KEY: 'test_api_key',
  APP_VERSION: '1.0.0-test',
  DEBUG_MODE: 'true',
  API_TIMEOUT: '5000',
}));
```

### Test with Different Environments

```typescript
// __tests__/services/graphhopper.test.ts
import { ENV } from '@utils/env';

describe('GraphHopper Service', () => {
  it('should use correct API key', () => {
    expect(ENV.GRAPHHOPPER_API_KEY).toBeDefined();
  });
  
  it('should have valid timeout', () => {
    expect(ENV.API_TIMEOUT).toBeGreaterThan(0);
  });
});
```

---

## 🚨 Common Mistakes

### ❌ Don't Do This

```typescript
// Direct process.env access (won't work in React Native)
const apiKey = process.env.GRAPHHOPPER_API_KEY; // ❌

// String comparison for booleans
if (ENV.DEBUG_MODE === 'true') { } // ❌ (it's already boolean)

// Parsing every time
const timeout = parseInt(API_TIMEOUT); // ❌ (already parsed in ENV)
```

### ✅ Do This Instead

```typescript
// Use @env or ENV helper
import { ENV } from '@utils/env';
const apiKey = ENV.GRAPHHOPPER_API_KEY; // ✅

// Direct boolean check
if (ENV.DEBUG_MODE) { } // ✅

// Use pre-parsed values
const timeout = ENV.API_TIMEOUT; // ✅ (already number)
```

---

## 📚 Best Practices

1. **Always use ENV helper** for type safety and parsing
2. **Validate on startup** using `validateEnv()`
3. **Never commit .env** file to git
4. **Use feature flags** for conditional features
5. **Log config in development** using `logEnvConfig()`
6. **Provide fallbacks** for optional values
7. **Document all variables** in .env.example
8. **Use TypeScript** for auto-completion

---

## 🔄 Updating Environment Variables

### During Development

```bash
# 1. Edit .env file
nano .env

# 2. Restart Metro bundler
npm start -- --reset-cache

# 3. Rebuild app (if needed)
eas build --profile development
```

### For Production

```bash
# 1. Update .env.production
nano .env.production

# 2. Build with production profile
eas build --profile production

# 3. Or use EAS Secrets
eas secret:create --name GRAPHHOPPER_API_KEY --value "your_key"
```

---

## ✨ Summary

**Environment variables are now fully configured!**

- ✅ Type-safe access via @env
- ✅ Helper functions for common operations
- ✅ Automatic type parsing (string → number/boolean)
- ✅ Feature flags support
- ✅ Validation on startup
- ✅ Debug logging
- ✅ Production ready

**Use `ENV` from `@utils/env` for the best experience!**
