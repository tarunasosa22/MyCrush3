import remoteConfig from '@react-native-firebase/remote-config';
import { useEffect } from 'react';
import { Platform } from 'react-native';
import { useAdsStore } from '../store/useAdsStore';
import { PUBLIC_KEY_ENCRYPTION } from '../constants';
import { staticPublicKey } from '../constants';

export const useRemoteConfig = () => {
  useEffect(() => {
    fetchAndActivateRemoteConfig();
  }, []);

  const fetchAndActivateRemoteConfig = async () => {
    await remoteConfig().setConfigSettings({
      minimumFetchIntervalMillis: __DEV__ ? 10000 : 30000, //  5 mins , //10000 for  10 seconds
    });

    remoteConfig()
      .setDefaults({
        remoteData: JSON.stringify({
          adsShowType: '1',
          isAdsVisibleAndroid: true,
          isAdsVisibleIOS: true,
          admobAppId: 'ca-app-pub-8837381907644162~1858659265',
          admobBannerId: 'ca-app-pub-8837381907644162/8466791419',
          admobSplashBannerId: 'ca-app-pub-8837381907644162/8466791419',
          admobBannerIdList: [
            'ca-app-pub-8837381907644162/8466791419',
            'ca-app-pub-8837381907644162/8466791419',
            'ca-app-pub-8837381907644162/8466791419',
          ],
          admobInterstitialId: 'ca-app-pub-8837381907644162/4633441891',
          admobMyAvatar_Image: 'ca-app-pub-8837381907644162/6896886341',
          admobMyAvatar_ChatImage: 'ca-app-pub-8837381907644162/6896886341',
          admobInterstitialIdList: [
            'ca-app-pub-8837381907644162/1222512552',
            'ca-app-pub-8837381907644162/7596349215',
            'ca-app-pub-8837381907644162/1866236732',
          ],
          admobRewardedVideoId: '',
          admobAppOpenId: 'ca-app-pub-8837381907644162/5050306494',
          admobInterstitialId_IntroScreen1:
            'ca-app-pub-8837381907644162/6810268196',
          admobInterstitialId_IntroScreen2:
            'ca-app-pub-8837381907644162/9001317269',
          admobInterstitialId_BG_GFScreen:
            'ca-app-pub-8837381907644162/6172684384',
          ads_IntroScreen1: true,
          ads_IntroScreen2: true,
          ads_BG_GFScreen: true,

          admobNativeId: 'ca-app-pub-8837381907644162/2424143157',
          admobNativeId_1: 'ca-app-pub-8837381907644162/8200489105',
          admobNativeId_2: 'ca-app-pub-8837381907644162/2812431050',
          admobNativeId_3: 'ca-app-pub-8837381907644162/3243675892',
          admobNativeId_4: 'ca-app-pub-8837381907644162/1954327720',
          appId: 'ca-app-pub-8837381907644162~1858659265',

          iOSAdmobAppId: 'ca-app-pub-8837381907644162~6947252922',
          iOSAdmobBannerId: 'ca-app-pub-8837381907644162/6686805881',
          iOSAdmobBannerIdList: [
            'ca-app-pub-8837381907644162/6686805881',
            'ca-app-pub-8837381907644162/6686805881',
            'ca-app-pub-8837381907644162/6686805881',
          ],
          iOSAdmobSplashBannerId: 'ca-app-pub-8837381907644162/6686805881',
          iOSAdmobInterstitialId: 'ca-app-pub-8837381907644162/5373724214',
          iOSAdmobInterstitialId_IntroScreen1:
            'ca-app-pub-8837381907644162/5373724214',
          iOSAdmobInterstitialId_IntroScreen2:
            'ca-app-pub-8837381907644162/5373724214',
          iOSAdmobInterstitialId_BG_GFScreen:
            'ca-app-pub-8837381907644162/5373724214',
          iOSAdmobMyAvatar_Image: 'ca-app-pub-8837381907644162/1597841099',
          iOSAdmobMyAvatar_ChatImage: 'ca-app-pub-8837381907644162/1597841099',
          iOSAds_IntroScreen1: true,
          iOSAds_IntroScreen2: true,
          iOSAds_BG_GFScreen: true,
          iOSAdmobInterstitialIdList: [
            'ca-app-pub-8837381907644162/5373724214',
            'ca-app-pub-8837381907644162/5373724214',
            'ca-app-pub-8837381907644162/5373724214',
          ],
          iOSAdmobRewardedVideoId: '',
          iOSAdmobAppOpenId: 'ca-app-pub-8837381907644162/7784265138',
          iOSAdmobNativeId: 'ca-app-pub-8837381907644162/4060642543',
          iOSAdmobNativeId_1: 'ca-app-pub-8837381907644162/4060642543',
          iOSAdmobNativeId_2: 'ca-app-pub-8837381907644162/4060642543',
          iOSAdmobNativeId_3: 'ca-app-pub-8837381907644162/4060642543',
          iOSAdmobNativeId_4: 'ca-app-pub-8837381907644162/4060642543',
          iOSAppId: 'ca-app-pub-8837381907644162~6947252922', // using same android app id
          oneMonthToken: 10,
          subscriptionOnSentChatCount: 3,
          chatCountRate: 4,
          adsCount: 3,
          createAvatarAdsCount: 2,
          createAvatarNativeAdsCount: 1,
          homeNativeAdsCount: 5,
          chatBannerAdsCount: 5,
          native_ads_create_avatar: 'medium',
          native_ads_chat_list: 'small',
          native_ads_chat_screen: 'medium',
          requiredVersion: {
            ios: '4.8',
            android: '1.0.3',
          },
          // public_key_for_encryption: PUBLIC_KEY_ENCRYPTION,
          public_key_for_encryption: staticPublicKey,
          defaulMessagesList: [],
          adsKeyword: [
            'Finance',
            'Investment banking services',
            'Mortgage refinance rates',
            'Life insurance quotes',
            'Credit card for bad credit',
            'Personal loan interest rates',
            'Wealth management services',
            'Business loan',
            'Financial planning',
            'Credit repair',
            'Asset management',
          ],
        }),
      })
      .then(() => remoteConfig().fetchAndActivate())
      .then(fetchedRemotely => {
        if (fetchedRemotely) {
          parseAndStoreRemoteConfig();
        } else {
          __DEV__ && parseAndStoreRemoteConfig();
          console.log(
            'No configs were fetched from the backend, and the local configs were already activated',
          );
        }
      });
  };

  const parseAndStoreRemoteConfig = async () => {
    try {
      const fetchedRemotely = await remoteConfig().fetchAndActivate();
      console.log('Fetched remotely:', fetchedRemotely);

      const remoteConfigRawValue = remoteConfig()
        .getValue('remoteData')
        .asString();

      console.log('🔥 Remote raw value:', remoteConfigRawValue);

      if (remoteConfigRawValue) {
        const parsedConfig = JSON.parse(remoteConfigRawValue);

        console.log('✅ Parsed Remote Config:', parsedConfig);

        const isIOS = Platform.OS === 'ios';

        const adsConfig = {
          admobAppId: isIOS
            ? parsedConfig?.iOSAdmobAppId
            : parsedConfig?.admobAppId,
          admobBannerId: isIOS
            ? parsedConfig?.iOSAdmobBannerId
            : parsedConfig?.admobBannerId,
          admobSplashBannerId: isIOS
            ? parsedConfig?.iOSAdmobSplashBannerId
            : parsedConfig?.admobSplashBannerId,
          admobBannerIdList: isIOS
            ? parsedConfig?.iOSAdmobBannerIdList
            : parsedConfig?.admobBannerIdList,
          admobInterstitialId: isIOS
            ? parsedConfig?.iOSAdmobInterstitialId
            : parsedConfig?.admobInterstitialId,
          admobInterstitialIdList: isIOS
            ? parsedConfig?.iOSAdmobInterstitialIdList
            : parsedConfig?.admobInterstitialIdList,
          admobInterstitialId_BG_GFScreen: isIOS
            ? parsedConfig?.iOSAdmobInterstitialId_BG_GFScreen ?? // for ios id remaining to add in remote config
              parsedConfig?.iOSAdmobInterstitialId
            : parsedConfig.admobInterstitialId_BG_GFScreen,
          admobInterstitialId_IntroScreen1: isIOS
            ? parsedConfig?.iOSAdmobInterstitialId_IntroScreen1 ?? // for ios id remaining to add in remote config
              parsedConfig?.iOSAdmobInterstitialId
            : parsedConfig.admobInterstitialId_IntroScreen1,
          admobInterstitialId_IntroScreen2: isIOS
            ? parsedConfig?.iOSAdmobInterstitialId_IntroScreen2 ?? // for ios id remaining to add in remote config
              parsedConfig?.iOSAdmobInterstitialId
            : parsedConfig.admobInterstitialId_IntroScreen2,
          admobMyAvatar_Image: isIOS
            ? parsedConfig?.iOSAdmobMyAvatar_Image
            : parsedConfig?.admobMyAvatar_Image,
          admobMyAvatar_ChatImage: isIOS
            ? parsedConfig?.iOSAdmobMyAvatar_ChatImage
            : parsedConfig?.admobMyAvatar_ChatImage,
          ads_IntroScreen1: isIOS
            ? parsedConfig?.iOSAds_IntroScreen1
            : parsedConfig?.ads_IntroScreen1,
          ads_IntroScreen2: isIOS
            ? parsedConfig?.iOSAds_IntroScreen2
            : parsedConfig?.ads_IntroScreen2,
          ads_BG_GFScreen: isIOS
            ? parsedConfig?.iOSAds_BG_GFScreen
            : parsedConfig?.ads_BG_GFScreen,
          admobRewardedVideoId: isIOS
            ? parsedConfig?.iOSAdmobRewardedVideoId
            : parsedConfig?.admobRewardedVideoId,
          admobAppOpenId: isIOS
            ? parsedConfig?.iOSAdmobAppOpenId
            : parsedConfig?.admobAppOpenId,
          admobNativeId: isIOS
            ? parsedConfig?.iOSAdmobNativeId
            : parsedConfig?.admobNativeId,
          admobNativeId_1: isIOS
            ? parsedConfig?.iOSAdmobNativeId ?? parsedConfig?.iOSAdmobNativeId_1
            : parsedConfig?.admobNativeId_1,
          admobNativeId_2: isIOS
            ? parsedConfig?.iOSAdmobNativeId ?? parsedConfig?.iOSAdmobNativeId_2
            : parsedConfig?.admobNativeId_2,
          admobNativeId_3: isIOS
            ? parsedConfig?.iOSAdmobNativeId ?? parsedConfig?.iOSAdmobNativeId_3
            : parsedConfig?.admobNativeId_3,
          admobNativeId_4: isIOS
            ? parsedConfig?.iOSAdmobNativeId ?? parsedConfig?.iOSAdmobNativeId_4
            : parsedConfig?.admobNativeId_4,

          appId: isIOS ? parsedConfig?.iOSAppId : parsedConfig?.appId,
        };

        // Update your ads store
        useAdsStore
          .getState()
          .setAdsVisibleRemote(
            isIOS
              ? parsedConfig?.isAdsVisibleIOS
              : parsedConfig?.isAdsVisibleAndroid || false,
          );
        useAdsStore.getState().setAdsCount(parsedConfig?.adsCount || 10);
        useAdsStore
          .getState()
          .setAdmobNativeIdList([
            adsConfig.admobNativeId,
            adsConfig.admobNativeId_1,
            adsConfig.admobNativeId_2,
            adsConfig.admobNativeId_3,
            adsConfig.admobNativeId_4,
          ]);
        useAdsStore
          .getState()
          .setCreateAvatarAdsCount(parsedConfig?.createAvatarAdsCount || 2);
        useAdsStore
          .getState()
          .setCreateAvatarNativeAdsCount(
            parsedConfig?.createAvatarNativeAdsCount || 1,
          );

        useAdsStore
          .getState()
          .setchatBannerAdsCount(parsedConfig?.chatBannerAdsCount || 5);

        useAdsStore
          .getState()
          .setOneMonthToken(parsedConfig?.oneMonthToken || 250);

        useAdsStore.setState({
          remoteData: { ...parsedConfig, ...adsConfig },
        });

        console.log('adsConfig', adsConfig, parsedConfig);
      }
    } catch (error) {
      console.error('Error fetching/storing remote config:', error);
    }
  };
};
