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
        guard let idempotencyKey = paymentParameters["idempotencyKey"] as? String else {
            return .failure(.missingIdempotencyKey)
        }
        let paymentParams = PaymentParameters(idempotencyKey: idempotencyKey, amountMoney: amountMoney)

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

enum PaymentParametersError: Error {
    case missingAmount
    case missingIdempotencyKey
}

enum PaymentPromptError: Error {
    case invalidPromptParameters
    case cannotCreatePrompt
}

