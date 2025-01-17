package com.mobilepaymentssdkreactnative

import android.app.Activity
import android.app.AlertDialog
import android.content.Context
import android.util.Log
import android.widget.Toast
import com.facebook.react.bridge.Promise
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReactContextBaseJavaModule
import com.facebook.react.bridge.ReactMethod
import com.facebook.react.bridge.ReadableMap
import com.squareup.sdk.mobilepayments.MobilePaymentsSdk
import com.squareup.sdk.mobilepayments.authorization.AuthorizeErrorCode
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

  override fun getName(): String {
    return NAME
  }

  @ReactMethod
  fun authorize(
    accessToken: String,
    locationId: String,
    promise: Promise
  ) {
    val authorizationManager = MobilePaymentsSdk.authorizationManager()

    if (authorizationManager.authorizationState.isAuthorized) {
      return
    }
    authorizationManager.authorize(accessToken, locationId) { result ->
      when (result) {
        is Success -> {
          finishWithAuthorizedSuccess(reactContext, result.value)
          promise.resolve("Authorized with token: $accessToken and location: $locationId")
        }

        is Failure<*, *> -> { // Match any Failure type
          handleAuthorizationFailure(result as Failure<AuthorizeErrorCode, *>, promise)
        }
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
    val authorizationState = when {
      authorizationManager.authorizationState.isAuthorizationInProgress -> "AUTHORIZING"
      authorizationManager.authorizationState.isAuthorized -> "AUTHORIZED"
      else -> "NOT_AUTHORIZED"
    }
    promise.resolve(authorizationState)
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
    if (MobilePaymentsSdk.isSandboxEnvironment() &&
      MobilePaymentsSdk.authorizationManager().authorizationState.isAuthorized) {
      reactContext.currentActivity?.runOnUiThread {
        MockReaderUI.show()
      }
    }
    promise.resolve("Mock Reader UI shown successfully")
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
          is Failure -> promise.reject("PAYMENT_FAILED", result.errorMessage)
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

  companion object {
    const val NAME = "MobilePaymentsSdkReactNative"
  }

  private fun handleAuthorizationFailure(
    result: Failure<AuthorizeErrorCode, *>,
    promise: Promise
  ) {
    when (result.errorCode) {
      AuthorizeErrorCode.NO_NETWORK -> {
        showRetryDialog(reactContext, result)
        Log.d("MobilePayments", "Authorization Failed: $result")
      }

      AuthorizeErrorCode.USAGE_ERROR -> {
        showUsageErrorDialog(reactContext, result)
        Log.d("MobilePayments", "Authorization Error: $result")
      }

      else -> {
        promise.reject("AUTHORIZATION_ERROR", "Authorization failed: ${result.errorCode}")
      }
    }
  }

  private fun showRetryDialog(
    context: Context,
    result: Failure<AuthorizeErrorCode, *>
  ) {
    if (context is Activity && !context.isFinishing) {
      val builder = AlertDialog.Builder(context)
      builder.setTitle("Network Error")
        .setMessage("No network connection. Would you like to retry?")
        .setPositiveButton("Retry") { _, _ ->
          // Implement retry logic here, if necessary
        }
        .setNegativeButton("Cancel") { dialog, _ -> dialog.dismiss() }
      builder.create().show()
    }
  }

  private fun showUsageErrorDialog(
    context: Context,
    result: Failure<AuthorizeErrorCode, *>
  ) {
    if (context is Activity && !context.isFinishing) {
      val builder = AlertDialog.Builder(context)
      builder.setTitle("Usage Error")
        .setMessage(
          "There was an error with the usage of the payment system. Please check your settings."
        )
        .setPositiveButton("OK") { dialog, _ -> dialog.dismiss() }
      builder.create().show()
    }
  }

  private fun finishWithAuthorizedSuccess(
    context: Context,
    value: Any
  ) {
    Toast.makeText(context, "Authorization successful: $value", Toast.LENGTH_LONG).show()
  }
}
