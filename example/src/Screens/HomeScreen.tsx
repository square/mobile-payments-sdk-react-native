import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
} from 'react-native';
import Feather from 'react-native-vector-icons/Feather';
import { defaultStyles } from '../styles/common';
import { NativeModules, Platform } from 'react-native';

const { SettingsModule } = NativeModules;

export function HomeScreen() {
  const showSettings = async () => {
    try {
      let result = null;
      if (Platform.OS === 'ios') {
        result = await SettingsModule.showSettingsForIOS();
      } else {
        result = await SettingsModule.showSettings();
      }
      console.log('Settings closed:', result);
    } catch (error) {
      console.error('Failed to show settings:', error);
    }
  };

  return (
    <SafeAreaView style={defaultStyles.pageContainer}>
      <View style={defaultStyles.pageContainer}>
        <View style={styles.iconContainer}>
          <TouchableOpacity onPress={showSettings}>
            <Feather name="settings" size={30} color="black" />
          </TouchableOpacity>
        </View>
        <View style={defaultStyles.descriptionContainer}>
          <Text style={defaultStyles.title}>Authorize Reader SDK.</Text>
          <Text style={defaultStyles.subtitle}>
            Generate an authorization code
            {'\n'}
            in the Reader SDK tab
            {'\n'}
            of the Developer Portal.
          </Text>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  iconContainer: {
    position: 'absolute',
    top: 0,
    right: 10,
    zIndex: 1,
  },
});
