import MobilePaymentsSdkReactNative from '../base_sdk';
import type { Payment, PaymentParameters, PromptParameters } from '../models/objects';

export const startPayment = (
  paymentParameters: PaymentParameters,
  promptParameters: PromptParameters
): Promise<Payment> => {
  return MobilePaymentsSdkReactNative.startPayment(paymentParameters, promptParameters);
};

export const cancelPayment = (): Promise<void> => {
  return MobilePaymentsSdkReactNative.cancelPayment();
};
