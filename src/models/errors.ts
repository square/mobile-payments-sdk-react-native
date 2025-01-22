// For documentation on the errors
// Visit https://developer.squareup.com/docs/mobile-payments-sdk/ios/handling-errors and
//       https://developer.squareup.com/docs/mobile-payments-sdk/android/handling-errors

export enum AuthorizationError {
  ALREADY_AUTHORIZED,
  ALREADY_IN_PROGRESS,
  AUTHORIZATION_CODE_ALREADY_REDEEMED,
  DEAUTHORIZATION_IN_PROGRESS,
  DEVICE_TIME_DOES_NOT_MATCH_SERVER_TIME,
  EMPTY_ACCESS_TOKEN,
  EMPTY_LOCATION_ID,
  EXPIRED_AUTHORIZATION_CODE,
  INVALID_ACCESS_TOKEN,
  INVALID_AUTHORIZATION_CODE,
  INVALID_LOCATION_ID,
  LOCATION_NOT_ACTIVATED_FOR_CARD_PROCESSING,
  NO_NETWORK,
  UNEXPECTED,
  UNSUPPORTED_COUNTRY,
}

export enum PaymentError {
  DEVICE_TIME_DOES_NOT_MATCH_SERVER_TIME,
  IDEMPOTENCY_KEY_REUSED,
  INVALID_PAYMENT_PARAMETERS,
  INVALID_PAYMENT_SOURCE,
  LOCATION_PERMISSION_NEEDED,
  MERCHANT_NOT_OPTED_INTO_OFFLINE_PROCESSING,
  NO_NETWORK,
  NOT_AUTHORIZED,
  OFFLINE_STORED_AMOUNT_EXCEEDED,
  OFFLINE_TRANSACTION_AMOUNT_EXCEEDED,
  PAYMENT_ALREADY_IN_PROGRESS,
  SANDBOX_UNSUPPORTED_FOR_OFFLINE_PROCESSING,
  TIMED_OUT,
  UNEXPECTED,
  UNSUPPORTED_MODE,
}

export enum ReaderCardInfoError {
  CARD_ERROR,
  NOT_AUTHORIZED,
  READER_ERROR,
  STORE_ERROR,
  UNKNOWN,
  UNSUPPORTED_ENTRY_METHOD,
}

export enum ReaderPairingError {
  BLUETOOTH_DISABLED,
  BLUETOOTH_NOT_READY,
  BLUETOOTH_NOT_SUPPORTED,
  BLUETOOTH_PERMISSION_DENIED,
  BLUETOOTH_PERMISSION_NOT_DETERMINED,
  BLUETOOTH_PERMISSION_RESTRICTED,
  BLUETOOTH_PERMISSION_UNKNOWN_CASE,
  BLUETOOTH_RESETTING,
  BLUETOOTH_UNKNOWN_ERROR,
  BONDING_REMOVED,
  FAILED_TO_CONNECT,
  NOT_AUTHORIZED,
  NOT_SUPPORTED,
  READER_ALREADY_PAIRING,
  TIMED_OUT,
  UPDATE_REQUIRED,
}

// Corresponds to the ErrorDetails inside the Failure object in the SDK
// Android: https://square.github.io/mobile-payments-sdk-android/-mobile%20-payments%20-s-d-k%20-android%20-technical%20-reference/com.squareup.sdk.mobilepayments.core/-error-details/index.html
export type ErrorDetails = {
  category: String;
  code: String;
  detail: String;
  field: String;
};

// Corresponds to the Failure object in the SDK
// Android: https://square.github.io/mobile-payments-sdk-android/-mobile%20-payments%20-s-d-k%20-android%20-technical%20-reference/com.squareup.sdk.mobilepayments.core/-result/-failure/index.html
// iOS: https://developer.apple.com/documentation/foundation/nserror
export type Failure = {
  debugMessage: String;
  debugCode: String;
  details: [ErrorDetails];
  errorMessage: String;
  errorCode: String;
};

// Convenience function to map the error.userInfo object to a Failure object
// For example
// ```
//   try {
//     const payment = await startPayment(paymentParameters, promptParameters);
//     ...
//   } catch (error) {
//     const failure: Failure = mapUserInfoToFailure(error.userInfo);
//     console.log('Payment error:', JSON.stringify(failure));
//   }
// ```
export const mapUserInfoToFailure = (userInfo: any): Failure => {
  if (userInfo == null) {
    return {
      debugMessage: '',
      debugCode: '',
      details: [],
      errorMessage: '',
      errorCode: '',
    };
  }
  let details: ErrorDetails[] = [];
  if (Array.isArray(userInfo.details)) {
    // check if details is an array
    details = userInfo.details.map((detail: any) => ({
      category: detail.category,
      code: detail.code,
      detail: detail.detail,
      field: detail.field,
    }));
  }
  return {
    debugMessage: userInfo.debugMessage ? userInfo.debugMessage : '',
    debugCode: userInfo.debugCode ? userInfo.debugCode : '',
    details: details,
    errorMessage: userInfo.errorMessage ? userInfo.errorMessage : '',
    errorCode: userInfo.errorCode ? userInfo.errorCode : '',
  };
};
