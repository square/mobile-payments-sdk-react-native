
import UIKit
import SquareMobilePaymentsSDK
import MockReaderUI

@objc(MobilePaymentsSdkReactNative)
class MobilePaymentsSdkReactNative: NSObject {
    
    private var startPaymentResolveBlock: RCTPromiseResolveBlock?
    private var startPaymentRejectBlock: RCTPromiseRejectBlock?
    private let mobilePaymentsSDK =  MobilePaymentsSDK.shared
    
    @objc(authorize:locationId:withResolver:withRejecter:)
    func authorize(accessToken: String, locationId: String, resolve: @escaping RCTPromiseResolveBlock, reject:@escaping RCTPromiseRejectBlock) {
        let response = "Authorized with token: \(accessToken) and location: \(locationId)"
//        if mobilePaymentsSDK.authorizationManager.state == .authorized {
//            print("Square Mobile Payments SDK has already been authorized.")
//            return resolve(response)
//        }
        
        mobilePaymentsSDK.authorizationManager.authorize(
            withAccessToken: accessToken,
            locationID: locationId) { error in
                if let authError = error {
                    let aError = AuthorizationError(rawValue: (authError as NSError).code)
//                    print(aError.debugInfo)
//                    reject("AUTHENTICATION_ERROR", aError.localizedDescription, nil)
                } else {
                    print("Square Mobile Payments SDK successfully authorized.")
                    resolve(response)
                }
            }
    }
    
    // Deauthorize method
    @objc(deauthorize:withRejecter:)
    func deauthorize(_ resolve: @escaping RCTPromiseResolveBlock, reject: @escaping RCTPromiseRejectBlock) {
        mobilePaymentsSDK.authorizationManager.deauthorize {
            resolve("Square Mobile Payments SDK successfully deauthorized.")
        }
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
    
    @objc(showSettings:withRejecter:)
    func showSettings(resolve: RCTPromiseResolveBlock, reject: RCTPromiseRejectBlock) {
        DispatchQueue.main.async { [weak self] in
            // Get the active scene
            guard let windowScene = UIApplication.shared.connectedScenes.first as? UIWindowScene,
                  let rootViewController = windowScene.windows.first?.rootViewController else {
                print("No window scene or root view controller found.")
                return
            }
            
            guard let self else { return }
            
            // Check if a view controller is currently presented
            if let presentedViewController = rootViewController.presentedViewController {
                // Optionally dismiss the currently presented view controller
                presentedViewController.dismiss(animated: false) { [weak self] in
                    guard let self else { return }
                    // Present the settings screen after dismissing
                    mobilePaymentsSDK.settingsManager.presentSettings(with: rootViewController) { _ in
                        print("Settings screen closed.")
                    }
                }
            } else {
                // No view controller presented, so present the settings screen directly
                mobilePaymentsSDK.settingsManager.presentSettings(with: rootViewController) { _ in
                    print("Settings screen closed.")
                }
            }
        }
    }
    
    private lazy var mockReaderUI: MockReaderUI? = {
        do {
            return try MockReaderUI(for: self.mobilePaymentsSDK)
        } catch {
            // TODO: this should be an error not an assertion also not call it in here
            //            assertionFailure("Could not instantiate a mock reader UI: \(error.localizedDescription)")
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
    
    @objc(startPayment:promptParameters:withResolver:withRejecter:)
    func startPayment(_ paymentParameters: [String: Any], promptParameters: [String: Any], resolve: @escaping RCTPromiseResolveBlock, reject: @escaping RCTPromiseRejectBlock) {
        // Keeping a reference for the resolvers so the protocol can propagate the results
        self.startPaymentResolveBlock = resolve
        self.startPaymentRejectBlock = reject
        
        guard let params = mapPaymentParameters(paymentParameters) else { return }
        guard let promptParams = mapPromptParameters(promptParameters) else { return }
        
        DispatchQueue.main.async { [weak self] in
            guard let self else { return }
            guard let presentedViewController = RCTPresentedViewController() else {
                reject("NO_PRESENTED_VIEW_CONTROLLER", "Can't present payment view controller", nil)
                return
            }
            self.mobilePaymentsSDK.paymentManager.startPayment(
                params,
                promptParameters: promptParams,
                from: presentedViewController,
                delegate: self
            )
        }
    }
    
    private func mapPromptParameters(_ promptParameters: [String: Any]) -> PromptParameters? {
        guard let additionalPaymentsRawArray = promptParameters["additionalMethods"] as? [UInt], let promptMode = promptParameters["mode"] as? Int else {
            // TODO: error
            return PromptParameters(mode: .default, additionalMethods: .all)
        }
        // TODO: handle errors here and handle the addtl
        let additionalPayments = additionalPaymentsRawArray.map( { AdditionalPaymentMethodType(rawValue: $0)! })
        let prompt = PromptMode(rawValue: promptMode)!
        return PromptParameters(mode: prompt, additionalMethods: .all)
    }
    
    // TODO: result or throw would be a good call in here in the error communicating missing parameters
    private func mapPaymentParameters(_ paymentParameters: [String: Any]) -> PaymentParameters? {
        guard let amountMoney = Money(paymentParameters["amountMoney"] as! [String : Any]),
              let idempotencyKey = paymentParameters["idempotencyKey"] as? String else {
            // TODO: error communicating missing required parameters
            return nil;
        }
        
        // Create the payment parameters
        let paymentParams = PaymentParameters(
            idempotencyKey: idempotencyKey,
            amountMoney: amountMoney
        )
        // Optional parameters
        paymentParams.acceptPartialAuthorization = paymentParameters["acceptPartialAuthorization"] as? Bool ?? false
        
        if let fee = paymentParameters["appFeeMoney"] as? [String : Any] {
            paymentParams.appFeeMoney = Money(fee)
        }
        paymentParams.autocomplete = paymentParameters["autocomplete"] as? Bool ?? true
        paymentParams.customerID = paymentParameters["referenceId"] as? String ?? ""
        paymentParams.delayAction = DelayAction(rawValue: (paymentParameters["delayAction"] as? Int ?? 0)) ?? DelayAction.cancel
        
        if let delayDuration = paymentParameters["referenceId"] as? Int {
            paymentParams.delayDuration = TimeInterval(delayDuration)
        }
        paymentParams.locationID = paymentParameters["locationID"] as? String ?? ""
        paymentParams.note = paymentParameters["note"] as? String ?? ""
//        paymentParams.orderID = paymentParameters["orderID"] as? String ?? nil
        paymentParams.referenceID = paymentParameters["referenceId"] as? String ?? ""
        paymentParams.teamMemberID = paymentParameters["teamMemberID"] as? String ?? ""
        
        if let tipMoney = paymentParameters["tipMoney"] as? [String : Any] {
            paymentParams.tipMoney = Money(tipMoney)
        }
        
        return paymentParams
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
        print("Payment Failed!", (error as NSError).userInfo.description)
        startPaymentRejectBlock?("PAYMENT_FAILED", (error as NSError).userInfo.description, nil);
    }
    
    func paymentManager(_ paymentManager: PaymentManager, didCancel payment: Payment) {
        print("Payment Cancelled", payment)
        startPaymentRejectBlock?("PAYMENT_CANCELLED", "PAYMENT_CANCELLED", nil);
    }
}

extension Money {
    convenience init?(_ params: [String:Any]) {
        // TODO: add errors here
        guard let amountInt = params["amount"] as? UInt else {
            return nil
        }
        guard let currencyString = params["currencyCode"] as? String else {
            return nil
        }
        self.init(amount: amountInt, currency: Currency(currencyString))
    }
}
