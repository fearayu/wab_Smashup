export const tokens = {
  color: {
    brand: {
      primary: '#1B5E20',
      primaryDarken: '#124d18',
      secondary: '#ececf0',
      secondaryDarken: '#dbdbe5',
      accent: '#FF6F00',
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
      background: '#F0F7F0',
      surface: '#FFFFFF',
      surfaceMuted: '#E8F5E9',
      text: '#1B5E20',
      textMuted: '#4A7C59',
      border: '#C8E6C9',
      track: '#E8F5E9',
    },
    dark: {
      background: '#0D2818',
      surface: '#1B3A2A',
      surfaceMuted: '#2D5A3D',
      text: '#FFFFFF',
      textMuted: '#A8D5BA',
      border: '#3D6B4F',
      track: '#2D5A3D',
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
