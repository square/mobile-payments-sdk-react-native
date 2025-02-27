import { Platform } from 'react-native';
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
  const notSupportedError = (): never => {
    throw new Error('This feature is only available on iOS.');
  };

  export const linkAppleAccount = (): Promise<void> => {
    console.log(Platform.OS);
    return Platform.select({
      ios: () => MobilePaymentsSdkReactNative.linkAppleAccount(),
      android: () => Promise.reject(notSupportedError()),
    })!();
  };

  export const relinkAppleAccount = (): Promise<void> => {
    return Platform.select({
      ios: () => MobilePaymentsSdkReactNative.relinkAppleAccount(),
      android: () => Promise.reject(notSupportedError()),
    })!();
  };

  export const isAppleAccountLinked = (): Promise<Boolean> => {
    return Platform.select({
      ios: () => MobilePaymentsSdkReactNative.isAppleAccountLinked(),
      android: () => Promise.reject(notSupportedError()),
    })!();
  };

  export const isDeviceCapable = (): Promise<Boolean> => {
    return Platform.select({
      ios: () => MobilePaymentsSdkReactNative.isDeviceCapable(),
      android: () => Promise.reject(notSupportedError()),
    })!();
  };
}
