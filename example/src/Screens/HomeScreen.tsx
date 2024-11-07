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
    navigation.navigate('Permissions');
  }

  function handleSettings() {}

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.contentContainer}>
        <View style={styles.topBar}>
          <TouchableOpacity style={styles.button} onPress={handleSettings}>
            <Text style={styles.buttonText}>Settings</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.button} onPress={handlePermission}>
            <Text style={styles.buttonText}>Permissions</Text>
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
          Device not authorized. Open your permissions to authorize.
        </Text>
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
    alignItems: 'center',
    justifyContent: 'flex-start',
    paddingHorizontal: 20,
  },
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    marginTop: 20,
  },
  button: {
    backgroundColor: '#f2f2f2',
    borderRadius: 5,
    height: 45,
    paddingHorizontal: 20,
    justifyContent: 'center',
  },
  buttonText: {
    color: '#1f6cdc',
    textAlign: 'center',
    fontWeight: 'bold',
    justifyContent: 'center',
    fontSize: 16,
  },
  buyButton: {
    width: '100%',
    padding: 12,
    marginTop: 35,
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
    alignSelf: 'flex-start',
  },
  donut: {
    paddingTop: '30%',
  },
});
