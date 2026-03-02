import { StyleSheet } from 'react-native';
import { colors, spacing, typography } from '../../theme';

export const styles = StyleSheet.create({
  greeting: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  greetTitle: {
    fontSize: typography.heading.fontSize,
    fontWeight: '600',
    color: colors.textPrimary,
    marginBottom: spacing.sm,
  },
  greetSub: {
    fontSize: typography.heading.fontSize,
    fontWeight: '300',
    color: colors.textPrimary,
  },
  messageList: {
    paddingVertical: spacing.md,
    flexGrow: 1,
  },
});
