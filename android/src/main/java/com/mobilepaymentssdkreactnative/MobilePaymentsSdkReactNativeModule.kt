package com.mobilepaymentssdkreactnative

import android.app.Activity
import android.app.AlertDialog
import android.content.Context
import android.os.Handler
import android.os.Looper
import android.util.Log
import android.widget.Toast
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
import com.squareup.sdk.mobilepayments.payment.PaymentParameters
import com.squareup.sdk.mobilepayments.payment.PromptMode
import com.squareup.sdk.mobilepayments.payment.PromptParameters

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

  private fun mapToPaymentParameters(paymentParameters: ReadableMap): PaymentParameters {
    val amountMoney = paymentParameters.getMap("amountMoney")
    val amount = amountMoney?.getInt("amount") ?: 0

    val currencyCodeOrdinal: Int = try {
      paymentParameters.getMap("amountMoney")?.getInt("currencyCode") ?: -1
    } catch (e: Exception) {
      -1
    }

    val validCurrencyCode = try {
      if (currencyCodeOrdinal in CurrencyCode.entries.toTypedArray().indices) {
        CurrencyCode.entries[currencyCodeOrdinal]
      } else {
        throw IllegalArgumentException("Invalid currency code ordinal: $currencyCodeOrdinal")
      }
    } catch (e: IllegalArgumentException) {
      throw IllegalArgumentException("Invalid currency code provided: $currencyCodeOrdinal")
    }

    val idempotencyKey = paymentParameters.getString("idempotencyKey")
      ?.takeIf { it.isNotEmpty() }
      ?: throw IllegalArgumentException("idempotencyKey is required and cannot be null or empty.")
    return PaymentParameters.Builder(
      amount = Money(amount.toLong(), validCurrencyCode),
      idempotencyKey = idempotencyKey
    ).build()
  }

  @ReactMethod
  fun startPayment(paymentParameters: ReadableMap, promise: Promise) {
    Handler(Looper.getMainLooper()).post {
      val paymentManager = MobilePaymentsSdk.paymentManager()

      try {
        val paymentParams = mapToPaymentParameters(paymentParameters)

        val promptParams = PromptParameters(
          mode = PromptMode.DEFAULT,
          additionalPaymentMethods = listOf()
        )

        paymentManager.startPaymentActivity(paymentParams, promptParams) { result ->
          when (result) {
            is Result.Success -> {
              Log.d("PaymentModule", "Payment succeeded with result: ${result.value}")
              promise.resolve(result.value.amountMoney.toString())
            }
            is Result.Failure -> {
              Log.e("PaymentModule", "Payment failed with error: ${result.errorMessage}")
              promise.reject("PAYMENT_ERROR", result.errorMessage)
            }
          }
        }
        Log.d("PaymentModule", "Payment activity started.")
      } catch (e: IllegalArgumentException) {
        Log.e("PaymentModule", "Invalid input: ${e.message}")
        promise.reject("INVALID_INPUT", e.message)
      }
    }
  }


  @ReactMethod
  fun cancelPayment(promise: Promise) {
    TODO("cancellation isn't yet implemented")
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
