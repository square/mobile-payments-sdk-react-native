import {
  Platform,
  NativeEventEmitter,
  type EmitterSubscription,
} from 'react-native';
import MobilePaymentsSdkReactNative from '../base_sdk';
import type {
  ReaderChangedEvent,
  ReaderInfo,
  ReaderSettings,
} from '../models/objects';
import type { RetryConnectionResult } from '../models/enums';

export const readerEventEmitter = new NativeEventEmitter(
  MobilePaymentsSdkReactNative
);
export let readerChangesObserver: EmitterSubscription;

export const getReaders = (): Promise<ReaderInfo[]> => {
  return MobilePaymentsSdkReactNative.getReaders();
};

export const getReader = (id: string): Promise<ReaderInfo | null> => {
  return MobilePaymentsSdkReactNative.getReader(id);
};

export const forget = (id: string): Promise<void> => {
  return MobilePaymentsSdkReactNative.forget(id);
};

export const blink = (id: string): Promise<void> => {
  return MobilePaymentsSdkReactNative.blink(id);
};

export const retryConnection = (id: string): Promise<RetryConnectionResult> => {
  return MobilePaymentsSdkReactNative.retryConnection(id);
};

export const rebootReader = (id: string): Promise<void> => {
  return Platform.select({
    ios: () => MobilePaymentsSdkReactNative.rebootReader(id),
    android: () =>
      Promise.reject(new Error('This feature is only available on iOS.')),
  })!();
};

export const isPairingInProgress = (): Promise<boolean> => {
  return MobilePaymentsSdkReactNative.isPairingInProgress();
};

export const readerSettings = (): Promise<ReaderSettings> => {
  return MobilePaymentsSdkReactNative.readerSettings();
};

const addReaderChangedCallback = (refId: String): Promise<String> => {
  return MobilePaymentsSdkReactNative.addReaderChangedCallback(refId);
};

const removeReaderChangedCallback = (refId: String): Promise<void> => {
  return MobilePaymentsSdkReactNative.removeReaderChangedCallback(refId);
};

export const setReaderChangedCallback = (
  callback: (event: ReaderChangedEvent) => void
): (() => void) => {
  const refId = generateUUID();
  addReaderChangedCallback(refId);
  const subscription = readerEventEmitter.addListener(
    Platform.select({
      ios: 'ReaderChanged', //ios React Emitter not support dynamic
      android: `ReaderChanged-${refId}`,
    }) ?? 'ReaderChanged',
    (changedEvent) => {
      callback(changedEvent);
    }
  );
  return () => {
    subscription.remove();
    removeReaderChangedCallback(refId);
  };
};

export const pairReader = (): Promise<boolean> => {
  return MobilePaymentsSdkReactNative.pairReader();
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

const generateUUID = (): String => {
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
};
