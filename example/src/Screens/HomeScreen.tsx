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
  startPayment,
  CurrencyCode,
  DelayAction,
} from 'mobile-payments-sdk-react-native';
import type { PaymentParameters } from 'mobile-payments-sdk-react-native';
import CustomButton from '../components/CustomButton';

export function HomeScreen() {
  const handleStartPayment = async () => {
    const paymentParameters: PaymentParameters = {
      acceptPartialAuthorization: false,
      amountMoney: { amount: 1000, currencyCode: CurrencyCode.USD },
      appFeeMoney: { amount: 0, currencyCode: CurrencyCode.USD },
      autocomplete: true,
      customerId: 'customer-id-example',
      delayAction: DelayAction.COMPLETE,
      idempotencyKey: Math.random().toString(),
      locationId: 'location-id-example',
      note: 'Payment for services',
      orderId: 'order-id-example',
      referenceId: 'reference-id-example',
      teamMemberId: 'team-member-id-example',
      tipMoney: { amount: 0, currencyCode: CurrencyCode.USD },
    };

    try {
      const payment = await startPayment(paymentParameters);
      console.log('Payment successful:', payment);
    } catch (error) {
      console.log('Payment error:', error);
    }
  };

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
