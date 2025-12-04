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
import { useThemeStore } from '../store/themeStore';
import { customColors } from '../utils/Colors';

interface NativeAdComponentProps {
  nativeAd: NativeAd;
  nativeStyles?: any;
}

const NativeAdSmallComponent: React.FC<NativeAdComponentProps> = ({
  nativeAd,
  nativeStyles,
}) => {
  const styles = Styles();
  return (
    <View style={[styles.adMainContainer, nativeStyles]}>
      <View style={styles.adAdTxtContainer}>
        <Text style={styles.adAdTxt}>AD</Text>
      </View>
      <NativeAdView nativeAd={nativeAd} style={[styles.adNativeAdView]}>
        <View style={styles.adHeaderRow}>
          {nativeAd.icon && (
            <NativeAsset assetType={NativeAssetType.ICON}>
              <Image
                source={{ uri: nativeAd.icon.url }}
                style={styles.adIconImage}
                resizeMode="contain"
              />
            </NativeAsset>
          )}
          <View style={{ flex: 1 }}>
            <View style={styles.adTitleRow}>
              <NativeAsset assetType={NativeAssetType.HEADLINE}>
                <Text style={styles.adHeadline} numberOfLines={2}>
                  {nativeAd.headline}
                </Text>
              </NativeAsset>
              z
            </View>
            {nativeAd.body && (
              <NativeAsset assetType={NativeAssetType.BODY}>
                <Text style={styles.adBodyText} numberOfLines={2}>
                  {nativeAd.body}
                </Text>
              </NativeAsset>
            )}
          </View>
        </View>
        <View style={styles.adBtnContainer}>
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

export default NativeAdSmallComponent;

const Styles = () => {
  const insets = useSafeAreaInsets();
  const theme = useThemeStore.getState().theme;
  return StyleSheet.create({
    adMainContainer: {
      borderWidth: 1,
      borderColor: customColors.progressBgColor,
      marginHorizontal: scale(10),
      marginBottom: insets.bottom + 5,
    },
    adNativeAdView: {
      marginHorizontal: scale(3),
      marginTop: scale(16),
      marginBottom: scale(3),
    },
    adAdContainer: {
      flexDirection: 'row',
      padding: scale(12),
    },
    adBtnContainer: {
      flexDirection: 'column',
      paddingTop: 0,
    },
    adAdImage: {
      width: '100%',
      height: scale(120),
      backgroundColor: customColors.black,
      justifyContent: 'center',
      alignItems: 'center',
    },
    adMediaView: {
      width: '100%',
      height: '100%',
    },
    adAdContent: {
      // marginVertical: scale(6),
    },
    adHeaderRow: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: scale(8),
    },
    adIconImage: {
      width: scale(42),
      height: scale(42),
      borderRadius: scale(100),
      marginRight: scale(8),
      borderWidth: 0.5,
      borderColor: customColors.black,
    },
    adTitleRow: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    adAdTxtContainer: {
      backgroundColor: theme.card,
      paddingHorizontal: scale(6),
      paddingVertical: scale(1),
      borderRadius: scale(10),
      position: 'absolute',
      top: scale(2),
      left: scale(2),
    },
    adAdTxt: {
      color: theme.heading,
      fontSize: scale(7),
      fontFamily: Fonts.ISemiBold,
    },
    adHeadline: {
      color: customColors.black,
      fontSize: scale(12),
      fontFamily: Fonts.IMedium,
    },
    adBodyText: {
      color: theme.heading,
      fontSize: scale(11),
      fontFamily: Fonts.IRegular,
      lineHeight: scale(16),
    },
    adCtaButton: {
    },
    adCtaText: {
      backgroundColor: theme.primaryFriend,
      paddingHorizontal: scale(16),
      paddingVertical: scale(10),
      borderRadius: scale(8),
      color: '#FFFFFF',
      fontSize: scale(14),
      fontFamily: Fonts.ISemiBold,
      textAlign: 'center',
    },
  });
};
