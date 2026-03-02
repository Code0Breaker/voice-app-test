import { useCallback, useRef } from 'react';
import * as Speech from 'expo-speech';
import { TTS_SAFETY_MULTIPLIER, TTS_MIN_SAFETY_MS } from '../config';

export function useTTS(onFinished: () => void) {
  const safetyTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isSpeakingTTSRef = useRef(false);

  const clearSafetyTimer = useCallback(() => {
    if (safetyTimerRef.current) {
      clearTimeout(safetyTimerRef.current);
      safetyTimerRef.current = null;
    }
  }, []);

  const speakResponse = useCallback(
    (text: string) => {
      isSpeakingTTSRef.current = true;

      safetyTimerRef.current = setTimeout(() => {
        console.warn('TTS onDone did not fire – entering monitoring');
        onFinished();
      }, Math.max(text.length * TTS_SAFETY_MULTIPLIER, TTS_MIN_SAFETY_MS));

      Speech.speak(text, {
        language: 'en-US',
        rate: 1.0,
        onDone: () => {
          clearSafetyTimer();
          onFinished();
        },
        onStopped: () => {
          clearSafetyTimer();
          onFinished();
        },
      });
    },
    [onFinished, clearSafetyTimer],
  );

  const interruptTTS = useCallback(() => {
    clearSafetyTimer();
    Speech.stop();
    isSpeakingTTSRef.current = false;
  }, [clearSafetyTimer]);

  const stopTTS = useCallback(() => {
    clearSafetyTimer();
    Speech.stop();
    isSpeakingTTSRef.current = false;
  }, [clearSafetyTimer]);

  return {
    speakResponse,
    interruptTTS,
    stopTTS,
    isSpeakingTTSRef,
    clearSafetyTimer,
  };
}
