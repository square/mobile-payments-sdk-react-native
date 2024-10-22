package com.mobilepaymentssdkreactnative

import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReactContextBaseJavaModule
import com.facebook.react.bridge.ReactMethod
import com.facebook.react.bridge.Promise

class MobilePaymentsSdkReactNativeModule(reactContext: ReactApplicationContext) :
  ReactContextBaseJavaModule(reactContext) {

  override fun getName(): String {
    return NAME
  }

  // Example method
  // See https://reactnative.dev/docs/native-modules-android
  @ReactMethod
  fun multiply(a: Double, b: Double, promise: Promise) {
    promise.resolve(a * b)
  }

      @ReactMethod
    fun authorize(accessToken: String, locationId: String, promise: Promise) {
        promise.resolve("Authorized with token: $accessToken and location: $locationId")
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
}
