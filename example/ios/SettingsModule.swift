import Foundation
import React
import SquareMobilePaymentsSDK

@objc(SettingsModule)
class SettingsModule: NSObject, RCTBridgeModule {

    // Required for React Native to recognize the module
    static func moduleName() -> String {
        return "SettingsModule"
    }

    // Function to present the settings screen
  @objc
  func showSettingsForIOS() {
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

}
