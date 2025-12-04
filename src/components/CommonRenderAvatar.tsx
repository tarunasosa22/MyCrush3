import {
  Dimensions,
  Image,
  ImageBackground,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import React, { memo, useState } from 'react';
import { scale, verticalScale } from '../utils/Scale';
import IMAGES from '../assets/images';
import FastImage from 'react-native-fast-image';
import Fonts from '../utils/fonts';
import { useThemeStore } from '../store/themeStore';
import { userState } from '../store/userStore';
import { customColors } from '../utils/Colors';
import CustomActivityIndicator from './CustomActivityIndicator';

type CommonRenderAvatarProps = {
  onPress: (item: any) => void;
  item: any;
  index: number;
  isSelected?: boolean;
  isBlur?: boolean;
  onBlurPress?: () => void;
  isMyAvatar?: boolean;
  isStatus?: string;
  disabled?: boolean;
};
const { width: screenWidth } = Dimensions.get('window');
const CommonRenderAvatar: React.FC<CommonRenderAvatarProps> = ({
  onPress,
  item,
  index,
  isSelected = false,
  isBlur,
  onBlurPress,
  isMyAvatar,
  isStatus,
  disabled,
}) => {
  const [isImageLoaded, setIsImageLoaded] = useState(false);
  const [hasImageError, setHasImageError] = useState(false);
  const styles = useStyles();
  const theme = useThemeStore().theme;
  const { userData } = userState.getState();

  const getSecureUrl = () => {
    if (!item?.image) return null;
    if (item?.image.startsWith('https://')) return item?.image;
    if (item?.image.startsWith('http://')) {
      return item?.image.replace('http://', 'https://');
    }
    return item?.image;
  };

  return (
    <TouchableOpacity
      style={styles.avatarContainer}
      disabled={disabled || isStatus === 'pending'}
      onPress={() => (isBlur ? onBlurPress?.() : onPress?.(item))}
      // activeOpacity={0.8}
    >
      {isStatus === 'pending' ? (
        <View style={styles.avatarLoaderContainer}>
          <CustomActivityIndicator size={'small'} />
          <ImageBackground
            style={styles.avatarFullImageBlur}
            blurRadius={15}
            source={{ uri: item?.image }}
            // blurType={'light'}
            // blurAmount={20}
            // reducedTransparencyFallbackColor="rgba(255,255,255,0.8)"
          >
            <Image
              source={IMAGES.app_splash_view}
              style={styles.avatarLoadingImage}
              resizeMode="cover"
            />
          </ImageBackground>
        </View>
      ) : item?.image ? (
        <View style={styles.avatarImageWrapper}>
          {isBlur && (
            <ImageBackground
              source={{ uri: item?.image }}
              style={styles.avatarFullImageBlur}
              blurRadius={15}
            >
              <TouchableOpacity
                style={styles.avatarBlurPressableArea}
                onPress={onBlurPress}
                // activeOpacity={1}
              >
                {/* Lock icon overlay */}
                <View style={styles.avatarLockIconContainer}>
                  <View style={styles.avatarLockIconBackground}>
                    {/* {isMyAvatar ? ( */}
                    <>
                      {!userData.isGuestUser && userData?.user?.tokens < 2 ? (
                        <Image
                          source={IMAGES.hidePass}
                          style={styles.avatarTokenIcon}
                          tintColor={customColors.white}
                        />
                      ) : (
                        <>
                          <Text style={styles.avatarUnlockText}>2</Text>
                          <Image
                            source={IMAGES.token}
                            style={styles.avatarTokenIcon}
                          />
                        </>
                      )}
                    </>
                    {/* // ) : (
                    //   <Image source={IMAGES.lock} style={styles.avatarLockIcon} />
                    // )} */}
                  </View>
                </View>
              </TouchableOpacity>
            </ImageBackground>
          )}

          <View style={styles.avatarLoadingContainer}>
            <Image
              source={IMAGES.app_splash_view}
              style={styles.avatarLoadingImage}
              resizeMode="cover"
            />
          </View>
          <FastImage
            source={{
              uri: getSecureUrl(),
            }}
            style={styles.avatarImage}
            onLoad={() => setIsImageLoaded(true)}
            onError={() => setHasImageError(true)}
          />
        </View>
      ) : (
        <View style={styles.avatarLoadingContainer}>
          <Image
            source={IMAGES.app_splash_view}
            style={styles.avatarLoadingImage}
            resizeMode="cover"
          />
        </View>
      )}
    </TouchableOpacity>
  );
};

export default memo(CommonRenderAvatar);

const useStyles = () => {
  const containerMargin = scale(10);
  const itemWidth = (screenWidth - containerMargin * 2 * 2) / 3;
  const theme = useThemeStore().theme;
  return StyleSheet.create({
    avatarContainer: {
      width: itemWidth - scale(10),
      aspectRatio: 0.75,
      borderRadius: scale(15),
      overflow: 'hidden',
    },
    avatarImageWrapper: {
      width: '100%',
      overflow: 'hidden',
      position: 'relative',
    },
    avatarImage: {
      width: '100%',
      height: '100%',
    },
    avatarLoadingContainer: {
      position: 'absolute',
      width: '100%',
      height: '100%',
      overflow: 'hidden',
      zIndex: -1,
    },
    avatarLoadingImage: {
      width: '100%',
      height: '100%',
    },
    avatarLoadingOverlay: {
      position: 'absolute',
      width: '100%',
      height: '100%',
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: 'rgba(0,0,0,0.4)',
    },
    avatarBlurPressableArea: {
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      zIndex: 15,
      borderRadius: scale(15),
    },
    avatarFullImageBlur: {
      zIndex: 15,
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      borderRadius: scale(15),
    },
    avatarLockIconContainer: {
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      justifyContent: 'center',
      alignItems: 'center',
      zIndex: 16,
    },
    avatarLockIconBackground: {
      // width: scale(80),
      // height: scale(80),
      flexDirection: 'row',
      backgroundColor: 'rgba(0, 0, 0, 0.7)',
      borderRadius: scale(10),
      paddingHorizontal: scale(10),
      paddingVertical: scale(2),
      alignItems: 'center',
      justifyContent: 'center',
      shadowColor: '#000',
      shadowOffset: {
        width: 0,
        height: 4,
      },
      shadowOpacity: 0.3,
      shadowRadius: 4.65,
      elevation: 8,
    },
    avatarTokenIcon: {
      width: scale(22),
      height: scale(22),
      resizeMode: 'contain',
      // marginBottom: scale(8),
      // resizeMode: 'contain',
    },
    avatarLockIcon: {
      width: scale(23),
      height: scale(23),
      resizeMode: 'contain',
      tintColor: theme.white,
      marginVertical: scale(8),
      // marginBottom: scale(8),
      // resizeMode: 'contain',
    },
    avatarLockText: {
      color: theme.white,
      fontSize: scale(16),
      fontFamily: Fonts.ISemiBold,
      textAlign: 'center',
      marginBottom: scale(4),
    },
    avatarUnlockText: {
      color: theme.white,
      fontSize: scale(20),
      marginRight: verticalScale(2),
      fontFamily: Fonts.IBold,
      textAlign: 'center',
      opacity: 0.8,
    },
    avatarLoaderContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: 'rgba(0,0,0,0.05)',
      borderRadius: scale(15),
    },
  });
};
