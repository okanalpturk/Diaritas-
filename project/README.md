# Diaritas

A gamified life tracking app that turns your daily activities into RPG-style character progression.

## AdMob Integration

This app includes AdMob integration for monetization:

### Features
- **Banner Ads**: Displayed at the top of all main screens
- **Rewarded Ads**: Users can watch ads to earn 1 token each
- **Platform Detection**: Ads only work on iOS/Android, not web

### Setup for Production

1. **Create AdMob Account**: Sign up at [AdMob](https://admob.google.com/)

2. **Create Ad Units**: 
   - Create a Banner ad unit
   - Create a Rewarded ad unit

3. **Update Ad Unit IDs**: Replace test IDs in `utils/adMobService.ts`:
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

4. **Configure App**: Add your AdMob App ID to `app.json`:
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

### Testing

The app currently uses AdMob test ad unit IDs. These will show test ads that don't generate revenue but allow you to test the integration.

### Important Notes

- AdMob requires native builds - it won't work in Expo Go
- Use `expo run:ios` or `expo run:android` for testing
- For production, create a development build or use EAS Build
- Ads are automatically disabled on web platform
