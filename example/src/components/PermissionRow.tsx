import { View, StyleSheet, TouchableOpacity, Text } from 'react-native';
import BouncyCheckbox from 'react-native-bouncy-checkbox';

const PermissionRow = ({ title, description, isGranted, onRequest }) => (
  <View style={styles.permissionRow}>
    <View style={styles.textContainer}>
      <Text style={styles.permissionTitle}>{title}</Text>
      <Text style={styles.permissionDescription}>{description}</Text>
    </View>
    <View style={styles.spacer} />
    <TouchableOpacity style={styles.iconContainer}>
      <BouncyCheckbox
        isChecked={isGranted}
        size={25}
        fillColor="gray"
        unFillColor="#FFFFFF"
        innerIconStyle={{ borderWidth: 2 }}
        onPress={(isChecked: boolean) => {
          onRequest();
        }}
      />
    </TouchableOpacity>
  </View>
);

const styles = StyleSheet.create({
  permissionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingBottom: 15,
  },
  permissionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#000',
    marginBottom: 5,
  },
  permissionDescription: {
    fontSize: 14,
    lineHeight: 19,
    color: '#000',
    opacity: 0.55,
  },
  spacer: {
    flex: 1,
  },
  iconContainer: {
    paddingLeft: 16,
    flex: 1,
  },
  textContainer: {
    flex: 5,
    justifyContent: 'center',
    paddingTop: 16,
  },
});

export default PermissionRow;
