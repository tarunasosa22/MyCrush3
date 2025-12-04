export type CupidThemeName =
  | 'girlfriend'
  | 'boyfriend'
  | 'girlfriend-dark'
  | 'boyfriend-dark';

export interface CupidThemeTypes {
  name: CupidThemeName;
  secondaryFriend: string;
  girlFriend: string;
  boyFriend: string;
  primaryFriend: string;
  primaryLightFriend: string;
  primaryBackground: string;
  secondayBackground: string;
  card: string;
  cardBorder: string;
  progressTrack: string;
  heading: string;
  primaryText: string;
  text: string;
  subText: string;
  border: string;
  white: string;
  gray: string;
  purpleText: string;
  bottomTabBackground: string;
}

// 💖 Light Girlfriend Theme
export const GIRLFRIEND_THEME: CupidThemeTypes = {
  name: 'girlfriend',
  primaryFriend: '#FF5C93',
  primaryLightFriend: '#FF86AD',
  secondaryFriend: '#FFF0F5',
  primaryBackground: '#F5F2FD',
  secondayBackground: '#FFE4EC',
  card: '#FFD1DC',
  cardBorder: '#FF9BB9',
  progressTrack: '#FFD1DC',
  heading: '#090909',
  primaryText: '#090909',
  text: '#767680',
  subText: '#888888',
  border: '#4B164C10',
  white: '#FFFFFF',
  girlFriend: '#FF5C93',
  boyFriend: '#00B1E3',
  gray: '#F5F5F5',
  purpleText: '#25254F',
  bottomTabBackground: '#ffffff',
};

// 💙 Light Boyfriend Theme
export const BOYFRIEND_THEME: CupidThemeTypes = {
  name: 'boyfriend',
  primaryFriend: '#00B1E3',
  primaryLightFriend: '#39D6FD',
  secondaryFriend: '#DFE8EB',
  primaryBackground: '#F5F2FD',
  secondayBackground: '#E6F0FF',
  card: '#D1F5FF',
  cardBorder: '#254E9A',
  progressTrack: '#CCE0FF',
  heading: '#1A1A2E',
  primaryText: '#090909',
  text: '#1A1A2E',
  subText: '#888888',
  border: '#4B164C10',
  white: '#FFFFFF',
  girlFriend: '#FF5C93',
  boyFriend: '#00B1E3',
  gray: '#F5F5F5',
  purpleText: '#25254F',
  bottomTabBackground: '#ffffff',
};

// 🌙 Dark Girlfriend Theme
export const GIRLFRIEND_DARK_THEME: CupidThemeTypes = {
  name: 'girlfriend-dark',
  primaryFriend: '#FF5C93',
  primaryLightFriend: '#FF86AD',
  secondaryFriend: '#2B1C24',
  primaryBackground: '#121212',
  secondayBackground: '#1E1E1E',
  card: '#2B1C24',
  cardBorder: '#FF5C9333',
  progressTrack: '#3B2A31',
  heading: '#FFFFFF',
  primaryText: '#FFFFFF',
  text: '#767680',
  subText: '#AAAAAA',
  border: '#FFFFFF10',
  white: '#FFFFFF',
  girlFriend: '#FF5C93',
  boyFriend: '#00B1E3',
  gray: '#2A2A2A',
  purpleText: '#7C7C7C',
  bottomTabBackground: '#0D0D0D',
};

// 🌙 Dark Boyfriend Theme
export const BOYFRIEND_DARK_THEME: CupidThemeTypes = {
  name: 'boyfriend-dark',
  primaryFriend: '#00B1E3',
  primaryLightFriend: '#39D6FD',
  secondaryFriend: '#102630',
  primaryBackground: '#141414',
  secondayBackground: '#1A1F22',
  card: '#102630',
  cardBorder: '#00B1E333',
  progressTrack: '#17333D',
  heading: '#FFFFFF',
  primaryText: '#FFFFFF',
  text: '#767680',
  subText: '#AAAAAA',
  border: '#FFFFFF10',
  white: '#FFFFFF',
  girlFriend: '#FF5C93',
  boyFriend: '#00B1E3',
  gray: '#2A2A2A',
  purpleText: '#7C7C7C',
  bottomTabBackground: '#0D0D0D',
};

export const THEME_MAP = {
  girlfriend: {
    light: GIRLFRIEND_THEME,
    dark: GIRLFRIEND_DARK_THEME,
  },
  boyfriend: {
    light: BOYFRIEND_THEME,
    dark: BOYFRIEND_DARK_THEME,
  },
};

export function getCupidTheme(
  name: CupidThemeName | string = 'girlfriend',
  isDark: boolean = false,
): CupidThemeTypes {
  const baseName = name.includes('boyfriend') ? 'boyfriend' : 'girlfriend';
  return THEME_MAP[baseName][isDark ? 'dark' : 'light'];
}

export function getGenderFromTheme(
  themeName: CupidThemeName,
): 'boyfriend' | 'girlfriend' {
  return themeName.includes('girlfriend') ? 'girlfriend' : 'boyfriend';
}
