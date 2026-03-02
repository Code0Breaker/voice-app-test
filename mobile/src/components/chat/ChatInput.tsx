import React, { useState } from 'react';
import { View, TextInput, TouchableOpacity, Text } from 'react-native';
import type { ChatInputProps } from '../../types';
import { styles } from './ChatInput.styles';

export function ChatInput({ onSubmit, onMicPress, disabled }: ChatInputProps) {
  const [text, setText] = useState('');

  const handleSubmit = () => {
    if (!text.trim() || disabled) return;
    onSubmit(text.trim());
    setText('');
  };

  return (
    <View style={styles.container}>
      <View style={styles.inputRow}>
        <TouchableOpacity style={styles.plusBtn}>
          <Text style={styles.plusText}>+</Text>
        </TouchableOpacity>

        <TextInput
          style={styles.input}
          placeholder="Ask anything"
          placeholderTextColor="#999"
          value={text}
          onChangeText={setText}
          onSubmitEditing={handleSubmit}
          returnKeyType="send"
          editable={!disabled}
        />

        {text.trim().length > 0 ? (
          <TouchableOpacity
            style={styles.sendBtn}
            onPress={handleSubmit}
            disabled={disabled}
          >
            <Text style={styles.sendArrow}>↑</Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity style={styles.micBtn} onPress={onMicPress}>
            <View style={styles.micIcon}>
              <Text style={styles.micWave}>⦿</Text>
            </View>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}
