import type {
  AdditionalPaymentMethodType,
  CancelResult,
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
  PaymentType,
  ProcessingMode,
  PromptMode,
  ReaderBatteryLevel,
  ReaderChange,
  ReaderConnectionFailureReason,
  ReaderConnectionFailureRecoverySuggestion,
  ReaderConnectionState,
  ReaderInternalStatus,
  ReaderModel,
  ReaderUnavailableReason,
  SourceType,
} from './enums';
import type { Failure } from './errors';

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

export interface Payment {
  amountMoney: Money;
  appFeeMoney?: Money;
  createdAt: Date;
  locationId?: String;
  orderId?: String;
  referenceId?: String;
  tipMoney?: Money;
  totalMoney: Money;
  updatedAt: Date;
  sourceType: SourceType;
}

export interface OnlinePayment extends Payment {
  id: String;
  cardDetails?: CardPaymentDetails;
  customerId?: String;
  note?: String;
  teamMemberId?: String;
  status: PaymentStatus;
}

export interface OffLinePayment extends Payment {
  id?: String;
  cardDetails?: OfflineCardPaymentDetails;
  localId: String;
  status: OfflinePaymentStatus;
  uploadedAt?: Date;
}

export type PaymentParameters = {
  // Required
  amountMoney: Money;
  processingMode: ProcessingMode;
  paymentAttemptId: String; //required for ios
  allowCardSurcharge: Boolean; //required for Android
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
  statementDescriptionIdentifier?: String;
  teamMemberId?: String;
  tipMoney?: Money;
  idempotencyKey?: String;
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
  firmwareInfo?: ReaderFirmwareInfo;
  isConnectionRetryable?: Boolean;
};

export type ReaderChangedEvent = {
  change: ReaderChange;
  reader: ReaderInfo;
  readerSerialNumber?: String;
};

export interface PaymentResult {}

export interface PaymentSuccess extends PaymentResult {
  payment: Payment;
  type: PaymentType;
}

export interface PaymentFailure extends PaymentResult {
  failure: Failure;
}

export type PaymentCallback = (paymentResult: PaymentResult) => void;

export interface PaymentHandle {
  cancel: () => Promise<CancelResult>;
  getPaymentsParameters: () => Promise<PaymentParameters | undefined>;
}
