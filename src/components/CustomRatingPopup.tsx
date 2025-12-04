// RatingPopup.js - React Native Component
import React, { useState, useEffect } from 'react';
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  Image,
} from 'react-native';
import { moderateScale, scale, verticalScale } from '../utils/Scale';
import { useThemeStore } from '../store/themeStore';
import Fonts from '../utils/fonts';
import IMAGES from '../assets/images';

const { width: screenWidth } = Dimensions.get('window');

interface RatingPopupProps {
  visible: boolean;
  onClose: () => void;
  onRate: () => void;
  onLater: () => void;
}

const CustomRatingPopup = ({
  visible,
  onClose,
  onRate,
  onLater,
}: RatingPopupProps) => {
  const theme = useThemeStore().theme;
  const [rating, setRating] = useState(0);

  const styles = createStyles(theme);

  return (
    <Modal
      visible={visible}
      transparent
      animationType="none"
      statusBarTranslucent={true}
      presentationStyle="overFullScreen"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={styles.container}>
          <View style={styles.header}>
            <Image source={IMAGES.app_icon} style={styles.appIcon} />
            <Text style={styles.title}>Rate Our App</Text>
            <Text style={styles.subtitle}>
              How was your experience with our app?
            </Text>
          </View>
          <View style={styles.buttonContainer}>
            <TouchableOpacity style={styles.primaryButton} onPress={onRate}>
              <Text style={styles.primaryButtonText}>Rate Here</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const createStyles = (theme: any) =>
  StyleSheet.create({
    overlay: {
      flex: 1,
      backgroundColor: 'rgba(0, 0, 0, 0.6)',
      justifyContent: 'center',
      alignItems: 'center',
      paddingHorizontal: scale(20),
    },
    container: {
      backgroundColor: theme.primaryBackground,
      borderRadius: moderateScale(20),
      padding: scale(24),
      width: screenWidth * 0.85,
      alignItems: 'center',
      shadowColor: '#000',
      shadowOffset: {
        width: 0,
        height: 10,
      },
      shadowOpacity: 0.25,
      shadowRadius: 20,
      elevation: 15,
    },
    header: {
      alignItems: 'center',
      marginBottom: verticalScale(20),
    },
    appIcon: {
      width: scale(60),
      height: scale(60),
      borderRadius: scale(15),
      marginBottom: verticalScale(12),
    },
    title: {
      fontSize: moderateScale(22),
      fontFamily: Fonts.IBold,
      color: theme.heading,
      marginBottom: verticalScale(8),
    },
    subtitle: {
      fontSize: moderateScale(16),
      fontFamily: Fonts.IRegular,
      color: theme.subheading,
      textAlign: 'center',
      lineHeight: moderateScale(22),
    },
    content: {
      alignItems: 'center',
      marginBottom: verticalScale(24),
    },
    ratingText: {
      fontSize: moderateScale(16),
      fontFamily: Fonts.ISemiBold,
      color: theme.heading,
      marginBottom: verticalScale(16),
    },
    starsContainer: {
      flexDirection: 'row',
      justifyContent: 'center',
    },
    starButton: {
      padding: scale(8),
    },
    star: {
      fontSize: moderateScale(35),
    },
    thankYouText: {
      fontSize: moderateScale(20),
      fontFamily: Fonts.IBold,
      color: theme.primaryFriend,
      marginBottom: verticalScale(12),
      textAlign: 'center',
    },
    feedbackText: {
      fontSize: moderateScale(15),
      fontFamily: Fonts.IRegular,
      color: theme.subheading,
      textAlign: 'center',
      lineHeight: moderateScale(22),
      paddingHorizontal: scale(12),
    },
    buttonContainer: {
      width: '100%',
      gap: verticalScale(12),
    },
    primaryButton: {
      backgroundColor: theme.primaryFriend,
      paddingVertical: verticalScale(14),
      paddingHorizontal: scale(24),
      borderRadius: moderateScale(12),
      alignItems: 'center',
    },
    primaryButtonText: {
      color: theme.primaryBackground,
      fontSize: moderateScale(16),
      fontFamily: Fonts.IBold,
    },
    laterButton: {
      backgroundColor: 'transparent',
      paddingVertical: verticalScale(14),
      paddingHorizontal: scale(24),
      borderRadius: moderateScale(25),
      alignItems: 'center',
      borderWidth: 1,
      borderColor: theme.primaryFriend,
    },
    laterButtonText: {
      color: theme.primaryFriend,
      fontSize: moderateScale(16),
      fontFamily: Fonts.ISemiBold,
    },
    neverButton: {
      backgroundColor: 'transparent',
      paddingVertical: verticalScale(12),
      alignItems: 'center',
    },
    neverButtonText: {
      color: theme.subheading,
      fontSize: moderateScale(14),
      fontFamily: Fonts.IRegular,
    },
  });

export default CustomRatingPopup;
