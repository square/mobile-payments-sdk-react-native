//
//  Mappers.swift
//  MobilePaymentsSdkReactNativeExample
//
//  Created by Plinio Correa on 1/16/25.
//

import SquareMobilePaymentsSDK

class Mappers {
  class func mapPromptParameters(_ promptParameters: [String: Any]) -> Result<PromptParameters, PaymentPromptError> {
      guard let additionalPaymentsRawArray = promptParameters["additionalMethods"] as? [String],
              let promptMode = promptParameters["mode"] as? Int else {
          return .failure(.invalidPromptParameters)
      }
      var methods: [AdditionalPaymentMethods] = []
      for method in additionalPaymentsRawArray {
          switch method {
          case "ALL": methods = [.all]
          case "KEYED": methods.append(.keyed)
          case "TAP_TO_PAY": methods.append(.tapToPay)
          case "CASH": methods.append(.cash)
          default: break
          }
      }
      let additionalPayments = AdditionalPaymentMethods(methods)
      guard let prompt = PromptMode(rawValue: promptMode) else {
          return .failure(.cannotCreatePrompt)
      }
      return .success(PromptParameters(mode: prompt, additionalMethods: additionalPayments))
  }

    class func mapPaymentParameters(_ paymentParameters: [String: Any]) -> Result<PaymentParameters, PaymentParametersError> {
    // Validating mandatory parameters
        guard let moneyParam = paymentParameters["amountMoney"] as? [String : Any],
              let amountMoney = Money(moneyParam) else {
            return .failure(.missingAmount)
        }

        guard let processingModeInt = paymentParameters["processingMode"] as? Int,
              let processingMode = ProcessingMode(rawValue: processingModeInt) else {
            return .failure(.missingProcessingMode)
        }

        var paymentParams: PaymentParameters? = nil
        if let paymentAttemptID = paymentParameters["paymentAttemptId"] as? String{
            paymentParams = PaymentParameters(
                paymentAttemptID: paymentAttemptID,
                amountMoney: amountMoney,
                processingMode: processingMode
            )
        }

        guard let paymentParams
        else {
          return .failure(.missingPaymentAttemptIdOrIdempotencyKey)
        }


        // Optional parameters
        if let partialAuth = paymentParameters["acceptPartialAuthorization"] as? Bool {
            paymentParams.acceptPartialAuthorization = partialAuth
        }
        if let fee = paymentParameters["appFeeMoney"] as? [String : Any] {
            paymentParams.appFeeMoney = Money(fee)
        }
        if let autocomplete = paymentParameters["autocomplete"] as? Bool {
            paymentParams.autocomplete = autocomplete
        }
        if let customerId = paymentParameters["customerId"] as? String {
            paymentParams.customerID = customerId
        }
        if let delayRawValue = paymentParameters["delayAction"] as? Int,
           let delayAction = DelayAction(rawValue: delayRawValue) {
            paymentParams.delayAction = delayAction
        }
        if let delayDuration = paymentParameters["delayDuration"] as? Int {
            paymentParams.delayDuration = TimeInterval(delayDuration)
        }
        if let locationId = paymentParameters["locationId"] as? String {
            paymentParams.locationID = locationId
        }
        if let note = paymentParameters["note"] as? String {
            paymentParams.note = note
        }
        if let orderId = paymentParameters["orderId"] as? String {
            paymentParams.orderID = orderId
        }
        if let referenceId = paymentParameters["referenceId"] as? String {
            paymentParams.referenceID = referenceId
        }
        if let statement = paymentParameters["statementDescriptionIdentifier"] as? String {
            paymentParams.statementDescriptionIdentifier = statement
        }
        if let teamMemberId = paymentParameters["teamMemberId"] as? String {
            paymentParams.teamMemberID = teamMemberId
        }
        if let tipMoney = paymentParameters["tipMoney"] as? [String : Any] {
            paymentParams.tipMoney = Money(tipMoney)
        }

        return .success(paymentParams)
    }

    class func mapToDictionary(location: Location) -> NSDictionary {
        return [
            "id": location.id,
            "name": location.name,
            "mcc": location.mcc,
            "currency": location.currency.currencyCode // TODO: map this to a currency object
        ]
    }

    class func mapToDictionary(money: MoneyAmount?) -> NSDictionary? {
        guard let money else {
            return nil
        }
        return [
            "amount": money.amount,
            "currencyCode": money.currency.currencyCode
        ]
    }

    class func mapToDictionary(payment: Payment) -> NSDictionary {
        let result = NSMutableDictionary()
        result.addEntries(from: [
            "amountMoney": Mappers.mapToDictionary(money: payment.amountMoney) ?? NSNull(),
            "appFeeMoney": Mappers.mapToDictionary(money: payment.appFeeMoney) ?? NSNull(),
            "createdAt": payment.createdAt.ISO8601Format(),
            "id": payment.id ?? NSNull(),
            "locationId": payment.locationID ?? NSNull(),
            "orderId": payment.orderID ?? NSNull(),
            "referenceId": payment.referenceID ?? NSNull(),
            "sourceType": payment.sourceType.mapToString(),
            "tipMoney": Mappers.mapToDictionary(money: payment.tipMoney) ?? NSNull(),
            "totalMoney": Mappers.mapToDictionary(money: payment.totalMoney) ?? NSNull(),
            "updatedAt": payment.updatedAt.ISO8601Format(),
            "cashDetails": payment.cashDetails?.toMap() ?? NSNull(),
        ] as [String: Any])

        if let onlinePayment = payment as? OnlinePayment {
            result.addEntries(from: [
                "paymentType": "ONLINE",
                "status": onlinePayment.status.mapToString(),
                "cardDetails": onlinePayment.cardDetails?.toMap() ?? NSNull(),
                "customerId": onlinePayment.customerID ?? NSNull(),
                "note": onlinePayment.note ?? NSNull(),
                "teamMemberId": onlinePayment.teamMemberID ?? NSNull(),
            ] as [String: Any])
        } else if let offlinePayment = payment as? OfflinePayment {
            result.addEntries(from: [
                "paymentType": "OFFLINE",
                "localId": offlinePayment.localID,
                "status": offlinePayment.status.mapToString(),
                "cardDetails": offlinePayment.cardDetails?.toMap() ?? NSNull(),
                "uploadedAt": offlinePayment.uploadedAt?.ISO8601Format() ?? NSNull(),
            ] as [String: Any])
        }

        return result
    }

    static func mapToDictionary(reader: ReaderInfo) -> NSDictionary {
        return [
            "batteryStatus" : reader.batteryStatus?.toMap() ?? NSNull(),
            "cardInsertionStatus": reader.cardInsertionStatus.toName(),
            "firmwareInfo" : reader.firmwareInfo?.toMap() ?? NSNull(),
            "id": String(reader.id),
            "isBlinkable" : reader.isBlinkable,
            "isConnectionRetryable" : reader.isConnectionRetryable,
            "isForgettable" : reader.isForgettable,
            "model": reader.model.toName(),
            "name" : reader.name,
            "serialNumber" : reader.serialNumber ?? NSNull(),
            "status" : reader.statusInfo.toMap(),
            "connectionType" : reader.connectionType.toName(),
            "isRebootable" : reader.isRebootable,
            "supportedCardEntryMethods" : reader.supportedInputMethods.toList()
        ]
    }
}

extension ReaderStatusInfo {
  func toMap() -> NSDictionary {
    return [
      "status" : status.toName(),
      "readerUnavailableReason" : unavailableReasonInfo?.reason.toName() ?? NSNull(),
      "title" : unavailableReasonInfo?.title ?? NSNull(),
      "detail" : unavailableReasonInfo?.detail ?? NSNull(),
    ]
  }
}

extension ReaderStatus {
    func toName() -> String {
        return switch self {
        case .connectingToDevice:
            "CONNECTING_TO_DEVICE"
        case .connectingToSquare:
            "CONNECTING_TO_SQUARE"
        case .readerUnavailable :
            "READER_UNAVAILABLE"
        case .faulty:
            "FAULTY"
        case .ready:
            "READY"
        default :
          "UNKNOWN"
        }
    }
}

extension ReaderUnavailableReason {
    func toName() -> String {
        return switch self {
        case .internalError:
            "INTERNAL_ERROR"
        case .bluetoothDisabled:
            "BLUETOOTH_DISABLED"
        case .bluetoothFailure:
            "BLUETOOTH_FAILURE"
        case .secureConnectionToSquareFailure:
            "SECURE_CONNECTION_TO_SQUARE_FAILURE"
        case .secureConnectionNetworkFailure:
            "SECURE_CONNECTION_NETWORK_FAILURE"
        case .blockingFirmwareUpdate:
            "BLOCKING_UPDATE"
        case .maxReadersConnected:
            "MAX_READERS_CONNECTED"
        case .notConnectedToInternet
            : "NOT_CONNECTED_TO_INTERNET"
        case .readerTimeout:
            "READER_TIMEOUT"
        case .revokedByDevice:
            "REVOKED_BY_DEVICE"
        case .tapToPayError:
            "TAP_TO_PAY_ERROR"
        case .tapToPayIsNotLinked:
            "TAP_TO_PAY_IS_NOT_LINKED"
        default:
            "UNKNOWN"
        }
    }
}


extension SquareMobilePaymentsSDK.AuthorizationState {
    func mapToString() -> String {
        switch self {
        case .authorized:
            return "AUTHORIZED"
        case .authorizing:
            return "AUTHORIZING"
        case .notAuthorized:
            return "NOT_AUTHORIZED"
        default:
            return ""
        }
    }
}

extension SquareMobilePaymentsSDK.SourceType {
    func mapToString() -> String {
        switch self {
        case .bankAccount:
            return "BANK_ACCOUNT"
        case .card:
            return "CARD"
        case .cash:
            return "CASH"
        case .external:
            return "EXTERNAL"
        case .wallet:
            return "WALLET"
        case .squareAccount:
            return "SQUARE_ACCOUNT"
        case .unknown:
            fallthrough
        @unknown default:
            return "UNKNOWN"
        }
    }
}

enum PaymentParametersError: Error {
    case missingAmount
    case missingPaymentAttemptIdOrIdempotencyKey
    case missingProcessingMode
}

enum PaymentPromptError: Error {
    case invalidPromptParameters
    case cannotCreatePrompt
}

extension SquareMobilePaymentsSDK.Environment {
    func mapToString() -> String {
        switch self {
        case .production:
            return "PRODUCTION"
        case .sandbox:
            fallthrough
        @unknown default:
            return "SANDBOX"
        }
    }
}

extension SquareMobilePaymentsSDK.TrackingConsentState {
    func mapToString() -> String {
        switch self {
        case .granted:
            return "GRANTED"
        case .denied:
            return "DENIED"
        case .notRequired:
            return "NOT_REQUIRED"
        case .pending:
            fallthrough
        @unknown default:
            return "PENDING"
        }
    }
}

extension CashPaymentDetails {
    func toMap() -> NSDictionary {
        return [
            "buyerSuppliedMoney": Mappers.mapToDictionary(money: buyerSuppliedMoney) ?? NSNull(),
            "changeBackMoney": Mappers.mapToDictionary(money: changeBackMoney) ?? NSNull()
        ]
    }
}

extension CardSurchargeDetails {
    func toMap() -> NSDictionary {
        return [
            "cardSurchargeMoney": Mappers.mapToDictionary(money: cardSurchargeMoney) ?? NSNull(),
            "taxOnSurchargeMoney": Mappers.mapToDictionary(money: taxOnCardSurchargeMoney) ?? NSNull()
        ]
    }
}

extension Card {
    func toMap() -> NSDictionary {
        return [
            "brand": cardBrand.mapToString(),
            "coBrand": coBrand.mapToString(),
            "lastFourDigits": last4 ?? NSNull(),
            "expirationMonth": expMonth,
            "expirationYear": expYear,
            "cardholderName": cardholderName ?? NSNull(),
            "id": id ?? NSNull()
        ]
    }
}

extension OfflineCard {
    func toMap() -> NSDictionary {
        return [
            "brand": cardBrand.mapToString(),
            "lastFourDigits": last4 ?? NSNull(),
            "cardholderName": cardholderName ?? NSNull(),
            "id": id ?? NSNull()
        ]
    }
}

extension CardPaymentDetails {
    func toMap() -> NSDictionary {
        return [
            "card": card?.toMap() ?? NSNull(),
            "entryMethod": entryMethod.mapToString(),
            "status": status.mapToString(),
            "applicationIdentifier": applicationIdentifier ?? NSNull(),
            "applicationName": applicationName ?? NSNull(),
            "authorizationCode": authResultCode ?? NSNull(),
            "appliedCardSurchargeDetails": appliedCardSurchargeDetails?.toMap() ?? NSNull()
        ]
    }
}

extension OfflineCardPaymentDetails {
    func toMap() -> NSDictionary {
        return [
            "card": card?.toMap() ?? NSNull(),
            "entryMethod": entryMethod.mapToString(),
            "applicationIdentifier": applicationIdentifier ?? NSNull(),
            "applicationName": applicationName ?? NSNull()
        ]
    }
}

extension CardBrand {
    func mapToString() -> String {
        switch self {
        case .visa: return "VISA"
        case .mastercard: return "MASTERCARD"
        case .americanExpress: return "AMERICAN_EXPRESS"
        case .discover: return "DISCOVER"
        case .discoverDiners: return "DISCOVER_DINERS"
        case .jcb: return "JCB"
        case .chinaUnionPay: return "CHINA_UNIONPAY"
        case .squareGiftCard: return "SQUARE_GIFT_CARD"
        case .squareCapitalCard: return "SQUARE_CAPITAL_CARD"
        case .interac: return "INTERAC"
        case .eftpos: return "EFTPOS"
        case .felica: return "FELICA"
        case .ebt: return "EBT"
        case .otherBrand: return "OTHER_BRAND"
        case .unknown:
            fallthrough
        @unknown default:
            return "UNKNOWN"
        }
    }
}

extension CardCoBrand {
    func mapToString() -> String {
        switch self {
        case .afterpay: return "AFTERPAY"
        case CardCoBrand.none: return "NONE"
        case .unknown:
            fallthrough
        @unknown default:
            return "UNKNOWN"
        }
    }
}

extension CardEntryMethod {
    func mapToString() -> String {
        switch self {
        case .keyed: return "KEYED"
        case .swiped: return "SWIPED"
        case .emv: return "EMV"
        case .contactless: return "CONTACTLESS"
        case .onFile: return "ON_FILE"
        case .unknown:
            fallthrough
        @unknown default:
            return "UNKNOWN"
        }
    }
}

extension CardPaymentStatus {
    func mapToString() -> String {
        switch self {
        case .authorized: return "AUTHORIZED"
        case .captured: return "CAPTURED"
        case .voided: return "VOIDED"
        case .failed: return "FAILED"
        case .unknown:
            fallthrough
        @unknown default:
            return "UNKNOWN"
        }
    }
}

extension PaymentStatus {
    func mapToString() -> String {
        switch self {
        case .approved: return "APPROVED"
        case .completed: return "COMPLETED"
        case .canceled: return "CANCELED"
        case .failed: return "FAILED"
        case .initialized: return "INITIALIZED"
        case .pending: return "PENDING"
        case .unknown:
            fallthrough
        @unknown default:
            return "UNKNOWN"
        }
    }
}

extension OfflineStatus {
    func mapToString() -> String {
        switch self {
        case .queued: return "QUEUED"
        case .uploaded: return "UPLOADED"
        case .failedToUpload: return "FAILED_TO_UPLOAD"
        case .failedToProcess: return "FAILED_TO_PROCESS"
        case .processed: return "PROCESSED"
        case .unknown:
            fallthrough
        @unknown default:
            return "UNKNOWN"
        }
    }
}
