const {
  withProjectBuildGradle,
  withMainApplication,
  withAndroidManifest,
  withAppBuildGradle,
  withAppDelegate,
  withInfoPlist,
  createRunOncePlugin,
  withGradleProperties,
  withDangerousMod,
} = require('@expo/config-plugins');
const fs = require('fs');
const path = require('path');

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
  return withProjectBuildGradle(config, (modConfig) => {
    if (modConfig.modResults.language === 'groovy') {
      const buildGradle = modConfig.modResults.contents;
      const mavenUrl =
        'maven { url("https://sdk.squareup.com/public/android/") }';
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

      modConfig.modResults.contents = newContents;
    }
    return modConfig;
  });
};

const withSquareMainApplication = (config, { applicationId }) => {
  return withMainApplication(config, (modConfig) => {
    if (modConfig.modResults.language === 'kt') {
      let contents = modConfig.modResults.contents;
      const importStatement =
        'import com.squareup.sdk.mobilepayments.MobilePaymentsSdk';

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

      modConfig.modResults.contents = contents;
    }
    return modConfig;
  });
};

const withSquareAndroidPermissions = (config) => {
  return withAndroidManifest(config, (modConfig) => {
    const manifest = modConfig.modResults.manifest;

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

    return modConfig;
  });
};

const withSquareIosPlist = (
  config,
  { applicationId, accessToken, locationId }
) => {
  return withInfoPlist(config, (modConfig) => {
    const plist = modConfig.modResults;

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

    return modConfig;
  });
};

const withSquareAppDelegate = (config) => {
  return withAppDelegate(config, (modConfig) => {
    let contents = modConfig.modResults.contents;
    const isSwift =
      modConfig.modResults.language === 'swift' ||
      contents.includes('ExpoAppDelegate');

    if (isSwift) {
      if (!contents.includes('import SquareMobilePaymentsSDK')) {
        contents = contents.replace(
          /import ReactAppDependencyProvider/,
          'import ReactAppDependencyProvider\nimport SquareMobilePaymentsSDK'
        );
      }

      contents = contents.replace(
        /\n\s*MPRNInitializeSquareSDK\(launchOptions, \[\[NSBundle mainBundle\] objectForInfoDictionaryKey:@"APP_ID"\]\);\n?/,
        '\n'
      );

      if (!contents.includes('MobilePaymentsSDK.initialize')) {
        contents = contents.replace(
          /didFinishLaunchingWithOptions[^{]*\{/,
          `$&
    MobilePaymentsSDK.initialize(
      applicationLaunchOptions: launchOptions,
      squareApplicationID: Bundle.main
        .object(forInfoDictionaryKey: "APP_ID") as! String
    )
`
        );
      }
    } else if (!contents.includes('MPRNInitializeSquareSDK')) {
      const initCall =
        'MPRNInitializeSquareSDK(launchOptions, [[NSBundle mainBundle] objectForInfoDictionaryKey:@"APP_ID"])';

      contents = contents.replace(
        /didFinishLaunchingWithOptions[^{]*\{/,
        `$&\n  ${initCall};`
      );
    }

    modConfig.modResults.contents = contents;
    return modConfig;
  });
};

const withSquareAppBuildGradle = (config, { accessToken, locationId }) => {
  return withAppBuildGradle(config, (modConfig) => {
    if (modConfig.modResults.language === 'groovy') {
      let contents = modConfig.modResults.contents;
      const mpsdkDep =
        'implementation("com.squareup.sdk:mobile-payments-sdk:2.5.0")';
      const vectorIconsFonts =
        'apply from: new File(["node", "--print", "require.resolve(\'react-native-vector-icons/package.json\')"].execute(null, rootDir).text.trim()).getParentFile().absolutePath + "/fonts.gradle"';

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

      if (
        !contents.includes('react-native-vector-icons') &&
        !contents.includes('fonts.gradle')
      ) {
        contents += `\n${vectorIconsFonts}\n`;
      }

      modConfig.modResults.contents = contents;
    }
    return modConfig;
  });
};

const withSquarePackagingOptions = (config) => {
  return withGradleProperties(config, (modConfig) => {
    const key = 'android.packagingOptions.pickFirsts';
    const val = 'META-INF/versions/9/OSGI-INF/MANIFEST.MF';
    const index = modConfig.modResults.findIndex((item) => item.key === key);

    if (index > -1) {
      if (!modConfig.modResults[index].value.includes(val)) {
        modConfig.modResults[index].value += `,${val}`;
      }
    } else {
      modConfig.modResults.push({ type: 'property', key, value: val });
    }

    return modConfig;
  });
};

const IOS_PODFILE_SQUARE_SETUP_PATCH = `
def add_square_setup_build_phase(installer)
  phase_name = '[SquareMobilePaymentsSDK] setup'
  script = <<-'SCRIPT'
SETUP_SCRIPT="\${BUILT_PRODUCTS_DIR}/\${FRAMEWORKS_FOLDER_PATH}/SquareMobilePaymentsSDK.framework/setup"
if [ -f "$SETUP_SCRIPT" ]; then
  "$SETUP_SCRIPT"
fi
SCRIPT

  installer.aggregate_targets.each do |aggregate_target|
    user_project = aggregate_target.user_project
    next unless user_project

    user_project.native_targets.each do |native_target|
      next unless native_target.product_type == 'com.apple.product-type.application'

      existing_phase = native_target.shell_script_build_phases.find { |phase| phase.name == phase_name }
      existing_phase&.remove_from_project

      phase = native_target.new_shell_script_build_phase(phase_name)
      phase.shell_script = script
      phase.always_out_of_date = '1'
    end

    user_project.save
  end
end
`;

const IOS_PODFILE_FMT_PATCH = `
def patch_fmt_for_xcode26(installer)
  fmt_base = File.join(installer.sandbox.root, 'fmt', 'include', 'fmt', 'base.h')
  return unless File.exist?(fmt_base)

  content = File.read(fmt_base)
  return if content.include?('Xcode 26 workaround')

  patched = content.gsub(
    /(#elif defined\\(__cpp_consteval\\)\\n#  define FMT_USE_CONSTEVAL) 1/,
    "// Xcode 26 workaround: disable consteval\\n\\\\1 0"
  )

  return if patched == content

  File.chmod(0644, fmt_base)
  File.write(fmt_base, patched)
end
${IOS_PODFILE_SQUARE_SETUP_PATCH}
`;

const withIosPodfileWorkarounds = (config) => {
  return withDangerousMod(config, [
    'ios',
    async (modConfig) => {
      const podfilePath = path.join(
        modConfig.modRequest.platformProjectRoot,
        'Podfile'
      );

      if (!fs.existsSync(podfilePath)) {
        return modConfig;
      }

      let contents = fs.readFileSync(podfilePath, 'utf8');

      if (
        !contents.includes('def patch_fmt_for_xcode26') ||
        !contents.includes('def add_square_setup_build_phase')
      ) {
        if (!contents.includes('def patch_fmt_for_xcode26')) {
          contents = contents.replace(
            'prepare_react_native_project!',
            `${IOS_PODFILE_FMT_PATCH}\nprepare_react_native_project!`
          );
        } else if (!contents.includes('def add_square_setup_build_phase')) {
          contents = contents.replace(
            'prepare_react_native_project!',
            `${IOS_PODFILE_SQUARE_SETUP_PATCH}\nprepare_react_native_project!`
          );
        }
      }

      if (!/^\s+patch_fmt_for_xcode26\(installer\)/m.test(contents)) {
        contents = contents.replace(
          /(\s+)react_native_post_install\(/,
          '$1patch_fmt_for_xcode26(installer)\n\n$1react_native_post_install('
        );
      }

      if (!/^\s+add_square_setup_build_phase\(installer\)/m.test(contents)) {
        contents = contents.replace(
          /(\s+react_native_post_install\(\n[\s\S]*?\n\s+\)\n)/,
          '$1\n    add_square_setup_build_phase(installer)\n'
        );
      }

      fs.writeFileSync(podfilePath, contents);
      return modConfig;
    },
  ]);
};

const withSquareMobilePayments = (config, options) => {
  if (!options || !options.applicationId) {
    throw new Error(
      "You must provide an 'applicationId' for the Mobile Payments SDK plugin in app.json"
    );
  }

  config = withSquareAppBuildGradle(config, options);
  config = withSquareMavenRepository(config);
  config = withSquareMainApplication(config, options);
  config = withSquareAndroidPermissions(config);
  config = withSquareAppDelegate(config);
  config = withSquareIosPlist(config, options);
  config = withSquarePackagingOptions(config);
  config = withIosPodfileWorkarounds(config);

  return config;
};

module.exports = createRunOncePlugin(
  withSquareMobilePayments,
  pkg.name,
  pkg.version
);
