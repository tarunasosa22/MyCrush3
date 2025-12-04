import { StyleSheet, Text, View, ViewStyle } from 'react-native';
import React from 'react';
import LinearGradient from 'react-native-linear-gradient';

const CommonLinearContainer = ({
  children,
  colorCount,
  containerStyle,
  colors,
}: {
  colorCount?: number;
  children: React.ReactNode;
  containerStyle?: ViewStyle;
  colors?: string[];
}) => {
  const styles = Styles();
  return (
    <LinearGradient
      colors={
        !colors
          ? [
              'rgba(0, 0, 0, 0.8)',
              'rgba(0, 0, 0, 0.0)',
              'rgba(0, 0, 0, 0.0)',
              'rgba(0, 0, 0, 0.0)',
            ]
          : colors || []
      }
      start={{ x: 0.5, y: 1.0 }}
      end={{ x: 0.5, y: 0.0 }}
      style={[styles.linearContainer, containerStyle]}
    >
      {children}
    </LinearGradient>
  );
};

export default CommonLinearContainer;

const Styles = () => {
  return StyleSheet.create({
    linearContainer: {
      flex: 1,
    },
  });
};
