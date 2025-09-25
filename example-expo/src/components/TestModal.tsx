import { Modal, View, Text, Button, StyleSheet } from 'react-native';
import {
  PaymentSettings,
  OfflinePaymentQueue,
} from 'mobile-payments-sdk-react-native';

interface AsyncTestModalProps {
  visible: boolean;
  onClose: () => void;
  onLog: (_: string, __?: boolean) => void;
}

const TestModal = ({ visible, onClose, onLog }: AsyncTestModalProps) => {
  const methods = {
    isOfflineProcessingAllowed: () => {
      PaymentSettings.isOfflineProcessingAllowed().then((isAllowed) => {
        console.log('isOfflineProcessingAllowed -> ', isAllowed);
        onLog(`isOfflineProcessingAllowed -> ${isAllowed}`);
        onClose();
      });
    },
    getOfflineTotalStoredAmountLimit: () => {
      PaymentSettings.getOfflineTotalStoredAmountLimit().then((money) => {
        console.log('getOfflineTotalStoredAmountLimit -> ', money);
        onLog(
          `getOfflineTotalStoredAmountLimit -> ${JSON.stringify(money, null, 2)}`
        );
        onClose();
      });
    },
    getOfflineTransactionAmountLimit: () => {
      PaymentSettings.getOfflineTransactionAmountLimit().then((money) => {
        console.log('getOfflineTransactionAmountLimit -> ', money);
        onLog(
          `getOfflineTransactionAmountLimit -> ${JSON.stringify(money, null, 2)}`
        );
        onClose();
      });
    },
    getPayments: () => {
      OfflinePaymentQueue.getPayments()
        .then((offlinePayments) => {
          console.log('getPayments -> ', offlinePayments);
          onLog(`getPayments:\n ${JSON.stringify(offlinePayments, null, 2)}`);
          onClose();
        })
        .catch((error) => {
          console.log('getPayments Error-> ', error);
          onLog(`getPayments Error -> ${error}`, true);
          onClose();
        });
    },
    getTotalStoredPaymentAmount: () => {
      OfflinePaymentQueue.getTotalStoredPaymentAmount()
        .then((money) => {
          console.log('getTotalStoredPaymentAmount -> ', money);
          onLog(`getTotalStoredPaymentAmount:\n ${JSON.stringify(money, null, 2)}`);
          onClose();
        })
        .catch((error) => {
          console.log('getTotalStoredPaymentAmount Error-> ', error);
          onLog(`getTotalStoredPaymentAmount Error -> ${error}`, true);
          onClose();
        });
    },
  };

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View style={styles.container}>
        <View style={styles.modalContent}>
          <Text style={styles.title}>Test</Text>
          {Object.entries(methods).map(([name, method]) => (
            <Button key={name} title={name} onPress={method} />
          ))}
          <Button title="Close" onPress={onClose} color="red" />
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: 'white',
    padding: 20,
    gap: 10,
    borderRadius: 10,
    width: '80%',
    alignItems: 'center',
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
});

export default TestModal;
