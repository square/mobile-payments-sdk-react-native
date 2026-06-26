# 🍩 Donut Counter (Expo) — Square Mobile Payments SDK Sample App

This is the **Expo** version of the Donut Counter sample app, demonstrating how to integrate the [Square Mobile Payments SDK](https://developer.squareup.com/docs/mobile-payments-sdk) in an Expo-managed React Native project using a Config Plugin.

## SDK Quick Reference

| Reference | File |
| --- | --- |
| ⚡️ Init SDK (Android) | Automated via `app.plugin.js` → `MainApplication.kt` |
| ⚡️ Init SDK (iOS) | Automated via `app.plugin.js` → `AppDelegate` |
| 🔒 Authorizing the SDK | [src/app/permissions.tsx](./src/app/permissions.tsx) |
| 💰 Taking a Payment | [src/app/index.tsx](./src/app/index.tsx) |
| ⚙️ Presenting Settings Screen | [src/app/index.tsx](./src/app/index.tsx) |
| 💳 Presenting MockReaderUI | [src/app/index.tsx](./src/app/index.tsx) |

## Get Started

### 1. Requirements

- A Square account enabled for payment processing
- React Native development environment set up
- Android: **minSdkVersion 28** (Android 9+)

### 2. Get application credentials

In your [Square Developer Dashboard](https://developer.squareup.com/apps), create or open an application and note:

- **Application ID**
- **Access Token** (sandbox or production)
- **Location ID**

### 3. Configure credentials

Open [`app.json`](./app.json) and update the plugin configuration:

```json
[
  "../app.plugin.js",
  {
    "applicationId": "YOUR_SQUARE_APP_ID",
    "accessToken": "YOUR_ACCESS_TOKEN",
    "locationId": "YOUR_LOCATION_ID"
  }
]
```

### 4. Prebuild and run

```bash
# Install dependencies
yarn install

# Generate native projects (required after credential changes)
npx expo prebuild --clean

# Run on Android
yarn android

# Run on iOS (macOS only)
yarn ios
```

> ⚠️ **Important:** Always run `npx expo prebuild --clean` after changing credentials in `app.json`, as they are injected into the native layer at build time.

### 5. Request permissions

Tap the **Permissions** button (top right of the home screen) and grant all required permissions:
- Bluetooth
- Location
- Microphone
- Phone State (Android only)

### 6. Authorize the SDK

In the Permissions screen, tap **Sign In** to authorize the SDK with your credentials. The button will change to **Sign Out** and you'll see "This device is Authorized" when successful.

### 7. Pair a reader

#### Sandbox
Tap **Show Mock Reader** at the bottom of the home screen. Drag the reader button anywhere on screen and tap it to add a mock magstripe or contactless reader.

#### Production
Tap **Settings** (top left) → **Pair a reader** and follow the instructions.

### 8. Take a payment

Tap **Buy for $1** on the home screen to initiate a payment using the Square payment prompt.
