//
//  SquareSDKInitializer.h
//  mobile-payments-sdk-react-native
//
//  Call this from your AppDelegate before starting React Native.
//  Do NOT import SquareMobilePaymentsSDK in your app—this module provides
//  the only SDK dependency to avoid duplicate type definitions.
//

#import <Foundation/Foundation.h>

NS_ASSUME_NONNULL_BEGIN

/// Initializes the Square Mobile Payments SDK. Call from AppDelegate
/// - (BOOL)application:didFinishLaunchingWithOptions: before [super application:...].
void MPRNInitializeSquareSDK(NSDictionary * _Nullable launchOptions, NSString *applicationId);

NS_ASSUME_NONNULL_END
