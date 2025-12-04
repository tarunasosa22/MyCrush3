import React from 'react';
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  ViewStyle,
  TextStyle,
} from 'react-native';
import { verticalScale, moderateScale, scale } from '../../utils/Scale';
import { useThemeStore } from '../../store/themeStore'; // ✅ Import theme store
import Fonts from '../../utils/fonts';

export interface PrimaryButtonPrope {
  title: string;
  onPress: () => void;
  btnStyle?: ViewStyle;
  txtStyle?: TextStyle;
}

const CommonOutlinedButton = ({
  title,
  onPress,
  btnStyle,
  txtStyle,
}: PrimaryButtonPrope) => {
  const { theme } = useThemeStore(); // ✅ Get dynamic theme
  const styles = Styles();
  return (
    <TouchableOpacity
      style={[styles.btnContainerStyle, btnStyle]}
      onPress={onPress}
    >
      <Text style={[styles.textStyles, txtStyle]}>{title}</Text>
    </TouchableOpacity>
  );
};

export default CommonOutlinedButton;

const Styles = () => {
  const theme = useThemeStore().theme;
  return StyleSheet.create({
    btnContainerStyle: {
      borderWidth: 1,
      paddingVertical: verticalScale(14),
      borderRadius: scale(8),
      alignItems: 'center',
      marginVertical: verticalScale(10),
      borderColor: theme.primaryFriend,
      paddingHorizontal: scale(50),
    },
    textStyles: {
      fontSize: moderateScale(18),
      fontFamily: Fonts.IMedium,
      color: theme.primaryFriend,
    },
  });
};
