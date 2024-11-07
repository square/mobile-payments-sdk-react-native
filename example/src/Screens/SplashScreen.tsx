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
    authorize(
      '$MOBILE_PAYMENT_SDK_TOKEN',
      '$MOBILE_PAYMENT_SDK_LOCATION_ID'
    ).then(() => {});
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
    navigation.replace('Home');
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
