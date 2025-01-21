import { useNavigation } from '@react-navigation/native';
import { View, Text, ScrollView, StyleSheet, SafeAreaView, Alert, Platform } from 'react-native';
import DismissButton from '../components/DismissButton';
import PermissionRow from '../components/PermissionRow';
import { authorize, getAuthorizedLocation, getAuthorizationState, deauthorize, AuthorizationState, observeAuthorizationChanges, stopObservingAuthorizationChanges } from 'mobile-payments-sdk-react-native';
import { useEffect, useState } from 'react';
import { checkMultiple, PERMISSIONS, request, requestMultiple, RESULTS } from 'react-native-permissions';
import LoadingButton from '../components/LoadingButton';

export const requestBluetooth = () => {
  requestMultiple(
    Platform.select({
      android: [PERMISSIONS.ANDROID.BLUETOOTH_CONNECT,
      PERMISSIONS.ANDROID.BLUETOOTH_SCAN],
      ios: [PERMISSIONS.IOS.BLUETOOTH_PERIPHERAL]
    })).then((statuses) => {
      console.log(statuses);
    });
};

const requestLocation = () => {
  request(
    Platform.select({
      android: PERMISSIONS.ANDROID.ACCESS_FINE_LOCATION,
      ios: PERMISSIONS.IOS.LOCATION_WHEN_IN_USE
    })
  ).then((status) => {
    console.log(status)
  });
};

const requestMicrophone = () => {
  request(
    Platform.select({
      android: PERMISSIONS.ANDROID.RECORD_AUDIO,
      ios: PERMISSIONS.IOS.MICROPHONE
    })
  ).then((status) => {
    console.log(status)
  });
};

const checkPermissions = (setMicPermission, setLocationPermission, setBluetoothPermission) => {
  const permissions = Platform.select({
    android: [PERMISSIONS.ANDROID.BLUETOOTH_CONNECT,
      PERMISSIONS.ANDROID.BLUETOOTH_SCAN,
      PERMISSIONS.ANDROID.ACCESS_FINE_LOCATION,
      PERMISSIONS.ANDROID.RECORD_AUDIO],
    ios: [PERMISSIONS.IOS.BLUETOOTH_PERIPHERAL,
      PERMISSIONS.IOS.LOCATION_WHEN_IN_USE,
      PERMISSIONS.IOS.LOCATION_ALWAYS,
      PERMISSIONS.IOS.MICROPHONE]
  })
  checkMultiple(permissions).then((statuses) => {
    if (statuses[PERMISSIONS.ANDROID.RECORD_AUDIO] === RESULTS.GRANTED
      || statuses[PERMISSIONS.IOS.MICROPHONE] === RESULTS.GRANTED) {
      setMicPermission(true)
    }
    if (statuses[PERMISSIONS.ANDROID.ACCESS_FINE_LOCATION] === RESULTS.GRANTED
      || statuses[PERMISSIONS.IOS.LOCATION_WHEN_IN_USE] === RESULTS.GRANTED
      || statuses[PERMISSIONS.IOS.LOCATION_ALWAYS] === RESULTS.GRANTED) {
      setLocationPermission(true)
    }
    if ((statuses[PERMISSIONS.ANDROID.BLUETOOTH_SCAN] === RESULTS.GRANTED
        && statuses[PERMISSIONS.ANDROID.BLUETOOTH_CONNECT] === RESULTS.GRANTED)
      || statuses[PERMISSIONS.IOS.BLUETOOTH_PERIPHERAL] === RESULTS.GRANTED) {
      setBluetoothPermission(true)
    }
  });
};



const observeAuthChanges = async () => {
  observeAuthorizationChanges((newStatus) => {
    if (newStatus === AuthorizationState.NOT_AUTHORIZED) {
      // You can handle deauthorization here calling, for instance, your own authorization method.
    }
  });
}

const PermissionsView = () => {
  const [microphonePermissionGranted, setMicrophonePermissionGranted] = useState(false);
  const [locationPermissionGranted, setLocationPermissionGranted] = useState(false);
  const [bluetoothPermissionGranted, setBluetoothPermissionGranted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isAuthorized, setIsAuthorized] = useState(false);
  const navigation = useNavigation();


  const handleAuthorize = async () => {
    setIsLoading(true);
    try {
      // Add your own access token and location ID from developer.squareup.com
      let auth = await authorize(
        'MOBILE_PAYMENT_SDK_ACCESS_TOKEN',
        'MOBILE_PAYMENT_SDK_LOCATION_ID'
      );
      let authorizedLocation = await getAuthorizedLocation();
      let authorizationState = await getAuthorizationState();
      setIsAuthorized(true);
      console.log('SDK Authorized with location ' + JSON.stringify(authorizedLocation));
      console.log('SDK Authorization Status is ' + JSON.stringify(authorizationState));
    } catch (error) {
      setIsAuthorized(false);
      Alert.alert('Error Authenticating', error.message)
    }
    setIsLoading(false);
  };

  const handleDeauthorize = async () => {
    await deauthorize();
    setIsAuthorized(false);
    console.log('Deauthorization successful. The app is no longer authorized.');
  }

  useEffect(() => {
    // First we fetch the current Authorization state to set the button to the correct state
    const fetchAuthorizationState = async () => {
      let authorizationState = await getAuthorizationState();
      console.log('is authorized is currently ' + authorizationState)
      if (authorizationState === AuthorizationState.AUTHORIZED) {
        setIsAuthorized(true);
      }
    }
    fetchAuthorizationState();
    // It's recommended you observe authorization changes while using the SDK
    observeAuthChanges();
    checkPermissions(setMicrophonePermissionGranted, setLocationPermissionGranted, setBluetoothPermissionGranted);
    return () => {
      // Remember to remove your observer once the component has been removed from the DOM
      stopObservingAuthorizationChanges();
    };
  });

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <DismissButton
          onDismiss={() => navigation.goBack()} />
        <Text style={styles.headerTitle}>Permissions</Text>
      </View>
      <ScrollView contentContainerStyle={styles.scrollView}>
        <PermissionRow
          title={STRINGS.bluetoothTitle}
          description={STRINGS.bluetoothDescription}
          isGranted={bluetoothPermissionGranted}
          onRequest={requestBluetooth} />
        <PermissionRow
          title={STRINGS.locationTitle}
          description={STRINGS.locationDescription}
          isGranted={locationPermissionGranted}
          onRequest={requestLocation} />
        <PermissionRow
          title={STRINGS.microphoneTitle}
          description={STRINGS.microphoneDescription}
          isGranted={microphonePermissionGranted}
          onRequest={requestMicrophone} />
        <LoadingButton
          isLoading={isLoading}
          isActive={!isAuthorized}
          handleOnPress={isAuthorized ? handleDeauthorize : handleAuthorize}
          activeLabel='Authorize'
          inactiveLabel='Deauthorize'
          />
        <Text style={styles.statusText}>{isAuthorized ? 'Authorized' : 'Not Authorized'}</Text>
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
    color: '#333',
  },
});

const STRINGS = {
  bluetoothTitle: 'Bluetooth',
  bluetoothDescription: 'Square uses Bluetooth to connect and communicate with Square devices. \nYou should ask for this permission if you are using readers that connect via Bluetooth.',
  locationTitle: 'Location',
  locationDescription: 'Square uses location to know where transactions take place. This reduces risk and minimizes payment disputes.',
  microphoneTitle: 'Microphone',
  microphoneDescription: 'Square Reader for magstripe uses the microphone to communicate payment card data to your device. You should ask for this permission if you are using a magstripe reader.',
}

export default PermissionsView;
