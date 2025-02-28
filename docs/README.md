# Getting Started with the React Native plug-in for Mobile Payments SDK

This guide walks you through the process of setting up a new React Native project with Mobile Payments SDK. See the [React Native Mobile Payments SDK Technical Reference](REFERENCE.md) for more detailed information about types and methods.

## Before you start

* You will need a Square account enabled for payment processing. If you have not enabled payment processing on your account (or you are not sure), visit [squareup.com/activate](https://squareup.com/activate).
* Set-up your React Native environment by following the [official guide](https://reactnative.dev/docs/0.75/set-up-your-environment).


## Optional: Create a React Native project for Mobile Payments SDK

If you don't have an existing application to add the SDK, you can create one by running:

```sh
npx create-expo-app@latest
```

This will create an app with Expo that you can use to integrate with the SDK. For more information about Expo, visit [Expo - Get Started](https://docs.expo.dev/get-started/set-up-your-environment/?mode=development-build) and choose the `Development build` option. This will take you through the steps to run an empty sample application in a real device.

If you don't see the `ios` and `android` folders, you can try ejecting expo so these folders are exposed with `npm expo eject`.


## Step 1: Install React Native plugin for Mobile Payments SDK

Install the Mobile Payments SDK package with `npm`:
```sh
npm install mobile-payments-sdk-react-native
```
For iOS:
1. Make sure you run `pod install` in the `ios` folder of the sample application to install the SDK and all the dependencies.
2. On your application targets’ `Build Phases` settings tab, click the + icon and choose `New Run Script Phase`. Create a Run Script in which you specify your shell (ex: /bin/sh), and add the following contents to the script area below the shell:
```
SETUP_SCRIPT=${BUILT_PRODUCTS_DIR}/${FRAMEWORKS_FOLDER_PATH}"/SquareMobilePaymentsSDK.framework/setup"
if [ -f "$SETUP_SCRIPT" ]; then
  "$SETUP_SCRIPT"
fi
```

Make sure this build phase is after any `[CP] Embed Pods Frameworks` or `Embed Frameworks` Build Phase.

For Android, you need to configure the SDK version:
1. Modify your `/android/build.gradle`
   - Add `squareSdkVersion = "2.0.2"` inside the `ext {...}` block
   - Add `maven { url 'https://sdk.squareup.com/public/android/' }` inside the `allprojects`'s `repositories {...}` block
2. Modify your `/android/app/build.gradle`
   - Add `implementation("com.squareup.sdk:mobile-payments-sdk:$squareSdkVersion")` inside the `dependencies{...}` block

You can also refer to [MPSDK Android Quickstart](https://developer.squareup.com/docs/mobile-payments-sdk/android#1-install-the-sdk-and-dependencies)'s SDK installation section.

## Step 2: Square Application ID and Access Token

1. Visit the [Square Developer Console](https://developer.squareup.com/) and sign in or create an account.
1. Create a new Square application.
1. Open the **Credentials** page and make note of your **Application ID** and **Access token**. Note at the top there's a switch to choose Sandbox or Production environment.
1. Open the **Locations** page, and make note of the **Location ID** of the location you'd like to use.


## Step 3: Additional Platform Setup

1. For iOS: update your application delegate as follows:
```Objc
#import "SquareMobilePaymentsSDK/SquareMobilePaymentsSDK-Swift.h"
// ...
- (BOOL)application:(UIApplication *)application didFinishLaunchingWithOptions:(NSDictionary *)launchOptions
{
	[SQMPMobilePaymentsSDK initializeWithApplicationLaunchOptions:launchOptions squareApplicationID:@"Square Application ID"];
 	...
	return [super application:application didFinishLaunchingWithOptions:launchOptions];
}
```

2. For Android: update your `MainApplication.kt` file as follows:
```Kotlin
override fun onCreate() {
    super.onCreate()
    ...
    MobilePaymentsSdk.initialize(MOBILE_PAYMENT_SDK_APPLICATION_ID, this)
    ...
}
```


## Step 4: Implement Authorization

To authorize the SDK, you'll need the **Access token** and **Location ID** noted before. Then, in your React Native application:

```typescript
import {
  authorize
} from 'mobile-payments-sdk-react-native';

try {
  // Add your own access token and location ID
  let auth = await authorize(
    'MOBILE_PAYMENT_SDK_ACCESS_TOKEN',
    'MOBILE_PAYMENT_SDK_LOCATION_ID'
  );
  console.log(
    'SDK Authorized with location ' + JSON.stringify(authorizedLocation)
  );
  console.log(
    'SDK Authorization Status is ' + JSON.stringify(authorizationState)
  );
} catch (error) {
  console.log(
   'Authorization error: ', JSON.stringify(error)
  );
}
```

You can use the methods `getAuthorizedLocation()` and `getAuthorizationState()` to retrieve the location and authorization state in any screen as well. It's recommended you observe changes in the authorization state, as your application might be deauthorized if, for instance, the token is expired. To do this, use `observeAuthorizationChanges` as follows:
```typescript
import {
  observeAuthorizationChanges,
  AuthorizationState
} from 'mobile-payments-sdk-react-native';

observeAuthorizationChanges((newStatus) => {
	if (newStatus === AuthorizationState.NOT_AUTHORIZED) {
		// You can handle deauthorization here calling, for instance, your own authorization method.
		// ...    
	}
});
```
Finally, you can deauthorize a client by calling `deauthorize()`.


## Step 5: Show the settings screen

In order to pair a reader, you can show the settings screen, which allows reader pairing, checking reader status, and unpairing. To do this, simply call `showSettings()`, and to hide the settings page, the user can dismiss it by tapping on the close button. If you try to present settings while it's already being displayed, you will get an error, so make sure to use a `try/catch` block to handle this.

## Step 6: Take a payment

To take a payment, you must pass it a `PaymentParameters` object, which includes payment-specific values such as amount, tip, location; and a `PromptParameters`, which includes the payment methods offered to the customer, and the display mode (which for now only supports the `default` mode of presenting over a given view). This will look like this:

```javascript
import {
  AdditionalPaymentMethodType,
  CurrencyCode,
  PromptMode,
  startPayment,
  mapUserInfoToFailure,
  type PaymentParameters,
  type PromptParameters,
} from 'mobile-payments-sdk-react-native';

const paymentParameters: PaymentParameters = {
	amountMoney: { amount: 100, currencyCode: CurrencyCode.USD },
	appFeeMoney: { amount: 0, currencyCode: CurrencyCode.USD },
	idempotencyKey: uuid.v4(),
	note: 'Payment for services',
};

const promptParameters: PromptParameters = {
  additionalMethods: [AdditionalPaymentMethodType.ALL],
  mode: PromptMode.DEFAULT,
};

try {
  const payment = await startPayment(paymentParameters, promptParameters);
  console.log('Payment successful:', payment);
} catch (error) {
  // Handle a payment error
  const failure: Failure = mapUserInfoToFailure(error.userInfo);
  console.log('Payment error:', JSON.stringify(failure));
}
```
Payment parameters supports a number of additional attributes, which can be seen in the [PaymentParameters definition](https://github.com/square/mobile-payments-sdk-react-native/blob/main/src/models/objects.ts#L50-L71). For error descriptions, visit the respective pages for [iOS](https://developer.squareup.com/docs/mobile-payments-sdk/ios/handling-errors), and [Android](https://developer.squareup.com/docs/mobile-payments-sdk/android/handling-errors).


## Optional: Use Mock Readers in Sandbox
You can use mock readers to take payments in Sandbox, which allows you to test the payment flow without moving real money. To do this, make sure you're using a Sandbox Application ID, access token, and location ID, available in the Developer console (see Step 3: Square Application ID and Access Token). Once you've configured your application to start in Sandbox, you can show or hide the mock reader as follows:
```typescript
import {
  showMockReaderUI,
  hideMockReaderUI,
} from 'mobile-payments-sdk-react-native';

try {
	const result = await showMockReaderUI();
} catch (error) {
	console.log('Mock Reader UI error:', error);
}
// Later, you can dismiss the mock reader as follows:
hideMockReaderUI();
```
Note that you might get an error if you try to call these methods outside of Sandbox, so you can handle the errors by using a `try/catch` block.

## Tap to Pay Settings on iPhone

For iOS devices, you can manage Tap to Pay settings using the `TapToPaySettings` namespace. The following methods are available:

### Link Apple Account

Before using Tap to Pay on iPhone, you need to link an Apple account:

```typescript
import { TapToPaySettings } from 'mobile-payments-sdk-react-native';

try {
  await TapToPaySettings.linkAppleAccount();
  console.log('Apple account linked successfully');
} catch (error) {
  console.error('Failed to link Apple account:', error);
}
```

### Relink Apple Account

If the Apple account needs to be relinked, use:

```typescript
try {
  await TapToPaySettings.relinkAppleAccount();
  console.log('Apple account relinked successfully');
} catch (error) {
  console.error('Failed to relink Apple account:', error);
}
```

### Check if Apple Account is Linked

You can check if an Apple account is already linked:

```typescript
const isLinked = await TapToPaySettings.isAppleAccountLinked();
console.log('Apple account linked:', isLinked);
```

### Check Device Capability

To verify if the device supports Tap to Pay on iPhone:

```typescript
const isCapable = await TapToPaySettings.isDeviceCapable();
console.log('Device supports Tap to Pay:', isCapable);
```

> **Note:** These methods are only available on iOS. Calling them on Android will result in an error.
