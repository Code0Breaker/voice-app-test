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

const STT_CONFIG = {
  lang: 'en-US',
  interimResults: true,
  continuous: false,
  volumeChangeEventOptions: { enabled: true, intervalMillis: 100 },
} as const;

/**
 * Delay before restarting STT in monitoring mode.
 * Gives the audio session a moment to settle after TTS / previous STT ends.
 */
const MONITOR_RESTART_DELAY_MS = 600;

export function useVoice() {
  const [voiceState, setVoiceState] = useState<VoiceState>('idle');
  const [transcript, setTranscript] = useState('');
  const transcriptRef = useRef('');
  const safetyTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isSpeakingTTSRef = useRef(false);
  const voiceSessionActiveRef = useRef(false);
  const monitoringRef = useRef(false);

  const intensity = useSharedValue(0);
  const hueShift = useSharedValue(0);
  const direction = useSharedValue(0);

  // --- helpers to start STT with delay + error handling ---

  const beginSTT = useCallback((delayMs = 0) => {
    setTimeout(() => {
      try {
        ExpoSpeechRecognitionModule.start(STT_CONFIG);
      } catch (e) {
        console.warn('Failed to start speech recognition:', e);
      }
    }, delayMs);
  }, []);

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

  const resetAnimations = useCallback(() => {
    cancelAnimation(intensity);
    cancelAnimation(hueShift);
    cancelAnimation(direction);
    intensity.value = withTiming(0, { duration: 300 });
    hueShift.value = withTiming(0, { duration: 300 });
    direction.value = withTiming(0, { duration: 300 });
  }, [intensity, hueShift, direction]);

  const resetToIdle = useCallback(() => {
    monitoringRef.current = false;
    setVoiceState('idle');
    setTranscript('');
    transcriptRef.current = '';
    resetAnimations();
  }, [resetAnimations]);

  // --- Monitoring: use STT as a passive voice detector ---

  const enterMonitoring = useCallback(() => {
    isSpeakingTTSRef.current = false;
    monitoringRef.current = true;
    setVoiceState('monitoring');
    setTranscript('');
    transcriptRef.current = '';
    resetAnimations();
    beginSTT(MONITOR_RESTART_DELAY_MS);
  }, [resetAnimations, beginSTT]);

  // --- Speech Recognition Events ---

  useSpeechRecognitionEvent('start', () => {
    if (monitoringRef.current) {
      // STT started in monitoring mode — stay in "monitoring" until actual speech arrives.
      // The transition to "listening" happens when we get a result.
      return;
    }
    setVoiceState('listening');
    hueShift.value = withTiming(0, { duration: 400 });
    direction.value = withTiming(-1, { duration: 400 });
  });

  useSpeechRecognitionEvent('end', () => {
    if (transcriptRef.current.trim().length > 0) {
      monitoringRef.current = false;
      setVoiceState('thinking');
      startThinkingAnimation();
    } else if (voiceSessionActiveRef.current) {
      // No speech captured — restart STT to keep monitoring
      enterMonitoring();
    } else {
      resetToIdle();
    }
  });

  useSpeechRecognitionEvent('result', (event) => {
    const text = event.results[0]?.transcript ?? '';
    transcriptRef.current = text;
    setTranscript(text);

    if (monitoringRef.current && text.trim().length > 0) {
      // Voice detected during monitoring — transition to active listening
      monitoringRef.current = false;
      setVoiceState('listening');
      hueShift.value = withTiming(0, { duration: 400 });
      direction.value = withTiming(-1, { duration: 400 });
    }
  });

  useSpeechRecognitionEvent('volumechange', (event) => {
    const normalized = Math.max(0, Math.min(1, (event.value + 2) / 12));
    intensity.value = normalized;

    if (monitoringRef.current && normalized > 0.3) {
      // Significant volume during monitoring — transition to listening
      monitoringRef.current = false;
      setVoiceState('listening');
      hueShift.value = withTiming(0, { duration: 400 });
      direction.value = withTiming(-1, { duration: 400 });
    }
  });

  useSpeechRecognitionEvent('error', (event) => {
    console.warn('Speech recognition error:', event.error, event.message);
    if (voiceSessionActiveRef.current) {
      enterMonitoring();
    } else {
      resetToIdle();
    }
  });

  // --- Interrupt TTS / answering (tap-to-interrupt) ---

  const interruptTTS = useCallback(() => {
    if (safetyTimerRef.current) {
      clearTimeout(safetyTimerRef.current);
      safetyTimerRef.current = null;
    }
    Speech.stop();
    isSpeakingTTSRef.current = false;
    setTranscript('');
    transcriptRef.current = '';
    enterMonitoring();
  }, [enterMonitoring]);

  // --- Public API ---

  const startListening = useCallback(async () => {
    const result = await ExpoSpeechRecognitionModule.requestPermissionsAsync();
    if (!result.granted) {
      console.warn('Speech recognition permissions not granted');
      return;
    }
    voiceSessionActiveRef.current = true;
    monitoringRef.current = false;
    transcriptRef.current = '';
    setTranscript('');
    beginSTT();
  }, [beginSTT]);

  const stopListening = useCallback(() => {
    ExpoSpeechRecognitionModule.stop();
  }, []);

  const cancel = useCallback(() => {
    if (safetyTimerRef.current) {
      clearTimeout(safetyTimerRef.current);
      safetyTimerRef.current = null;
    }
    voiceSessionActiveRef.current = false;
    monitoringRef.current = false;
    isSpeakingTTSRef.current = false;
    ExpoSpeechRecognitionModule.abort();
    Speech.stop();
    resetToIdle();
  }, [resetToIdle]);

  const onAnswerStart = useCallback(() => {
    isSpeakingTTSRef.current = true;
    setVoiceState('answering');
    startAnsweringAnimation();
  }, [startAnsweringAnimation]);

  const speakResponse = useCallback(
    (text: string) => {
      isSpeakingTTSRef.current = true;

      safetyTimerRef.current = setTimeout(() => {
        console.warn('TTS onDone did not fire – entering monitoring');
        enterMonitoring();
      }, Math.max(text.length * 80, 5000));

      Speech.speak(text, {
        language: 'en-US',
        rate: 1.0,
        onDone: () => {
          if (safetyTimerRef.current) {
            clearTimeout(safetyTimerRef.current);
            safetyTimerRef.current = null;
          }
          enterMonitoring();
        },
        onStopped: () => {
          if (safetyTimerRef.current) {
            clearTimeout(safetyTimerRef.current);
            safetyTimerRef.current = null;
          }
          enterMonitoring();
        },
      });
    },
    [enterMonitoring],
  );

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
    interruptTTS,
  };
}
