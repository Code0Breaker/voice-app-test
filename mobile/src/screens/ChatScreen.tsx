import React, { useCallback, useRef, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  Dimensions,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import Animated, {
  FadeIn,
  FadeOut,
  SlideInDown,
  SlideOutDown,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import type { ChatMessage } from '../types';
import { useChat, useVoice } from '../hooks';
import { Header } from '../components/common';
import { ChatInput, MessageList } from '../components/chat';
import { WaveVisualizer, VoiceControls, TranscriptionOverlay } from '../components/voice';
import { styles, WAVE_INLINE_H } from './ChatScreen.styles';

const { width: SCREEN_W } = Dimensions.get('window');

export function ChatScreen() {
  const insets = useSafeAreaInsets();
  const [mode, setMode] = useState<'chat' | 'voice'>('chat');
  const [isMuted, setIsMuted] = useState(false);
  const flatListRef = useRef<FlatList<ChatMessage>>(null);

  const { messages, isStreaming, sendMessage } = useChat();
  const {
    voiceState,
    transcript,
    intensity,
    hueShift,
    direction,
    startListening,
    cancel,
    onAnswerStart,
    speakResponse,
    consumeTranscript,
  } = useVoice();

  const handleTextSend = useCallback(
    (text: string) => {
      sendMessage(text);
      setTimeout(() => {
        flatListRef.current?.scrollToEnd({ animated: true });
      }, 100);
    },
    [sendMessage],
  );

  const handleMicPress = useCallback(async () => {
    setMode('voice');
    await startListening();
  }, [startListening]);

  const handleVoiceClose = useCallback(() => {
    cancel();
    setMode('chat');
  }, [cancel]);

  const handleMuteToggle = useCallback(() => {
    setIsMuted((prev) => !prev);
  }, []);

  React.useEffect(() => {
    if (voiceState === 'thinking') {
      const text = consumeTranscript();
      if (text.trim()) {
        sendMessage(text, {
          onFirstChunk: () => onAnswerStart(),
          onDone: (fullText) => speakResponse(fullText),
        });
      }
    }
  }, [voiceState, consumeTranscript, sendMessage, onAnswerStart, speakResponse]);

  React.useEffect(() => {
    if (messages.length > 0) {
      setTimeout(() => {
        flatListRef.current?.scrollToEnd({ animated: true });
      }, 50);
    }
  }, [messages]);

  if (mode === 'chat') {
    return (
      <KeyboardAvoidingView
        style={styles.root}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <View style={[styles.container, { paddingTop: insets.top }]}>
          <Header />
          <MessageList messages={messages} listRef={flatListRef} />
          <View style={{ paddingBottom: insets.bottom }}>
            <ChatInput
              onSubmit={handleTextSend}
              onMicPress={handleMicPress}
              disabled={isStreaming}
            />
          </View>
        </View>
      </KeyboardAvoidingView>
    );
  }

  return (
    <Animated.View
      entering={FadeIn.duration(300)}
      exiting={FadeOut.duration(200)}
      style={[styles.voiceRoot, { paddingTop: insets.top }]}
    >
      <View style={styles.voiceTopSection}>
        <Header onClosePress={handleVoiceClose} />

        {voiceState === 'listening' ? (
          <TranscriptionOverlay text={transcript} />
        ) : voiceState === 'monitoring' ? (
          <View style={styles.monitoringHint}>
            <Text style={styles.monitoringText}>Listening for your voice…</Text>
          </View>
        ) : messages.length > 0 ? (
          <MessageList messages={messages} listRef={flatListRef} />
        ) : null}
      </View>

      <Animated.View
        entering={SlideInDown.duration(400)}
        exiting={SlideOutDown.duration(300)}
        style={styles.waveInline}
      >
        <WaveVisualizer
          width={SCREEN_W}
          height={WAVE_INLINE_H}
          intensity={intensity}
          hueShift={hueShift}
          direction={direction}
        />
      </Animated.View>

      <VoiceControls
        onClose={handleVoiceClose}
        onMuteToggle={handleMuteToggle}
        isMuted={isMuted}
      />
    </Animated.View>
  );
}
