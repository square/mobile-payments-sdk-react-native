# AGENTS.md — Square Mobile Payments SDK for React Native

Guidance for coding agents **integrating the Mobile Payments SDK into a React Native app**.
This repo is the `mobile-payments-sdk-react-native` wrapper plus the Donut Counter sample in `example/`.

Working on the wrapper itself rather than integrating it? See [CONTRIBUTING_AGENTS.md](CONTRIBUTING_AGENTS.md).

Current package version: **2026.8.1**, wrapping native SDK **iOS 2.6.0** / **Android 2.6.1**.

## Install

```sh
npm install mobile-payments-sdk-react-native
# or
yarn add mobile-payments-sdk-react-native
```

This package contains native code. **It does not work in Expo Go** — you need a development build or a bare workflow. Both the old (bridge) and new (TurboModule) React Native architectures are supported.

## Build constraints

These silently break integrations. Check them before writing any code.

### Android

| Constraint | Value |
| :--- | :--- |
| `minSdkVersion` | 28 |
| `compileSdkVersion` / `targetSdkVersion` | 36 |
| Android Gradle Plugin | 8.9.1 or later |
| Gradle | 8.13 or later |
| Kotlin | 2.2.21 |

In `android/build.gradle`: set those values in `ext { … }` along with `squareSdkVersion = "2.6.1"`, and add Square's Maven repo (it is not on Maven Central) to `allprojects.repositories`:

```gradle
maven { url 'https://sdk.squareup.com/public/android/' }
```

Then in `android/app/build.gradle`:

```gradle
implementation("com.squareup.sdk:mobile-payments-sdk:$squareSdkVersion")
```

**Proguard / R8 is not supported.** Shrinking strips bytecode the SDK loads reflectively at runtime. In `android/app/build.gradle`:

```gradle
android {
    buildTypes {
        release {
            minifyEnabled false
            shrinkResources false
        }
    }
}
```

This is the most expensive thing to get wrong: the debug build works, the release build compiles, and the failure only appears at runtime. Do not "fix" it by adding keep rules.

The AGP/Gradle floor comes from `androidx.core:core:1.18.0`, which native SDK 2.6.x depends on. Older values fail during dependency resolution, not at runtime.

### Android + Kotlin 2.2.x — patch required on React Native 0.75.x

Native SDK 2.6.0 requires Kotlin 2.2.21. React Native's Gradle plugin (0.75.x and earlier) references `KotlinTopLevelExtension`, which Kotlin 2.2.x removed, and compiles itself with `allWarningsAsErrors = true`, which Gradle 8.13+ deprecation warnings then trip. Both make the Android build fail during Gradle configuration:

```
Unresolved reference: KotlinTopLevelExtension
e: warnings found and -Werror specified
```

The fix is a `patch-package` patch against `@react-native/gradle-plugin`. Full steps and the patch diff: **[docs/KOTLIN_COMPATIBILITY.md](docs/KOTLIN_COMPATIBILITY.md)**. In short — install `patch-package`, add a `postinstall` script, and create `patches/@react-native+gradle-plugin+<your-rn-version>.patch` (the filename must match the installed `react-native` version exactly).

This is a temporary workaround; it can be removed once React Native ships Kotlin 2.2.x support.

### iOS

Minimum deployment target **iOS 16**. Run `pod install` in `ios/`.

**The setup run script is mandatory.** On the app target's **Build Phases** tab, add a **New Run Script Phase**, positioned *after* any `[CP] Embed Pods Frameworks` or `Embed Frameworks` phase:

```sh
SETUP_SCRIPT=${BUILT_PRODUCTS_DIR}/${FRAMEWORKS_FOLDER_PATH}"/SquareMobilePaymentsSDK.framework/setup"
if [ -f "$SETUP_SCRIPT" ]; then
  "$SETUP_SCRIPT"
fi
```

Without it the framework is not usable at runtime, and nothing fails at build time.

## Credentials

Three values, from the [Developer Console](https://developer.squareup.com/apps). Toggle **Sandbox** at the top of the Credentials page for test credentials.

| Value | Where it is used |
| :--- | :--- |
| Application ID | native initialization, per platform (below) |
| Access token | `authorize(accessToken, locationId)` from JS |
| Location ID | same call — from the **Locations** page |

Initialization is **native**, not JS. The application ID must be passed on each platform:

- **Android** — `MobilePaymentsSdk.initialize(applicationId, this)` in `MainApplication.onCreate()`.
- **iOS** — `[SQMPMobilePaymentsSDK initializeWithApplicationLaunchOptions:launchOptions squareApplicationID:@"…"]` in `AppDelegate`.

Authorization is JS-side and takes the access token and location ID.

In this sample:

| File | Holds |
| :--- | :--- |
| [example/android/app/app.properties](example/android/app/app.properties) | `APP_ID`, `LOCATION_ID`, `ACCESS_TOKEN`, surfaced as `BuildConfig` fields |
| [example-expo/app.json](example-expo/app.json) | the same three, passed through `app.plugin.js` |

The placeholders are `INSERT APP_ID HERE`, `INSERT LOCATION_ID HERE`, `INSERT ACCESS TOKEN HERE`. **Leave them in place** — never commit real credential values to this repo or to the user's. Tell the user to fill them in locally; `app.properties` is gitignored in a fresh checkout for exactly this reason.

A personal access token is acceptable for Sandbox only. Production authorization must use OAuth, and a shipped app must not embed a personal access token.

## Device permissions

The SDK does not request permissions for you. The sample uses `react-native-permissions`.

**Android** — declare in `AndroidManifest.xml` and request at runtime:

| Permission | Purpose |
| :--- | :--- |
| `ACCESS_FINE_LOCATION` | Confirm payments occur in a supported Square location |
| `BLUETOOTH_CONNECT` | Communicate with contactless and chip readers |
| `BLUETOOTH_SCAN` | Discover nearby readers |
| `RECORD_AUDIO` | Receive data from magstripe readers |
| `READ_PHONE_STATE` | Identify the device to Square servers |

**iOS** — `Info.plist` keys:

| Key | Purpose |
| :--- | :--- |
| `NSBluetoothAlwaysUsageDescription` | Connect and communicate with Square readers |
| `NSLocationWhenInUseUsageDescription` | Confirm where transactions take place |
| `NSMicrophoneUsageDescription` | Receive payment card data from magstripe readers |

`READ_PHONE_STATE` has no iOS equivalent; the sample treats that row as already satisfied on iOS. See [example/src/Screens/PermissionsScreen.tsx](example/src/Screens/PermissionsScreen.tsx).

## Ordering rule

The order is not optional:

1. **Initialize** — natively, at app launch (Android `MainApplication`, iOS `AppDelegate`).
2. **Request permissions** — at runtime, before authorizing.
3. **Authorize** — `await authorize(accessToken, locationId)`.
4. Only then call payment, reader, or settings APIs.

Any manager call made before authorization completes rejects with **`NOT_AUTHORIZED`**. It appears in `PaymentError`, `ReaderPairingError`, and `ReaderCardInfoError`. If you see that code, the fix is ordering, not parameters.

```ts
import {
  authorize,
  getAuthorizationState,
  AuthorizationState,
} from 'mobile-payments-sdk-react-native';

try {
  await authorize(accessToken, locationId);
} catch (e) {
  console.log('Authorization error:', e);
}
```

`getAuthorizationState()` reports the current state, and `observeAuthorizationChanges()` / `stopObservingAuthorizationChanges()` subscribe to the `AuthorizationStatusChange` event. `deauthorize()` tears it down.

## Taking a payment

Everything is exported from the package root — `src/index.tsx` re-exports the four managers, the models, and the error enums.

```ts
import {
  startPayment,
  CurrencyCode,
  ProcessingMode,
  PromptMode,
  AdditionalPaymentMethodType,
} from 'mobile-payments-sdk-react-native';

const payment = await startPayment(
  {
    amountMoney: { amount: 100, currencyCode: CurrencyCode.USD },
    allowCardSurcharge: false,
    paymentAttemptId: orderDerivedId,
    processingMode: ProcessingMode.ONLINE_ONLY,
  },
  {
    additionalMethods: [AdditionalPaymentMethodType.ALL],
    mode: PromptMode.DEFAULT,
  }
);
```

`ProcessingMode.ONLINE_ONLY` is what Sandbox supports; `AUTO_DETECT` is for production. `cancelPayment()` aborts an in-flight payment.

`paymentAttemptId` must be derived from an order/sale identifier in a real integration, not a fresh UUID per tap — that is what protects against duplicate payments on retry. See [example/src/Screens/HomeScreen.tsx](example/src/Screens/HomeScreen.tsx) for a complete flow, and [docs/REFERENCE.md](docs/REFERENCE.md) for the full type and method reference.

## Testing with mock readers in Sandbox

Physical Square readers do **not** work in Sandbox. Virtual readers come from the mock reader UI.

```ts
import { showMockReaderUI, hideMockReaderUI } from 'mobile-payments-sdk-react-native';

await showMockReaderUI();
// …
hideMockReaderUI();
```

These reject outside Sandbox — wrap them in `try`/`catch`.

**Known limitation — read this before planning an automated test.** The wrapper exposes only `showMockReaderUI()` and `hideMockReaderUI()`, because that is all the underlying native frameworks expose. There is no API to add a mock reader, select a card brand, or simulate a tap/insert/swipe. Those steps happen only through the floating button the SDK draws over your app, and require a human:

> tap the floater → add a magstripe or contactless & chip reader → start the payment → tap the floater → tap/insert/swipe a card

So an agent **cannot** drive an end-to-end Sandbox payment on its own. If a task requires one, say so and ask the user to perform the taps — do not sit waiting on a payment promise that will never resolve.

Also: after testing an inserted card, remove it through the mock reader UI before starting the next payment.

## Documentation

Fetch the `.md` variants. The HTML pages are iframe shells and return only navigation chrome to a programmatic fetch.

- Overview — https://developer.squareup.com/docs/mobile-payments-sdk.md
- Build with React Native — https://developer.squareup.com/docs/mobile-payments-sdk/react-native.md
- Build on Android (native constraints) — https://developer.squareup.com/docs/mobile-payments-sdk/android.md
- Build on iOS (native constraints) — https://developer.squareup.com/docs/mobile-payments-sdk/ios.md
- Handling errors — https://developer.squareup.com/docs/mobile-payments-sdk/android/handling-errors.md and https://developer.squareup.com/docs/mobile-payments-sdk/ios/handling-errors.md

In-repo: [docs/README.md](docs/README.md) is the step-by-step setup guide, [docs/REFERENCE.md](docs/REFERENCE.md) is the type and method reference, [docs/KOTLIN_COMPATIBILITY.md](docs/KOTLIN_COMPATIBILITY.md) is the Kotlin 2.2.x patch, and [CHANGELOG.md](CHANGELOG.md) records breaking changes per release.

## Repo layout

```
src/                            published TypeScript API
  index.tsx                     re-exports everything
  managers/                     auth, payment, reader, settings
  models/                       enums, objects, errors
docs/                           setup guide, API reference, Kotlin patch
example/                        Donut Counter sample (bare React Native 0.75)
  android/app/app.properties    credential placeholders
example-expo/                   the same sample as an Expo development build
```
