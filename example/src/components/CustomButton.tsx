import type { FC } from 'react';
import { StyleSheet, TouchableOpacity, Text } from 'react-native';

interface Props {
  title: string; // Make title required
  onPress: () => void; // Specify the type of onPress
  disabled?: boolean; // Optional
  primary?: boolean; // Optional
}

const CustomButton: FC<Props> = ({
  title,
  onPress,
  disabled = false,
  primary = false,
}) => {
  return (
    <TouchableOpacity
      style={[
        styles.button,
        primary ? styles.primaryButton : styles.secondaryButton,
        disabled && styles.disabledButton,
      ]}
      onPress={onPress}
      disabled={disabled}
    >
      <Text
        style={
          disabled
            ? [styles.buttonText, styles.disabledButtonText]
            : styles.buttonText
        }
      >
        {title}
      </Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    alignItems: 'center',
    borderRadius: 8,
    height: 64,
    justifyContent: 'center',
    marginTop: 15,
  },
  buttonText: {
    color: 'white',
    fontSize: 20,
    fontWeight: '600',
  },
  disabledButton: {
    borderColor: 'rgba(255, 255, 255, 0.6)',
  },
  disabledButtonText: {
    color: 'rgba(255, 255, 255, 0.6)',
  },
  primaryButton: {
    backgroundColor: '#3972B2',
  },
  secondaryButton: {
    borderColor: 'white',
    borderWidth: 1,
  },
});

export default CustomButton;
