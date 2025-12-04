import React, { useEffect, useState } from 'react';
import { StyleSheet, View, ViewStyle } from 'react-native';
import {
  BannerAd,
  BannerAdSize,
  BannerAdProps,
} from 'react-native-google-mobile-ads';
import { useAdsStore } from '../../store/useAdsStore';
import { adsKeyword, EVENT_NAME } from '../../constants';
import { logFirebaseEvent } from '../../utils/HelperFunction';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { customColors } from '../../utils/Colors';
import SkeletonPlaceholder from 'react-native-skeleton-placeholder';
import { moderateScale, scale, verticalScale } from '../../utils/Scale';

type LoadBannerAdProps = {
  size?:
    | typeof BannerAdSize.ANCHORED_ADAPTIVE_BANNER
    | typeof BannerAdSize.FULL_BANNER
    | typeof BannerAdSize.LEADERBOARD
    | typeof BannerAdSize.MEDIUM_RECTANGLE
    | typeof BannerAdSize.LARGE_BANNER
    | typeof BannerAdSize.WIDE_SKYSCRAPER;
  adUnitId?: string | null;
  style?: ViewStyle;
  bannerAdContainerStyle?: ViewStyle;
  isCreateAvatar?: boolean;
  onAdFailedToLoad?: () => void;
  onAdLoaded?: () => void;
};

const LoadBannerAd: React.FC<LoadBannerAdProps> = ({
  size = BannerAdSize.ANCHORED_ADAPTIVE_BANNER,
  adUnitId,
  isCreateAvatar,
  style,
  bannerAdContainerStyle,
  onAdFailedToLoad,
  onAdLoaded,
}) => {
  const { remoteData, isAdsVisible } = useAdsStore();
  const [adIsFailed, setAdIsFailed] = useState(false);
  const [adIsLoading, setAdIsLoading] = useState(true);
  const insets = useSafeAreaInsets();

  const shouldShowAd = adUnitId && isAdsVisible && !adIsFailed;

  const adGetSkeletonHeight = () => {
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

  useEffect(() => {
    if (!shouldShowAd) {
      onAdFailedToLoad?.();
    }
  }, [shouldShowAd]);

  if (!shouldShowAd) {
    return <></>;
  }

  console.log(
    'come in first step banner load........',
    remoteData.admobBannerId,
    adUnitId,
  );

  // Skeleton shimmer animation component
  const AdSkeletonLoader = ({ size }: { size: string }) => {
    // Get skeleton height based on banner size

    return (
      <View style={styles.adSkeletonContainer}>
        <SkeletonPlaceholder
          borderRadius={8}
          highlightColor="#E0E0E0"
          backgroundColor="#F2F2F2"
          speed={1200}
        >
          <View
            style={{
              width: '100%',
              paddingHorizontal: scale(25),
            }}
          >
            <SkeletonPlaceholder.Item flexDirection="row" alignItems="center">
              {/* Profile Picture */}
              <SkeletonPlaceholder.Item
                width={scale(45)}
                height={scale(45)}
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
  const AdCreateAvatarSkeletonLoader = () => {
    return (
      <View style={styles.adCreateAvatarSkeletonContainer}>
        <SkeletonPlaceholder
          highlightColor="#E0E0E0"
          backgroundColor="#F2F2F2"
          speed={1200}
        >
          <View
            style={{
              width: '100%',
              paddingHorizontal: scale(20),
              paddingVertical: scale(10),
            }}
          >
            {/* Video Thumbnail with Test Ad label */}
            <SkeletonPlaceholder.Item
              width={scale(300)}
              height={verticalScale(110)}
              borderRadius={moderateScale(8)}
              marginBottom={verticalScale(12)}
              alignSelf="center"
            />

            {/* Title */}
            <SkeletonPlaceholder.Item
              width={scale(150)}
              height={verticalScale(20)}
              borderRadius={moderateScale(4)}
              marginBottom={verticalScale(12)}
            />

            {/* Bottom section with icon, text and button */}
            <SkeletonPlaceholder.Item
              flexDirection="row"
              alignItems="center"
              justifyContent="space-between"
            >
              {/* Left side - Icon and text */}
              <SkeletonPlaceholder.Item flexDirection="row" alignItems="center">
                {/* App Icon */}
                <SkeletonPlaceholder.Item
                  width={scale(50)}
                  height={scale(50)}
                  borderRadius={moderateScale(8)}
                />

                {/* Text lines */}
                <SkeletonPlaceholder.Item marginLeft={scale(12)}>
                  <SkeletonPlaceholder.Item
                    width={scale(120)}
                    height={verticalScale(14)}
                    borderRadius={moderateScale(4)}
                  />
                  <SkeletonPlaceholder.Item
                    marginTop={verticalScale(6)}
                    width={scale(100)}
                    height={verticalScale(12)}
                    borderRadius={moderateScale(4)}
                  />
                </SkeletonPlaceholder.Item>
              </SkeletonPlaceholder.Item>

              {/* More button */}
              <SkeletonPlaceholder.Item
                width={scale(80)}
                height={verticalScale(40)}
                borderRadius={moderateScale(8)}
              />
            </SkeletonPlaceholder.Item>
          </View>
        </SkeletonPlaceholder>
      </View>
    );
  };

  return (
    <View
      style={[
        {
          justifyContent: 'center',
          alignItems: 'center',
          backgroundColor: customColors.white,
          borderColor: customColors.progressBgColor,
          marginBottom: insets.bottom,
          height: adGetSkeletonHeight(),
          // borderWidth: 0.4,
        },
        style,
        !adIsLoading && bannerAdContainerStyle,
      ]}
    >
      {adIsLoading && (
        <>
          {isCreateAvatar ? (
            <AdCreateAvatarSkeletonLoader />
          ) : (
            <View
              style={{
                alignItems: 'center',
                flex: 1,
                justifyContent: 'center',
                borderTopWidth: 0.8,
                borderBottomWidth: 0.8,
                borderColor: customColors.progressBgColor,
                width: '100%',
              }}
            >
              <AdSkeletonLoader size={size} />
            </View>
          )}
        </>
      )}

      <View style={adIsLoading ? styles.adHiddenAd : styles.adVisibleAd}>
        <BannerAd
          unitId={adUnitId}
          size={size}
          requestOptions={{ keywords: remoteData?.adsKeyword ?? adsKeyword }}
          onAdLoaded={() => {
            setAdIsFailed(false);
            setAdIsLoading(false);
            onAdLoaded?.();
            console.log('Banner ad loaded successfully!');
          }}
          onAdFailedToLoad={error => {
            setAdIsFailed(true);
            setAdIsLoading(false);
            onAdFailedToLoad?.();
            console.error('Banner ad failed to load:', error);
          }}
          onPaid={adValue => {
            console.log('🔥 Banner ad impression', adValue);
            const revenue = adValue.value;

            const params = {
              currency: adValue.currency,
              value: revenue,
              formatted_revenue: revenue.toFixed(8),
              precision: adValue.precision,
              ad_unit_id: adUnitId,
              type: EVENT_NAME.BANNER_AD_IMPRESSION,
            };

            logFirebaseEvent(EVENT_NAME.AD_IMPRESSION, params);
          }}
        />
      </View>
    </View>
  );
};

export default LoadBannerAd;

const styles = StyleSheet.create({
  adContainer: {
    width: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  adSkeletonContainer: {
    // width: '100%',
    // justifyContent: 'center',
    // alignItems: 'center',
    // alignSelf: 'center',
    // borderWidth: 1,
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
  adCreateAvatarSkeletonContainer: {
    width: '100%',
    paddingVertical: verticalScale(16),
    borderWidth: 0.8,
    borderColor: customColors.progressBgColor,
  },
});
