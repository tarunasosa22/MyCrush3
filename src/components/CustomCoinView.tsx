import { Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import React from 'react';
import IMAGES from '../assets/images';
import { scale } from '../utils/Scale';
import Fonts from '../utils/fonts';
import { useThemeStore } from '../store/themeStore';
import { ViewStyle } from 'react-native';

const CustomCoinView = (props: {
  coinCount?: number;
  containerStyle?: ViewStyle;
  containerStyle1?: ViewStyle;
  onPress?: () => void;
}) => {
  const { coinCount = 0, containerStyle, containerStyle1, onPress } = props;
  const styles = useStyles();
  return (
    <View style={[styles.coinViewContainer1,containerStyle1]}>
      <TouchableOpacity
        style={[styles.coinViewContainer, containerStyle]}
        onPress={onPress}
      >
        <Image source={IMAGES.coin} style={styles.coinViewCoin} />
        <Text style={styles.coinViewCoinText}>{coinCount}</Text>
      </TouchableOpacity>
           </View>
  );
};

export default CustomCoinView;

const useStyles = () => {
  const theme = useThemeStore().theme;
  return StyleSheet.create({
    coinViewContainer1: {
      shadowColor: theme.primaryFriend,
      shadowOffset: {
        width: 0,
        height: 4,
      },
      shadowOpacity: 0.3,
      shadowRadius: 6,
      elevation: 18,
      padding: scale(8),
      borderRadius: scale(100),
    },
    coinViewContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: theme.white,
      borderWidth: 1,
      borderColor: theme.primaryLightFriend + '40',
      paddingLeft: scale(4),
      borderRadius: scale(100),
    },
    coinViewCoin: {
      width: scale(25),
      height: scale(25),
      resizeMode: 'contain',
    },
    coinViewCoinText: {
      fontSize: scale(20),
      fontFamily: Fonts.IMedium,
      color: theme.primaryFriend,
      marginHorizontal: scale(10),
    },
  });
};
