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

extension ReaderState {
    func toName() -> String {
        return switch self {
        case .connecting:
            "CONNECTING"
        case .disabled:
            "DISABLED"
        case .disconnected:
            "DISCONNECTED"
        case .failedToConnect:
            "FAILED_TO_CONNECT"
        case .ready:
            "READY"
        case .updatingFirmware:
            "UPDATING_FIRMWARE"
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

extension ReaderConnectionFailureReason {
    func toName() -> String {
        return switch self {
        case .deniedByServer:
            "DENIED_BY_SERVER"
        case .genericError:
            "GENERIC_ERROR"
        case .maxReadersConnected:
            "MAX_READERS_CONNECTED"
        case .networkTimeout:
            "NETWORK_TIMEOUT"
        case .networkTransportError:
            "NETWORK_TRANSPORT_ERROR"
        case .notConnectedToInternet:
            "NOT_CONNECTED_TO_INTERNET"
        case .readerTimeout:
            "READER_TIMEOUT"
        case .revokedByDevice:
            "REVOKED_BY_DEVICE"
        case .serverError:
            "SERVER_ERROR"
        case .tapToPayError:
            "TAP_TO_PAY_ERROR"
        case .unknown:
            "UNKNOWN"
        default : "UNKNOWN"
        }
    }
}


extension ReaderConnectionFailureRecoverySuggestion {
    func toName() -> String {
        return switch self {
        case .activateAccount:
            "ACTIVATE_ACCOUNT"
        case .contactSupport:
            "CONTACT_SUPPORT"
        case .enablePasscodeToUseTapToPay:
            "ENABLE_PASSCODE_TO_USE_TAP_TO_PAY"
        case .noSuggestion:
            "NO_SUGGESTION"
        case .retry:
            "RETRY"
        case .reviewTapToPayGuidelines:
            "REVIEW_TAP_TO_PAY_GUIDELINES"
        default:
            "UNKNOWN"
        }
    }
}


extension ReaderConnectionFailureInfo {
    func toMap() -> NSDictionary {
        return [
            "failureReason" : failureReason.toName(),
            "localizedDescription" : localizedDescription,
            "localizedTitle" : localizedTitle,
            "recoverySuggestion": recoverySuggestion.toName()
        ]
    }
}

extension ReaderConnectionState {
    func toName() -> String {
        return switch self {
        case .connected:
            "CONNECTED"
        case .connecting:
            "CONNECTING"
        case .failedToConnect:
            "FAILED_TO_CONNECT"
        case .notConnected:
            "NOT_CONNECTED"
        default:
            "UNKNOWN"
        }
    }
}

extension ReaderConnectionInfo {
    func toMap() -> NSDictionary {
        return [
            "failureInfo" : failureInfo?.toMap() ?? NSNull(),
            "state" : state.toName()
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
        case .connectionDidFail:
            return "CONNECTION_DID_FAILED"
        case .connectionStateDidChange:
            return "CONNECTION_STATE_DID_CHANGED"
        case .firmwareUpdateDidFail:
            return "FIRMWARE_UPDATE_DID_FAILED"
        case .firmwareUpdatePercentDidChange:
            return "FIRMWARE_UPDATE_PERCENT_DID_CHANGED"
        case .stateDidChange:
            return "STATE_DID_CHANGED"
        default: return "UNKNOWN"
        }
    }
}

extension DelayAction {
    func getInt() -> Int {
        switch self {
        case .cancel: return 0
        case .complete: return 1
        default: return 0
        }
    }
}

extension ProcessingMode {
  func getInt() -> Int {
        switch self {
        case .onlineOnly: return 0
        case .offlineOnly: return 1
        case .autoDetect: return 2
        default : return 2
        }
    }
}

extension Currency {
  func toName() -> String {
    switch self {
    case .AUD: return "AUD"
    case .CAD: return "CAD"
    case .EUR: return "EUR"
    case .GBP: return "GBP"
    case .JPY: return "JPY"
    case .USD: return "USD"
    default: return "unknown"
    }
  }
}


extension MoneyAmount {
  func toMap() -> [String: Any?] {
    return [
      "amount": Int(self.amount),
      "currencyCode": self.currency.toName()
    ]
  }
}

extension PaymentParameters {
  func toMap() -> [String :Any?] {
        return [
            "acceptPartialAuthorization": acceptPartialAuthorization,
            "amountMoney": amountMoney.toMap(),
            "appFeeMoney": appFeeMoney?.toMap(),
            "autocomplete": autocomplete,
            "customerId" : customerID,
            "delayAction" : delayAction.getInt(),
            "delayDuration" : delayDuration,
            "processingMode" : processingMode.getInt(),
            "allowCardSurcharge" : allowCardSurcharge,
            "paymentAttemptId" : paymentAttemptID,
            "locationId": locationID,
            "note" : note,
            "orderId" : orderID,
            "referenceId" : referenceID,
            "teamMemberId": teamMemberID,
            "tipMoney" : tipMoney?.toMap()
        ]
    }
}
