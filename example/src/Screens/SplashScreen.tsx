import { useState, useEffect } from 'react';
import {
  StyleSheet,
  View,
  Animated,
  Easing,
  Dimensions,
  Platform,
} from 'react-native';
import SquareLogo from '../components/SquareLogo';
import { backgroundColor } from '../styles/common';
import { NativeModules } from 'react-native';

const { AuthorizationModule } = NativeModules;

export default function SplashScreen() {
  const [logoTranslateY] = useState(new Animated.Value(0));

  const fetchAuthorizationResponse = async () => {
    try {
      let response;

      if (Platform.OS === 'ios') {
        response = await AuthorizationModule.authorize();
      } else {
        response = await AuthorizationModule.getAuthorizationResponse();
      }
      console.log('Authorization Response is Here:', AuthorizationModule);
      console.log('Authorization Response is:', response);
    } catch (error) {
      console.log('Failed to fetch authorization response:', error);
    }
  };

  useEffect(() => {
    Animated.timing(logoTranslateY, {
      toValue: -(Dimensions.get('window').height / 2 - 120),
      easing: Easing.bezier(0.25, 0.1, 0.25, 1),
      duration: 1500,
      useNativeDriver: true,
    }).start();

    fetchAuthorizationResponse();
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
