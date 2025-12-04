// store/themeStore.ts

import { CupidThemeName, getCupidTheme } from '../theme';
import { createPersistZustand } from './store'; // your MMKV helper

type ThemeTypes = {
  themeName: CupidThemeName | string;
  isDark: boolean;
  theme: ReturnType<typeof getCupidTheme>;
  setTheme: (themeName: CupidThemeName | string) => void;
  setDarkMode: (isDark: boolean) => void;
};

export const useThemeStore = createPersistZustand<ThemeTypes>(
  'theme-config-storage',
  (set, get) => ({
    themeName: 'girlfriend',
    isDark: false,
    theme: getCupidTheme('girlfriend', false),

    setTheme: (name: CupidThemeName | string) => {
      const { isDark } = get();
      set({ ...get(), themeName: name, theme: getCupidTheme(name, isDark) });
    },

    setDarkMode: (isDark: boolean) => {
      const { themeName } = get();
      set({
        ...get(),
        isDark,
        theme: getCupidTheme(themeName, isDark),
      });
    },
  }),
);
