import { Platform } from 'react-native';
import MobilePaymentsSdkReactNative from '../base_sdk';
import type { Money } from '../models/objects';

export const showSettings = (): Promise<void> => {
  return MobilePaymentsSdkReactNative.showSettings();
};

export const getEnvironment = (): Promise<String> => {
  return MobilePaymentsSdkReactNative.getEnvironment();
};

export const getSdkVersion = (): Promise<String> => {
  return MobilePaymentsSdkReactNative.getSdkVersion();
};

export const getMpocVersion = (): Promise<String> => {
  return Platform.select({
    ios: () => MobilePaymentsSdkReactNative.getMpocVersion(),
    android: () =>
      Promise.reject(new Error('This feature is only available on iOS.')),
  })!();
};

export const isShowingSettings = (): Promise<boolean> => {
  return MobilePaymentsSdkReactNative.isShowingSettings();
};

export const closeSettings = (): Promise<boolean> => {
  return MobilePaymentsSdkReactNative.closeSettings();
};

export namespace PaymentSettings {
  export const isOfflineProcessingAllowed = (): Promise<Boolean> => {
    return MobilePaymentsSdkReactNative.isOfflineProcessingAllowed();
  };

  //Returns null if the offlineProcessing is not allowed
  export const getOfflineTotalStoredAmountLimit = (): Promise<Money | null> => {
    return MobilePaymentsSdkReactNative.getOfflineTotalStoredAmountLimit();
  };

  export const getOfflineTransactionAmountLimit = (): Promise<Money | null> => {
    return MobilePaymentsSdkReactNative.getOfflineTransactionAmountLimit();
  };
}
