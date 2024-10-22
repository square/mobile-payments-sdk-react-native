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
import { authorize } from 'mobile-payments-sdk-react-native';

export default function SplashScreen() {
  const [logoTranslateY] = useState(new Animated.Value(0));

  const requestPermissions = async () => {
    try {
      if (Platform.OS === 'ios') {
        // Request iOS permissions
        const bluetoothPermission = await request(
          PERMISSIONS.IOS.BLUETOOTH_PERIPHERAL
        );
        const locationPermission = await request(
          PERMISSIONS.IOS.LOCATION_WHEN_IN_USE
        );
        const microphonePermission = await request(PERMISSIONS.IOS.MICROPHONE);
        // Check permissions
        if (
          locationPermission !== 'granted' ||
          microphonePermission !== 'granted' ||
          bluetoothPermission !== 'granted'
        ) {
          Alert.alert(
            'Permissions required',
            'This app requires additional permissions.'
          );
        }
      } else if (Platform.OS === 'android') {
        // Request Android permissions
        const permissions = [
          PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
          PermissionsAndroid.PERMISSIONS.RECORD_AUDIO,
          PermissionsAndroid.PERMISSIONS.BLUETOOTH_CONNECT,
          PermissionsAndroid.PERMISSIONS.BLUETOOTH_SCAN,
          PermissionsAndroid.PERMISSIONS.READ_PHONE_STATE,
        ];
        // Filter out undefined permissions
        const granted = await PermissionsAndroid.requestMultiple(
          permissions.filter((permission) => permission !== undefined)
        );

        // Check which permissions were granted
        const allGranted = Object.values(granted).every(
          (status) => status === PermissionsAndroid.RESULTS.GRANTED
        );
        if (!allGranted) {
          Alert.alert(
            'Permissions required',
            'This app requires additional permissions.'
          );
        }
      }
    } catch (error) {
      console.error(error);
    }
  };

  const authorizeSDK = async () => {
    authorize(
      $SQUARE_READER_SDK_ACCESS_TOKEN,
      $SQUARE_READER_SDK_LOCATION_ID
    ).then((authResult) => {
      console.log('auth ====>>>>', authResult);
    });
  };

  useEffect(() => {
    requestPermissions();
    Animated.timing(logoTranslateY, {
      toValue: -(Dimensions.get('window').height / 2 - 120),
      easing: Easing.bezier(0.25, 0.1, 0.25, 1),
      duration: 1500,
      useNativeDriver: true,
    }).start();

    authorizeSDK();
  }, [logoTranslateY]);

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
