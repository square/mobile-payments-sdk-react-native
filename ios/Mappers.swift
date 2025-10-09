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
      var additionalPayments = AdditionalPaymentMethods()
      if (additionalPaymentsRawArray.contains("ALL")) {
          additionalPayments = AdditionalPaymentMethods.all
      } else if (additionalPaymentsRawArray.contains("KEYED")) {
          additionalPayments = AdditionalPaymentMethods.keyed
      }
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

        guard let paymentAttemptId = paymentParameters["paymentAttemptId"] as? String else {
            return .failure(.missingPaymentAttemptId)
        }

        let paymentParams = PaymentParameters(paymentAttemptID: paymentAttemptId, amountMoney: amountMoney, processingMode: processingMode)

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
  
    class func mapToDictionary(readerStatusInfo: ReaderStatusInfo) -> NSDictionary {
      return [
        "reason": readerStatusInfo.reason.mapToString(),
        "status": readerStatusInfo.status.mapToString(),
        "title": readerStatusInfo.title,
      ]
    }

    class func mapToDictionary(payment: Payment) -> NSDictionary {
        return [
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
            ]
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
            "statusInfo": Mappers.mapToDictionary(readerStatusInfo: reader.statusInfo),
            "supportedCardEntryMethods" : reader.supportedInputMethods.toList()
        ]
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

extension SquareMobilePaymentsSDK.ReaderStatus {
    func mapToString() -> String {
        switch self {
        case .ready:
            return "READY"
        case .connectingToDevice:
            return "CONNECTING_TO_DEVICE"
        case .connectingToSquare:
            return "CONNECTING_TO_SQUARE"
        case .faulty:
            return "FAULTY"
        case .readerUnavailable:
            return "READER_UNAVAILABLE"
        @unknown default:
            return "UNKNOWN"
        }
    }
}

extension SquareMobilePaymentsSDK.ReaderUnavailableReason {
    func mapToString() -> String {
        switch self {
        case .blockingFirmwareUpdate:
            return "BLOCKING_FIRMWARE_UPDATE"
        case .bluetoothDisabled:
            return "BLUETOOTH_DISABLED"
        case .bluetoothFailure:
            return "BLUETOOTH_FAILURE"
        case .internalError:
            return "INTERNAL_ERROR"
        case .maxReadersConnected:
            return "MAX_READERS_CONNECTED"
        case .none:
            return "NONE"
        case .notConnectedToInternet:
            return "NOT_CONNECTED_TO_INTERNET"
        case .readerTimeout:
            return "READER_TIMEOUT"
        case .revokedByDevice:
            return "REVOKED_BY_DEVICE"
        case .secureConnectionNetworkFailure:
            return "SECURE_CONNECTION_NETWORK_FAILURE"
        case .secureConnectionToSquareFailure:
            return "SECURE_CONNECTION_TO_SQUARE_FAILURE"
        case .tapToPayError:
            return "TAP_TO_PAY_ERROR"
        case .tapToPayIsNotLinked:
            return "TAP_TO_PAY_IS_NOT_LINKED"
        @unknown default:
            return "UNKNOWN"
        }
    }
}

enum PaymentParametersError: Error {
    case missingAmount
    case missingPaymentAttemptId
    case missingProcessingMode
}

enum PaymentPromptError: Error {
    case invalidPromptParameters
    case cannotCreatePrompt
}

