import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export const AssistantScreen: React.FC = () => {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>AI Assistant</Text>
      <Text style={styles.subtle}>
        Here you will chat with the assistant to find the perfect place.
      </Text>
      <Text style={styles.subtle}>
        For now this is just a placeholder screen.
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
    marginBottom: 4,
  },
});
