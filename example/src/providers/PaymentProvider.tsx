import { useNavigation } from '@react-navigation/native';
import type {
  Failure,
  PaymentCallback,
  PaymentHandle,
  PaymentParameters,
  PromptParameters,
} from 'mobile-payments-sdk-react-native';
import {
  mapUserInfoToFailure,
  PromptMode,
  startPayment as startSDKPayment,
} from 'mobile-payments-sdk-react-native';
import { createContext, useContext, useRef, type ReactNode } from 'react';

type PaymentContextType = {
  startPayment: (
    pp: PaymentParameters,
    ppt: PromptParameters,
    callback: PaymentCallback,
    onError: (e: Failure) => void
  ) => Promise<void>;
  cancel: () => void;
  getPaymentParameters: () => Promise<PaymentParameters | undefined>;
};

const PaymentContext = createContext<PaymentContextType>({
  startPayment: async (_, __, ___, ____) => {},
  cancel: () => {},
  getPaymentParameters: async () => ({}) as PaymentParameters,
});

export const PaymentProvider = ({ children }: { children: ReactNode }) => {
  const paymentHandle = useRef<PaymentHandle | undefined>(undefined);
  const navigation = useNavigation();

  const startPayment = async (
    pp: PaymentParameters,
    ppt: PromptParameters,
    callback: PaymentCallback,
    onError: (e: Failure) => void
  ) => {
    const isCustom = ppt.mode === PromptMode.CUSTOM;
    try {
      paymentHandle.current = await startSDKPayment(pp, ppt, (result) => {
        const manualBack = navigation
          .getState()
          ?.routes.find((r) => r.name === 'CustomPrompt');
        if (isCustom && manualBack) {
          console.log();
          navigation.goBack();
        }
        paymentHandle.current = undefined;
        callback(result);
      });
      if (isCustom) {
        //@ts-ignore
        navigation.navigate('CustomPrompt');
      }
    } catch (error) {
      const failure: Failure = mapUserInfoToFailure((error as any).userInfo);
      onError(failure);
    }
  };

  const cancel = () => {
    paymentHandle.current?.cancel();
  };

  const getPaymentParameters = async () => {
    return await paymentHandle.current?.getPaymentsParameters();
  };

  return (
    <PaymentContext.Provider
      value={{
        startPayment,
        cancel,
        getPaymentParameters,
      }}
    >
      {children}
    </PaymentContext.Provider>
  );
};

export const usePayment = () => useContext(PaymentContext);
