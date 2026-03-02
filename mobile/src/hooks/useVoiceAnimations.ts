import { useCallback } from 'react';
import {
  useSharedValue,
  withTiming,
  withRepeat,
  withSequence,
  cancelAnimation,
  Easing,
} from 'react-native-reanimated';

export function useVoiceAnimations() {
  const intensity = useSharedValue(0);
  const hueShift = useSharedValue(0);
  const direction = useSharedValue(0);

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

  return {
    intensity,
    hueShift,
    direction,
    startThinkingAnimation,
    startAnsweringAnimation,
    resetAnimations,
  };
}
