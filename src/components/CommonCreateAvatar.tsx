import {
  ActivityIndicator,
  Animated,
  BackHandler,
  Image,
  ImageBackground,
  Platform,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import React, { useEffect, useRef, useState } from 'react';
import { useThemeStore } from '../store/themeStore';
import { moderateScale, scale, verticalScale } from '../utils/Scale';
import CustomHeader from '../components/headers/CustomHeader';
import { customColors } from '../utils/Colors';
import { useCategoryStore } from '../store/categoryStore';
import { FlatList } from 'react-native';
import { EVENT_NAME, SCREEN_WIDTH } from '../constants';
import Fonts from '../utils/fonts';
import CustomCategoryAvatarCard from './CustomCategoryAvatarItemCard';
import CustomInput from '../components/inputs/CustomInput';
import { userState } from '../store/userStore';
import { navigationRef } from '../../App';
import {
  avatarcreate,
  setEventTrackinig,
  updateAvatarCreate,
} from '../api/user';
import { useIsFocused, useNavigation } from '@react-navigation/native';
import IMAGES from '../assets/images';
import Sound from 'react-native-sound';
import { logFirebaseEvent } from '../utils/HelperFunction';
// import { useInterstitialAd } from '../hooks/useInterstitialAd';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useChatStore } from '../store/chatListStore';
import { getToday } from '../navigation/Appnavigation';
import { useAdsStore } from '../store/useAdsStore';
import NativeAdComponent from '../ads/NativeAdComponent';
import CustomConfirmationModal from './CustomConfirmModal';
import AppConstant from '../utils/AppConstant';
import CommonPrimaryButton from './buttons/CommonPrimaryButton';
import CustomActivityIndicator from './CustomActivityIndicator';
import SubscriptionPopup from './SubscriptionPopup';
import UpgradeCreditPopup from './UpgradeCreditPopup';

const CommonCreateAvatar = ({ isBtnDisabled }: { isBtnDisabled?: boolean }) => {
  const styles = AvatarStyles();
  const theme = useThemeStore().theme;
  const navigation = useNavigation<any>();
  const progressAnim = useRef(new Animated.Value(0)).current;
  const soundRef = useRef(null);
  const { setTheme } = useThemeStore();
  const { currentIndex, setCurrentIndex } = useCategoryStore();
  const {
    userData,
    timeOfPopup,
    setUserData,
    setIsOpenPlan,
    setSentChatCount,
    createdAvatar,
    setCreatedAvatar,
    isFailedCreateAvatar,
    setIsFailedCreateAvatar,
  } = userState();
  const {
    categories,
    summeryList,
    setSummeryList,
    setNormalizeList,
    normalizeList,
    avatarErrMessage,
    setAvatarErrMessage,
    avatarName,
    setAvatarName,
  } = useCategoryStore();
  const [avatarNameError, setAvatarNameError] = useState<string>('');
  const [avatarIsLoading, setAvatarIsLoading] = useState(false);
  const [avatarIsOpen, setAvatarIsOpen] = useState(false);
  const focus = useIsFocused();
  const [avatarCurrentAudio, setAvatarCurrentAudio] = useState<string | null>(
    null,
  );
  const [avatarIsPlaying, setAvatarIsPlaying] = useState(false);
  // const { showNavigationInterstitial, isLoadingAd: isLoadingAdInterstitial } =
  //   useInterstitialAd();
  const { remoteData, navigationCount, adsCount } = useAdsStore();
  const createAvatarAdsCount = remoteData.createAvatarAdsCount;
  const createAvatarNativeAdsCount = remoteData.createAvatarNativeAdsCount;
  const insets = useSafeAreaInsets();
  const [avatarShowPurchaseModal, setAvatarShowPurchaseModal] = useState(false);

  useEffect(() => {
    const backAction = () => {
      avatarOnBack();
      return true;
    };

    const backHandler = BackHandler.addEventListener(
      'hardwareBackPress',
      backAction,
    );

    return () => backHandler.remove();
  }, []);

  const isDisabledPress =
    (currentIndex === normalizeList.length - 1
      ? false
      : normalizeList[currentIndex]?.sub_categories?.find(
          (item: any) => item.isSelected,
        )
      ? false
      : true) ||
    avatarIsLoading ||
    isBtnDisabled;

  // Function to reset all selections
  const avatarResetSelections = () => {
    // console.log('call avatarResetSelections <<<<<<');
    const resetCategories = categories?.map(category => ({
      ...category,
      sub_categories: category?.sub_categories?.map(sub => ({
        ...sub,
        isSelected: false,
      })),
    }));

    const resetNormalizeList = [
      ...resetCategories,
      {
        id: -1,
        label: 'Summary',
        sub_categories: [],
        image: '',
        input_type: '',
        is_required: false,
        sort_order: 0,
      },
    ];

    setNormalizeList(resetNormalizeList);
    setSummeryList([]);
    setCurrentIndex(0);
    setAvatarName('');
    setAvatarNameError('');
    setIsFailedCreateAvatar(false); // reset flag when starting new avatar creation
    setAvatarErrMessage('');
    setCreatedAvatar(null);
  };

  useEffect(() => {
    if (focus) {
      if (currentIndex === 0) {
        avatarResetSelections();
      }
    }
  }, [focus, currentIndex]);

  const avatarStopCurrentAudio = () => {
    if (soundRef.current) {
      soundRef.current.stop(() => {
        soundRef.current?.release();
        soundRef.current = null;
        setAvatarIsPlaying(false);
        setAvatarCurrentAudio(null);
      });
    }
  };

  const avatarPlayAudio = (url: string) => {
    if (!url) return;

    // ✅ If same audio is playing → pause
    if (avatarCurrentAudio === url && avatarIsPlaying) {
      soundRef.current?.pause();
      setAvatarIsPlaying(false);
      return;
    }

    // ✅ If same audio is paused → resume
    if (avatarCurrentAudio === url && !avatarIsPlaying) {
      soundRef.current?.play(success => {
        avatarOnAudioFinish(success, url);
      });
      setAvatarIsPlaying(true);
      return;
    }

    // ✅ If different audio is playing → stop it before new one
    if (soundRef.current) {
      soundRef.current.stop(() => {
        soundRef.current?.release();
        soundRef.current = null;
        avatarStartNewSound(url);
      });
    } else {
      avatarStartNewSound(url);
    }
  };

  const avatarStartNewSound = (url: string) => {
    const sound = new Sound(url, null, error => {
      if (error) {
        console.log('❌ Failed to load sound', error);
        return;
      }

      soundRef.current = sound;
      setAvatarCurrentAudio(url);
      setAvatarIsPlaying(true);

      sound.play(success => {
        avatarOnAudioFinish(success, url);
      });
    });
  };

  const avatarOnAudioFinish = (success: boolean, url: string) => {
    if (success) {
      console.log('✅ Finished playing:', url);
    } else {
      console.log('❌ Playback failed');
    }
    setAvatarIsPlaying(false);
    setAvatarCurrentAudio(null);
    soundRef.current?.release();
    soundRef.current = null;
  };

  useEffect(() => {
    Sound.setCategory('Playback'); // allow background playback

    return () => {
      if (soundRef.current) {
        soundRef.current.release();
        soundRef.current = null;
      }
    };
  }, []);

  const avatarRenderSubcategory = ({ item }: any) => {
    const isSelected = item.isSelected || false;

    if (item.isEmpty) {
      return <View style={styles.avatarEmptyCard} />;
    }

    return (
      <CustomCategoryAvatarCard
        item={item}
        totalItems={
          CategoryItem?.label === 'Summary'
            ? summeryList?.length
            : subcategories?.length
        }
        isSelected={isSelected}
        imagePreloaded={false}
        onAudioPress={() => {
          if (item?.audio) {
            avatarPlayAudio(item?.audio);
          }
        }}
        isAudioPlaying={avatarCurrentAudio === item?.audio && avatarIsPlaying}
        onPress={() => {
          if (currentIndex < normalizeList.length - 1) {
            let avatarList = [...normalizeList];
            let summary: any = [...summeryList];

            // Update selections for current category
            avatarList[currentIndex]?.sub_categories.forEach((Subitem: any) => {
              if (Subitem.id === item.id) {
                // Select this item
                const exists = summary.some((s: any) => s.id === Subitem.id);
                if (!exists) {
                  summary.push({
                    ...Subitem,
                    category_label: normalizeList[currentIndex]?.label,
                  });
                }
                Subitem.isSelected = true;
              } else {
                // Deselect other items in this category
                Subitem.isSelected = false;
                summary = summary.filter((item: any) => item.id !== Subitem.id);
              }
            });

            setNormalizeList(avatarList);
            setSummeryList(summary);
          }
        }}
      />
    );
  };

  // Helper function to find the last required category index
  const getLastRequiredCategoryIndex = () => {
    // Exclude the Summary item (last item) from the search
    const categoriesWithoutSummary = normalizeList.slice(0, -1);
    let lastRequiredIndex = -1;

    for (let i = categoriesWithoutSummary.length - 1; i >= 0; i--) {
      if (categoriesWithoutSummary[i]?.is_required === true) {
        lastRequiredIndex = i;
        break;
      }
    }

    return lastRequiredIndex;
  };

  // Function to call when on the last required category
  const onGenerateAvatar = async (createOnFinish?: boolean) => {
    console.log('first avatar2', createOnFinish, avatarName);

    const payload = {
      persona_type_id: useCategoryStore.getState().personaId,
      name: avatarName || 'My Avatar',
      sub_categories: Object.values(summeryList),
    };
    await avatarcreate(payload)
      .then(res => {
        const createdAvatarData = res?.data?.data;
        if (createdAvatarData) {
          setCreatedAvatar(createdAvatarData);
          setIsFailedCreateAvatar(false);
          if (createOnFinish) {
            avatarHandleFinish(createdAvatarData);
          }
          return createdAvatarData;
        } else {
          setIsFailedCreateAvatar(true);
          return null;
        }
      })
      .catch(err => {
        console.log('avatarcreate error........', err);
        setAvatarErrMessage(err?.response?.data?.message);
        setIsFailedCreateAvatar(true);
        return null;
      });
  };

  const avatarOnNext = async () => {
    avatarStopCurrentAudio();

    // STEP 1 — Validate name on first screen
    if (currentIndex === 0) {
      if (!avatarName.trim()) {
        const friendType =
          useThemeStore.getState().themeName === 'girlfriend' ? 'Girl' : 'Boy';

        setAvatarNameError(`Please Enter ${friendType} Friend's Name`);
        return;
      }
      setAvatarNameError('');
    }

    // STEP 2 — Determine last required screen
    const lastRequiredIndex = getLastRequiredCategoryIndex();

    // STEP 3 — If it's last required category or if previous attempt failed, submit
    if (
      !createdAvatar &&
      (currentIndex === lastRequiredIndex || isFailedCreateAvatar)
    ) {
      console.log('first avatar', avatarName);
      await onGenerateAvatar();
    }

    // STEP 4 — Calculate next index
    const newIndex = currentIndex + 1;
    const totalScreens = normalizeList.length - 1;

    if (currentIndex < totalScreens) {
      setCurrentIndex(newIndex);

      // Safe navigation
      navigation.navigate(`CreateAvatarStep${newIndex}`);

      // Firebase event logging
      const eventName = `create_avatar_step_${newIndex}`;
      logFirebaseEvent(eventName, {
        user_id: userData?.user?.id,
      });

      setEventTrackinig({ event_type: eventName });
    }

    // STEP 5 — Show interstitial ad after every X pages
    const shouldShowAd =
      newIndex !== 0 &&
      newIndex % createAvatarAdsCount === 0 &&
      Number(userData?.user?.tokens) <= 0;

    if (shouldShowAd) {
      console.log('call first ad....');
      navigationRef?.current?.navigate('InterstitialAd');
    }
  };

  const avatarOnBack = () => {
    avatarStopCurrentAudio();
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
    }
    navigation.goBack();
  };

  //finish button pressed
  const avatarHandleFinish = async (createdAvatarData?: any) => {
    useChatStore.getState().setIsChatListUpdated(true); // for chatList update
    setAvatarShowPurchaseModal(false);

    setAvatarIsLoading(false);
    setTheme('girlfriend');
    setUserData({ ...userData, avatar: createdAvatarData ?? createdAvatar });

    const today = getToday();
    if (userData.access_token) {
      useChatStore.getState().setChatCountRate({
        id: useChatStore.getState()?.chatCountRate.length + 1,
      });
    }

    if (
      userData.access_token &&
      userData.user?.total_tokens == 0 &&
      (timeOfPopup == null || timeOfPopup !== today)
    ) {
      setSentChatCount({ id: 0 });
    }

    const navigationParams = {
      id:
        createdAvatarData?.id ??
        createdAvatarData?.avatar?.id ??
        createdAvatar?.id,
      isMyAvatar: true,
      item: createdAvatarData ?? createdAvatar,
    };

    navigationRef.current?.reset({
      index: 0,
      routes: [
        {
          name: 'AvatarDetail',
          params: navigationParams,
        },
      ],
    });

    // Reset everything after success
    avatarResetSelections();

    logFirebaseEvent(EVENT_NAME.VIEW_AVATAR_DETAIL_FROM_CREATE_AVATAR, {
      avatar: createdAvatar?.id,
      user_id: userData?.user?.id,
    });
    setEventTrackinig({
      event_type: EVENT_NAME.VIEW_AVATAR_DETAIL_FROM_CREATE_AVATAR,
    });
  };

  const handleUpdateAvatarDetailOnFinish = async () => {
    // Check if avatarErrMessage has data, then show CustomConfirmationModal
    if (avatarErrMessage) {
      setAvatarShowPurchaseModal(true);
      return;
    }

    const filteredSubCategories = summeryList.filter((subCategory: any) => {
      const parentCategory = normalizeList.find(
        (category: any) => category.label === subCategory.category_label,
      );
      return parentCategory && parentCategory.is_required === false;
    });

    const updateData = {
      avatarId: createdAvatar?.id,
      sub_categories: filteredSubCategories,
    };

    if (
      (userData.user?.isCurrentlyEnabledSubscription ||
        !userData.isGuestUser) &&
      isFailedCreateAvatar
    ) {
      onGenerateAvatar(true);
    } else {
      await updateAvatarCreate(updateData)
        .then(res => {
          const updatedAvatarData = res?.data?.data;
          // console.log('res of updateAvatarCreate ::::::::', res);
          avatarHandleFinish(res?.data?.data);
          setCreatedAvatar(updatedAvatarData);
        })
        .catch(err => {
          console.log('error in updateAvatarCreate ::::::::', err);
        });
    }
  };

  const avatarNormalizeArray = (arr: any) => {
    if (arr.length <= 5) {
      return [...arr];
    }
    const remainder = arr?.length % 3;

    if (remainder === 0) return arr; // already divisible by 3

    const itemsToAdd = 3 - remainder;

    // Add empty objects (or whatever placeholder you need)
    const fillers = Array(itemsToAdd)?.fill({ isEmpty: true });

    return [...arr, ...fillers];
  };

  const CategoryItem = normalizeList[currentIndex];

  // const subcategories = categories[currentIndex]?.sub_categories.length
  //   ? normalizeArray(categories[currentIndex]?.sub_categories)
  //   : [];

  const subcategories = normalizeList[currentIndex]?.sub_categories?.length
    ? avatarNormalizeArray(normalizeList[currentIndex]?.sub_categories)
    : [];

  const AvatarStepProgressBar = ({ totalSteps, currentStep }: any) => {
    return (
      <View style={styles.avatarStepContainer}>
        {Array.from({ length: totalSteps }).map((_, index) => (
          <View
            key={index}
            style={[
              styles.avatarStep,
              {
                backgroundColor:
                  index < currentStep
                    ? theme.primaryFriend // filled (purple)
                    : customColors.progressBgColor, // empty (light purple)
              },
            ]}
          />
        ))}
      </View>
    );
  };

  return (
    <ImageBackground
      style={styles.avatarContainer}
      source={IMAGES.createAvatarBG}
      imageStyle={styles.avatarImageStyles}
    >
      <StatusBar
        backgroundColor="transparent"
        barStyle="dark-content"
        translucent
      />

      <CustomHeader
        headerLeftComponent={
          <TouchableOpacity
            style={styles.avatarBtnContainerStyle}
            onPress={() => {
              // if (currentIndex === 0) {
              //   navigation.goBack();
              // } else {
              //   onBack();
              // }
              avatarOnBack();
            }}
          >
            <Image source={IMAGES.back_icon} style={styles.avatarBackIcon} />
          </TouchableOpacity>
        }
        headerCenterComponent={
          <Text style={styles.avatarCategoryTitle}>
            {CategoryItem?.label ?? ''}
          </Text>
        }
        headerRightComponent={
          <CommonPrimaryButton
            title={
              currentIndex === normalizeList.length - 1 ? 'Finish' : 'Next'
            }
            onPress={() => {
              if (currentIndex === normalizeList.length - 1) {
                // avatarHandleFinish();
                handleUpdateAvatarDetailOnFinish();
              } else {
                avatarOnNext();
              }
            }}
            txtStyle={{
              fontSize: moderateScale(14),
            }}
            disabled={isDisabledPress}
            btnStyle={
              isDisabledPress
                ? styles.avatarDisabledBottomBtnStyle
                : styles.avatarBottomBtnStyle
            }
          />
        }
        containerStyle={{
          backgroundColor: 'transparent',
          paddingTop: 0,
          paddingBottom: scale(10),
        }}
      />
      {/* <View style={styles.bottomBtnContainer}>
        <TouchableOpacity
          style={styles.btnContainerStyle}
          onPress={() => {
            // if (currentIndex === 0) {
            //   navigation.goBack();
            // } else {
            //   onBack();
            // }
            onBack();
          }}
        >
          <Image source={IMAGES.back_icon} style={styles.backIcon} />
        </TouchableOpacity>

        <PrimaryButton
          title={currentIndex === normalizeList.length - 1 ? 'Finish' : 'Next'}
          onPress={() => {
            if (currentIndex === normalizeList?.length - 1) {
              handleFinish();
            } else {
              onNext();
            }
          }}
          disabled={isDisabledPress}
          btnStyle={
            isDisabledPress
              ? styles.disabledBottomBtnStyle
              : styles.bottomBtnStyle
          }
        />
      </View> */}

      {avatarIsLoading ? <CustomActivityIndicator /> : null}

      <AvatarStepProgressBar
        totalSteps={normalizeList.length} // total categories
        currentStep={currentIndex + 1} // current step
      />

      <View key={CategoryItem?.id} style={styles.avatarPage}>
        <View
          style={{
            paddingHorizontal: scale(20),
            marginBottom: verticalScale(10),
          }}
        >
          {currentIndex === 0 && (
            <CustomInput
              maxLength={20}
              label={`${
                useThemeStore.getState().themeName === 'girlfriend'
                  ? 'Girl'
                  : 'Boy'
              } Friend's Name`}
              value={avatarName}
              onChangeText={(name: string) => {
                setAvatarNameError('');
                setAvatarName(name);
              }}
              error={avatarNameError}
              keyboardType="email-address"
              placeholder={`Enter Your ${
                useThemeStore.getState().themeName === 'girlfriend'
                  ? 'Girl'
                  : 'Boy'
              } Friend's Name `}
              containerStyle={{ marginBottom: 0 }}
            />
          )}
        </View>
        <View
          style={{
            paddingBottom:
              currentIndex === 0 ? insets.bottom + 20 : insets.bottom,
          }}
        >
          <FlatList
            data={
              CategoryItem?.label === 'Summary' ? summeryList : subcategories
            }
            renderItem={avatarRenderSubcategory}
            numColumns={
              CategoryItem?.label === 'Summary'
                ? 3
                : subcategories.length <= 5
                ? 2
                : 3
            }
            showsVerticalScrollIndicator={false}
            contentContainerStyle={[
              styles.avatarGridContainer,
              {
                paddingBottom:
                  currentIndex === 0
                    ? insets.bottom + scale(80)
                    : insets.bottom,
              },
            ]}
            keyExtractor={(subItem, index) =>
              subItem?.id ? `${subItem.id}-${index}` : `empty-${index}`
            }
            key={
              CategoryItem?.label === 'Summary'
                ? '3-columns'
                : subcategories.length <= 5
                ? '2-columns'
                : '3-columns'
            }
            columnWrapperStyle={styles.avatarRow}
            bounces={false}
          />
        </View>
      </View>

      {avatarIsOpen && !userData.user?.isCurrentlyEnabledSubscription && (
        <SubscriptionPopup
          onNavigate={() => {
            setAvatarIsOpen(false);
          }}
          onClose={() => {
            console.log('ON CLOSE SUBSCRIPTION====');
            setAvatarShowPurchaseModal(true);
            setIsOpenPlan(false);
            setAvatarIsOpen(false);
            userState.getState().setSplashState(false);
          }}
          visible={avatarIsOpen}
          onLogin={() => {
            setAvatarIsOpen(false);
            navigation?.navigate('Login', { email: null, isfromPlan: true });
          }}
          onSuccess={() => {
            // avatarHandleFinish();
            // handleUpdateAvatarDetailOnFinish(); // already check in finish func.
            setAvatarErrMessage(''); // reset error message
            setAvatarShowPurchaseModal(false);
            setAvatarIsOpen(false);
          }}
        />
      )}
      {avatarIsOpen && userData.user?.isCurrentlyEnabledSubscription && (
        <UpgradeCreditPopup
          onNavigate={() => {
            setAvatarIsOpen(false);
          }}
          visible={avatarIsOpen}
          onClose={() => {
            console.log('ON CLOSE TOKEN====');
            setAvatarShowPurchaseModal(true);
            setIsOpenPlan(false);
            setAvatarIsOpen(false);
            userState.getState().setSplashState(false);
          }}
          onLogin={() => {
            setAvatarIsOpen(false);
            navigation?.navigate('Login', { email: null, isfromPlan: true });
          }}
          onSuccess={() => {
            // avatarHandleFinish();
            setAvatarErrMessage(''); // reset error message
            setAvatarShowPurchaseModal(false);
            // handleUpdateAvatarDetailOnFinish(); // already check in finish func.
            setAvatarIsOpen(false);
          }}
        />
      )}
      {avatarErrMessage && (
        <CustomConfirmationModal
          visible={avatarShowPurchaseModal}
          title={'Not Enough Tokens!'}
          message={avatarErrMessage}
          onCancel={() => {
            setAvatarErrMessage('');
            setAvatarShowPurchaseModal(false);
            navigationRef?.current?.reset({
              index: 0,
              routes: [{ name: AppConstant.mainNav }],
            });
          }}
          onConfirm={() => {
            setAvatarIsOpen(true);
          }}
          onPressOutSide={() => setAvatarShowPurchaseModal(false)}
          btnText={'Upgrade Now'}
          icon={IMAGES.warning_icon}
        />
      )}
    </ImageBackground>
  );
};

export default CommonCreateAvatar;

const AvatarStyles = () => {
  const theme = useThemeStore().theme;
  const insets = useSafeAreaInsets();
  const containerMargin = scale(20);
  return StyleSheet.create({
    avatarContainer: {
      flex: 1,
    },
    avatarImageStyles: {
      opacity: 0.5,
    },
    avatarProgressBarBg: {
      height: scale(9),
      backgroundColor: customColors.progressBgColor, // Gray background
      borderRadius: scale(3),
      marginHorizontal: scale(20),
      overflow: 'hidden',
    },
    avatarProgressBarFill: {
      height: '100%',
      backgroundColor: theme.primaryFriend, // Pink color
      borderRadius: scale(4),
      shadowColor: theme.primaryFriend,
      shadowOffset: {
        width: 0,
        height: 0,
      },
      shadowOpacity: 0.5,
      shadowRadius: 4,
      elevation: 3,
    },
    avatarPage: {
      width: SCREEN_WIDTH,
      flex: 1,
      paddingTop: verticalScale(10),
      paddingBottom: verticalScale(10),
    },
    avatarCategoryTitle: {
      fontSize: scale(22),
      fontFamily: Fonts.ISemiBold,
      textAlign: 'center',
      color: theme.primaryFriend,
    },
    avatarBottomBtnContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingHorizontal: scale(20),
      paddingBottom: scale(10),
    },
    avatarBottomBtnStyle: {
      // width: '85%',
      paddingHorizontal: verticalScale(15),
      paddingVertical: verticalScale(10),
    },
    avatarDisabledBottomBtnStyle: {
      // width: '85%',
      backgroundColor: theme.subText,
      paddingHorizontal: verticalScale(15),
      paddingVertical: verticalScale(10),
    },
    avatarSubcategoryCard: {
      flex: 1,
      margin: scale(6),
      maxWidth: '30%',
      borderRadius: moderateScale(10),
      backgroundColor: theme?.white,
      overflow: 'hidden',
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.15,
      shadowRadius: 5,
      elevation: 4,
      height: verticalScale(130),
      justifyContent: 'center',
      alignItems: 'center',
    },
    avatarEmptyCard: {
      flex: 1,
      margin: scale(6),
      maxWidth: '30%',
      height: verticalScale(130),
      // Invisible placeholder
    },
    avatarImageWrapper: {
      width: '100%',
      height: '100%',
      borderRadius: moderateScale(10),
      overflow: 'hidden',
    },
    avatarSubcategoryImage: {
      width: '100%',
      height: '100%',
      resizeMode: 'cover',
    },
    avatarImageOverlay: {
      position: 'absolute',
      bottom: 0,
      width: '100%',
      paddingVertical: verticalScale(4),
      paddingHorizontal: scale(8),
      alignItems: 'center',
      justifyContent: 'center',
      fontFamily: Fonts.IRegular,
    },
    avatarOverlayText: {
      color: theme?.white,
      fontSize: scale(14),
      fontFamily: Fonts.ISemiBold,
      textAlign: 'center',
      marginBottom: verticalScale(3),
    },
    avatarTopText: {
      color: 'red',
      fontSize: scale(14),

      textAlign: 'center',
    },
    avatarSelectedTag: {
      backgroundColor: theme?.primaryFriend,
      paddingHorizontal: scale(16),
      paddingVertical: verticalScale(4),
      borderBottomLeftRadius: moderateScale(8),
      borderBottomRightRadius: moderateScale(8),
      alignSelf: 'center',
    },
    avatarSelectedText: {
      color: theme?.white,
      fontSize: scale(12),
      fontFamily: Fonts.ISemiBold,
    },
    avatarGridContainer: {
      paddingHorizontal: containerMargin,
      paddingTop: verticalScale(5),
      flexGrow: 1,
    },
    avatarRow: {
      flex: 1,
      justifyContent: 'space-between',
      paddingBottom: verticalScale(4), // This ensures even distribution
    },
    avatarBtnContainerStyle: {
      borderWidth: 1,
      // paddingVertical: verticalScale(14),
      borderRadius: scale(8),
      alignItems: 'center',
      borderColor: theme.primaryFriend,
      padding: scale(15),
      paddingHorizontal: scale(20),
      paddingVertical: verticalScale(12),
      // paddingHorizontal: scale(20),
      // width: '20%',
    },
    avatarBackIcon: {
      width: scale(15),
      height: scale(15),
      // resizeMode: 'contain',
      tintColor: theme.primaryFriend,
    },
    avatarStepContainer: {
      flexDirection: 'row',
      marginHorizontal: scale(20),
    },
    avatarStep: {
      flex: 1,
      paddingVertical: verticalScale(4),
      borderRadius: moderateScale(2),
      marginHorizontal: scale(1),
    },
  });
};
