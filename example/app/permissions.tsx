import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  SafeAreaView,
  Alert,
  Platform,
} from 'react-native';
import { useRouter } from 'expo-router';
import DismissButton from './components/DismissButton';
import PermissionRow from './components/PermissionRow';
import LoadingButton from './components/LoadingButton';
import {
  authorize,
  getAuthorizedLocation,
  getAuthorizationState,
  deauthorize,
  AuthorizationState,
  observeAuthorizationChanges,
  stopObservingAuthorizationChanges,
} from 'mobile-payments-sdk-react-native';
import {
  checkMultiple,
  PERMISSIONS,
  request,
  requestMultiple,
  RESULTS,
} from 'react-native-permissions';
import { useEffect, useState } from 'react';

const ACCESS_TOKEN = 'your-access-token'; // Replace or load from env
const LOCATION_ID = 'your-location-id';   // Replace or load from env

export const requestBluetooth = () => {
  requestMultiple(
    Platform.select({
      android: [
        PERMISSIONS.ANDROID.BLUETOOTH_CONNECT,
        PERMISSIONS.ANDROID.BLUETOOTH_SCAN,
      ],
      ios: [PERMISSIONS.IOS.BLUETOOTH_PERIPHERAL],
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
      Platform.OS === 'ios'
    ) {
      setReadPhoneStateGranted(true);
    }
  });
};

const observeAuthChanges = async (setIsAuthorized) => {
  observeAuthorizationChanges((newStatus) => {
    if (newStatus === AuthorizationState.NOT_AUTHORIZED) {
      setIsAuthorized(false);
    }
  });
};

const PermissionsView = () => {
  const isIos = Platform.OS === 'ios';
  const router = useRouter();
  const [microphonePermissionGranted, setMicrophonePermissionGranted] =
    useState(false);
  const [locationPermissionGranted, setLocationPermissionGranted] =
    useState(false);
  const [bluetoothPermissionGranted, setBluetoothPermissionGranted] =
    useState(false);
  const [readPhoneStateGranted, setReadPhoneStateGranted] = useState(isIos);
  const [isLoading, setIsLoading] = useState(false);
  const [isAuthorized, setIsAuthorized] = useState(false);

  const handleAuthorize = async () => {
    setIsLoading(true);
    try {
      const auth = await authorize(ACCESS_TOKEN, LOCATION_ID);
      const authorizedLocation = await getAuthorizedLocation();
      const authorizationState = await getAuthorizationState();
      setIsAuthorized(true);
      console.log('SDK Authorized:', authorizedLocation, authorizationState);
    } catch (error) {
      setIsAuthorized(false);
      console.error('Authorization error:', error);
      Alert.alert('Error Authenticating', error.message);
    }
    setIsLoading(false);
  };

  const handleDeauthorize = async () => {
    await deauthorize();
    console.log('SDK Deauthorized');
    setIsAuthorized(false);
  };

  useEffect(() => {
    const init = async () => {
      const state = await getAuthorizationState();
      setIsAuthorized(state === AuthorizationState.AUTHORIZED);
    };
    init();
    observeAuthChanges(setIsAuthorized);
    checkPermissions(
      setMicrophonePermissionGranted,
      setLocationPermissionGranted,
      setBluetoothPermissionGranted,
      setReadPhoneStateGranted
    );
    return () => {
      stopObservingAuthorizationChanges();
    };
  }, []);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <DismissButton onDismiss={() => router.back()} />
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
        {!isIos && (
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

const STRINGS = {
  bluetoothTitle: 'Bluetooth',
  bluetoothDescription:
    'Used to connect and communicate with Square devices via Bluetooth.',
  locationTitle: 'Location',
  locationDescription:
    'Used to verify transaction locations and reduce disputes.',
  microphoneTitle: 'Microphone',
  microphoneDescription:
    'Used to capture card data with magstripe readers.',
  readPhoneStateTitle: 'Read Phone State',
  readPhoneStateDescription:
    'Used to uniquely identify the device for security.',
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
    flex: 1,
    textAlign: 'center',
  },
  scrollView: {
    paddingTop: 16,
    paddingHorizontal: 16,
  },
  statusText: {
    fontSize: 14,
    color: '#007D2A',
    fontWeight: 'bold',
    textAlign: 'center',
    marginTop: 16,
  },
  statusTextInactive: {
    fontSize: 14,
    color: '#945C25',
    fontWeight: 'bold',
    textAlign: 'center',
    marginTop: 16,
  },
});

export default PermissionsView;
