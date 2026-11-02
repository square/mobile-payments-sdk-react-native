#import "AppDelegate.h"

@implementation AppDelegate

- (BOOL)application:(UIApplication *)application didFinishLaunchingWithOptions:(NSDictionary *)launchOptions
{
  NSString *APP_ID = [[NSBundle mainBundle] objectForInfoDictionaryKey:@"APP_ID"];
  MPRNInitializeSquareSDK(launchOptions, APP_ID);

  return YES;
}

@end
