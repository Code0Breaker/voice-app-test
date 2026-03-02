export const SERVER_URL = __DEV__
  ? 'http://localhost:3000'
  : 'http://localhost:3000';

export const STT_CONFIG = {
  lang: 'en-US',
  interimResults: true,
  continuous: false,
  volumeChangeEventOptions: { enabled: true, intervalMillis: 100 },
} as const;

export const MONITOR_RESTART_DELAY_MS = 1000;

export const MAX_MONITOR_RETRIES = 5;

export const TTS_SAFETY_MULTIPLIER = 80;
export const TTS_MIN_SAFETY_MS = 5000;
