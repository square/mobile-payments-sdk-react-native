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

extension CardInputMethods {
    func toList() -> NSArray {
        let allMethods: [CardInputMethods] = [.chip, .contactless, .swipe]
        let result = allMethods
            .filter { self.contains($0) }
            .map { $0.toName() }
        return result as NSArray
    }

    func toName() -> String {
        return switch self {
        case .chip:
            "CHIP"
        case .contactless:
            "CONTACLESS"
        case .swipe:
            "SWIPED"
        default:
            "UNKNOWN"
        }
    }
}

extension ReaderModel {
    func toName() -> String {
        return switch self {
        case .contactlessAndChip:
                "CONTACTLESS_AND_CHIP"
            case .magstripe:
                "MAGSTRIPE"
            case .stand:
                "STAND"
            case .tapToPay:
                "TAP_TO_PAY"
            case .unknown:
                "UNKNOWN"
            default:
                "UNKNOWN"
        }
    }
}

extension ReaderFirmwareInfo {
    func toMap() -> NSDictionary {
        return [
            "failureReason" : failureReason?.localizedDescription ?? NSNull(),
            "updatePercentage" : updatePercentage,
            "version" : version
        ]
    }
}


extension CardInsertionStatus {
    func toName() -> String {
        return switch self {
        case .inserted:
            "INSERTED"
        case .notInserted:
            "NOT_INSERTED"
        case .unknown:
            "UNKNOWN"
        default:
            "UNKNOWN"
        }
    }
}

extension ReaderBatteryLevel {
    func toName() -> String {
        return switch self {
            case .criticallyLow: "CRITICAL_LOW"
            case .low: "LOW"
            case .mid: "MID"
            case .high: "HIGH"
            case .full: "FULL"
            default: "UNKNOWN"
        }
    }
}

extension ReaderBatteryStatus {
    func toMap() -> NSDictionary {
        return [
            "isCharging" : isCharging,
            "level" : level.toName(),
            "percent" : percentage,
        ]
    }
}

extension ReaderStatusInfo {
    func toMap() -> NSDictionary {
        return [
          "status" : status.rawValue,
          "statusDescription" : status.description,
          "unavailableReasonInfo" : unavailableReasonInfo?.reason.rawValue ?? NSNull(),
          "unavailableReasonInfoTitle" : unavailableReasonInfo?.title ?? NSNull(),
          "unavailableReasonInfoDescription" : unavailableReasonInfo?.description ?? NSNull(),
        ]
    }
}

extension ReaderChange {
    func toName() -> String {
        switch self {
        case .batteryDidBeginCharging:
            return "BATTERY_DID_BEGIN_CHARGING"
        case .batteryDidEndCharging:
            return "BATTERY_DID_END_CHARGING"
        case .batteryLevelDidChange:
            return "BATTERY_LEVEL_DID_CHANGED"
        case .cardInserted:
            return "CARD_INSERTED"
        case .cardRemoved:
            return "CARD_REMOVED"
        case .firmwareUpdateDidFail:
            return "FIRMWARE_UPDATE_DID_FAILED"
        case .firmwareUpdatePercentDidChange:
            return "FIRMWARE_UPDATE_PERCENT_DID_CHANGED"
        default: return "UNKNOWN"
        }
    }
}
