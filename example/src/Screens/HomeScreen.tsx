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
  showMockReaderUI,
  startPayment,
  CurrencyCode,
  DelayAction,
} from 'mobile-payments-sdk-react-native';
import CustomButton from '../components/CustomButton';
} from 'mobile-payments-sdk-react-native';
import { useEffect } from 'react';

export function HomeScreen() {
  useEffect(() => {
    showMockReaderUI();
  }, []);

  const handleStartPayment = async () => {
    const paymentParameters = {
      acceptPartialAuthorization: false,
      amountMoney: { amount: 1000, currencyCode: CurrencyCode.USD }, // Use the enum
      appFeeMoney: { amount: 0, currencyCode: CurrencyCode.USD }, // Use the enum
      autocomplete: true,
      customerId: 'customer-id-example',
      delayAction: DelayAction.COMPLETE,
      idempotencyKey: 'unique-key-example',
      locationId: 'location-id-example',
      note: 'Payment for services',
      orderId: 'order-id-example',
      referenceId: 'reference-id-example',
      teamMemberId: 'team-member-id-example',
      tipMoney: { amount: 0, currencyCode: CurrencyCode.USD }, // Use the enum
    };

    try {
      const payment = await startPayment(paymentParameters);
      console.log('Payment successful:', payment);
    } catch (error) {
      console.log('Payment error:', error);
    }
  };
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
