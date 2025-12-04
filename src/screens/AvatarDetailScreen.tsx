import React, {
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  FlatList,
  ImageBackground,
  StatusBar,
  Dimensions,
  Alert,
  ActivityIndicator,
  Platform,
  PermissionsAndroid,
  Linking,
} from 'react-native';
import {
  useRoute,
  useNavigation,
  useIsFocused,
} from '@react-navigation/native';
import {
  generateAvatarPhoto,
  generateAvatarPhotoFree,
  getAdminSetting,
  getUserDetail,
  setEventTrackinig,
  UserAvatarDetail,
} from '../api/user';
import IMAGES from '../assets/images';
import {
  isAndroid,
  isIos,
  moderateScale,
  scale,
  SCREEN_HEIGHT,
  SCREEN_WIDTH,
  verticalScale,
} from '../utils/Scale';
import { useThemeStore } from '../store/themeStore';
import Fonts from '../utils/fonts';
import CustomTitleWithBack from '../components/CustomTitleWithBackHeader';
import { CommonBottomSheetRef } from '../components/CommonBottomSheet';
import CustomBottomSheet from '../components/CommonBottomSheet';
import { BottomSheetScrollView } from '@gorhom/bottom-sheet';
import { photos, userSelfAvatar, userState } from '../store/userStore';
import { navigationRef } from '../../App';
import CustomHeader from '../components/headers/CustomHeader';
import AppConstant from '../utils/AppConstant';
import SubscriptionPopup from '../components/SubscriptionPopup';
import { customColors } from '../utils/Colors';
import CommonLinearContainer from '../components/CommonLinearContainer';
import CommonImagePlaceHolder from '../components/CommonImagePlaceHolder';
import CommonRenderAvatar from '../components/CommonRenderAvatar';
import CustomAppModel from '../components/CustomAppModel';
import PrimaryButton from '../components/buttons/CommonPrimaryButton';
import CommonImageZoomModal from '../components/CommonZoomImageModal';
import { AVATAR_SOCKET_URL } from '../config';
import UpgradeCreditPopup from '../components/UpgradeCreditPopup';
import { PERMISSIONS, request, RESULTS } from 'react-native-permissions';
import CustomReportIssueModal from '../components/CustomReportIssueModal';
import CustomMessagePopup from '../components/CustomMessagePopup';
import { logFirebaseEvent } from '../utils/HelperFunction';
import { adsKeyword, EVENT_NAME } from '../constants';
import ImagePreviewModal from '../components/ImagePreviewModal';
import {
  AdEventType,
  RewardedAd,
  RewardedAdEventType,
} from 'react-native-google-mobile-ads';
import { useAdsStore } from '../store/useAdsStore';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  interpolate,
  useAnimatedReaction,
  Extrapolation,
  runOnJS,
} from 'react-native-reanimated';

interface AvatarItem {
  id: number | string;
  name?: string;
  image?: string;
  cover_image?: string;
  age?: number;
  tag?: string;
  chat?: {
    chat_id: number | string;
  };
  categories?: Array<{
    label: string;
    options: Array<{
      label: string;
    }>;
  }>;
}
const { width: screenWidth } = Dimensions.get('window');

const AvatarDetail = () => {
  const theme = useThemeStore(state => state.theme);
  const route = useRoute<any>();
  const navigation = useNavigation<any>();

  const [loading, setLoading] = useState<any>(true);
  const params = route.params;
  // console.log('params.id::::::', params);
  const [avatarData, setAvatarData] = useState<userSelfAvatar | null>(
    params?.item || null,
  );

  // console.log('avatarData <<<<<<', avatarData);
  const bottomSheetRef = useRef<CommonBottomSheetRef>(null);
  const reconnectDelay = useRef(1000);
  const manualClose = useRef(false);
  const styles = Styles();
  const [isOpen, setIsOpen] = useState(false);
  const [isOpenPreview, setIsOpenPreview] = useState<any>({
    isOpen: false,
    imageData: null,
  });
  const [isOpenZoomView, setIsOpenZoomView] = useState({
    isVisible: false,
    item: ({ image: undefined, id: undefined } as any) || null,
  });
  const [isOpenZoomAppearance, setIsOpenZoomAppearance] = useState<{
    isVisible: boolean;
    image: string | undefined | null;
  }>({
    isVisible: false,
    image: undefined,
  });
  const [isBlurPressed, setIsBlurPressed] = useState<boolean>(false);
  const {
    userData,
    setUserData,
    setMyAvatars,
    setFavoritesList,
    setMyFavoritesList,
    setHomeAvatarList,
    homeAvatarList,
    myAvatars,
    setIsOpenPlan,
    free_public_avatars,
    free_message_count,
    setFreeMessageCount,
    setFreePublicAvatars,
    isCallEnded,
    callEndReason,
    setIsCallEnded,
    setCallEndReason,
    isSignUpUser,
    isOpenPlan,
    setIsCreatedAvatarForSignUp,
  } = userState.getState();
  const isNewUser = params?.id ? false : userData?.avatar?.id ? true : false;
  const isBackAllows = params?.isBackAllowed;
  const [generateImageOptions, setGenerateImageOptions] = useState([]);
  const [selectedOption, setselectedOption] = useState<string>();
  const [optionPopup, setOptionPopup] = useState(false);
  const item = route.params?.item;
  const [isLike, setIsLike] = useState(route.params?.item?.isLike ?? false);

  const selectedPhotoID = useRef<string | number | undefined>(null);
  const [validImage, setValidImage] = useState(true);
  const [isHeaderHide, setIsHeaderHide] = useState(false);
  const [showMessagePopup, setShowMessagePopup] = useState(false);
  const socketRef = useRef<WebSocket | null>(null);
  const [onReportVisible, setOnReportVisible] = useState<{
    visible: boolean;
    content: any;
  }>({ visible: false, content: undefined });
  const isBlur = params?.isBlur ?? false;
  const focus = useIsFocused();

  const { remoteData } = useAdsStore();
  // Add this state near your other useState declarations
  const [isAdLoading, setIsAdLoading] = useState(false);

  const adUnitId = remoteData.admobMyAvatar_Image; // your production ID

  console.log('adUnitId <<<<<<', adUnitId);

  // 👇 Define your 3 snap points
  const snapPoints = useMemo(() => ['20%', '50%', '85%'], []);
  const animatedPosition = useSharedValue(0);
  const animatedIndex = useSharedValue(1);
  const textSpacing = isAndroid ? 25 : 0;

  // Create animated style that responds to POSITION, not just index:
  const animatedInfoStyle = useAnimatedStyle(() => {
    'worklet';

    // Convert bottomSheet position value (Y) → translate upward from bottom
    // Note: animatedPosition.value increases when sheet moves DOWN.
    // We invert that to calculate the correct bottom distance.
    const translateY = interpolate(
      animatedPosition.value,
      [SCREEN_HEIGHT * 0.2, SCREEN_HEIGHT * 0.85],
      [SCREEN_HEIGHT * 0.2, SCREEN_HEIGHT * 0.85 - textSpacing], // Adjust "120" to how far above you want text
      Extrapolation.CLAMP,
    );

    return {
      position: 'absolute',
      bottom: SCREEN_HEIGHT - translateY, // Keeps it just above sheet
      opacity: interpolate(
        animatedPosition.value,
        [SCREEN_HEIGHT * 0.2, SCREEN_HEIGHT * 0.85],
        [1, 1], // Always visible — can add fade if needed
        Extrapolation.CLAMP,
      ),
    };
  });

  useEffect(() => {
    if (isCallEnded && callEndReason) {
      if (callEndReason === 'insufficient_tokens') {
        setShowMessagePopup(true);
      } else {
        Alert.alert('Call Ended', callEndReason);
      }
      // reset after handling
      setIsCallEnded(false);
      setCallEndReason('');
    }
  }, [isCallEnded, callEndReason]);

  useLayoutEffect(() => {
    navigation.setOptions({
      gestureEnabled: true,
    });
  }, [navigation]);

  useEffect(() => {
    if (focus && isOpenPlan) {
      setIsOpenPlan(isOpenPlan);
      setIsOpen(isOpenPlan);
    }
  }, [isOpenPlan, focus]);

  // ✅ Function to show ad on "Get Free"
  const handleGetFree = () => {
    logFirebaseEvent(EVENT_NAME.SHOW_AD_FOR_GENERATE_FREE_AVATAR_IMAGE, {
      user_id: userData?.user?.id,
    });
    setEventTrackinig({
      event_type: EVENT_NAME.SHOW_AD_FOR_GENERATE_FREE_AVATAR_IMAGE,
    });
    userState.getState().setSplashState(true);
    console.log('🎯 PRESSED Get Free...');
    setIsOpenPreview({ isOpen: false, imageData: null });

    // Show loader immediately
    setIsAdLoading(true);
    const ad = RewardedAd.createForAdRequest(adUnitId, {
      keywords: remoteData?.adsKeyword ?? adsKeyword,
    });
    console.log('ad <<<<<<', ad);

    const rewardedAd = ad;

    // --- Setup listeners for this ad instance ---
    const unsubscribeLoaded = rewardedAd.addAdEventListener(
      RewardedAdEventType.LOADED,
      () => {
        console.log('✅ Rewarded ad loaded...', rewardedAd);
        setIsAdLoading(false); // Hide loader when ad is ready
        rewardedAd.show();
      },
    );

    const unsubscribeEarned = rewardedAd.addAdEventListener(
      RewardedAdEventType.EARNED_REWARD,
      reward => {
        console.log('🎁 User earned reward:', reward);
        if (selectedPhotoID != null) {
          onGenerateImageFree(); // Only after reward earned
        } else {
          console.log('⚠️ selectedPhotoID missing', selectedPhotoID);
          Alert.alert('Something went wrong. Please try again.');
        }
        setIsAdLoading(false);
      },
    );

    const unsubscribeClosed = rewardedAd.addAdEventListener(
      AdEventType.CLOSED,
      () => {
        console.log('🧩 Rewarded ad closed');
        setIsAdLoading(false);
        unsubscribeAll(); // clean up listeners
        setTimeout(() => {
          userState.getState().setSplashState(false);
        }, 1000);
      },
    );

    const unsubscribeError = rewardedAd.addAdEventListener(
      AdEventType.ERROR,
      err => {
        setIsAdLoading(false); // Hide loader on error
        userState.getState().setSplashState(false);
        console.log('❌ Rewarded ad error:', err);
        if (selectedPhotoID != null) {
          onGenerateImageFree(); // Only after reward earned
        } else {
          console.log('⚠️ selectedPhotoID missing', selectedPhotoID);
          Alert.alert('Something went wrong. Please try again.');
        }
        unsubscribeAll();
      },
    );

    const unsubscribeAll = () => {
      unsubscribeLoaded();
      unsubscribeEarned();
      unsubscribeClosed();
      unsubscribeError();
    };

    // --- Load or show ad ---
    if (rewardedAd.loaded) {
      console.log('✅ Rewarded ad already loaded, showing now...');
      setIsAdLoading(false); // No need to show loader if already loaded
      rewardedAd.show();
    } else {
      console.log('⚠️ Rewarded ad not loaded yet, loading...');
      rewardedAd.load();
    }
  };

  const requestMicrophonePermission = async (): Promise<boolean> => {
    try {
      if (Platform.OS === 'android') {
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.RECORD_AUDIO,
          {
            title: 'Microphone Permission',
            message:
              'We need access to your microphone so you can make voice calls.',
            buttonPositive: 'OK',
            buttonNegative: 'Cancel',
          },
        );
        return granted === PermissionsAndroid.RESULTS.GRANTED;
      } else {
        const result = await request(PERMISSIONS.IOS.MICROPHONE);
        return result === RESULTS.GRANTED;
      }
    } catch (err) {
      console.warn('Mic permission error:', err);
      return false;
    }
  };

  const onCallPress = async () => {
    if (userData?.isGuestUser) {
      navigation.navigate('Login', { isfromPlan: true });
      return;
    }
    if (
      (!userData?.user?.tokens || userData.user.tokens < 5) &&
      userData?.user?.free_voice_minutes === 0
    ) {
      setIsOpen(true);
      return;
    }

    const hasPermission = await requestMicrophonePermission();
    if (!hasPermission) {
      Alert.alert(
        'Permission Required',
        'Microphone access is needed to make a call. Please allow permission.',
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Go to Settings', onPress: () => Linking.openSettings() },
        ],
      );
      return;
    } else {
      navigation.navigate('VoiceCall', {
        user: {
          name: params?.item?.name ?? avatarData?.name ?? '',
          id: params?.item?.id ?? avatarData?.id,
          image: params?.item?.cover_image ?? avatarData?.cover_image ?? '',
        },
      });
      logFirebaseEvent(EVENT_NAME.CALL_FROM_AVATAR_DETAIL, {
        avatar_id: avatarData?.id,
        user_id: userData?.user?.id ?? '',
      });
      setEventTrackinig({
        event_type: EVENT_NAME.CALL_FROM_AVATAR_DETAIL,
      });
    }
  };

  const connectSocket = (avatarId: string) => {
    if (socketRef.current) {
      manualClose.current = true;
      socketRef.current.close();
      socketRef.current = null;
    }
    const wsUrl = `${AVATAR_SOCKET_URL}${avatarId}/?token=${userData?.access_token}`;
    const ws = new WebSocket(wsUrl);
    socketRef.current = ws;

    ws.onopen = () => {
      console.log('✅ WebSocket connected in AvatarDetail');
      reconnectDelay.current = 1000;
      manualClose.current = false;
    };

    ws.onmessage = event => {
      try {
        const message = JSON.parse(event.data);

        if (message?.status === 'completed') {
          setAvatarData(prev => {
            if (!prev) return prev;
            const updatedPhotos = prev?.photos?.map(item =>
              item.id === message?.image_id
                ? {
                    ...item,
                    status: message?.status,
                    image: message?.image_url,
                  }
                : item,
            );
            return { ...prev, photos: updatedPhotos };
          });
          setLoading(false);
        } else {
          setAvatarData(prev => {
            if (!prev) return prev;
            const updatedPhotos = prev.photos?.map(item =>
              item.id === message?.image_id
                ? { ...item, status: message?.status }
                : item,
            );
            return { ...prev, photos: updatedPhotos };
          });
          setLoading(false);
        }
      } catch (err) {
        setLoading(false);
        console.error('❌ WS Parse Error in AvatarDetail:', err, event.data);
      }
    };

    ws.onerror = error => {
      console.error('❌ WS Error in AvatarDetail:', error);
      setLoading(false);
    };

    ws.onclose = async () => {
      console.log('🔌 CONNECTION CLOSE in AvatarDetail');

      socketRef.current = null;

      if (manualClose.current) {
        console.log('🛑 Manual close, skipping reconnect');
        return;
      }

      if (
        focus &&
        navigationRef.current?.getCurrentRoute()?.name ===
          ('AvatarDetail' as any)
      ) {
        const response = await UserAvatarDetail(params?.id);
        const data = response?.data?.data;

        const hasPending = data?.photos?.some(
          (p: any) => p?.status === 'pending',
        );

        console.log('data <<< <<<<<< <<<<<', data);

        setTimeout(() => {
          if (!hasPending) {
            setAvatarData(data);
          } else {
            connectSocket(params?.id);
          }
        }, 1000);

        // Exponential backoff up to 30s
        reconnectDelay.current = Math.min(reconnectDelay.current * 2, 30000);
      }
    };
  };

  useEffect(() => {
    if (focus) {
      getUserDetail().then(async res => {
        const user = res?.data?.data?.user;

        const newUserData = {
          ...userData,
          user: {
            ...user,
            tokens:
              user?.isCurrentlyEnabledSubscription === false ? 0 : user?.tokens,
          },
        };

        setUserData(newUserData);
      });

      getAdminSetting().then(res => {
        setFreeMessageCount(res?.data?.data?.free_message_count);
        setFreePublicAvatars(res?.data?.data?.free_public_avatars);
      });
    }
  }, [focus, userData]);

  useEffect(() => {
    return () => {
      closeSocket();
    };
  }, []);

  useEffect(() => {
    setTimeout(() => {
      bottomSheetRef?.current?.snapToIndex(0);
    }, 200);
    if (!isNewUser) {
      userAvatar();
    } else {
      setAvatarData(userData.avatar);
      setLoading(false);
    }
  }, []);

  const closeSocket = () => {
    if (socketRef.current) {
      socketRef.current.close();
      socketRef.current = null;
    }
  };

  const userAvatar = async (photoId?: string | number) => {
    try {
      const response = await UserAvatarDetail(params?.id);
      const data = response?.data?.data;
      setAvatarData(data);
      setGenerateImageOptions(data?.background_promots);

      const hasPending = data?.photos?.some(
        (p: any) => p?.status === 'pending',
      );

      if (hasPending) {
        connectSocket(params?.id);
        setLoading(true);
      } else {
        closeSocket();
        setLoading(false);
      }
    } catch (error) {
      console.error('Error fetching avatar detail:', error);
      setLoading(false);
    } finally {
      setLoading(false);
      setIsBlurPressed(false);
    }
  };

  const RETRY_DELAY = 5000;
  useEffect(() => {
    let retryTimeout: NodeJS.Timeout;

    const checkImage = () => {
      const coverImage = params?.item?.cover_image ?? avatarData?.cover_image;
      if (coverImage) {
        fetch(coverImage, { method: 'HEAD' })
          .then(res => {
            console.log('DATA', res.status);
            if (res.status === 404) {
              setValidImage(false);
              // retry after some seconds
              retryTimeout = setTimeout(checkImage, RETRY_DELAY);
            } else if (res.ok) {
              setValidImage(true);
            } else {
              setValidImage(false);
            }
          })
          .catch(() => {
            setValidImage(false);
            retryTimeout = setTimeout(checkImage, RETRY_DELAY);
          });
      } else {
        setValidImage(false);
      }
    };

    checkImage();

    // cleanup on unmount / image change
    return () => {
      if (retryTimeout) clearTimeout(retryTimeout);
    };
  }, [avatarData?.cover_image]);

  const onSkip = () => {
    if (userData?.isGuestUser) {
      navigationRef?.current?.reset({
        index: 0,
        routes: [{ name: AppConstant.mainNav }],
      });
    } else {
      if (isSignUpUser) {
        setIsCreatedAvatarForSignUp(true);
      }
      if (
        userData?.user?.isUserSubscribeOnce ||
        userData?.user?.isCurrentlyEnabledSubscription
      ) {
        navigationRef?.current?.reset({
          index: 0,
          routes: [{ name: AppConstant.mainNav }],
        });
      } else {
        navigationRef?.current?.reset({
          index: 0,
          routes: [{ name: AppConstant.mainNav }],
        });
      }
    }
  };

  const handleChatPress = () => {
    if (userData?.isGuestUser) {
      navigation.navigate('Login', { isfromPlan: true });
    } else {
      navigation.navigate(AppConstant.chat, {
        user: {
          name: avatarData?.name ?? '',
          id: avatarData?.id,
          image: avatarData?.cover_image ?? '',
        },
        chat_id: avatarData?.chat?.chat_id,
      });
      logFirebaseEvent(EVENT_NAME.CHAT_FROM_AVATAR_DETAIL, {
        avatar: item?.id,
        user_id: userData?.user?.id,
      });
      setEventTrackinig({ event_type: EVENT_NAME.CHAT_FROM_AVATAR_DETAIL });
    }
  };

  const onGenerateImage = async (photoId: string | number) => {
    await generateAvatarPhoto(params?.id, photoId)
      .then(res => {
        userAvatar(photoId);
      })
      .catch(err => {
        setLoading(false);
        console.log('Error on Generate AvatarPhoto:: ', err);
      });
  };

  const onGenerateImageFree = async () => {
    if (selectedPhotoID.current == null) return; // prevent null/undefined
    setLoading(true);

    await generateAvatarPhotoFree(params?.id, selectedPhotoID.current)
      .then(res => {
        userAvatar(selectedPhotoID.current);
        selectedPhotoID.current = null;
      })
      .catch(err => {
        setLoading(false);
        console.log('Error on Generate AvatarPhoto:: ', err);
        selectedPhotoID.current = null;
      });
  };

  const onBlurPhotoPress = async (photoId: string | number, image: any) => {
    console.log('image <<<<<', image);
    setIsBlurPressed(true);

    if (!params?.isMyAvatar && userData.isGuestUser) {
      navigation.navigate('Login');
      return;
    }
    if (isBlurPressed) {
      return;
    }
    console.log('userData?.user <<<<<', userData?.user);

    if (
      !userData?.user?.tokens ||
      userData.user.tokens < 2 ||
      userData?.user?.isCurrentlyEnabledSubscription === false
    ) {
      selectedPhotoID.current = photoId as any;

      if (userData?.isGuestUser) {
        navigation.navigate('Login', { isfromPlan: true });
        setIsBlurPressed(false);
        return;
      }
      setIsOpenPreview({ isOpen: true, imageData: image });
      setIsBlurPressed(false);
    } else {
      await onGenerateImage(photoId);
    }
  };

  const onLikePress = () => {
    setIsLike(!isLike);
    if (params?.isMyAvatar) {
      setMyFavoritesList({ ...item, isLike: true });
      const updatedProfiles = myAvatars?.map((profile: AvatarItem) => ({
        ...profile,
        isLike: !item?.isLike,
      }));
      setMyAvatars(updatedProfiles as AvatarItem[]);
    } else {
      setFavoritesList({ ...item, isLike: true });
      const updatedProfiles = homeAvatarList?.map((profile: AvatarItem) => ({
        ...profile,
        isLike: !item?.isLike,
      }));
      setHomeAvatarList(updatedProfiles as AvatarItem[]);
      logFirebaseEvent(EVENT_NAME.LIKE_FROM_AVATAR_DETAIL, {
        avatar: item.id,
        user_id: userData?.user?.id,
      });
      setEventTrackinig({ event_type: EVENT_NAME.LIKE_FROM_AVATAR_DETAIL });
    }
  };

  const photoList = avatarData?.photos
    ?.slice()
    ?.sort((a: any, b: any) => a.id - b.id);

  const onBlurAvatarPress = () => {
    if (userData?.isGuestUser) {
      navigation.navigate('Login', { isfromPlan: true });
    } else {
      console.log('ELSE--->');
      setIsOpen(true);
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar
        translucent
        backgroundColor="#00000000"
        barStyle={'dark-content'}
      />
      <ImageBackground style={{ flex: 1 }} source={IMAGES.app_splash_view2}>
        <ImageBackground
          source={{ uri: params?.item?.cover_image || avatarData?.cover_image }}
          style={styles.topImage}
          blurRadius={isBlur ? 10 : 0}
        >
          <CustomHeader
            containerStyle={{ backgroundColor: '#00000000', zIndex: 99 }}
            headerLeftComponent={
              isHeaderHide ? (
                <View></View>
              ) : (
                <CustomTitleWithBack
                  isBackHide={!isBackAllows}
                  title={avatarData?.name || ''}
                  txtStyle={{ color: theme.white }}
                  btnStyle={{ tintColor: theme.white }}
                  onPress={() => navigation.goBack()}
                />
              )
            }
            headerRightComponent={
              <View
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  gap: 10,
                }}
              >
                <TouchableOpacity
                  onPress={() => {
                    setOnReportVisible({
                      visible: true,
                      content: { ...avatarData, type: 'avatar' },
                    });
                  }}
                  style={styles.heart}
                >
                  <Image source={IMAGES.report_icon} style={[styles.icon]} />
                </TouchableOpacity>
                {isHeaderHide ? null : isNewUser ? null : !userData?.user
                    ?.isCurrentlyEnabledSubscription &&
                  isBackAllows ? null : params?.isMyAvatar ? null : (
                  <TouchableOpacity
                    onPress={onLikePress}
                    style={[
                      styles.heart,
                      {
                        backgroundColor: isLike
                          ? theme.primaryFriend
                          : theme.white,
                      },
                    ]}
                  >
                    <Image
                      source={IMAGES.heart}
                      style={[
                        styles.icon,
                        {
                          tintColor: isLike ? theme.white : theme.primaryFriend,
                        },
                      ]}
                    />
                  </TouchableOpacity>
                )}
              </View>
            }
          />
          <ImageBackground
            source={
              validImage
                ? {
                    uri: avatarData?.cover_image,
                  }
                : IMAGES.app_splash_view2
            }
            blurRadius={validImage ? 0 : 10}
            style={{
              position: 'absolute',
              top: 0,
              bottom: 0,
              left: 0,
              right: 0,
              backgroundColor: '#00000080',
              justifyContent: 'flex-start',
              alignItems: 'center',
              // paddingTop: verticalScale(280),
            }}
          >
            {!validImage && (
              <View
                style={{
                  alignItems: 'center',
                  justifyContent: 'center',
                  paddingVertical: verticalScale(15),
                  paddingHorizontal: scale(16),
                  marginTop: verticalScale(280),
                  // backgroundColor: 'red',
                }}
              >
                <ActivityIndicator color={theme.primaryFriend} size={'large'} />
                <Text style={styles.loaderText}>
                  {'Please wait a moment...'}
                </Text>
              </View>
            )}
          </ImageBackground>

          <Animated.View
            style={[styles.info, animatedInfoStyle]}
            pointerEvents={isHeaderHide ? 'none' : 'auto'} // prevents touches when sheet is top
          >
            {isBlur && (
              <TouchableOpacity
                style={styles.lockIconContainer}
                onPress={onBlurAvatarPress}
              >
                <View style={styles.lockIconBackground}>
                  <Image
                    source={IMAGES.lock}
                    style={styles.lockIcon}
                    resizeMode="contain"
                  />
                  <Text style={styles.lockText}>Premium Content</Text>
                  <Text style={styles.unlockText}>{`Tap to unloack`}</Text>
                </View>
              </TouchableOpacity>
            )}
            {isHeaderHide ? (
              <></>
            ) : (
              <>
                <Text style={styles.name}>
                  {avatarData?.name}, {avatarData?.age}
                </Text>

                {avatarData?.likes_count !== 0 && !params?.isMyAvatar && (
                  <View style={styles.likesRow}>
                    <Image
                      source={IMAGES.heart}
                      style={[
                        styles.icon,
                        {
                          tintColor: theme.primaryFriend,
                          marginRight: scale(6),
                        },
                      ]}
                    />
                    <Text style={styles.likes}>
                      Likes ({avatarData?.likes_count || 0})
                    </Text>
                  </View>
                )}
              </>
            )}
          </Animated.View>
        </ImageBackground>

        {/* Fixed Scrollable Sheet Content */}
        <CustomBottomSheet
          ref={bottomSheetRef}
          index={1} // starts at '50%'
          animatedPosition={animatedPosition} // required for animation
          snapPoints={snapPoints}
          enablePanDownToClose={false}
          enableContentPanningGesture={true}
          enableHandlePanningGesture={true}
          backgroundStyle={{
            // borderColor: 'rgba(0, 0, 0, 1)',
            borderColor: '#FFFFFF73',
            borderWidth: 1,
            backgroundColor: isIos
              ? // ? 'rgba(74, 71, 71, 0.7)'
                '#FFFFFF60'
              : '#88888890',
          }}
          onChange={index => {
            console.log('first', index);
            animatedIndex.value = index; // Track index for header visibility
            if (index === 2 || index === 3) {
              setIsHeaderHide(true);
              // setTheme('girlfriend');
              // setTheme(item.code || themeName);
            } else {
              setIsHeaderHide(false);
            }
          }}
        >
          <BottomSheetScrollView
            style={styles.bottomSheetScrollView}
            contentContainerStyle={styles.scrollContentContainer}
            showsVerticalScrollIndicator={false}
          >
            <View style={styles.sheet}>
              {/* Appearance */}
              <Text style={styles.sectionTitle}>Appearance</Text>
              <View style={styles.grid}>
                {(avatarData?.categories || params?.item?.categories)
                  ?.filter((item: any) => item.label !== 'Character')
                  ?.map((item: any, index: number) => (
                    <View key={index} style={styles.itemRow}>
                      <CommonImagePlaceHolder
                        image={item.options[0]?.image || undefined}
                        imageStyle={styles.itemIcon}
                        isAppIcon
                        size={'small'}
                        disabled={!item.options[0]?.image}
                        onPress={() => {
                          setIsOpenZoomAppearance({
                            isVisible: true,
                            image:
                              item.options[0]?.image === undefined
                                ? undefined
                                : item.options[0]?.image,
                          });
                        }}
                      />
                      <View style={styles.textGroup}>
                        {item?.label && (
                          <Text style={styles.label}>{item.label}</Text>
                        )}
                        {item.options[0]?.label && (
                          <Text style={styles.value}>
                            {item.options[0]?.label}
                          </Text>
                        )}
                      </View>
                    </View>
                  ))}
              </View>

              {/* Character */}
              {avatarData?.character ? (
                <>
                  <Text style={styles.sectionTitle}>Character</Text>
                  <View style={styles.itemRow}>
                    <Image source={IMAGES.male} style={styles.itemIcon} />
                    <View style={styles.textGroup}>
                      <Text style={styles.label}>Will act like</Text>
                      <Text style={styles.value}>
                        {avatarData?.character || 'N/A'}
                      </Text>
                    </View>
                  </View>
                </>
              ) : null}

              {/* Personality */}
              {avatarData?.character ? (
                <>
                  <Text style={styles.sectionTitle}>
                    Personality : {avatarData?.character}
                  </Text>
                  <Text style={styles.description}>
                    {avatarData?.character}
                  </Text>
                </>
              ) : null}

              {/* Photos */}
              <>
                {
                  photoList?.length ? (
                    <View style={styles.photosGrid}>
                      <Text style={styles.sectionTitle}>Photos</Text>
                      <View style={{ flex: 1 }}>
                        <FlatList
                          data={photoList}
                          numColumns={3}
                          keyExtractor={item => String(item.id)}
                          showsVerticalScrollIndicator={false}
                          columnWrapperStyle={styles.rowExplore}
                          ListEmptyComponent={() => (
                            <View style={styles.avatarImageLoader}>
                              <ActivityIndicator
                                color={theme.primaryFriend}
                                size={'large'}
                              />
                              <Text style={styles.loaderText}>
                                {'Please wait a moment...'}
                              </Text>
                            </View>
                          )}
                          renderItem={({
                            item,
                            index,
                          }: {
                            item: photos;
                            index: number;
                          }) =>
                            index == -1 ? (
                              <TouchableOpacity
                                style={styles.renderAdd}
                                onPress={() => {
                                  setOptionPopup(true);
                                }}
                                activeOpacity={0.8}
                              >
                                <Image
                                  source={IMAGES.pluse}
                                  style={styles.generateButtonIcon}
                                />
                                <Text
                                  style={[
                                    styles.generateButtonText,
                                    { marginTop: scale(10) },
                                  ]}
                                >
                                  Generate Images
                                </Text>
                              </TouchableOpacity>
                            ) : (
                              <CommonRenderAvatar
                                item={item}
                                index={index}
                                isMyAvatar={params?.isMyAvatar}
                                onPress={() => {
                                  console.log('PRESSED........');
                                  if (item.status === 'pending') return;
                                  setIsOpenZoomView({
                                    isVisible: true,
                                    item: {
                                      image: item?.image,
                                      id: item?.id,
                                    },
                                  });
                                }}
                                onBlurPress={() =>
                                  onBlurPhotoPress(item?.id, item?.image)
                                }
                                isBlur={item?.is_dummy}
                                isStatus={item?.status || undefined}
                                disabled={isBlurPressed}
                              />
                            )
                          }
                        />
                      </View>
                    </View>
                  ) : (
                    <View style={styles.avatarImageLoader}>
                      <ActivityIndicator
                        color={theme.primaryFriend}
                        size={'large'}
                      />
                      <Text style={styles.loaderText}>
                        {'Please wait a moment...'}
                      </Text>
                    </View>
                  )
                  // ✅ Improved No Photos UI
                  // <View style={styles.noPhotosContainer}>
                  //   <View style={styles.noPhotosContent}>
                  //     {/* Icon */}
                  //     <View style={styles.noPhotosIconContainer}>
                  //       <Image source={IMAGES.pluse} style={styles.noPhotosIcon} />
                  //     </View>

                  //     {/* Text */}
                  //     <Text style={styles.noPhotosTitle}>No Photos Yet</Text>
                  //     <Text style={styles.noPhotosSubtitle}>
                  //       Generate beautiful images for your avatar to make it more
                  //       engaging
                  //     </Text>

                  //     {/* Generate Button */}
                  //     <TouchableOpacity
                  //       style={styles.generateButton}
                  //       onPress={handleGenerateImage}
                  //       activeOpacity={0.8}
                  //     >
                  //       <View style={styles.generateButtonContent}>
                  //         <Image
                  //           source={IMAGES.pluse}
                  //           style={styles.generateButtonIcon}
                  //         />
                  //         <Text style={styles.generateButtonText}>
                  //           Generate Images
                  //         </Text>
                  //       </View>
                  //     </TouchableOpacity>
                  //   </View>
                  // </View>
                }
              </>
            </View>
          </BottomSheetScrollView>
        </CustomBottomSheet>

        <View style={styles.fabWrapper}>
          <View style={styles.fabContainer}>
            <View
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                gap: scale(14),
              }}
            >
              <TouchableOpacity
                style={[
                  styles.chatFab,
                  {
                    backgroundColor:
                      params?.item?.id || avatarData?.id
                        ? '#00C4FF'
                        : theme.text,
                  },
                ]}
                disabled={!params?.item?.id && !avatarData?.id}
                onPress={handleChatPress}
              >
                <Image source={IMAGES.Hchat} style={styles.fabIcon} />
                <Text style={styles.msgText}>Message</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.callFab,
                  {
                    backgroundColor:
                      params?.item?.id || avatarData?.id
                        ? customColors.green
                        : theme.text,
                  },
                ]}
                disabled={!params?.item?.id && !avatarData?.id}
                onPress={onCallPress}
              >
                <Image source={IMAGES.call} style={styles.fabIcon} />
              </TouchableOpacity>
              {!isBackAllows && (
                <TouchableOpacity onPress={onSkip}>
                  <CommonLinearContainer
                    containerStyle={styles.linearContainer}
                    colors={[theme.boyFriend, theme.girlFriend]}
                  >
                    <View style={styles.backContainer}>
                      <Image
                        source={IMAGES.back_icon}
                        style={[
                          styles.backArrow,
                          {
                            tintColor: customColors.black,
                            width: scale(20),
                            height: scale(20),
                          },
                        ]}
                      />
                    </View>
                  </CommonLinearContainer>
                </TouchableOpacity>
              )}
            </View>
          </View>
        </View>
      </ImageBackground>

      <CustomAppModel
        visible={optionPopup}
        title="Please selecet below"
        onClose={() => setOptionPopup(false)}
      >
        <View>
          {generateImageOptions?.map(item => {
            return (
              <TouchableOpacity
                style={styles.selectionContainer}
                onPress={() => setselectedOption(item)}
              >
                <Image
                  source={
                    selectedOption == item ? IMAGES.check : IMAGES.uncheck
                  }
                  style={styles.checkImg}
                />
                <Text style={styles.optionTxt}>{item}</Text>
              </TouchableOpacity>
            );
          })}
          <PrimaryButton
            onPress={() => {
              // onGenerateImage();
              setOptionPopup(false);
            }}
            title="Generate Image"
            btnStyle={{
              marginTop: scale(20),
              backgroundColor: !selectedOption
                ? theme.text
                : theme.primaryFriend,
            }}
          />
        </View>
      </CustomAppModel>

      {isOpen && !userData.user?.isCurrentlyEnabledSubscription && (
        <SubscriptionPopup
          onNavigate={() => {
            setIsOpen(false);
          }}
          onClose={() => {
            setIsOpenPlan(false);
            setIsOpen(false);
            userState.getState().setSplashState(false);
          }}
          visible={isOpen}
          onLogin={() => {
            setIsOpen(false);
            navigation?.navigate('Login', {
              isfromPlan: true,
            });
          }}
          onSuccess={() => {
            if (selectedPhotoID.current) {
              console.log('111 SubscriptionPopup=====');
              generateAvatarPhotoFree(params?.id, selectedPhotoID.current);
            }
          }}
        />
      )}
      {isOpen && userData.user?.isCurrentlyEnabledSubscription && (
        <UpgradeCreditPopup
          onNavigate={() => {
            setIsOpen(false);
          }}
          visible={isOpen}
          onClose={() => {
            setIsOpenPlan(false);
            setIsOpen(false);
            userState.getState().setSplashState(false);
          }}
          onLogin={() => {
            setIsOpen(false);
            navigation?.navigate('Login', { email: null, isfromPlan: true });
          }}
          onSuccess={() => {
            if (selectedPhotoID.current) {
              console.log('111 UpgradeCreditPopup=====');
              generateAvatarPhotoFree(params?.id, selectedPhotoID.current);
            }
          }}
        />
      )}
      {isOpenPreview?.isOpen && (
        <ImagePreviewModal
          onClose={() => setIsOpenPreview({ isOpen: false })}
          imageData={isOpenPreview.imageData}
          onPurchase={() => {
            setIsOpenPreview({ isOpen: false });
            setIsOpen(true);
          }}
          getFree={handleGetFree}
        />
      )}

      {isOpenZoomAppearance?.image && (
        <CommonImageZoomModal
          visible={isOpenZoomAppearance?.isVisible}
          source={isOpenZoomAppearance?.image}
          onClose={() => {
            setIsOpenZoomAppearance({ isVisible: false, image: undefined });
          }}
        />
      )}

      {isOpenZoomView && (
        <CommonImageZoomModal
          item={isOpenZoomView?.item}
          originalImages={
            avatarData?.photos?.filter(item => !item.is_dummy) || []
          }
          visible={isOpenZoomView?.isVisible}
          source={isOpenZoomView?.item?.image}
          onClose={() => {
            setIsOpenZoomView({ isVisible: false, item: undefined });
          }}
          isReport
          onReportPress={(item: photos) => {
            setIsOpenZoomView({ isVisible: false, item: undefined });
            setTimeout(() => {
              setOnReportVisible({
                visible: true,
                content: {
                  cover_image: item?.image,
                  id: item?.id,
                  type: 'avatar_photo',
                },
              });
            }, 500);
          }}
        />
      )}
      {onReportVisible?.visible && (
        <CustomReportIssueModal
          // isImageItem={true}
          currentScreen={navigationRef.current?.getCurrentRoute()?.name}
          isVisible={onReportVisible?.visible}
          reportItem={onReportVisible?.content}
          onCloseModal={() => {
            setOnReportVisible({ visible: false, content: undefined });
          }}
        />
      )}
      {showMessagePopup && (
        <CustomMessagePopup
          message={{ required_tokens: 5 }}
          visible={showMessagePopup}
          onClose={() => setShowMessagePopup(false)}
          onPurchase={() => {
            setShowMessagePopup(false);
            setIsOpen(true);
          }}
          data={{ status: 'call_insufficient_tokens' }}
        />
      )}
      {isAdLoading && (
        <View style={styles.adLoadingOverlay}>
          <View style={styles.adLoadingContainer}>
            <ActivityIndicator size="large" color={theme.primaryFriend} />
            <Text style={styles.adLoadingText}>Loading Ad...</Text>
          </View>
        </View>
      )}
    </View>
  );
};

export default React.memo(AvatarDetail);

const Styles = () => {
  const theme = useThemeStore().theme;
  const containerMarginExplore = scale(10);
  const itemWidth = (screenWidth - containerMarginExplore * 2 * 2) / 3;
  return StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: '#ccc',
    },
    topImage: {
      width: SCREEN_WIDTH,
      height: SCREEN_HEIGHT,
      resizeMode: 'contain',
      backgroundColor: '#00000000',
      // backgroundColor: theme.secondaryFriend,
    },
    header: {
      position: 'absolute',
      top: verticalScale(50),
      left: scale(20),
      right: scale(20),
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    backText: {
      fontSize: scale(18),
      fontFamily: Fonts.ISemiBold,
      fontWeight: '600',
    },
    heart: {
      backgroundColor: '#FFFFFF',
      borderRadius: scale(24),
      padding: scale(12),
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 3 },
      shadowOpacity: 0.2,
      shadowRadius: 4,
      elevation: 4,
    },
    likesRow: {
      flexDirection: 'row',
      alignItems: 'center',
      alignSelf: 'flex-start',
      justifyContent: 'center',
      // marginTop: verticalScale(5),
      marginLeft: scale(-15),
    },
    icon: {
      width: scale(20),
      height: scale(20),
      resizeMode: 'contain',
    },
    avatarImageLoader: {
      alignItems: 'center',
      justifyContent: 'center',
      paddingVertical: verticalScale(15),
      paddingHorizontal: scale(16),
    },
    loaderText: {
      marginLeft: scale(8),
      fontSize: moderateScale(16),
      color: theme.primaryFriend,
      fontFamily: Fonts.ISemiBold,
    },
    info: {
      position: 'absolute',
      // bottom: '50%',
      left: scale(20),
      right: scale(20),
      alignItems: 'center',
      padding: scale(12),
      borderRadius: scale(12),
      zIndex: 10,
    },
    name: {
      fontSize: scale(20),
      fontWeight: '600',
      color: 'white',
      alignSelf: 'flex-start',
      fontFamily: Fonts.ISemiBold,
      marginLeft: scale(-15),
    },
    likes: {
      color: theme.white,
      fontSize: 15,
      fontFamily: Fonts.ISemiBold,
    },
    bottomSheetScrollView: {
      flex: 1,
    },
    scrollContentContainer: {
      flexGrow: 1,
      paddingBottom: verticalScale(150),
    },
    sheet: {
      flex: 1,
      paddingHorizontal: scale(20),
    },
    sectionTitle: {
      fontFamily: Fonts.ISemiBold,
      fontSize: scale(16),
      marginTop: verticalScale(10),
      marginBottom: verticalScale(15),
      color: theme.white,
    },
    grid: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      justifyContent: 'space-between',
      marginBottom: verticalScale(10),
    },
    item: {
      width: '47%',
      marginBottom: verticalScale(15),
    },
    label: {
      fontSize: scale(15),
      fontFamily: Fonts.ISemiBold,
      color: theme.primaryText,
    },
    value: {
      color: theme.white,
      fontSize: scale(16),
      marginTop: scale(-5),
      fontWeight: '600',
      fontFamily: Fonts.IRegular,
    },
    personality: {
      color: '#383838',
      fontSize: scale(14),
      fontFamily: Fonts.IRegular,
    },
    description: {
      color: '#6D6D6D',
      fontSize: scale(14),
      fontFamily: Fonts.IRegular,
    },
    addIconWrapper: {
      width: scale(45),
      height: scale(45),
      borderRadius: scale(8),
      justifyContent: 'center',
      alignItems: 'center',
    },
    addIcon: {
      width: scale(14),
      height: verticalScale(14),
      tintColor: '#fff',
      resizeMode: 'contain',
    },
    photosGrid: {
      // flexDirection: 'row',
      // flexWrap: 'wrap',
      // justifyContent: 'space-between',
      marginBottom: verticalScale(20),
    },
    photo: {
      width: (SCREEN_WIDTH - scale(60)) / 3,
      height: verticalScale(150),
      borderRadius: scale(10),
      marginBottom: verticalScale(10),
      resizeMode: 'cover',
    },
    iconRow: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: verticalScale(4),
    },
    itemIcon: {
      width: scale(32),
      height: scale(32),
      resizeMode: 'contain',
    },
    itemRow: {
      flexDirection: 'row',
      alignItems: 'center',
      width: '47%',
      marginBottom: verticalScale(15),
    },
    photosRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
    },
    textGroup: {
      marginLeft: scale(8),
      flexShrink: 1,
      flex: 1,
    },
    // ✅ New styles for improved No Photos UI
    noPhotosContainer: {
      backgroundColor: theme.secondaryFriend || '#d5e8ed',
      borderRadius: scale(16),
      padding: scale(20),
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: verticalScale(200),
      borderWidth: 1,
      borderColor: theme.primaryFriend,
      borderStyle: 'dashed',
    },
    noPhotosContent: {
      alignItems: 'center',
      justifyContent: 'center',
    },
    noPhotosIconContainer: {
      width: scale(60),
      height: scale(60),
      borderRadius: scale(30),
      backgroundColor: theme.primaryFriend,
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: verticalScale(16),
    },
    noPhotosIcon: {
      width: scale(28),
      height: scale(28),
      tintColor: '#FFFFFF',
      resizeMode: 'contain',
    },
    noPhotosTitle: {
      fontSize: scale(18),
      fontWeight: '600',
      fontFamily: Fonts.ISemiBold || 'System',
      color: theme.heading || '#2C3E50',
      marginBottom: verticalScale(8),
      textAlign: 'center',
    },
    noPhotosSubtitle: {
      fontSize: scale(14),
      fontWeight: '400',
      fontFamily: Fonts.IRegular || 'System',
      color: '#6D6D6D',
      textAlign: 'center',
      lineHeight: scale(20),
      marginBottom: verticalScale(20),
      paddingHorizontal: scale(10),
    },
    generateButton: {
      backgroundColor: theme.primaryFriend || '#007AFF',
      borderRadius: scale(12),
      paddingVertical: verticalScale(12),
      paddingHorizontal: scale(24),
      shadowColor: '#000',
      shadowOffset: {
        width: 0,
        height: 2,
      },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 3,
    },
    generateButtonContent: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
    },
    generateButtonIcon: {
      width: scale(16),
      height: scale(16),
      tintColor: '#FFFFFF',
      resizeMode: 'contain',
      marginRight: scale(8),
    },
    generateButtonText: {
      fontSize: scale(16),
      // fontWeight: '600',
      fontFamily: Fonts.ISemiBold || 'System',
      color: '#FFFFFF',
      textAlign: 'center',
    },
    // Existing FAB styles
    fabWrapper: {
      position: 'absolute',
      bottom: verticalScale(28),
      left: 0,
      right: 0,
      alignItems: 'center',
      zIndex: 999,
      paddingBottom: 20,
    },
    fabContainer: {
      backgroundColor: '#ffffff80',
      borderColor: theme.white,
      borderWidth: 1,
      borderRadius: scale(100),
      paddingHorizontal: scale(10),
      paddingVertical: scale(10),
      shadowColor: theme.primaryLightFriend,
      shadowOffset: {
        width: 0,
        height: 2,
      },
      shadowOpacity: 0.25,
      shadowRadius: 10,
      elevation: 5,
      alignItems: 'center',
      marginVertical: 10,
    },
    chatFab: {
      height: scale(50),
      paddingHorizontal: 15,
      gap: 10,
      borderRadius: scale(30),
      justifyContent: 'center',
      alignItems: 'center',
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 3 },
      shadowOpacity: 0.2,
      shadowRadius: 4,
      elevation: 6,
      backgroundColor: '#00C4FF',
      flexDirection: 'row',
    },
    msgText: {
      fontSize: 15,
      color: theme.white,
      fontFamily: Fonts.IBold,
    },
    callFab: {
      width: scale(50),
      height: scale(50),
      borderRadius: scale(30),
      backgroundColor: customColors.green,
      justifyContent: 'center',
      alignItems: 'center',
      shadowOffset: { width: 0, height: 3 },
      shadowOpacity: 0.2,
      shadowRadius: 4,
      elevation: 6,
    },
    backArrow: {
      width: scale(26),
      height: scale(26),
      tintColor: customColors.black,
      transform: [{ rotate: '180deg' }],
      resizeMode: 'contain',
    },
    backContainer: {
      width: scale(45),
      height: scale(45),
      borderRadius: scale(50),
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: customColors.white,
    },
    linearContainer: {
      width: scale(50),
      height: scale(50),
      borderRadius: scale(50),
      justifyContent: 'center',
      alignItems: 'center',
    },
    fabIcon: {
      width: scale(26),
      height: scale(26),
      resizeMode: 'contain',
    },
    skipTxt: {
      marginTop: scale(5),
      fontSize: scale(16),
      color: theme.heading,
      alignSelf: 'center',
      fontFamily: Fonts.IMedium,
    },
    rowExplore: {
      flex: 1,
      justifyContent: 'space-between',
      paddingBottom: containerMarginExplore,
    },
    selectionContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      marginVertical: scale(5),
    },
    checkImg: {
      width: scale(20),
      height: scale(20),
      resizeMode: 'cover',
      marginRight: scale(10),
      tintColor: theme.primaryFriend,
    },
    optionTxt: {
      fontSize: scale(15),
      color: theme.text,
      fontFamily: Fonts.IRegular,
    },
    renderAdd: {
      width: itemWidth - scale(10),
      aspectRatio: 0.75,
      borderRadius: scale(15),
      overflow: 'hidden',
      backgroundColor: theme.primaryFriend,
      justifyContent: 'center',
      alignItems: 'center',
    },
    loadingImage: {
      ...StyleSheet.absoluteFillObject,
      width: '100%',
      height: '100%',
      zIndex: -1,
    },
    loadingImageBlur: {
      ...StyleSheet.absoluteFillObject,
      width: '100%',
      height: '100%',
      // zIndex: -2,
    },
    lockIconContainer: {
      justifyContent: 'center',
      alignItems: 'center',
      marginBottom: scale(50),
    },
    lockIconBackground: {
      backgroundColor: 'rgba(0, 0, 0, 0.7)',
      borderRadius: scale(20),
      paddingHorizontal: scale(24),
      paddingVertical: scale(20),
      alignItems: 'center',
      justifyContent: 'center',
      shadowColor: '#000',
      shadowOffset: {
        width: 0,
        height: 4,
      },
      shadowOpacity: 0.3,
      shadowRadius: 4.65,
      elevation: 8,
      // minWidth: scale(160),
    },
    lockIcon: {
      width: scale(40),
      height: scale(40),
      tintColor: '#FFFFFF',
      marginBottom: scale(12),
      resizeMode: 'contain',
    },
    lockText: {
      color: '#FFFFFF',
      fontSize: scale(18),
      fontFamily: Fonts.ISemiBold,
      textAlign: 'center',
      marginBottom: scale(8),
    },
    unlockText: {
      color: '#FFFFFF',
      fontSize: scale(14),
      fontFamily: Fonts.IRegular,
      textAlign: 'center',
      opacity: 0.9,
    },
    // Add these styles to your Styles function (around line 1350):
    adLoadingOverlay: {
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.7)',
      justifyContent: 'center',
      alignItems: 'center',
      zIndex: 9999,
    },
    adLoadingContainer: {
      backgroundColor: theme.white,
      borderRadius: scale(16),
      padding: scale(24),
      alignItems: 'center',
      minWidth: scale(200),
      shadowColor: '#000',
      shadowOffset: {
        width: 0,
        height: 4,
      },
      shadowOpacity: 0.3,
      shadowRadius: 4.65,
      elevation: 8,
    },
    adLoadingText: {
      marginTop: verticalScale(16),
      fontSize: scale(16),
      fontFamily: Fonts.ISemiBold,
      color: theme.heading,
      textAlign: 'center',
    },
    adLoadingSubtext: {
      marginTop: verticalScale(8),
      fontSize: scale(14),
      fontFamily: Fonts.IRegular,
      color: theme.text,
      textAlign: 'center',
      opacity: 0.7,
    },
  });
};
