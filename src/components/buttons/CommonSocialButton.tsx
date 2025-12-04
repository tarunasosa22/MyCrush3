import React from 'react';
import { TouchableOpacity, Text, Image, StyleSheet } from 'react-native';
import { customColors } from '../../utils/Colors';
import { verticalScale, scale, moderateScale } from '../../utils/Scale';
import Fonts from '../../utils/fonts';

const CommonSocialButton = ({ icon, title, onPress }: any) => (
  <TouchableOpacity style={styles.button} onPress={onPress}>
    <Image source={icon} style={[styles.icon]} />

    <Text style={styles.text}>{title}</Text>
  </TouchableOpacity>
);

export default CommonSocialButton;

const styles = StyleSheet.create({
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: verticalScale(15),
    paddingHorizontal: scale(22),
    borderWidth: 1,
    borderColor: customColors.lightblack,
    borderRadius: scale(8),
    marginBottom: verticalScale(12),
    justifyContent: 'center',
    marginVertical: verticalScale(10),
  },
  icon: {
    width: scale(22),
    height: scale(22),
    marginRight: scale(12),
    left: scale(2),
    resizeMode: 'contain',
  },
  text: {
    fontSize: moderateScale(18),
    color: customColors.black,
    fontWeight: '500',
    fontFamily: Fonts.IMedium,
  },
});
