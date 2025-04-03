import {
  Platform,
  NativeEventEmitter,
  type EmitterSubscription,
} from 'react-native';
import MobilePaymentsSdkReactNative from '../base_sdk';
import type { ReaderInfo } from '../models/objects';

export const readerEventEmitter = new NativeEventEmitter(
  MobilePaymentsSdkReactNative
);
export let readerChangesObserver: EmitterSubscription;

export const getReaders = (): Promise<ReaderInfo[]> => {
  return MobilePaymentsSdkReactNative.getReaders();
};

export const getReader = (id: string): Promise<ReaderInfo> => {
  return MobilePaymentsSdkReactNative.getReader(id);
};

export const forget = (id: string): Promise<void> => {
  return MobilePaymentsSdkReactNative.forget(id);
};

export const blink = (id: string): Promise<void> => {
  return MobilePaymentsSdkReactNative.blink(id);
};

export const isPairingInProgress = (): Promise<boolean> => {
  return MobilePaymentsSdkReactNative.isPairingInProgress();
};

const addReaderChangedCallback = (): Promise<void> => {
  return MobilePaymentsSdkReactNative.addReaderChangedCallback();
};

export const setReaderChangedCallback = (
  callback: () => void
): EmitterSubscription => {
  addReaderChangedCallback();
  const subscription = readerEventEmitter.addListener(
    'ReaderChanged',
    (event) => {
      callback();
    }
  );
  return subscription;
};

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
