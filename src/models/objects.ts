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
  Environment,
  FirmwareUpdateStatus,
  OfflinePaymentStatus,
  PaymentProcessingFeeType,
  PaymentStatus,
  PaymentType,
  PromptMode,
  ReaderBatteryLevel,
  ReaderChange,
  ReaderConnectionType,
  ReaderConnectionFailureReason,
  ReaderConnectionFailureRecoverySuggestion,
  ReaderConnectionState,
  ReaderInternalStatus,
  ReaderModel,
  ReaderUnavailableReason,
  SourceType,
  VerificationMethod,
  VerificationResult,
} from './enums';

export type Location = {
  id: String;
  currencyCode: String;
  name: String;
  mcc: String;
  merchantId?: string;
  businessName?: string;
  cardProcessingActivated?: boolean;
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
  paymentType?: PaymentType;
  cashDetails?: CashPaymentDetails;
  teamMemberId?: string;
  capabilities?: Capabilities;
  processingFee?: PaymentProcessingFee[];
  receiptNumber?: string;
  receiptUrl?: string;
  statementDescription?: string;
};

export type OfflinePayment = {
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
  paymentType?: PaymentType;
  cashDetails?: CashPaymentDetails;
};

export type PaymentParameters = {
  // Required
  amountMoney: Money;
  processingMode: Number;
  allowCardSurcharge?: Boolean; //required for Android
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
  bin?: string;
};

export type CardSurchargeDetails = {
  cardSurchargeMoney: Money;
  taxOnSurchargeMoney?: Money;
  totalSurchargeMoney?: Money;
};

export type CardPaymentDetails = {
  applicationIdentifier: String;
  applicationName: String;
  authorizationCode: String;
  card: Card;
  entryMethod: EntryMethod;
  status: CardPaymentStatus;
  appliedCardSurchargeDetails?: CardSurchargeDetails;
  verificationMethod?: VerificationMethod;
  verificationResults?: VerificationResult;
};

export type CashPaymentDetails = {
  buyerSuppliedMoney?: Money;
  changeBackMoney?: Money;
};

export type Capabilities = {
  allCapabilities: string[];
};

export type PaymentProcessingFee = {
  effectiveAt: Date;
  type: PaymentProcessingFeeType;
  amountMoney: Money;
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
  paymentType?: PaymentType;
  status?: PaymentStatus | OfflinePaymentStatus;
  cardDetails?: CardPaymentDetails | OfflineCardPaymentDetails;
  customerId?: string;
  note?: string;
  teamMemberId?: string;
  cashDetails?: CashPaymentDetails;
  capabilities?: Capabilities;
  processingFee?: PaymentProcessingFee[];
  receiptNumber?: string;
  receiptUrl?: string;
  statementDescription?: string;
  localId?: string;
  uploadedAt?: Date;
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
  updateStatus?: FirmwareUpdateStatus;
  updateTime?: Date;
};

export type ReaderStatus = {
  status: ReaderInternalStatus;
  readerUnavailableReason?: ReaderUnavailableReason;
  title?: string;
  detail?: string;
};

export type ReaderInfo = {
  id: String;
  model: ReaderModel;
  status: ReaderStatus;
  serialNumber?: String;
  name: String;
  batteryStatus?: ReaderBatteryStatus;
  supportedCardEntryMethods: CardEntryMethod[];
  isForgettable: Boolean;
  isBlinkable: Boolean;
  cardInsertionStatus?: CardInsertionStatus;
  firmwareInfo?: ReaderFirmwareInfo;
  isConnectionRetryable?: Boolean;
  connectionType?: ReaderConnectionType;
  isRebootable?: boolean;
};

export type ReaderChangedEvent = {
  change: ReaderChange;
  reader: ReaderInfo;
  readerSerialNumber?: String;
};

export type TimeOfDay = {
  hour: Number;
  minute: Number;
};

export type ReaderSettings = {
  isReducedChargingModeEnabled: boolean;
  preferredFirmwareUpdateTime?: TimeOfDay | null;
};

export type SdkSettings = {
  sdkVersion: string;
  sdkEnvironment: Environment;
  securityComplianceVersion: string;
};

export type IdempotencyKeyData = {
  idempotencyKey: string;
  paymentAttemptId: string;
  updatedAt: Date;
};
