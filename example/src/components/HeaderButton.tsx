import { StyleSheet, Text, TouchableOpacity } from "react-native";

const HeaderButton = ({ onPress, title }) => {
  return ( 
    <TouchableOpacity
      style={styles.headerButton}
      onPress={onPress}
    >
      <Text style={styles.buttonText}>{title}</Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  headerButton: {
    height: 48,
    backgroundColor: '#F2F2F2',
    borderRadius: 6,
    justifyContent: 'center',
    alignItems: 'center',
    flex: 4,
  },
  buttonText: {
    color: '#005AD9',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default HeaderButton;
