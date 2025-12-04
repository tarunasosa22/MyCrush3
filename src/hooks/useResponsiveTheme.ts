import { useLayoutEffect, useState } from 'react';
import { useColorScheme, useWindowDimensions } from 'react-native';

const useResponsiveTheme = () => {
  const colorScheme = useColorScheme();
  const { height, width } = useWindowDimensions();

  const FIGMA_WIDTH = 402;
  const FIGMA_HEIGHT = 874;

  return {
    wp: (w: number) => width * (w / 100),
    hp: (h: number) => height * (h / 100),
    isSmallScreen: width < 375,
    isMediumScreen: width >= 375 && width < 768,
    isLargeScreen: width >= 768,
    isExtraLargeScreen: width >= 1200,
    isPortrait: height > width,
    isLandscape: width > height,
    f2w: (px: number) => (px / FIGMA_WIDTH) * width,
    f2h: (px: number) => (px / FIGMA_HEIGHT) * height,
  };
};

export default useResponsiveTheme;
