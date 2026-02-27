import React, { useCallback, useRef, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
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
import { AuroraVisualizer } from '../components/AuroraVisualizer';
import { VoiceControls } from '../components/VoiceControls';
import { MessageBubble } from '../components/MessageBubble';
import { ChatInput } from '../components/ChatInput';
import { TranscriptionOverlay } from '../components/TranscriptionOverlay';
import { useChat } from '../hooks/useChat';
import { useVoice } from '../hooks/useVoice';
import type { ChatMessage } from '../types';

const { width: SCREEN_W, height: SCREEN_H } = Dimensions.get('window');
const AURORA_INLINE_H = SCREEN_H * 0.32;

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
    startListening,
    cancel,
    onAnswerStart,
    speakResponse,
    consumeTranscript,
  } = useVoice();

  // --- Text input send ---
  const handleTextSend = useCallback(
    (text: string) => {
      sendMessage(text);
      setTimeout(() => {
        flatListRef.current?.scrollToEnd({ animated: true });
      }, 100);
    },
    [sendMessage],
  );

  // --- Mic button: enter voice mode + start listening ---
  const handleMicPress = useCallback(async () => {
    setMode('voice');
    await startListening();
  }, [startListening]);

  // --- Close voice mode ---
  const handleVoiceClose = useCallback(() => {
    cancel();
    setMode('chat');
  }, [cancel]);

  // --- Mute toggle ---
  const handleMuteToggle = useCallback(() => {
    setIsMuted((prev) => !prev);
  }, []);

  // When STT ends and voiceState becomes "thinking", send the transcript
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

  // Scroll to bottom when new messages arrive
  React.useEffect(() => {
    if (messages.length > 0) {
      setTimeout(() => {
        flatListRef.current?.scrollToEnd({ animated: true });
      }, 50);
    }
  }, [messages]);

  const hasMessages = messages.length > 0;

  // --- CHAT MODE ---
  if (mode === 'chat') {
    return (
      <KeyboardAvoidingView
        style={styles.root}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <View style={[styles.container, { paddingTop: insets.top }]}>
          {/* Header */}
          <View style={styles.header}>
            <TouchableOpacity style={styles.headerBtn}>
              <Text style={styles.headerIcon}>☰</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.headerBtn}>
              <Text style={styles.headerIcon}>✕</Text>
            </TouchableOpacity>
          </View>

          {/* Content */}
          {!hasMessages ? (
            <View style={styles.greeting}>
              <Text style={styles.greetTitle}>Good morning</Text>
              <Text style={styles.greetSub}>How can I help?</Text>
            </View>
          ) : (
            <FlatList
              ref={flatListRef}
              data={messages}
              keyExtractor={(m) => m.id}
              renderItem={({ item }) => <MessageBubble message={item} />}
              contentContainerStyle={styles.messageList}
              showsVerticalScrollIndicator={false}
            />
          )}

          {/* Input bar */}
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

  // --- VOICE MODE ---
  const isFullscreen = voiceState === 'listening' && !hasMessages;

  return (
    <Animated.View
      entering={FadeIn.duration(300)}
      exiting={FadeOut.duration(200)}
      style={[styles.voiceRoot, { paddingTop: insets.top }]}
    >
      {/* Top section: transcription or messages */}
      <View style={styles.voiceTopSection}>
        {/* Header in voice mode */}
        <View style={styles.header}>
          <TouchableOpacity style={styles.headerBtn}>
            <Text style={styles.headerIcon}>☰</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.headerBtn} onPress={handleVoiceClose}>
            <Text style={styles.headerIcon}>✕</Text>
          </TouchableOpacity>
        </View>

        {voiceState === 'listening' ? (
          <TranscriptionOverlay text={transcript} />
        ) : hasMessages ? (
          <FlatList
            ref={flatListRef}
            data={messages}
            keyExtractor={(m) => m.id}
            renderItem={({ item }) => <MessageBubble message={item} />}
            contentContainerStyle={styles.messageList}
            showsVerticalScrollIndicator={false}
          />
        ) : null}
      </View>

      {/* Aurora section */}
      <Animated.View
        entering={SlideInDown.duration(400)}
        exiting={SlideOutDown.duration(300)}
        style={
          isFullscreen
            ? styles.auroraFullscreen
            : styles.auroraInline
        }
      >
        <AuroraVisualizer
          width={SCREEN_W}
          height={isFullscreen ? SCREEN_H : AURORA_INLINE_H}
          intensity={intensity}
          hueShift={hueShift}
        />
      </Animated.View>

      {/* Voice controls pill */}
      <VoiceControls
        onClose={handleVoiceClose}
        onMuteToggle={handleMuteToggle}
        isMuted={isMuted}
      />
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    height: 52,
  },
  headerBtn: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerIcon: {
    fontSize: 22,
    color: '#1A1A1A',
  },
  greeting: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  greetTitle: {
    fontSize: 28,
    fontWeight: '600',
    color: '#1A1A1A',
    marginBottom: 4,
  },
  greetSub: {
    fontSize: 28,
    fontWeight: '300',
    color: '#1A1A1A',
  },
  messageList: {
    paddingVertical: 8,
    flexGrow: 1,
  },
  // Voice mode
  voiceRoot: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  voiceTopSection: {
    flex: 1,
    zIndex: 2,
  },
  auroraInline: {
    height: AURORA_INLINE_H,
    overflow: 'hidden',
  },
  auroraFullscreen: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 1,
  },
});
