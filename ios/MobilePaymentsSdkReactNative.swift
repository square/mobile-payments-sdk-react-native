
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
        let paymentResult = mapPaymentParameters(paymentParameters)
        switch paymentResult {
        case .success(let validParams):
            params = validParams
        case .failure(let error):
            return reject("INVALID_PAYMENT_PARAMETERS", error.localizedDescription, nil)
        }
        
        let promptParams:PromptParameters
        let promptResult = mapPromptParameters(promptParameters)
        switch promptResult {
        case .success(let validPromptParams):
            promptParams = validPromptParams
        case .failure(let error):
            return reject("INVALID_PAYMENT_PROMPT", error.localizedDescription, nil)
        }

        DispatchQueue.main.async { [weak self] in
            guard let self else { return }
            guard let presentedViewController = RCTPresentedViewController() else {
                return reject("NO_PRESENTED_VIEW_CONTROLLER", "Can't present payment view controller.", nil)
            }
            self.mobilePaymentsSDK.paymentManager.startPayment(
                params,
                promptParameters: promptParams,
                from: presentedViewController,
                delegate: self
            )
        }
    }

    private func mapPromptParameters(_ promptParameters: [String: Any]) -> Result<PromptParameters, PaymentPromptError> {
        guard let additionalPaymentsRawArray = promptParameters["additionalMethods"] as? [String],
                let promptMode = promptParameters["mode"] as? Int else {
            return .failure(.invalidPromptParameters)
        }
        var additionalPayments:AdditionalPaymentMethods
        if (additionalPaymentsRawArray.contains("ALL")) {
            additionalPayments = AdditionalPaymentMethods.all
        } else if (additionalPaymentsRawArray.contains("KEYED")) {
            additionalPayments = AdditionalPaymentMethods.keyed
        } else {
            additionalPayments = AdditionalPaymentMethods.all
        }
        let prompt = PromptMode(rawValue: promptMode)!
        return .success(PromptParameters(mode: prompt, additionalMethods: additionalPayments))
    }

    private func mapPaymentParameters(_ paymentParameters: [String: Any]) -> Result<PaymentParameters, PaymentParametersError> {
        // Validating mandatory parameters
        guard let amountMoney = Money(paymentParameters["amountMoney"] as! [String : Any]) else {
            return .failure(.missingAmount)
        }
        guard let idempotencyKey = paymentParameters["idempotencyKey"] as? String else {
            return .failure(.missingIdempotencyKey)
        }
        let paymentParams = PaymentParameters(idempotencyKey: idempotencyKey, amountMoney: amountMoney)
        
        // Optional parameters
        paymentParams.acceptPartialAuthorization = paymentParameters["acceptPartialAuthorization"] as? Bool ?? false
        
        if let fee = paymentParameters["appFeeMoney"] as? [String : Any] {
            paymentParams.appFeeMoney = Money(fee)
        }
        paymentParams.autocomplete = paymentParameters["autocomplete"] as? Bool ?? true
        paymentParams.customerID = paymentParameters["referenceId"] as? String ?? ""
        paymentParams.delayAction = DelayAction(rawValue: (paymentParameters["delayAction"] as? Int ?? 0)) ?? DelayAction.cancel
        
        if let delayDuration = paymentParameters["delayDuration"] as? Int {
            paymentParams.delayDuration = TimeInterval(delayDuration)
        }
        paymentParams.locationID = paymentParameters["locationID"] as? String ?? ""
        paymentParams.note = paymentParameters["note"] as? String ?? ""
        paymentParams.orderID = paymentParameters["orderID"] as? String ?? nil
        paymentParams.referenceID = paymentParameters["referenceId"] as? String ?? ""
        paymentParams.teamMemberID = paymentParameters["teamMemberID"] as? String ?? ""
        
        if let tipMoney = paymentParameters["tipMoney"] as? [String : Any] {
            paymentParams.tipMoney = Money(tipMoney)
        }
        
        return .success(paymentParams)
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

extension MobilePaymentsSdkReactNative: PaymentManagerDelegate {
    func paymentManager(_ paymentManager: PaymentManager, didFinish payment: Payment) {
        startPaymentResolveBlock?(payment)
    }

    func paymentManager(_ paymentManager: PaymentManager, didFail payment: Payment, withError error: Error) {
        let paymentError = PaymentError(rawValue: (error as NSError).code)
        switch paymentError {
        case .paymentAlreadyInProgress,
                .notAuthorized,
                .timedOut:
            // These errors surface before the idempotency key is used, so there is no need to delete your idempotency key.
            print(error)
        case .idempotencyKeyReused:
            print("Developer error: Idempotency key reused. Check the most recent payments to see their status.")
            // You should delete your idempotency key, since it's already been used.
        default:
            print(error)
            // You should delete your idempotency key, since it's already been used.
        }
        startPaymentRejectBlock?("PAYMENT_FAILED", (error as NSError).userInfo.description, nil);
    }

    func paymentManager(_ paymentManager: PaymentManager, didCancel payment: Payment) {
        startPaymentRejectBlock?("PAYMENT_CANCELLED", "PAYMENT_CANCELLED", nil);
    }
}

extension Money {
    convenience init?(_ params: [String:Any]) {
        guard let amountInt = params["amount"] as? UInt,
              let currencyString = params["currencyCode"] as? String else {
            return nil
        }
        self.init(amount: amountInt, currency: Currency(currencyString))
    }
}

enum PaymentParametersError: Error {
    case missingAmount
    case missingIdempotencyKey
}

enum PaymentPromptError: Error {
    case invalidPromptParameters
}
