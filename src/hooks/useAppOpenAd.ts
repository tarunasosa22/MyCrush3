import MobileAds, {
  AdEventType,
  AppOpenAd,
} from 'react-native-google-mobile-ads';
import { useAdsStore } from '../store/useAdsStore';
import { adsKeyword, EVENT_NAME } from '../constants';
import { logFirebaseEvent } from '../utils/HelperFunction';

const useAppOpenAd = () => {
  const { isAdsVisible, remoteData } = useAdsStore();

  const showAppOpenAd = async (
    onAdClosed: () => void,
    onAdFailed?: () => void,
  ) => {
    if (!isAdsVisible) {
      console.log('Ads not visible or user not logged in');
      onAdFailed?.();
      return;
    }

    try {
      // await MobileAds().initialize();
      if (remoteData?.admobAppOpenId) {
        console.log('showAppOpenAd...', remoteData?.adsKeyword, remoteData?.admobAppOpenId);
        const ad = AppOpenAd.createForAdRequest(remoteData?.admobAppOpenId, {
          keywords: remoteData?.adsKeyword ?? adsKeyword,
        });

        ad.addAdEventListener(AdEventType.LOADED, () => {
          console.log('App open ad loaded successfully');
          ad.show();
        });

        ad.addAdEventListener(AdEventType.CLOSED, () => {
          console.log('App open ad closed');
          onAdClosed();
        });

        ad.addAdEventListener(AdEventType.ERROR, error => {
          console.error('App open ad failed to load:', error);
          onAdFailed?.();
        });

        ad.addAdEventListener(
          AdEventType.PAID,
          (adValue: any) => {
            if (!adValue) return;
            console.log('🔥 app open ad impression', adValue);
            const revenue = adValue.value;

            const params = {
              currency: adValue.currency,
              value: revenue,
              formatted_revenue: revenue.toFixed(8),
              precision: adValue.precision,
              ad_unit_id: remoteData.admobAppOpenId,
              type: EVENT_NAME.APP_OPEN_AD_IMPRESSION,
            };

            // Log to Firebase
            logFirebaseEvent(EVENT_NAME.AD_IMPRESSION, params);
            // handleFirebaseLogEvent('gaz_ad_impression', params);

            console.log('🔥 Sent ad revenue to Firebase app open ad:', adValue);
          },
        );

        ad.load();
      }
    } catch (err) {
      console.error('Failed to load App Open Ad:', err);
      onAdFailed?.();
    }
  };

  return { showAppOpenAd };
};

export default useAppOpenAd;
