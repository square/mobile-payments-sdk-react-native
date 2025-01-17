import { useState, useEffect } from 'react';
import {
  StyleSheet,
  View,
  Animated,
  Easing,
  Dimensions,
  Platform,
  Alert,
} from 'react-native';
import SquareLogo from '../components/SquareLogo';
import { backgroundColor } from '../styles/common';
import { PermissionsAndroid } from 'react-native';
import { PERMISSIONS, request } from 'react-native-permissions';
import {
  authorize,
  observeAuthorizationChanges,
  AuthorizationState,
  stopObservingAuthorizationChanges,
  deauthorize,
  getAuthorizedLocation,
  getAuthorizationState,
} from 'mobile-payments-sdk-react-native';

export default function SplashScreen({ navigation }) {
  const [logoTranslateY] = useState(new Animated.Value(0));

  const requestPermissions = async () => {
    try {
      let permissionsRequired = false;
      if (Platform.OS === 'ios') {
        const bluetoothPermission = await request(
          PERMISSIONS.IOS.BLUETOOTH_PERIPHERAL
        );
        const locationPermission = await request(
          PERMISSIONS.IOS.LOCATION_WHEN_IN_USE
        );
        const microphonePermission = await request(PERMISSIONS.IOS.MICROPHONE);

        if (
          bluetoothPermission !== 'granted' ||
          locationPermission !== 'granted' ||
          microphonePermission !== 'granted'
        ) {
          permissionsRequired = true;
        }
      } else if (Platform.OS === 'android') {
        const permissions = [
          PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
          PermissionsAndroid.PERMISSIONS.RECORD_AUDIO,
          PermissionsAndroid.PERMISSIONS.BLUETOOTH_CONNECT,
          PermissionsAndroid.PERMISSIONS.BLUETOOTH_SCAN,
          PermissionsAndroid.PERMISSIONS.READ_PHONE_STATE,
        ];

        const granted = await PermissionsAndroid.requestMultiple(
          permissions.filter((permission) => permission !== undefined)
        );

        const allGranted = Object.values(granted).every(
          (status) => status === PermissionsAndroid.RESULTS.GRANTED
        );

        if (!allGranted) {
          permissionsRequired = true;
        }
      }
      if (permissionsRequired) {
        Alert.alert(
          'Permissions required',
          'This app requires additional permissions.'
        );
      }
    } catch (error) {
      console.error(error);
    }
  };

  const authorizeSDK = async () => {
    try {
      let state = await getAuthorizationState();
      if (state === 'NOT_AUTHORIZED') {
        // Add your own access token and location ID from developer.squareup.com
        await authorize(
          '-->> replace with your authentication token <<--',
          '-->> replace with your location id <<--'
        );
      }
      let authorizedLocation = await getAuthorizedLocation();
      let authorizationStatus = await getAuthorizationState();
      console.log(
        'SDK Authorized with location ' + JSON.stringify(authorizedLocation)
      );
      console.log(
        'SDK Authorization Status is ' + JSON.stringify(authorizationStatus)
      );
    } catch (error) {
      Alert.alert('Error Authenticating', (error as Error).message);
    }
  };

  // This method is left as an example. Call it if you need to deauthorize
  const deauthorizeSDK = async () => {
    await deauthorize();
    console.log('Deauthorization successful. The app is no longer authorized.');
  };

  useEffect(() => {
    const observeAuthChanges = async () => {
      observeAuthorizationChanges((newStatus) => {
        if (newStatus === AuthorizationState.NOT_AUTHORIZED) {
          // You can handle deauthorization here. For instance, you might move
          // to a login screen or call authorize to reauthorize automatically.
          console.log('The application has been deauthorized.');
          deauthorizeSDK();
        }
      });
    };

    requestPermissions();
    Animated.timing(logoTranslateY, {
      toValue: -(Dimensions.get('window').height / 2 - 120),
      easing: Easing.bezier(0.25, 0.1, 0.25, 1),
      duration: 1500,
      useNativeDriver: true,
    }).start();
    observeAuthChanges();
    authorizeSDK();
    navigation.replace('Home');
    return () => {
      // Remember to remove your observer once the component has been removed from the DOM
      stopObservingAuthorizationChanges();
    };
  }, [logoTranslateY, navigation]);

  return (
    <View style={styles.container}>
      <SquareLogo style={{ transform: [{ translateY: logoTranslateY }] }} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    backgroundColor,
    flex: 1,
    justifyContent: 'center',
  },
});
