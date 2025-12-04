import {
  Image,
  ImageBackground,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import React, { useState } from 'react';
import { AvatarItem } from '../../store/categoryStore';
import { useThemeStore } from '../../store/themeStore';
import IMAGES from '../../assets/images';
import { CARD_HEIGHT, CARD_WIDTH } from '../../screens/HomeScreen';
import { scale, verticalScale } from '../../utils/Scale';
import Fonts from '../../utils/fonts';

const CustomHomeAvatarCard: React.FC<{
  item: AvatarItem;
  onCardPress: () => void;
  onCallPress: () => void;
  onChatPress: () => void;
  onLikePress: () => void;
  onDislikePress: () => void;
  isBlur: boolean;
  isLike?: boolean;
}> = ({
  item,
  onCardPress,
  onCallPress,
  onChatPress,
  onLikePress,
  onDislikePress,
  isLike,
  isBlur,
}) => {
  const { theme } = useThemeStore.getState();
  const avatarCharacterLabel =
    item?.categories?.find((cat: any) => cat.label === 'Character')
      ?.options?.[0]?.label ?? null;

  const [hasImageError, setImageError] = useState(false);
  const [isImageLoading, setImageLoading] = useState(true);
  const homeStyles = Styles();

  return (
    <View style={homeStyles.avatarCard}>
      <TouchableOpacity
        activeOpacity={0.95}
        onPress={onCardPress}
        style={homeStyles.cardTouchableArea}
      >
        <View style={homeStyles.cardImageWrapper}>
          {(isImageLoading || hasImageError) && (
            <View style={homeStyles.imagePlaceholderContainer}>
              <ImageBackground
                source={IMAGES.app_splash_view}
                style={homeStyles.placeholderImageStyle}
                resizeMode="cover"
                blurRadius={isBlur ? 10 : 0}
              />
            </View>
          )}
          <ImageBackground
            source={
              item.cover_image || item.image
                ? {
                    uri: item.cover_image || item.image,
                  }
                : IMAGES.app_splash_view
            }
            blurRadius={isBlur ? 10 : 0}
            style={[
              homeStyles.cardImageStyle,
              (isImageLoading || hasImageError) && { opacity: 0 },
            ]}
            resizeMode="cover"
            onLoadStart={() => setImageLoading(true)}
            onLoadEnd={() => setImageLoading(false)}
            onError={() => {
              setImageError(true);
              setImageLoading(false);
            }}
          >
            <View style={homeStyles.cardActionButtonsContainer}>
              <TouchableOpacity
                onPress={() => (isLike ? onDislikePress() : onLikePress())}
              >
                <Image
                  source={
                    isLike ? IMAGES.avatar_unlike_icon : IMAGES.avatar_like_icon
                  }
                  style={[homeStyles.actionIconImage]}
                />
              </TouchableOpacity>
              <TouchableOpacity
                style={{
                  backgroundColor: theme.white,
                  borderRadius: scale(20),
                }}
                onPress={onCallPress}
              >
                <Image
                  source={IMAGES.avatar_call_icon}
                  style={homeStyles.actionIconImage}
                />
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  homeStyles.actionIconButton,
                  { backgroundColor: theme.boyFriend },
                ]}
                onPress={onChatPress}
              >
                <Image
                  source={IMAGES.Hchat}
                  style={homeStyles.chatActionIcon}
                />
              </TouchableOpacity>
            </View>
          </ImageBackground>
        </View>

        {/* Character Tag */}
        {avatarCharacterLabel && !isBlur && (
          <View style={homeStyles.characterLabelTag}>
            <Text style={homeStyles.characterLabelText}>
              {avatarCharacterLabel}
            </Text>
          </View>
        )}

        {!isBlur && (
          <View style={homeStyles.avatarInfoContainer}>
            <View style={homeStyles.avatarNameContainer}>
              <Text style={homeStyles.avatarNameText}>{item.name}</Text>
              {item.age && (
                <Text style={homeStyles.avatarAgeText}>AGE: {item.age}</Text>
              )}
            </View>
          </View>
        )}

        {isBlur && (
          <View style={homeStyles.premiumLockContainer}>
            <View style={homeStyles.premiumLockBackground}>
              <Image
                source={IMAGES.lock}
                style={homeStyles.premiumLockIcon}
                resizeMode="contain"
              />
              <Text style={homeStyles.premiumUnlockText}>{`Tap to view`}</Text>
            </View>
          </View>
        )}
      </TouchableOpacity>
    </View>
  );
};

export default CustomHomeAvatarCard;

const Styles = () => {
  const theme = useThemeStore().theme;
  return StyleSheet.create({
    avatarCard: {
      width: CARD_WIDTH,
      height: CARD_HEIGHT,
      borderRadius: scale(20),
      overflow: 'hidden',
    },
    cardTouchableArea: {
      flex: 1,
    },
    cardImageWrapper: {
      width: '100%',
      height: '95%',
      borderRadius: scale(20),
      borderWidth: 1,
      borderColor: theme.heading,
      overflow: 'hidden',
    },
    cardImageStyle: {
      width: '100%',
      height: '100%',
      // borderRadius: scale(20),
      overflow: 'hidden',
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.25,
      shadowRadius: 1.84,
      justifyContent: 'flex-end',
      // elevation: 1,
    },
    imagePlaceholderContainer: {
      ...StyleSheet.absoluteFillObject,
      backgroundColor: '#f0f0f0',
      justifyContent: 'center',
      alignItems: 'center',
      borderRadius: scale(20),
      overflow: 'hidden',
    },
    placeholderImageStyle: {
      width: '100%',
      height: '100%',
    },
    characterLabelTag: {
      position: 'absolute',
      top: scale(15),
      right: scale(15),
      backgroundColor: '#2C2C2C99',
      borderWidth: 1,
      borderColor: '#FFFFFFAA',
      paddingHorizontal: scale(16),
      paddingVertical: verticalScale(8),
      borderRadius: scale(20),
    },
    characterLabelText: {
      color: '#FFFFFF',
      fontSize: scale(14),
      fontWeight: '600',
      fontFamily: Fonts.IRegular,
    },
    avatarInfoContainer: {
      position: 'absolute',
      top: scale(5),
      left: scale(5),
      borderRadius: scale(15),
      paddingHorizontal: scale(20),
      paddingVertical: verticalScale(15),
    },
    avatarNameContainer: {
      marginBottom: verticalScale(5),
    },
    avatarNameText: {
      fontSize: scale(15),
      fontWeight: '600',
      fontFamily: Fonts.IBold,
      color: '#fff',
    },
    avatarAgeText: {
      fontSize: scale(12),
      color: '#fff',
      fontFamily: Fonts.IRegular,
      letterSpacing: scale(1),
      marginTop: verticalScale(6),
    },
    premiumLockContainer: {
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      justifyContent: 'center',
      alignItems: 'center',
      zIndex: 999999,
    },
    premiumLockBackground: {
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
    premiumLockIcon: {
      width: scale(40),
      height: scale(40),
      tintColor: '#FFFFFF',
      marginBottom: scale(12),
      resizeMode: 'contain',
    },
    premiumLockText: {
      color: '#FFFFFF',
      fontSize: scale(18),
      fontFamily: Fonts.ISemiBold,
      textAlign: 'center',
      marginBottom: scale(8),
    },
    premiumUnlockText: {
      color: '#FFFFFF',
      fontSize: scale(14),
      fontFamily: Fonts.IRegular,
      textAlign: 'center',
      opacity: 0.9,
    },
    chatActionIcon: {
      width: scale(20),
      height: scale(20),
      resizeMode: 'contain',
    },
    cardActionButtonsContainer: {
      flexDirection: 'row',
      justifyContent: 'center',
      alignItems: 'center',
      alignSelf: 'center',
      paddingVertical: verticalScale(10),
      marginBottom: verticalScale(10),
      gap: scale(15),
      paddingHorizontal: scale(10),
      backgroundColor: theme.white + 50,
      borderWidth: 1,
      borderColor: '#FFFFFF73',
      borderRadius: scale(50),
      zIndex: 99,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.25,
      shadowRadius: 1.84,

      elevation: 5,
    },
    cardActionButton: {
      width: scale(56),
      height: scale(56),
      borderRadius: scale(28),
      justifyContent: 'center',
      alignItems: 'center',
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.25,
      shadowRadius: 3.84,
      elevation: 5,
    },
    dislikeActionButton: {
      backgroundColor: '#fff',
    },
    superLikeActionButton: {
      backgroundColor: '#fff',
    },
    likeActionButton: {
      backgroundColor: '#FF4458',
    },
    boostActionButton: {
      backgroundColor: '#fff',
    },
    actionButtonIcon: {
      width: scale(28),
      height: scale(28),
      resizeMode: 'contain',
    },
    emptyCardsContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
    },
    emptyCardsText: {
      fontSize: scale(20),
      fontFamily: Fonts.IBold,
      color: '#666',
      marginBottom: verticalScale(20),
    },
    actionIconImage: {
      width: scale(35),
      height: scale(35),
      resizeMode: 'contain',
    },
    actionIconButton: {
      width: scale(35),
      height: scale(35),
      backgroundColor: '#FFFFFF3D',
      borderRadius: 50,
      justifyContent: 'center',
      alignItems: 'center',
    },
  });
};
