import MobilePaymentsSdkReactNative from '../base_sdk';
import type { Payment, PaymentParameters } from '../models/objects';

export const startPayment = (
  paymentParameters: PaymentParameters
): Promise<Payment> => {
  return MobilePaymentsSdkReactNative.startPayment(paymentParameters);
};

export const cancelPayment = (): Promise<void> => {
  return MobilePaymentsSdkReactNative.cancelPayment();
};
