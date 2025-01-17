//
//  Extensions.swift
//  MobilePaymentsSdkReactNativeExample
//
//  Created by Plinio Correa on 1/16/25.
//

import SquareMobilePaymentsSDK

extension Money {
    convenience init?(_ params: [String:Any]) {
        guard let amountInt = params["amount"] as? UInt,
              let currencyString = params["currencyCode"] as? String else {
            return nil
        }
        self.init(amount: amountInt, currency: Currency(currencyString))
    }
}
