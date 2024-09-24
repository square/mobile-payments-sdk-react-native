import MobilePaymentsSdkReactNative from '../base_sdk';
import type { Location } from '../models/objects';

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

// This is a test function, leave it here so we know the sample app is working properly
export function multiply(a: number, b: number): Promise<number> {
  return MobilePaymentsSdkReactNative.multiply(a, b);
}
