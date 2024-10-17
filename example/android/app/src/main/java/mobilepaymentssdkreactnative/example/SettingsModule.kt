package mobilepaymentssdkreactnative.example

import com.facebook.react.bridge.Promise
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReactContextBaseJavaModule
import com.facebook.react.bridge.ReactMethod
import com.squareup.sdk.mobilepayments.MobilePaymentsSdk
import com.squareup.sdk.mobilepayments.core.Result

class SettingsModule(private val reactContext: ReactApplicationContext) : ReactContextBaseJavaModule(reactContext) {

  override fun getName(): String {
    return "SettingsModule"
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
            promise.reject(result.errorCode.toString(), result.errorMessage ?: "An unknown error occurred")
          }
        }
      }
    }
  }

}
