import MobilePaymentsSdkReactNative from '../base_sdk';
import { Platform } from 'react-native';
import { generateUUID, nativeEventEmitter } from '../internal/events';
import type { CardEntryMethod } from '../models/enums';
import type {
  IdempotencyKeyData,
  Money,
  OfflinePayment,
  Payment,
  PaymentParameters,
  PromptParameters,
} from '../models/objects';

// Take payments: https://developer.squareup.com/docs/mobile-payments-sdk/ios/take-payments
export const startPayment = (
  paymentParameters: PaymentParameters,
  promptParameters: PromptParameters
): Promise<Payment> => {
  return MobilePaymentsSdkReactNative.startPayment(
    paymentParameters,
    promptParameters
  );
};

export const getIdempotencyKey = (
  paymentAttemptId: string
): Promise<string | null> => {
  return MobilePaymentsSdkReactNative.getIdempotencyKey(paymentAttemptId);
};

export const isPaymentInProgress = (): Promise<boolean> => {
  return MobilePaymentsSdkReactNative.isPaymentInProgress();
};

export const getAllIdempotencyKeys = (): Promise<IdempotencyKeyData[]> => {
  return Platform.select({
    android: () => MobilePaymentsSdkReactNative.getAllIdempotencyKeys(),
    ios: () =>
      Promise.reject(new Error('This feature is only available on Android.')),
  })!();
};

export const completePayment = (paymentId: string): Promise<Payment> => {
  return Platform.select({
    android: () => MobilePaymentsSdkReactNative.completePayment(paymentId),
    ios: () =>
      Promise.reject(new Error('This feature is only available on Android.')),
  })!();
};

export const getAvailableCardEntryMethods = (): Promise<CardEntryMethod[]> => {
  return MobilePaymentsSdkReactNative.getAvailableCardEntryMethods();
};

export const setAvailableCardEntryMethodsCallback = (
  callback: (methods: CardEntryMethod[]) => void
): (() => void) => {
  const refId = generateUUID();
  MobilePaymentsSdkReactNative.addAvailableCardEntryMethodsCallback(refId);
  const subscription = nativeEventEmitter.addListener(
    Platform.select({
      ios: 'AvailableCardEntryMethodsChanged',
      android: `AvailableCardEntryMethodsChanged-${refId}`,
    }) ?? 'AvailableCardEntryMethodsChanged',
    (event: { methods: CardEntryMethod[] }) => {
      callback(event.methods);
    }
  );
  return () => {
    subscription.remove();
    MobilePaymentsSdkReactNative.removeAvailableCardEntryMethodsCallback(refId);
  };
};

export const cancelPayment = (): Promise<void> => {
  return MobilePaymentsSdkReactNative.cancelPayment();
};

export namespace OfflinePaymentQueue {
  export const getPayments = (): Promise<OfflinePayment[]> => {
    return MobilePaymentsSdkReactNative.getPayments();
  };

  export const getTotalStoredPaymentAmount = (): Promise<Money> => {
    return MobilePaymentsSdkReactNative.getTotalStoredPaymentAmount();
  };
}
