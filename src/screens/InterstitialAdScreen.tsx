import { useEffect, useState, useRef } from 'react';
import { Platform, StatusBar, StyleSheet, Text, View } from 'react-native';
import {
  AdEventType,
  InterstitialAd,
} from 'react-native-google-mobile-ads';
import { useAdsStore } from '../store/useAdsStore';
import { userState } from '../store/userStore';
import { adsKeyword, EVENT_NAME } from '../constants';
import FastImage from 'react-native-fast-image';
import { customColors } from '../utils/Colors';
import { scale } from '../utils/Scale';
import { AppAnimations } from '../assets/animation';
import { navigationRef } from '../../App';
import { logFirebaseEvent as handleFirebaseLogEvent } from '../utils/HelperFunction';
import { RouteProp, useRoute } from '@react-navigation/native';
import { RootStackParamList } from '../types/navigation';

const InterstitialAdScreen = () => {
  const [isLoadingAd, setIsLoadingAd] = useState(true);
  const { remoteData, intro1InterstitialAd, intro2InterstitialAd } =
    useAdsStore();
  const route =
    useRoute<RouteProp<RootStackParamList, 'InterstitialAd'>>();
  const isFrom = route.params?.isFrom as string;

  // Use ref to store ad instance instead of state
  const interstitialAdRef = useRef<InterstitialAd | null>(null);
  const showTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const hasShownAdRef = useRef(false); // Prevent multiple show attempts
  // const preloadedInterstitialAd =
  //   isFrom === 'IntroScreen0'
  //     ? useAdsStore.getState().intro1InterstitialAd
  //     : isFrom === 'IntroScreen2'
  //     ? useAdsStore.getState().intro2InterstitialAd
  //     : isFrom === 'Onboarding'
  //     ? useAdsStore.getState().gf_bfInterstitialAd
  //     : undefined;

  useEffect(() => {
    const AD_UNIT_ID =
      isFrom === 'IntroScreen0'
        ? useAdsStore.getState().remoteData?.admobInterstitialId_IntroScreen1
        : isFrom === 'IntroScreen2'
        ? useAdsStore.getState().remoteData?.admobInterstitialId_IntroScreen2
        : isFrom === 'Onboarding'
        ? useAdsStore.getState().remoteData?.admobInterstitialId_BG_GFScreen
        : useAdsStore.getState()?.getNextAdmobInterstitialId();
    console.log(
      'Interstitial-AD_UNIT_ID',
      'intro1:',
      useAdsStore.getState().remoteData?.admobInterstitialId_IntroScreen1,
      'intro2:',
      useAdsStore.getState().remoteData?.admobInterstitialId_IntroScreen2,
      'Onboarding:',
      useAdsStore.getState().remoteData?.admobInterstitialId_BG_GFScreen,
      isFrom,
      AD_UNIT_ID,
    );

    if (!AD_UNIT_ID) {
      console.log('❌ No AD_UNIT_ID available');
      userState.getState().setSplashState(false);
      userState.getState().setIsAdClosed(true);
      navigationRef?.current?.goBack();
      return;
    }

    const ad = InterstitialAd.createForAdRequest(AD_UNIT_ID, {
      keywords: remoteData?.adsKeyword ?? adsKeyword,
    });

    // Store ad instance in ref immediately
    interstitialAdRef.current = ad;
    // setIsLoadingAd(preloadedInterstitialAd ? false : true);

    const unsubscribeLoaded = ad.addAdEventListener(AdEventType.LOADED, () => {
      console.log('✅ Interstitial Ad Loaded');
      setIsLoadingAd(false);

      // Show ad immediately after load using the ad instance directly
      if (!hasShownAdRef.current && interstitialAdRef.current) {
        hasShownAdRef.current = true;

        showTimeoutRef.current = setTimeout(() => {
          interstitialAdRef.current
            ?.show()
            .then(() => {
              console.log('✅ Interstitial ad displayed successfully');
            })
            .catch(error => {
              handleFirebaseLogEvent(EVENT_NAME.INTERSTITIAL_AD_ERROR, {
                error: error,
              });
              console.log('❌ Error showing interstitial ad:', error);
              userState.getState().setSplashState(false);
              userState.getState().setIsAdClosed(true);
              navigationRef?.current?.goBack();
            });
        }, 500);
      }
    });

    const unsubscribeError = ad.addAdEventListener(AdEventType.ERROR, error => {
      handleFirebaseLogEvent(EVENT_NAME.INTERSTITIAL_AD_ERROR, {
        error: error,
      });
      console.log('❌ Interstitial Ad Error:', error);
      setIsLoadingAd(false);
      userState.getState().setSplashState(false);
      userState.getState().setIsAdClosed(true);
      navigationRef?.current?.goBack();
    });

    const unsubscribeOpened = ad.addAdEventListener(AdEventType.OPENED, () => {
      console.log('📱 Interstitial Ad Opened');
      if (Platform.OS === 'ios') StatusBar.setHidden(true);
    });

    const unsubscribeClosed = ad.addAdEventListener(AdEventType.CLOSED, () => {
      console.log('🔒 Interstitial Ad Closed');
      userState.getState().setSplashState(true);
      userState.getState().setIsAdClosed(true);
      if (Platform.OS === 'ios') StatusBar.setHidden(false);
      navigationRef?.current?.goBack();
    });

    const unsubscribePaid = ad.addAdEventListener(
      AdEventType.PAID,
      (adValue: { currency: string; precision: number; value: number }) => {
        console.log('🔥 Interstitial ad impression', adValue);
        const revenue = adValue.value;

        const params = {
          currency: adValue.currency,
          value: revenue,
          formatted_revenue: revenue.toFixed(8),
          precision: adValue.precision,
          ad_unit_id: AD_UNIT_ID,
          type: EVENT_NAME.INTERSTITIAL_AD_IMPRESSION,
        };

        handleFirebaseLogEvent(EVENT_NAME.AD_IMPRESSION, params);
        console.log('🔥 Sent ad revenue to Firebase Interstitial:', adValue);
      },
    );

    setIsLoadingAd(true);
    ad.load();

    return () => {
      unsubscribeLoaded();
      unsubscribeError();
      unsubscribeOpened();
      unsubscribeClosed();
      unsubscribePaid();

      if (showTimeoutRef.current) {
        clearTimeout(showTimeoutRef.current);
      }

      // Clean up ad instance
      interstitialAdRef.current = null;
      hasShownAdRef.current = false;
    };
  }, [remoteData?.adsKeyword]);

  return (
    <>
      {isLoadingAd && (
        <View style={styles.loadingContainer}>
          <FastImage
            source={AppAnimations.loaderad_gif}
            style={styles.loaderImage}
          />
          <Text style={styles.loadingText}>Loading Ad...</Text>
        </View>
      )}
    </>
  );
};

export default InterstitialAdScreen;

const styles = StyleSheet.create({
  loadingContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'white',
    zIndex: 1000,
  },
  loaderImage: {
    width: 100,
    height: 100,
  },
  loadingText: {
    color: customColors.black,
    fontSize: scale(15),
    marginTop: 10,
  },
});
