export const tokens = {
  color: {
    brand: {
      primary: '#030213',
      primaryDarken: '#02010e',
      secondary: '#ececf0',
      secondaryDarken: '#dbdbe5',
      accent: '#ffb400',
    },
    semantic: {
      success: '#56CA00',
      info: '#16B1FF',
      warning: '#FFB400',
      error: '#FF4C51',
    },
    neutral: {
      50: '#FAFAFA',
      100: '#F5F5F5',
      200: '#EEEEEE',
      300: '#E0E0E0',
      400: '#BDBDBD',
      500: '#9E9E9E',
      600: '#757575',
      700: '#616161',
      800: '#424242',
      900: '#212121',
    },
    light: {
      background: '#FFFFFF',
      surface: '#FFFFFF',
      surfaceMuted: '#ececf0',
      text: '#030213',
      textMuted: '#6B647D',
      border: '#DBDADE',
      track: '#ececf0',
    },
    dark: {
      background: '#030213',
      surface: '#030213',
      surfaceMuted: '#1a1825',
      text: '#FFFFFF',
      textMuted: '#B6BEE3',
      border: '#4A5072',
      track: '#474360',
    },
  },
  typography: {
    fontFamily: {
      heading:
        '"Inter", -apple-system, blinkmacsystemfont, "Segoe UI", roboto, "Helvetica Neue", arial, sans-serif',
      body:
        '"Inter", -apple-system, blinkmacsystemfont, "Segoe UI", roboto, "Helvetica Neue", arial, sans-serif',
      mono:
        '"SFMono-Regular", ui-monospace, "JetBrains Mono", "Cascadia Code", "Fira Code", monospace',
    },
    fontSize: {
      'xs': '0.75rem',
      'sm': '0.8125rem',
      'md': '0.9375rem',
      'lg': '1.125rem',
      'xl': '1.5rem',
      '2xl': '1.75rem',
      '3xl': '2.375rem',
      '4xl': '2.875rem',
    },
    lineHeight: {
      tight: '1.15',
      snug: '1.35',
      normal: '1.5',
      relaxed: '1.75',
    },
    fontWeight: {
      regular: 400,
      medium: 500,
      semibold: 600,
      bold: 700,
    },
  },
  spacing: {
    'xs': '4px',
    'sm': '8px',
    'md': '12px',
    'lg': '16px',
    'xl': '24px',
    '2xl': '32px',
    '3xl': '40px',
    '4xl': '48px',
  },
  radius: {
    xs: '0.375rem',
    sm: '0.5rem',
    md: '0.625rem',
    lg: '0.75rem',
    xl: '1rem',
    pill: '999px',
  },
  shadow: {
    xs: '0 1px 2px 0 rgb(0 0 0 / 0.05)',
    sm: '0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)',
    md: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
    lg: '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)',
  },
} as const

export type DesignTokens = typeof tokens
