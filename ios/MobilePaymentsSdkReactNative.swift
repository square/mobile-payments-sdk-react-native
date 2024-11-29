
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
  
  enum CurrencyCode: String {
      case AUD = "AUD"
      case CAD = "CAD"
      case EUR = "EUR"
      case GBP = "GBP"
      case JPY = "JPY"
      case USD = "USD"
  }
  
  struct MobilePaymentsSdkPaymentParameters {
    let amount: Double
    let currencyCode: Int
    let customerId: String
    let orderId: String
    let referenceId: String
    let idempotencyKey: String
  }

  private var paymentHandle: PaymentHandle?
    
  @objc(startPayment:withResolver:withRejecter:)
  func startPayment(paymentParameters: [String: Any], resolver: @escaping RCTPromiseResolveBlock, rejecter: @escaping RCTPromiseRejectBlock) {

    guard
        let amountMoney = paymentParameters["amountMoney"] as? [String: Any],
        let amount = amountMoney["amount"] as? Int,
        let currencyCodeString = amountMoney["currencyCode"] as? Int,
//        let currencyCode = CurrencyCode(rawValue: currencyCodeString),
        let customerId = paymentParameters["customerId"] as? String,
        let orderId = paymentParameters["orderId"] as? String,
        let referenceId = paymentParameters["referenceId"] as? String,
        let idempotencyKey = paymentParameters["idempotencyKey"] as? String
    else {
        rejecter("E_INVALID_PARAMETERS", "Missing or invalid parameters", nil)
        return
    }
      
      DispatchQueue.main.async { [weak self] in
        guard let self = self else { return }
        guard let appDelegate = UIApplication.shared.delegate?.window else { return }
        let paymentParams = MobilePaymentsSdkPaymentParameters(
            amount: Double(amount),
            currencyCode: currencyCodeString,
            customerId: customerId,
            orderId: orderId,
            referenceId: referenceId,
            idempotencyKey: idempotencyKey  // Add idempotencyKey here
        )
        
        self.paymentHandle = MobilePaymentsSDK.shared.paymentManager.startPayment(
          self.makePaymentParameters(paymentParams),
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

       public func paymentManager(_ paymentManager: PaymentManager, didFinish payment: Payment) {
            print("Payment Did Finish: \(payment)")
            // Handle successful payment (e.g., dismiss the view)
        }

       public func paymentManager(_ paymentManager: PaymentManager, didFail payment: Payment, withError error: Error) {
            print("Payment Failed: \(error.localizedDescription)")
            // Handle payment failure (e.g., show error to the user)
        }

       public func paymentManager(_ paymentManager: PaymentManager, didCancel payment: Payment) {
            print("Payment Canceled")
            // Handle payment cancellation (e.g., inform the user)
        }
  
       func makePaymentParameters(_ paymentParams: MobilePaymentsSdkPaymentParameters) -> PaymentParameters {
           return PaymentParameters(
            idempotencyKey: paymentParams.idempotencyKey,
            amountMoney: Money(amount: UInt(paymentParams.amount), currency: Currency(rawValue: UInt(paymentParams.currencyCode)) ?? .USD)
         )
       }

       func cancelPayment() {
         // TODO: Implement cancellation logic here
       }
}
