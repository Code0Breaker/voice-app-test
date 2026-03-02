import { StyleSheet } from 'react-native';
import { colors, spacing, typography } from '../../theme';

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: spacing.xxxl,
  },
  text: {
    fontSize: typography.transcription.fontSize,
    lineHeight: typography.transcription.lineHeight,
    color: colors.textMuted,
    textAlign: 'left',
  },
});
