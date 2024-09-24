import MobilePaymentsSdkReactNative from './base_sdk';

export const authorize = (
  accessToken: String,
  locationId: String
): Promise<String> => {
  return MobilePaymentsSdkReactNative.authorize(accessToken, locationId);
};

export const deauthorize = (): Promise<String> => {
  return MobilePaymentsSdkReactNative.deauthorize();
};

export function multiply(a: number, b: number): Promise<number> {
  return MobilePaymentsSdkReactNative.multiply(a, b);
}
