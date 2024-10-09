import Foundation
import React
import SquareMobilePaymentsSDK

@objc(PaymentsBridge)
class PaymentsBridge: NSObject, RCTBridgeModule {  // Conform directly in the class declaration
    static func moduleName() -> String {
        return "PaymentsBridge"
    }

    @objc
  public func  authorizePayments() {
        let setupVC = SetupViewController()
        setupVC.authorizeMobilePaymentsSDK()
    }
}
