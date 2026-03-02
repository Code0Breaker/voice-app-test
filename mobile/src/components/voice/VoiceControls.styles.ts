import { StyleSheet } from 'react-native';
import { colors, radii, spacing, typography } from '../../theme';

export const styles = StyleSheet.create({
  pill: {
    position: 'absolute',
    bottom: 40,
    right: spacing.xxl,
    flexDirection: 'row',
    backgroundColor: colors.background,
    borderRadius: radii.lg,
    paddingHorizontal: 6,
    paddingVertical: 6,
    gap: spacing.xs,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 6,
  },
  btn: {
    width: 40,
    height: 40,
    borderRadius: radii.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  btnText: {
    fontSize: typography.iconSmall.fontSize,
    color: colors.textPrimary,
  },
  closeText: {
    fontSize: typography.iconMicro.fontSize,
    color: colors.textPrimary,
    fontWeight: '600',
  },
});
