import { useState } from 'react';
import { View, ScrollView, Button, StyleSheet, Text } from 'react-native';
import TestModal from '../components/TestModal';

const TestScreen = () => {
  const [testModal, setTestModal] = useState(false);
  const [content, setContent] = useState<
    { message: string; isError: boolean }[]
  >([]);

  const onLog = (message: string, isError: boolean = false) => {
    setContent((prevContent) => [...prevContent, { message, isError }]);
  };

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {content.map((item, index) => (
          <View key={index} style={styles.logContainer}>
            <View
              style={[
                styles.dot,
                { backgroundColor: item.isError ? 'red' : 'green' },
              ]}
            />
            <Text style={styles.text}>{item.message}</Text>
          </View>
        ))}
      </ScrollView>
      <View style={styles.buttonContainer}>
        <Button title="Test Methods" onPress={() => setTestModal(true)} />
      </View>
      <TestModal
        visible={testModal}
        onClose={() => {
          setTestModal(false);
        }}
        onLog={onLog}
      />
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
  },
  logContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  dot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginRight: 10,
  },
  text: {
    fontSize: 18,
    color: '#000000'
  },
  buttonContainer: {
    backgroundColor: 'white',
    padding: 10,
    borderTopWidth: 1,
    borderColor: '#ccc',
  },
});

export default TestScreen;
