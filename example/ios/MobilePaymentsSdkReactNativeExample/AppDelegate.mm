#import "AppDelegate.h"
#import <React/RCTBundleURLProvider.h>
#import "Config.h"

@implementation AppDelegate

- (BOOL)application:(UIApplication *)application didFinishLaunchingWithOptions:(NSDictionary *)launchOptions
{
  NSString *APP_ID = [[NSBundle mainBundle] objectForInfoDictionaryKey:@"APP_ID"];
  MPRNInitializeSquareSDK(launchOptions, APP_ID);
 

  self.moduleName = @"MobilePaymentsSdkReactNativeExample";
  self.moduleName = @"MobilePaymentsSdkReactNativeExample";
  // You can add your custom initial props in the dictionary below.
  // They will be passed down to the ViewController used by React Native.
  self.initialProps = @{};

  return [super application:application didFinishLaunchingWithOptions:launchOptions];
}

- (NSURL *)sourceURLForBridge:(RCTBridge *)bridge
{
  return [self bundleURL];
}

- (NSURL *)bundleURL
{
#if DEBUG
  return [[RCTBundleURLProvider sharedSettings] jsBundleURLForBundleRoot:@"index"];
#else
  return [[NSBundle mainBundle] URLForResource:@"main" withExtension:@"jsbundle"];
#endif
}

@end
