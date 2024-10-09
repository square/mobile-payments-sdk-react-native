//
//  PaymentsBridge.m
//  MobilePaymentsSdkReactNativeExample
//
//  Created by Nilay Gupta on 07/10/24.
//

#import <Foundation/Foundation.h>
#import "React/RCTBridgeModule.h"

@interface RCT_EXTERN_MODULE(PaymentsBridge, NSObject)
  RCT_EXTERN_METHOD(authorizePayments)
//  RCT_EXTERN_METHOD(classMethod2WithParams: (DataType) paramName)
@end
