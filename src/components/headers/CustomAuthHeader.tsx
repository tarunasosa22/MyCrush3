import React from 'react';
import {
  Text,
  TouchableOpacity,
  StyleSheet,
  Image,
  StyleProp,
  ViewStyle,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import Fonts from '../../utils/fonts';
import IMAGES from '../../assets/images';
import { useThemeStore } from '../../store/themeStore';
import { moderateScale, scale, verticalScale } from '../../utils/Scale';

interface CustomAuthHeaderProps {
  title: string;
  onBackPress: () => void;
  containerStyle?: StyleProp<ViewStyle>;
}

const CustomAuthHeader: React.FC<CustomAuthHeaderProps> = ({
  title,
  onBackPress,
  containerStyle,
}) => {
  const styles = Styles();

  return (
    <SafeAreaView edges={['top']} style={[styles.row, containerStyle]}>
      <TouchableOpacity style={styles.backButton} onPress={onBackPress}>
        <Image source={IMAGES.back} style={[styles.backIcon]} />
      </TouchableOpacity>
      <Text style={styles.title}>{title}</Text>
    </SafeAreaView>
  );
};

export default CustomAuthHeader;
const Styles = () => {
  const theme = useThemeStore().theme;
  return StyleSheet.create({
    row: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingTop: verticalScale(20),
      // backgroundColor: 'pink',
    },
    backButton: {
      marginRight: scale(16),
    },
    backIcon: {
      width: scale(48),
      height: scale(48),
      resizeMode: 'contain',
    },
    title: {
      fontFamily: Fonts.ISemiBold,
      fontSize: moderateScale(32),
      color: theme.primaryFriend,
    },
  });
};
