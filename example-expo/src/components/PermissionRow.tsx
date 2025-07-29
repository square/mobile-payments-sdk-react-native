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
        innerIconStyle={styles.permissionCheckBox}
        onPress={() => {
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
    paddingBottom: 5,
  },
  permissionCheckBox: {
    borderWidth: 2,
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
    flex: 0.3,
  },
  iconContainer: {
    paddingLeft: 8,
    flex: 1,
  },
  textContainer: {
    flex: 5,
    justifyContent: 'center',
    paddingTop: 6,
  },
});

export default PermissionRow;
