import React from 'react';
import { View, Text, FlatList } from 'react-native';
import { MessageBubble } from './MessageBubble';
import type { MessageListProps } from '../../types';
import { styles } from './MessageList.styles';

export function MessageList({ messages, listRef }: MessageListProps) {
  if (messages.length === 0) {
    return (
      <View style={styles.greeting}>
        <Text style={styles.greetTitle}>Good morning</Text>
        <Text style={styles.greetSub}>How can I help?</Text>
      </View>
    );
  }

  return (
    <FlatList
      ref={listRef}
      data={messages}
      keyExtractor={(m) => m.id}
      renderItem={({ item }) => <MessageBubble message={item} />}
      contentContainerStyle={styles.messageList}
      showsVerticalScrollIndicator={false}
    />
  );
}
