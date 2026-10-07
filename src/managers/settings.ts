import MobilePaymentsSdkReactNative from '../base_sdk';
import type { Money, SdkSettings } from '../models/objects';
import type { TrackingConsentState } from '../models/enums';

export const showSettings = (): Promise<void> => {
  return MobilePaymentsSdkReactNative.showSettings();
};

export const getEnvironment = (): Promise<String> => {
  return MobilePaymentsSdkReactNative.getEnvironment();
};

export const getSdkVersion = (): Promise<String> => {
  return MobilePaymentsSdkReactNative.getSdkVersion();
};

export const isShowingSettings = (): Promise<boolean> => {
  return MobilePaymentsSdkReactNative.isShowingSettings();
};

export const closeSettings = (): Promise<boolean> => {
  return MobilePaymentsSdkReactNative.closeSettings();
};

export const getSdkSettings = (): Promise<SdkSettings> => {
  return MobilePaymentsSdkReactNative.getSdkSettings();
};

export const getTrackingConsentState = (): Promise<TrackingConsentState> => {
  return MobilePaymentsSdkReactNative.getTrackingConsentState();
};

export const updateTrackingConsent = (granted: boolean): Promise<void> => {
  return MobilePaymentsSdkReactNative.updateTrackingConsent(granted);
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
