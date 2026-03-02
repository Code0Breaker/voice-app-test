import React from 'react';
import { View, TouchableOpacity, Text } from 'react-native';
import type { HeaderProps } from '../../types';
import { styles } from './Header.styles';

export function Header({ onMenuPress, onClosePress }: HeaderProps) {
  return (
    <View style={styles.header}>
      <TouchableOpacity style={styles.btn} onPress={onMenuPress}>
        <Text style={styles.icon}>☰</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.btn} onPress={onClosePress}>
        <Text style={styles.icon}>✕</Text>
      </TouchableOpacity>
    </View>
  );
}
