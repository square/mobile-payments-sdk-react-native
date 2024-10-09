import { useState, useEffect } from 'react';
import { StyleSheet, View, Animated, Easing, Dimensions } from 'react-native';
import SquareLogo from '../components/SquareLogo';
import { backgroundColor } from '../styles/common';
import { NativeModules } from 'react-native';

const { AuthorizationModule, PaymentsBridge } = NativeModules;

const authorizePayments = () => {
  if (PaymentsBridge) {
    PaymentsBridge.authorizePayments();
  } else {
    console.error('PaymentsBridge is not available.');
  }
};

export default function SplashScreen() {
  const [logoTranslateY] = useState(new Animated.Value(0));

  useEffect(() => {
    authorizePayments();
  }, []);

  const fetchAuthorizationResponse = async () => {
    try {
      const response = await AuthorizationModule.getAuthorizationResponse();
      console.log('Authorization Response is Here:', response);
      console.log('Authorization Response is:', response);
    } catch (error) {
      console.error('Failed to fetch authorization response:', error);
    }
  };

  useEffect(() => {
    fetchAuthorizationResponse();
    Animated.timing(logoTranslateY, {
      toValue: -(Dimensions.get('window').height / 2 - 120),
      easing: Easing.bezier(0.25, 0.1, 0.25, 1),
      duration: 1500,
      useNativeDriver: true,
    }).start();
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
