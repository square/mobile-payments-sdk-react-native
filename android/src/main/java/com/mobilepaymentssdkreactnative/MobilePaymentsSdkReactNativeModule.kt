package com.mobilepaymentssdkreactnative

import android.app.Activity
import android.app.AlertDialog
import android.content.Context
import android.util.Log
import android.widget.Toast
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReactContextBaseJavaModule
import com.facebook.react.bridge.ReactMethod
import com.facebook.react.bridge.Promise
import com.squareup.sdk.mobilepayments.authorization.AuthorizeErrorCode
import com.squareup.sdk.mobilepayments.core.Result
import com.squareup.sdk.mobilepayments.MobilePaymentsSdk

class MobilePaymentsSdkReactNativeModule(private val reactContext: ReactApplicationContext) :
  ReactContextBaseJavaModule(reactContext) {

  override fun getName(): String {
    return NAME
  }

  @ReactMethod
  fun multiply(a: Double, b: Double, promise: Promise) {
    promise.resolve(a * b)
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
        is Result.Failure<*, *> -> { // Match any Failure type
          handleAuthorizationFailure(result as Result.Failure<AuthorizeErrorCode, *>, promise)
        }
      }
    }
  }

  @ReactMethod
  fun deauthorize(promise: Promise) {
    promise.resolve("Deauthorized successfully")
  }

  @ReactMethod
  fun getAuthorizedLocation(promise: Promise) {
    promise.resolve(mapOf("locationId" to "location123", "name" to "Sample Location"))
  }

  @ReactMethod
  fun getAuthorizationState(promise: Promise) {
    promise.resolve("Authorized")
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
