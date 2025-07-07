# Troubleshooting APK Installation and Launch Issues

## Common Causes and Solutions

### 1. **Corrupted or Incomplete Build**

The most common issue is a corrupted build process.

**Solution:**
```bash
# Clear all caches and rebuild
npx expo start --clear
rm -rf node_modules
npm install
eas build --platform android --profile development --clear-cache
```

### 2. **Missing Expo Dev Client**

Development builds require the Expo Dev Client to run.

**Solution:**
Add Expo Dev Client to your project:
```bash
npx expo install expo-dev-client
```

Then rebuild:
```bash
eas build --platform android --profile development
```

### 3. **Android Security Settings**

Your phone might be blocking installation from unknown sources.

**Solution:**
1. Go to **Settings** > **Security** > **Install unknown apps**
2. Find your browser/file manager and enable "Allow from this source"
3. Or go to **Settings** > **Apps** > **Special access** > **Install unknown apps**

### 4. **Insufficient Storage Space**

The app might fail to install due to low storage.

**Solution:**
- Free up at least 500MB of storage space
- Clear cache of other apps
- Uninstall unused apps

### 5. **Architecture Mismatch**

The APK might be built for a different CPU architecture.

**Solution:**
Specify the architecture in your build:
```bash
# For ARM64 (most modern Android devices)
eas build --platform android --profile development

# Check your device architecture in Settings > About Phone > Processor
```

### 6. **Conflicting App Versions**

If you have another version of Diaritas installed.

**Solution:**
```bash
# Uninstall any existing versions
adb uninstall com.yourcompany.diaritas

# Or manually uninstall from phone settings
```

### 7. **EAS Build Configuration Issues**

Your `eas.json` might have incorrect settings.

**Solution:**
Create/update `eas.json`:
```json
{
  "cli": {
    "version": ">= 5.2.0"
  },
  "build": {
    "development": {
      "developmentClient": true,
      "distribution": "internal",
      "android": {
        "buildType": "apk"
      }
    },
    "preview": {
      "distribution": "internal",
      "android": {
        "buildType": "apk"
      }
    },
    "production": {
      "android": {
        "buildType": "aab"
      }
    }
  }
}
```

## Step-by-Step Debugging

### Step 1: Check Build Logs
```bash
# View the build logs for errors
eas build:list
# Click on your build to see detailed logs
```

### Step 2: Verify APK Integrity
```bash
# Check if APK is valid
aapt dump badging your-app.apk
```

### Step 3: Test with ADB
```bash
# Install via ADB for better error messages
adb install your-app.apk

# Check for error messages like:
# INSTALL_FAILED_INSUFFICIENT_STORAGE
# INSTALL_FAILED_INVALID_APK
# INSTALL_FAILED_CONFLICTING_PROVIDER
```

### Step 4: Check Device Compatibility
```bash
# Check minimum SDK version in app.json
{
  "expo": {
    "android": {
      "minSdkVersion": 21
    }
  }
}
```

## Recommended Build Process

1. **Clean Environment:**
```bash
rm -rf node_modules
npm install
npx expo start --clear
```

2. **Update Dependencies:**
```bash
npx expo install --fix
```

3. **Create Fresh Build:**
```bash
eas build --platform android --profile development --clear-cache
```

4. **Install with ADB:**
```bash
adb install path/to/your-app.apk
```

## Alternative Testing Methods

### Option 1: Use Expo Dev Client from Play Store
1. Install "Expo Go" or "Expo Dev Client" from Play Store
2. Run `npx expo start --dev-client`
3. Scan QR code with the app

### Option 2: Use Android Emulator
```bash
# Start Android emulator
npx expo run:android
```

### Option 3: Use EAS Update for Testing
```bash
# Deploy updates without rebuilding
eas update --branch development
```

## Quick Fixes to Try First

1. **Restart your phone** - Simple but often effective
2. **Clear Downloads folder** - Remove old APK files
3. **Try installing via different method** - Use file manager instead of browser
4. **Check available storage** - Need at least 500MB free
5. **Disable antivirus temporarily** - Some antivirus apps block APK installation

## If Nothing Works

Create a minimal test build:

```bash
# Create new minimal expo app
npx create-expo-app TestApp
cd TestApp
npx expo install expo-dev-client

# Build and test
eas build --platform android --profile development
```

If the minimal app works, the issue is with your current project configuration.

## Getting Help

If you're still having issues:

1. **Check EAS Build logs** for specific error messages
2. **Share build logs** with the community
3. **Test on different Android device** to isolate device-specific issues
4. **Use Android Studio** to debug APK installation issues

## Prevention for Future Builds

1. Always use `--clear-cache` flag when rebuilding
2. Keep dependencies updated
3. Test builds on multiple devices
4. Use EAS Build's internal distribution for team testing
5. Monitor build logs for warnings