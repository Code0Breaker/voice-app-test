import React from 'react';
import { View, Text } from 'react-native';
import type { MessageBubbleProps } from '../../types';
import { styles } from './MessageBubble.styles';

export function MessageBubble({ message }: MessageBubbleProps) {
  const isUser = message.role === 'user';

  return (
    <View style={[styles.row, isUser && styles.rowUser]}>
      <View style={[styles.bubble, isUser ? styles.bubbleUser : styles.bubbleAI]}>
        <Text style={[styles.text, isUser ? styles.textUser : styles.textAI]}>
          {message.content}
        </Text>
      </View>
    </View>
  );
}
