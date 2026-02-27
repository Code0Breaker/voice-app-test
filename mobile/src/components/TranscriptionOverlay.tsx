import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

interface TranscriptionOverlayProps {
  text: string;
}

export function TranscriptionOverlay({ text }: TranscriptionOverlayProps) {
  if (!text) return null;

  return (
    <View style={styles.container}>
      <Text style={styles.text}>{text}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 32,
  },
  text: {
    fontSize: 24,
    lineHeight: 34,
    color: '#888',
    textAlign: 'left',
  },
});
