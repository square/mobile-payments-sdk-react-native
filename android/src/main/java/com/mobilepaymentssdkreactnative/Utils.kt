package com.mobilepaymentssdkreactnative

import com.facebook.react.bridge.ReadableArray
import com.facebook.react.bridge.ReadableMap
import com.facebook.react.bridge.WritableMap
import com.facebook.react.bridge.WritableNativeArray
import com.facebook.react.bridge.WritableNativeMap
import com.squareup.sdk.mobilepayments.authorization.AuthorizationState
import com.squareup.sdk.mobilepayments.authorization.AuthorizedLocation
import com.squareup.sdk.mobilepayments.cardreader.CardEntryMethod
import com.squareup.sdk.mobilepayments.cardreader.ReaderChangedEvent
import com.squareup.sdk.mobilepayments.cardreader.ReaderInfo
import com.squareup.sdk.mobilepayments.core.Result.Failure
import com.squareup.sdk.mobilepayments.payment.AdditionalPaymentMethod
import com.squareup.sdk.mobilepayments.payment.AdditionalPaymentMethod.Type
import com.squareup.sdk.mobilepayments.payment.CurrencyCode
import com.squareup.sdk.mobilepayments.payment.DelayAction
import com.squareup.sdk.mobilepayments.payment.Money
import com.squareup.sdk.mobilepayments.payment.CardPaymentDetails
import com.squareup.sdk.mobilepayments.payment.Card
import com.squareup.sdk.mobilepayments.payment.Payment
import com.squareup.sdk.mobilepayments.payment.Payment.OfflineStatus
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
  val processingMode = convertToProcessingMode(getIntOrNull("processingMode"))
  requireNotNull(amountMoney) { "Amount money is required" }
  requireNotNull(processingMode) { "processingMode is required" }

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
  val referenceId = getString("referenceId")
  val statementDescription = getString("statementDescription")
  val teamMemberId = getString("teamMemberId")
  val tipMoney = convertToMoney(getMap("tipMoney"))
  val idempotencyKey = getString("idempotencyKey")
  val paymentAttemptId = getString("paymentAttemptId")

  val builder = PaymentParameters.Builder(amountMoney, processingMode)
  acceptPartialAuthorization?.let { builder.acceptPartialAuthorization(it) }
  appFeeMoney?.let { builder.appFeeMoney(it) }
  autocomplete?.let { builder.autocomplete(it) }
  customerId?.let { builder.customerId(it) }
  delayAction?.let { builder.delayAction(it) }
  delayDuration?.let { builder.delayDuration(it) }
  locationId?.let { builder.locationId(it) }
  note?.let { builder.note(it) }
  orderId?.let { builder.orderId(it) }
  referenceId?.let { builder.referenceId(it) }
  statementDescription?.let { builder.statementDescription(it) }
  teamMemberId?.let { builder.teamMemberId(it) }
  tipMoney?.let { builder.tipMoney(it) }
  idempotencyKey?.let { builder.idempotencyKey(it) }
  paymentAttemptId?.let { builder.paymentAttemptId(it) }

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
  else -> ProcessingMode.AUTO_DETECT
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
  return WritableNativeMap().apply {
    putMap("amountMoney", amountMoney.toMoneyMap())
    putMap("appFeeMoney", appFeeMoney.toMoneyMap())
    putString("createdAt", createdAt.toIsoInstantString())
    putString("locationId", locationId)
    putString("orderId", orderId)
    putString("referenceId", referenceId)
    putInt("sourceType", sourceType.toEnumInt())
    putMap("tipMoney", tipMoney.toMoneyMap())
    putMap("totalMoney", totalMoney.toMoneyMap())
    putString("updatedAt", updatedAt.toIsoInstantString())
    //cashDetails
    //externalDetails
    when (this@toPaymentMap) {
      is OfflinePayment -> {
        putString("uploadedAt", uploadedAt?.toIsoInstantString())
        putString("localId", localId)
        putString("id", id)
        putString("status", status.toOfflineStatusString())
        putMap("cardDetails", cardDetails?.toCardDetailsMap())
      }
      is OnlinePayment -> {
        putString("id", id)
        /*processingFee
        status
        cardDetails
        customerId
        note
        statementDescription
        teamMemberId
        capabilities
        receiptNumber
        remainingBalance
        squareAccountDetails
        digitalWalletDetails*/
      }
    }
  }
}

private fun OfflineStatus.toOfflineStatusString() : String =
  when (this) {
    OfflineStatus.QUEUED -> "QUEUED"
    OfflineStatus.UPLOADED -> "UPLOADED"
    OfflineStatus.FAILED_TO_UPLOAD -> "FAILED_TO_UPLOAD"
    OfflineStatus.FAILED_TO_PROCESS -> "FAILED_TO_PROCESS"
    OfflineStatus.PROCESSED -> "PROCESSED"
  }

private fun CardPaymentDetails.toCardDetailsMap(): ReadableMap {
  return WritableNativeMap().apply {
    putMap("card", card.toCardMap())
    putString("entryMethod", entryMethod.toEntryString())
    when (this@toCardDetailsMap) {
      is CardPaymentDetails.OfflineCardPaymentDetails -> {
        putString("applicationIdentifier", applicationId)
        putString("applicationName", applicationName)
      }
      is CardPaymentDetails.OnlineCardPaymentDetails -> {
        putString("applicationIdentifier", applicationId)
        putString("applicationName", applicationName)
        //authorizationCode
        //Status
      }
    }
  }
}

private fun Card.toCardMap(): ReadableMap {
  return WritableNativeMap().apply {
    putString("brand", brand.toBrandString())
    putString("cardCoBrand", cardCoBrand.toCoBrandString())
    putString("lastFourDigits", lastFourDigits)
    putInt("expirationMonth", expirationMonth)
    putInt("expirationYear", expirationYear)
    putString("cardholderName", cardholderName)
    putString("id", id)
  }
}

private fun CardPaymentDetails.EntryMethod.toEntryString(): String =
  when(this) {
    CardPaymentDetails.EntryMethod.KEYED -> "KEYED"
    CardPaymentDetails.EntryMethod.SWIPED -> "SWIPED"
    CardPaymentDetails.EntryMethod.EMV -> "EMV"
    CardPaymentDetails.EntryMethod.CONTACTLESS -> "CONTACTLESS"
    CardPaymentDetails.EntryMethod.ON_FILE -> "ON_FILE"
  }

private fun Card.Brand.toBrandString(): String =
  when(this) {
    Card.Brand.OTHER_BRAND -> "OTHER_BRAND"
    Card.Brand.VISA -> "VISA"
    Card.Brand.MASTERCARD -> "MASTERCARD"
    Card.Brand.AMERICAN_EXPRESS -> "AMERICAN_EXPRESS"
    Card.Brand.DISCOVER -> "DISCOVER"
    Card.Brand.DISCOVER_DINERS -> "DISCOVER_DINERS"
    Card.Brand.EBT -> "EBT"
    Card.Brand.JCB -> "JCB"
    Card.Brand.CHINA_UNIONPAY -> "CHINA_UNIONPAY"
    Card.Brand.SQUARE_GIFT_CARD -> "SQUARE_GIFT_CARD"
    Card.Brand.ALIPAY -> "ALIPAY"
    Card.Brand.CASH_APP -> "CASH_APP"
    Card.Brand.EFTPOS -> "EFTPOS"
    Card.Brand.FELICA -> "FELICA"
    Card.Brand.INTERAC -> "INTERAC"
    Card.Brand.SQUARE_CAPITAL_CARD -> "SQUARE_CAPITAL_CARD"
    Card.Brand.SUICA -> "SUICA"
    Card.Brand.ID -> "ID"
    Card.Brand.QUICPAY -> "QUICPAY"
  }

private fun Card.CoBrand.toCoBrandString(): String =
  when(this) {
    Card.CoBrand.AFTERPAY -> "AFTERPAY"
    Card.CoBrand.CLEARPAY -> "CLEARPAY"
    Card.CoBrand.NONE -> "NONE"
    Card.CoBrand.UNKNOWN -> "UNKNOWN"
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
      pushMap(WritableNativeMap().apply {
        putString("category", it.category)
        putString("code", it.code)
        putString("detail", it.detail)
        putString("field", it.field)
      })
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

fun ReaderInfo.toReaderInfoMap(): WritableMap {
  return WritableNativeMap().apply {
    putString("id", id)
    putString("model", model.toModelString())
    putString("state", state.toStateString())
    putString("status", status.toStatusString())
    putString("serialNumber", serialNumber)
    putString("name", name)
    putMap("batteryStatus", batteryStatus?.toBatteryStatusMap())
    putString("firmwareVersion", firmwareVersion)
    putInt("firmwarePercent", firmwarePercent ?: 0)
    putArray("supportedCardEntryMethods", WritableNativeArray().apply {
      supportedCardEntryMethods.forEach {
        pushString(it.toEntryMethodString())
      }
    })
    putBoolean("isForgettable", isForgettable)
    putBoolean("isBlinkable", isBlinkable)
  }
}

fun CardEntryMethod.toEntryMethodString(): String {
  return when(this) {
    CardEntryMethod.EMV -> "EMV"
    CardEntryMethod.SWIPED -> "SWIPED"
    CardEntryMethod.CONTACTLESS -> "CONTACTLESS"
  }
}

fun ReaderInfo.BatteryStatus.toBatteryStatusMap(): WritableMap {
  return WritableNativeMap().apply {
    putBoolean("isCharging", isCharging)
    putInt("percent", percent)
  }
}

fun ReaderInfo.Model.toModelString(): String {
  return when(this) {
    ReaderInfo.Model.MAGSTRIPE -> "MAGSTRIPE"
    ReaderInfo.Model.CONTACTLESS_AND_CHIP -> "CONTACTLESS_AND_CHIP"
    ReaderInfo.Model.TAP_TO_PAY -> "TAP_TO_PAY"
  }
}

fun ReaderInfo.State.toStateString(): String {
  return when(this) {
    is ReaderInfo.State.Ready ->"READY"
    is ReaderInfo.State.Disabled ->"DISABLE"
    is ReaderInfo.State.Connecting ->"CONNECTING"
    is ReaderInfo.State.Disconnected ->"DISCONNECTED"
    is ReaderInfo.State.FailedToConnect->"FAILED_TO_CONNECT"
    is ReaderInfo.State.UpdatingFirmware ->"UPDATING_FIRMWARE"
  }
}

fun ReaderInfo.Status.toStatusString(): String {
  return when (this) {
    is ReaderInfo.Status.Ready -> "READY"
    is ReaderInfo.Status.ConnectingToDevice -> "CONNECTING_TO_DEVICE"
    is ReaderInfo.Status.ConnectingToSquare -> "CONNECTING_TO_SQUARE"
    is ReaderInfo.Status.Faulty -> "FAULTY"
    is ReaderInfo.Status.ReaderUnavailable -> "READER_UNAVAILABLE_${this.reason.name}"
  }
}


fun ReaderChangedEvent.toChangedEventMap(): WritableMap {
  return WritableNativeMap().apply {
    putString("change", change.toChangeString())
    putMap("reader", reader.toReaderInfoMap())
    putString("readerSerialNumber", readerSerialNumber)
  }
}

fun ReaderChangedEvent.Change.toChangeString(): String {
  return when(this) {
    ReaderChangedEvent.Change.ADDED -> "ADDED"
    ReaderChangedEvent.Change.CHANGED_STATE -> "CHANGED_STATE"
    ReaderChangedEvent.Change.BATTERY_THRESHOLD -> "BATTERY_THRESHOLD"
    ReaderChangedEvent.Change.BATTERY_CHARGING -> "BATTERY_CHARGING"
    ReaderChangedEvent.Change.FIRMWARE_PROGRESS -> "FIRMWARE_PROGRESS"
    ReaderChangedEvent.Change.REMOVED -> "REMOVED"
  }
}
