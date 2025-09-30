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
  ReaderModel,
  ReaderStatus,
  ReaderUnavailableReason,
  SourceType,
} from './enums';

export type Location = {
  id: string;
  currencyCode: string;
  name: string;
  mcc: string;
};

export type Money = {
  amount?: number;
  currencyCode: CurrencyCode;
};

export type OnlinePayment = {
  amountMoney: Money;
  appFeeMoney: Money;
  cardDetails: CardPaymentDetails;
  createdAt: Date;
  customerId: string;
  id: string;
  locationId: string;
  note: string;
  orderId: string;
  referenceId: string;
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
  id: string;
  localId: string;
  locationId: string;
  orderId: string;
  referenceId: string;
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
  processingMode: number;
  // Optional. For defaults, check:
  // Android: https://square.github.io/mobile-payments-sdk-android/-mobile%20-payments%20-s-d-k%20-android%20-technical%20-reference/com.squareup.sdk.mobilepayments.payment/-payment-parameters/index.html
  // iOS: https://square.github.io/mobile-payments-sdk-ios/docs/documentation/mobilepaymentssdkapi/paymentparameters/
  acceptPartialAuthorization?: boolean;
  appFeeMoney?: Money;
  autocomplete?: boolean;
  customerId?: string;
  delayAction?: DelayAction;
  delayDuration?: number;
  locationId?: string;
  note?: string;
  orderId?: string;
  referenceId?: string;
  statementDescriptionIdentifer?: string;
  teamMemberId?: string;
  tipMoney?: Money;
  totalMoney?: Money;
  paymentAttemptId?: string;
};

export type Card = {
  brand: CardBrand;
  cardholderName: string;
  coBrand: CardCoBrand;
  expirationMonth?: number;
  expirationYear?: number;
  id: string;
  lastFourDigits: string;
};

export type CardPaymentDetails = {
  applicationIdentifier: string;
  applicationName: string;
  authorizationCode: string;
  card: Card;
  entryMethod: EntryMethod;
  status: CardPaymentStatus;
};

export type OfflineCardPaymentDetails = {
  applicationIdentifier: string;
  applicationName: string;
  card: Card;
  entryMethod: EntryMethod;
};

export type CardInputMethods = {
  chip: boolean;
  contactless: boolean;
  swipe: boolean;
};

export type PromptParameters = {
  additionalMethods: AdditionalPaymentMethodType[];
  mode: PromptMode;
};

export type Payment = {
  amountMoney: Money;
  appFeeMoney: Money;
  createdAt: Date;
  id: string;
  locationId: string;
  orderId: string;
  referenceId: string;
  sourceType: SourceType;
  tipMoney: Money;
  totalMoney: Money;
  updatedAt: Date;
};

export type ReaderBatteryStatus = {
  isCharging: boolean;
  level?: ReaderBatteryLevel;
  percent: number;
};

export type ReaderConnectionFailureInfo = {
  failureReason: ReaderConnectionFailureReason;
  localizedDescription: string;
  localizedTitle: string;
  recoverySuggestion: ReaderConnectionFailureRecoverySuggestion;
};

export type ReaderConnectionInfo = {
  failureInfo?: ReaderConnectionFailureInfo;
  state: ReaderConnectionState;
};

export type ReaderFirmwareInfo = {
  failureReason?: string;
  updatePercentage: number;
  version: string;
};

export type ReaderStatusInfo = {
  status: ReaderStatus;
  reason: ReaderUnavailableReason;
  title: string;
};

export type ReaderInfo = {
  id: string;
  model: ReaderModel;
  status?: string; //Android-specific direct status
  statusInfo?: ReaderStatusInfo; //iOS-specific status info
  serialNumber?: string;
  name: string;
  batteryStatus?: ReaderBatteryStatus;
  firmwareVersion?: string;
  firmwarePercent?: number;
  supportedCardEntryMethods: CardEntryMethod[];
  isForgettable: boolean;
  isBlinkable: boolean;

  cardInsertionStatus?: CardInsertionStatus;
  connectionInfo?: ReaderConnectionInfo;
  firmwareInfo?: ReaderFirmwareInfo;
  isConnectionRetryable?: boolean;
};

export type ReaderChangedEvent = {
  change: ReaderChange;
  reader: ReaderInfo;
  readerStatusInfo: ReaderStatusInfo;
  readerSerialNumber?: string;
};
