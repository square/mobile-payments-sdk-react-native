import { useState } from 'react';
import { View, Text, Button, Alert, StyleSheet } from 'react-native';
import CheckBox from '@react-native-community/checkbox';

export default function PermissionsScreen() {
  const [bluetooth, setBluetooth] = useState(false);
  const [location, setLocation] = useState(false);
  const [microphone, setMicrophone] = useState(false);

  const handleSignIn = () => {
    Alert.alert('Device not authorized.');
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Permissions</Text>
      </View>

      <View style={styles.permission}>
        <Text style={styles.permissionTitle}>Bluetooth</Text>
        <Text style={styles.permissionDescription}>
          Square uses Bluetooth to connect and communicate with Square devices.
          You should ask for this permission if you are using readers that
          connect via Bluetooth.
        </Text>
        <CheckBox value={bluetooth} onValueChange={setBluetooth} />
      </View>

      <View style={styles.permission}>
        <Text style={styles.permissionTitle}>Location</Text>
        <Text style={styles.permissionDescription}>
          Square uses location to know where transactions take place. This
          reduces risk and minimizes payment disputes.
        </Text>
        <CheckBox value={location} onValueChange={setLocation} />
      </View>

      <View style={styles.permission}>
        <Text style={styles.permissionTitle}>Microphone</Text>
        <Text style={styles.permissionDescription}>
          Square’s R4 reader uses the microphone jack to communicate payment
          card data to your device. You should ask for this permission if you
          are using an R4 reader.
        </Text>
        <CheckBox value={microphone} onValueChange={setMicrophone} />
      </View>

      <Button title="Sign in" onPress={handleSignIn} color="#007AFF" />

      <Text style={styles.warning}>⚠️ Device not authorized.</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: 'white',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginHorizontal: 20,
  },
  permission: {
    marginBottom: 20,
  },
  permissionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  permissionDescription: {
    fontSize: 14,
    color: 'gray',
    marginVertical: 5,
  },
  warning: {
    marginTop: 20,
    fontSize: 16,
    color: 'orange',
    textAlign: 'center',
  },
});
