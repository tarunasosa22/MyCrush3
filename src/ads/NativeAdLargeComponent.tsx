import { Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import React from 'react';
import {
  NativeAd,
  NativeAdView,
  NativeAsset,
  NativeAssetType,
  NativeMediaView,
} from 'react-native-google-mobile-ads';
import { scale } from '../utils/Scale';
import Fonts from '../utils/fonts';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { customColors } from '../utils/Colors';
import { useThemeStore } from '../store/themeStore';

interface NativeAdComponentProps {
  nativeAd: NativeAd;
  nativeStyles?: any;
}

const NativeAdLargeComponent: React.FC<NativeAdComponentProps> = ({
  nativeAd,
  nativeStyles,
}) => {
  const styles = Styles();
  console.log('nativeAd', nativeAd);

  return (
    <View style={[styles.adMainContainer, nativeStyles]}>
      <NativeAdView nativeAd={nativeAd} style={styles.adNativeAdView}>
        {/* Media Section */}
        <View style={styles.adMediaContainer}>
          <NativeMediaView style={styles.adMediaView} />
          {/* <View style={styles.adBadge}>
            <Text style={styles.adBadgeText}>Ad</Text>
          </View> */}
        </View>

        {/* Content Section */}
        <View style={styles.adContentContainer}>
          {/* Header with Icon */}
          <View style={styles.adHeaderSection}>
            {nativeAd.icon && (
              <NativeAsset assetType={NativeAssetType.ICON}>
                <View style={styles.adIconContainer}>
                  <Image
                    source={{ uri: nativeAd.icon.url }}
                    style={styles.adIconImage}
                    resizeMode="cover"
                  />
                </View>
              </NativeAsset>
            )}

            {/* Title and Body */}
            <View style={styles.adTextContainer}>
              {nativeAd.headline && (
                <NativeAsset assetType={NativeAssetType.HEADLINE}>
                  <Text style={styles.adHeadline} numberOfLines={1}>
                    {nativeAd.headline}
                  </Text>
                </NativeAsset>
              )}

              {nativeAd.body && (
                <NativeAsset assetType={NativeAssetType.BODY}>
                  <Text style={styles.adBodyText} numberOfLines={2}>
                    {nativeAd.body}
                  </Text>
                </NativeAsset>
              )}
            </View>
          </View>
          {nativeAd.callToAction && (
            <NativeAsset assetType={NativeAssetType.CALL_TO_ACTION}>
                <Text style={styles.adCtaText}>{nativeAd.callToAction}</Text>
            </NativeAsset>
          )}
        </View>
      </NativeAdView>
    </View>
  );
};

export default NativeAdLargeComponent;

const Styles = () => {
  const insets = useSafeAreaInsets();
  const theme = useThemeStore.getState().theme;
  return StyleSheet.create({
    adMainContainer: {
      // marginHorizontal: scale(1),
      // marginBottom: insets.bottom + 1,
      // borderWidth: 1,
      // borderColor: customColors.progressBgColor,
      backgroundColor: theme.primaryBackground,
    },
    adNativeAdView: {
      width: '100%',
      flex: 1,
    },

    // Media Section
    adMediaContainer: {
      flex: 1,
      width: '100%',
      // flex: 1,
      // height: scale(400),
      justifyContent: 'center',
      alignItems: 'center',
      // position: 'relative',
    },
    adMediaView: {
      width: '100%',
      height: '100%',
      // alignSelf: 'center',
    },

    // Content Section
    adContentContainer: {
      paddingHorizontal: scale(10),
      paddingVertical: scale(5),
    },
    adHeaderSection: {
      flexDirection: 'row',
      marginBottom: scale(12),
    },
    adIconContainer: {
      width: scale(48),
      height: scale(48),
      borderRadius: scale(8),
      overflow: 'hidden',
      backgroundColor: '#F5F5F5',
      marginRight: scale(12),
      borderWidth: 1,
      borderColor: '#E0E0E0',
    },
    adIconImage: {
      width: '100%',
      height: '100%',
    },
    adTextContainer: {
      flex: 1,
      justifyContent: 'center',
    },
    adHeadline: {
      color: '#1A1A1A',
      fontSize: scale(15),
      fontFamily: Fonts.ISemiBold,
      lineHeight: scale(22),
      marginBottom: scale(4),
    },
    adAdvertiser: {
      color: '#666666',
      fontSize: scale(12),
      fontFamily: Fonts.IMedium,
      marginBottom: scale(6),
    },
    adBodyText: {
      color: '#4A4A4A',
      fontSize: scale(13),
      fontFamily: Fonts.IRegular,
      lineHeight: scale(18),
    },

    // Rating Section
    adRatingContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: scale(12),
      paddingVertical: scale(4),
    },
    adStar: {
      fontSize: scale(16),
      marginRight: scale(2),
    },
    adStarFilled: {
      color: '#FFA500',
    },
    adStarEmpty: {
      color: '#E0E0E0',
    },
    adRatingText: {
      color: '#666666',
      fontSize: scale(12),
      fontFamily: Fonts.IMedium,
      marginLeft: scale(6),
    },

    // CTA Button
    adCtaButton: {
      backgroundColor: theme.primaryFriend || '#007AFF',
      paddingVertical: scale(14),
      paddingHorizontal: scale(24),
      borderRadius: scale(8),
      alignItems: 'center',
      justifyContent: 'center',
      shadowColor: theme.primaryFriend || '#007AFF',
      shadowOffset: {
        width: 0,
        height: 4,
      },
      shadowOpacity: 0.2,
      shadowRadius: 8,
      elevation: 4,
      marginBottom: scale(5),
    },
    adCtaText: {
      backgroundColor: theme.primaryFriend || '#007AFF',
      paddingVertical: scale(14),
      paddingHorizontal: scale(24),
      borderRadius: scale(8),
      alignItems: 'center',
      justifyContent: 'center',
      color: '#FFFFFF',
      fontSize: scale(15),
      fontFamily: Fonts.ISemiBold,
      textAlign: 'center',
      letterSpacing: 0.3,
    },
  });
};
