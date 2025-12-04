import React from 'react';
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  ViewStyle,
  TextStyle,
} from 'react-native';
import { verticalScale, moderateScale, scale } from '../../utils/Scale';
import { useThemeStore } from '../../store/themeStore';
import Fonts from '../../utils/fonts';

export interface PrimaryButtonProps {
  title: string;
  onPress: () => void;
  btnStyle?: ViewStyle;
  txtStyle?: TextStyle;
  loading?: boolean;
  disabled?: boolean;
}

const CommonPrimaryButton = ({
  title,
  onPress,
  btnStyle,
  txtStyle,
  disabled = false,
}: PrimaryButtonProps) => {
  const { theme } = useThemeStore();
  const styles = Styles();

  return (
    <TouchableOpacity
      style={[styles.btnContainer, btnStyle]}
      onPress={onPress}
      disabled={disabled}
    >
      <Text style={[styles.btnText, txtStyle]}>{title}</Text>
    </TouchableOpacity>
  );
};

export default CommonPrimaryButton;

const Styles = () => {
  const theme = useThemeStore().theme;
  return StyleSheet.create({
    btnContainer: {
      paddingVertical: verticalScale(14),
      borderRadius: scale(8),
      alignItems: 'center',
      marginVertical: verticalScale(10),
      backgroundColor: theme.primaryFriend,
      paddingHorizontal: scale(50),
    },
    btnText: {
      fontSize: moderateScale(18),
      fontFamily: Fonts.IMedium,
      color: theme.white,
    },
  });
};
