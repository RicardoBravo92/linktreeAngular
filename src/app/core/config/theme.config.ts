/**
 * Shared theme configuration constants
 * Single source of truth for all theme options across components
 */

export interface ThemeOption {
  label: string;
  value: string;
}

export const THEME_GRADIENTS: ThemeOption[] = [
  { label: 'Indigo to Purple', value: 'from-indigo-500 to-purple-600' },
  { label: 'Pink to Orange', value: 'from-pink-500 to-orange-400' },
  { label: 'Teal to Blue', value: 'from-teal-500 to-blue-600' },
  { label: 'Green to Teal', value: 'from-green-500 to-teal-400' },
  { label: 'Red to Pink', value: 'from-red-500 to-pink-500' },
  { label: 'Dark', value: 'from-gray-800 to-gray-900' },
  { label: 'Sunset', value: 'from-orange-500 to-red-500' },
  { label: 'Ocean', value: 'from-blue-500 to-cyan-400' },
];

export const THEME_BUTTON_STYLES: ThemeOption[] = [
  { label: 'Rounded', value: 'rounded' },
  { label: 'Pill', value: 'pill' },
  { label: 'Square', value: 'square' },
];

export const THEME_FONTS: ThemeOption[] = [
  { label: 'Inter', value: 'Inter' },
  { label: 'Poppins', value: 'Poppins' },
  { label: 'Roboto', value: 'Roboto' },
  { label: 'Playfair Display', value: 'Playfair Display' },
  { label: 'Montserrat', value: 'Montserrat' },
];

export const DEFAULT_THEME = {
  bgColor: '#6C63FF',
  bgGradient: 'from-indigo-500 to-purple-600',
  buttonStyle: 'rounded',
  fontFamily: 'Inter',
} as const;

export type ThemeConfig = typeof DEFAULT_THEME;