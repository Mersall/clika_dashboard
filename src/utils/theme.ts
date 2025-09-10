export const theme = {
  colors: {
    // Dark theme colors (default)
    dark: {
      background: '#0F172A',
      surface: '#1E293B',
      surfaceLight: '#334155',
      primary: '#8dc63f',
      primaryDark: '#7AB332',
      primaryLight: '#A0D456',
      secondary: '#ff6b6b',
      secondaryDark: '#E85555',
      secondaryLight: '#FF8181',
      success: '#8dc63f',
      warning: '#F59E0B',
      error: '#ff6b6b',
      info: '#3B82F6',
      text: {
        primary: '#F8FAFC',
        secondary: '#CBD5E1',
        tertiary: '#94A3B8',
        inverse: '#0F172A',
      },
      border: '#334155',
      overlay: 'rgba(0, 0, 0, 0.5)',
    },
    // Light theme colors
    light: {
      background: '#F8FAFC',
      surface: '#FFFFFF',
      surfaceLight: '#F1F5F9',
      primary: '#8dc63f',
      primaryDark: '#7AB332',
      primaryLight: '#A0D456',
      secondary: '#ff6b6b',
      secondaryDark: '#E85555',
      secondaryLight: '#FF8181',
      success: '#8dc63f',
      warning: '#F59E0B',
      error: '#ff6b6b',
      info: '#3B82F6',
      text: {
        primary: '#0F172A',
        secondary: '#475569',
        tertiary: '#64748B',
        inverse: '#F8FAFC',
      },
      border: '#E2E8F0',
      overlay: 'rgba(0, 0, 0, 0.3)',
    },
  },
  spacing: {
    xs: '0.25rem', // 4px
    sm: '0.5rem',  // 8px
    md: '1rem',    // 16px
    lg: '1.5rem',  // 24px
    xl: '2rem',    // 32px
    xxl: '3rem',   // 48px
  },
  radius: {
    sm: '0.5rem',   // 8px
    md: '1rem',     // 16px
    lg: '1.5rem',   // 24px
    xl: '2rem',     // 32px
    full: '9999px',
  },
  shadows: {
    sm: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
    md: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
    lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
    xl: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
  },
};

export type ThemeMode = 'dark' | 'light';
export type Theme = typeof theme.colors.dark;