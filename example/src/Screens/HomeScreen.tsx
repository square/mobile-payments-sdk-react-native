import { useNavigation } from '@react-navigation/native';
import {
  AdditionalPaymentMethodType,
  CurrencyCode,
  hideMockReaderUI,
  PromptMode,
  showMockReaderUI,
  showSettings,
  startPayment,
  type PaymentParameters,
  type PromptParameters,
  AuthorizationState,
  getAuthorizationState,
  stopObservingAuthorizationChanges
} from 'mobile-payments-sdk-react-native';
import React, { useEffect, useState } from 'react';
import { View, Text, Image, StyleSheet, SafeAreaView, TouchableOpacity } from 'react-native';
import uuid from 'react-native-uuid';
import LoadingButton from '../components/LoadingButton';
import HeaderButton from '../components/HeaderButton';

const observeAuthChanges = async () => {
  observeAuthorizationChanges((newStatus) => {
    if (newStatus === AuthorizationState.NOT_AUTHORIZED) {
      // You can handle deauthorization here calling, for instance, your own authorization method.
    }
  });
}

const HomeView = () => {
  const navigation = useNavigation();

  const [isMockReaderPresented, setMockReaderPresented] = useState(false);
  const [isAuthorized, setIsAuthorized] = useState(false);

  const dismissMockReader = () => {
    hideMockReaderUI();
    setMockReaderPresented(false);
  };

  const presentMockReader = () => {
    showMockReaderUI();
    setMockReaderPresented(true);
  };
  console.log("home view setup");

  useEffect(() => {
  console.log("useEffect triggered");
    // First we fetch the current Authorization state to set the button to the correct state
    const fetchAuthorizationState = async () => {
      let authState = await getAuthorizationState();
      setIsAuthorized(authState === AuthorizationState.AUTHORIZED);
      console.log('home screen set auth value ' + authState)
    }
    fetchAuthorizationState();
    // It's recommended you observe authorization changes while using the SDK
    observeAuthChanges();
    return () => {
      // Remember to remove your observer once the component has been removed from the DOM
      stopObservingAuthorizationChanges();
    };
  });

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
      console.log('Payment error:', JSON.stringify(error['userInfo']));
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <HeaderButton title="Settings" onPress={showSettings} />
        <View style={styles.headerSpacer} />
        <HeaderButton title="Permissions" onPress={() => navigation.navigate('Permissions')} />
      </View>
      <View style={styles.content}>
        <Image source={require('../assets/donut.png')} style={styles.donutImage} />
        <Text style={styles.title}>Donut Counter</Text>
        <LoadingButton
          isLoading={ false }
          isActive={ isAuthorized }
          handleOnPress={ () => handleStartPayment }
          activeLabel='Buy for $1'
        />
      </View>
        <TouchableOpacity style={styles.mockButton}
          onPress={() => {
            if (isMockReaderPresented) {
              dismissMockReader();
            } else {
              presentMockReader();
            }
          }}
        ><Text style={styles.mockReaderText}>{isMockReaderPresented ? 'Hide Mock Reader' : 'Show Mock Reader'}</Text>
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
    paddingRight: 16
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
