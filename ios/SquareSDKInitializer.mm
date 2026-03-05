//
//  SquareSDKInitializer.mm
//  mobile-payments-sdk-react-native
//

#import "SquareSDKInitializer.h"
#import <SquareMobilePaymentsSDK/SquareMobilePaymentsSDK-Swift.h>

void MPRNInitializeSquareSDK(NSDictionary * _Nullable launchOptions, NSString *applicationId) {
  [SQMPMobilePaymentsSDK initializeWithApplicationLaunchOptions:launchOptions
                                            squareApplicationID:applicationId];
}
