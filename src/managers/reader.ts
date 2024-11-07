import MobilePaymentsSdkReactNative from '../base_sdk';

export const startPairing = (): Promise<void> => {
  return MobilePaymentsSdkReactNative.startPairing();
};

export const stopPairing = (): Promise<void> => {
  return MobilePaymentsSdkReactNative.stopPairing();
};

export const showMockReaderUI = (): Promise<void> => {
  return MobilePaymentsSdkReactNative.showMockReaderUI();
};

export const hideMockReaderUI = (): Promise<void> => {
  return MobilePaymentsSdkReactNative.hideMockReaderUI();
};
