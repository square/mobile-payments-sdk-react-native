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
import com.facebook.react.bridge.WritableNativeMap
import com.squareup.sdk.mobilepayments.MobilePaymentsSdk
import com.squareup.sdk.mobilepayments.authorization.AuthorizationState
import com.squareup.sdk.mobilepayments.authorization.AuthorizeErrorCode
import com.squareup.sdk.mobilepayments.authorization.AuthorizedLocation
import com.squareup.sdk.mobilepayments.core.Result
import com.squareup.sdk.mobilepayments.mockreader.ui.MockReaderUI

typealias AuthorizationFailure = Result.Failure<AuthorizedLocation, AuthorizeErrorCode>

class MobilePaymentsSdkReactNativeModule(private val reactContext: ReactApplicationContext) :
  ReactContextBaseJavaModule(reactContext) {

  override fun getName(): String {
    return NAME
  }

  @ReactMethod
  fun authorize(accessToken: String, locationId: String, promise: Promise) {
    val authorizationManager = MobilePaymentsSdk.authorizationManager()

    authorizationManager.authorize(accessToken, locationId) { result ->
      when (result) {
        is Result.Success -> {
          finishWithAuthorizedSuccess(reactContext, result.value)
          promise.resolve("Authorized with token: $accessToken and location: $locationId")
        }
        is Result.Failure -> { // Match any Failure type
          handleAuthorizationFailure(result, promise)
        }
      }
    }
  }

  /** Deauthorizes MPSDK (instantly), and resolves the promise with a success string. */
  @ReactMethod
  fun deauthorize(promise: Promise) {
    MobilePaymentsSdk.authorizationManager().deauthorize()
    promise.resolve("Square Mobile Payments SDK successfully deauthorized.")
  }

  /** Resolves the promise (instantly) with a possibly-null location (null if not authorized). */
  @ReactMethod
  fun getAuthorizedLocation(promise: Promise) {
    val location = MobilePaymentsSdk.authorizationManager().authorizedLocation
    promise.resolve(location.toJavascriptMap())
  }

  /** Resolves the promise (instantly) with the name of the authorization state. */
  @ReactMethod
  fun getAuthorizationState(promise: Promise) {
    promise.resolve(MobilePaymentsSdk.authorizationManager().authorizationState.toName())
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
            promise.reject(result.errorCode.toString(), result.errorMessage)
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

  companion object {
    const val NAME = "MobilePaymentsSdkReactNative"
  }

  private fun handleAuthorizationFailure(result: AuthorizationFailure, promise: Promise) {
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

  private fun showRetryDialog(context: Context, result: AuthorizationFailure) {
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

  private fun showUsageErrorDialog(context: Context, result: AuthorizationFailure) {
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

  private fun AuthorizationState.toName() = when {
    isAuthorized -> "AUTHORIZED"
    isAuthorizationInProgress -> "AUTHORIZING"
    else -> "NOT_AUTHORIZED"
  }

  private fun AuthorizedLocation?.toJavascriptMap() = when (this) {
    null -> null
    else -> WritableNativeMap().apply {
      putString("id", locationId)
      putString("name", name)
      putString("currency", currencyCode.name)
      putString("merchant", merchantId)
      putString("business_name", businessName)
      putBoolean("card_processing_activated", cardProcessingActivated)
    }
  }
}
