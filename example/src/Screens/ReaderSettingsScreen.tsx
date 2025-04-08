import { useEffect, useState, useRef } from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  Pressable,
  Animated,
  Modal,
  Dimensions,
  ActivityIndicator,
  Alert,
} from 'react-native';
import {
  getReaders,
  isPairingInProgress,
  pairReader,
  setReaderChangedCallback,
  stopPairing,
  type ReaderInfo,
} from 'mobile-payments-sdk-react-native';
import { useNavigation } from '@react-navigation/native';

const { height } = Dimensions.get('window');

const ReaderSettingsScreen = () => {
  const navigation = useNavigation();
  const [readers, setReaders] = useState<ReaderInfo[]>([]);
  const [inProgress, setInProgress] = useState(false);
  const [visible, setVisible] = useState(false);
  const translateY = useRef(new Animated.Value(height)).current;

  const pairingInProgress = async () => {
    const isParing = await isPairingInProgress();
    return isParing;
  };

  const openSheet = () => {
    setInProgress(true);
    setVisible(true);
    Animated.timing(translateY, {
      toValue: 0,
      duration: 300,
      useNativeDriver: true,
    }).start();
  };

  const closeSheet = (fromSuccess?: boolean) => {
    Animated.timing(translateY, {
      toValue: height,
      duration: 300,
      useNativeDriver: true,
    }).start(() => {
      stopPairing().then(() => {
        if (!fromSuccess) {
          Alert.alert('Pairing stopped', 'Current pairing process has stopped');
        }
      });
      setInProgress(false);
      setVisible(false);
    });
  };

  const starPairing = async () => {
    openSheet();
    let success = false;
    try {
      success = await pairReader();
      Alert.alert('Result', success ? 'Paired' : 'Idle');
    } catch (e) {
      console.error(e);
      Alert.alert('Pairing Error', String(e));
    } finally {
      closeSheet(success);
    }
  };

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

  //on unmount stop pairing
  useEffect(() => {
    return () => {
      pairingInProgress().then((isPairing) => {
        if (isPairing) stopPairing();
      });
    };
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
        <TouchableOpacity
          activeOpacity={0.7}
          style={styles.pair}
          onPress={starPairing}
          disabled={inProgress}
        >
          <Text style={styles.pairText}>{'Start Reader pairing'}</Text>
        </TouchableOpacity>
      </ScrollView>
      <Modal transparent visible={visible} animationType="none">
        <Pressable style={styles.backdrop} onPress={() => closeSheet()} />
        <Animated.View
          style={[styles.bottomSheet, { transform: [{ translateY }] }]}
        >
          <Text style={styles.sheetText}>{'Pairing in Progress'}</Text>
          <ActivityIndicator />
          <TouchableOpacity onPress={() => closeSheet()}>
            <Text style={styles.closeText}>{'Close'}</Text>
          </TouchableOpacity>
        </Animated.View>
      </Modal>
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
  pairText: {
    fontSize: 14,
    color: '#ffffff',
  },
  pair: {
    flexDirection: 'row',
    justifyContent: 'center',
    width: '100%',
    backgroundColor: 'blue',
    borderRadius: 5,
    paddingVertical: 5,
    paddingHorizontal: 15,
  },
  backdrop: {
    flex: 1,
    backgroundColor: '#00000099',
  },
  bottomSheet: {
    position: 'absolute',
    bottom: 0,
    width: '100%',
    height: 300,
    backgroundColor: 'white',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    justifyContent: 'space-between',
  },
  sheetText: { fontSize: 18 },
  closeText: { color: 'red', marginTop: 20, textAlign: 'right' },
});

export default ReaderSettingsScreen;
