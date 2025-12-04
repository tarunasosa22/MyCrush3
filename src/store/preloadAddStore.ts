// preloadAddStore.ts
import { create } from 'zustand';
import { NativeAd } from 'react-native-google-mobile-ads';
import { useAdsStore } from './useAdsStore';
import { adsKeyword } from '../constants';
import { createJSONStorage, persist } from 'zustand/middleware';
import { zustandStorage } from './store';

interface PreloadAdsStore {
  preloadedAds: NativeAd[];
  isPreloading: boolean;
  lastPreloadTime: number;

  // Actions
  preloadNativeAds: (count?: number) => Promise<void>;
  getNextAd: () => NativeAd | null;
  clearPreloadedAds: () => void;
  hasPreloadedAds: () => boolean;
}

export const preloadAddStore = create<PreloadAdsStore>()(
  persist(
    (set, get) => ({
      preloadedAds: [],
      isPreloading: false,
      lastPreloadTime: 0,

      preloadNativeAds: async (count = 3) => {
        const { isPreloading, preloadedAds } = get();
        const remoteData = useAdsStore.getState().remoteData;
        const getNextAdmobNativeId =
          useAdsStore.getState().getNextAdmobNativeId;

        console.log(
          'Data===>📱 Preload request - Current ads:',
          preloadedAds.length,
          'Requested:',
          count,
        );

        // Prevent duplicate preload calls
        if (isPreloading) {
          console.log('⏳ Already preloading, skipping...');
          return;
        }

        // Check if we already have enough ads
        if (preloadedAds.length >= count) {
          console.log('✅ Already have enough ads:', preloadedAds.length);
          return;
        }

        const adUnitId = getNextAdmobNativeId();
        console.log('=Native=Ad=adUnitId-1', adUnitId);

        if (!adUnitId) {
          console.warn('❌ No ad unit ID provided');
          return;
        }

        set({ isPreloading: true });

        try {
          const adsToLoad = count - preloadedAds.length;
          console.log(`🔄 Loading ${adsToLoad} new ads...`);

          const loadedAds: NativeAd[] = [];

          // Load ads sequentially to avoid race conditions
          for (let i = 0; i < adsToLoad; i++) {
            try {
              console.log(`📥 Loading ad ${i + 1}/${adsToLoad}...`);

              // Create a promise to handle the ad load
              const loadPromise = new Promise<NativeAd>((resolve, reject) => {
                // const timeout = setTimeout(() => {
                //   reject(new Error('Ad load timeout'));
                // }, 10000); // 10 second timeout

                // Create the ad - this automatically starts loading
                const ad = NativeAd.createForAdRequest(adUnitId, {
                  requestNonPersonalizedAdsOnly: true,
                  keywords: remoteData?.adsKeyword ?? adsKeyword,
                });

                // Listen for load event
                const loadListener = ad.then(res => {
                  console.log('DATA===>res', res);
                  // clearTimeout(timeout);
                  console.log(`✅ Ad ${i + 1} loaded successfully`, res, ad);
                  // loadListener(); // Remove listener
                  resolve(res);
                });

                // Listen for error event
                const errorListener = ad.catch((error: any) => {
                  // clearTimeout(timeout);
                  console.error(`❌ Ad ${i + 1} failed to load:`, error);
                  // loadListener(); // Remove listener
                  // errorListener(); // Remove error listener
                  reject(error);
                });
              });

              // Wait for the ad to load
              const ad = await loadPromise;
              loadedAds.push(ad);

              // Small delay between loading ads
              // await new Promise(resolve => setTimeout(resolve, 500));
            } catch (error) {
              console.error(`❌ Error loading ad ${i + 1}:`, error);
            }
          }

          if (loadedAds.length > 0) {
            set(state => ({
              preloadedAds: [...state.preloadedAds, ...loadedAds],
              isPreloading: false,
              lastPreloadTime: Date.now(),
            }));

            console.log(
              `✅ Successfully preloaded ${
                loadedAds.length
              } native ads. Total: ${get().preloadedAds.length}`,
            );
          } else {
            set({ isPreloading: false });
            console.warn('⚠️ No ads were loaded');
          }
        } catch (error) {
          console.error('❌ Error during ad preloading:', error);
          set({ isPreloading: false });
        }
      },

      getNextAd: () => {
        const { preloadedAds, preloadNativeAds } = get();

        console.log('🎯 Getting next ad. Available ads:', preloadedAds.length);

        if (preloadedAds.length === 0) {
          console.log('⚠️ No ads available');
          // Trigger preload for next time
          setTimeout(() => preloadNativeAds(1), 100);
          return null;
        }

        const [nextAd, ...remainingAds] = preloadedAds;
        set({ preloadedAds: remainingAds });

        console.log(
          'Data===>✅ Returning ad. Remaining ads:',
          remainingAds.length,
        );

        // Preload more ads in background if running low
        if (remainingAds.length < 2) {
          console.log('🔄 Running low on ads, preloading more...');
          setTimeout(() => preloadNativeAds(1), 100);
        }

        return nextAd;
      },

      hasPreloadedAds: () => {
        return get().preloadedAds.length > 0;
      },

      clearPreloadedAds: () => {
        const { preloadedAds } = get();

        console.log('🧹 Clearing preloaded ads:', preloadedAds.length);

        // Clean up all preloaded ads
        preloadedAds.forEach((ad, index) => {
          try {
            ad?.destroy?.();
            console.log(`✅ Destroyed ad ${index + 1}`);
          } catch (error) {
            console.error(`❌ Error destroying ad ${index + 1}:`, error);
          }
        });

        set({ preloadedAds: [], isPreloading: false });
        console.log('✅ All ads cleared');
      },
    }),
    {
      name: 'preloadads-storage',
      storage: createJSONStorage(() => zustandStorage),
    },
  ),
);
