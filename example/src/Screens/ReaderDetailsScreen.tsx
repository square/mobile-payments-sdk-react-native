import { useEffect, useState } from 'react';
import { View, ScrollView, StyleSheet, Text, TouchableOpacity } from 'react-native';
import { type ReaderInfo } from 'mobile-payments-sdk-react-native';

const ReaderDetailsScreen = ({ route }) => {
    const { reader } = route.params;

    return (
        <View style={styles.container}>
        <ScrollView contentContainerStyle={styles.scrollContent}>
            {
                Object.entries((reader as ReaderInfo)).map(([key, value])=> {
                    if (value) {
                        let displayValue;
                    if (Array.isArray(value)) {
                        displayValue = value.join(", ").toLowerCase();
                    }
                    else if (typeof value === 'object') {
                        displayValue = JSON.stringify(value);
                    }
                    else {
                        displayValue = value.toString().toLowerCase();
                    }

                    return (
                        <View style={styles.row} key={key}>
                        <Text style={styles.text}>
                            {key.toLowerCase() + " :"}
                        </Text>
                        <Text style={styles.subtext}>
                            {displayValue}
                        </Text>
                        </View>
                    );
                    }
                })
            }
        </ScrollView>
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
    gap: 20,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
    gap: 20,
    borderRadius: 5,
    paddingVertical: 5,
    paddingHorizontal: 15,
  },
  text: {
    fontSize: 18,
    color: '#000000',
  },
  subtext: {
    fontSize: 14,
    color: '#000000',
  },
});

export default ReaderDetailsScreen;
