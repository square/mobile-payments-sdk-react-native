# React Native Mobile Payments SDK Technical Reference

In this reference, you'll find detailed information about the data types and methods available in the React Native plug-in. As an overview, the plug-in is structured as follows:
* `src/managers`: in the native code, different functionality is encapsulated in different managers. In order to port it to React Native, we've organized it in different files in this folder: authentication, payment, reader, and settings. This should roughly map the structure available in the native reference.
* `src/models`: includes the enum definitions, errors, and the objects used in the plug-in. For errors, this serves as a reference for all the possible errors some methods might return.

## Contents

* [Managers](#managers)
* [Objects](#objects)
* [Enums](#enums)
* [Errors](#errors)

## Managers
### Authorization (auth.ts)

The Authorization Manager handles authorizing and deauthorizing your application to process payments on behalf of a Square seller using an [OAuth access token](https://developer.squareup.com/docs/oauth-api/what-it-does) and a [location ID](https://developer.squareup.com/docs/locations-api)
. OAuth access tokens are used to get authenticated and scoped access to any Square account. These tokens should be used even if you only plan to use the Mobile Payments SDK with your own Square account. For more information, see [OAuth sample applications](https://developer.squareup.com/docs/sample-apps#oauth-samples).

Method                                                    | Returns                       | Description
--------------------------------------------------------- | --------------------------------- | ---
[authorize](#authorize) | locationID | Authorizes the SDK to take payments given an access token and a location ID.
[deauthorize](#deauthorize) | String | Deauthorizes the SDK
[getAuthorizedLocation](#getAuthorizedLocation) | Location | Gets the currently authorized location.
[getAuthorizationState](#getAuthorizationState) | AuthorizationState | Returs the current authorization state AuthorizationState.
[observeAuthorizationChanges](#observeAuthorizationChanges) | EmitterSubscription | Observes authorization state changes. You can pass a callback which takes an AuthorizationState as an argument to react to the changes.
[stopObservingAuthorizationChanges](#stopObservingAuthorizationChanges) | void | Stops observing authorization changes.

## Method details

### authorize

Authorizes the SDK to take payments given an OAuth access token and a location ID.

Parameter | Type   | Description
--------- | ------ | -----------
accessToken | String | Access Token
locationId  | String | Location ID

* **On success**: returns a String which includes the authorized access token and location.
* **On failure**: throws an error which includes the resulting AuthorizationError.

---

### deauthorize

Deauthorizes the SDK.

* **On success**: returns a String which indicates if the deauthorization was sucessful.
* **On failure**: throws an error.

---

### getAuthorizedLocation

Returns the authorized location, if present.

* **On success**: returns a Location object which represents the authorized location, or `nil` if there's no authorized location.
* **On failure**: throws an error.

---

### getAuthorizationState

Returns the current authorization state. This can be used, for instance, to decide whether the app needs to authenticate on start or if it's already been authorized. 

* **On success**: returns a String which represents the current AuthorizationState.
* **On failure**: throws an error.

---
### observeAuthorizationChanges

Observes authorization status changes, by using React Native's own `NativeEventEmitter` class. This allows applications to observe authorization changes, such as deauthorization.

Parameter | Type   | Description
--------- | ------ | -----------
callback | (newState: AuthorizationState) => void | A callback function that takes the newState as an argument.

* **On success**: Will observe authorization changes, invoking the callback when changes happen. Returns the subscription of type `EmitterSubscription`.
* **On failure**: Not applicable.

---
### stopObservingAuthorizationChanges

Stops observing authorization changes. Recommended to call it when presenting a different view, for instance, to not have lingering `EmitterSubscription` objects.

* **On success**: Will remove any observers on authorization.
* **On failure**: Not applicable.


### Payments (payment.ts)

The Payment Manager handles the payment flow for your application, which allows to start a payment, or to cancel an ongoing one.

Method                                                    | Returns                       | Description
--------------------------------------------------------- | --------------------------------- | ---
[startPayment](#startPayment) | Payment | Starts a payment taking payment and prompt parameters, and returns a Payment object, or an error including a PaymentError.
[cancelPayment](#cancelPayment) | void | Cancels an ongoing payment, if possible.
[getIdempotencyKey](#getIdempotencyKey) | String \| null | Returns the idempotency key the SDK generated for a payment attempt.
[isPaymentInProgress](#isPaymentInProgress) | Boolean | Checks whether a payment is currently running.
[getAvailableCardEntryMethods](#getAvailableCardEntryMethods) | CardEntryMethod[] | Returns the card entry methods the connected hardware accepts right now.
[setAvailableCardEntryMethodsCallback](#setAvailableCardEntryMethodsCallback) | () => void | Notifies when the available card entry methods change.
[completePayment](#completePayment) | Payment | Captures a payment taken with `autocomplete: false` (Android only).
[getAllIdempotencyKeys](#getAllIdempotencyKeys) | IdempotencyKeyData[] | Lists every stored idempotency key (Android only).


## Method details

### startPayment

Starts a payment taking payment and prompt parameters, and returns a Payment object, or an error including a PaymentError. The payment parameters will include things like the amount, application fees; prompt parameters will include the accepted payment methods, and the mode (which, for now, only covers the default mode). Default prompt mode takes over the entire screen, and handles all the payment interactions.

For details on the parameters, visit the respective PaymentParameters and PromptParameters sections.

Parameter | Type   | Description
--------- | ------ | -----------
paymentParameters | PaymentParameters | Parameters to configure the payment.
promptParameters | PromptParameters | Parameters to configure the prompt.

* **On success**: returns a Payment object, which will include all the information Square captured about the payment.
* **On failure**: throws an error which includes the resulting PaymentError.

---
### getIdempotencyKey

Returns the idempotency key the SDK generated for the `CreatePayment` request of a payment attempt. The key is generated by the SDK and looked up by the `paymentAttemptId` passed in `PaymentParameters`.

Parameter | Type   | Description
--------- | ------ | -----------
paymentAttemptId | String | The `paymentAttemptId` used to start the payment.

* **On success**: returns the idempotency key, or `null` if none is stored for that attempt.
* **On failure**: throws an error which includes the resulting PaymentError.

---
### isPaymentInProgress

Checks whether a payment is currently running.

* **On success**: returns `true` if a payment is in progress.
* **On failure**: Not applicable.

---
### getAvailableCardEntryMethods

Returns the card entry methods the connected hardware can accept right now, for instance to enable or disable your charge button.

* **On success**: returns a list of `CardEntryMethod` (`EMV`, `CONTACTLESS`, `SWIPED`).
* **On failure**: Not applicable.

---
### setAvailableCardEntryMethodsCallback

Registers a callback that receives the new list of card entry methods whenever it changes, for instance when a reader connects or disconnects.

Parameter | Type   | Description
--------- | ------ | -----------
callback | (methods: CardEntryMethod[]) => void | Called with the available card entry methods.

* **On success**: returns a function that removes the callback.
* **On failure**: Not applicable.

---
### completePayment

Captures a payment that was taken with `autocomplete: false`. **Android only**; rejects on iOS, where the native SDK does not expose it.

Parameter | Type   | Description
--------- | ------ | -----------
paymentId | String | The server-assigned `Payment.id` of the payment to complete, not the `paymentAttemptId`.

* **On success**: returns the completed Payment.
* **On failure**: throws an error which includes the resulting PaymentError.

---
### getAllIdempotencyKeys

Lists every idempotency key the SDK has stored, for reconciliation against the Payments API. **Android only**; rejects on iOS.

* **On success**: returns a list of `IdempotencyKeyData`.
* **On failure**: throws an error which includes the resulting PaymentError.

---
### Reader (reader.ts)

The Reader Manager allows you to toggle mock readers, which simulate taking payments while in Sandbox mode.

Method                                                    | Returns                       | Description
--------------------------------------------------------- | --------------------------------- | ---
[showMockReaderUI](#showMockReaderUI) | void | Shows the mock reader UI, which allows to connect mock readers and simulate card interactions.
[hideMockReaderUI](#hideMockReaderUI) | void | Hides the mock reader UI.
[retryConnection](#retryConnection) | RetryConnectionResult | Retries the connection to a reader.
[rebootReader](#rebootReader) | void | Reboots a reader (iOS only).
[setPreferredFirmwareUpdateTime](#setPreferredFirmwareUpdateTime) | void | Sets the preferred time of day for reader firmware updates.
[setReducedChargingModeEnabled](#setReducedChargingModeEnabled) | void | Enables or disables reduced charging mode.


## Method details

### showMockReaderUI

When the SDK is started in Sandbox mode (this means, a Sandbox Application ID is given to initialize the SDK, as well as an access token and location that exist in Sandbox), it is possible to simulate payments with mock readers. These readers do not take real money, and allow to simulate card success and failures. The Mock Reader UI is displayed on top of the existing view, and persist through different views until dismissed. To access all the different actions available, tap on the mock reader UI.

* **On success**: shows the mock reader UI.
* **On failure**: throws an error detailing reasons why showing a mock reader isn't possible. Reasons might include: not in sandbox environment, mock reader already presented.
---
### hideMockReaderUI

Dismisses the mock reader.

* **On success**: dismisses the mock reader UI.
* **On failure**: throws an error if the reader can't be dismissed, for instance, if it's not presented.

---
### retryConnection

Retries the connection to a reader whose `isConnectionRetryable` is `true`.

Parameter | Type   | Description
--------- | ------ | -----------
id | String | The reader ID.

* **On success**: returns a `RetryConnectionResult` (`STARTING_RECONNECTION`, `READER_ALREADY_CONNECTING_TO_SQUARE`, `UNABLE_TO_RETRY`, `READER_NOT_FOUND`).
* **On failure**: throws `READER_NOT_FOUND` if no reader has that ID.

---
### rebootReader

Reboots a reader. **iOS only**; rejects on Android, where the native SDK has no equivalent.

Parameter | Type   | Description
--------- | ------ | -----------
id | String | The reader ID.

* **On success**: the reader starts rebooting.
* **On failure**: throws `READER_NOT_FOUND` if no reader has that ID, or `READER_NOT_REBOOTABLE` if `isRebootable` is `false`.

---
### setPreferredFirmwareUpdateTime

Sets the preferred time of day at which readers install firmware updates. Pass `null` to clear it.

Parameter | Type   | Description
--------- | ------ | -----------
time | TimeOfDay \| null | Hour (0-23) and minute (0-59).

* **On success**: the setting is updated.
* **On failure**: throws `INVALID_TIME_OF_DAY` if the hour or minute is missing or out of range.

---
### setReducedChargingModeEnabled

Enables or disables reduced charging mode on connected readers.

Parameter | Type   | Description
--------- | ------ | -----------
enabled | Boolean | Whether reduced charging mode is enabled.

* **On success**: the setting is updated.
* **On failure**: Not applicable.

---
### Settings (reader.ts)

The Settings Manager provides an optional device management UI that you can use in your application and provides details about the current SDK version and environment.

Method                                                    | Returns                       | Description
--------------------------------------------------------- | --------------------------------- | ---
[showSettings](#showSettings) | void | Shows the reader settings screen, which shows available readers, and SDK information.
[getEnvironment](#getEnvironment) | String | Returns the current environment the SDK was initialized on.
[getSdkVersion](#getSdkVersion) | String | Returns the current Mobile Payments SDK version.
[getSdkSettings](#getSdkSettings) | SdkSettings | Returns the SDK version, environment and security compliance version.
[getTrackingConsentState](#getTrackingConsentState) | TrackingConsentState | Returns the current analytics tracking consent state.
[updateTrackingConsent](#updateTrackingConsent) | void | Grants or denies analytics tracking consent.

### TapToPaySettings Namespace

The `TapToPaySettings` namespace provides methods specifically for managing Tap to Pay functionality on iOS devices.

Method                                                    | Returns                       | Description
--------------------------------------------------------- | --------------------------------- | ---
[linkAppleAccount](#linkAppleAccount) | Promise<void> | Links the Apple account for Tap to Pay functionality (iOS only).
[relinkAppleAccount](#relinkAppleAccount) | Promise<void> | Relinks the Apple account if required (iOS only).
[isAppleAccountLinked](#isAppleAccountLinked) | Promise<Boolean> | Checks if an Apple account is linked for Tap to Pay (iOS only).
[isDeviceCapable](#isDeviceCapable) | Promise<Boolean> | Checks if the current device is capable of using Tap to Pay (iOS only).


## Method details

### showSettings

The Mobile Payments SDK offers a preconfigured reader settings screen, built from the SDK's public API, which can be displayed by calling this method. This screen includes two tabs. The Devices tab displays the model and connection status for readers paired to the merchant's phone or tablet and includes a button for pairing a new reader. The About tab displays information about the Mobile Payments SDK, authorized location, and environment used to take payments. 

* **On success**: shows the settings screen.
* **On failure**: throws an error detailing reasons why showing the settings screen wasn't possible, for instance, if it was already being shown.
---
### getEnvironment

Returns the current environment `Environment` the SDK has been initialized on, which might be `PRODUCTION` or `SANDBOX`.

* **On success**: returns a String with the current environment.
* **On failure**: Not applicable.
---
### getSdkVersion

Returns the current Mobile Payments SDK version running. Note this is the version of the SDK (which can be different in iOS or Android), and not the version of the React Native plug-in.

* **On success**: returns a String with the current Mobile Payments SDK version.
* **On failure**: Not applicable.

---
### getSdkSettings

Returns the SDK-level settings in a single object.

* **On success**: returns a `SdkSettings` object.
* **On failure**: Not applicable.

---
### getTrackingConsentState

Returns the current state of the consent granted for analytics and performance tracking. Consent only applies in jurisdictions where it is required; elsewhere the state is `NOT_REQUIRED`.

* **On success**: returns a `TrackingConsentState` (`PENDING`, `GRANTED`, `DENIED`, `NOT_REQUIRED`).
* **On failure**: Not applicable.

---
### updateTrackingConsent

Grants or denies consent for analytics and performance tracking.

Parameter | Type   | Description
--------- | ------ | -----------
granted | Boolean | Whether consent is granted.

* **On success**: the consent state is updated.
* **On failure**: Not applicable.

---
### TapToPaySettings Methods

#### linkAppleAccount

Links the Apple account for Tap to Pay functionality. This method is only available on iOS.

* **On success**: completes successfully.
* **On failure**: throws an error if the operation fails or is attempted on Android.

---
#### relinkAppleAccount

Relinks the Apple account if required for Tap to Pay functionality. This method is only available on iOS.

* **On success**: completes successfully.
* **On failure**: throws an error if the operation fails or is attempted on Android.

---
#### isAppleAccountLinked

Checks if an Apple account is linked for Tap to Pay.

* **On success**: returns `true` if an Apple account is linked, `false` otherwise.
* **On failure**: throws an error if the operation fails or is attempted on Android.

---
#### isDeviceCapable

Checks if the current device supports Tap to Pay functionality.

* **On success**: returns `true` if the device is capable, `false` otherwise.
* **On failure**: throws an error if the operation fails or is attempted on Android.

---
## Objects

### Location

Represents a location in Square' systems.

Field             | Type                    | Description
----------------- | ----------------------- | --------------------
id | String | The location ID, to be used in methods that require a `locationId` parameter.
currencyCode | String | A three-letter string representing the currency code.
name   | String | The location's name.
mcc | String | Merchant category code, a 4-digit code representing the merchant's category in Square systems.

---
### Payment

A representation of a payment. See [Payments API](https://developer.squareup.com/reference/square/payments-api/create-payment) for more information.

Field             | Type                    | Description
----------------- | ----------------------- | --------------------
id | String | The server-side ID for this payment.
amountMoney | Money | The amount of money to accept for this payment, not including tipMoney.
appFeeMoney | Money | The amount of money the developer is taking as a fee for facilitating the payment on behalf of the seller.
createdAt | Date | Timestamp of when the payment was created.
locationId | String | The location ID to associate with the payment. If not specified, the default location is used.
orderId | String | Associate a previously created order with this payment. This must be a valid orderId in Square' systems.
referenceId | String | A user-defined ID to associate with the payment. You can use this field to associate the payment to an entity in an external system. For example, you might specify an order ID that is generated by a third-party shopping cart.
sourceType | SourceType | The source type for this payment.
tipMoney | Money | The amount designated as a tip, in addition to amountMoney
totalMoney | Money | The total money for the payment, including amountMoney and tipMoney.
updatedAt | Date | Timestamp of when the payment was last updated.
paymentType | PaymentType | `ONLINE` or `OFFLINE`.
status | PaymentStatus \| OfflinePaymentStatus | The payment status.
cardDetails | CardPaymentDetails \| OfflineCardPaymentDetails | Card details. Only populated when `sourceType` is `CARD`.
customerId | String | The ID of the customer associated with the payment (online payments).
note | String | The note attached to the payment (online payments).
teamMemberId | String | The ID of the team member associated with the payment (online payments).
cashDetails | CashPaymentDetails | Cash details. Only populated when `sourceType` is `CASH`.
receiptNumber | String | The receipt number (Android only).
receiptUrl | String | The URL of the receipt (Android only).
statementDescription | String | The statement description (Android only).
capabilities | Capabilities | The actions that can still be performed on the payment (Android only).
processingFee | PaymentProcessingFee[] | The processing fees (Android only).
localId | String | The local ID of an offline payment.
uploadedAt | Date | When an offline payment was uploaded.

---
### SdkSettings

Field             | Type                    | Description
----------------- | ----------------------- | --------------------
sdkVersion | String | The Mobile Payments SDK version.
sdkEnvironment | Environment | `PRODUCTION` or `SANDBOX`.
securityComplianceVersion | String | The security compliance version of the SDK.

---
### IdempotencyKeyData

Android only. Returned by `getAllIdempotencyKeys`.

Field             | Type                    | Description
----------------- | ----------------------- | --------------------
idempotencyKey | String | The idempotency key.
paymentAttemptId | String | The payment attempt it belongs to.
updatedAt | Date | When the key was last updated.

---

### Money

Represents an amount of money.

Field             | Type                    | Description
----------------- | ----------------------- | --------------------
amount | Number | The amount of money in the smallest denomination of the currency.
currencyCode | CurrencyCode | The currency code.

---

### PaymentParameters

Parameters to describe a single payment made using Mobile Payments SDK. The only required attributes are `amountMoney` and `idempotencyKey`.

Field             | Type                    | Description
----------------- | ----------------------- | --------------------
amountMoney | Money | The amount of money to accept for this payment, not including tipMoney
idempotencyKey | String | A unique string that identifies this CreatePayment request. Keys can be any valid string but must be unique for every CreatePayment request.
acceptPartialAuthorization | Boolean | If set to true and charging a Square Gift Card, a payment may be returned with amountMoney equal to less than what was requested. Example, a request for $20 when charging a Square Gift Card with balance of $5 will result in an APPROVED payment of $5. You may choose to prompt the buyer for an additional payment to cover the remainder, or cancel the gift card payment. Cannot be true when autocomplete = true. If this parameter is passed as true but the buyer selected a payment method for which partial authorization does not apply eg: cash then this parameter is ignored. For more information, see [Partial amount with Square gift cards](https://square.github.io/payments-api/take-payments#partial-payment-gift-card).
appFeeMoney | Money | The amount of money the developer is taking as a fee for facilitating the payment on behalf of the seller. Cannot be more than 90% of the total amount of the Payment.
autocomplete | Boolean | If set to true, this payment will be completed when possible. If set to false, this payment will be held in an approved state until either explicitly completed (captured) or canceled (voided). For more information, see [Delayed Payments](https://developer.squareup.com/docs/payments-api/take-payments#delayed-payments).
customerId | String | Optional ID of the customer associated with the payment. This value is required when using a customer’s card on file to create a payment.
delayAction | DelayAction | The action to apply to the payment when the delayDuration has elapsed. Defaults to `CANCEL`.
delayDuration | Number | The duration of time after the payment’s creation when Square either cancels or completes the payment. This automatic action applies only to payments that don’t reach a terminal state (`COMPLETED`, `CANCELED`, or `FAILED`) before the delayDuration time period. The type of action (either cancel or complete) is defined by the `delayAction` parameter, and defaults to `CANCEL`.
locationId | String | The location ID to associate with the payment. If not specified, the default location is used.
note | String | Optional note to be entered by the developer when creating a payment.
orderId | String | Optional ID of a previously created Square order to associate with this payment.
referenceId | String | Optional user-defined ID to associate with the payment. You can use this field to associate the payment to an entity in an external system. For example, you might specify an order ID that is generated by a third-party shopping cart.
statementDescriptionIdentifer | String | Optional additional payment information to include on the customer’s card statement as part of statement description.
teamMemberId | String | Optional ID of the team member associated with the payment. Previously was employeeID.
tipMoney | Money | The amount designated as a tip, in addition to amountMoney
totalMoney | Money | Total amount of the payment.
---

### PromptParameters

Parameters to describe the payment prompt for a single payment made using Mobile Payments SDK.

Field             | Type                    | Description
----------------- | ----------------------- | --------------------
additionalMethods | AdditionalPaymentMethodType[] | Additional payment methods to be allowed for the payment.
mode | PromptMode | The PromptMode to use for the payment. Use `DEFAULT` to use the Square provided one.

## Enums

### AuthorizationState

The current state of the SDK's authorization

* `AUTHORIZED` - Mobile Payments SDK is currently authorized with a Square Seller Account
* `AUTHORIZING` - Mobile Payments SDK is currently attempting authorization with a Square Seller Account
* `NOT_AUTHORIZED` - Mobile Payments SDK is not currently authorized with a Square Seller account

---
### CurrencyCode

The corresponding ISO 4217 currency code

* `AUD` - Australian Dollar.
* `CAD` - Canadian Dollar.
* `EUR` - Euro.
* `GBP` - Pound Sterling.
* `JPY` - Japanese Yen.
* `USD` - United States' Dollar.

---

### Environment

The environment the SDK has been initialized in. This value indicates the environment of the SDK based on the Square application ID used during SDK initialization.

* `PRODUCTION` - Production environment.
* `SANDBOX` - Sandbox environment.

---

### SourceType

The source type for the payment.

* `BANK_ACCOUNT` - Bank account.
* `CARD` - Credit/Debit Card.
* `CASH` - Cash.
* `EXTERNAL` - External source type (for instance, a check).
* `SQUARE_ACCOUNT` - A Square account.
* `UNKNOWN` - Unknown.
* `WALLET` - A Square wallet.
---

### DelayAction

Defines the actions to be applied to the payment when the delayDuration has elapsed. The action must be CANCEL or COMPLETE.

* `CANCEL` - Cancels the payment.
* `COMPLETE` - Completes the payment.
---

### AdditionalPaymentMethodType

The Type of Payment that is about to take place.

* `ALL` - Instructs the SDK to begin a payment showing all the available payment methods in the account and device.
* `KEYED` - Instructs the SDK to begin a payment for a keyed in credit card.
---
### PromptMode

Mode to describe which kind of payment prompt will be used for the payment.

* `DEFAULT` - Use the Square-provided payment prompt UI flow.


## Errors

For up-to-date documentation on errors, visit [iOS Handling Errors](https://developer.squareup.com/docs/mobile-payments-sdk/ios/handling-errors), and [Android Handling Errors](https://developer.squareup.com/docs/mobile-payments-sdk/android/handling-errors). We've built the error types to reflect the same error types described in the native code.
