import React from 'react';
import { View, TouchableOpacity, Text, StyleSheet } from 'react-native';

interface VoiceControlsProps {
  onClose: () => void;
  onMuteToggle: () => void;
  isMuted?: boolean;
}

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

const styles = StyleSheet.create({
  pill: {
    position: 'absolute',
    bottom: 40,
    right: 20,
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    paddingHorizontal: 6,
    paddingVertical: 6,
    gap: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 6,
  },
  btn: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  btnText: {
    fontSize: 18,
    color: '#1A1A1A',
  },
  closeText: {
    fontSize: 16,
    color: '#1A1A1A',
    fontWeight: '600',
  },
});
