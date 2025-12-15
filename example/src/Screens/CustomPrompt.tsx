import { View, Text, Image, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import DismissButton from '../components/DismissButton';
import { useEffect, useState } from 'react';
import {
  setReaderChangedCallback,
  getReaders,
  type PaymentParameters,
  getCurrencySymbol,
} from 'mobile-payments-sdk-react-native';
import { usePayment } from '../providers/PaymentProvider';
import { useNavigation } from '@react-navigation/native';

const CustomPrompt = () => {
  const [hasReaders, setHasReaders] = useState(false);
  const [paymentParameters, setPaymentParameters] = useState<
    PaymentParameters | undefined
  >(undefined);
  const { getPaymentParameters, cancel } = usePayment();
  const navigation = useNavigation();

  const updateReaders = async () => {
    const reader = await getReaders();
    setHasReaders(reader.length > 0);
  };

  useEffect(() => {
    (async () => {
      const pp = await getPaymentParameters();
      setPaymentParameters(pp);
    })();
    const subscription = setReaderChangedCallback((_) => {
      updateReaders();
    });
    updateReaders();
    return () => {
      subscription();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const sub = navigation.addListener('beforeRemove', () => {
      cancel();
    });
    return sub;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const total = paymentParameters?.amountMoney;

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <DismissButton
          onDismiss={() => {
            cancel();
          }}
        />
        <Text style={styles.headerTitle}>Total</Text>
      </View>
      <View style={styles.content}>
        <Text style={styles.amount}>
          {String(total?.amount ?? 0) +
            ' ' +
            (total ? getCurrencySymbol(total.currencyCode) : '')}
        </Text>
        <View style={styles.content}>
          {hasReaders ? (
            <Text style={styles.title}>Swipe to pay</Text>
          ) : (
            <>
              <Image
                source={require('../assets/no-readers.png')}
                style={styles.image}
              />
              <Text style={styles.title}>No reader connected</Text>
            </>
          )}
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: 'white',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    justifyContent: 'center',
    flex: 1,
    textAlign: 'center',
  },
  content: {
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center',
    paddingLeft: 16,
    paddingRight: 16,
  },
  image: {
    width: 150,
    height: 150,
    marginBottom: 50,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'black',
    marginBottom: 32,
  },
  amount: {
    fontSize: 32,
    fontWeight: 'bold',
    color: 'black',
  },
});

export default CustomPrompt;
