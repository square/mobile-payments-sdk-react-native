import MobilePaymentsSdkReactNative from '../base_sdk';

export const showSettings = (): Promise<void> => {
  return MobilePaymentsSdkReactNative.showSettings();
};

export const getEnvironment = (): Promise<String> => {
  return MobilePaymentsSdkReactNative.getEnvironment();
};

export const getSdkVersion = (): Promise<String> => {
  return MobilePaymentsSdkReactNative.getSdkVersion();
};
