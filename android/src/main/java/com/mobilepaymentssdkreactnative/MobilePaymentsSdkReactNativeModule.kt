package com.mobilepaymentssdkreactnative

import com.facebook.react.bridge.Promise
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReactContext
import com.facebook.react.bridge.ReactContextBaseJavaModule
import com.facebook.react.bridge.ReactMethod
import com.facebook.react.bridge.ReadableMap
import com.facebook.react.bridge.WritableMap
import com.facebook.react.bridge.WritableNativeMap
import com.facebook.react.modules.core.DeviceEventManagerModule
import com.squareup.sdk.mobilepayments.MobilePaymentsSdk
import com.squareup.sdk.mobilepayments.core.CallbackReference
import com.squareup.sdk.mobilepayments.core.Result.Failure
import com.squareup.sdk.mobilepayments.core.Result.Success
import com.squareup.sdk.mobilepayments.mockreader.ui.MockReaderUI
import com.squareup.sdk.mobilepayments.payment.PaymentHandle
import com.squareup.sdk.mobilepayments.payment.PaymentHandle.CancelResult.CANCELED
import com.squareup.sdk.mobilepayments.payment.PaymentHandle.CancelResult.NOT_CANCELABLE
import com.squareup.sdk.mobilepayments.payment.PaymentHandle.CancelResult.NO_PAYMENT_IN_PROGRESS

class MobilePaymentsSdkReactNativeModule(private val reactContext: ReactApplicationContext) :
  ReactContextBaseJavaModule(reactContext) {

  private var paymentHandle: PaymentHandle? = null
  private var authStateCallback: CallbackReference? = null

  override fun getName(): String {
    return NAME
  }

  /**
   * Authorizes the Mobile Payments SDK with the provided access token and location ID.
   * If the SDK is already authorized, this method will resolve immediately.
   *
   * Authorize: https://developer.squareup.com/docs/mobile-payments-sdk/ios/configure-authorize
   */
  @ReactMethod
  fun authorize(
    accessToken: String,
    locationId: String,
    promise: Promise
  ) {
    val authorizationManager = MobilePaymentsSdk.authorizationManager()

    if (authorizationManager.authorizationState.isAuthorized) {
      promise.resolve("Already authorized, skipping")
      return
    }

    authorizationManager.authorize(accessToken, locationId) { result ->
      when (result) {
        is Success ->
          promise.resolve("Authorized with token: $accessToken and location: $locationId")

        is Failure ->
          promise.reject("AUTHENTICATION_ERROR", result.errorMessage)
      }
    }
  }

  @ReactMethod
  fun deauthorize(promise: Promise) {
    MobilePaymentsSdk.authorizationManager().deauthorize()
    promise.resolve("Square Mobile Payments SDK successfully deauthorized.")
  }

  @ReactMethod
  fun getAuthorizedLocation(promise: Promise) {
    val authorizationManager = MobilePaymentsSdk.authorizationManager()
    promise.resolve(authorizationManager.location?.toLocationMap())
  }

  @ReactMethod
  fun getAuthorizationState(promise: Promise) {
    val authorizationManager = MobilePaymentsSdk.authorizationManager()
    val authorizationState = authorizationManager.authorizationState.asString()
    promise.resolve(authorizationState)
  }

  @ReactMethod
  fun addAuthorizationObserver(promise: Promise) {
    val authorizationManager = MobilePaymentsSdk.authorizationManager()
    authStateCallback = authorizationManager.setAuthorizationStateChangedCallback { state ->
      val event = WritableNativeMap().apply {
        putString("state", state.asString())
      }
      emitEvent(reactContext, "AuthorizationStatusChange", event)
    }
    promise.resolve("Authorization State Observer Added")
  }

  @ReactMethod
  fun removeAuthorizationObserver(promise: Promise) {
    authStateCallback?.clear()
    authStateCallback = null
    promise.resolve("Authorization State Observer Removed")
  }

  @ReactMethod
  fun showSettings(promise: Promise) {
    reactContext.runOnUiQueueThread {
      val settingsManager = MobilePaymentsSdk.settingsManager()
      settingsManager.showSettings { result ->
        when (result) {
          is Success -> {
            // Ensure that the value can be resolved correctly
            promise.resolve("Settings closed successfully")
          }

          is Failure -> {
            // Handle failure
            promise.reject(
              result.errorCode.toString(),
              result.errorMessage
            )
          }
        }
      }
    }
  }

  @ReactMethod
  fun getEnvironment(promise: Promise) {
    val settingsManager = MobilePaymentsSdk.settingsManager()
    promise.resolve(settingsManager.getSdkSettings().sdkEnvironment.name)
  }

  @ReactMethod
  fun getSdkVersion(promise: Promise) {
    val settingsManager = MobilePaymentsSdk.settingsManager()
    promise.resolve(settingsManager.getSdkSettings().sdkVersion)
  }

  @ReactMethod
  fun showMockReaderUI(promise: Promise) {
    if (!MobilePaymentsSdk.isSandboxEnvironment()) {
      promise.reject(
        "MOCKREADER_UI_ERROR",
        "Can't use MockReader UI outside of Sandbox environment"
      )
      return
    }

    if (!MobilePaymentsSdk.authorizationManager().authorizationState.isAuthorized) {
      promise.reject(
        "MOCKREADER_UI_ERROR",
        "Can't use MockReader UI when Mobile Payments SDK is not authorized"
      )
      return
    }

    reactContext.currentActivity?.runOnUiThread {
      MockReaderUI.show()
      promise.resolve("Mock Reader UI shown successfully")
    }
  }

  @ReactMethod
  fun hideMockReaderUI() {
    MockReaderUI.hide()
  }

  @ReactMethod
  fun startPayment(
    paymentParameters: ReadableMap,
    promptParameters: ReadableMap,
    promise: Promise
  ) {
    val paymentManager = MobilePaymentsSdk.paymentManager()
    val parsedPaymentParameters = try {
      paymentParameters.readPaymentParameters()
    } catch (e: IllegalArgumentException) {
      promise.reject("INVALID_PAYMENT_PARAMETERS", e.message)
      return
    }

    val parsedPromptParameters = try {
      promptParameters.readPromptParameters()
    } catch (e: IllegalArgumentException) {
      promise.reject("INVALID_PAYMENT_PROMPT", e.message)
      return
    }

    if (paymentHandle != null) {
      promise.reject("PAYMENT_IN_PROGRESS", "A payment is already in progress")
      return
    }

    reactContext.runOnUiQueueThread {
      paymentHandle = paymentManager.startPaymentActivity(
        parsedPaymentParameters,
        parsedPromptParameters
      ) { result ->
        paymentHandle = null
        when (result) {
          is Failure -> promise.reject("PAYMENT_FAILED", result.toErrorMap())
          is Success -> promise.resolve(result.value.toPaymentMap())
        }
      }
    }
  }

  @ReactMethod
  fun cancelPayment(promise: Promise) {
    val cancelResult = paymentHandle?.cancel()
    when (cancelResult) {
      CANCELED -> promise.resolve("Payment successfully canceled")
      NOT_CANCELABLE ->
        promise.reject("PAYMENT_CANCEL_ERROR", "This payment cannot be canceled.")
      NO_PAYMENT_IN_PROGRESS, null ->
        promise.reject("PAYMENT_CANCEL_ERROR", "No payment available to cancel.")
    }
    paymentHandle = null
  }

  private fun emitEvent(reactContext: ReactContext, eventName: String, map: WritableMap) {
    reactContext
      .getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter::class.java)
      .emit(eventName, map)
  }

  @ReactMethod
  fun addListener(type: String?) {
    // Keep: Required for RN built in Event Emitter Calls.
  }

  @ReactMethod
  fun removeListeners(type: Int?) {
    // Keep: Required for RN built in Event Emitter Calls.
  }

  companion object {
    const val NAME = "MobilePaymentsSdkReactNative"
  }
}
