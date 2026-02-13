import { useNavigation } from '@react-navigation/native';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  Alert,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import DismissButton from '../components/DismissButton';
import PermissionRow from '../components/PermissionRow';
import {
  authorize,
  getAuthorizedLocation,
  getAuthorizationState,
  deauthorize,
  AuthorizationState,
  observeAuthorizationChanges,
  stopObservingAuthorizationChanges,
} from 'mobile-payments-sdk-react-native';
import { useEffect, useState } from 'react';
import {
  checkMultiple,
  PERMISSIONS,
  request,
  requestMultiple,
  RESULTS,
} from 'react-native-permissions';
import LoadingButton from '../components/LoadingButton';
import BuildConfig from 'react-native-build-config';

export const requestBluetooth = () => {
  requestMultiple(
    Platform.select({
      android: [
        PERMISSIONS.ANDROID.BLUETOOTH_CONNECT,
        PERMISSIONS.ANDROID.BLUETOOTH_SCAN,
      ],
      ios: [PERMISSIONS.IOS.BLUETOOTH_PERIPHERAL],
      default: [],
    })
  ).then((statuses) => {
    console.log(statuses);
  });
};

const requestLocation = () => {
  request(
    Platform.select({
      android: PERMISSIONS.ANDROID.ACCESS_FINE_LOCATION,
      ios: PERMISSIONS.IOS.LOCATION_WHEN_IN_USE,
    })
  ).then((status) => {
    console.log(status);
  });
};

const requestMicrophone = () => {
  request(
    Platform.select({
      android: PERMISSIONS.ANDROID.RECORD_AUDIO,
      ios: PERMISSIONS.IOS.MICROPHONE,
    })
  ).then((status) => {
    console.log(status);
  });
};

const requestReadPhoneState = () => {
  request(
    Platform.select({
      android: PERMISSIONS.ANDROID.READ_PHONE_STATE,
      ios: undefined,
    })
  ).then((status) => {
    console.log(status);
  });
};

const checkPermissions = (
  setMicPermission,
  setLocationPermission,
  setBluetoothPermission,
  setReadPhoneStateGranted
) => {
  const permissions = Platform.select({
    android: [
      PERMISSIONS.ANDROID.BLUETOOTH_CONNECT,
      PERMISSIONS.ANDROID.BLUETOOTH_SCAN,
      PERMISSIONS.ANDROID.ACCESS_FINE_LOCATION,
      PERMISSIONS.ANDROID.RECORD_AUDIO,
      PERMISSIONS.ANDROID.READ_PHONE_STATE,
    ],
    ios: [
      PERMISSIONS.IOS.BLUETOOTH_PERIPHERAL,
      PERMISSIONS.IOS.LOCATION_WHEN_IN_USE,
      PERMISSIONS.IOS.LOCATION_ALWAYS,
      PERMISSIONS.IOS.MICROPHONE,
    ],
  });
  checkMultiple(permissions).then((statuses) => {
    if (
      statuses[PERMISSIONS.ANDROID.RECORD_AUDIO] === RESULTS.GRANTED ||
      statuses[PERMISSIONS.IOS.MICROPHONE] === RESULTS.GRANTED
    ) {
      setMicPermission(true);
    }
    if (
      statuses[PERMISSIONS.ANDROID.ACCESS_FINE_LOCATION] === RESULTS.GRANTED ||
      statuses[PERMISSIONS.IOS.LOCATION_WHEN_IN_USE] === RESULTS.GRANTED ||
      statuses[PERMISSIONS.IOS.LOCATION_ALWAYS] === RESULTS.GRANTED
    ) {
      setLocationPermission(true);
    }
    if (
      (statuses[PERMISSIONS.ANDROID.BLUETOOTH_SCAN] === RESULTS.GRANTED &&
        statuses[PERMISSIONS.ANDROID.BLUETOOTH_CONNECT] === RESULTS.GRANTED) ||
      statuses[PERMISSIONS.IOS.BLUETOOTH_PERIPHERAL] === RESULTS.GRANTED
    ) {
      setBluetoothPermission(true);
    }
    if (
      statuses[PERMISSIONS.ANDROID.READ_PHONE_STATE] === RESULTS.GRANTED ||
      Platform.OS === 'ios' // This permission is not available on iOS
    ) {
      setReadPhoneStateGranted(true);
    }
  });
};

const observeAuthChanges = async (setIsAuthorized) => {
  observeAuthorizationChanges((newStatus) => {
    if (newStatus === AuthorizationState.NOT_AUTHORIZED) {
      // You can handle deauthorization here calling, for instance, your own authorization method.
      setIsAuthorized(false);
    }
  });
};

const PermissionsView = () => {
  const isIos = Platform.OS === 'ios';
  const [microphonePermissionGranted, setMicrophonePermissionGranted] =
    useState(false);
  const [locationPermissionGranted, setLocationPermissionGranted] =
    useState(false);
  const [bluetoothPermissionGranted, setBluetoothPermissionGranted] =
    useState(false);
  const [readPhoneStateGranted, setReadPhoneStateGranted] = useState(isIos);
  const [isLoading, setIsLoading] = useState(false);
  const [isAuthorized, setIsAuthorized] = useState(false);
  const navigation = useNavigation();

  const handleAuthorize = async () => {
    setIsLoading(true);
    try {
      // Add your own access token and location ID from developer.squareup.com
      let auth = await authorize(
        BuildConfig.ACCESS_TOKEN,
        BuildConfig.LOCATION_ID
      );
      console.log(auth);
      let authorizedLocation = await getAuthorizedLocation();
      let authorizationState = await getAuthorizationState();
      setIsAuthorized(true);
      console.log(
        'SDK Authorized with location ' + JSON.stringify(authorizedLocation)
      );
      console.log(
        'SDK Authorization Status is ' + JSON.stringify(authorizationState)
      );
    } catch (error) {
      setIsAuthorized(false);
      console.log('Authorization error: ', JSON.stringify(error));
      Alert.alert('Error Authenticating', error.message);
    }
    setIsLoading(false);
  };

  const handleDeauthorize = async () => {
    await deauthorize();
    console.log('Deauthorization successful. The app is no longer authorized.');
  };

  useEffect(() => {
    // First we fetch the current Authorization state to set the button to the correct state
    const fetchAuthorizationState = async () => {
      let authorizationState = await getAuthorizationState();
      console.log('is authorized is currently ' + authorizationState);
      if (authorizationState === AuthorizationState.AUTHORIZED) {
        setIsAuthorized(true);
      } else if (authorizationState === AuthorizationState.NOT_AUTHORIZED) {
        setIsAuthorized(false);
      }
    };
    fetchAuthorizationState();
    // It's recommended you observe authorization changes while using the SDK
    observeAuthChanges(setIsAuthorized);
    checkPermissions(
      setMicrophonePermissionGranted,
      setLocationPermissionGranted,
      setBluetoothPermissionGranted,
      setReadPhoneStateGranted
    );
    return () => {
      // Remember to remove your observer once the component has been removed from the DOM
      stopObservingAuthorizationChanges();
    };
  }, []);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <DismissButton onDismiss={() => navigation.goBack()} />
        <Text style={styles.headerTitle}>Permissions</Text>
      </View>
      <ScrollView contentContainerStyle={styles.scrollView}>
        <PermissionRow
          title={STRINGS.bluetoothTitle}
          description={STRINGS.bluetoothDescription}
          isGranted={bluetoothPermissionGranted}
          onRequest={requestBluetooth}
        />
        <PermissionRow
          title={STRINGS.locationTitle}
          description={STRINGS.locationDescription}
          isGranted={locationPermissionGranted}
          onRequest={requestLocation}
        />
        <PermissionRow
          title={STRINGS.microphoneTitle}
          description={STRINGS.microphoneDescription}
          isGranted={microphonePermissionGranted}
          onRequest={requestMicrophone}
        />
        {Platform.OS === 'android' && (
          <PermissionRow
            title={STRINGS.readPhoneStateTitle}
            description={STRINGS.readPhoneStateDescription}
            isGranted={readPhoneStateGranted}
            onRequest={requestReadPhoneState}
          />
        )}
        <LoadingButton
          isLoading={isLoading}
          isActive={!isAuthorized}
          handleOnPress={isAuthorized ? handleDeauthorize : handleAuthorize}
          activeLabel="Sign in"
          inactiveLabel="Sign out"
        />
        <Text
          style={isAuthorized ? styles.statusText : styles.statusTextInactive}
        >
          {isAuthorized ? 'This device is Authorized' : 'Device not Authorized'}
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
    padding: 16,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    justifyContent: 'center',
    flex: 1,
    textAlign: 'center',
  },
  scrollView: {
    paddingTop: 16,
    paddingLeft: 16,
    paddingRight: 16,
  },
  statusText: {
    fontSize: 14,
    color: '#007D2A',
    fontWeight: 'bold',
  },
  statusTextInactive: {
    fontSize: 14,
    color: '#945C25',
    fontWeight: 'bold',
  },
});

const STRINGS = {
  bluetoothTitle: 'Bluetooth',
  bluetoothDescription:
    'Square uses Bluetooth to connect and communicate with Square devices. \nYou should ask for this permission if you are using readers that connect via Bluetooth.',
  locationTitle: 'Location',
  locationDescription:
    'Square uses location to know where transactions take place. This reduces risk and minimizes payment disputes.',
  microphoneTitle: 'Microphone',
  microphoneDescription:
    'Square Reader for magstripe uses the microphone to communicate payment card data to your device. You should ask for this permission if you are using a magstripe reader.',
  readPhoneStateTitle: 'Read Phone State',
  readPhoneStateDescription:
    'Square needs phone access in order to uniquely identify the devices associated with your account and ensure that unauthorized devices are not able to act on your behalf.',
};

export default PermissionsView;
