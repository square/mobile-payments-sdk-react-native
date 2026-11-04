#import "SceneDelegate.h"
#import <React/RCTBundleURLProvider.h>
#import <RCTReactNativeFactory.h>
#import <ReactAppDependencyProvider/RCTAppDependencyProvider.h>

@interface SceneDelegate ()

@property (nonatomic, strong) RCTReactNativeFactory *reactNativeFactory;

@end

@implementation SceneDelegate

- (void)scene:(UIScene *)scene
    willConnectToSession:(UISceneSession *)session
                 options:(UISceneConnectionOptions *)connectionOptions
{
  if (![scene isKindOfClass:[UIWindowScene class]]) {
    return;
  }

  self.dependencyProvider = [RCTAppDependencyProvider new];
  self.reactNativeFactory = [[RCTReactNativeFactory alloc] initWithDelegate:self];
  self.window = [[UIWindow alloc] initWithWindowScene:(UIWindowScene *)scene];
  [self.reactNativeFactory startReactNativeWithModuleName:@"MobilePaymentsSdkReactNativeExample"
                                                 inWindow:self.window
                                        connectionOptions:connectionOptions];
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
