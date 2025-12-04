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
const CustomCategoryAvatarItemCard = ({
  item,
  isSelected,
  onPress,
  imagePreloaded = false, // New prop
  onAudioPress,
  isAudioPlaying = false,
  totalItems,
}: CustomCategoryProps) => {
  const styles = Styles(totalItems);
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
    <View style={styles.avatarContainer}></View>
  ) : (
    <TouchableOpacity
      onPress={onPress}
      disabled={!!item?.category_label}
      style={[
        styles.avatarContainer,
        { aspectRatio: item?.category_label ? 0.7 : 0.8 },
      ]}
    >
      {item?.category_label && (
        <Text style={styles.categoryName}>{item?.category_label}</Text>
      )}
      <View
        style={[
          styles.avatarContainer2,
          { borderColor: item.isSelected ? theme.primaryFriend : '#00000000' },
          { borderWidth: item.isSelected ? 3 : 3 },
        ]}
      >
        <View
          style={[
            styles.imageContainer,
            { borderRadius: item.isSelected ? scale(3) : scale(10) },
          ]}
        >
          {/* Only show loading if image is not preloaded */}
          {!isImageLoaded && !hasImageError && !imagePreloaded && (
            <View style={styles.loadingContainer}>
              <Image
                source={
                  item?.audio ? IMAGES.audio_category_bg : IMAGES.app_icon
                }
                style={styles.loadingImageIcon}
                resizeMode="cover"
              />
              <View style={styles.loadingOverlay}>
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
            style={[styles.avatarImage]}
            onLoad={() => setIsImageLoaded(true)}
            onError={() => setHasImageError(true)}
            resizeMode={FastImage.resizeMode.cover}
          />
          {item.isSelected && (
            <View style={styles.checkContainer}>
              <FastImage
                source={IMAGES.check_white_icon}
                style={{
                  width: scale(25),
                  height: scale(25),
                }}
              />
            </View>
          )}
          <Image
            source={item?.audio ? IMAGES.audio_category_bg : IMAGES.app_icon}
            style={styles.loadingImageIcon}
            resizeMode="cover"
          />
          <LinearGradient
            colors={['transparent', '#00000080']}
            style={[
              styles.imageOverlay,
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
                paddingHorizontal: scale(8),
              }}
            >
              <Text
                style={[
                  styles.overlayText,
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
                style={styles.playBtn}
              />
            </TouchableOpacity>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );
};

export default CustomCategoryAvatarItemCard;

const Styles = (totalItems: number) => {
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
    avatarContainer: {
      width: itemWidth,
      aspectRatio: 0.8,
      borderRadius: scale(10),
      overflow: 'hidden',
    },
    avatarContainer2: {
      flex: 1,
      //   aspectRatio: 0.8,
      borderRadius: scale(10),
      overflow: 'hidden',
      position: 'relative',
    },
    imageContainer: {
      flex: 1,
      //   aspectRatio: 0.8,
      //   borderRadius: scale(18),
      overflow: 'hidden',
      position: 'relative',
    },
    loadingContainer: {
      position: 'absolute',
      width: '100%',
      height: '100%',
      borderRadius: scale(5),
      overflow: 'hidden',
    },
    loadingImageIcon: {
      width: '100%',
      height: '100%',
      borderRadius: scale(5),
      zIndex: -1,
    },
    loadingOverlay: {
      position: 'absolute',
      width: '100%',
      height: '100%',
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: 'rgba(0,0,0,0.4)',
      borderRadius: scale(5),
    },
    avatarImage: {
      width: '100%',
      height: '100%',
      position: 'absolute',
    },

    imageOverlay: {
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
    overlayText: {
      color: theme?.white,
      fontSize: scale(13),
      fontFamily: Fonts.ISemiBold,
      textAlign: 'center',
      // marginVertical: verticalScale(3),
      marginHorizontal: verticalScale(1),
    },
    topText: {
      color: 'red',
      fontSize: scale(14),
      textAlign: 'center',
    },
    selectedTag: {
      backgroundColor: theme?.primaryFriend,
      paddingHorizontal: scale(16),
      paddingVertical: verticalScale(4),
      borderBottomLeftRadius: moderateScale(8),
      borderBottomRightRadius: moderateScale(8),
      alignSelf: 'center',
    },
    selectedText: {
      color: theme?.white,
      fontSize: scale(12),
      fontFamily: Fonts.ISemiBold,
    },
    gridContainer: {
      paddingBottom: verticalScale(24),
    },
    loadingPlaceholder: {
      ...StyleSheet.absoluteFillObject,
      width: '100%',
      height: '100%',
      zIndex: -1,
    },
    playBtn: {
      transform: [{ translateX: -20 }, { translateY: -20 }],
      width: scale(40),
      height: scale(40),
      tintColor: '#888888',
    },
    categoryName: {
      color: '#1B1B1B',
      fontSize: scale(15),
      fontFamily: Fonts.IRegular,
      textAlign: 'center',
    },

    checkContainer: {
      position: 'absolute',
      right: scale(10),
      top: scale(10),
      backgroundColor: theme.primaryFriend,
      borderRadius: scale(50),
      padding: scale(itemWidth * 0.01),
      paddingRight: scale(itemWidth * 0.01) + 0.5,
    },
  });
};
