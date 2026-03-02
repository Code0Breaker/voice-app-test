export type VoiceState = 'idle' | 'monitoring' | 'listening' | 'thinking' | 'answering';

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
