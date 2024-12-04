
import UIKit
import SquareMobilePaymentsSDK
import MockReaderUI

@objc(MobilePaymentsSdkReactNative)
class MobilePaymentsSdkReactNative: UIViewController, PaymentManagerDelegate {

   @objc(authorize:locationId:withResolver:withRejecter:)
    func authorize(accessToken: String, locationId: String, resolve: @escaping RCTPromiseResolveBlock, reject:@escaping RCTPromiseRejectBlock) {
         let response = "Authorized with token: \(accessToken) and location: \(locationId)"
        if MobilePaymentsSDK.shared.authorizationManager.state == .authorized {
             print("Already authorized")
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
  
  private var resolver: RCTPromiseResolveBlock?
  private var rejecter: RCTPromiseRejectBlock?
  private var paymentHandle: PaymentHandle?
  private var isPaymentCompleted = false

  // This method will map the input data to the PaymentParameters object
  func mapToPaymentParameters(paymentParameters: [String: Any]) -> Result<PaymentParameters, Error> {
      guard
          let amountMoney = paymentParameters["amountMoney"] as? [String: Any],
          let amount = amountMoney["amount"] as? Int,
          let currencyCodeString = amountMoney["currencyCode"] as? Int, // currencyCode as Int
          let customerId = paymentParameters["customerId"] as? String,
          let orderId = paymentParameters["orderId"] as? String,
          let referenceId = paymentParameters["referenceId"] as? String,
          let idempotencyKey = paymentParameters["idempotencyKey"] as? String
      else {
          return .failure(NSError(domain: "E_INVALID_PARAMETERS", code: 0, userInfo: [NSLocalizedDescriptionKey: "Missing or invalid parameters"]))
      }
    
      guard let currencyCode = Currency(rawValue: UInt(currencyCodeString)) else {
          return .failure(NSError(domain: "E_INVALID_CURRENCY", code: 0, userInfo: [NSLocalizedDescriptionKey: "Invalid currency code"]))
      }

      print("currencyCode: ", currencyCode)

      let amountMoneyObject = Money(amount: UInt(amount), currency: currencyCode)

      let paymentParams = PaymentParameters(
          idempotencyKey: idempotencyKey,
          amountMoney: amountMoneyObject
      )

      return .success(paymentParams)
  }

  @objc(startPayment:withResolver:withRejecter:)
  func startPayment(paymentParameters: [String: Any], resolver: @escaping RCTPromiseResolveBlock, rejecter: @escaping RCTPromiseRejectBlock) {
    
      guard !isPaymentCompleted else {
          rejecter("E_PAYMENT_ALREADY_IN_PROGRESS", "Payment process already in progress", nil)
          return
      }

      let result = mapToPaymentParameters(paymentParameters: paymentParameters)

      switch result {
      case .failure(let error):
          rejecter(error.localizedDescription, error.localizedDescription, nil)
          return
      case .success(let paymentParams):
          DispatchQueue.main.async { [weak self] in
              guard let self = self else { return }
              guard let appDelegate = UIApplication.shared.delegate?.window else { return }

              self.isPaymentCompleted = false

              self.paymentHandle = MobilePaymentsSDK.shared.paymentManager.startPayment(
                  paymentParams,
                  promptParameters: PromptParameters(
                      mode: .default,
                      additionalMethods: .all
                  ),
                  from: appDelegate?.rootViewController ?? self,
                  delegate: self
              )

              resolver("Payment started successfully")
          }
      }
  }

  public func paymentManager(_ paymentManager: PaymentManager, didFinish payment: Payment) {
      if !isPaymentCompleted {
          isPaymentCompleted = true
          self.resolver?("Payment completed successfully")
          self.resolver = nil
      }
  }

  public func paymentManager(_ paymentManager: PaymentManager, didFail payment: Payment, withError error: Error) {
      if !isPaymentCompleted {
          isPaymentCompleted = true
          self.rejecter?("E_PAYMENT_FAILED", error.localizedDescription, nil)
          self.rejecter = nil
      }
  }

  public func paymentManager(_ paymentManager: PaymentManager, didCancel payment: Payment) {
      if !isPaymentCompleted {
          isPaymentCompleted = true
          self.rejecter?("E_PAYMENT_CANCELED", "Payment was canceled", nil)
          self.rejecter = nil
      }
  }
  
  func cancelPayment() {
    fatalError("Cancellation isn't yet implemented")
  }

}
