import React from 'react';
import { View, TouchableOpacity, Text } from 'react-native';
import type { VoiceControlsProps } from '../../types';
import { styles } from './VoiceControls.styles';

export function VoiceControls({
  onClose,
  onMuteToggle,
  isMuted,
}: VoiceControlsProps) {
  return (
    <View style={styles.pill}>
      <TouchableOpacity style={styles.btn}>
        <Text style={styles.btnText}>···</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.btn} onPress={onMuteToggle}>
        <Text style={styles.btnText}>{isMuted ? '🔇' : '🎤'}</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.btn} onPress={onClose}>
        <Text style={styles.closeText}>✕</Text>
      </TouchableOpacity>
    </View>
  );
}
