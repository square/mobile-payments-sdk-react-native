import { useState } from 'react';
import {
  View,
  Text,
  Alert,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  Platform,
} from 'react-native';
import CheckBox from '@react-native-community/checkbox';

export default function PermissionsScreen() {
  const [bluetooth, setBluetooth] = useState(false);
  const [location, setLocation] = useState(false);
  const [microphone, setMicrophone] = useState(false);
  const [phoneState, setPhoneState] = useState(false);

  const handleSignIn = () => {
    Alert.alert('Device not authorized.');
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.contentContainer}>
        <Text style={styles.permissionTitle}>Bluetooth</Text>
        <View style={styles.permission}>
          <Text style={styles.permissionDescription}>
            Square uses Bluetooth to connect and communicate with Square
            devices. You should ask for this permission if you are using readers
            that connect via Bluetooth.
          </Text>
          <CheckBox
            value={bluetooth}
            onValueChange={setBluetooth}
            style={styles.checkbox}
            tintColors={{ true: '#007aff', false: 'gray' }}
          />
        </View>

        <View style={styles.separator} />

        <Text style={styles.permissionTitle}>Location</Text>
        <View style={styles.permission}>
          <Text style={styles.permissionDescription}>
            Square uses location to know where transactions take place. This
            reduces risk and minimizes payment disputes.
          </Text>
          <CheckBox
            value={location}
            onValueChange={setLocation}
            style={styles.checkbox}
            tintColors={{ true: '#007aff', false: 'gray' }}
          />
        </View>

        <View style={styles.separator} />

        <Text style={styles.permissionTitle}>Microphone</Text>
        <View style={styles.permission}>
          <Text style={styles.permissionDescription}>
            Square’s R4 reader uses the microphone jack to communicate payment
            card data to your device. You should ask for this permission if you
            are using an R4 reader.
          </Text>
          <CheckBox
            value={microphone}
            onValueChange={setMicrophone}
            style={styles.checkbox}
            tintColors={{ true: '#007aff', false: 'gray' }}
          />
        </View>

        <View style={styles.separator} />

        {Platform.OS === 'android' && (
          <>
            <Text style={styles.permissionTitle}>Phone State</Text>
            <View style={styles.permission}>
              <Text style={styles.permissionDescription}>
                Square uses this permission to identify the device sending
                information to Square servers.
              </Text>
              <CheckBox
                value={phoneState}
                onValueChange={setPhoneState}
                style={styles.checkbox}
                tintColors={{ true: '#007aff', false: 'gray' }}
              />
            </View>
            <View style={styles.separator} />
          </>
        )}

        <TouchableOpacity style={styles.signInButton} onPress={handleSignIn}>
          <Text style={styles.buttonText}>Sign in</Text>
        </TouchableOpacity>

        <Text style={styles.warning}>Device not authorized.</Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
  },
  contentContainer: {
    flex: 1,
    justifyContent: 'flex-start',
    paddingHorizontal: 20,
    marginTop: 40,
  },
  permission: {
    marginBottom: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  permissionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: 'black',
  },
  permissionDescription: {
    fontSize: 14,
    color: 'gray',
    marginVertical: 5,
    flex: 3,
    lineHeight: 22,
  },
  checkbox: {
    marginLeft: 10,
  },
  warning: {
    marginTop: 10,
    fontSize: 16,
    color: '#a87c4f',
  },
  signInButton: {
    backgroundColor: '#e6acd4',
    borderRadius: 6,
    padding: 12,
    marginTop: '25%',
  },
  buttonText: {
    color: 'black',
    textAlign: 'center',
    fontSize: 18,
    fontWeight: 'bold',
  },
  separator: {
    borderBottomWidth: 0.8,
    borderBottomColor: '#E0E0E0',
    marginBottom: 10,
  },
});
