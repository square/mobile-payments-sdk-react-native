import { useNavigation } from '@react-navigation/native';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  SafeAreaView,
  Alert,
  Platform,
  PermissionsAndroid,
} from 'react-native';
import { useEffect, useState } from 'react';
import * as Location from 'expo-location';
import { requestPermissionsAsync as requestMicrophonePermissionsAsync, getPermissionsAsync as getMicrophonePermissionsAsync } from 'expo-av';
import { BleManager } from 'react-native-ble-plx';

import DismissButton from '../components/DismissButton';
import PermissionRow from '../components/PermissionRow';
import LoadingButton from '../components/LoadingButton';
import {
  authorize,
  getAuthorizedLocation,
  getAuthorizationState,
  deauthorize,
  AuthorizationState,
  observeAuthorizationChanges,
  stopObservingAuthorizationChanges,
} from 'mobile-payments-sdk-react-native';

const ACCESS_TOKEN = 'REPLACE ME!';
const LOCATION_ID = 'REPLACE ME';
const bleManager = new BleManager();

const requestBluetooth = async () => {
  if (Platform.OS === 'android') {
    try {
      const grantedScan = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.BLUETOOTH_SCAN,
        {
          title: 'Bluetooth Scan Permission',
          message: 'We need access to scan for Bluetooth devices.',
          buttonPositive: 'OK',
        }
      );
      const grantedConnect = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.BLUETOOTH_CONNECT,
        {
          title: 'Bluetooth Connect Permission',
          message: 'We need access to connect to Bluetooth devices.',
          buttonPositive: 'OK',
        }
      );
      console.log('Bluetooth permissions:', grantedScan, grantedConnect);
    } catch (err) {
      console.warn('Bluetooth permission error:', err);
    }
  } else {
    console.log('Bluetooth permission assumed granted on iOS');
  }
};

const requestLocation = async () => {
  try {
    const { status } = await Location.requestForegroundPermissionsAsync();
    console.log('Location permission status:', status);
  } catch (error) {
    console.log('Location permission error:', error);
  }
};

const requestMicrophone = async () => {
  try {
    const { status } = await requestMicrophonePermissionsAsync();
    console.log('Microphone permission status:', status);
  } catch (error) {
    console.log('Microphone permission error:', error);
  }
};

const requestReadPhoneState = async () => {
  if (Platform.OS === 'android') {
    console.log('Simulating READ_PHONE_STATE permission granted');
  }
};

const checkPermissions = async (
  setMicPermission,
  setLocationPermission,
  setBluetoothPermission,
  setReadPhoneStateGranted
) => {
  try {
    const mic = await getMicrophonePermissionsAsync();
    const loc = await Location.getForegroundPermissionsAsync();
    setMicPermission(mic.status === 'granted');
    setLocationPermission(loc.status === 'granted');

    if (Platform.OS === 'android') {
      const scan = await PermissionsAndroid.check(PermissionsAndroid.PERMISSIONS.BLUETOOTH_SCAN);
      const connect = await PermissionsAndroid.check(PermissionsAndroid.PERMISSIONS.BLUETOOTH_CONNECT);
      setBluetoothPermission(scan && connect);
      setReadPhoneStateGranted(true); // Simulated
    } else {
      setBluetoothPermission(true); // assumed granted on iOS
      setReadPhoneStateGranted(true);
    }
  } catch (e) {
    console.log('Permission check failed:', e);
  }
};

const observeAuthChanges = (setIsAuthorized) => {
  observeAuthorizationChanges((newStatus) => {
    if (newStatus === AuthorizationState.NOT_AUTHORIZED) {
      setIsAuthorized(false);
    }
  });
};

const PermissionsView = () => {
  const isIos = Platform.OS === 'ios';
  const [microphonePermissionGranted, setMicrophonePermissionGranted] = useState(false);
  const [locationPermissionGranted, setLocationPermissionGranted] = useState(false);
  const [bluetoothPermissionGranted, setBluetoothPermissionGranted] = useState(false);
  const [readPhoneStateGranted, setReadPhoneStateGranted] = useState(isIos);
  const [isLoading, setIsLoading] = useState(false);
  const [isAuthorized, setIsAuthorized] = useState(false);
  const navigation = useNavigation();

  const handleAuthorize = async () => {
    setIsLoading(true);
    try {
      const auth = await authorize(ACCESS_TOKEN, LOCATION_ID);
      const authorizedLocation = await getAuthorizedLocation();
      const authorizationState = await getAuthorizationState();
      setIsAuthorized(true);
      console.log('Authorized with location:', authorizedLocation);
      console.log('Authorization State:', authorizationState);
    } catch (error) {
      setIsAuthorized(false);
      console.log('Authorization error:', JSON.stringify(error));
      Alert.alert('Error Authenticating', error.message);
    }
    setIsLoading(false);
  };

  const handleDeauthorize = async () => {
    await deauthorize();
    setIsAuthorized(false);
    console.log('Deauthorized successfully');
  };

  useEffect(() => {
    const fetchAuthorizationState = async () => {
      const state = await getAuthorizationState();
      setIsAuthorized(state === AuthorizationState.AUTHORIZED);
    };

    fetchAuthorizationState();
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

export default PermissionsView;
