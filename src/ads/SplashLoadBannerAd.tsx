import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Animated } from 'react-native';
import {
  BannerAd,
  BannerAdSize,
} from 'react-native-google-mobile-ads';
import { useAdsStore } from '../store/useAdsStore';
import { adsKeyword, EVENT_NAME } from '../constants';
import SkeletonPlaceholder from 'react-native-skeleton-placeholder';
import { moderateScale, scale, verticalScale } from '../utils/Scale';
import { logFirebaseEvent } from '../utils/HelperFunction';

type LoadBannerAdProps = {
  size?:
    | typeof BannerAdSize.ANCHORED_ADAPTIVE_BANNER
    | typeof BannerAdSize.ADAPTIVE_BANNER
    | typeof BannerAdSize.FULL_BANNER
    | typeof BannerAdSize.LEADERBOARD
    | typeof BannerAdSize.MEDIUM_RECTANGLE
    | typeof BannerAdSize.LARGE_BANNER
    | typeof BannerAdSize.WIDE_SKYSCRAPER;
};

// Skeleton shimmer animation component
const AdSkeletonLoader = ({ size }: { size: string }) => {
  // Get skeleton height based on banner size

  return (
    <View style={[styles.adSkeletonContainer]}>
      <SkeletonPlaceholder
        borderRadius={8}
        highlightColor="#E0E0E0"
        backgroundColor="#F2F2F2"
        speed={1200}
      >
        <View
          style={{
            width: '100%',
            paddingHorizontal: scale(16),
          }}
        >
          <SkeletonPlaceholder.Item flexDirection="row" alignItems="center">
            {/* Profile Picture */}
            <SkeletonPlaceholder.Item
              width={scale(40)}
              height={scale(40)}
              borderRadius={moderateScale(9)}
            />

            {/* Name + Last message */}
            <SkeletonPlaceholder.Item marginLeft={scale(12)}>
              {/* Name line */}
              <SkeletonPlaceholder.Item
                width={scale(180)}
                height={verticalScale(15)}
                borderRadius={moderateScale(8)}
              />
              {/* Message line */}
              <SkeletonPlaceholder.Item
                marginTop={verticalScale(6)}
                width={scale(280)}
                height={verticalScale(14)}
                borderRadius={moderateScale(7)}
              />
            </SkeletonPlaceholder.Item>
          </SkeletonPlaceholder.Item>
        </View>
      </SkeletonPlaceholder>
    </View>
  );
};

const SplashLoadBannerAd: React.FC<LoadBannerAdProps> = ({
  size = BannerAdSize.ANCHORED_ADAPTIVE_BANNER,
}) => {
  const { remoteData, isAdsVisible } = useAdsStore();
  const [isFailed, setIsFailed] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const shouldShowAd =
    remoteData?.admobSplashBannerId && isAdsVisible && !isFailed;

  const getSkeletonHeight = () => {
    switch (size) {
      case BannerAdSize.FULL_BANNER:
        return 65;
      case BannerAdSize.LARGE_BANNER:
        return 105;
      case BannerAdSize.MEDIUM_RECTANGLE:
        return 252;
      case BannerAdSize.LEADERBOARD:
        return 95;
      case BannerAdSize.WIDE_SKYSCRAPER:
        return 605;
      case BannerAdSize.ANCHORED_ADAPTIVE_BANNER:
        return 70;
      default:
        return 50;
    }
  };

  if (!shouldShowAd) {
    return <></>;
  }

  console.log(
    'remoteData.admobSplashBannerId',
    remoteData.admobSplashBannerId,
  );

  return (
    <View style={[styles.adContainer, { height: getSkeletonHeight() }]}>
      {isLoading && (
        <View
          style={{
            alignItems: 'center',
            flex: 1,
            justifyContent: 'center',
            borderColor: '#E0E0E0',
            borderTopWidth: 1,
            borderBottomWidth: 1,
          }}
        >
          <AdSkeletonLoader size={size} />
        </View>
      )}
      <View style={isLoading ? styles.adHiddenAd : styles.adVisibleAd}>
        <BannerAd
          unitId={remoteData.admobSplashBannerId}
          size={size}
          onAdLoaded={() => {
            setIsFailed(false);
            setIsLoading(false);
            console.log('✅ Banner ad loaded successfully!');
          }}
          onAdFailedToLoad={error => {
            setIsFailed(true);
            setIsLoading(false);
            console.error('❌ Banner ad failed to load:', error);
          }}
          requestOptions={{ keywords: remoteData?.adsKeyword ?? adsKeyword }}
          onPaid={adValue => {
            console.log('🔥 Banner ad impression', adValue);
            const revenue = adValue.value;

            const params = {
              currency: adValue.currency,
              value: revenue,
              formatted_revenue: revenue.toFixed(8),
              precision: adValue.precision,
              ad_unit_id: remoteData.admobSplashBannerId,
              type: EVENT_NAME.BANNER_AD_IMPRESSION,
            };

            // Log to Firebase
            logFirebaseEvent(EVENT_NAME.AD_IMPRESSION, params);
            // handleFirebaseLogEvent('gaz_ad_impression', params);

            console.log('🔥 Sent ad revenue to Firebase banner:', adValue);
          }}
        />
      </View>
    </View>
  );
};

export default SplashLoadBannerAd;

const styles = StyleSheet.create({
  adContainer: {
    width: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  adSkeletonContainer: {
    width: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    alignSelf: 'center',
  },
  adSkeleton: {
    flex: 1,
  },
  adHiddenAd: {
    height: 0,
    opacity: 0,
  },
  adVisibleAd: {
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center',
  },
});
