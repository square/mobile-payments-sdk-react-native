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
