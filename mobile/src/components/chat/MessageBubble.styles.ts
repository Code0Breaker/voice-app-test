import { StyleSheet } from 'react-native';
import { colors, radii, spacing, typography } from '../../theme';

export const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    marginVertical: spacing.sm,
    marginHorizontal: spacing.xl,
  },
  rowUser: {
    justifyContent: 'flex-end',
  },
  bubble: {
    maxWidth: '80%',
    borderRadius: radii.xl,
    paddingHorizontal: spacing.xl,
    paddingVertical: 10,
  },
  bubbleUser: {
    backgroundColor: colors.surfaceAlt,
    borderTopRightRadius: radii.sm,
  },
  bubbleAI: {
    backgroundColor: colors.transparent,
  },
  text: {
    fontSize: typography.body.fontSize,
    lineHeight: typography.body.lineHeight,
  },
  textUser: {
    color: colors.textPrimary,
  },
  textAI: {
    color: colors.textPrimary,
  },
});
