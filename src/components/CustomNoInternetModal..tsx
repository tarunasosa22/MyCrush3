import React, { useEffect, useRef } from 'react';
import {
  Modal,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Animated,
  Dimensions,
  Platform,
  Image,
} from 'react-native';
import { scale, verticalScale } from '../utils/Scale';
import { customColors } from '../utils/Colors';
import { useThemeStore } from '../store/themeStore';
import IMAGES from '../assets/images';
import Fonts from '../utils/fonts';
import CommonPrimaryButton from './buttons/CommonPrimaryButton';

const { width } = Dimensions.get('window');

const CustomNoInternetModal = ({
  showNoInternetModal,
  checkInternetConnection,
}: {
  showNoInternetModal: boolean;
  checkInternetConnection: () => void;
}) => {
  const scaleAnim = useRef(new Animated.Value(0)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;

  const styles = Styles();
  const theme = useThemeStore().theme;

  useEffect(() => {
    if (showNoInternetModal) {
      // Scale in animation
      Animated.spring(scaleAnim, {
        toValue: 1,
        tension: 50,
        friction: 8,
        useNativeDriver: true,
      }).start();

      // Pulse animation for icon
      const pulseAnimation = Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.2,
            duration: 1000,
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 1000,
            useNativeDriver: true,
          }),
        ]),
      );
      pulseAnimation.start();

      return () => pulseAnimation.stop();
    } else {
      scaleAnim.setValue(0);
    }
  }, [showNoInternetModal]);

  return (
    <Modal
      transparent
      visible={showNoInternetModal}
      animationType="fade"
      onRequestClose={() => {}}
    >
      <View style={styles.overlay}>
        <Animated.View
          style={[
            styles.container,
            {
              transform: [{ scale: scaleAnim }],
            },
          ]}
        >
          <View style={styles.content}>
            <Animated.View
              style={[
                styles.iconContainer,
                { transform: [{ scale: pulseAnim }] },
              ]}
            >
              <View style={styles.closeImage}>
                <Image
                  source={IMAGES.close_icon}
                  style={{ width: 30, height: 30 }}
                  tintColor={theme.primaryFriend}
                  resizeMode="contain"
                />
              </View>
            </Animated.View>
            <Text style={styles.title}>Connection Lost!</Text>
            <Text style={styles.subtitle}>
              Unable to connect to the internet. Please check your connection
              and try again.
            </Text>
          </View>

          <CommonPrimaryButton
            title={'Try Again  ↻'}
            onPress={checkInternetConnection}
            btnStyle={{ borderRadius: 40 }}
          />
        </Animated.View>
      </View>
    </Modal>
  );
};

export default CustomNoInternetModal;

const Styles = () => {
  const theme = useThemeStore().theme;
  return StyleSheet.create({
    overlay: {
      flex: 1,
      backgroundColor: 'rgba(0, 0, 0, 0.75)',
      justifyContent: 'center',
      alignItems: 'center',
      // paddingHorizontal: scale(20),
    },
    container: {
      width: width * 0.85,
      // maxWidth: scale(350),
      backgroundColor: customColors.white,
      borderRadius: scale(24),
      overflow: 'hidden',
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 20 },
      shadowOpacity: 0.25,
      shadowRadius: 25,
      elevation: 20,
      position: 'relative',
      padding: scale(20),
    },
    iconContainer: {
      width: scale(70),
      height: scale(70),
      justifyContent: 'center',
      alignItems: 'center',
      borderRadius: scale(99),
      borderWidth: 3,
      borderColor: theme.primaryFriend,
    },
    wifiIcon: {
      width: scale(40),
      height: scale(30),
      position: 'relative',
      justifyContent: 'flex-end',
      alignItems: 'center',
    },
    wifiBar: {
      position: 'absolute',
      backgroundColor: theme.primaryFriend,
      borderRadius: scale(2),
    },
    bar1: {
      width: scale(8),
      height: scale(6),
      bottom: 0,
    },
    bar2: {
      width: scale(16),
      height: scale(12),
      bottom: 0,
      opacity: 0.6,
    },
    bar3: {
      width: scale(24),
      height: scale(18),
      bottom: 0,
      opacity: 0.3,
    },
    closeImage: {
      width: scale(25),
      height: scale(25),
      justifyContent: 'center',
      alignItems: 'center',
    },
    content: {
      // paddingHorizontal: scale(30),
      alignItems: 'center',
      marginBottom: verticalScale(10),
    },
    title: {
      fontSize: scale(24),
      color: theme.primaryFriend,
      textAlign: 'center',
      fontFamily: Fonts.IBold,
      marginVertical: verticalScale(10),
      marginTop: 20,
    },
    subtitle: {
      fontSize: scale(16),
      color: '#666666',
      textAlign: 'center',
      fontFamily: Fonts.IRegular,
    },
    retryButton: {
      borderRadius: scale(50),
      overflow: 'hidden',
      shadowColor: theme.border,
      shadowOffset: { width: 0, height: 8 },
      shadowOpacity: 0.3,
      shadowRadius: 15,
      elevation: 8,
    },
    buttonGradient: {
      backgroundColor: theme.primaryFriend,
      paddingVertical: scale(16),
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      borderRadius: scale(50),
    },
    retryText: {
      color: '#ffffff',
      fontSize: scale(18),
      fontWeight: '600',
      marginRight: scale(8),
    },
    arrow: {
      width: scale(24),
      height: scale(24),
      justifyContent: 'center',
      alignItems: 'center',
    },
    arrowText: {
      color: '#ffffff',
      fontSize: scale(18),
      fontWeight: 'bold',
    },
  });
};
