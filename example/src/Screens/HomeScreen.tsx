import { useNavigation } from '@react-navigation/native';
import {
  AdditionalPaymentMethodType,
  CurrencyCode,
  hideMockReaderUI,
  PromptMode,
  showMockReaderUI,
  showSettings,
  startPayment,
  mapUserInfoToFailure,
  type PaymentParameters,
  type PromptParameters,
  ProcessingMode,
} from 'mobile-payments-sdk-react-native';
import React, { useState } from 'react';
import {
  View,
  Text,
  Image,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
} from 'react-native';
import uuid from 'react-native-uuid';
import LoadingButton from '../components/LoadingButton';
import HeaderButton from '../components/HeaderButton';

const HomeView = () => {
  const navigation = useNavigation();

  const [isMockReaderPresented, setMockReaderPresented] = useState(false);

  const dismissMockReader = () => {
    hideMockReaderUI();
    setMockReaderPresented(false);
  };

  const presentMockReader = async () => {
    try {
      const result = await showMockReaderUI();
      console.log(result);
      setMockReaderPresented(true);
    } catch (error) {
      console.log('Mock Reader UI error:', error);
    }
  };

  const handleStartPayment = async () => {
    const paymentParameters: PaymentParameters = {
      amountMoney: { amount: 1, currencyCode: CurrencyCode.EUR },
      appFeeMoney: { amount: 0, currencyCode: CurrencyCode.EUR },
      idempotencyKey: uuid.v4(),
      note: 'Payment for services',
      processingMode: ProcessingMode.AUTO_DETECT
      // Other parameters you could add:
      // autocomplete: true,
      // delayAction: DelayAction.CANCEL,
      // tipMoney: { amount: 0, currencyCode: CurrencyCode.USD },
      // etc
      // For more information, visit
      // iOS: https://developer.squareup.com/docs/mobile-payments-sdk/ios/take-payments#create-payment-parameters
      // Android: https://developer.squareup.com/docs/mobile-payments-sdk/android/take-payments#create-payment-parameters
    };

    const promptParameters: PromptParameters = {
      additionalMethods: [AdditionalPaymentMethodType.ALL],
      mode: PromptMode.DEFAULT,
    };

    try {
      const payment = await startPayment(paymentParameters, promptParameters);
      console.log('Payment successful:', payment);
    } catch (error) {
      // convert the error.userInfo into a Failure object
      const failure: Failure = mapUserInfoToFailure(error.userInfo);
      console.log('Payment error:', JSON.stringify(failure));
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <HeaderButton title="Settings" onPress={() => showSettings()} />
        <View style={styles.headerSpacer} />
        <HeaderButton
          title="Permissions"
          onPress={() => navigation.navigate('Permissions')}
        />
      </View>
      <View style={styles.content}>
        <Image
          source={require('../assets/donut.png')}
          style={styles.donutImage}
        />
        <Text style={styles.title}>Donut Counter</Text>
        <LoadingButton
          isLoading={false}
          isActive={true}
          handleOnPress={() => handleStartPayment()}
          activeLabel="Buy for $1"
        />
      </View>
      <TouchableOpacity
        style={styles.mockButton}
        onPress={() => {
          if (isMockReaderPresented) {
            dismissMockReader();
          } else {
            presentMockReader();
          }
        }}
      >
        <Text style={styles.mockReaderText}>
          {isMockReaderPresented ? 'Hide Mock Reader' : 'Show Mock Reader'}
        </Text>
      </TouchableOpacity>
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
    marginBottom: 50,
    paddingLeft: 16,
    paddingRight: 16,
  },
  headerSpacer: {
    flex: 4,
  },
  content: {
    alignItems: 'center',
    flex: 9,
    paddingLeft: 16,
    paddingRight: 16,
  },
  donutImage: {
    width: 248,
    height: 248,
    marginBottom: 50,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'black',
    marginBottom: 32,
  },
  mockButton: {
    flex: 1,
    alignItems: 'center',
  },
  mockReaderText: {
    color: '#007BFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default HomeView;
