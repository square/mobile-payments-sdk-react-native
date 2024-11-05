
import UIKit
import SquareMobilePaymentsSDK

@objc(MobilePaymentsSdkReactNative)
class MobilePaymentsSdkReactNative: NSObject {

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
        resolve("Not yet implemented")
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
        resolve("Not yet implemented")
    }
}
