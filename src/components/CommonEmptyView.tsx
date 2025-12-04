import React from 'react';
import { View, Text, Image, StyleSheet } from 'react-native';

import Fonts from '../utils/fonts';
import { customColors } from '../utils/Colors';
import { useThemeStore } from '../store/themeStore';
import { scale, verticalScale } from '../utils/Scale';

const CommonEmptyView = ({
  emptyImage,
  header,
  subHeader,
  headerTxtStyle,
  subHeaderTxtStyle,
  containerStyle,
}: {
  emptyImage: any;
  header: string;
  subHeader: string;
  headerTxtStyle?: any;
  subHeaderTxtStyle?: any;
  containerStyle?: any;
}) => {
  const styles = Styles();
  return (
    <View style={[styles.container, containerStyle]}>
      <Image source={emptyImage} style={styles.emptyImg} />
      <Text style={[styles.headerTxt, headerTxtStyle]}>{header}</Text>
      <Text style={[styles.subHeaderTxt, subHeaderTxtStyle]}>{subHeader}</Text>
    </View>
  );
};

export default CommonEmptyView;

const Styles = () => {
  const theme = useThemeStore().theme;

  return StyleSheet.create({
    container: {
      justifyContent: 'center',
      alignItems: 'center',
      paddingTop: verticalScale(120),
    },
    emptyImg: {
      width: scale(180),
      height: verticalScale(180),
      resizeMode: 'contain',
    },
    headerTxt: {
      fontFamily: Fonts.ISemiBold,
      fontSize: scale(25),
      color: customColors.black,
      marginTop: verticalScale(10),
    },
    subHeaderTxt: {
      fontFamily: Fonts.IMedium,
      fontSize: scale(16),
      color: customColors.lightblack,
      textAlign: 'center',
      marginTop: verticalScale(5),
      paddingHorizontal: scale(20),
    },
  });
};
