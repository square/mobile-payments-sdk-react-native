
import UIKit
import SquareMobilePaymentsSDK
import MockReaderUI

@objc(MobilePaymentsSdkReactNative)
class MobilePaymentsSdkReactNative: NSObject {

   @objc(authorize:locationId:withResolver:withRejecter:)
    func authorize(accessToken: String, locationId: String, resolve: @escaping RCTPromiseResolveBlock, reject:@escaping RCTPromiseRejectBlock) {
         let response = "Authorized with token: \(accessToken) and location: \(locationId)"
        if MobilePaymentsSDK.shared.authorizationManager.state == .authorized {
             print("Already authorized, showing mock reader UI.")
            self.showMockReaderUI(resolve: resolve, reject: reject)

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
                 self.showMockReaderUI(resolve: resolve, reject: reject)
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

    private lazy var mockReaderUI: MockReaderUI? = {
        do {
            return try MockReaderUI(for: MobilePaymentsSDK.shared)
        } catch {
            assertionFailure("Could not instantiate a mock reader UI: \(error.localizedDescription)")
            return nil
        }
    }()
    
    @objc(showMockReaderUI:withRejecter:)
    func showMockReaderUI(resolve: RCTPromiseResolveBlock, reject: RCTPromiseRejectBlock) {
        DispatchQueue.main.async { [weak self] in
            guard let self = self else { return }
            try? self.mockReaderUI?.present()
        }
    }

    @objc(hideMockReaderUI:withRejecter:)
    func hideMockReaderUI(resolve: @escaping RCTPromiseResolveBlock, reject: @escaping RCTPromiseRejectBlock) {
        DispatchQueue.main.async { [weak self] in
            guard let self = self else {
                reject("HIDE_MOCK_READER_UI_ERROR", "Failed to hide Mock Reader UI: Self is nil", nil)
                return
            }

            if let mockReaderUI = self.mockReaderUI {
                mockReaderUI.dismiss() 
                resolve("Mock Reader UI hidden successfully")
            } else {
                reject("HIDE_MOCK_READER_UI_ERROR", "Mock Reader UI is not presented", nil)
            }
        }
    }


}
