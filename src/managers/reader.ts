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

export namespace TapToPaySettings {
  // iOS-only method
  export const linkAppleAccount = (): Promise<void> => {
    return MobilePaymentsSdkReactNative.linkAppleAccount();
  };

  export const relinkAppleAccount = (): Promise<void> => {
    return MobilePaymentsSdkReactNative.relinkAppleAccount();
  };

  export const isAppleAccountLinked = (): Promise<Boolean> => {
    return MobilePaymentsSdkReactNative.isAppleAccountLinked();
  };

  export const isDeviceCapable = (): Promise<Boolean> => {
    return MobilePaymentsSdkReactNative.isDeviceCapable();
  };
}
