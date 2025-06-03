import type {
  AdditionalPaymentMethodType,
  CardBrand,
  CardCoBrand,
  CardEntryMethod,
  CardInsertionStatus,
  CardPaymentStatus,
  CurrencyCode,
  DelayAction,
  EntryMethod,
  OfflinePaymentStatus,
  PaymentStatus,
  PromptMode,
  ReaderBatteryLevel,
  ReaderChange,
  ReaderConnectionFailureReason,
  ReaderConnectionFailureRecoverySuggestion,
  ReaderConnectionState,
  ReaderInternalStatus,
  ReaderModel,
  ReaderState,
  ReaderUnavailableReason,
  SourceType,
} from './enums';

export type Location = {
  id: String;
  currencyCode: String;
  name: String;
  mcc: String;
};

export type Money = {
  amount?: Number;
  currencyCode: CurrencyCode;
};

export type OnlinePayment = {
  amountMoney: Money;
  appFeeMoney: Money;
  cardDetails: CardPaymentDetails;
  createdAt: Date;
  customerId: String;
  id: String;
  locationId: String;
  note: String;
  orderId: String;
  referenceId: String;
  status: PaymentStatus;
  tipMoney: Money;
  totalMoney: Money;
  updatedAt: Date;
};

export type OffLinePayment = {
  amountMoney: Money;
  appFeeMoney: Money;
  cardDetails: OfflineCardPaymentDetails;
  createdAt: Date;
  id: String;
  localId: String;
  locationId: String;
  orderId: String;
  referenceId: String;
  status: OfflinePaymentStatus;
  sourceType: SourceType;
  tipMoney: Money;
  totalMoney: Money;
  updatedAt: Date;
  uploadedAt: Date;
};

export type PaymentParameters = {
  // Required
  amountMoney: Money;
  processingMode: Number;
  // Optional. For defaults, check:
  // Android: https://square.github.io/mobile-payments-sdk-android/-mobile%20-payments%20-s-d-k%20-android%20-technical%20-reference/com.squareup.sdk.mobilepayments.payment/-payment-parameters/index.html
  // iOS: https://square.github.io/mobile-payments-sdk-ios/docs/documentation/mobilepaymentssdkapi/paymentparameters/
  acceptPartialAuthorization?: Boolean;
  appFeeMoney?: Money;
  autocomplete?: Boolean;
  customerId?: String;
  delayAction?: DelayAction;
  delayDuration?: Number;
  locationId?: String;
  note?: String;
  orderId?: String;
  referenceId?: String;
  statementDescriptionIdentifer?: String;
  teamMemberId?: String;
  tipMoney?: Money;
  totalMoney?: Money;
  idempotencyKey?: String;
  paymentAttemptId?: String;
};

export type Card = {
  brand: CardBrand;
  cardholderName: String;
  coBrand: CardCoBrand;
  expirationMonth?: Number;
  expirationYear?: Number;
  id: String;
  lastFourDigits: String;
};

export type CardPaymentDetails = {
  applicationIdentifier: String;
  applicationName: String;
  authorizationCode: String;
  card: Card;
  entryMethod: EntryMethod;
  status: CardPaymentStatus;
};

export type OfflineCardPaymentDetails = {
  applicationIdentifier: String;
  applicationName: String;
  card: Card;
  entryMethod: EntryMethod;
};

export type CardInputMethods = {
  chip: Boolean;
  contactless: Boolean;
  swipe: Boolean;
};

export type PromptParameters = {
  additionalMethods: AdditionalPaymentMethodType[];
  mode: PromptMode;
};

export type Payment = {
  amountMoney: Money;
  appFeeMoney: Money;
  createdAt: Date;
  id: String;
  locationId: String;
  orderId: String;
  referenceId: String;
  sourceType: SourceType;
  tipMoney: Money;
  totalMoney: Money;
  updatedAt: Date;
};

export type ReaderBatteryStatus = {
  isCharging: Boolean;
  level?: ReaderBatteryLevel;
  percent: Number;
};

export type ReaderConnectionFailureInfo = {
  failureReason: ReaderConnectionFailureReason;
  localizedDescription: String;
  localizedTitle: String;
  recoverySuggestion: ReaderConnectionFailureRecoverySuggestion;
};

export type ReaderConnectionInfo = {
  failureInfo?: ReaderConnectionFailureInfo;
  state: ReaderConnectionState;
};

export type ReaderFirmwareInfo = {
  failureReason?: String;
  updatePercentage: Number;
  version: String;
};

export type ReaderStatus = {
  status: ReaderInternalStatus;
  readerUnavailableReason?: ReaderUnavailableReason;
};

export type ReaderInfo = {
  id: String;
  model: ReaderModel;
  state: ReaderState;
  status: ReaderStatus;
  serialNumber?: String;
  name: String;
  batteryStatus?: ReaderBatteryStatus;
  firmwareVersion?: String;
  firmwarePercent?: Number;
  supportedCardEntryMethods: CardEntryMethod[];
  isForgettable: Boolean;
  isBlinkable: Boolean;

  cardInsertionStatus?: CardInsertionStatus;
  connectionInfo?: ReaderConnectionInfo;
  firmwareInfo?: ReaderFirmwareInfo;
  isConnectionRetryable?: Boolean;
};

export type ReaderChangedEvent = {
  change: ReaderChange;
  reader: ReaderInfo;
  readerState: ReaderState;
  readerSerialNumber?: String;
};
