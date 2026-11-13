## Changelog

### v2026.11.2 Nov 13, 2026

* **Breaking (iOS):** `allowCardSurcharge` is now passed to the native SDK and defaults to `false` when omitted, as on Android. Until now the plugin ignored it on iOS, so native `2.7.0`'s default of `true` applied: payments could be surcharged for sellers eligible for card surcharging, with no way to opt out. Apps that want surcharging on iOS must now pass `allowCardSurcharge: true`
* **Breaking (Android):** `startPayment` now rejects with `INVALID_PAYMENT_PARAMETERS` instead of substituting a default when `currencyCode` is missing or unknown (was `USD`), `processingMode` is unknown (was `AUTO_DETECT`), or a `Money` has no `amount` (was `0`). `amount` must be a whole number, and amounts above 2^31 are no longer truncated
* **Breaking (Android):** `delayDuration` is now read as seconds, as on iOS and as documented in [REFERENCE.md](docs/REFERENCE.md). It was previously passed to the native SDK as milliseconds, so the `delayAction` fired 1000 times sooner than requested. Apps that worked around this by passing milliseconds on Android must switch to seconds
* **Android:** `startPayment` now rejects with `INVALID_PAYMENT_PARAMETERS` when a parameter has the wrong JS type, instead of crashing the app
* **Android:** Card-on-file payments are now reported as the new `SourceType.CARD_ON_FILE` instead of `SourceType.UNKNOWN`
* **iOS:** Calling `startPayment` while a payment is in progress now rejects with `PAYMENT_IN_PROGRESS`. Previously the second call took over the first payment's promise
* `cancelPayment` no longer clears the in-progress payment when the cancel is refused (`NOT_CANCELABLE`) or, on iOS, before the SDK confirms the cancel. A `startPayment` in that window now rejects with `PAYMENT_IN_PROGRESS` instead of starting a second payment or getting the first payment's result
* `stopPairing` now resolves the pending `pairReader` promise with `false` instead of leaving it pending forever
* **Android:** Calling `pairReader` while a pairing is in progress no longer starts a second pairing after rejecting with `PAIRING_IN_PROGRESS`
* `authorize` no longer includes the access token in its resolved message

### v2026.11.1 Nov 1, 2026

* Upgrade Android native SDK to `2.7.0`. See the native release notes: [https://github.com/square/mobile-payments-sdk-android/releases/tag/2.7.0](https://github.com/square/mobile-payments-sdk-android/releases/tag/2.7.0)
* **Breaking (Android):** Apps must be built with Android Gradle Plugin `9.1.0` or later, Gradle `9.3.1` or later and `compileSdkVersion` `37`. React Native ships that toolchain from 0.87, so apps on older React Native versions should stay on `v2026.10.1`. `minSdkVersion` (28) and `targetSdkVersion` (36) are unchanged
* **Android:** The Kotlin Android plugin is now only applied when the app opts out of AGP 9 built-in Kotlin (`android.builtInKotlin=false`, as in the React Native template), and codegen only scans the package's `src/`
* **Android:** `ReaderInfo.warnings`, the `WARNING_RAISED` `ReaderChange` and `SettingsManager.getMpocVersion()` now work on Android too
* **Android:** Add `MICROPHONE_PERMISSION_REQUIRED` to `ReaderUnavailableReason`, reported by magstripe readers when the app hasn't been granted microphone permission
* **Android:** Payments whose source type the native SDK doesn't recognize are now reported as `SourceType.UNKNOWN`
* The example apps now use React Native 0.88 (bare) and Expo SDK 58 (Expo)

### v2026.10.1 Oct 25, 2026

* Upgrade iOS native SDK to `2.7.0`. See the native changelog: [https://developer.squareup.com/docs/changelog/mobile-logs/2026-10-23](https://developer.squareup.com/docs/changelog/mobile-logs/2026-10-23)
* **Breaking (iOS):** The minimum supported iOS version is now `17.1` (was `16`). Apps that still support iOS 16 should stay on `v2026.8.1`
* **iOS:** CocoaPods trunk becomes read-only on December 2, 2026, so native `2.7.0` is expected to be the last Mobile Payments SDK release published to CocoaPods
* **iOS:** Add `ReaderInfo.warnings` and a new `ReaderWarning` enum (`USB_THERMAL_FAULT`, `THERMAL_FAULT_DISCONNECT_USB`, `THERMAL_FAULT_POWER_OFF`), the advisory thermal warnings the reader has reported during the current connection. Warnings don't change the reader's status and clear when it disconnects or reconnects
* **iOS:** Add `WARNING_RAISED` to `ReaderChange`, emitted when a reader reports a new warning
* **iOS:** Add `ReaderSettings.usbPowerMode`, a new `PowerMode` enum (`DEFAULT`, `POWER_ONLY`, `FULL`) and `ReaderManager.setUsbPowerMode(mode)`. With `POWER_ONLY`, supported readers treat the USB cable as power-only
* **iOS:** Add `SettingsManager.getMpocVersion()`, which returns the SDK's MPoC (Mobile Payments on COTS) version

### v2026.8.1 Aug 24, 2026

* Upgrade Android native SDK to `2.6.1`, which fixes a bug where Tap to Pay on Android became unavailable for up to 2 hours before the daily payment-key rotation

### v2026.7.1 Jul 28, 2026

- Upgrade Android and iOS native SDK to `2.6.0`. See the native changelog: [https://developer.squareup.com/docs/changelog/mobile-logs/2026-07-27](https://developer.squareup.com/docs/changelog/mobile-logs/2026-07-27)
* Add `HOST_ID_MISMATCH` to `ReaderUnavailableReason` and `ReaderPairingError` (Android only). It is reported when a reader refuses a connection because another device is its most-recently-paired host, and was previously surfaced as a generic `INTERNAL_ERROR` / unknown error. Prompt the user to put the reader into pairing mode to re-pair it with the current device
* Cash payments may now be automatically rounded to the nearest five cents for CAD and AUD, and optionally USD when enabled for the seller. Payment results reflect the rounded amount
* **iOS:** Fixes an issue where calling `authorize` during SDK startup could leave connected readers in an indeterminate state that required reconnecting to become `READY`. Adds support for iOS 27
* **Breaking (Android):** Requires `compileSdkVersion` 36 or higher and Android Gradle Plugin `8.9.1` or higher (Gradle `8.13` or higher). Native SDK `2.6.0` pulls in `androidx.core:core:1.18.0`, which enforces these minimums. The example app now uses AGP `8.11.1` and Gradle `8.14`

### v2026.4.1 Apr 22, 2026

* Upgrade Android and iOS native SDK to `2.5.0`
* Add `SettingsManager.isShowingSettings()` to check whether the Settings screen is currently presented
* Add `SettingsManager.closeSettings()` to programmatically dismiss the Settings screen
* Add `ReaderManager.readerSettings()` which returns a new `ReaderSettings` object (`isReducedChargingModeEnabled`, `preferredFirmwareUpdateTime`). Adds a new `TimeOfDay` type (`hour`, `minute`) used by `preferredFirmwareUpdateTime`
* **Breaking:** `ReaderInfo.firmwareVersion` and `ReaderInfo.firmwarePercent` have been replaced by a single `ReaderInfo.firmwareInfo` object of shape `{ version, updatePercentage }`, mirroring the 2.5.0 native API
*  **Breaking (Android):** Removed `ALIPAY`, `CASH_APP`, `SUICA`, `ID`, and `QUICPAY` from the mapped `Card.Brand` values — these were removed in native SDK `2.5.0`

### v2026.3.4 Mar 25, 2026

* Fix `AdditionalPaymentMethods` mapping to support combining multiple methods (e.g. `TAP_TO_PAY` + `KEYED`) on Android.

### v2026.3.3 Mar 24, 2026

* Fix `AdditionalPaymentMethods` mapping to support combining multiple methods (e.g. `TAP_TO_PAY` + `KEYED`)

### v2026.3.2 Mar 23, 2026

* Fix npm publish pipeline to use trusted publishers

### v2026.3.1 Mar 5, 2026

* Fix compatibility issues to support Kotlin 2.2.21
* **Android:** React Native 0.75.x requires a patch for Kotlin 2.2.x compatibility. See [Kotlin Compatibility Workaround](docs/KOTLIN_COMPATIBILITY.md)

### v2026.2.1 Feb 12, 2026

* Fix SDK to Android SDK 2.3.4 and iOS to 2.3.1

### v2026.1.1 Jan 31, 2026

* Upgrade iOS SDK to 2.4.0

### v2025.2.1 Feb 19, 2025

* Address NPM dependency issue

### v2025.2.0 Feb 19, 2025

* iOS:
    * Fixed an issue with the `MockReaderUI` dependency for release build configurations.
    * Bump native SDK version to 2.0.2.

### v2025.1.0 Jan 23, 2025

* Released the Mobile Payments SDK React Native plugin.
