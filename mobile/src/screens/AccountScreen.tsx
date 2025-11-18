import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export const AccountScreen: React.FC = () => {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Account</Text>
      <Text style={styles.subtle}>
        This screen will show profile, visited places and reviews.
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#020617',
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
    color: '#f9fafb',
    marginBottom: 12,
  },
  subtle: {
    color: '#9ca3af',
  },
});
