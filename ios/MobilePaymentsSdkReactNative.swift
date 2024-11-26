
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
    
    
  private var paymentHandle: PaymentHandle?
    
  @objc(startPayment:withResolver:withRejecter:)
    func startPayment(paymentParameters: [String: Any], resolver: @escaping RCTPromiseResolveBlock, rejecter: @escaping RCTPromiseRejectBlock) {
      showMockReaderUI(resolve: resolver, reject: rejecter)
        print("Start Payment called with parameters: \(paymentParameters)")

        DispatchQueue.main.async { [weak self] in
                 guard let self = self else { return }
               guard let appDelegate = UIApplication.shared.delegate?.window else { return }
                 self.paymentHandle = MobilePaymentsSDK.shared.paymentManager.startPayment(
                  self.makePaymentParameters(amount: 10),
                     promptParameters: PromptParameters(
                         mode: .default,
                         additionalMethods: .all
                     ),
                  from: appDelegate?.rootViewController ?? self,
                     delegate: self
                 )
             }
    }
    
       public func paymentManager(_ paymentManager: PaymentManager, didFinish payment: Payment) {    hideMockReaderUI(resolve: { _ in }, reject: { _, _, _ in })
            print("Payment Did Finish: \(payment)")
            // Handle successful payment (e.g., dismiss the view)
        }

       public func paymentManager(_ paymentManager: PaymentManager, didFail payment: Payment, withError error: Error) {
         hideMockReaderUI(resolve: { _ in }, reject: { _, _, _ in })
            print("Payment Failed: \(error.localizedDescription)")
            // Handle payment failure (e.g., show error to the user)
        }

       public func paymentManager(_ paymentManager: PaymentManager, didCancel payment: Payment) {    hideMockReaderUI(resolve: { _ in }, reject: { _, _, _ in })
            print("Payment Canceled")
            // Handle payment cancellation (e.g., inform the user)
        }


    func makePaymentParameters(amount: Double) -> PaymentParameters {
        return PaymentParameters(
            idempotencyKey: UUID().uuidString,
            amountMoney: Money(amount: UInt(Int(amount * 100)), currency: .USD) // Assuming amount is in dollars
        )
    }
       // Cancel payment method
       @objc(cancelPayment:withRejecter:)
       func cancelPayment(resolver: @escaping RCTPromiseResolveBlock, rejecter: @escaping RCTPromiseRejectBlock) {
       }
}
