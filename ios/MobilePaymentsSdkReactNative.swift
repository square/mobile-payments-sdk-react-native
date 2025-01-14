
import UIKit
import SquareMobilePaymentsSDK
import MockReaderUI
import React

@objc(MobilePaymentsSdkReactNative)
class MobilePaymentsSdkReactNative: RCTEventEmitter {

    private let mobilePaymentsSDK =  MobilePaymentsSDK.shared
    private var observingAuthorizationChanges = false
    private var authorizationObservers: NSHashTable<AnyObject> = .weakObjects()

    /// We use notifications to propagate authorization status changes and reader changes
    override func supportedEvents() -> [String]! {
        return ["AuthorizationStatusChange"]
    }

    /// Authorize: https://developer.squareup.com/docs/mobile-payments-sdk/ios/configure-authorize
    @objc(authorize:locationId:withResolver:withRejecter:)
    func authorize(accessToken: String, locationId: String, resolve: @escaping RCTPromiseResolveBlock, reject: @escaping RCTPromiseRejectBlock) {
        if mobilePaymentsSDK.authorizationManager.state == .authorized {
            return resolve("Already authorized, skipping")
        }
        mobilePaymentsSDK.authorizationManager.authorize(
            withAccessToken: accessToken,
            locationID: locationId) { error in
                if let authError = error {
                    // TODO: unwrap error
                    return reject("AUTHENTICATION_ERROR", authError.localizedDescription, nil)
                }
                return resolve("Authorized with token: \(accessToken) and location: \(locationId)")
            }
    }

    // Deauthorize
    @objc(deauthorize:withRejecter:)
    func deauthorize(resolve: @escaping RCTPromiseResolveBlock, reject: @escaping RCTPromiseRejectBlock) {
        mobilePaymentsSDK.authorizationManager.deauthorize {
            resolve("Square Mobile Payments SDK successfully deauthorized.")
        }
    }

    // Get Authorized Location method
    @objc(getAuthorizedLocation:withRejecter:)
    func getAuthorizedLocation(resolve: @escaping RCTPromiseResolveBlock, reject: @escaping RCTPromiseRejectBlock) {
        guard let location = mobilePaymentsSDK.authorizationManager.location else {
            return resolve(nil)
        }
        resolve(ReactMapper.mapToDictionary(location: location) as Any)
    }

    // Get Authorization State method
    @objc(getAuthorizationState:withRejecter:)
    func getAuthorizationState(resolve: RCTPromiseResolveBlock, reject: RCTPromiseRejectBlock) {
        let state = mobilePaymentsSDK.authorizationManager.state
        resolve(state.mapToString())
    }

    @objc(addAuthorizationObserver:withRejecter:)
    func addAuthorizationObserver(resolve: @escaping RCTPromiseResolveBlock, reject: @escaping RCTPromiseRejectBlock) {
        DispatchQueue.main.async { [weak self] in
            guard let self else {
                return reject("AUTHENTICATION_OBSERVER_ERROR","Unable to add observer to Authorization changes. Please try again.", nil)
            }
            self.mobilePaymentsSDK.authorizationManager.add(self)
            // Keeping a weak reference to our observers to decide when no one's observing auth changes we can stop
            self.authorizationObservers.add(self)
            self.observingAuthorizationChanges = true
            resolve("Authorization State Observer Added")
        }
    }
    
    @objc(removeAuthorizationObserver:withRejecter:)
    func removeAuthorizationObserver(resolve: @escaping RCTPromiseResolveBlock, reject: @escaping RCTPromiseRejectBlock) {
        DispatchQueue.main.async { [weak self] in
            guard let self else {
                return reject("AUTHENTICATION_OBSERVER_ERROR","Unable to remove observer to Authorization changes. Please try again.", nil)
            }
            self.mobilePaymentsSDK.authorizationManager.remove(self)
            self.authorizationObservers.remove(self)
            if (self.authorizationObservers.count == 0) {
                self.observingAuthorizationChanges = false
            }
            resolve("Authorization State Observer Removed")
        }
    }
    @objc(showSettings:withRejecter:)
    func showSettings(resolve: RCTPromiseResolveBlock, reject: RCTPromiseRejectBlock) {
          DispatchQueue.main.async { [weak self] in
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
                    self?.mobilePaymentsSDK.settingsManager.presentSettings(with: rootViewController) { _ in
                        print("Settings screen closed.")
                    }
                }
            } else {
                // No view controller presented, so present the settings screen directly
                self?.mobilePaymentsSDK.settingsManager.presentSettings(with: rootViewController) { _ in
                    print("Settings screen closed.")
                }
            }
        }
    }

    private lazy var mockReaderUI: MockReaderUI? = {
        guard mobilePaymentsSDK.settingsManager.sdkSettings.environment == .sandbox else {
            return nil
        }
        do {
            return try MockReaderUI(for: mobilePaymentsSDK)
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

extension MobilePaymentsSdkReactNative : AuthorizationStateObserver {
    func authorizationStateDidChange(_ authorizationState: AuthorizationState) {
        if (observingAuthorizationChanges) {
            sendEvent(withName: "AuthorizationStatusChange", body: ["state": authorizationState.mapToString()] )
        }
    }
}

extension SquareMobilePaymentsSDK.AuthorizationState {
    func mapToString() -> String {
        switch self {
        case .authorized:
            return "AUTHORIZED"
        case .authorizing:
            return "AUTHORIZING"
        case .notAuthorized:
            return "NOT_AUTHORIZED"
        default:
            return ""
        }
    }
}

class ReactMapper {
    class func mapToDictionary(location: Location) -> NSDictionary {
        return [
            "id": location.id,
            "name": location.name,
            "mcc": location.mcc,
            "currency": location.currency.currencyCode // TODO: map this to a currency object
        ]
    }
}
