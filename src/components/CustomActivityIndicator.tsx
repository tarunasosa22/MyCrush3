import {
  ActivityIndicator,
  ActivityIndicatorProps,
  StyleSheet,
  Text,
  View,
  ViewStyle,
} from 'react-native';
import React from 'react';
import { useThemeStore } from '../store/themeStore';
import { scale } from '../utils/Scale';
import Fonts from '../utils/fonts';

type GradientLoaderOverlayProps = ActivityIndicatorProps & {
  bgColor?: string;
  title?: string;
  style?: ViewStyle;
  size?: 'small' | 'large' | undefined;
};

const CustomActivityIndicator = ({
  title,
  bgColor,
  style,
  size,
  ...indicatorProps
}: GradientLoaderOverlayProps) => {
  const styles = useStyles();
  const theme = useThemeStore().theme;
  return (
    <View
      style={[
        styles.activityIndicatorOverlay,
        { backgroundColor: bgColor ?? '#ffffff80' },
        style,
      ]}
    >
      <ActivityIndicator
        {...indicatorProps}
        color={theme.primaryFriend}
        // style={styles.activityIndicatorStyle}
        size={size ?? 'large'}
      />
      {title && title.trim() !== '' && (
        <Text style={styles.activityIndicatorTitle}>{title}</Text>
      )}
    </View>
  );
};

export default CustomActivityIndicator;

const useStyles = () => {
  const { theme } = useThemeStore();
  return StyleSheet.create({
    activityIndicatorStyle: {
      position: 'absolute',
      top: 0,
      bottom: 0,
      left: 0,
      right: 0,
      zIndex: 999999999999999,
      backgroundColor: theme.secondayBackground,
    },
    activityIndicatorOverlay: {
      position: 'absolute',
      top: 0,
      bottom: 0,
      left: 0,
      right: 0,
      zIndex: 9999,
      backgroundColor: '#ffffff80',
      justifyContent: 'center',
      alignItems: 'center',
    },
    activityIndicatorTitle: {
      fontSize: scale(20),
      color: theme.primaryFriend,
      fontFamily: Fonts.IMedium,
      marginVertical: 10,
    },
  });
};
