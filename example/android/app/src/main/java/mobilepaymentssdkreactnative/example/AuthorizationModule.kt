import android.content.Context.MODE_PRIVATE
import com.facebook.react.bridge.Promise
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReactContextBaseJavaModule
import com.facebook.react.bridge.ReactMethod

class AuthorizationModule(reactContext: ReactApplicationContext) : ReactContextBaseJavaModule(reactContext) {

    override fun getName(): String {
        return "AuthorizationModule"
    }

    @ReactMethod
    fun getAuthorizationResponse(promise: Promise) {
        val sharedPreferences = currentActivity?.getSharedPreferences("MyAppPreferences", MODE_PRIVATE)
        val response = sharedPreferences?.getString("authorization_response", null)

        if (response != null) {
            promise.resolve(response) // Return the stored response
        } else {
            promise.reject("NO_RESPONSE", "No authorization response found.")
        }
    }
}
