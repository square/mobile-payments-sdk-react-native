const {
  withProjectBuildGradle,
  withMainApplication,
  withAndroidManifest,
  withAppBuildGradle,
  withAppDelegate,
  withInfoPlist,
  createRunOncePlugin,
  withGradleProperties,
} = require('@expo/config-plugins');

const pkg = require('./package.json');

const SQUARE_ANDROID_PERMISSIONS = [
  'android.permission.ACCESS_FINE_LOCATION',
  'android.permission.RECORD_AUDIO',
  'android.permission.BLUETOOTH_CONNECT',
  'android.permission.BLUETOOTH_SCAN',
  'android.permission.READ_PHONE_STATE',
];

const SQUARE_ACCESSORY_PROTOCOLS = [
  'com.squareup.protocol.stand',
  'com.squareup.s089',
  'com.squareup.s025',
  'com.squareup.s020',
];

const withSquareMavenRepository = (config) => {
  return withProjectBuildGradle(config, (config) => {
    if (config.modResults.language === 'groovy') {
      const buildGradle = config.modResults.contents;
      const mavenUrl = 'maven { url("https://sdk.squareup.com/public/android/") }';
      const kotlinArgs = `
    tasks.withType(org.jetbrains.kotlin.gradle.tasks.KotlinCompile).configureEach {
        compilerOptions {
            freeCompilerArgs.add("-Xskip-metadata-version-check")
        }
    }`;

      let newContents = buildGradle;

      if (!newContents.includes('sdk.squareup.com/public/android')) {
        newContents = newContents.replace(
          /allprojects\s*\{\s*repositories\s*\{/,
          `allprojects {\n    repositories {\n      ${mavenUrl}`
        );
      }

      if (!newContents.includes('-Xskip-metadata-version-check')) {
        newContents = newContents.replace(
          /allprojects\s*\{/,
          `allprojects {${kotlinArgs}`
        );
      }

      config.modResults.contents = newContents;
    }
    return config;
  });
};

const withSquareMainApplication = (config, { applicationId }) => {
  return withMainApplication(config, (config) => {
    if (config.modResults.language === 'kt') {
      let contents = config.modResults.contents;
      const importStatement = 'import com.squareup.sdk.mobilepayments.MobilePaymentsSdk';

      if (!contents.includes(importStatement)) {
        contents = contents.replace(
          /package [\w.]+/,
          `$&\n\n${importStatement}`
        );
      }

      const initStatement = `MobilePaymentsSdk.initialize("${applicationId}", this)`;

      if (!contents.includes('MobilePaymentsSdk.initialize')) {
        contents = contents.replace(
          /super\.onCreate\(\)/,
          `$&\n    ${initStatement}`
        );
      }

      config.modResults.contents = contents;
    }
    return config;
  });
};

const withSquareAndroidPermissions = (config) => {
  return withAndroidManifest(config, (config) => {
    const manifest = config.modResults.manifest;

    if (!manifest['uses-permission']) {
      manifest['uses-permission'] = [];
    }

    for (const permission of SQUARE_ANDROID_PERMISSIONS) {
      const alreadyPresent = manifest['uses-permission'].some(
        (p) => p.$?.['android:name'] === permission
      );
      if (!alreadyPresent) {
        manifest['uses-permission'].push({ $: { 'android:name': permission } });
      }
    }

    return config;
  });
};

const withSquareIosPlist = (config, { applicationId, accessToken, locationId }) => {
  return withInfoPlist(config, (config) => {
    const plist = config.modResults;

    if (!plist.UISupportedExternalAccessoryProtocols) {
      plist.UISupportedExternalAccessoryProtocols = [];
    }
    for (const protocol of SQUARE_ACCESSORY_PROTOCOLS) {
      if (!plist.UISupportedExternalAccessoryProtocols.includes(protocol)) {
        plist.UISupportedExternalAccessoryProtocols.push(protocol);
      }
    }

    plist.NSBluetoothAlwaysUsageDescription =
      plist.NSBluetoothAlwaysUsageDescription ||
      'This app requires access to Bluetooth for device connectivity.';
    plist.NSBluetoothPeripheralUsageDescription =
      plist.NSBluetoothPeripheralUsageDescription ||
      'This app requires access to Bluetooth for device connectivity.';
    plist.NSLocationWhenInUseUsageDescription =
      plist.NSLocationWhenInUseUsageDescription ||
      'This app requires access to your location to confirm payments.';
    plist.NSLocationAlwaysAndWhenInUseUsageDescription =
      plist.NSLocationAlwaysAndWhenInUseUsageDescription ||
      'This app requires access to your location to confirm payments.';
    plist.NSMicrophoneUsageDescription =
      plist.NSMicrophoneUsageDescription ||
      'This app requires access to your microphone to receive data from magstripe readers.';
    plist.NSPhoneUsageDescription =
      plist.NSPhoneUsageDescription ||
      'This app requires access to your phone state to identify your device.';

    if (!plist.UIAppFonts) {
      plist.UIAppFonts = [];
    }
    if (!plist.UIAppFonts.includes('Feather.ttf')) {
      plist.UIAppFonts.push('Feather.ttf');
    }

    if (applicationId) plist.APP_ID = applicationId;
    if (accessToken) plist.ACCESS_TOKEN = accessToken;
    if (locationId) plist.LOCATION_ID = locationId;

    return config;
  });
};

const withSquareAppDelegate = (config) => {
  return withAppDelegate(config, (config) => {
    let contents = config.modResults.contents;

    const initCall = 'MPRNInitializeSquareSDK(launchOptions, [[NSBundle mainBundle] objectForInfoDictionaryKey:@"APP_ID"])';

    if (!contents.includes('MPRNInitializeSquareSDK')) {
      contents = contents.replace(
        /didFinishLaunchingWithOptions[^{]*\{/,
        `$&\n  ${initCall};`
      );
    }

    config.modResults.contents = contents;
    return config;
  });
};

const withSquareAppBuildGradle = (config, { accessToken, locationId }) => {
  return withAppBuildGradle(config, (config) => {
    if (config.modResults.language === 'groovy') {
      let contents = config.modResults.contents;
      const mpsdkDep = 'implementation("com.squareup.sdk:mobile-payments-sdk:2.5.0")';
      const vectorIconsFonts = 'apply from: new File(["node", "--print", "require.resolve(\'react-native-vector-icons/package.json\')"].execute(null, rootDir).text.trim()).getParentFile().absolutePath + "/fonts.gradle"';

      if (accessToken && locationId) {
        const accessTokenField = `buildConfigField "String", "ACCESS_TOKEN", "\\"${accessToken}\\""`;
        const locationIdField = `buildConfigField "String", "LOCATION_ID", "\\"${locationId}\\""`;

        if (!contents.includes('buildConfigField "String", "ACCESS_TOKEN"')) {
          contents = contents.replace(
            /defaultConfig\s*\{/,
            `defaultConfig {\n        ${accessTokenField}\n        ${locationIdField}`
          );
        }
      }

      if (!contents.includes('mobile-payments-sdk')) {
        contents = contents.replace(
          /dependencies\s*\{/,
          `dependencies {\n    ${mpsdkDep}`
        );
      }

      if (!contents.includes('react-native-vector-icons') && !contents.includes('fonts.gradle')) {
        contents += `\n${vectorIconsFonts}\n`;
      }

      config.modResults.contents = contents;
    }
    return config;
  });
};

const withSquarePackagingOptions = (config) => {
  return withGradleProperties(config, (config) => {
    const key = 'android.packagingOptions.pickFirsts';
    const val = 'META-INF/versions/9/OSGI-INF/MANIFEST.MF';
    const index = config.modResults.findIndex(item => item.key === key);

    if (index > -1) {
      if (!config.modResults[index].value.includes(val)) {
        config.modResults[index].value += `,${val}`;
      }
    } else {
      config.modResults.push({ type: 'property', key, value: val });
    }

    return config;
  });
};

const withSquareMobilePayments = (config, options) => {
  if (!options || !options.applicationId) {
    throw new Error("You must provide an 'applicationId' for the Mobile Payments SDK plugin in app.json");
  }

  config = withSquareAppBuildGradle(config, options);
  config = withSquareMavenRepository(config);
  config = withSquareMainApplication(config, options);
  config = withSquareAndroidPermissions(config);
  config = withSquareAppDelegate(config);
  config = withSquareIosPlist(config, options);
  config = withSquarePackagingOptions(config);

  return config;
};

module.exports = createRunOncePlugin(
  withSquareMobilePayments,
  pkg.name,
  pkg.version
);
