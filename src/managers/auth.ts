import MobilePaymentsSdkReactNative from '../base_sdk';
import { NativeEventEmitter, EmitterSubscription } from 'react-native';
import type { Location } from '../models/objects';
import { AuthorizationState } from '../models/enums';
export const eventEmitter = new NativeEventEmitter(MobilePaymentsSdkReactNative);
export const authorizationObserver: EmitterSubscription = null;

export const authorize = (
  accessToken: String,
  locationId: String
): Promise<String> => {
  return MobilePaymentsSdkReactNative.authorize(accessToken, locationId);
};

export const deauthorize = (): Promise<String> => {
  return MobilePaymentsSdkReactNative.deauthorize();
};

export const getAuthorizedLocation = (): Promise<Location> => {
  return MobilePaymentsSdkReactNative.getAuthorizedLocation();
};

export const getAuthorizationState = (): Promise<String> => {
  return MobilePaymentsSdkReactNative.getAuthorizationState();
};

const addAuthorizationObserver = (): Promise<void> => {
  return MobilePaymentsSdkReactNative.addAuthorizationObserver();
}

const removeAuthorizationObserver = (): Promise<void> => {
  return MobilePaymentsSdkReactNative.removeAuthorizationObserver();
}

export function observeAuthorizationChanges(callback: (newState: AuthorizationState) => void): EmitterSubscription {
  // Add a listener for the 'authorizationChange' event
  addAuthorizationObserver()
  const subscription = eventEmitter.addListener('AuthorizationStatusChange', (event) => {
    callback(AuthorizationState[event.state as keyof typeof AuthorizationState])
  });

  // Return the subscription so that the caller can remove it if needed
  authorizationObserver = subscription;
  return subscription;
}
export function stopObservingAuthorizationChanges() {
  if (authorizationObserver !== null) {
    authorizationObserver.remove();
    removeAuthorizationObserver();
  }
}
