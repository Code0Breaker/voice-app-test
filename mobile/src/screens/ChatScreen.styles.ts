import { StyleSheet, Dimensions } from 'react-native';
import { colors, radii, typography } from '../theme';

const { height: SCREEN_H } = Dimensions.get('window');
export const WAVE_INLINE_H = SCREEN_H * 0.28;

export const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.background,
  },
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  voiceRoot: {
    flex: 1,
    backgroundColor: colors.background,
  },
  voiceTopSection: {
    flex: 1,
    zIndex: 2,
  },
  waveInline: {
    height: WAVE_INLINE_H,
    overflow: 'hidden',
    borderTopLeftRadius: radii.xxl,
    borderTopRightRadius: radii.xxl,
  },
  monitoringHint: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  monitoringText: {
    fontSize: typography.bodyLarge.fontSize,
    fontWeight: '400',
    color: colors.textSecondary,
  },
});
