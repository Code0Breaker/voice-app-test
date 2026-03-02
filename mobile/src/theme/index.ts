export const colors = {
  primary: '#1A1A1A',
  background: '#FFFFFF',
  surface: '#F5F5F5',
  surfaceAlt: '#F0F0F0',
  textPrimary: '#1A1A1A',
  textSecondary: '#999',
  textMuted: '#888',
  textPlaceholder: '#999',
  icon: '#666',
  white: '#FFFFFF',
  shadow: '#000',
  transparent: 'transparent',
} as const;

export const spacing = {
  xs: 2,
  sm: 4,
  md: 8,
  lg: 12,
  xl: 16,
  xxl: 20,
  xxxl: 32,
} as const;

export const radii = {
  sm: 4,
  md: 12,
  lg: 16,
  xl: 18,
  xxl: 20,
  round: 22,
} as const;

export const typography = {
  body: { fontSize: 16, lineHeight: 22 },
  bodyLarge: { fontSize: 17 },
  heading: { fontSize: 28 },
  transcription: { fontSize: 24, lineHeight: 34 },
  icon: { fontSize: 22 },
  iconSmall: { fontSize: 18 },
  iconMicro: { fontSize: 16 },
  iconLarge: { fontSize: 20 },
  iconXL: { fontSize: 22 },
} as const;
