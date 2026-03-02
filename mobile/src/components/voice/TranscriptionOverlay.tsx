import React from 'react';
import { View, Text } from 'react-native';
import type { TranscriptionOverlayProps } from '../../types';
import { styles } from './TranscriptionOverlay.styles';

export function TranscriptionOverlay({ text }: TranscriptionOverlayProps) {
  if (!text) return null;

  return (
    <View style={styles.container}>
      <Text style={styles.text}>{text}</Text>
    </View>
  );
}
