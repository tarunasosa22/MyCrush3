// src/store/useThemeStore.ts
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { zustandStorage } from './store';
import { PUBLIC_KEY_ENCRYPTION } from '../constants';
import { staticPublicKey } from '../constants';
import { Platform } from 'react-native';

export const native_ad_layout_type = {
  small: 'small',
  medium: 'medium',
  large: 'large',
};

interface FirebaseRemoteAdsConfig {
  adsShowType: string;
  admobAppId: string;
  admobBannerId: string;
  admobSplashBannerId: string;
  admobBannerIdList: string[]; // ✅ new state
  admobInterstitialId: string;
  admobMyAvatar_Image: string;
  admobMyAvatar_ChatImage: string;
  admobInterstitialIdList: string[]; // ✅ new state
  admobRewardedVideoId: string;
  admobAppOpenId: string;
  admobInterstitialId_IntroScreen1: string;
  admobInterstitialId_IntroScreen2: string;
  admobInterstitialId_BG_GFScreen: string;
  ads_IntroScreen1: boolean;
  ads_IntroScreen2: boolean;
  ads_BG_GFScreen: boolean;
  admobNativeId: string;
  admobNativeId_1: string;
  admobNativeId_2: string;
  admobNativeId_3: string;
  admobNativeId_4: string;
  appId: string;
  subscriptionOnSentChatCount: number;
  chatCountRate: number;
  adsCount: number;
  createAvatarAdsCount: number;
  createAvatarNativeAdsCount: number;
  homeNativeAdsCount: number;
  chatBannerAdsCount: number;
  freeCharLimit: number;
  paidCharLimit: number;
  freeAudioTimeLimit: number;
  paidAudioTimeLimit: number;
  requiredVersion: {
    ios: string;
    android: string;
  };
  publicKeyForEncryption: string;
  defaultMessagesList: string[];
  adsKeyword: string[];
  native_ads_create_avatar: string;
  native_ads_chat_list: string;
  native_ads_chat_screen: string;
}

interface AdsStoreState {
  isAdsVisible: boolean;
  isAdsVisibleRemote: boolean;
  remoteData: FirebaseRemoteAdsConfig;
  adsCount: number;
  createAvatarAdsCount: number;
  createAvatarNativeAdsCount: number;
  homeNativeAdsCount: number;
  chatBannerAdsCount: number;
  oneMonthToken: number; // ✅ new state
  encryptedKey: string | null;
  videoGeneratedCount: number;
  isVideoAdVisible: boolean;
  navigationCount: number;
  admobNativeIdList: string[];
  admobNativeIndex: number;
  admobInterstitialIndex: number; // ✅ new state
  admobBannerIndex: number; // ✅ new state
  intro1InterstitialAd: any;
  intro2InterstitialAd: any;
  gf_bfInterstitialAd: any;
  setRemoteData: (config: FirebaseRemoteAdsConfig) => void;
  setAdsVisible: (visible: boolean) => void;
  setAdsVisibleRemote: (visible: boolean) => void;
  setAdsCount: (count: number) => void;
  setCreateAvatarAdsCount: (count: number) => void;
  setCreateAvatarNativeAdsCount: (count: number) => void;
  setchatBannerAdsCount: (count: number) => void;
  setOneMonthToken: (count: number) => void; // ✅ new setter
  incrementNavigationCount: () => void;
  setNavigationCount: (count: number) => void;
  setVideoGeneratedCount: (count: number) => void;
  setVideoAdVisibility: (visible: boolean) => void;
  setEncryptedKey: (key: string) => void;
  setAdmobNativeIdList: (list: string[]) => void;
  getNextAdmobNativeId: () => string | null;
  getNextAdmobInterstitialId: () => string | null;
  getNextAdmobBannerId: () => string | null; // ✅ new method
  setIntro1InterstitialAd: (intro1InterstitialAd: any) => any;
  setIntro2InterstitialAd: (intro2InterstitialAd: any) => any;
  setGF_BFInterstitialAd: (gf_bfInterstitialAd: any) => any;
}

export const useAdsStore = create<AdsStoreState>()(
  persist(
    (set, get) => ({
      remoteData: {
        adsShowType: '0',
        admobAppId:
          Platform.OS === 'android'
            ? 'ca-app-pub-8837381907644162~1858659265'
            : 'ca-app-pub-8837381907644162~6947252922',
        admobBannerId:
          Platform.OS === 'android'
            ? 'ca-app-pub-8837381907644162/8466791419'
            : 'ca-app-pub-8837381907644162/6686805881',
        admobSplashBannerId:
          Platform.OS === 'android'
            ? 'ca-app-pub-8837381907644162/7659998209'
            : 'ca-app-pub-8837381907644162/6686805881',
        admobBannerIdList:
          Platform.OS === 'android'
            ? [
                'ca-app-pub-8837381907644162/7298596629',
                'ca-app-pub-8837381907644162/4093848784',
                'ca-app-pub-8837381907644162/5793943260',
              ]
            : [
                'ca-app-pub-8837381907644162/6686805881',
                'ca-app-pub-8837381907644162/6686805881',
                'ca-app-pub-8837381907644162/6686805881',
              ],
        admobInterstitialId:
          Platform.OS === 'android'
            ? 'ca-app-pub-8837381907644162/4633441891'
            : 'ca-app-pub-8837381907644162/5373724214',
        admobMyAvatar_Image:
          Platform.OS === 'android'
            ? 'ca-app-pub-8837381907644162/6896886341'
            : 'ca-app-pub-8837381907644162/1597841099',
        admobMyAvatar_ChatImage:
          Platform.OS === 'android'
            ? 'ca-app-pub-8837381907644162/6896886341'
            : 'ca-app-pub-8837381907644162/1597841099',
        admobRewardedVideoId: Platform.OS === 'android' ? '' : '',
        admobAppOpenId:
          Platform.OS === 'android'
            ? 'ca-app-pub-8837381907644162/5050306494'
            : 'ca-app-pub-8837381907644162/7784265138',
        admobInterstitialId_IntroScreen1:
          Platform.OS === 'android'
            ? 'ca-app-pub-8837381907644162/6810268196'
            : 'ca-app-pub-8837381907644162/5373724214', //  for ios id remaining to add in remote config
        admobInterstitialId_IntroScreen2:
          Platform.OS === 'android'
            ? 'ca-app-pub-8837381907644162/9001317269'
            : 'ca-app-pub-8837381907644162/5373724214', //  for ios id remaining to add in remote config
        admobInterstitialId_BG_GFScreen:
          Platform.OS === 'android'
            ? 'ca-app-pub-8837381907644162/6172684384'
            : 'ca-app-pub-8837381907644162/5373724214', //  for ios id remaining to add in remote config
        ads_IntroScreen1: true,
        ads_IntroScreen2: true,
        ads_BG_GFScreen: true,
        admobNativeId:
          Platform.OS === 'android'
            ? 'ca-app-pub-8837381907644162/2424143157'
            : 'ca-app-pub-8837381907644162/4060642543',
        admobNativeId_1: 'ca-app-pub-8837381907644162/8200489105',
        admobNativeId_2: 'ca-app-pub-8837381907644162/2812431050',
        admobNativeId_3: 'ca-app-pub-8837381907644162/3243675892',
        admobNativeId_4: 'ca-app-pub-8837381907644162/1954327720',
        appId:
          Platform.OS === 'android'
            ? 'ca-app-pub-8837381907644162~1858659265'
            : 'ca-app-pub-8837381907644162~6947252922',
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
        admobInterstitialIdList:
          Platform.OS === 'android'
            ? [
                'ca-app-pub-8837381907644162/1222512552',
                'ca-app-pub-8837381907644162/7596349215',
                'ca-app-pub-8837381907644162/1866236732',
              ]
            : [
                'ca-app-pub-8837381907644162/5373724214',
                'ca-app-pub-8837381907644162/5373724214',
                'ca-app-pub-8837381907644162/5373724214',
              ],
        adsCount: 10,
        createAvatarAdsCount: 2,
        createAvatarNativeAdsCount: 1,
        chatBannerAdsCount: 5,
        freeCharLimit: 50,
        paidCharLimit: 250,
        freeAudioTimeLimit: 10,
        paidAudioTimeLimit: 30,
        homeNativeAdsCount: 5,

        defaultMessagesList: [],
        subscriptionOnSentChatCount: 3,
        chatCountRate: 4,
        requiredVersion: {
          ios: '4.8',
          android: '1.0.3',
        },
        native_ads_create_avatar: 'medium',
        native_ads_chat_list: 'small',
        native_ads_chat_screen: 'medium',
        // publicKeyForEncryption: PUBLIC_KEY_ENCRYPTION,
        publicKeyForEncryption: staticPublicKey,
      },
      intro1InterstitialAd: null,
      intro2InterstitialAd: null,
      gf_bfInterstitialAd: null,
      isAdsVisible: true,
      isAdsVisibleRemote: true,
      adsCount: 10,
      createAvatarAdsCount: 2,
      createAvatarNativeAdsCount: 1,
      chatBannerAdsCount: 5,
      oneMonthToken: 250, // ✅ default value
      navigationCount: 0,
      videoGeneratedCount: 0,
      isVideoAdVisible: false,
      homeNativeAdsCount: 5,
      encryptedKey: null,
      admobNativeIndex: 0,
      admobInterstitialIndex: 0,
      admobBannerIndex: 0,
      admobNativeIdList:
        Platform.OS === 'android'
          ? [
              'ca-app-pub-8837381907644162/2424143157',
              'ca-app-pub-8837381907644162/8200489105',
              'ca-app-pub-8837381907644162/2812431050',
              'ca-app-pub-8837381907644162/3243675892',
              'ca-app-pub-8837381907644162/1954327720',
            ]
          : ['ca-app-pub-8837381907644162/4060642543'],

      setRemoteData: config => set({ remoteData: config }),
      setAdsVisible: visible => set({ isAdsVisible: visible }),
      setAdsVisibleRemote: visible => set({ isAdsVisibleRemote: visible }),
      setAdsCount: count => set({ adsCount: count }),
      setCreateAvatarAdsCount: count => set({ createAvatarAdsCount: count }),
      setCreateAvatarNativeAdsCount: count => ({
        createAvatarNativeAdsCount: count,
      }),
      setchatBannerAdsCount: count => set({ chatBannerAdsCount: count }),
      setOneMonthToken: count => set({ oneMonthToken: count }), // ✅ setter
      setVideoGeneratedCount: count => set({ videoGeneratedCount: count }),
      setVideoAdVisibility: visible => set({ isVideoAdVisible: visible }),
      getNextAdmobNativeId: () => {
        const { admobNativeIdList, admobNativeIndex } = get();
        const ids =
          admobNativeIdList?.filter(id => id && id.trim().length > 0) || [];
        // console.log('=Native=Ad=Ids-', ids);
        // console.log('=Native=Ad=admobNativeIndex-', admobNativeIndex);

        if (ids.length === 0) return null;

        // ✅ get current ID
        const currentId = ids[admobNativeIndex % ids.length];

        // ✅ update index for next time (looping)
        set({ admobNativeIndex: (admobNativeIndex + 1) % ids.length });

        return currentId;
      },
      getNextAdmobInterstitialId: () => {
        const { remoteData, admobInterstitialIndex } = get();

        const ids =
          remoteData.admobInterstitialIdList?.filter(
            id => id && id.trim().length > 0,
          ) || [];

        console.log(
          '=Interstitial=Ad=admobInterstitialIndex-',
          admobInterstitialIndex,
        );

        // ✅ if no valid IDs
        if (ids.length === 0) return null;

        // ✅ ensure index is always within bounds
        const safeIndex =
          admobInterstitialIndex >= 0 && admobInterstitialIndex < ids.length
            ? admobInterstitialIndex
            : 0;

        // ✅ get current ID
        const currentId = ids[safeIndex];

        // ✅ update index for next time (looping)
        set({
          admobInterstitialIndex: (safeIndex + 1) % ids.length,
        });

        return currentId;
      },
      getNextAdmobBannerId: () => {
        const { remoteData, admobBannerIndex } = get();

        const ids =
          remoteData.admobBannerIdList?.filter(
            id => id && id.trim().length > 0,
          ) || [];

        console.log('=Banner=Ad=admobBannerIndex-', admobBannerIndex);

        // ✅ if no valid IDs
        if (ids.length === 0) return null;

        // ✅ ensure index is always within bounds
        const safeIndex =
          admobBannerIndex >= 0 && admobBannerIndex < ids.length
            ? admobBannerIndex
            : 0;

        // ✅ get current ID
        const currentId = ids[safeIndex];

        // ✅ update index for next time (looping)
        set({
          admobBannerIndex: (safeIndex + 1) % ids.length,
        });

        return currentId;
      },

      incrementNavigationCount: () => {
        const current = get().navigationCount;
        set({ navigationCount: current + 1 });
      },
      setNavigationCount: count => {
        set({ navigationCount: Math.max(count, -1) });
      },
      setEncryptedKey: key => {
        set({ encryptedKey: key });
      },
      setAdmobNativeIdList: (list: string[]) => {
        console.log('setAdmobNativeIdList', list);
        const validList = list.filter(id => id && id.trim().length > 0);
        if (validList.length === 0) return; // ❌ skip if all empty/null
        set({ admobNativeIdList: validList });
      },
      setIntro1InterstitialAd: (ad: any) => {
        set({
          intro1InterstitialAd: ad,
        });
      },
      setIntro2InterstitialAd: (ad: any) => {
        set({
          intro2InterstitialAd: ad,
        });
      },
      setGF_BFInterstitialAd: (ad: any) => {
        set({
          gf_bfInterstitialAd: ad,
        });
      },
    }),
    {
      name: 'ads-storage',
      storage: createJSONStorage(() => zustandStorage),
    },
  ),
);
