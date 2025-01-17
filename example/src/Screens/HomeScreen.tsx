import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
} from 'react-native';
import Feather from 'react-native-vector-icons/Feather';
import { defaultStyles } from '../styles/common';
import {
  showSettings,
  type PaymentParameters,
  CurrencyCode,
  type PromptParameters,
  AdditionalPaymentMethodType,
  PromptMode,
  startPayment,
} from 'mobile-payments-sdk-react-native';
import { useEffect } from 'react';
import CustomButton from '../components/CustomButton';
import uuid from 'react-native-uuid';

const handleStartPayment = async () => {
  const paymentParameters: PaymentParameters = {
    amountMoney: { amount: 100, currencyCode: CurrencyCode.USD },
    appFeeMoney: { amount: 0, currencyCode: CurrencyCode.USD },
    idempotencyKey: uuid.v4(),
    note: 'Payment for services',
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
    console.log('Payment error:', error);
  }
};

export function HomeScreen() {
  useEffect(() => {
    // If you wish to display mock reader UI, make sure you're initializing the SDK
    // with a sandbox Application ID.
    // https://developer.squareup.com/docs/mobile-payments-sdk/ios#3-initialize-the-mobile-payments-sdk
    // showMockReaderUI();
  });

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
        <CustomButton title="Start Payment" onPress={handleStartPayment} />
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
