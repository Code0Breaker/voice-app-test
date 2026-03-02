import type React from 'react';
import type { FlatList } from 'react-native';

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
}

export interface ChunkPayload {
  conversationId: string;
  messageId: string;
  text: string;
  done: boolean;
}

export interface SendMessageOptions {
  onFirstChunk?: () => void;
  onDone?: (fullText: string) => void;
}

export interface MessageBubbleProps {
  message: ChatMessage;
}

export interface MessageListProps {
  messages: ChatMessage[];
  listRef: React.RefObject<FlatList<ChatMessage> | null>;
}
