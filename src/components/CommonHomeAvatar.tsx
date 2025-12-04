import {
  ActivityIndicator,
  Image,
  ImageBackground,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Alert,
} from 'react-native';
import React, { useEffect, useState } from 'react';
import { scale, verticalScale } from '../utils/Scale';
import Fonts from '../utils/fonts';
import { useThemeStore } from '../store/themeStore';
import { AvatarItem } from '../store/categoryStore';
import IMAGES from '../assets/images';
import CommonLinearContainer from './CommonLinearContainer';
import LinearGradient from 'react-native-linear-gradient';
import { userState } from '../store/userStore';

const CommonHomeAvatar = ({
  item,
  characterLabel,
  onPress,
  onCallPress,
  onChatPress,
  onLikePress,
  isBlur,
  onBlurPress,
  isMyAvatar,
  isLike,
}: {
  item: AvatarItem;
  characterLabel: string | null;
  onPress: (item: AvatarItem) => void;
  onCallPress: (item: AvatarItem) => void;
  onChatPress: (item: AvatarItem) => void;
  onLikePress: (item: AvatarItem) => void;
  onBlurPress?: () => void;
  isMyAvatar?: boolean;
  isBlur?: boolean;
  isLike?: boolean;
}) => {
  const styles = Styles();
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);
  const [validImage, setValidImage] = useState(true);
  const userData = userState.getState().userData;
  const { favoritesList, myFavoritesList } = userState.getState();
  const theme = useThemeStore().theme;

  useEffect(() => {
    let image = item?.cover_image?.startsWith('https')
      ? item?.cover_image
      : item?.cover_image?.replace('http', 'https');
    if (image) {
      fetch(image, { method: 'HEAD' })
        .then(res => {
          if (!res.ok) setValidImage(false);
        })
        .catch(() => setValidImage(false));
    } else {
      setValidImage(false);
    }
  }, [item?.cover_image]);

  const handleBlurPress = () => {
    Alert.alert(
      'Premium Content',
      'You need tokens to view this content. Purchase tokens or subscribe to get unlimited access!',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Get Tokens',
          style: 'default',
          onPress: () => {
            // Navigate to purchase tokens screen
            console.log('Navigate to purchase tokens');
          },
        },
      ],
      { cancelable: true },
    );
  };

  return (
    <>
      {item.isEmpty ? (
        <View style={styles.avatarCard} />
      ) : (
        <TouchableOpacity
          style={styles.avatarCard}
          onPress={() => {
            console.log('ischeck');
            isBlur
              ? onBlurPress
                ? onBlurPress()
                : handleBlurPress()
              : onPress(item);
          }}
          activeOpacity={0.8}
        >
          <ImageBackground
            source={
              validImage
                ? {
                    uri: item?.cover_image,
                  }
                : IMAGES.app_splash_view
            }
            style={styles.avatarImage}
            onLoadStart={() => {
              setImageLoaded(true);
            }}
            onLoadEnd={() => setImageLoaded(false)}
            onError={() => {
              console.log('error');
              setImageLoaded(false);
            }}
          >
            {isBlur && (
              <ImageBackground
                source={{ uri: item?.cover_image }}
                style={styles.fullImageBlur}
                blurRadius={10}
              >
                <TouchableOpacity
                  style={styles.blurPressableArea}
                  onPress={() =>
                    onBlurPress ? onBlurPress() : handleBlurPress()
                  }
                  activeOpacity={0.7}
                />
              </ImageBackground>
            )}

            {/* Lock icon and message overlay */}
            {isBlur && (
              <View style={styles.lockIconContainer}>
                <View style={styles.lockIconBackground}>
                  <Image
                    source={IMAGES.lock}
                    style={styles.lockIcon}
                    resizeMode="contain"
                  />
                  {/* <Text style={styles.lockText}>Premium Content</Text> */}
                  <Text style={styles.unlockText}>
                    {userData.isGuestUser ? `Tap to view` : 'Premium Content'}
                  </Text>
                </View>
              </View>
            )}

            {/* {imageLoaded && (
          <View style={styles.loadingContainer}>
            <Image
              source={IMAGES.app_splash_view}
              style={styles.loadingImage}
              resizeMode="cover"
            />
            <View style={styles.loadingOverlay}>
              <ActivityIndicator color="#FFFFFF" size="small" />
            </View>
          </View>
        )} */}

            <CommonLinearContainer containerStyle={{ flex: 1 }}>
              {characterLabel && (
                <ImageBackground
                  source={IMAGES.name_image_bg}
                  style={styles.nameImageBg}
                >
                  <Text style={styles.characterTagText}>{characterLabel}</Text>
                </ImageBackground>
              )}

              {item?.tag && !isBlur && (
                <View style={styles.tag}>
                  <Text style={styles.tagText}>{item?.tag}</Text>
                </View>
              )}

              {/* Show overlay buttons only if not blurred */}
              {!isBlur && (
                <View
                  style={[
                    styles.overlayButtons,
                    {
                      height: isMyAvatar ? scale(80) : scale(110),
                    },
                  ]}
                >
                  <ImageBackground
                    style={styles.blurContainer}
                    blurRadius={20}
                    source={IMAGES.blur}
                  />
                  <View
                    style={[
                      styles.iconGroup,
                      {
                        justifyContent: isMyAvatar
                          ? 'space-evenly'
                          : 'space-around',
                      },
                    ]}
                  >
                    {!isMyAvatar && (
                      <TouchableOpacity onPress={() => onLikePress(item)}>
                        <Image
                          source={
                            isLike ?? item?.isLike
                              ? IMAGES.avatar_like_icon
                              : IMAGES.avatar_unlike_icon
                          }
                          style={[
                            styles.icon,
                            {
                              // tintColor:
                              //   isLike ?? item?.isLike ? 'red' : theme.white,
                            },
                          ]}
                        />
                      </TouchableOpacity>
                    )}
                    <TouchableOpacity
                      style={{
                        backgroundColor: theme.white,
                        borderRadius: scale(20),
                        overflow: 'hidden',
                      }}
                      onPress={() => onCallPress(item)}
                    >
                      <Image
                        source={IMAGES.avatar_call_icon}
                        style={styles.icon}
                      />
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={[
                        styles.overlayIcon,
                        { backgroundColor: theme.boyFriend },
                      ]}
                      onPress={() => onChatPress(item)}
                    >
                      <Image source={IMAGES.Hchat} style={styles.chatIcon} />
                    </TouchableOpacity>
                  </View>
                </View>
              )}

              <View style={styles.bottomInfo}>
                <Text style={styles.avatarName}>{item?.name ?? 'Unknown'}</Text>
                {item?.age && (
                  <Text style={styles.avatarAge}>AGE: {item?.age ?? 18}</Text>
                )}
              </View>
            </CommonLinearContainer>

            <Image
              source={IMAGES.app_splash_view}
              style={styles.loadingPlaceholder}
              resizeMode="cover"
            />
          </ImageBackground>
        </TouchableOpacity>
      )}
    </>
  );
};

export default CommonHomeAvatar;

const Styles = () => {
  const theme = useThemeStore().theme;
  return StyleSheet.create({
    avatarCard: {
      flex: 1,
      margin: 5,
      borderRadius: scale(20),
      height: scale(280),
      overflow: 'hidden',
    },
    avatarImage: {
      flex: 1,
      width: '100%',
      resizeMode: 'contain',
      borderRadius: scale(20),
    },
    blurPressableArea: {
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      borderRadius: scale(20),
      backgroundColor: 'rgba(0, 0, 0, 0.1)',
    },
    fullImageBlur: {
      zIndex: 15,
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      borderRadius: scale(20),
    },
    lockIconContainer: {
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      justifyContent: 'center',
      alignItems: 'center',
      zIndex: 20,
    },
    lockIconBackground: {
      backgroundColor: 'rgba(0, 0, 0, 0.7)',
      borderRadius: scale(20),
      paddingHorizontal: scale(24),
      paddingVertical: scale(20),
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
      // minWidth: scale(160),
    },
    lockIcon: {
      width: scale(40),
      height: scale(40),
      tintColor: '#FFFFFF',
      marginBottom: scale(12),
      resizeMode: 'contain',
    },
    lockText: {
      color: '#FFFFFF',
      fontSize: scale(18),
      fontFamily: Fonts.ISemiBold,
      textAlign: 'center',
      marginBottom: scale(8),
    },
    unlockText: {
      color: '#FFFFFF',
      fontSize: scale(14),
      fontFamily: Fonts.IRegular,
      textAlign: 'center',
      opacity: 0.9,
    },
    nameImageBg: {
      width: scale(54),
      height: scale(22),
      resizeMode: 'contain',
      margin: scale(8),
      padding: scale(2),
      justifyContent: 'center',
      alignItems: 'center',
    },
    bottomInfo: {
      position: 'absolute',
      bottom: scale(0),
      left: scale(15),
      paddingHorizontal: scale(0),
      paddingVertical: verticalScale(10),
    },
    avatarName: {
      fontSize: scale(14),
      fontFamily: Fonts.ISemiBold,
      color: '#fff',
    },
    avatarAge: {
      fontSize: scale(10),
      color: '#fff',
      fontFamily: Fonts.IRegular,
      letterSpacing: scale(1),
      marginTop: scale(5),
    },
    tag: {
      position: 'absolute',
      top: scale(12),
      left: scale(12),
      backgroundColor: '#00000080',
      paddingHorizontal: scale(12),
      paddingVertical: verticalScale(5),
      borderRadius: scale(16),
      zIndex: 10,
    },
    tagText: {
      color: '#fff',
      fontSize: scale(13),
      fontWeight: '600',
    },
    characterTagText: {
      color: '#FFFFFF',
      fontSize: scale(10),
      fontWeight: '600',
      fontFamily: Fonts.IRegular,
      textAlign: 'center',
    },
    overlayButtons: {
      position: 'absolute',
      top: '30%',
      right: 0,
      width: scale(50),
      height: scale(170),
      borderTopLeftRadius: scale(20),
      borderBottomLeftRadius: scale(20),
      overflow: 'hidden',
      zIndex: 10,
    },
    blurContainer: {
      ...StyleSheet.absoluteFillObject,
      borderTopLeftRadius: scale(20),
      borderBottomLeftRadius: scale(20),
    },
    iconGroup: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'space-around',
      backgroundColor: '#00000099',
      borderTopLeftRadius: scale(20),
      borderBottomLeftRadius: scale(20),
    },
    overlayIcon: {
      padding: scale(8),
      width: scale(25),
      height: scale(25),
      backgroundColor: '#FFFFFF3D',
      borderRadius: 50,
      justifyContent: 'center',
      alignItems: 'center',
    },
    disabledIcon: {
      backgroundColor: '#FFFFFF1A',
      opacity: 0.6,
    },
    icon: {
      width: scale(25),
      height: scale(25),
      resizeMode: 'contain',
    },
    chatIcon: {
      width: scale(15),
      height: scale(15),
      resizeMode: 'contain',
    },
    loadingContainer: {
      position: 'absolute',
      width: '100%',
      height: '100%',
      overflow: 'hidden',
    },
    loadingImage: {
      width: '100%',
      height: '100%',
    },
    loadingOverlay: {
      position: 'absolute',
      width: '100%',
      height: '100%',
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: 'rgba(0,0,0,0.4)',
    },
    loadingPlaceholder: {
      ...StyleSheet.absoluteFillObject,
      width: '100%',
      height: '100%',
      zIndex: -1,
    },
  });
};
