import type { SharedValue } from 'react-native-reanimated';

export type VoiceState = 'idle' | 'monitoring' | 'listening' | 'thinking' | 'answering';

export interface WaveVisualizerProps {
  width: number;
  height: number;
  intensity: SharedValue<number>;
  hueShift: SharedValue<number>;
  direction: SharedValue<number>;
}

export interface VoiceControlsProps {
  onClose: () => void;
  onMuteToggle: () => void;
  isMuted?: boolean;
}

export interface TranscriptionOverlayProps {
  text: string;
}

export interface ChatInputProps {
  onSubmit: (text: string) => void;
  onMicPress: () => void;
  disabled?: boolean;
}

export interface HeaderProps {
  onMenuPress?: () => void;
  onClosePress?: () => void;
}
