import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  SafeAreaView,
} from 'react-native';
import SvgUri from 'react-native-svg-uri';

export default function HomeScreen({ navigation }: any) {
  function handlePermission() {
    navigation.navigate('Permission');
  }

  function handleSettings() {}

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.container}>
        <View style={styles.topBar}>
          <TouchableOpacity style={styles.button} onPress={handlePermission}>
            <Text style={styles.buttonText}>Permission</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.button} onPress={handleSettings}>
            <Text style={styles.buttonText}>Settings</Text>
          </TouchableOpacity>
        </View>
        <View style={styles.donut}>
          <SvgUri
            width="250"
            height="300"
            source={require('../assets/donut.svg')}
          />
        </View>
        <Text style={styles.donutText}>Donut Counter</Text>
        <TouchableOpacity style={styles.buyButton}>
          <Text style={styles.buyButtonText}>Buy for $1</Text>
        </TouchableOpacity>

        <Text style={styles.warningText}>
          ⚠️ Device not authorized. Open your settings to authorize.
        </Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'flex-start',
    backgroundColor: 'white',
  },
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    paddingHorizontal: 20,
    marginTop: 20,
  },
  button: {
    backgroundColor: '#f2f2f2',
    padding: 10,
    borderRadius: 5,
  },
  buttonText: {
    color: '#1f6cdc',
    textAlign: 'center',
    fontWeight: 'bold',
  },
  image: {
    width: 200,
    height: 200,
    justifyContent: 'center',
    marginTop: 100,
  },
  buyButton: {
    width: '90%',
    padding: 15,
    justifyContent: 'center',
    marginTop: 20,
    backgroundColor: '#f2f2f2',
    borderRadius: 5,
  },
  donutText: {
    color: 'black',
    fontWeight: 'bold',
    fontSize: 25,
    marginTop: 30,
  },
  buyButtonText: {
    color: '#c6c6c6',
    textAlign: 'center',
    fontWeight: 'bold',
    fontSize: 18,
  },
  warningText: {
    color: '#b6906d',
    marginTop: 5,
  },
  donut: {
    paddingTop: '30%',
  },
});
