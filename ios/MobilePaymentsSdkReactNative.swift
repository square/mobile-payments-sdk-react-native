
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

    private var readersObservers: [String: ReaderObserver] = [:]
    private var pairingResolveBlock: RCTPromiseResolveBlock?
    private var pairingRejectBlock: RCTPromiseRejectBlock?
    private var pairingHandler: PairingHandle?

    /// We use notifications to propagate authorization status changes and reader changes
    override func supportedEvents() -> [String]! {
        return ["AuthorizationStatusChange", "ReaderChanged"]
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
                    let anError = authError as NSError
                    return reject("AUTHENTICATION_ERROR", authError.localizedDescription, anError.reactNativeError)
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
    func showSettings(resolve: @escaping RCTPromiseResolveBlock, reject: @escaping RCTPromiseRejectBlock) {
          DispatchQueue.main.async { [weak self] in
                guard let presentedViewController = RCTPresentedViewController() else {
                    return reject("SETTINGS_SCREEN_ERROR", "No window scene or root view controller found.", nil)
                }
            self?.mobilePaymentsSDK.settingsManager.presentSettings(with: presentedViewController) { error in
                if (error != nil) {
                    let anError = error as? NSError
                    return reject("SETTINGS_SCREEN_ERROR", "Can't present settings screen. It's already been displayed. Dismiss the current settings screen first.", anError?.reactNativeError)
                }
                return resolve("Settings screen presented successfully.")
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

    func parseTapToPayError(error: NSError, defaultError: String) -> String {

      let tapToPayReaderError = TapToPayReaderError(rawValue: (error).code)

      let errorMessage: String
      switch tapToPayReaderError {
      case .alreadyLinked:
        errorMessage = "Apple Tap to Pay Terms and Conditions have already been accepted."
      case .banned:
        errorMessage = "This device is banned from using the Tap To Pay reader."
      case .linkingFailed:
        errorMessage = "The Tap To Pay reader could not link/relink using the provided Apple ID."
      case .linkingCanceled:
        errorMessage = "User has canceled the linking/relinking operation."
      case .invalidToken:
        errorMessage = "The Tap To Pay reader generated an invalid token."
      case .notAuthorized:
        errorMessage = "This device must be authorized with a Square account in order to use Tap To Pay."
      case .notAvailable:
        errorMessage = "The Tap To Pay reader is not available on this device or device's operating system."
      case .noNetwork:
        errorMessage = "The Tap To Pay reader could not connect to the network. Please reconnect to the Internet and try again."
      case .networkError:
        errorMessage = "The network responded with an error."
      case .other:
        errorMessage = "An error with the Tap To Pay reader has occurred. Please try again."
      case .passcodeDisabled:
        errorMessage = "This device does not currently have an active passcode set."
      case .unexpected:
        errorMessage = "Mobile Payments SDK encountered an unexpected error. Please try again."
      case .unsupportedOSVersion:
        errorMessage = "The device's OS version does not meet the minimum requirement of iOS 16.7 for Tap to Pay on iPhone."
      case .unsupportedDeviceModel:
        errorMessage = "This device model is not currently supported to use the Tap To Pay reader."
      default:
        errorMessage = defaultError
      }

      return errorMessage

    }

    @objc(linkAppleAccount:withRejecter:)
    func linkAppleAccount(resolve: @escaping RCTPromiseResolveBlock, reject: @escaping RCTPromiseRejectBlock) {
        DispatchQueue.main.async { [weak self] in


          self?.mobilePaymentsSDK.readerManager.tapToPaySettings.linkAppleAccount {error in

              if (error != nil) {
                let errorMessage = self?.parseTapToPayError(error: (error! as NSError), defaultError: "There has been an error linking apple account.")
                reject("LINK_APPLE_ACCOUNT_ERROR", errorMessage, (error as? NSError)?.reactNativeError);
              } else {
                resolve("Apple account has been linked.")
              }

            }
        }
    }

    @objc(relinkAppleAccount:withRejecter:)
    func relinkAppleAccount(resolve: @escaping RCTPromiseResolveBlock, reject: @escaping RCTPromiseRejectBlock) {
        DispatchQueue.main.async { [weak self] in
          self?.mobilePaymentsSDK.readerManager.tapToPaySettings.relinkAppleAccount {error in

                if (error != nil) {
                  let errorMessage = self?.parseTapToPayError(error: (error! as NSError), defaultError: "There has been an error re-linking apple account.")
                  reject("RE_LINK_APPLE_ACCOUNT_ERROR", errorMessage, (error as? NSError)?.reactNativeError);
                } else {
                  resolve("Apple account has been re-linked.")
                }

            }
        }
    }

    @objc(isAppleAccountLinked:withRejecter:)
    func isAppleAccountLinked(resolve: @escaping RCTPromiseResolveBlock, reject: @escaping RCTPromiseRejectBlock) {
        DispatchQueue.main.async { [weak self] in
            self?.mobilePaymentsSDK.readerManager.tapToPaySettings.isAppleAccountLinked { isLinked, error in
                if (error != nil) {
                  let errorMessage = self?.parseTapToPayError(error: (error! as NSError), defaultError: "There has been an error checking if Apple Account is Linked.")
                  reject("IS_APPLE_ACCOUNT_LINKED_ERROR", errorMessage, (error as? NSError)?.reactNativeError);
                } else {
                  resolve(isLinked)
                }
            }
        }
    }

    @objc(isDeviceCapable:withRejecter:)
    func isDeviceCapable(resolve: RCTPromiseResolveBlock, reject: RCTPromiseRejectBlock) {
        return resolve(mobilePaymentsSDK.readerManager.tapToPaySettings.isDeviceCapable)
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
    func showMockReaderUI(resolve: @escaping RCTPromiseResolveBlock, reject: @escaping RCTPromiseRejectBlock) {
        DispatchQueue.main.async { [weak self] in
            guard let self = self else { return }
            if let mockReaderUI = self.mockReaderUI {
                do {
                    try mockReaderUI.present()
                    resolve("Mock Reader presented successfully.")
                } catch {
                    let anError = error as NSError
                    reject("MOCK_READER_ERROR", "Can't show mock reader. Error: \(error.localizedDescription).", anError.reactNativeError)
                }
            } else {
                reject("MOCK_READER_ERROR", "Can't show mock reader. Check your environment.", nil)
            }
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

    @objc(isOfflineProcessingAllowed:withRejecter:)
    func isOfflineProcessingAllowed(resolve: @escaping RCTPromiseResolveBlock, reject: @escaping RCTPromiseRejectBlock) {
        let paymentSettings = mobilePaymentsSDK.settingsManager.paymentSettings
        resolve(paymentSettings.isOfflineProcessingAllowed)
    }

    @objc(getOfflineTotalStoredAmountLimit:withRejecter:)
    func getOfflineTotalStoredAmountLimit(resolve: @escaping RCTPromiseResolveBlock, reject: @escaping RCTPromiseRejectBlock) {
        let paymentSettings = mobilePaymentsSDK.settingsManager.paymentSettings
        if let limit = paymentSettings.offlineTotalStoredAmountLimit {
            resolve(Mappers.mapToDictionary(money: limit))
        } else {
            resolve(NSNull())
        }
    }

    @objc(getOfflineTransactionAmountLimit:withRejecter:)
    func getOfflineTransactionAmountLimit(resolve: @escaping RCTPromiseResolveBlock, reject: @escaping RCTPromiseRejectBlock) {
        let paymentSettings = mobilePaymentsSDK.settingsManager.paymentSettings
        if let limit = paymentSettings.offlineTransactionAmountLimit {
            resolve(Mappers.mapToDictionary(money: limit))
        } else {
            resolve(NSNull())
        }
    }

    @objc(getPayments:withRejecter:)
    func getPayments(resolve: @escaping RCTPromiseResolveBlock, reject: @escaping RCTPromiseRejectBlock) {
        let offlinePaymentQueue = mobilePaymentsSDK.paymentManager.offlinePaymentQueue
        offlinePaymentQueue.getPayments { payments, error in
            if let error = error {
                reject("GET_OFFLINE_PAYMENTS_FAILED", error.localizedDescription, error)
            } else {
                let paymentsArray = payments.map { Mappers.mapToDictionary(payment: $0) }
                resolve(paymentsArray)
            }
        }
    }

    @objc(getTotalStoredPaymentAmount:withRejecter:)
    func getTotalStoredPaymentAmount(resolve: @escaping RCTPromiseResolveBlock, reject: @escaping RCTPromiseRejectBlock) {
        let offlinePaymentQueue = mobilePaymentsSDK.paymentManager.offlinePaymentQueue
        offlinePaymentQueue.getTotalStoredPaymentsAmount { moneyAmount, error in
            if let error = error {
                reject("GET_TOTAL_STORED_PAYMENTS_FAILED", error.localizedDescription, error)
            } else if let moneyAmount = moneyAmount {
                resolve(Mappers.mapToDictionary(money: moneyAmount))
            } else {
                //NEVER: if money is nil there was an error, so the error if will occur
                resolve(NSNull())
            }
        }
    }


    @objc(getReaders:withRejecter:)
    func getReaders(resolve: @escaping RCTPromiseResolveBlock, reject: @escaping RCTPromiseRejectBlock) {
        let readers = mobilePaymentsSDK.readerManager.readers
        let readerList = readers.map {
          reader in Mappers.mapToDictionary(reader: reader)
        }
        resolve(readerList)
    }


    func findReader(readerId: UInt) -> ReaderInfo? {
        let readers = mobilePaymentsSDK.readerManager.readers
        let reader = readers.first(where: { $0.id == readerId })
        return reader
    }

    func parseId(readerId: String, reject: RCTPromiseRejectBlock) -> UInt? {
        guard let id = UInt(readerId) else {
            reject("INVALID_ID", "ID '\(readerId)' is not valid", nil)
            return nil
        }
        return id
    }

    @objc(getReader:withResolve:withRejecter:)
    func getReader(id: String, resolve: @escaping RCTPromiseResolveBlock, reject: @escaping RCTPromiseRejectBlock) {
        guard let readerId = parseId(readerId: id, reject: reject) else {
            return
        }
        guard let reader = findReader(readerId: readerId) else {
            resolve(NSNull())
            return
        }
        resolve(Mappers.mapToDictionary(reader: reader))
    }

    @objc(forget:withResolve:withRejecter:)
    func forget(id: String, resolve: @escaping RCTPromiseResolveBlock, reject: @escaping RCTPromiseRejectBlock) {
        guard let readerId = parseId(readerId: id, reject: reject) else {
            return
        }
        guard let reader = findReader(readerId: readerId) else {
            resolve(NSNull())
            return
        }
        DispatchQueue.main.async { [weak self] in
            guard let self else { return }
            self.mobilePaymentsSDK.readerManager.forget(reader)
            resolve(NSNull())
        }
    }

    @objc(blink:withResolve:withRejecter:)
    func blink(id: String, resolve: @escaping RCTPromiseResolveBlock, reject: @escaping RCTPromiseRejectBlock) {
        guard let readerId = parseId(readerId: id, reject: reject) else {
            return
        }
        guard let reader = findReader(readerId: readerId) else {
            resolve(NSNull())
            return
        }
        mobilePaymentsSDK.readerManager.blink(reader)
        resolve(NSNull())
    }

    @objc(isPairingInProgress:withRejecter:)
    func isPairingInProgress(resolve: @escaping RCTPromiseResolveBlock, reject: @escaping RCTPromiseRejectBlock) {
        resolve(mobilePaymentsSDK.readerManager.isPairingInProgress)
    }

    // setReaderChangedCallback
    @objc(addReaderChangedCallback:withResolve:withRejecter:)
    func addReaderChangedCallback(refId: String, resolve: @escaping RCTPromiseResolveBlock, reject: @escaping RCTPromiseRejectBlock) {
      let observer = MobilePaymentsReaderObserver(refId: refId, emitter: self)
        mobilePaymentsSDK.readerManager.add(observer)
        readersObservers[refId] = observer
        resolve(NSNull())
    }

    @objc(removeReaderChangedCallback:withResolve:withRejecter:)
    func removeReaderChangedCallback(refId: String, resolve: @escaping RCTPromiseResolveBlock, reject: @escaping RCTPromiseRejectBlock) {
        if let observer = readersObservers[refId] {
            mobilePaymentsSDK.readerManager.remove(observer)
            readersObservers.removeValue(forKey: refId)
        }
        resolve(NSNull())
    }
    // ---

    // pairReader
    @objc(pairReader:withRejecter:)
    func pairReader(resolve: @escaping RCTPromiseResolveBlock, reject: @escaping RCTPromiseRejectBlock) {
        if pairingHandler != nil || pairingRejectBlock != nil || pairingResolveBlock != nil {
            reject("PAIRING_IN_PROGRESS", "A pairing is already in progress", nil)
            return
        }
        pairingRejectBlock = reject
        pairingResolveBlock = resolve
        pairingHandler = mobilePaymentsSDK.readerManager.startPairing(with: self)
    }

    @objc(stopPairing:withRejecter:)
    func stopPairing(resolve: @escaping RCTPromiseResolveBlock, reject: @escaping RCTPromiseRejectBlock) {
        pairingHandler?.stop()
        pairingHandler = nil;
        pairingRejectBlock = nil
        pairingResolveBlock = nil
        resolve(NSNull())
    }
    // ---
}

class MobilePaymentsReaderObserver: ReaderObserver {
    let refId: String
    let emitter: RCTEventEmitter

    init(refId: String, emitter: RCTEventEmitter) {
        self.refId = refId
        self.emitter = emitter
    }

    func readerDidChange(_ reader: ReaderInfo, change: ReaderChange) {
        let readerMap = Mappers.mapToDictionary(reader: reader)
        let body = [
            "change": change.toName(),
            "reader": readerMap,
            "readerState" : readerMap["state"],
            "readerSerialNumber" : readerMap["serialNumber"] ?? NSNull()
        ]
        emitter.sendEvent(withName: "ReaderChanged", body: body)
    }

    func readerWasAdded(_ reader: ReaderInfo) {
        let readerMap = Mappers.mapToDictionary(reader: reader)
        let body = [
            "change": "ADDED",
            "reader": readerMap,
            "readerState" : readerMap["state"],
            "readerSerialNumber" : readerMap["serialNumber"] ?? NSNull()
        ]
        emitter.sendEvent(withName: "ReaderChanged", body: body)
    }

    func readerWasRemoved(_ reader: ReaderInfo) {
        let readerMap = Mappers.mapToDictionary(reader: reader)
        let body = [
            "change": "REMOVED",
            "reader": readerMap,
            "readerState" : readerMap["state"],
            "readerSerialNumber" : readerMap["serialNumber"] ?? NSNull()
        ]
        emitter.sendEvent(withName: "ReaderChanged", body: body)
    }
}

extension MobilePaymentsSdkReactNative: ReaderPairingDelegate {
    func readerPairingDidBegin() {}

    func readerPairingDidFail(with error: Error) {
        pairingRejectBlock?("PAIRING_ERROR", error.localizedDescription, error)
        pairingHandler = nil;
        pairingRejectBlock = nil
        pairingResolveBlock = nil
    }

    func readerPairingDidSucceed() {
        pairingResolveBlock?(true)
        pairingHandler = nil;
        pairingRejectBlock = nil
        pairingResolveBlock = nil
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
        startPaymentResolveBlock?(Mappers.mapToDictionary(payment: payment))
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
        startPaymentRejectBlock?("PAYMENT_FAILED", errorMessage, (error as NSError).reactNativeError);
        paymentHandle = nil
    }

    func paymentManager(_ paymentManager: PaymentManager, didCancel payment: Payment) {
        if let paymentDictionary = Mappers.mapToDictionary(payment: payment) as? [String: Any] {
            let error = NSError.initSquareError(customMessage: paymentDictionary)
            startPaymentRejectBlock?("PAYMENT_CANCELED", "The payment has been canceled.", error.reactNativeError);
        } else {
            startPaymentRejectBlock?("PAYMENT_CANCELED", "The payment has been canceled.", nil);
        }
        paymentHandle = nil
    }
}
