import {
  ActivityIndicator,
  Dimensions,
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import React, { useEffect, useState } from 'react';
import { AvatarCategory, Subcategory } from '../store/categoryStore';
import { moderateScale, scale, verticalScale } from '../utils/Scale';
import { useThemeStore } from '../store/themeStore';
import Fonts from '../utils/fonts';
import LinearGradient from 'react-native-linear-gradient';
import IMAGES from '../assets/images';
import { SCREEN_WIDTH } from '../constants';
import FastImage from 'react-native-fast-image';

const { width: screenWidth } = Dimensions.get('window');

type CustomCategoryProps = {
  item: Subcategory;
  isSelected: boolean;
  onPress: () => void;
  imagePreloaded?: boolean;
  onAudioPress?: () => void;
  isAudioPlaying?: boolean;
  totalItems: number;
};
const CustomCategoryAvatarCard = ({
  item,
  isSelected,
  onPress,
  imagePreloaded = false, // New prop
  onAudioPress,
  isAudioPlaying = false,
  totalItems,
}: CustomCategoryProps) => {
  const styles = useStyles(totalItems);
  const theme = useThemeStore().theme;
  const [isImageLoaded, setIsImageLoaded] = useState(imagePreloaded);
  const [hasImageError, setHasImageError] = useState(false);

  // Update isImageLoaded when imagePreloaded changes
  useEffect(() => {
    if (imagePreloaded) {
      setIsImageLoaded(true);
    }
  }, [imagePreloaded]);

  return item?.isEmpty ? (
    <View style={styles.categoryAvatarCardContainer}></View>
  ) : (
    <TouchableOpacity
      onPress={onPress}
      disabled={!!item?.category_label}
      style={[
        styles.categoryAvatarCardContainer,
        { aspectRatio: item?.category_label ? 0.7 : 0.8 },
      ]}
    >
      {item?.category_label && (
        <Text style={styles.categoryAvatarCardCategoryName}>
          {item?.category_label}
        </Text>
      )}
      <View
        style={[
          styles.categoryAvatarCardContainer2,
          { borderColor: item.isSelected ? theme.primaryFriend : '#00000000' },
          { borderWidth: item.isSelected ? 3 : 3 },
        ]}
      >
        <View
          style={[
            styles.categoryAvatarCardImageContainer,
            { borderRadius: item.isSelected ? scale(3) : scale(10) },
          ]}
        >
          {/* Only show loading if image is not preloaded */}
          {!isImageLoaded && !hasImageError && !imagePreloaded && (
            <View style={styles.categoryAvatarCardLoadingContainer}>
              <Image
                source={
                  item?.audio ? IMAGES.audio_category_bg : IMAGES.app_icon
                }
                style={styles.categoryAvatarCardLoadingImageIcon}
                resizeMode="cover"
              />
              <View style={styles.categoryAvatarCardLoadingOverlay}>
                <ActivityIndicator color="#FFFFFF" size="small" />
              </View>
            </View>
          )}
          <FastImage
            source={
              item?.audio
                ? IMAGES.audio_category_bg
                : {
                    uri: item.image || undefined,
                    priority: FastImage.priority.high,
                    cache: FastImage.cacheControl.immutable,
                  }
            }
            style={[styles.categoryAvatarCardImage]}
            onLoad={() => setIsImageLoaded(true)}
            onError={() => setHasImageError(true)}
            resizeMode={FastImage.resizeMode.cover}
          />
          {/* {item.isSelected && (
            <View style={styles.categoryAvatarCardSelectedTag}>
              <Text style={styles.categoryAvatarCardSelectedText}>Selected</Text>
            </View>
          )} */}
          <Image
            source={item?.audio ? IMAGES.audio_category_bg : IMAGES.app_icon}
            style={styles.categoryAvatarCardLoadingImageIcon}
            resizeMode="cover"
          />
          <LinearGradient
            colors={
              item.isSelected
                ? [theme.primaryFriend, theme.primaryFriend]
                : !item.image
                ? ['transparent', '#00000030']
                : ['transparent', '#00000080']
            }
            style={[
              styles.categoryAvatarCardImageOverlay,
              {
                paddingVertical: verticalScale(0),
                paddingHorizontal: scale(0),
                bottom: -0.5,
              },
            ]}
          >
            <View
              style={{
                flex: 1,
                // paddingVertical: verticalScale(4),
                paddingHorizontal: scale(8),
              }}
            >
              <Text
                style={[
                  styles.categoryAvatarCardOverlayText,
                  {
                    marginVertical: isSelected
                      ? verticalScale(2)
                      : verticalScale(3),
                  },
                ]}
                numberOfLines={2}
              >
                {item.label}
              </Text>
            </View>
          </LinearGradient>
          {item?.audio && (
            <TouchableOpacity
              style={{ position: 'absolute', top: '50%', left: '50%' }}
              onPress={() => {
                onPress?.();
                onAudioPress?.();
              }}
            >
              <Image
                source={isAudioPlaying ? IMAGES.pause_audio : IMAGES.play_audio}
                style={styles.categoryAvatarCardPlayBtn}
              />
            </TouchableOpacity>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );
};

export default CustomCategoryAvatarCard;

const useStyles = (totalItems: number) => {
  const theme = useThemeStore().theme;
  const containerMargin = scale(15);
  // const itemWidth = (SCREEN_WIDTH - containerMargin * 2 * 2) / 2.9;

  // Width logic
  let itemWidth;
  if (totalItems <= 5) {
    // Fill width evenly with 2 per row, no gap
    itemWidth = (SCREEN_WIDTH - containerMargin * 2) / 2 - scale(8);
  } else {
    // 3-column layout (your existing calculation)
    itemWidth = (SCREEN_WIDTH - containerMargin * 2 * 2) / 2.9;
  }

  return StyleSheet.create({
    categoryAvatarCardContainer: {
      width: itemWidth,
      aspectRatio: 0.8,
      borderRadius: scale(10),
      overflow: 'hidden',
    },
    categoryAvatarCardContainer2: {
      flex: 1,
      //   aspectRatio: 0.8,
      borderRadius: scale(10),
      overflow: 'hidden',
      position: 'relative',
    },
    categoryAvatarCardImageContainer: {
      flex: 1,
      //   aspectRatio: 0.8,
      //   borderRadius: scale(18),
      overflow: 'hidden',
      position: 'relative',
    },
    categoryAvatarCardLoadingContainer: {
      position: 'absolute',
      width: '100%',
      height: '100%',
      borderRadius: scale(5),
      overflow: 'hidden',
    },
    categoryAvatarCardLoadingImageIcon: {
      width: '100%',
      height: '100%',
      borderRadius: scale(5),
      zIndex: -1,
    },
    categoryAvatarCardLoadingOverlay: {
      position: 'absolute',
      width: '100%',
      height: '100%',
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: 'rgba(0,0,0,0.4)',
      borderRadius: scale(5),
    },
    categoryAvatarCardImage: {
      width: '100%',
      height: '100%',
      position: 'absolute',
    },

    categoryAvatarCardImageOverlay: {
      position: 'absolute',
      bottom: 0,
      width: '100%',
      paddingVertical: verticalScale(4),
      paddingHorizontal: scale(8),
      alignItems: 'center',
      justifyContent: 'center',
      fontFamily: Fonts.IRegular,
      fontWeight: '400',
    },
    categoryAvatarCardOverlayText: {
      color: theme?.white,
      fontSize: scale(13),
      fontFamily: Fonts.ISemiBold,
      textAlign: 'center',
      // marginVertical: verticalScale(3),
      marginHorizontal: verticalScale(1),
    },
    categoryAvatarCardTopText: {
      color: 'red',
      fontSize: scale(14),
      textAlign: 'center',
    },
    categoryAvatarCardSelectedTag: {
      backgroundColor: theme?.primaryFriend,
      paddingHorizontal: scale(16),
      paddingVertical: verticalScale(4),
      borderBottomLeftRadius: moderateScale(8),
      borderBottomRightRadius: moderateScale(8),
      alignSelf: 'center',
    },
    categoryAvatarCardSelectedText: {
      color: theme?.white,
      fontSize: scale(12),
      fontFamily: Fonts.ISemiBold,
    },
    categoryAvatarCardGridContainer: {
      paddingBottom: verticalScale(24),
    },
    categoryAvatarCardLoadingPlaceholder: {
      ...StyleSheet.absoluteFillObject,
      width: '100%',
      height: '100%',
      zIndex: -1,
    },
    categoryAvatarCardPlayBtn: {
      transform: [{ translateX: -20 }, { translateY: -20 }],
      width: scale(40),
      height: scale(40),
      tintColor: '#888888',
    },
    categoryAvatarCardCategoryName: {
      color: '#1B1B1B',
      fontSize: scale(15),
      fontFamily: Fonts.IRegular,
      textAlign: 'center',
    },
  });
};
