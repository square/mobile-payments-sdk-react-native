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
        <Text
          style={
            isActive
              ? styles.loadingButtonText
              : styles.loadingButtonTextInactive
          }
        >
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
    backgroundColor: '#d6d6d6',
    opacity: 1,
  },
  loadingButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  loadingButtonTextInactive: {
    color: '#006AFF',
    fontSize: 18,
    fontWeight: 'bold',
  },
});

export default LoadingButton;
