import React, { useEffect, useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import { scale, verticalScale } from '../utils/Scale';
import Fonts from '../utils/fonts';
import { useThemeStore } from '../store/themeStore';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  interpolate,
  runOnJS,
  useAnimatedGestureHandler,
  withSpring,
} from 'react-native-reanimated';
import { PanGestureHandler } from 'react-native-gesture-handler';
import { preloadAddStore } from '../store/preloadAddStore';
import {
  NativeAdView,
  NativeAsset,
  NativeAssetType,
  NativeMediaView,
} from 'react-native-google-mobile-ads';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');
const CARD_WIDTH = SCREEN_WIDTH - scale(40);
const CARD_HEIGHT = SCREEN_HEIGHT * 0.7; // Match SwipeCard height
const CARD_HEIGHT1 = SCREEN_HEIGHT * 0.65; // Match SwipeCard height
const SWIPE_THRESHOLD = SCREEN_WIDTH * 0.3;

interface NativeAdCardProps {
  index: number;
  isTopCard: boolean;
  onAdDismiss?: () => void;
  onAdLoaded?: () => void;
  onAdFailedToLoad?: () => void;
  isAdsVisible?: boolean;
}

const NativeAdCard: React.FC<NativeAdCardProps> = ({
  index,
  isTopCard,
  onAdDismiss,
  onAdLoaded,
  onAdFailedToLoad,
  isAdsVisible = true,
}) => {
  const { theme } = useThemeStore.getState();
  const [currentNativeAd, setCurrentNativeAd] = useState<any>(null);
  const [isAdLoading, setIsAdLoading] = useState(true);
  const hasCalledAdCallback = useRef(false);
  const nativeAdLoadAttempts = useRef(0);
  const styles = useStyles();

  const nativeAdTranslateX = useSharedValue(0);
  const nativeAdTranslateY = useSharedValue(0);
  const { getNextAd, preloadNativeAds } = preloadAddStore();

  useEffect(() => {
    if (isAdsVisible && !currentNativeAd) {
      // const ad = getNextAd();
      // console.log('DATA===>ad1', ad);
      // if (ad) {
      //   setCurrentNativeAd(ad);
      //   onAdLoaded?.();
      // } else {
      //   console.log('DATA===>ad2', ad);
      //   // Try to load a new ad immediately if preloaded none
      preloadNativeAds(1).then(res => {
        const newAd = getNextAd();
        console.log('DATA===>newAd', res, newAd);
        if (newAd) {
          setCurrentNativeAd(newAd);
          onAdLoaded?.();
        } else {
          onAdFailedToLoad?.();
        }
      });
    }
    // }
  }, [isAdsVisible, currentNativeAd, index]);

  useEffect(() => {
    // Cleanup when component unmounts
    return () => {
      if (currentNativeAd) {
        console.log('currentNativeAd', currentNativeAd);
        try {
          currentNativeAd.destroy?.();
          console.log('Native ad destroyed');
        } catch (error) {
          console.error('Error destroying ad:', error);
        }
      }
    };
  }, [currentNativeAd]);

  const nativeAdAnimatedScale = useSharedValue(1 - index * 0.05);
  const nativeAdAnimatedStackY = useSharedValue(-index * 25);

  // Animate to new position when index changes
  useEffect(() => {
    const targetScale = 1 - index * 0.05;
    const targetY = -index * 25;

    nativeAdAnimatedScale.value = withSpring(targetScale, {
      damping: 20,
      stiffness: 300,
      mass: 0.8,
    });

    nativeAdAnimatedStackY.value = withSpring(targetY, {
      damping: 20,
      stiffness: 300,
      mass: 0.8,
    });
  }, [index]);

  const nativeAdGestureHandler = useAnimatedGestureHandler({
    onStart: (_, ctx: any) => {
      if (isTopCard) {
        console.log('Ad swipe started');
        ctx.startX = nativeAdTranslateX.value;
        ctx.startY = nativeAdTranslateY.value;
      }
    },
    onActive: (event, ctx: any) => {
      if (isTopCard) {
        nativeAdTranslateX.value = ctx.startX + event.translationX;
        nativeAdTranslateY.value = ctx.startY + event.translationY;
      }
    },
    onEnd: event => {
      if (isTopCard) {
        console.log(
          'Ad swipe ended, nativeAdTranslateX:',
          nativeAdTranslateX.value,
        );
        if (Math.abs(nativeAdTranslateX.value) > SWIPE_THRESHOLD) {
          console.log('Ad swipe threshold exceeded, dismissing ad');
          nativeAdTranslateX.value = withTiming(
            nativeAdTranslateX.value > 0
              ? SCREEN_WIDTH + 100
              : -(SCREEN_WIDTH + 100),
            {
              duration: 250,
            },
            finished => {
              if (finished) {
                console.log('Ad animation finished, calling onAdDismiss');
                if (onAdDismiss) {
                  runOnJS(onAdDismiss)();
                }
              }
            },
          );
          nativeAdTranslateY.value = withTiming(nativeAdTranslateY.value + 50, {
            duration: 250,
          });
        } else {
          console.log('Ad snap back to center');
          nativeAdTranslateX.value = withSpring(0, {
            damping: 20,
            stiffness: 200,
            mass: 0.5,
          });
          nativeAdTranslateY.value = withSpring(0, {
            damping: 20,
            stiffness: 200,
            mass: 0.5,
          });
        }
      }
    },
  });

  const nativeAdCardStyle = useAnimatedStyle(() => {
    const rotate = interpolate(
      nativeAdTranslateX.value,
      [-SCREEN_WIDTH / 2, 0, SCREEN_WIDTH / 2],
      [-15, 0, 15],
    );

    const scale_value = 1 - index * 0.05;
    const stackedTranslateY = -index * 25;

    return {
      transform: [
        { translateX: isTopCard ? nativeAdTranslateX.value : 0 },
        {
          translateY: isTopCard
            ? nativeAdTranslateY.value
            : nativeAdAnimatedStackY.value,
        },
        { rotate: `${isTopCard ? rotate : 0}deg` },
        { scale: nativeAdAnimatedScale.value },
      ],
      zIndex: 10 - index,
    };
  });

  const nativeAdSkipOpacity = useAnimatedStyle(() => ({
    opacity: interpolate(
      Math.abs(nativeAdTranslateX.value),
      [0, SWIPE_THRESHOLD],
      [0, 1],
    ),
  }));

  // Don't render if ads are not visible or no ad available
  if (!isAdsVisible || !currentNativeAd) {
    return null;
  }

  return (
    <PanGestureHandler
      onGestureEvent={nativeAdGestureHandler}
      enabled={isTopCard}
    >
      <Animated.View style={[styles.nativeAdCardCard, nativeAdCardStyle]}>
        <View style={styles.nativeAdCardCard1}>
          <NativeAdView
            nativeAd={currentNativeAd}
            style={styles.nativeAdCardNativeAdView}
          >
            <View style={styles.nativeAdCardAdContainer}>
              {/* Ad Badge */}
              <View style={styles.nativeAdCardAdBadge}>
                <Text style={styles.nativeAdCardAdBadgeText}>Ad</Text>
              </View>

              {/* Skip Button - Always visible for easy dismissal */}
              <TouchableOpacity
                style={styles.nativeAdCardSkipButton}
                onPress={() => {
                  console.log('Skip button pressed');
                  onAdDismiss?.();
                }}
              >
                <Text style={styles.nativeAdCardSkipButtonText}>Skip</Text>
              </TouchableOpacity>

              {/* Ad Content */}
              <View style={styles.nativeAdCardAdContent}>
                {/* Ad Media/Image */}
                <View style={styles.nativeAdCardAdMediaContainer}>
                  <NativeMediaView style={styles.nativeAdCardAdMedia} />
                </View>

                {/* Ad Info */}
                <View style={styles.nativeAdCardAdInfo}>
                  <View style={styles.nativeAdCardAdHeader}>
                    {/* App Icon */}
                    {currentNativeAd.icon && (
                      <NativeAsset assetType={NativeAssetType.ICON}>
                        <Image
                          source={{ uri: currentNativeAd.icon.url }}
                          style={styles.nativeAdCardAdIcon}
                          resizeMode="contain"
                        />
                      </NativeAsset>
                    )}

                    <View style={styles.nativeAdCardAdTextContainer}>
                      <NativeAsset assetType={NativeAssetType.HEADLINE}>
                        <Text
                          style={styles.nativeAdCardAdHeadline}
                          numberOfLines={1}
                        >
                          {currentNativeAd.headline || 'Sponsored Content'}
                        </Text>
                      </NativeAsset>

                      {currentNativeAd.advertiser && (
                        <NativeAsset assetType={NativeAssetType.ADVERTISER}>
                          <Text
                            style={styles.nativeAdCardAdAdvertiser}
                            numberOfLines={1}
                          >
                            {currentNativeAd.advertiser}
                          </Text>
                        </NativeAsset>
                      )}
                    </View>
                  </View>

                  {/* Ad Body */}
                  {currentNativeAd.body && (
                    <NativeAsset assetType={NativeAssetType.BODY}>
                      <Text style={styles.nativeAdCardAdBody} numberOfLines={3}>
                        {currentNativeAd.body}
                      </Text>
                    </NativeAsset>
                  )}

                  {/* Call to Action */}
                  {currentNativeAd.callToAction && (
                    <NativeAsset assetType={NativeAssetType.CALL_TO_ACTION}>
                      <TouchableOpacity style={styles.nativeAdCardCtaButton}>
                        <Text style={styles.nativeAdCardCtaText}>
                          {currentNativeAd.callToAction}
                        </Text>
                      </TouchableOpacity>
                    </NativeAsset>
                  )}
                </View>
              </View>

              {/* Swipe to Skip Indicator - Only show on top card */}
              {isTopCard && (
                <Animated.View
                  style={[
                    styles.nativeAdCardSkipIndicator,
                    nativeAdSkipOpacity,
                  ]}
                >
                  <Text style={styles.nativeAdCardSkipText}>SWIPE TO SKIP</Text>
                </Animated.View>
              )}
            </View>
          </NativeAdView>
        </View>
      </Animated.View>
    </PanGestureHandler>
  );
};

export default NativeAdCard;

const useStyles = () => {
  const theme = useThemeStore().theme;

  return StyleSheet.create({
    nativeAdCardCard: {
      position: 'absolute',
      width: CARD_WIDTH,
      height: CARD_HEIGHT,
    },
    nativeAdCardCard1: {
      shadowColor: '#000',
      backgroundColor: theme.white || '#FFFFFF',
      width: CARD_WIDTH,
      height: CARD_HEIGHT1,
      borderRadius: scale(20),
      overflow: 'hidden',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.25,
      shadowRadius: 3.84,
      elevation: 5,
    },
    nativeAdCardLoadingContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: theme.white || '#FFFFFF',
      borderRadius: scale(20),
      borderWidth: 1,
      borderColor: theme.heading || '#E0E0E0',
    },
    nativeAdCardLoadingText: {
      fontSize: scale(16),
      fontFamily: Fonts.IRegular || 'System',
      color: theme.heading || '#666666',
    },
    nativeAdCardNativeAdView: {
      flex: 1,
      borderRadius: scale(20),
      overflow: 'hidden',
    },
    nativeAdCardAdContainer: {
      flex: 1,
      borderRadius: scale(20),
      overflow: 'hidden',
      borderWidth: 1,
      borderColor: theme.heading || '#E0E0E0',
    },
    nativeAdCardAdBadge: {
      position: 'absolute',
      top: scale(15),
      left: scale(15),
      backgroundColor: '#FFB800',
      paddingHorizontal: scale(12),
      paddingVertical: verticalScale(6),
      borderRadius: scale(12),
      zIndex: 10,
    },
    nativeAdCardAdBadgeText: {
      color: '#FFFFFF',
      fontSize: scale(12),
      fontWeight: '700',
      fontFamily: Fonts.IBold || 'System',
    },
    nativeAdCardSkipButton: {
      position: 'absolute',
      top: scale(15),
      right: scale(15),
      backgroundColor: 'rgba(0, 0, 0, 0.6)',
      paddingHorizontal: scale(16),
      paddingVertical: verticalScale(8),
      borderRadius: scale(20),
      zIndex: 10,
    },
    nativeAdCardSkipButtonText: {
      color: '#FFFFFF',
      fontSize: scale(14),
      fontWeight: '700',
      fontFamily: Fonts.IBold || 'System',
    },
    nativeAdCardAdContent: {
      flex: 1,
    },
    nativeAdCardAdMediaContainer: {
      width: '100%',
      height: '60%',
      backgroundColor: '#F0F0F0',
    },
    nativeAdCardAdMedia: {
      width: '100%',
      height: '100%',
    },
    nativeAdCardAdInfo: {
      flex: 1,
      padding: scale(20),
      backgroundColor: theme.white || '#FFFFFF',
    },
    nativeAdCardAdHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: verticalScale(12),
    },
    nativeAdCardAdIcon: {
      width: scale(40),
      height: scale(40),
      borderRadius: scale(8),
      marginRight: scale(12),
      backgroundColor: '#E0E0E0',
    },
    nativeAdCardAdTextContainer: {
      flex: 1,
    },
    nativeAdCardAdHeadline: {
      fontSize: scale(16),
      fontWeight: '700',
      fontFamily: Fonts.IBold || 'System',
      color: theme.heading || '#000000',
      marginBottom: verticalScale(4),
    },
    nativeAdCardAdAdvertiser: {
      fontSize: scale(12),
      fontFamily: Fonts.IRegular || 'System',
      color: '#666666',
    },
    nativeAdCardAdBody: {
      fontSize: scale(14),
      fontFamily: Fonts.IRegular || 'System',
      color: theme.heading || '#333333',
      lineHeight: scale(20),
      marginBottom: verticalScale(16),
    },
    nativeAdCardCtaButton: {
      backgroundColor: theme.boyFriend || '#FF4458',
      paddingVertical: verticalScale(12),
      paddingHorizontal: scale(24),
      borderRadius: scale(25),
      alignItems: 'center',
      justifyContent: 'center',
    },
    nativeAdCardCtaText: {
      color: '#FFFFFF',
      fontSize: scale(16),
      fontWeight: '700',
      fontFamily: Fonts.IBold || 'System',
    },
    nativeAdCardSkipIndicator: {
      position: 'absolute',
      top: scale(80),
      alignSelf: 'center',
      paddingHorizontal: scale(20),
      paddingVertical: verticalScale(10),
      borderWidth: 3,
      borderRadius: scale(10),
      borderColor: '#FFB800',
      backgroundColor: 'rgba(255, 184, 0, 0.1)',
    },
    nativeAdCardSkipText: {
      fontSize: scale(24),
      fontWeight: 'bold',
      color: '#FFB800',
      fontFamily: Fonts.IBold || 'System',
    },
  });
};
