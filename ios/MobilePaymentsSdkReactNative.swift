
import UIKit
import SquareMobilePaymentsSDK
import MockReaderUI
import React

@objc(MobilePaymentsSdkReactNative)
class MobilePaymentsSdkReactNative: RCTEventEmitter {

    private let mobilePaymentsSDK =  MobilePaymentsSDK.shared
    private var observingAuthorizationChanges = false
    private var authorizationObservers: NSHashTable<AnyObject> = .weakObjects()

    private var startPaymentResolveBlock: RCTPromiseResolveBlock?
    private var startPaymentRejectBlock: RCTPromiseRejectBlock?
    private var paymentHandle: PaymentHandle?

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
        DispatchQueue.main.async { [weak self] in
            self?.mobilePaymentsSDK.authorizationManager.deauthorize {
                resolve("Square Mobile Payments SDK successfully deauthorized.")
            }
        }
    }

    // Get Authorized Location method
    @objc(getAuthorizedLocation:withRejecter:)
    func getAuthorizedLocation(resolve: @escaping RCTPromiseResolveBlock, reject: @escaping RCTPromiseRejectBlock) {
        guard let location = mobilePaymentsSDK.authorizationManager.location else {
            return resolve(nil)
        }
        resolve(Mappers.mapToDictionary(location: location) as Any)
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

    /// Settings: https://developer.squareup.com/docs/mobile-payments-sdk/ios/pair-manage-readers#settings-manager
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

    @objc(getEnvironment:withRejecter:)
    func getEnvironment(resolve: RCTPromiseResolveBlock, reject: RCTPromiseRejectBlock) {
        switch(mobilePaymentsSDK.settingsManager.sdkSettings.environment) {
        case .production:
            return resolve("PRODUCTION")
        case .sandbox:
            return resolve("SANDBOX")
        default:
            reject("UNKNOWN_ENVIRONMENT", "Unknown environment found.", nil)
        }
    }

    @objc(getSDKVersion:withRejecter:)
    func getSDKVersion(resolve: RCTPromiseResolveBlock, reject: RCTPromiseRejectBlock) {
        return resolve(mobilePaymentsSDK.settingsManager.sdkSettings.version)
    }

    /// Mock Readers, available only in Sandbox: https://developer.squareup.com/docs/mobile-payments-sdk/ios#mock-readers
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

    /// Start Payment: https://developer.squareup.com/docs/mobile-payments-sdk/ios/take-payments
    @objc(startPayment:promptParameters:withResolver:withRejecter:)
    func startPayment(_ paymentParameters: [String: Any], promptParameters: [String: Any], resolve: @escaping RCTPromiseResolveBlock, reject: @escaping RCTPromiseRejectBlock) {
        // Keeping a reference for the resolvers so the protocol can propagate the results
        self.startPaymentResolveBlock = resolve
        self.startPaymentRejectBlock = reject

        let params: PaymentParameters
        let paymentResult = Mappers.mapPaymentParameters(paymentParameters)
        switch paymentResult {
        case .success(let validParams):
            params = validParams
        case .failure(let error):
            return reject("INVALID_PAYMENT_PARAMETERS", error.localizedDescription, nil)
        }

        let promptParams:PromptParameters
        let promptResult = Mappers.mapPromptParameters(promptParameters)
        switch promptResult {
        case .success(let validPromptParams):
            promptParams = validPromptParams
        case .failure(let error):
            return reject("INVALID_PAYMENT_PROMPT", error.localizedDescription, nil)
        }

        DispatchQueue.main.async { [weak self] in
            guard let self else { return }
            // TODO: add support to custom prompts. For now only default is supported.
            guard let presentedViewController = RCTPresentedViewController() else {
                return reject("NO_PRESENTED_VIEW_CONTROLLER", "Can't present payment view controller.", nil)
            }
            self.paymentHandle = self.mobilePaymentsSDK.paymentManager.startPayment(
                params,
                promptParameters: promptParams,
                from: presentedViewController,
                delegate: self
            )
        }
    }

    @objc(cancelPayment:withRejecter:)
    func cancelPayment(resolve: @escaping RCTPromiseResolveBlock, reject: @escaping RCTPromiseRejectBlock) {
        guard let handle = paymentHandle else {
            return reject("PAYMENT_CANCEL_ERROR", "No payment available to cancel.", nil)
        }
        DispatchQueue.main.async { [weak self] in
            guard let self else { return }
            let cancelation = handle.cancelPayment()
            if (cancelation == true) {
                resolve("Payment successfully canceled")
            } else {
                reject("PAYMENT_CANCEL_ERROR", "This payment cannot be canceled.", nil)
            }
            paymentHandle = nil
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

extension MobilePaymentsSdkReactNative: PaymentManagerDelegate {
    func paymentManager(_ paymentManager: PaymentManager, didFinish payment: Payment) {
        startPaymentResolveBlock?(payment)
        paymentHandle = nil
    }

    func paymentManager(_ paymentManager: PaymentManager, didFail payment: Payment, withError error: Error) {
        let paymentError = PaymentError(rawValue: (error as NSError).code)
        let errorMessage: String
        switch paymentError {
        case .deviceTimeDoesNotMatchServerTime:
            errorMessage = "The local device time is out of sync with the server time, which could lead to inaccurate payment reporting. Check your device's time and attempt your action again."
        case .idempotencyKeyReused:
            errorMessage = "The idempotency key used for this payment has already been used. Review previous payments to ensure you are not processing a duplicate payment, and then try again with a new idempotency key."
        case .invalidPaymentParameters:
            errorMessage = "The PaymentParameters provided were invalid. Check the request details and try the payment again."
        case .invalidPaymentSource:
            errorMessage = "The payment source provided did not match the AlternatePaymentMethod given."
        case .locationPermissionNeeded:
            errorMessage = "Location permission has not been granted to your application. Prompt the user for location access and try the payment again."
        case .merchantNotOptedIntoOfflineProcessing:
            errorMessage = "The merchant using your application is not a part of the offline payments alpha experience, and cannot take offline payments with the Mobile Payments SDK."
        case .notAuthorized:
            errorMessage = "Mobile Payments SDK is not currently authorized with a Square Seller account. Use the AuthorizationManager to authorize a Square account."
        case .noNetwork:
            errorMessage = "Mobile Payments SDK could not connect to the network and the payment could not be completed."
        case .offlineStoredAmountExceeded:
            errorMessage = "Your application has exceeded the total amount available to be stored on the device. Wait until connection is restored and stored payments have processed before taking more offline payments."
        case .offlineTransactionAmountExceeded:
            errorMessage = "Your application is attempting an offline payment that exceeds the limit for a single transaction. Try again with a lower payment amount."
        case .paymentAlreadyInProgress:
            errorMessage = "A payment is already in progress. Cancel the current payment, or wait for it to complete, then try the new payment again."
        case .sandboxUnsupportedForOfflineProcessing:
            errorMessage = "Your application is attempting to take an offline payment while authorized with a Square Sandbox account. Offline payments are not supported in Sandbox. Reauthorize with a production account to take offline payments."
        case .timedOut:
            errorMessage = "Mobile Payments SDK timed out while awaiting a payment. Try the payment again."
        case .unexpected:
            errorMessage = "PaymentManager.startPayment was used in an unexpected or unsupported way. Check your local logs and try the payment again."
        case .unsupportedMode:
            errorMessage = "The user entered an unsupported mode while a payment was in process (for example, split screen mode is not supported in Mobile Payments SDK). Try the payment again."
        default:
            errorMessage = "There has been an error taking a payment. Check the request details and try the payment again."
        }

        startPaymentRejectBlock?("PAYMENT_FAILED", errorMessage, nil);
        paymentHandle = nil
    }

    func paymentManager(_ paymentManager: PaymentManager, didCancel payment: Payment) {
        startPaymentRejectBlock?("PAYMENT_CANCELED", "The payment has been canceled.", nil);
        paymentHandle = nil
    }
}
