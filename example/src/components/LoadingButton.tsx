import { TouchableOpacity, Text, ActivityIndicator, StyleSheet } from 'react-native';

// isAuthorized = isButtonStateActive
// handleDeauthorize = handleDeactivateState
// handleauthorize = handleActivateState
// handle autorize became () => handleAuthorize(setAuthorizationState) 
// 
const LoadingButton = ({ isLoading, isButtonStateActive,  handleActiveState, handleInactiveState, activeButtonLabel, inactiveButtonLabel }) => {
  return (
    <TouchableOpacity
      style={[styles.loadingButtonActive, isButtonStateActive ? styles.loadingButtonActive : styles.loadingButtonInactive ]}
      onPress={isButtonStateActive ? handleInactiveState : handleActiveState}
      disabled={isLoading}
    >
      {isLoading ? (
        <ActivityIndicator color="#000" />
      ) : (
        <Text style={styles.loadingButtonText}>{isButtonStateActive ? activeButtonLabel : inactiveButtonLabel }</Text>
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
    opacity: 0.5
  },
  loadingButtonText: {
    color: '#000',
    fontSize: 18,
    fontWeight: 'bold'
  },
});

export default LoadingButton;