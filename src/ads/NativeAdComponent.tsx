import React, { useEffect, useState } from 'react';
import { Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import {
  NativeAd,
  NativeAdEventType,
  NativeAdView,
  NativeAsset,
  NativeAssetType,
  NativeMediaView,
} from 'react-native-google-mobile-ads';
import { native_ad_layout_type, useAdsStore } from '../store/useAdsStore';
import { scale } from '../utils/Scale';
import Fonts from '../utils/fonts';
import { preloadAddStore } from '../store/preloadAddStore';
import SmallNativeAdComponent from './NativeAdSmallComponent';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import NativeAdMediumComponent from './NativeAdMediumComponent';
import { logFirebaseEvent } from '../utils/HelperFunction';
import { EVENT_NAME } from '../constants';
import NativeAdLargeComponent from './NativeAdLargeComponent';

interface NativeAdComponentProps {
  index?: number;
  nativeAd: NativeAd | null;
  nativeStyles?: any;
  type: string;
}

const NativeAdComponent: React.FC<NativeAdComponentProps> = ({
  index,
  nativeAd,
  nativeStyles,
  type,
}: NativeAdComponentProps) => {
  const { isAdsVisible, remoteData } = useAdsStore();

  const handlePaidEvent = () => {
    if (!nativeAd) {
      return;
    }
    nativeAd.addAdEventListener(
      NativeAdEventType.PAID,
      (adValue: { currency: string; precision: number; value: number }) => {
        console.log('🔥 Native ad impression', adValue);
        const revenue = adValue.value;

        const params = {
          currency: adValue.currency,
          value: revenue,
          formatted_revenue: revenue.toFixed(8),
          precision: adValue.precision,
          ad_unit_id: remoteData.admobNativeId,
          type: EVENT_NAME.NATIVE_AD_IMPRESSION,
        };

        // Log to Firebase
        logFirebaseEvent(EVENT_NAME.AD_IMPRESSION, params);
        // handleFirebaseLogEvent('gaz_ad_impression', params);

        console.log('🔥 Sent ad revenue to Firebase Native ad:', adValue);
      },
    );
  };

  useEffect(() => {
    // Cleanup when component unmounts
    return () => {
      if (nativeAd) {
        handlePaidEvent();
        console.log(`🧹 Cleaning up ad at index ${index}`);
        try {
          nativeAd.destroy?.();
        } catch (error) {
          console.error('Error destroying ad:', error);
        }
      }
    };
  }, [nativeAd]);

  // Don't render if ads are not visible or no ad available
  if (!isAdsVisible || !nativeAd) {
    return null;
  }

  return (
    <>
      {type === native_ad_layout_type.large ? (
        <NativeAdLargeComponent
          nativeAd={nativeAd}
          nativeStyles={nativeStyles}
        />
      ) : type === native_ad_layout_type.small ? (
        <SmallNativeAdComponent
          nativeAd={nativeAd}
          nativeStyles={nativeStyles}
        />
      ) : (
        <NativeAdMediumComponent
          nativeAd={nativeAd}
          nativeStyles={nativeStyles}
        />
      )}
    </>
  );
};

export default NativeAdComponent;
