import type {
  AdditionalPaymentMethodType,
  CardBrand,
  CardCoBrand,
  CardInsertionStatus,
  CardPaymentStatus,
  CurrencyCode,
  DelayAction,
  EntryMethod,
  PaymentStatus,
  PromptMode,
  ReaderBatteryLevel,
  ReaderConnectionFailureReason,
  ReaderConnectionFailureRecoverySuggestion,
  ReaderConnectionState,
  ReaderModel,
  ReaderState,
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

export type PaymentParameters = {
  acceptPartialAuthorization: Boolean;
  amountMoney: Money;
  appFeeMoney: Money;
  autocomplete: Boolean;
  customerId: String;
  delayAction: DelayAction;
  delayDuration?: Number;
  idempotencyKey: String;
  locationId: String;
  note: String;
  orderId: String;
  referenceId: String;
  teamMemberId: String;
  tipMoney: Money;
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

export type CardInputMethods = {
  chip: Boolean;
  contactless: Boolean;
  swipe: Boolean;
};

export type PromptParameters = {
  additionalPaymentMethods: [AdditionalPaymentMethodType];
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
  level: ReaderBatteryLevel;
  percentage: Number;
};

export type ReaderConnectionFailureInfo = {
  failureReason: ReaderConnectionFailureReason;
  localizedDescription: String;
  localizedTitle: String;
  recoverySuggestion: ReaderConnectionFailureRecoverySuggestion;
};

export type ReaderConnectionInfo = {
  failureInfo: ReaderConnectionFailureInfo;
  state: ReaderConnectionState;
};

export type ReaderFirmwareInfo = {
  failureReason: String;
  updatePercentage: Number;
  version: String;
};

export type ReaderInfo = {
  batteryStatus: ReaderBatteryStatus;
  cardInsertionStatus: CardInsertionStatus;
  connectionInfo: ReaderConnectionInfo;
  firmwareInfo: ReaderFirmwareInfo;
  id: Number;
  isBlinkable: Boolean;
  isConnectionRetryable: Boolean;
  isForgettable: Boolean;
  model: ReaderModel;
  name: String;
  serialNumber?: String;
  state: ReaderState;
  supportedInputMethods: [CardInputMethods];
};
