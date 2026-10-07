import { NativeEventEmitter } from 'react-native';
import MobilePaymentsSdkReactNative from '../base_sdk';

export const nativeEventEmitter = new NativeEventEmitter(
  MobilePaymentsSdkReactNative
);

export const generateUUID = (): string => {
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
};
