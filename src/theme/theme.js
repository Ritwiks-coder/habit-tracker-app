// theme.js  —  Habit Tracker Design System v2
export const typography = {
  display:    { fontSize: 40, fontWeight: '800', letterSpacing: -1.0, lineHeight: 48 },
  h1:         { fontSize: 32, fontWeight: '700', letterSpacing: -0.8, lineHeight: 38 },
  h2:         { fontSize: 26, fontWeight: '700', letterSpacing: -0.5, lineHeight: 32 },
  h3:         { fontSize: 20, fontWeight: '600', letterSpacing: -0.3, lineHeight: 26 },
  h4:         { fontSize: 17, fontWeight: '600', letterSpacing: -0.2, lineHeight: 22 },
  bodyLg:     { fontSize: 16, fontWeight: '400', letterSpacing: 0,    lineHeight: 24 },
  body:       { fontSize: 14, fontWeight: '400', letterSpacing: 0,    lineHeight: 21 },
  bodySm:     { fontSize: 13, fontWeight: '400', letterSpacing: 0,    lineHeight: 19 },
  label:      { fontSize: 14, fontWeight: '600', letterSpacing: 0.1,  lineHeight: 20 },
  labelSm:    { fontSize: 12, fontWeight: '600', letterSpacing: 0.2,  lineHeight: 16 },
  caption:    { fontSize: 11, fontWeight: '500', letterSpacing: 0.3,  lineHeight: 15 },
  stat:       { fontSize: 42, fontWeight: '900', letterSpacing: -1.5, lineHeight: 48 },
  badge:      { fontSize: 12, fontWeight: '700', letterSpacing: 0.5,  lineHeight: 14 },
};

export const palette = {
  amber50:   '#FFFBEB', amber100:  '#FEF3C7', amber400:  '#FBBF24', amber500:  '#F59E0B', amber600:  '#D97706', amber700:  '#B45309',
  green50:   '#F0FDF4', green100:  '#DCFCE7', green400:  '#4ADE80', green500:  '#22C55E', green600:  '#16A34A', green700:  '#15803D',
  white:     '#FFFFFF', gray50:    '#F9FAFB', gray100:   '#F3F4F6', gray200:   '#E5E7EB', gray300:   '#D1D5DB', gray400:   '#9CA3AF',
  gray500:   '#6B7280', gray600:   '#4B5563', gray700:   '#374151', gray800:   '#1F2937', gray900:   '#111827', black:     '#0A0A0A',
  rose100:   '#FFE4E6', rose200:   '#FECDD3', roseText:  '#F43F5E',
  amberBorder: 'rgba(245,158,11,0.20)', greenOverlay:'rgba(34,197,94,0.08)', shadowColor: '#000000',
};

export const colors = {
  background:    palette.gray50, surface:       palette.white, surfaceRaised: palette.white, surfaceTinted: palette.amber50,
  primary:       palette.amber500, primaryLight:  palette.amber50, primaryBorder: palette.amberBorder,
  success:       palette.green500, successLight:  palette.green50, successBorder: 'rgba(34,197,94,0.25)',
  textPrimary:   palette.gray900, textSecondary: palette.gray500, textTertiary:  palette.gray400, textOnDark:    palette.white, textInverse:   palette.white,
  border:        palette.gray200, borderLight:   'rgba(0,0,0,0.06)', divider:       palette.gray100,
  error:         '#EF4444', errorLight:    '#FEF2F2', warning:       palette.amber500, warningLight:  palette.amber50,
  pressed:       'rgba(0,0,0,0.06)', focused:       palette.amber500, disabled:      palette.gray300, disabledText:  palette.gray400,
  adGreen:       '#00D084', coinGold:      palette.amber500, streakFire:    '#FF6B2B',
};

export const spacing = { xs: 4, sm: 8, md: 12, base: 16, lg: 20, xl: 24, '2xl':32, '3xl':40, '4xl':48, '5xl':64 };
export const radius = { sm: 8, md: 12, lg: 16, xl: 24, '2xl':32, pill: 999 };

export const shadow = {
  none: { shadowColor: 'transparent', elevation: 0 },
  sm: { shadowColor: palette.shadowColor, shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 8, elevation: 2 },
  md: { shadowColor: palette.shadowColor, shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.09, shadowRadius: 20, elevation: 5 },
  lg: { shadowColor: palette.shadowColor, shadowOffset: { width: 0, height: 12 }, shadowOpacity: 0.12, shadowRadius: 32, elevation: 8 },
};

export const components = {
  button: { height: 52, borderRadius: radius.pill, paddingH: spacing.xl },
  card: {
    default: { backgroundColor: colors.surface, borderRadius: radius.md, padding: spacing.base, borderWidth: 1, borderColor: colors.borderLight, ...shadow.sm },
    swipe: { backgroundColor: colors.surface, borderRadius: radius['2xl'], paddingVertical: spacing['3xl'], paddingHorizontal: spacing.xl, borderWidth: 1, borderColor: colors.successBorder, ...shadow.lg },
  },
  modal: { backgroundColor: colors.surface, borderRadius: radius.lg, padding: spacing.xl, maxWidth: 380, widthPercent: '88%', ...shadow.md },
};

const theme = { typography, palette, colors, spacing, radius, shadow, components };
export default theme;
