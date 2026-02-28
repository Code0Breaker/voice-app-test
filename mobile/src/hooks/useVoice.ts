import { useCallback, useRef, useState } from 'react';
import {
  ExpoSpeechRecognitionModule,
  useSpeechRecognitionEvent,
} from 'expo-speech-recognition';
import * as Speech from 'expo-speech';
import {
  useSharedValue,
  withTiming,
  withRepeat,
  withSequence,
  cancelAnimation,
  Easing,
} from 'react-native-reanimated';
import type { VoiceState } from '../types';

export function useVoice() {
  const [voiceState, setVoiceState] = useState<VoiceState>('idle');
  const [transcript, setTranscript] = useState('');
  const transcriptRef = useRef('');

  const intensity = useSharedValue(0);
  const hueShift = useSharedValue(0);
  const direction = useSharedValue(0);

  // --- Speech Recognition Events ---

  useSpeechRecognitionEvent('start', () => {
    setVoiceState('listening');
    hueShift.value = withTiming(0, { duration: 400 });
    direction.value = withTiming(-1, { duration: 400 });
  });

  useSpeechRecognitionEvent('end', () => {
    // Only auto-transition if still listening (not cancelled)
    if (transcriptRef.current.trim().length > 0) {
      setVoiceState('thinking');
      startThinkingAnimation();
    } else {
      resetToIdle();
    }
  });

  useSpeechRecognitionEvent('result', (event) => {
    const text = event.results[0]?.transcript ?? '';
    transcriptRef.current = text;
    setTranscript(text);
  });

  useSpeechRecognitionEvent('volumechange', (event) => {
    // -2..10 range → 0..1
    const normalized = Math.max(0, Math.min(1, (event.value + 2) / 12));
    intensity.value = normalized;
  });

  useSpeechRecognitionEvent('error', (event) => {
    console.warn('Speech recognition error:', event.error, event.message);
    resetToIdle();
  });

  // --- Animation Helpers ---

  const startThinkingAnimation = useCallback(() => {
    hueShift.value = withTiming(0.3, { duration: 600 });
    intensity.value = withRepeat(
      withSequence(
        withTiming(0.7, { duration: 800, easing: Easing.inOut(Easing.ease) }),
        withTiming(0.3, { duration: 800, easing: Easing.inOut(Easing.ease) }),
      ),
      -1,
      true,
    );
  }, [intensity, hueShift]);

  const startAnsweringAnimation = useCallback(() => {
    cancelAnimation(intensity);
    hueShift.value = withTiming(0.6, { duration: 600 });
    direction.value = withTiming(1, { duration: 600 });
    intensity.value = withRepeat(
      withSequence(
        withTiming(0.8, { duration: 1000, easing: Easing.inOut(Easing.ease) }),
        withTiming(0.5, { duration: 1000, easing: Easing.inOut(Easing.ease) }),
      ),
      -1,
      true,
    );
  }, [intensity, hueShift, direction]);

  const resetToIdle = useCallback(() => {
    setVoiceState('idle');
    setTranscript('');
    transcriptRef.current = '';
    cancelAnimation(intensity);
    cancelAnimation(hueShift);
    cancelAnimation(direction);
    intensity.value = withTiming(0, { duration: 400 });
    hueShift.value = withTiming(0, { duration: 400 });
    direction.value = withTiming(0, { duration: 400 });
  }, [intensity, hueShift, direction]);

  // --- Public API ---

  const startListening = useCallback(async () => {
    const result = await ExpoSpeechRecognitionModule.requestPermissionsAsync();
    if (!result.granted) {
      console.warn('Speech recognition permissions not granted');
      return;
    }
    transcriptRef.current = '';
    setTranscript('');
    ExpoSpeechRecognitionModule.start({
      lang: 'en-US',
      interimResults: true,
      continuous: false,
      volumeChangeEventOptions: {
        enabled: true,
        intervalMillis: 100,
      },
    });
  }, []);

  const stopListening = useCallback(() => {
    ExpoSpeechRecognitionModule.stop();
  }, []);

  const cancel = useCallback(() => {
    ExpoSpeechRecognitionModule.abort();
    Speech.stop();
    resetToIdle();
  }, [resetToIdle]);

  /** Call when AI starts streaming – transitions to "answering" */
  const onAnswerStart = useCallback(() => {
    setVoiceState('answering');
    startAnsweringAnimation();
  }, [startAnsweringAnimation]);

  /** Reset animations then immediately restart speech recognition for the next turn */
  const restartListening = useCallback(() => {
    setTranscript('');
    transcriptRef.current = '';
    cancelAnimation(intensity);
    cancelAnimation(hueShift);
    cancelAnimation(direction);
    intensity.value = withTiming(0, { duration: 300 });
    hueShift.value = withTiming(0, { duration: 300 });
    direction.value = withTiming(0, { duration: 300 });
    ExpoSpeechRecognitionModule.start({
      lang: 'en-US',
      interimResults: true,
      continuous: false,
      volumeChangeEventOptions: {
        enabled: true,
        intervalMillis: 100,
      },
    });
  }, [intensity, hueShift, direction]);

  /** Call when AI response is fully received – speak it via TTS */
  const speakResponse = useCallback(
    (text: string) => {
      Speech.speak(text, {
        language: 'en-US',
        rate: 1.0,
        onDone: () => restartListening(),
        onStopped: () => resetToIdle(),
      });
    },
    [restartListening, resetToIdle],
  );

  /** Consume the current transcript and clear it */
  const consumeTranscript = useCallback((): string => {
    const text = transcriptRef.current;
    transcriptRef.current = '';
    setTranscript('');
    return text;
  }, []);

  return {
    voiceState,
    transcript,
    intensity,
    hueShift,
    direction,
    startListening,
    stopListening,
    cancel,
    onAnswerStart,
    speakResponse,
    consumeTranscript,
  };
}
