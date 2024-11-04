import { useState, useEffect } from 'react';
import { StyleSheet, View, Animated, Easing, Dimensions } from 'react-native';
import SquareLogo from '../components/SquareLogo';
import { backgroundColor } from '../styles/common';
import { authorize } from 'mobile-payments-sdk-react-native';

export default function SplashScreen() {
  const [logoTranslateY] = useState(new Animated.Value(0));

  const authorizeSDK = async () => {
    authorize(
      '$MOBILE_PAYMENT_SDK_TOKEN',
      '$MOBILE_PAYMENT_SDK_LOCATION_ID'
    ).then(() => {});
  };

  useEffect(() => {
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
