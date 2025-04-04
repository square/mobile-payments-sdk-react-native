import { useEffect, useState } from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
} from 'react-native';
import {
  getReaders,
  setReaderChangedCallback,
  type ReaderInfo,
} from 'mobile-payments-sdk-react-native';
import { useNavigation } from '@react-navigation/native';

const ReaderSettingsScreen = () => {
  const navigation = useNavigation();
  const [readers, setReaders] = useState<ReaderInfo[]>([]);

  useEffect(() => {
    getReaders()
      .then((rs) => setReaders(rs))
      .catch((e) => console.error(e));
  }, []);

  useEffect(() => {
    const sus = setReaderChangedCallback((_) => {
      //update list in any change for test
      getReaders()
        .then((rs) => setReaders(rs))
        .catch((e) => console.error(e));
    });
    return sus;
  }, []);

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {readers.map((item, index) => (
          <TouchableOpacity
            activeOpacity={0.7}
            key={index}
            style={styles.readerContainer}
            onPress={() =>
              navigation.navigate('ReaderDetails', { readerId: item.id })}
          >
            <View style={styles.column}>
              <Text style={styles.text}>{item.name}</Text>
              <Text style={styles.subText}>
                {item.state.toString().toLowerCase()}
              </Text>
            </View>
            <Text style={styles.text}>{'>'}</Text>
          </TouchableOpacity>
        ))}
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
  readerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
    backgroundColor: '#cecece',
    borderRadius: 5,
    paddingVertical: 5,
    paddingHorizontal: 15,
  },
  column: {
    flexDirection: 'column',
  },
  text: {
    fontSize: 18,
    color: '#000000',
  },
  subText: {
    fontSize: 14,
    color: '#000000',
  },
});

export default ReaderSettingsScreen;
