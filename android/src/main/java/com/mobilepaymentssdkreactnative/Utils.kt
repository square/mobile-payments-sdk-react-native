package com.mobilepaymentssdkreactnative

import com.facebook.react.bridge.ReadableArray
import com.facebook.react.bridge.ReadableMap
import com.facebook.react.bridge.WritableMap
import com.facebook.react.bridge.WritableNativeArray
import com.facebook.react.bridge.WritableNativeMap
import com.squareup.sdk.mobilepayments.authorization.AuthorizationState
import com.squareup.sdk.mobilepayments.authorization.AuthorizedLocation
import com.squareup.sdk.mobilepayments.core.Result.Failure
import com.squareup.sdk.mobilepayments.payment.AdditionalPaymentMethod
import com.squareup.sdk.mobilepayments.payment.AdditionalPaymentMethod.Type
import com.squareup.sdk.mobilepayments.payment.CurrencyCode
import com.squareup.sdk.mobilepayments.payment.DelayAction
import com.squareup.sdk.mobilepayments.payment.Money
import com.squareup.sdk.mobilepayments.payment.Payment
import com.squareup.sdk.mobilepayments.payment.Payment.OfflinePayment
import com.squareup.sdk.mobilepayments.payment.Payment.OnlinePayment
import com.squareup.sdk.mobilepayments.payment.Payment.SourceType
import com.squareup.sdk.mobilepayments.payment.Payment.SourceType.BANK_ACCOUNT
import com.squareup.sdk.mobilepayments.payment.Payment.SourceType.CARD
import com.squareup.sdk.mobilepayments.payment.Payment.SourceType.CARD_ON_FILE
import com.squareup.sdk.mobilepayments.payment.Payment.SourceType.CASH
import com.squareup.sdk.mobilepayments.payment.Payment.SourceType.EXTERNAL
import com.squareup.sdk.mobilepayments.payment.Payment.SourceType.SQUARE_ACCOUNT
import com.squareup.sdk.mobilepayments.payment.Payment.SourceType.WALLET
import com.squareup.sdk.mobilepayments.payment.PaymentParameters
import com.squareup.sdk.mobilepayments.payment.ProcessingMode
import com.squareup.sdk.mobilepayments.payment.PromptMode
import com.squareup.sdk.mobilepayments.payment.PromptParameters
import java.text.SimpleDateFormat
import java.util.Date
import java.util.Locale
import java.util.TimeZone

fun ReadableMap.readPaymentParameters(): PaymentParameters {
  // Required fields
  val amountMoney = convertToMoney(getMap("amountMoney"))
  val idempotencyKey = getString("idempotencyKey")
  requireNotNull(amountMoney) { "Amount money is required" }
  requireNotNull(idempotencyKey) { "Idempotency key is required" }

  // Optional fields
  val acceptPartialAuthorization = getBooleanOrNull("acceptPartialAuthorization")
  val appFeeMoney = convertToMoney(getMap("appFeeMoney"))
  val autocomplete = getBooleanOrNull("autocomplete")
  val customerId = getString("customerId")
  val delayAction = convertToDelayAction(getIntOrNull("delayAction"))
  val delayDuration = getLongOrNull("delayDuration")
  val locationId = getString("locationId")
  val note = getString("note")
  val orderId = getString("orderId")
  val processingMode = convertToProcessingMode(getIntOrNull("processingMode"))
  val referenceId = getString("referenceId")
  val statementDescription = getString("statementDescription")
  val teamMemberId = getString("teamMemberId")
  val tipMoney = convertToMoney(getMap("tipMoney"))

  val builder = PaymentParameters.Builder(amountMoney, idempotencyKey)
  acceptPartialAuthorization?.let { builder.acceptPartialAuthorization(it) }
  appFeeMoney?.let { builder.appFeeMoney(it) }
  autocomplete?.let { builder.autocomplete(it) }
  customerId?.let { builder.customerId(it) }
  delayAction?.let { builder.delayAction(it) }
  delayDuration?.let { builder.delayDuration(it) }
  locationId?.let { builder.locationId(it) }
  note?.let { builder.note(it) }
  orderId?.let { builder.orderId(it) }
  processingMode?.let { builder.processingMode(it) }
  referenceId?.let { builder.referenceId(it) }
  statementDescription?.let { builder.statementDescription(it) }
  teamMemberId?.let { builder.teamMemberId(it) }
  tipMoney?.let { builder.tipMoney(it) }

  return builder.build()
}

fun ReadableMap.readPromptParameters(): PromptParameters {
  // Required fields
  val modeAsInt = getIntOrNull("mode")
  val paymentMethodsArray = getArray("additionalMethods")

  val mode = convertToPromptMode(modeAsInt)
  val additionalPaymentMethods = convertToAdditionalPaymentMethods(paymentMethodsArray)

  return PromptParameters(
    mode = mode,
    additionalPaymentMethods = additionalPaymentMethods,
  )
}


/**
 * Converts a string to a [CurrencyCode] enum, defaulting to [CurrencyCode.USD] if the string
 * does not match any enum or is `null`.
 */
fun convertToCurrencyCode(value: String?): CurrencyCode {
  if (value == null) return CurrencyCode.USD
  return CurrencyCode.entries.firstOrNull { it.name == value.uppercase() } ?: CurrencyCode.USD
}

fun convertToMoney(map: ReadableMap?) : Money? {
  if (map == null) return null
  return Money(
    amount = map.getLongOrNull("amount") ?: 0,
    currencyCode = convertToCurrencyCode(map.getString("currencyCode"))
  )
}

fun convertToDelayAction(value: Int?) = when (value) {
  0 -> DelayAction.CANCEL
  1 -> DelayAction.COMPLETE
  else -> null
}

fun convertToProcessingMode(value: Int?) = when (value) {
  0 -> ProcessingMode.AUTO_DETECT
  1 -> ProcessingMode.OFFLINE_ONLY
  2 -> ProcessingMode.ONLINE_ONLY
  else -> null
}

fun convertToPromptMode(value: Int?) = when (value) {
  0 -> PromptMode.DEFAULT
  else -> PromptMode.DEFAULT
}

fun convertToAdditionalPaymentMethods(array: ReadableArray?): List<Type> {
  if (array == null) return AdditionalPaymentMethod.allPaymentMethods
  if (array.size() == 0) return emptyList()
  return AdditionalPaymentMethod.allPaymentMethods
}

fun ReadableMap.getBooleanOrNull(key: String): Boolean? {
  return if (hasKey(key)) getBoolean(key) else null
}

fun ReadableMap.getLongOrNull(key: String): Long? {
  return if (hasKey(key)) getInt(key).toLong() else null
}

fun ReadableMap.getIntOrNull(key: String): Int? {
  return if (hasKey(key)) getInt(key) else null
}

fun Money?.toMoneyMap(): ReadableMap {
  return WritableNativeMap().apply {
    putInt("amount", this@toMoneyMap?.amount?.toInt() ?: 0)
    putString("currencyCode", this@toMoneyMap?.currencyCode?.name ?: CurrencyCode.USD.name)
  }
}
private fun SourceType.toEnumInt(): Int = when (this) {
  BANK_ACCOUNT -> 0
  CARD -> 1
  CASH -> 2
  EXTERNAL -> 3
  SQUARE_ACCOUNT -> 4
  CARD_ON_FILE -> 5
  WALLET -> 6
}

fun Payment.toPaymentMap(): ReadableMap {
  val id = when (this) {
    is OfflinePayment -> localId
    is OnlinePayment -> id
  }
  return WritableNativeMap().apply {
    putMap("amountMoney", amountMoney.toMoneyMap())
    putMap("appFeeMoney", appFeeMoney.toMoneyMap())
    putString("createdAt", createdAt.toIsoInstantString())
    putString("id", id)
    putString("locationId", locationId)
    putString("orderId", orderId)
    putString("referenceId", referenceId)
    putInt("sourceType", sourceType.toEnumInt())
    putMap("tipMoney", tipMoney.toMoneyMap())
    putInt("totalMoney", totalMoney.amount.toInt())
    putString("updatedAt", updatedAt.toIsoInstantString())
  }
}

fun Date.toIsoInstantString(): String =
  SimpleDateFormat("yyyy-MM-dd'T'HH:mm:ss.SSS'Z'", Locale.US)
    .apply { timeZone = TimeZone.getTimeZone("UTC") }
    .format(this)

fun AuthorizedLocation.toLocationMap(): WritableMap {
  return WritableNativeMap().apply {
    putString("id", locationId)
    putString("currencyCode", currencyCode.name)
    putString("name", name)
    putString("mcc", merchantId)
  }
}

fun <S, C> Failure<S, C>.toErrorMap(): WritableMap = WritableNativeMap().apply {
  putString("errorCode", errorCode.toString())
  putString("errorMessage", errorMessage)
  putArray("details", WritableNativeArray().apply {
    details.forEach {
      val detailsString = "ErrorDetails[Category: ${it.category}, Code: ${it.code}, " +
        "Detail: ${it.detail}, Field: ${it.field}]"
      pushString(detailsString)
    }
  })
  putString("debugCode", debugCode)
  putString("debugMessage", debugMessage)
}

fun AuthorizationState.asString(): String = when {
  isAuthorizationInProgress -> "AUTHORIZING"
  isAuthorized -> "AUTHORIZED"
  else -> "NOT_AUTHORIZED"
}
