package mobilepaymentssdkreactnative.example

import com.facebook.react.bridge.*
import com.squareup.sdk.mobilepayments.MobilePaymentsSdk
import com.squareup.sdk.mobilepayments.core.Result
import com.squareup.sdk.mobilepayments.payment.CurrencyCode
import com.squareup.sdk.mobilepayments.payment.Money
import com.squareup.sdk.mobilepayments.payment.PaymentParameters
import com.squareup.sdk.mobilepayments.payment.PromptMode
import com.squareup.sdk.mobilepayments.payment.PromptParameters
import java.util.UUID

class SquarePaymentModule(private val reactContext: ReactApplicationContext) : ReactContextBaseJavaModule(reactContext) {
  override fun getName(): String {
    return "SquarePayment"
  }


  @ReactMethod
  fun startPayment(promise: Promise) {
    // Ensure this runs on the main thread
    reactContext.runOnUiQueueThread {
      val paymentManager = MobilePaymentsSdk.paymentManager()
      val paymentParams = PaymentParameters.Builder(
        amount = Money(1000, CurrencyCode.USD),
        idempotencyKey = UUID.randomUUID().toString()
      ).build()

      val promptParams = PromptParameters(
        mode = PromptMode.DEFAULT,
        additionalPaymentMethods = listOf(/* Replace with actual payment methods if KEYED is not available */)
      )

      // Start the payment activity
      val handle = paymentManager.startPaymentActivity(paymentParams, promptParams) { result ->
        when (result) {
          is Result.Success -> {
            promise.resolve(result.value)
          }
          is Result.Failure -> {
            promise.reject("PAYMENT_ERROR", result.errorMessage ?: "Unknown error")
          }
        }
      }
    }
  }


}
