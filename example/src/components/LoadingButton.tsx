import {
  TouchableOpacity,
  Text,
  ActivityIndicator,
  StyleSheet,
} from 'react-native';

const LoadingButton = ({
  isLoading,
  isActive,
  handleOnPress,
  activeLabel,
  inactiveLabel = '',
}) => {
  console.log(isActive ? activeLabel : inactiveLabel);
  return (
    <TouchableOpacity
      style={[
        styles.loadingButtonActive,
        isActive ? styles.loadingButtonActive : styles.loadingButtonInactive,
      ]}
      onPress={handleOnPress}
      disabled={isLoading}
    >
      {isLoading ? (
        <ActivityIndicator color="#000" />
      ) : (
        <Text style={styles.loadingButtonText}>
          {isActive ? activeLabel : inactiveLabel}
        </Text>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  loadingButtonActive: {
    height: 48,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#E5ACD4',
    marginVertical: 16,
    borderRadius: 5,
    width: '100%',
  },
  loadingButtonInactive: {
    backgroundColor: '#000',
    opacity: 0.5,
  },
  loadingButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
});

export default LoadingButton;
