import { useCallback, useEffect, useRef, useState } from 'react';
import { io, Socket } from 'socket.io-client';
import type { ChatMessage, ChunkPayload } from '../types';

const SERVER_URL = __DEV__
  ? 'http://localhost:3000'
  : 'http://localhost:3000';

export function useChat() {
  const socketRef = useRef<Socket | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [isStreaming, setIsStreaming] = useState(false);
  const streamBufferRef = useRef('');
  const currentMsgIdRef = useRef<string | null>(null);
  const onFirstChunkRef = useRef<(() => void) | null>(null);
  const onDoneRef = useRef<((fullText: string) => void) | null>(null);

  useEffect(() => {
    const socket = io(SERVER_URL, { transports: ['websocket'] });
    socketRef.current = socket;

    socket.on('connect', () => console.log('WS connected'));
    socket.on('disconnect', () => console.log('WS disconnected'));

    socket.on('chunk', (payload: ChunkPayload) => {
      if (!payload.done) {
        if (!currentMsgIdRef.current) {
          // First chunk of a new response
          currentMsgIdRef.current = payload.messageId;
          setConversationId(payload.conversationId);
          onFirstChunkRef.current?.();
        }
        streamBufferRef.current += payload.text;
        setMessages((prev) => {
          const existing = prev.find((m) => m.id === payload.messageId);
          if (existing) {
            return prev.map((m) =>
              m.id === payload.messageId
                ? { ...m, content: streamBufferRef.current }
                : m,
            );
          }
          return [
            ...prev,
            {
              id: payload.messageId,
              role: 'assistant',
              content: streamBufferRef.current,
            },
          ];
        });
      } else {
        const fullText = streamBufferRef.current;
        streamBufferRef.current = '';
        currentMsgIdRef.current = null;
        setIsStreaming(false);
        onDoneRef.current?.(fullText);
      }
    });

    socket.on('error', (payload: { message: string }) => {
      console.error('Server error:', payload.message);
      setIsStreaming(false);
    });

    return () => {
      socket.disconnect();
    };
  }, []);

  const sendMessage = useCallback(
    (
      text: string,
      opts?: {
        onFirstChunk?: () => void;
        onDone?: (fullText: string) => void;
      },
    ) => {
      if (!text.trim() || !socketRef.current) return;

      onFirstChunkRef.current = opts?.onFirstChunk ?? null;
      onDoneRef.current = opts?.onDone ?? null;
      streamBufferRef.current = '';
      currentMsgIdRef.current = null;

      const userMsg: ChatMessage = {
        id: `user-${Date.now()}`,
        role: 'user',
        content: text,
      };
      setMessages((prev) => [...prev, userMsg]);
      setIsStreaming(true);

      socketRef.current.emit('message', {
        conversationId,
        text,
      });
    },
    [conversationId],
  );

  const clearMessages = useCallback(() => {
    setMessages([]);
    setConversationId(null);
  }, []);

  return {
    messages,
    isStreaming,
    conversationId,
    sendMessage,
    clearMessages,
  };
}
