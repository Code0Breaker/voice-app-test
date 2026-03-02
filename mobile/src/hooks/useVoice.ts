import { useCallback, useRef, useState } from 'react';
import {
  ExpoSpeechRecognitionModule,
  useSpeechRecognitionEvent,
} from 'expo-speech-recognition';
import * as Speech from 'expo-speech';
import { withTiming } from 'react-native-reanimated';
import type { VoiceState } from '../types';
import {
  STT_CONFIG,
  MONITOR_RESTART_DELAY_MS,
  MAX_MONITOR_RETRIES,
} from '../config';
import { useVoiceAnimations } from './useVoiceAnimations';
import { useTTS } from './useTTS';

export function useVoice() {
  const [voiceState, setVoiceState] = useState<VoiceState>('idle');
  const [transcript, setTranscript] = useState('');
  const transcriptRef = useRef('');
  const voiceSessionActiveRef = useRef(false);
  const monitoringRef = useRef(false);
  const monitorRetryCountRef = useRef(0);
  const monitorRestartTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const sttErrorHandledRef = useRef(false);

  const {
    intensity,
    hueShift,
    direction,
    startThinkingAnimation,
    startAnsweringAnimation,
    resetAnimations,
  } = useVoiceAnimations();

  // --- Monitoring: restart timer management ---

  const clearMonitorRestartTimer = useCallback(() => {
    if (monitorRestartTimerRef.current) {
      clearTimeout(monitorRestartTimerRef.current);
      monitorRestartTimerRef.current = null;
    }
  }, []);

  const resetToIdle = useCallback(() => {
    clearMonitorRestartTimer();
    monitoringRef.current = false;
    setVoiceState('idle');
    setTranscript('');
    transcriptRef.current = '';
    resetAnimations();
  }, [resetAnimations, clearMonitorRestartTimer]);

  const restartMonitoringSTT = useCallback(() => {
    if (!monitoringRef.current || !voiceSessionActiveRef.current) return;
    clearMonitorRestartTimer();
    monitorRestartTimerRef.current = setTimeout(() => {
      monitorRestartTimerRef.current = null;
      if (monitoringRef.current && voiceSessionActiveRef.current) {
        try {
          ExpoSpeechRecognitionModule.start(STT_CONFIG);
        } catch (e) {
          console.warn('Failed to restart monitoring STT:', e);
        }
      }
    }, MONITOR_RESTART_DELAY_MS);
  }, [clearMonitorRestartTimer]);

  const enterMonitoring = useCallback(() => {
    clearMonitorRestartTimer();
    monitoringRef.current = true;
    monitorRetryCountRef.current = 0;
    setVoiceState('monitoring');
    setTranscript('');
    transcriptRef.current = '';
    resetAnimations();
    Speech.stop();
    restartMonitoringSTT();
  }, [resetAnimations, restartMonitoringSTT, clearMonitorRestartTimer]);

  const { speakResponse, interruptTTS, stopTTS, clearSafetyTimer } = useTTS(enterMonitoring);

  // --- helpers to start STT with delay + error handling ---

  const beginSTT = useCallback((delayMs = 0, retries = 2) => {
    setTimeout(() => {
      try {
        ExpoSpeechRecognitionModule.start(STT_CONFIG);
      } catch (e) {
        console.warn('Failed to start speech recognition:', e);
        if (retries > 0 && voiceSessionActiveRef.current) {
          beginSTT(MONITOR_RESTART_DELAY_MS, retries - 1);
        }
      }
    }, delayMs);
  }, []);

  // --- Speech Recognition Events ---

  useSpeechRecognitionEvent('start', () => {
    sttErrorHandledRef.current = false;
    if (monitoringRef.current) return;
    setVoiceState('listening');
    hueShift.value = withTiming(0, { duration: 400 });
    direction.value = withTiming(-1, { duration: 400 });
  });

  useSpeechRecognitionEvent('end', () => {
    if (transcriptRef.current.trim().length > 0) {
      monitoringRef.current = false;
      setVoiceState('thinking');
      startThinkingAnimation();
    } else if (sttErrorHandledRef.current) {
      // error handler already scheduled a restart
    } else if (monitoringRef.current) {
      restartMonitoringSTT();
    } else if (voiceSessionActiveRef.current) {
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
      monitoringRef.current = false;
      setVoiceState('listening');
      hueShift.value = withTiming(0, { duration: 400 });
      direction.value = withTiming(-1, { duration: 400 });
    }
  });

  useSpeechRecognitionEvent('error', (event) => {
    const isNoSpeech = event.error === 'no-speech';
    sttErrorHandledRef.current = true;

    if (!isNoSpeech) {
      console.warn('Speech recognition error:', event.error, event.message);
    }

    if (!voiceSessionActiveRef.current) {
      resetToIdle();
      return;
    }

    if (monitoringRef.current) {
      if (isNoSpeech) {
        restartMonitoringSTT();
        return;
      }
      monitorRetryCountRef.current += 1;
      if (monitorRetryCountRef.current > MAX_MONITOR_RETRIES) {
        console.warn('Max monitoring retries reached, staying in monitoring without STT');
        return;
      }
      restartMonitoringSTT();
    } else {
      enterMonitoring();
    }
  });

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
    clearSafetyTimer();
    clearMonitorRestartTimer();
    voiceSessionActiveRef.current = false;
    monitoringRef.current = false;
    ExpoSpeechRecognitionModule.abort();
    stopTTS();
    resetToIdle();
  }, [resetToIdle, stopTTS, clearSafetyTimer, clearMonitorRestartTimer]);

  const onAnswerStart = useCallback(() => {
    setVoiceState('answering');
    startAnsweringAnimation();
  }, [startAnsweringAnimation]);

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
