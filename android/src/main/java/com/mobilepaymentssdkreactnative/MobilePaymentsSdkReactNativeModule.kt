package com.mobilepaymentssdkreactnative

import com.facebook.react.bridge.Arguments
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
import com.squareup.sdk.mobilepayments.cardreader.PairingHandle
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
  private var readerChangedCallbacks = mutableMapOf<String, CallbackReference>();
  private var pairingHandler: PairingHandle? = null
  // The JS promise for the pairing in flight, kept so stopPairing can settle it: the SDK does not
  // call the pairReader callback after stop().
  private var pairingPromise: Promise? = null

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
          // Never echo the access token back to JS: it ends up in logs and crash reports.
          promise.resolve("Authorized with location: $locationId")

        is Failure ->
          promise.reject("AUTHENTICATION_ERROR", result.errorMessage, result.toErrorMap())
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
          is Success -> promise.resolve("Settings closed successfully")
          is Failure -> promise.reject("SETTINGS_ERROR", result.errorMessage, result.toErrorMap())
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
  fun getMpocVersion(promise: Promise) {
    val settingsManager = MobilePaymentsSdk.settingsManager()
    promise.resolve(settingsManager.getSdkSettings().mpocVersion)
  }

  @ReactMethod
  fun isShowingSettings(promise: Promise) {
    reactContext.runOnUiQueueThread {
      val settingsManager = MobilePaymentsSdk.settingsManager()
      promise.resolve(settingsManager.isShowingSettings())
    }
  }

  @ReactMethod
  fun closeSettings(promise: Promise) {
    reactContext.runOnUiQueueThread {
      val settingsManager = MobilePaymentsSdk.settingsManager()
      promise.resolve(settingsManager.closeSettings())
    }
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
    reactContext.currentActivity?.runOnUiThread {
      MockReaderUI.hide()
    }
  }

  @ReactMethod
  fun startPayment(
    paymentParameters: ReadableMap,
    promptParameters: ReadableMap,
    promise: Promise
  ) {
    val paymentManager = MobilePaymentsSdk.paymentManager()
    // ReadableMap getters throw ClassCastException / NoSuchKeyException (both RuntimeExceptions)
    // when JS passes the wrong type, so catching only IllegalArgumentException would let a typo
    // in a JS arg crash the app instead of rejecting the promise.
    val parsedPaymentParameters = try {
      paymentParameters.readPaymentParameters()
    } catch (e: RuntimeException) {
      promise.reject("INVALID_PAYMENT_PARAMETERS", e.message, e)
      return
    }

    val parsedPromptParameters = try {
      promptParameters.readPromptParameters()
    } catch (e: RuntimeException) {
      promise.reject("INVALID_PAYMENT_PROMPT", e.message, e)
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
          is Success -> promise.resolve(result.value.toPaymentMap())
          is Failure -> promise.reject("PAYMENT_FAILED", result.errorMessage, result.toErrorMap())
        }
      }
    }
  }

  @ReactMethod
  fun cancelPayment(promise: Promise) {
    val cancelResult = paymentHandle?.cancel()
    when (cancelResult) {
      CANCELED -> {
        paymentHandle = null
        promise.resolve("Payment successfully canceled")
      }
      // The payment is still live, so the handle must stay: dropping it here would disable the
      // PAYMENT_IN_PROGRESS guard and let a second startPayment launch on top of this one.
      NOT_CANCELABLE ->
        promise.reject("PAYMENT_CANCEL_ERROR", "This payment cannot be canceled.")
      NO_PAYMENT_IN_PROGRESS, null -> {
        paymentHandle = null
        promise.reject("PAYMENT_CANCEL_ERROR", "No payment available to cancel.")
      }
    }
  }

  @ReactMethod
  fun isOfflineProcessingAllowed(promise: Promise) {
    val paymentSettings = MobilePaymentsSdk.settingsManager().getPaymentSettings()
    promise.resolve(paymentSettings.isOfflineProcessingAllowed)
  }

  @ReactMethod
  fun getOfflineTotalStoredAmountLimit(promise: Promise) {
    val paymentSettings = MobilePaymentsSdk.settingsManager().getPaymentSettings()
    promise.resolve(paymentSettings.offlineTotalStoredAmountLimit?.toMoneyMap())
  }

  @ReactMethod
  fun getOfflineTransactionAmountLimit(promise: Promise) {
    val paymentSettings = MobilePaymentsSdk.settingsManager().getPaymentSettings()
    promise.resolve(paymentSettings.offlineTransactionAmountLimit?.toMoneyMap())
  }

  @ReactMethod
  fun getPayments(promise: Promise) {
    val offlinePaymentQueue = MobilePaymentsSdk.paymentManager().getOfflinePaymentQueue()
    offlinePaymentQueue.getPayments { result ->
      when (result) {
        is Success -> {
          val paymentList = Arguments.createArray()
          result.value.forEach { payment ->
            paymentList.pushMap(payment.toPaymentMap())
          }
          promise.resolve(paymentList)
        }
        is Failure -> {
          promise.reject("GET_OFFLINE_PAYMENTS_FAILED", result.errorMessage, result.toErrorMap())
        }
      }
    }
  }

  @ReactMethod
  fun getTotalStoredPaymentAmount(promise: Promise) {
    val offlinePaymentQueue = MobilePaymentsSdk.paymentManager().getOfflinePaymentQueue()
    val result = offlinePaymentQueue.getTotalStoredPaymentAmount()
    when (result) {
      is Success -> {
        promise.resolve(result.value.toMoneyMap())
      }
      is Failure -> {
        promise.reject("GET_TOTAL_STORED_PAYMENTS_FAILED", result.errorMessage, result.toErrorMap())
      }
    }
  }

  @ReactMethod
  fun getReaders(promise: Promise) {
    val readerManager = MobilePaymentsSdk.readerManager()
    val readers = readerManager.getReaders()
    val readerList = Arguments.createArray()
    readers.forEach {
      readerList.pushMap(it.toReaderInfoMap())
    }
    promise.resolve(readerList)
  }

  @ReactMethod
  fun getReader(id: String, promise: Promise) {
    val readerManager = MobilePaymentsSdk.readerManager()
    val reader = readerManager.getReader(id)
    val readerMap = reader?.toReaderInfoMap()
    promise.resolve(readerMap)
  }

  @ReactMethod
  fun forget(id: String, promise: Promise) {
    val readerManager = MobilePaymentsSdk.readerManager()
    val reader = readerManager.getReader(id)
    if (reader != null)
      readerManager.forget(reader)
    promise.resolve(null)
  }

  @ReactMethod
  fun blink(id: String, promise: Promise) {
    val readerManager = MobilePaymentsSdk.readerManager()
    val reader = readerManager.getReader(id)
    if (reader != null)
      readerManager.blink(reader)
    promise.resolve(null)
  }

  @ReactMethod
  fun isPairingInProgress(promise: Promise) {
    val readerManager = MobilePaymentsSdk.readerManager()
    promise.resolve(readerManager.isPairingInProgress)
  }

  // setReaderChangedCallback
  @ReactMethod
  fun addReaderChangedCallback(refId: String, promise: Promise) {
    val readerManager = MobilePaymentsSdk.readerManager()
    val ref = readerManager.setReaderChangedCallback{
      changeEvent ->
        emitEvent(reactContext, "ReaderChanged-${refId}", changeEvent.toChangedEventMap())
    }
    readerChangedCallbacks.put(refId, ref)
    promise.resolve(refId)
  }

  @ReactMethod
  fun removeReaderChangedCallback(refId: String, promise: Promise) {
    val ref = readerChangedCallbacks.get(refId)
    if (ref != null) {
      ref.clear()
      readerChangedCallbacks.remove(refId)
    }
    promise.resolve(null)
  }
  // ---

  @ReactMethod
  fun retryConnection(id: String, promise: Promise) {
    val readerManager = MobilePaymentsSdk.readerManager()
    val reader = readerManager.getReader(id)
    if (reader == null) {
      promise.reject("READER_NOT_FOUND", "No reader found with id '$id'")
      return
    }
    promise.resolve(readerManager.retryConnection(reader).toRetryConnectionResultString())
  }

  // pairReader
  @ReactMethod
  fun pairReader(promise: Promise) {
    if(pairingHandler != null) {
      promise.reject("PAIRING_IN_PROGRESS", "A pairing is already in progress")
      return
    }
    val readerManager = MobilePaymentsSdk.readerManager()
    pairingPromise = promise
    pairingHandler = readerManager.pairReader {
      result ->
        val pending = takePairingPromise() ?: return@pairReader
        pairingHandler = null
        when(result) {
          is Success -> pending.resolve(result.value)
          is Failure -> pending.reject("PAIRING_ERROR", result.errorMessage, result.toErrorMap())
        }
    }
  }

  @ReactMethod
  fun stopPairing(promise: Promise) {
    if(pairingHandler != null) {
      pairingHandler?.stop()
      pairingHandler = null;
      // `false` means the pairing ended without completing.
      takePairingPromise()?.resolve(false)
    }
    promise.resolve(null)
  }

  /** Returns the pending pairReader promise at most once so it is never settled twice. */
  @Synchronized
  private fun takePairingPromise(): Promise? {
    val pending = pairingPromise
    pairingPromise = null
    return pending
  }
  // ---

  @ReactMethod
  fun readerSettings(promise: Promise) {
    val readerManager = MobilePaymentsSdk.readerManager()
    promise.resolve(readerManager.readerSettings.toReaderSettingsMap())
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
