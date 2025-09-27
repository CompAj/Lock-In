export type ThemeName = 'light' | 'dark';

type ThemePalette = {
  background: string;
  foreground: string;
  tabActive: string;
  tabInactive: string;
  tabBarBackground: string;
  tabBorder: string;
  surface: string;
};

const lightPalette: ThemePalette = {
  background: '#FFFFFF',
  foreground: '#1A202C',
  tabActive: '#E53E3E',
  tabInactive: '#A0AEC0',
  tabBarBackground: '#F3F4F6',
  tabBorder: '#E2E8F0',
  surface: '#FFFFFF',
};

const darkPalette: ThemePalette = {
  background: '#0F172A',
  foreground: '#E2E8F0',
  tabActive: '#F97373',
  tabInactive: '#64748B',
  tabBarBackground: '#111827',
  tabBorder: '#1F2933',
  surface: '#0F172A',
};

export const palettes: Record<ThemeName, ThemePalette> = {
  light: lightPalette,
  dark: darkPalette,
};

export function resolvePalette(colorScheme: 'light' | 'dark' | null | undefined) {
  return palettes[colorScheme === 'dark' ? 'dark' : 'light'];
}
