import { TouchableOpacity, StyleSheet } from 'react-native';
import Icon from 'react-native-vector-icons/Feather';
import { useNavigation } from '@react-navigation/native';

const CustomBackButton = () => {
  const navigation = useNavigation();

  const handleGoBack = () => {
    navigation.goBack();
  };

  return (
    <TouchableOpacity style={styles.button} onPress={handleGoBack}>
      <Icon name="x" size={24} color="#181818" />
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    padding: 10,
    backgroundColor: '#f2f2f2',
    borderRadius: 5,
    marginTop: 10,
  },
});

export default CustomBackButton;
