import { useEffect, useState } from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
} from 'react-native';
import {
  blink,
  forget,
  getReader,
  type ReaderInfo,
} from 'mobile-payments-sdk-react-native';
import { useNavigation } from '@react-navigation/native';

const ReaderDetailsScreen = ({ route }) => {
  const { readerId } = route.params;
  const navigation = useNavigation();
  const [reader, setReader] = useState<ReaderInfo | null>(null);

  const forgetReader = async () => {
    try {
      await forget(readerId);
      navigation.navigate('ReaderSettings');
    } catch (e) {
      console.error(e);
    }
  };

  const blinkReader = async () => {
    try {
      await blink(readerId);
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    getReader(readerId)
      .then((r) => {
        setReader(r);
      })
      .catch((e) => console.error(e));
  }, [readerId]);

  if (!reader) {
    return (
      <View style={styles.container}>
        <Text>{'No reader found'}</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {Object.entries(reader as ReaderInfo).map(([key, value]) => {
          if (value) {
            let displayValue;
            if (Array.isArray(value)) {
              displayValue = value.join(', ').toLowerCase();
            } else if (typeof value === 'object') {
              displayValue = JSON.stringify(value);
            } else {
              displayValue = value.toString().toLowerCase();
            }
            return (
              <View style={styles.row} key={key}>
                <Text style={styles.text}> {key.toLowerCase() + ' :'}</Text>
                <Text style={styles.subtext}> {displayValue}</Text>
              </View>
            );
          }
          return null;
        })}
        <View style={styles.spacer} />
        {reader.isBlinkable && (
          <TouchableOpacity
            onPress={blinkReader}
            activeOpacity={0.7}
            style={styles.button}
          >
            <Text style={[styles.text, styles.blinkText]}>
              {'Blink reader'}
            </Text>
          </TouchableOpacity>
        )}
        {reader.isForgettable && (
          <TouchableOpacity
            onPress={forgetReader}
            activeOpacity={0.7}
            style={styles.button}
          >
            <Text style={[styles.text, styles.forgetText]}>
              {'Forget reader'}
            </Text>
          </TouchableOpacity>
        )}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    padding: 20,
    gap: 20,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
    gap: 20,
    borderRadius: 5,
    paddingVertical: 5,
    paddingHorizontal: 15,
  },
  text: {
    fontSize: 18,
    color: '#000000',
  },
  subtext: {
    fontSize: 14,
    color: '#000000',
  },
  spacer: {
    height: 25,
  },
  button: {
    paddingVertical: 5,
    paddingHorizontal: 15,
    alignSelf: 'center',
    borderRadius: 5,
    backgroundColor: '#cecece',
  },
  buttonForget: {
    backgroundColor: 'red',
  },
  forgetText: {
    color: 'red',
  },
  blinkText: {
    color: 'blue',
  },
});

export default ReaderDetailsScreen;
