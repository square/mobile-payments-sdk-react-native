//
//  Extensions.swift
//  MobilePaymentsSdkReactNativeExample
//
//  Created by Plinio Correa on 1/16/25.
//

import SquareMobilePaymentsSDK

private let SquareErrorDebugCodeKey = "com.squareup.MobilePaymentsSDK.ErrorDebugCode"
private let SquareErrorDebugMessageKey = "com.squareup.MobilePaymentsSDK.ErrorDebugMessage"
private let SquareErrorPaymentDomain = "MobilePaymentsSDKAPI.PaymentError"
// React Native error keys. These will match Android's so you can implement consistent error handling on RN
private let ReactNativeErrorDebugCodeKey = "debugCode"
private let ReactNativeErrorDebugMessageKey = "debugMessage"
private let ReactNativeErrorMessageKey = "errorMessage"
private let ReactNativeErrorCodeKey = "errorCode"
private let ReactNativeErrorDetailsKey = "details"

extension Money {
    convenience init?(_ params: [String:Any]) {
        guard let amountInt = params["amount"] as? UInt,
              let currencyString = params["currencyCode"] as? String else {
            return nil
        }
        self.init(amount: amountInt, currency: Currency(currencyString))
    }
}

extension NSError {
    var reactNativeError: NSError {
        var newUserInfo = userInfo
        newUserInfo[ReactNativeErrorDebugCodeKey] = userInfo[SquareErrorDebugCodeKey]
        newUserInfo[ReactNativeErrorDebugMessageKey] = userInfo[SquareErrorDebugMessageKey]
        newUserInfo[ReactNativeErrorMessageKey] = userInfo[NSLocalizedDescriptionKey]
        newUserInfo[ReactNativeErrorCodeKey] = code
        newUserInfo[ReactNativeErrorDetailsKey] = nil
        return NSError(domain: domain, code: code, userInfo: newUserInfo)
    }

    class func initSquareError(customMessage: [String: Any]) -> NSError {
        return NSError(domain: SquareErrorPaymentDomain, code: 0, userInfo: [SquareErrorDebugMessageKey: customMessage])
    }
}
