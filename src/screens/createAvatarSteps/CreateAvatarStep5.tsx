import { StyleSheet, View } from 'react-native';
import React, { useEffect, useState } from 'react';
import CommonCreateAvatar from '../../components/CommonCreateAvatar';
import { preloadAddStore } from '../../store/preloadAddStore';
import { BannerAdSize, NativeAd } from 'react-native-google-mobile-ads';
import { useCategoryStore } from '../../store/categoryStore';
import { useAdsStore } from '../../store/useAdsStore';
import NativeAdComponent from '../../ads/NativeAdComponent';
import { adsKeyword, adTypes } from '../../constants';
import LoadBannerAd from '../../components/ads/LoadBannerAd';
import { useIsFocused } from '@react-navigation/native';
import { customColors } from '../../utils/Colors';
import { verticalScale } from '../../utils/Scale';

const CreateAvatarStep5 = () => {
  const { getNextAd, preloadNativeAds, hasPreloadedAds } = preloadAddStore();
  const [activeNativeAd, setActiveNativeAd] = useState<NativeAd | null>(null);
  const [bannerAdUnitId, setBannerAdUnitId] = useState<string | null>(null);
  const { currentIndex: currentCategoryIndex } = useCategoryStore();
  const { remoteData, isAdsVisible } = useAdsStore.getState();
  const nativeAdsFrequency = remoteData.createAvatarNativeAdsCount;
  const isFocused = useIsFocused();
  const [isButtonDisabled, setIsButtonDisabled] = useState(true);
  const [shouldDisplayAd, setShouldDisplayAd] = useState(false);
  const [selectedAdType, setSelectedAdType] = useState<string>();
  const indexSequence = Array.from({ length: 15 }, (_, index) => index);
  const nativeAdInsertionIndexes = indexSequence.filter(
    index => index % nativeAdsFrequency === 0,
  );
  const filteredNativeAdIndexes = nativeAdInsertionIndexes.filter(
    (_, index) => index % 2 === 0,
  );

  const requestNativeAd = () => {
    const presetNativeAd = getNextAd();
    if (presetNativeAd) {
      setActiveNativeAd(presetNativeAd);
      const isAdAvailable = hasPreloadedAds();
      console.log(
        '=Native=Ad=adUnitId-1=if=isAdAvailable',
        isAdAvailable,
        presetNativeAd,
      );
      if (!isAdAvailable) {
        preloadNativeAds(1).then(() => {
          console.log('Preload the ads', currentCategoryIndex);
        });
      }
    } else {
      const adUnitId = useAdsStore.getState()?.getNextAdmobNativeId();
      if (!adUnitId) {
        console.warn('❌ No ad unit ID provided');
        return;
      }
      NativeAd.createForAdRequest(adUnitId, {
        keywords: remoteData?.adsKeyword ?? adsKeyword,
      }).then(resolvedAd => {
        setActiveNativeAd(resolvedAd);
        console.log('=Native=Ad=adUnitId-1=else', adUnitId, resolvedAd);
        const isAdAvailable = hasPreloadedAds();
        if (!isAdAvailable) {
          preloadNativeAds(1).then(() => {
            console.log('Preload the ads', currentCategoryIndex);
          });
        }
      });
    }
  };

  useEffect(() => {
    console.log(
      'come in first step...',
      currentCategoryIndex,
      isAdsVisible &&
        nativeAdsFrequency &&
        currentCategoryIndex % nativeAdsFrequency === 0,
    );
    const shouldShowAd =
      isAdsVisible &&
      nativeAdsFrequency &&
      currentCategoryIndex % nativeAdsFrequency === 0;
    setShouldDisplayAd(!!shouldShowAd);
    filteredNativeAdIndexes.includes(currentCategoryIndex);

    if (filteredNativeAdIndexes.includes(currentCategoryIndex)) {
      console.log('✅ Current index matched:', currentCategoryIndex);
      setSelectedAdType(adTypes.native);
    } else {
      setSelectedAdType(adTypes.banner);
      console.log('❌ Current index not matched:', currentCategoryIndex);
    }

    if (!isFocused) {
      setIsButtonDisabled(false);
      return;
    }

    if (!shouldShowAd) {
      setIsButtonDisabled(false);
      return;
    }

    console.log(
      'showing currentAd ===>',
      filteredNativeAdIndexes.includes(currentCategoryIndex)
        ? 'native'
        : 'banner',
    );

    setBannerAdUnitId(null);

    if (filteredNativeAdIndexes.includes(currentCategoryIndex)) {
      console.log(`→ Showing Native Ad at index ${currentCategoryIndex}`);
      setIsButtonDisabled(false);
      requestNativeAd();
    } else {
      console.log(`→ Showing Banner Ad at index ${currentCategoryIndex}`);
      const bannerIdFromList = useAdsStore.getState()?.getNextAdmobBannerId();
      setBannerAdUnitId(bannerIdFromList);
    }
  }, [isFocused, currentCategoryIndex]);

  return (
    <View style={styles.container}>
      <CommonCreateAvatar isBtnDisabled={isButtonDisabled} />
      {shouldDisplayAd && (
        <>
          {selectedAdType === adTypes.native ? (
            <NativeAdComponent
              index={currentCategoryIndex}
              nativeAd={activeNativeAd}
              type={remoteData?.native_ads_create_avatar}
            />
          ) : (
            bannerAdUnitId !== null &&
            selectedAdType === adTypes.banner && (
              <LoadBannerAd
                size={BannerAdSize.MEDIUM_RECTANGLE}
                adUnitId={bannerAdUnitId}
                isCreateAvatar
                onAdFailedToLoad={() => setIsButtonDisabled(false)}
                onAdLoaded={() => setIsButtonDisabled(false)}
                bannerAdContainerStyle={styles.bannerAdContainer}
              />
            )
          )}
        </>
      )}
    </View>
  );
};

export default CreateAvatarStep5;

const styles = StyleSheet.create({
  container: { flex: 1 },
  bannerAdContainer: {
    borderTopWidth: 0.8,
    borderColor: customColors.progressBgColor,
    paddingTop: verticalScale(10),
  },
});
