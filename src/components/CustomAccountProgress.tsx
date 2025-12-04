import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import React from 'react';
import FastImage from 'react-native-fast-image';
import IMAGES from '../assets/images';
import { scale, verticalScale } from '../utils/Scale';
import CustomCoinView from './CustomCoinView';
import { userState } from '../store/userStore';
import { useThemeStore } from '../store/themeStore';
import Fonts from '../utils/fonts';

type Props = {
  userTokens: number;
  userTotalTokens: number;
  onPress: () => void;
  progressChildComponent?: React.ReactNode;
  onBuyMorePress: () => void;
};

const CustomAccountProgress = ({
  userTokens,
  onPress,
  progressChildComponent,
  userTotalTokens,
  onBuyMorePress,
}: Props) => {
  const styles = Styles();

  return (
    <FastImage
      source={IMAGES.account_progress_bg}
      style={[
        styles.accountProgressBg,
        { height: userTokens == 0 || userTokens <= 0 ? scale(55) : scale(100) },
      ]}
      resizeMode={userTokens == 0 || userTokens <= 0 ? 'cover' : 'contain'}
    >
      <View style={styles.accountProgressContentContainer}>
        <View
          style={[
            styles.accountProgressContent,
            { paddingBottom: userTotalTokens !== 0 ? scale(16) : 0 },
          ]}
        >
          <CustomCoinView
            coinCount={userTokens}
            onPress={onPress}
            containerStyle1={{ padding: 0 }}
          />
          <TouchableOpacity onPress={onBuyMorePress}>
            <Text style={styles.buyMore}>
              {userTokens == 0 || userTokens <= 0 ? 'Buy Now' : 'Buy More'}
            </Text>
          </TouchableOpacity>
        </View>
        {progressChildComponent && progressChildComponent}
      </View>
    </FastImage>
  );
};

export default CustomAccountProgress;

const Styles = () => {
  const theme = useThemeStore().theme;
  return StyleSheet.create({
    accountProgressBg: {
      width: '100%',
      height: scale(100),
      borderRadius: scale(20),
      resizeMode: 'contain',
      marginVertical: verticalScale(15),
    },
    accountProgressContentContainer: {
      paddingHorizontal: scale(14),
      paddingVertical: scale(10),
    },
    accountProgressContent: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    buyMore: {
      fontSize: scale(16),
      fontFamily: Fonts.IMedium,
      textAlign: 'center',
      color: theme.white,
      alignSelf: 'center',
    },
  });
};
