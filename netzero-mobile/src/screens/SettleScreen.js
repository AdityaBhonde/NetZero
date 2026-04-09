import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export default function SettleScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>Settle Screen</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F5F3FF',
  },
  text: {
    fontSize: 18,
    color: '#6C3FF5',
    fontWeight: 'bold',
  },
});
