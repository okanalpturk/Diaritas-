# Testing Production Builds for Diaritas

## Build Types Overview

### 1. **Preview Build** (Recommended for Testing)
- Similar to production but easier to install
- Uses APK format for Android
- Can be installed directly on devices
- Good for testing production-like behavior

### 2. **Production Build**
- Creates AAB (Android App Bundle) for Play Store
- Creates IPA for App Store
- Requires store submission for testing
- Most accurate production simulation

## Option 1: Preview Build (Easiest)

### Create Preview Build
```bash
# Android Preview Build
eas build --platform android --profile preview

# iOS Preview Build (requires Apple Developer account)
eas build --platform ios --profile preview
```

### Install Preview Build
- **Android**: Download APK and install directly
- **iOS**: Install via TestFlight or direct installation

### Benefits
- Easy to install and share
- Production-like behavior
- No store submission required
- Can test with real users

## Option 2: Production Build + Internal Testing

### Create Production Build
```bash
# Android Production Build (creates AAB)
eas build --platform android --profile production

# iOS Production Build (creates IPA)
eas build --platform ios --profile production
```

### Test via Store Internal Testing

#### Android (Google Play Console)
1. Upload AAB to Google Play Console
2. Create "Internal Testing" release
3. Add test users via email
4. Share internal testing link
5. Testers download via Play Store

#### iOS (App Store Connect)
1. Upload IPA to App Store Connect
2. Create TestFlight build
3. Add internal testers
4. Testers download via TestFlight app

## Option 3: Local Production Build

### Android Local Production Testing
```bash
# Build locally for testing
npx expo run:android --variant release

# Or create production APK locally
eas build --platform android --profile production --local
```

### iOS Local Production Testing
```bash
# Build locally (requires macOS + Xcode)
npx expo run:ios --configuration Release

# Or create production build locally
eas build --platform ios --profile production --local
```

## Testing Checklist

### Core Functionality
- [ ] App launches without crashes
- [ ] All navigation works correctly
- [ ] API calls function properly
- [ ] Data persistence works
- [ ] Authentication flows work

### Production-Specific Features
- [ ] AdMob ads display correctly (real ads, not test ads)
- [ ] Performance is acceptable
- [ ] App size is reasonable
- [ ] No development-only features visible
- [ ] Error handling works properly

### Platform-Specific Testing
- [ ] App works on different Android versions
- [ ] App works on different screen sizes
- [ ] iOS app works on different iPhone models
- [ ] Permissions are requested correctly
- [ ] App store guidelines compliance

## Performance Testing

### Monitor Key Metrics
```bash
# Check bundle size
npx expo export --platform android
# Look at dist folder size

# Analyze bundle composition
npx expo export --platform android --dump-assetmap
```

### Test on Real Devices
- Test on older/slower devices
- Test with poor network conditions
- Test with limited storage space
- Test battery usage

## Production Configuration

### Update Environment Variables
Create `.env.production`:
```env
EXPO_PUBLIC_OPENAI_API_KEY=your_production_api_key
EXPO_PUBLIC_API_URL=https://your-production-api.com
```

### Update AdMob Configuration
Replace test ad unit IDs in `utils/adMobService.native.ts`:
```typescript
private readonly AD_UNIT_IDS = {
  banner: Platform.select({
    ios: 'ca-app-pub-YOUR_PUBLISHER_ID/YOUR_BANNER_ID',
    android: 'ca-app-pub-YOUR_PUBLISHER_ID/YOUR_BANNER_ID',
  }),
  rewarded: Platform.select({
    ios: 'ca-app-pub-YOUR_PUBLISHER_ID/YOUR_REWARDED_ID',
    android: 'ca-app-pub-YOUR_PUBLISHER_ID/YOUR_REWARDED_ID',
  }),
};
```

### Update App Configuration
In `app.json`, ensure production settings:
```json
{
  "expo": {
    "name": "Diaritas",
    "version": "1.0.0",
    "orientation": "portrait",
    "plugins": [
      [
        "react-native-google-mobile-ads",
        {
          "androidAppId": "ca-app-pub-YOUR_PUBLISHER_ID~YOUR_ANDROID_APP_ID",
          "iosAppId": "ca-app-pub-YOUR_PUBLISHER_ID~YOUR_IOS_APP_ID"
        }
      ]
    ]
  }
}
```

## Recommended Testing Flow

### Phase 1: Preview Build Testing
1. Create preview build
2. Test core functionality
3. Test on multiple devices
4. Fix any issues found

### Phase 2: Internal Testing
1. Create production build
2. Upload to store for internal testing
3. Test with real store environment
4. Verify all production features

### Phase 3: Beta Testing
1. Expand to beta testers
2. Gather feedback
3. Monitor crash reports
4. Performance optimization

## Monitoring Production Builds

### Crash Reporting
Consider adding crash reporting:
```bash
npx expo install expo-application expo-constants
# Then integrate with services like Sentry or Bugsnag
```

### Analytics
Monitor user behavior:
- Screen views
- Feature usage
- Error rates
- Performance metrics

## Common Production Issues

### 1. **API Key Issues**
- Ensure production API keys are configured
- Test API rate limits
- Verify CORS settings

### 2. **AdMob Issues**
- Real ads may take time to appear
- Ad fill rates vary by region
- Monitor AdMob dashboard

### 3. **Performance Issues**
- Bundle size too large
- Slow startup time
- Memory leaks

### 4. **Store Compliance**
- Privacy policy requirements
- Permission usage descriptions
- Content rating accuracy

## Quick Start Commands

```bash
# For immediate testing - Preview Build
eas build --platform android --profile preview

# For thorough testing - Production Build
eas build --platform android --profile production

# For local testing
npx expo run:android --variant release
```

## Getting Production Ready

1. **Update all test configurations to production**
2. **Test thoroughly with preview builds**
3. **Create production builds for store submission**
4. **Set up monitoring and analytics**
5. **Prepare store listings and screenshots**

Remember: Preview builds are usually sufficient for testing production behavior without the complexity of store submission.