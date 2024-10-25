
import UIKit
import SquareMobilePaymentsSDK

@objc(MobilePaymentsSdkReactNative)
class MobilePaymentsSdkReactNative: NSObject {
    
 

  @objc(multiply:withB:withResolver:withRejecter:)
  func multiply(a: Float, b: Float, resolve:RCTPromiseResolveBlock,reject:RCTPromiseRejectBlock) -> Void {
    resolve(a*b)
  }

   @objc(authorize:locationId:withResolver:withRejecter:)
    func authorize(accessToken: String, locationId: String, resolve: RCTPromiseResolveBlock, reject: RCTPromiseRejectBlock) {
         let response = "Authorized with token: \(accessToken) and location: \(locationId)"
         guard MobilePaymentsSDK.shared.authorizationManager.state == .notAuthorized else {
             return
         }

         MobilePaymentsSDK.shared.authorizationManager.authorize(
            withAccessToken: accessToken,
             locationID: locationId) { error in
                 if let authError = error {
                     // Handle auth error
                     print("errorssss: \(authError.localizedDescription)")
                     return
                 }
                 print("Square Mobile Payments SDK successfully authorized.")
         }
        resolve(response)

        
    }

    // Deauthorize method
    @objc(deauthorize:withRejecter:)
    func deauthorize(resolve: RCTPromiseResolveBlock, reject: RCTPromiseRejectBlock) {
        resolve("Deauthorized successfully")
    }

    // Get Authorized Location method
    @objc(getAuthorizedLocation:withRejecter:)
    func getAuthorizedLocation(resolve: RCTPromiseResolveBlock, reject: RCTPromiseRejectBlock) {
        let locationInfo: [String: Any] = ["locationId": "location123", "name": "Sample Location"]
        resolve(locationInfo)
    }

    // Get Authorization State method
    @objc(getAuthorizationState:withRejecter:)
    func getAuthorizationState(resolve: RCTPromiseResolveBlock, reject: RCTPromiseRejectBlock) {
        resolve("Authorized")
    }
    
    @objc(showSettings:withRejecter:)
    func showSettings(resolve: RCTPromiseResolveBlock, reject: RCTPromiseRejectBlock) {
          DispatchQueue.main.async {
            // Get the active scene
            guard let windowScene = UIApplication.shared.connectedScenes.first as? UIWindowScene,
                  let rootViewController = windowScene.windows.first?.rootViewController else {
                print("No window scene or root view controller found.")
                return
            }

            // Check if a view controller is currently presented
            if let presentedViewController = rootViewController.presentedViewController {
                // Optionally dismiss the currently presented view controller
                presentedViewController.dismiss(animated: false) {
                    // Present the settings screen after dismissing
                    MobilePaymentsSDK.shared.settingsManager.presentSettings(with: rootViewController) { _ in
                        print("Settings screen closed.")
                    }
                }
            } else {
                // No view controller presented, so present the settings screen directly
                MobilePaymentsSDK.shared.settingsManager.presentSettings(with: rootViewController) { _ in
                    print("Settings screen closed.")
                }
            }
        }
    }

    // New method to get environment
    @objc(getEnvironment:withRejecter:)
    func getEnvironment(resolve: RCTPromiseResolveBlock, reject: RCTPromiseRejectBlock) {
        // Replace with actual logic to get environment
        let environment = "Production" // Example value
        resolve(environment)
    }

    // New method to get SDK version
    @objc(getSdkVersion:withRejecter:)
    func getSdkVersion(resolve: RCTPromiseResolveBlock, reject: RCTPromiseRejectBlock) {
        // Replace with actual logic to get SDK version
        let sdkVersion = "1.0.0" // Example version
        resolve(sdkVersion)
    }
}
