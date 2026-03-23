# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

React Native plugin wrapping Square's Mobile Payments SDK for in-person payments on iOS and Android. Monorepo with the library at root and a "Donut Counter" example app in `example/`.

## Common Commands

```bash
yarn                        # Install all dependencies (must use yarn, not npm)
yarn prepare                # Build library (bob build) → outputs to lib/
yarn test                   # Run Jest tests
yarn test --testPathPattern=<pattern>  # Run a single test file
yarn typecheck              # TypeScript type checking
yarn lint                   # ESLint + Prettier
yarn lint --fix             # Auto-fix lint issues

# Example app
yarn example start          # Start Metro bundler
yarn example ios            # Build & run on iOS
yarn example android        # Build & run on Android

# CI-style cached builds
yarn turbo run build:android
yarn turbo run build:ios
```

## Architecture

The SDK follows a standard React Native bridge pattern with four feature managers:

**TypeScript layer** (`src/managers/`): `auth.ts`, `payment.ts`, `reader.ts`, `settings.ts` — each wraps `NativeModules.MobilePaymentsSdkReactNative` and provides typed APIs. Entry point is `src/index.tsx` which re-exports everything.

**iOS native** (`ios/`): `MobilePaymentsSdkReactNative.swift` extends `RCTEventEmitter`. `Mappers.swift` converts native objects to JS-compatible dictionaries. `Extensions.swift` has helpers. Bridging header in `.mm` file.

**Android native** (`android/src/main/java/com/mobilepaymentssdkreactnative/`): `MobilePaymentsSdkReactNativeModule.kt` uses `@ReactMethod` annotations. `Utils.kt` has mapping/conversion helpers. Uses Kotlin coroutines for async.

**Events emitted to JS**: `AuthorizationStatusChange`, `ReaderChanged` — both platforms emit these through the RN event system.

**Models** (`src/models/`): `enums.ts` (authorization states, card brands, reader states), `objects.ts` (Location, Money, Payment, Reader types), `errors.ts` (error definitions).

## Platform Constraints

- **iOS**: Min deployment target 16. Depends on `SquareMobilePaymentsSDK ~> 2.4.0` and `MockReaderUI ~> 2.4.0`.
- **Android**: Min SDK 28, Compile/Target SDK 35. Kotlin 2.2.21. Proguard must be disabled (`minifyEnabled: false`).
- **Kotlin 2.2.x**: React Native 0.75.x Gradle plugin doesn't natively support Kotlin 2.2.x — requires `patch-package` workaround (see `docs/KOTLIN_COMPATIBILITY.md`).
- Not compatible with Expo Go (requires native code).
- Supports both old (bridge) and new (TurboModule) React Native architectures.

## Example App Setup

Square credentials must be configured in platform-specific files:
- **iOS**: `example/ios/MobilePaymentsSdkReactNativeExample/Config.m`
- **Android**: `example/android/app/src/main/java/mobilepaymentssdkreactnative/example/MainApplication.kt`
- **Access Token & Location ID**: `example/src/Screens/PermissionsScreen.tsx`

## Code Style

- ESLint with `@react-native` config + Prettier
- 2-space indentation, single quotes, trailing commas (es5)
- TypeScript strict mode enabled
