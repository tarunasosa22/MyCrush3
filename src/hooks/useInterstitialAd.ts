import { useEffect, useState } from 'react';
import { Platform, StatusBar } from 'react-native';
import { AdEventType, InterstitialAd } from 'react-native-google-mobile-ads';
import { useAdsStore } from '../store/useAdsStore';
import { AdsKeyword } from '../constant';
import { userState } from '../store/useUserStore';

export const useInterstitialAd = () => {
  const [interstitial, setInterstitial] = useState<InterstitialAd | null>(null);
  const [isInterstitialLoading, setIsInterstitialLoading] = useState(false);
  const { remoteData } = useAdsStore();

  const interstitialAdUnitId = remoteData?.admobInterstitialId;

  useEffect(() => {
    if (!interstitialAdUnitId) return;

    const ad = InterstitialAd.createForAdRequest(interstitialAdUnitId, {
      keywords: remoteData?.adsKeyword ?? AdsKeyword,
    });
    setInterstitial(ad);

    const unsubscribeLoaded = ad.addAdEventListener(AdEventType.LOADED, () => {
      console.log('Interstitial Ad Loaded');
    });

    const unsubscribeOpened = ad.addAdEventListener(AdEventType.OPENED, () => {
      if (Platform.OS === 'ios') StatusBar.setHidden(true);
    });

    const unsubscribeClosed = ad.addAdEventListener(AdEventType.CLOSED, () => {
      userState.getState().setSplashState(true);
      userState.getState().setIsAdClosed(true);
      if (Platform.OS === 'ios') StatusBar.setHidden(false);
    });

    ad.load();

    return () => {
      unsubscribeLoaded();
      unsubscribeOpened();
      unsubscribeClosed();
    };
  }, [interstitialAdUnitId]);

  const showInterstitialAd = () => {
    if (isInterstitialLoading) return;
    setIsInterstitialLoading(true);

    setTimeout(() => {
      if (interstitial?.loaded) {
        setIsInterstitialLoading(false);
        interstitial
          .show()
          .then(() => {
            setIsInterstitialLoading(false);
            console.log('Interstitial ad displayed.');
          })
          .finally(() => {
            setIsInterstitialLoading(false);
            console.log('Interstitial ad closed at:', Date.now());
          });
      } else {
        setIsInterstitialLoading(false);
      }
    }, 2000);
    console.log('Ad loaded:', Date.now(), interstitial?.loaded);
  };

  return {
    isInterstitialLoading,
    setIsInterstitialLoading,
    showInterstitialAd,
  };
};
