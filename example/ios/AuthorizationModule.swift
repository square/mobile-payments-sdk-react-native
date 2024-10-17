import Foundation
import React
import UIKit
import SquareMobilePaymentsSDK

@objc(AuthorizationModule)
class AuthorizationModule: NSObject, RCTBridgeModule {

    // Required for React Native to recognize the module
    static func moduleName() -> String {
        return "AuthorizationModule"
    }

    // Function to initiate authorization
    @objc
    func authorize() {
        // Present the AuthorizationController on the main thread
        DispatchQueue.main.async {
            let authorizationController = AuthorizationController()

            if let windowScene = UIApplication.shared.connectedScenes.first as? UIWindowScene {
                if let rootViewController = windowScene.windows.first?.rootViewController {
                        authorizationController.authorizeMobilePaymentsSDK()
                }
            }
        }
    }
}
