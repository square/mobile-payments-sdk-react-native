package mobilepaymentssdkreactnative.example

import android.app.AlertDialog
import android.util.Log
import android.widget.Toast
import com.facebook.react.ReactActivity
import com.facebook.react.ReactActivityDelegate
import com.facebook.react.defaults.DefaultNewArchitectureEntryPoint.fabricEnabled
import com.facebook.react.defaults.DefaultReactActivityDelegate
import com.squareup.sdk.mobilepayments.MobilePaymentsSdk
import com.squareup.sdk.mobilepayments.authorization.AuthorizeErrorCode
import com.squareup.sdk.mobilepayments.core.CallbackReference
import com.squareup.sdk.mobilepayments.core.Result

class MainActivity : ReactActivity() {

  private var callbackReference : CallbackReference? = null
  /**
   * Returns the name of the main component registered from JavaScript. This is used to schedule
   * rendering of the component.
   */
  override fun getMainComponentName(): String = "MobilePaymentsSdkReactNativeExample"

  /**
   * Returns the instance of the [ReactActivityDelegate]. We use [DefaultReactActivityDelegate]
   * which allows you to enable New Architecture with a single boolean flags [fabricEnabled]
   */
  override fun createReactActivityDelegate(): ReactActivityDelegate =
      DefaultReactActivityDelegate(this, mainComponentName, fabricEnabled)

  override fun onResume() {
    super.onResume()
    val authorizationManager = MobilePaymentsSdk.authorizationManager()
    // Authorize and handle authorization successes or failures
     callbackReference = authorizationManager.authorize($SQUARE_READER_SDK_ACCESS_TOKEN, $SQUARE_READER_SDK_LOCATION_ID) { result ->
      when (result) {
        is Result.Success -> {
          val sharedPreferences = this.getSharedPreferences("MyAppPreferences", MODE_PRIVATE)
          val editor = sharedPreferences.edit()
          editor.putString("authorization_response", result.value.toString()) // Convert to JSON if needed
          editor.apply()
          finishWithAuthorizedSuccess(result.value)
          Log.d("MobilePayments", "Authorization Success: ${result.value}")
        }
        is Result.Failure -> {
          when (result.errorCode) {
            AuthorizeErrorCode.NO_NETWORK -> {
              showRetryDialog(result)

              Log.d("MobilePayments", "Authorization Failed: $result")
            }
            AuthorizeErrorCode.USAGE_ERROR -> {
              showUsageErrorDialog(result)
              Log.d("MobilePayments", "Authorization Error: $result")

            }
            else -> {}
          }
        }

      }
    }
  }

  override fun onPause() {
    super.onPause()
    // Remove the callback reference to prevent memory leaks
    callbackReference?.clear()
  }

  private fun showRetryDialog(result: Result.Failure<*, *>) {
    val builder = AlertDialog.Builder(this)
    builder.setTitle("Network Error")
      .setMessage("No network connection. Would you like to retry?")
      .setPositiveButton("Retry") { _, _ -> onResume() }
      .setNegativeButton("Cancel") { dialog, _ -> dialog.dismiss() }
    builder.create().show()
  }

  private fun showUsageErrorDialog(result: Result.Failure<*, *>) {
    val builder = AlertDialog.Builder(this)
    builder.setTitle("Usage Error")
      .setMessage("There was an error with the usage of the payment system. Please check your settings.")
      .setPositiveButton("OK") { dialog, _ -> dialog.dismiss() }
    builder.create().show()
  }

  private fun finishWithAuthorizedSuccess(value: Any) {
    Toast.makeText(this, "Authorization successful: $value", Toast.LENGTH_LONG).show()
    // Uncomment to finish this activity or navigate to another one
    // finish()
    // startActivity(Intent(this, NextActivity::class.java))
  }
}
