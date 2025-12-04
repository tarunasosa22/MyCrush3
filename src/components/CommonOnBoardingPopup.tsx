import {
  Image,
  ImageBackground,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import React from 'react';
import { Modal } from 'react-native';
import IMAGES from '../assets/images';
import { moderateScale, scale, verticalScale } from '../utils/Scale';
import Fonts from '../utils/fonts';
import { useThemeStore } from '../store/themeStore';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

type Props = {
  visible: boolean;
  disable?: boolean;
  onClose: () => void;
  onPress: () => void;
};

const CommonOnBoardingPopup = ({
  visible,
  disable,
  onClose,
  onPress,
}: Props) => {
  const styles = useStyles();
  const { themeName,theme ,isDark} = useThemeStore();
  const insets = useSafeAreaInsets();
  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      statusBarTranslucent={true}
      presentationStyle="overFullScreen"
      onRequestClose={onClose}
    >
      <StatusBar
        backgroundColor="transparent"
        barStyle="dark-content"
        translucent
      />
      <ImageBackground
        source={
          themeName === 'girlfriend'
            ?isDark ? IMAGES.onboarding_model_girl_dark : IMAGES.onboarding_model_girl
            : isDark ? IMAGES.onboarding_model_boy_dark : IMAGES.onboarding_model_boy
        }
        style={{
          flex: 1,
          width: '100%',
          height: '100%',
          backgroundColor: theme.bottomTabBackground,
          paddingBottom: insets.bottom > 0 ? insets.bottom : 0,
        }}
        resizeMode="cover"
      >
        <TouchableOpacity
          onPress={onClose}
          style={styles.popupCloseIconContainer}
        >
          <Image source={IMAGES.close} style={styles.popupCloseIcon} />
        </TouchableOpacity>
        <View style={styles.popupContainer}>
          <Text style={styles.popupTitle}>
            Let's Create Your Dream{' '}
            {themeName === 'girlfriend' ? 'Girl Friend' : 'Boy Friend'}
          </Text>
          <Text style={styles.popupSubtitle}>
            Customize their look, style, and personality — just the way you
            like. It only takes a few steps!
          </Text>
          <TouchableOpacity style={styles.popupButton} onPress={onPress}>
            <Text style={styles.popupButtonText}>Let's Go</Text>
          </TouchableOpacity>
        </View>
      </ImageBackground>
    </Modal>
  );
};

export default CommonOnBoardingPopup;

const useStyles = () => {
  const theme = useThemeStore().theme;
  const insets = useSafeAreaInsets();
  return StyleSheet.create({
    popupTitle: {
      fontSize: moderateScale(28),
      textAlign: 'center',
      marginTop: scale(30),
      marginBottom: 10,
      fontFamily: Fonts.ISemiBold,
      color: theme.heading,
    },
    popupSubtitle: {
      fontSize: moderateScale(16),
      textAlign: 'center',
      marginBottom: verticalScale(10),
      marginTop: verticalScale(0),
      fontFamily: Fonts.IMedium,
      color: theme.subText,
    },
    popupButton: {
      width: '100%',
      height: verticalScale(50),
      borderRadius: moderateScale(10),
      justifyContent: 'center',
      alignItems: 'center',
      marginVertical: verticalScale(20),
      backgroundColor: theme.primaryFriend,
    },
    popupButtonText: {
      color: theme.white,
      fontSize: moderateScale(18),
      fontFamily: Fonts.IMedium,
    },
    popupContainer: {
      flex: 1,
      justifyContent: 'flex-end',
      alignItems: 'center',
      paddingHorizontal: scale(20),
    },
    popupCloseIcon: {
      width: scale(30),
      height: scale(30),
      tintColor: theme.primaryFriend,
    },
    popupCloseIconContainer: {
      marginTop: scale(40),
      marginHorizontal: scale(20),
      alignSelf: 'flex-end',
    },
  });
};
