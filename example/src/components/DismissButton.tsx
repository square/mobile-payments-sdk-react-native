import { TouchableOpacity, Text, StyleSheet } from 'react-native';

const DismissButton = ({ onDismiss }) => {
  return (
    <TouchableOpacity style={styles.dismissButton} onPress={onDismiss}>
      <Text style={styles.closeButtonText}>&#x2715;</Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  dismissButton: {
    width: 48,
    height: 48,
    padding: 12,
    backgroundColor: '#F2F2F2',
    borderRadius: 6,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'absolute',
    left: 16,
    zIndex: 1,
  },
  closeButtonText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'black',
  },
});

export default DismissButton;