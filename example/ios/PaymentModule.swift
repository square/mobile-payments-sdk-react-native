import Foundation
import SquareMobilePaymentsSDK
import React

@objc(PaymentModule)
class PaymentModule: UIViewController, PaymentManagerDelegate {
    private var paymentHandle: PaymentHandle?
  private var paymentM : PaymentManager?
    static func moduleName() -> String {
        return "PaymentModule"
    }

    @objc
    func startPayment(){
     print("Start Payment called")
         DispatchQueue.main.async { [weak self] in
             guard let self = self else { return }
           guard let appDelegate = UIApplication.shared.delegate?.window else { return }
             self.paymentHandle = MobilePaymentsSDK.shared.paymentManager.startPayment(
                 self.makePaymentParameters(),
                 promptParameters: PromptParameters(
                     mode: .default,
                     additionalMethods: .all
                 ),
                 from: appDelegate?.rootViewController ?? self,
                 delegate: self
             )
         }
    }


  @objc
    func makePaymentParameters() -> PaymentParameters {
        return PaymentParameters(
            idempotencyKey: UUID().uuidString,
            amountMoney: Money(amount: 1000, currency: .USD)
        )
    }

    // PaymentManagerDelegate methods
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
}
