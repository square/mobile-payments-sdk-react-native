export enum AccountType {
  SAVINGS,
  CHECKING,
  CREDIT,
}

export enum AdditionalPaymentMethodType {
  ALL = 'ALL',
  KEYED = 'KEYED',
}

export enum AuthorizationState {
  AUTHORIZED = 'AUTHORIZED',
  AUTHORIZING = 'AUTHORIZING',
  NOT_AUTHORIZED = 'NOT_AUTHORIZING',
}

export enum CardBrand {
  ALIPAY,
  AMERICAN_EXPRESS,
  CASH_APP,
  CHINA_UNION_PAY,
  DISCOVER,
  DISCOVER_DINERS,
  EBT,
  EFTPOS,
  FELICA,
  ID,
  INTERAC,
  JCB,
  MASTERCARD,
  OTHER_BRAND,
  SQUARE_CAPITAL_CARD,
  SQUARE_GIFT_CARD,
  SUICA,
  UNKNOWN,
  VISA,
}

export enum CardCoBrand {
  AFTERPAY,
  CLEARPAY,
  NONE,
  UNKNOWN,
}

export enum CardPaymentStatus {
  AUTHORIZED,
  CAPTURED,
  VOIDED,
  FAILED,
  UNKNOWN,
}

export enum CardInsertionStatus {
  INSERTED,
  NOT_INSERTED,
  UNKNOWN,
}

export enum CurrencyCode {
  AUD = 'AUD',
  CAD = 'CAD',
  EUR = 'EUR',
  GBP = 'GBP',
  JPY = 'JPY',
  USD = 'USD',
}

export enum DelayAction {
  CANCEL = 0,
  COMPLETE = 1,
}

export enum EntryMethod {
  KEYED,
  SWIPED,
  EMV,
  CONTACTLESS,
  ON_FILE,
  UNKNOWN,
}

export enum Environment {
  PRODUCTION = 'PRODUCTION',
  SANDBOX = 'SANDBOX',
}

export enum PaymentStatus {
  APPROVED,
  COMPLETE,
  CANCELED,
  FAILED,
  UNKNOWN,
}

export enum PromptMode {
  DEFAULT = 0,
}

export enum SourceType {
  BANK_ACCOUNT,
  CARD,
  CASH,
  EXTERNAL,
  SQUARE_ACCOUNT,
  UNKNOWN,
  WALLET,
}

// Reader Enums
export enum ReaderBatteryLevel {
  CRITICALLY_LOW,
  FULL,
  HIGH,
  LOW,
  MID,
}

export enum ReaderChange {
  BATTERY_DID_BEGIN_CHARGING,
  BATTERY_DID_END_CHARGING,
  BATTERY_LEVEL_DID_CHANGE,
  CARD_INSERTED,
  CARD_REMOVED,
  CONNECTION_DID_FAIL,
  CONNECTION_STATE_DID_CHANGE,
  FIRMWARE_UPDATE_DID_FAIL,
  FIRMWARE_UPDATE_PERCENT_DID_CHANGE,
  STATE_DID_CHANGE,
}

export enum ReaderConnectionFailureRecoverySuggestion {
  ACTIVATE_ACCOUNT,
  CONTACT_SUPPORT,
  NO_SUGGESTION,
  RETRY,
}

export enum ReaderConnectionState {
  CONNECTED,
  CONNECTING,
  FAILED_TO_CONNECT,
  NOT_CONNECTED,
}

export enum ReaderFirmwareUpdateError {
  CONNECTION_TIMEOUT,
  FIRMWARE_FAILURE,
  SERVER_CALL_FAILURE,
  UNKNOWN_ERROR,
}

export enum ReaderModel {
  CONTACTLESS_AND_CHIP,
  EMBEDDED,
  MAGSTRIPE,
  STAND,
  UNKNOWN,
}

export enum ReaderConnectionFailureReason {
  DENIED_BY_SERVER,
  GENERIC_ERROR,
  MAX_READERS_CONNECTED,
  NETWORK_TIMEOUT,
  NETWORK_TRANSPORT_ERROR,
  NOT_CONNECTED_TO_INTERNET,
  READER_TIMEOUT,
  REVOKED_BY_DEVICE,
  SERVER_ERROR,
  UNKNOWN,
}

export enum ReaderState {
  CONNECTING,
  DISABLED,
  DISCONNECTED,
  FAILED_TO_CONNECT,
  READY,
  UPDATING_FIRMWARE,
}

// Offline Mode Enums
export enum OfflinePaymentQueueError {
  NOT_AUTHORIZED,
  UNEXPECTED,
  UNSUPPORTED_SANDBOX_ENVIRONMENT,
}

export enum OfflinePaymentStatus {
  QUEUED,
  UPLOADED,
  FAILED_TO_UPLOAD,
  FAILED_TO_PROCESS,
  PROCESSED,
  UNKNOWN,
}

export enum ProcessingMode {
  AUTO_DETECT = 0,
  OFFLINE_ONLY = 1,
  ONLINE_ONLY = 2,
}
