import { NativeEventEmitter, type EmitterSubscription } from 'react-native';
import MobilePaymentsSdkReactNative from '../base_sdk';
import { CancelResult, PaymentType } from '../models/enums';
import type {
  Money,
  OffLinePayment,
  PaymentCallback,
  PaymentFailure,
  PaymentHandle,
  PaymentParameters,
  PaymentSuccess,
  PromptParameters,
} from '../models/objects';
import { mapUserInfoToFailure } from '../models/errors';

const paymentEventEmitter = new NativeEventEmitter(
  MobilePaymentsSdkReactNative
);

let paymentResultObserver: EmitterSubscription | undefined;

// Take payments: https://developer.squareup.com/docs/mobile-payments-sdk/ios/take-payments
export const startPayment = async (
  paymentParameters: PaymentParameters,
  promptParameters: PromptParameters,
  callback: PaymentCallback
): Promise<PaymentHandle> => {
  await MobilePaymentsSdkReactNative.startPayment(
    paymentParameters,
    promptParameters
  );
  paymentResultObserver = paymentEventEmitter.addListener(
    'PaymentResult',
    (resultEvent) => {
      const success = resultEvent.success as boolean;
      if (success) {
        const paymentType = resultEvent.paymentType;
        const payment = resultEvent.payment;
        if (paymentType === PaymentType.ONLINE) {
          const result: PaymentSuccess = {
            payment: payment,
            type: PaymentType.ONLINE,
          };
          callback(result);
        } else if (paymentType === PaymentType.OFFLINE) {
          const result: PaymentSuccess = {
            payment: payment,
            type: PaymentType.OFFLINE,
          };
          callback(result);
        }
      } else {
        const failure: PaymentFailure = {
          failure: mapUserInfoToFailure(resultEvent.error),
        };
        callback(failure);
      }
      paymentResultObserver?.remove();
      paymentResultObserver = undefined;
    }
  );
  return {
    cancel: cancelPayment,
    getPaymentsParameters: getPaymentsParameters,
  };
};

const cancelPayment = async (): Promise<CancelResult> => {
  const result = await MobilePaymentsSdkReactNative.cancelPayment();
  if (result) {
    return result;
  }
  return CancelResult.NO_PAYMENT_IN_PROGRESS;
};

const getPaymentsParameters = async (): Promise<
  PaymentParameters | undefined
> => {
  const result = await MobilePaymentsSdkReactNative.getPaymentsParameters();
  if (result) {
    return result;
  }
  return undefined;
};

export namespace OfflinePaymentQueue {
  export const getPayments = (): Promise<OffLinePayment[]> => {
    return MobilePaymentsSdkReactNative.getPayments();
  };

  export const getTotalStoredPaymentAmount = (): Promise<Money> => {
    return MobilePaymentsSdkReactNative.getTotalStoredPaymentAmount();
  };
}
