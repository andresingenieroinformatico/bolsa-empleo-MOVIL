/**
 * UniEmpleo design tokens.
 *
 * The palette keeps the original UNIPAZ identity: institutional green,
 * deep navy and a calm neutral canvas. Every screen consumes these tokens
 * instead of hard-coded hex values so the product stays visually coherent.
 */

import '@/global.css';

import { Platform } from 'react-native';

/* -------------------------------------------------------------------------- */
/*  Brand palette                                                             */
/* -------------------------------------------------------------------------- */

export const Brand = {
  /** Institutional green — primary actions and confirmation states. */
  green: '#00963F',
  greenDark: '#007832',
  greenDeep: '#045B2B',
  greenTint: '#E6F7ED',
  greenTintStrong: '#D3EFDE',
  greenLine: '#B7E3C8',

  /** Institutional navy — headers, identity and dark surfaces. */
  navy: '#0D1B4C',
  navyDeep: '#091437',
  navySoft: '#15265C',
  navyLine: 'rgba(255, 255, 255, 0.16)',

  /** Support blue, used sparingly for informational states. */
  blue: '#154E9B',
  blueTint: '#EAF1FB',
  blueLine: '#C8DAF5',

  /** Text. */
  ink: '#161D2E',
  inkSoft: '#323B50',
  slate: '#596377',
  slateSoft: '#7A8496',
  slateFaint: '#98A1B0',

  /** Surfaces and hairlines. */
  canvas: '#F4F5F7',
  surface: '#FFFFFF',
  surfaceMuted: '#F8F9FB',
  surfaceSunken: '#EFF1F5',
  line: '#E3E7EE',
  lineSoft: '#EDF0F5',
  lineStrong: '#D2D8E2',

  /** Semantic states. */
  amber: '#9A5B08',
  amberTint: '#FDF3E1',
  amberLine: '#F1DDB8',
  red: '#B42318',
  redTint: '#FEF3F2',
  redLine: '#F7C9C5',
  teal: '#0F6B6B',
  tealTint: '#E7F5F5',

  /** Fixed overlays. */
  overlay: 'rgba(9, 18, 44, 0.55)',
  overlaySoft: 'rgba(9, 18, 44, 0.32)',
} as const;

/* -------------------------------------------------------------------------- */
/*  Spacing / radius / shadows                                                */
/* -------------------------------------------------------------------------- */

/** 4-point spacing scale. */
export const Space = {
  xxs: 2,
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
  xxxl: 32,
  huge: 40,
  giant: 56,
} as const;

/** Corner radii. Cards are 16, sheets 24, controls 12. */
export const Radius = {
  xs: 6,
  sm: 8,
  md: 10,
  lg: 12,
  xl: 16,
  xxl: 20,
  sheet: 24,
  pill: 999,
} as const;

export const Shadows = {
  card: {
    shadowColor: '#0D1B4C',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 12,
    elevation: 2,
  },
  raised: {
    shadowColor: '#0D1B4C',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.1,
    shadowRadius: 24,
    elevation: 6,
  },
  sheet: {
    shadowColor: '#091437',
    shadowOffset: { width: 0, height: -8 },
    shadowOpacity: 0.16,
    shadowRadius: 32,
    elevation: 18,
  },
  floating: {
    shadowColor: '#091437',
    shadowOffset: { width: 0, height: 14 },
    shadowOpacity: 0.18,
    shadowRadius: 36,
    elevation: 20,
  },
} as const;

/* -------------------------------------------------------------------------- */
/*  Type scale                                                                */
/* -------------------------------------------------------------------------- */

export const Type = {
  display: {
    fontSize: 34,
    lineHeight: 40,
    fontWeight: '800' as const,
    letterSpacing: -1.1,
  },
  displayLarge: {
    fontSize: 50,
    lineHeight: 54,
    fontWeight: '800' as const,
    letterSpacing: -1.7,
  },
  title: {
    fontSize: 24,
    lineHeight: 30,
    fontWeight: '800' as const,
    letterSpacing: -0.6,
  },
  titleSmall: {
    fontSize: 19,
    lineHeight: 25,
    fontWeight: '800' as const,
    letterSpacing: -0.35,
  },
  heading: {
    fontSize: 16,
    lineHeight: 22,
    fontWeight: '700' as const,
    letterSpacing: -0.2,
  },
  body: {
    fontSize: 14,
    lineHeight: 21,
    fontWeight: '400' as const,
  },
  bodyStrong: {
    fontSize: 14,
    lineHeight: 21,
    fontWeight: '600' as const,
  },
  label: {
    fontSize: 12,
    lineHeight: 16,
    fontWeight: '600' as const,
  },
  caption: {
    fontSize: 12,
    lineHeight: 17,
    fontWeight: '400' as const,
  },
  overline: {
    fontSize: 10,
    lineHeight: 14,
    fontWeight: '800' as const,
    letterSpacing: 1.15,
  },
} as const;

/* -------------------------------------------------------------------------- */
/*  Backwards-compatible theme (used by the Expo template files)              */
/* -------------------------------------------------------------------------- */

export const Colors = {
  light: {
    text: Brand.ink,
    background: Brand.surface,
    backgroundElement: '#F0F0F3',
    backgroundSelected: '#E0E1E6',
    textSecondary: '#60646C',
  },
  dark: {
    text: '#ffffff',
    background: '#000000',
    backgroundElement: '#212225',
    backgroundSelected: '#2E3135',
    textSecondary: '#B0B4BA',
  },
} as const;

export type ThemeColor = keyof typeof Colors.light & keyof typeof Colors.dark;

export const Fonts = Platform.select({
  ios: {
    /** iOS `UIFontDescriptorSystemDesignDefault` */
    sans: 'system-ui',
    /** iOS `UIFontDescriptorSystemDesignSerif` */
    serif: 'ui-serif',
    /** iOS `UIFontDescriptorSystemDesignRounded` */
    rounded: 'ui-rounded',
    /** iOS `UIFontDescriptorSystemDesignMonospaced` */
    mono: 'ui-monospace',
  },
  default: {
    sans: 'normal',
    serif: 'serif',
    rounded: 'normal',
    mono: 'monospace',
  },
  web: {
    sans: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif',
    serif: 'var(--font-serif)',
    rounded: 'var(--font-rounded)',
    mono: 'var(--font-mono)',
  },
});

export const Spacing = {
  half: 2,
  one: 4,
  two: 8,
  three: 16,
  four: 24,
  five: 32,
  six: 64,
} as const;

export const BottomTabInset = Platform.select({ ios: 50, android: 80 }) ?? 0;
export const MaxContentWidth = 800;
