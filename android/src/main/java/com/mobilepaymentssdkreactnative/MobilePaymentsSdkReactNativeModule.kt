package com.mobilepaymentssdkreactnative

import android.app.Activity
import android.app.AlertDialog
import android.content.Context
import android.os.Handler
import android.os.Looper
import android.util.Log
import android.widget.Toast
import com.facebook.react.bridge.Arguments
import com.facebook.react.bridge.Promise
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReactContextBaseJavaModule
import com.facebook.react.bridge.ReactMethod
import com.facebook.react.bridge.ReadableMap
import com.squareup.sdk.mobilepayments.MobilePaymentsSdk
import com.squareup.sdk.mobilepayments.authorization.AuthorizeErrorCode
import com.squareup.sdk.mobilepayments.core.Result
import com.squareup.sdk.mobilepayments.mockreader.ui.MockReaderUI
import com.squareup.sdk.mobilepayments.payment.CurrencyCode
import com.squareup.sdk.mobilepayments.payment.Money
import com.squareup.sdk.mobilepayments.payment.Payment
import com.squareup.sdk.mobilepayments.payment.PaymentParameters
import com.squareup.sdk.mobilepayments.payment.PromptMode
import com.squareup.sdk.mobilepayments.payment.PromptParameters
import java.util.UUID


class MobilePaymentsSdkReactNativeModule(private val reactContext: ReactApplicationContext) :
  ReactContextBaseJavaModule(reactContext) {

  override fun getName(): String {
    return NAME
  }

  @ReactMethod
  fun authorize(accessToken: String, locationId: String, promise: Promise) {
    val authorizationManager = MobilePaymentsSdk.authorizationManager()

    if(authorizationManager.authorizationState.isAuthorized){
      return
    }
    authorizationManager.authorize(accessToken, locationId) { result ->
      when (result) {
        is Result.Success -> {
          finishWithAuthorizedSuccess(reactContext, result.value)
          promise.resolve("Authorized with token: $accessToken and location: $locationId")
        }
        is Result.Failure<*, *> -> { // Match any Failure type
          handleAuthorizationFailure(result as Result.Failure<AuthorizeErrorCode, *>, promise)
        }
      }
    }
  }

  @ReactMethod
  fun deauthorize(promise: Promise) {
    promise.resolve("Not yet implemented")
  }

  @ReactMethod
  fun getAuthorizedLocation(promise: Promise) {
    promise.resolve("Not yet implemented")
  }

  @ReactMethod
  fun getAuthorizationState(promise: Promise) {
    promise.resolve("Not yet implemented")
  }

  @ReactMethod
  fun showSettings(promise: Promise) {
    reactContext.runOnUiQueueThread {
      val settingsManager = MobilePaymentsSdk.settingsManager()
      settingsManager.showSettings { result ->
        when (result) {
          is Result.Success -> {
            // Ensure that the value can be resolved correctly
            promise.resolve("Settings closed successfully")
          }
          is Result.Failure -> {
            // Handle failure
            promise.reject(result.errorCode.toString(), result.errorMessage ?: "settings screen can't be presented")
          }
        }
      }
    }
  }

  @ReactMethod
  fun showMockReaderUI(promise: Promise) {
    if (MobilePaymentsSdk.isSandboxEnvironment()) {
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
  fun startPayment(paymentParameters: ReadableMap, promise: Promise) {
    Handler(Looper.getMainLooper()).post {
      val paymentManager = MobilePaymentsSdk.paymentManager()
      val paymentParams = PaymentParameters.Builder(
        amount = Money(1000, CurrencyCode.USD),
        idempotencyKey = UUID.randomUUID().toString()
      ).build()
      val promptParams = PromptParameters(
        mode = PromptMode.DEFAULT,
        additionalPaymentMethods = listOf() // Use the correct reference
      )

      val handle = paymentManager.startPaymentActivity(paymentParams, promptParams) { result ->
        when (result) {
          is Result.Success -> {
            Log.d("PaymentModule", "Payment succeeded with result: ${result.value}")
            val onlinePayment = result.value as? Payment.OnlinePayment
            if (onlinePayment != null) {
              val paymentInfo = Arguments.createMap().apply {
              }
              promise.resolve(paymentInfo)
            } else {
              promise.reject("PAYMENT_ERROR", "Invalid payment result type")
            }
          }
          is Result.Failure -> {
            Log.e("PaymentModule", "Payment failed with error: ${result.errorMessage}")
            promise.reject("PAYMENT_ERROR", result.errorMessage)
          }
        }

      }

      Log.d("PaymentModule", "Payment activity started.")
    }
  }

  @ReactMethod
  fun cancelPayment(promise: Promise) {
  }


  companion object {
    const val NAME = "MobilePaymentsSdkReactNative"
  }

  private fun handleAuthorizationFailure(result: Result.Failure<AuthorizeErrorCode, *>, promise: Promise) {
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

  private fun showRetryDialog(context: Context, result: Result.Failure<AuthorizeErrorCode, *>) {
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

  private fun showUsageErrorDialog(context: Context, result: Result.Failure<AuthorizeErrorCode, *>) {
    if (context is Activity && !context.isFinishing) {
      val builder = AlertDialog.Builder(context)
      builder.setTitle("Usage Error")
        .setMessage("There was an error with the usage of the payment system. Please check your settings.")
        .setPositiveButton("OK") { dialog, _ -> dialog.dismiss() }
      builder.create().show()
    }
  }


  private fun finishWithAuthorizedSuccess(context: Context, value: Any) {
    Toast.makeText(context, "Authorization successful: $value", Toast.LENGTH_LONG).show()
  }
}
