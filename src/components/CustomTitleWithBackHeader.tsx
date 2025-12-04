import {
  Image,
  ImageStyle,
  StyleSheet,
  Text,
  TextStyle,
  TouchableOpacity,
  View,
  ViewStyle,
} from 'react-native';
import React from 'react';
import { scale } from '../utils/Scale';
import Fonts from '../utils/fonts';
import { useThemeStore } from '../store/themeStore';
import IMAGES from '../assets/images';

const CustomTitleWithBackHeader = ({
  title,
  onPress,
  isBackHide,
  txtStyle,
  btnStyle,
}: {
  title: string;
  onPress: () => void;
  isBackHide?: boolean;
  txtStyle?: TextStyle;
  btnStyle?: ImageStyle;
}) => {
  const theme = useThemeStore().theme;
  const styles = useStyles();
  return (
    <TouchableOpacity
      style={[styles.titleWithBackContainer, btnStyle]}
      onPress={() => onPress()}
    >
      {isBackHide ? null : (
        <Image
          source={IMAGES.back_icon}
          style={[styles.titleWithBackIcon, btnStyle]}
        />
      )}
      <Text style={[styles.titleWithBackText, txtStyle]}>{title}</Text>
    </TouchableOpacity>
  );
};

export default CustomTitleWithBackHeader;

const useStyles = () => {
  const theme = useThemeStore().theme;
  return StyleSheet.create({
    titleWithBackContainer: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    titleWithBackText: {
      fontSize: scale(18),
      fontFamily: Fonts.ISemiBold,
      color: theme.primaryFriend,
    },
    titleWithBackIcon: {
      width: scale(15),
      height: scale(15),
      marginRight: scale(12),
      tintColor: theme.primaryFriend,
    },
  });
};
