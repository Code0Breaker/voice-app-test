import { StyleSheet } from 'react-native';
import { colors, spacing, radii, typography } from '../../theme';

export const styles = StyleSheet.create({
  container: {
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.lg,
    backgroundColor: colors.background,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  plusBtn: {
    width: 36,
    height: 36,
    borderRadius: radii.xl,
    backgroundColor: colors.surfaceAlt,
    alignItems: 'center',
    justifyContent: 'center',
  },
  plusText: {
    fontSize: typography.iconXL.fontSize,
    color: colors.icon,
    marginTop: -2,
  },
  input: {
    flex: 1,
    height: 44,
    borderRadius: radii.round,
    backgroundColor: colors.surface,
    paddingHorizontal: spacing.xl,
    fontSize: typography.body.fontSize,
    color: colors.textPrimary,
  },
  sendBtn: {
    width: 36,
    height: 36,
    borderRadius: radii.xl,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sendArrow: {
    color: colors.white,
    fontSize: typography.iconSmall.fontSize,
    fontWeight: '700',
  },
  micBtn: {
    width: 44,
    height: 44,
    borderRadius: radii.md,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  micIcon: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  micWave: {
    color: colors.white,
    fontSize: typography.iconLarge.fontSize,
  },
});
