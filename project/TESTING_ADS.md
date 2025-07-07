# Testing AdMob Integration in Diaritas

## Prerequisites

AdMob requires native builds and cannot be tested in:
- Expo Go app
- Web browser preview
- Expo development server

## Step 1: Create Development Build

### Option A: Using EAS Build (Recommended)

1. Install EAS CLI:
```bash
npm install -g @expo/eas-cli
```

2. Login to your Expo account:
```bash
eas login
```

3. Configure EAS:
```bash
eas build:configure
```

4. Create a development build:
```bash
# For iOS
eas build --platform ios --profile development

# For Android
eas build --platform android --profile development
```

### Option B: Local Development Build

1. Install Expo Dev Client:
```bash
npx expo install expo-dev-client
```

2. Run local build:
```bash
# For iOS (requires macOS and Xcode)
npx expo run:ios

# For Android (requires Android Studio)
npx expo run:android
```

## Step 2: Install Development Build

- **iOS**: Install the .ipa file on your device via TestFlight or direct installation
- **Android**: Install the .apk file directly on your device

## Step 3: Test Ad Functionality

### Banner Ads
1. Open the app on your device
2. Navigate to any screen (Home, Attributes, History, Profile)
3. Look for banner ads at the top of each screen
4. **Expected behavior**: Test banner ads should appear

### Rewarded Ads
1. Go to the Profile tab
2. Look for the "Watch Ad" button in the Token Balance section
3. Tap the button
4. **Expected behavior**: A test rewarded video ad should play
5. After watching, you should receive +1 token

## Step 4: Verify Ad Integration

### Check Console Logs
Use React Native debugger or console to check for:
```
✅ "AdMob initialized successfully"
✅ "Rewarded ad loaded"
❌ "Failed to initialize AdMob: [error]"
❌ "Failed to load rewarded ad: [error]"
```

### Test Ad States
- **Ad Ready**: Button should be enabled and show "Watch Ad"
- **Ad Loading**: Button should show "Loading Ad..."
- **Ad Not Ready**: Button should be disabled

### Verify Token Rewards
1. Note your current token count
2. Watch a rewarded ad
3. Confirm tokens increased by 1
4. Check that success alert appears

## Step 5: Production Testing

### Replace Test Ad Unit IDs
In `utils/adMobService.native.ts`, replace test IDs with your actual AdMob unit IDs:

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

### Add AdMob App ID
In `app.json`, add your AdMob app IDs:

```json
{
  "expo": {
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

## Troubleshooting

### Common Issues

1. **Ads not showing**:
   - Check internet connection
   - Verify AdMob account is active
   - Ensure ad units are created and active

2. **"AdMob not available on web platform"**:
   - This is expected - ads only work on native builds

3. **Initialization errors**:
   - Check that `react-native-google-mobile-ads` is properly installed
   - Verify app.json configuration

4. **Rewarded ads not loading**:
   - Check AdMob dashboard for ad availability
   - Test with different ad unit IDs
   - Verify network connectivity

### Debug Commands

```bash
# Check if AdMob plugin is properly configured
npx expo config --type introspect

# View detailed build logs
eas build --platform android --profile development --local

# Clear cache and rebuild
npx expo start --clear
```

## Testing Checklist

- [ ] Development build created and installed
- [ ] Banner ads appear on all screens
- [ ] Rewarded ad button is functional
- [ ] Tokens are awarded after watching ads
- [ ] Console shows successful AdMob initialization
- [ ] No error messages in logs
- [ ] Ads work on both iOS and Android (if targeting both)

## Next Steps

Once testing is complete:
1. Replace test ad unit IDs with production IDs
2. Submit app for review to app stores
3. Monitor AdMob dashboard for ad performance
4. Implement additional ad placements if needed