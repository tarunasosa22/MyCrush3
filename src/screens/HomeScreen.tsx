import React, { useEffect, useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  StatusBar,
  Platform,
  Alert,
  PermissionsAndroid,
  Linking,
  TouchableOpacity,
  Image,
  ImageBackground,
  FlatList,
  ActivityIndicator,
} from 'react-native';
import { scale, verticalScale } from '../utils/Scale';
import Fonts from '../utils/fonts';
import { useThemeStore } from '../store/themeStore';
import {
  getAdminSetting,
  likeDislikeAPI,
  getUserDetail,
  userListGlobalAvatar,
  setEventTrackinig,
} from '../api/user';
import {
  NavigationProp,
  useIsFocused,
  useNavigation,
} from '@react-navigation/native';
import type { RootStackParamList } from '../types/navigation';
import CustomHeader from '../components/headers/CustomHeader';
import { t } from 'i18next';
import { TranslationKeys } from '../lang/TranslationKeys';
import CustomCoinView from '../components/CustomCoinView';
import SubscriptionPopup from '../components/SubscriptionPopup';
import { userState } from '../store/userStore';
import CommonEmptyView from '../components/CommonEmptyView';
import IMAGES from '../assets/images';
import UpgradeCreditPopup from '../components/UpgradeCreditPopup';
import { request, PERMISSIONS, RESULTS } from 'react-native-permissions';
import CustomAgreementPopup from '../components/CustomAgreementPopup';
import CustomMessagePopup from '../components/CustomMessagePopup';
import { EVENT_NAME } from '../constants';
import CustomLikePopup from '../components/CustomLikePopup';
import FastImage from 'react-native-fast-image';
import EmptyMatchesState from '../components/CustomEmptyPublicMatches';
import NoAdsIAPPopup from '../components/NoAdsIAPPopup';
import { logFirebaseEvent } from '../utils/HelperFunction';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import CustomHomeAvatarCard from '../components/skeletons/CustomHomeAvatarCard';
// import { BlurView } from '@react-native-community/blur';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');
export const CARD_WIDTH = SCREEN_WIDTH - scale(40);
export const CARD_HEIGHT = SCREEN_HEIGHT * 0.61;

interface AvatarItem {
  id: number | string;
  name?: string;
  image?: string;
  cover_image?: string;
  age?: number;
  tag?: string;
  is_liked?: boolean;
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

const HomeScreen: React.FC = () => {
  const { theme, setTheme } = useThemeStore.getState();
  const [loading, setLoading] = useState<boolean>(false);
  const [isOpen, setIsOpen] = useState(false);
  const [isAdsOpen, setIsAdsOpen] = useState(false);
  const [isReferesh, setIsReferesh] = useState(false);
  const [isNextPage, setIsNextPage] = useState(false);
  const [page, setPage] = useState(1);
  const [homeAvatarList, setHomeAvatarListState] = useState<AvatarItem[]>([]);
  const [showPrivacyPolicy, setShowPrivacyPolicy] = useState(false);
  const [showMessagePopup, setShowMessagePopup] = useState(false);
  const [showLike, setShowLike] = useState(false);

  const navigation =
    useNavigation<NavigationProp<RootStackParamList, 'Home'>>();
  const {
    userData,
    setUserData,
    isOpenPlan,
    isAdsOpenPlan,
    setIsAdsOpenPlan,
    setIsOpenPlan,
    setIsAgreedPolicy,
    isAgreedPolicy,
    setFreeMessageCount,
    free_public_avatars,
    setFreePublicAvatars,
    isCallEnded,
    callEndReason,
    setIsCallEnded,
    setCallEndReason,
  } = userState.getState();

  const isScreenFocused = useIsFocused();
  const hasAvatarsLoaded = useRef(false);
  const homeStyles = HomeScreenStyles();

  useEffect(() => {
    if (isCallEnded && callEndReason) {
      if (callEndReason === 'insufficient_tokens') {
        setShowMessagePopup(true);
      } else {
        Alert.alert('Call Ended', callEndReason);
      }
      setIsCallEnded(false);
      setCallEndReason('');
    }
  }, [isCallEnded, callEndReason]);

  useEffect(() => {
    const currentUserState = userState.getState();
    const storedAvatarList = currentUserState?.homeAvatarList ?? [];

    if (storedAvatarList.length > 0) {
      setHomeAvatarListState(storedAvatarList);
      hasAvatarsLoaded.current = true;
    }
  }, [isScreenFocused]);

  useEffect(() => {
    console.log('isAdsOpen 2', isAdsOpen, isAdsOpenPlan);
    if (isScreenFocused && isAdsOpenPlan) {
      setIsAdsOpen(isAdsOpenPlan);
      setIsAdsOpenPlan(isAdsOpenPlan);
    } else if (isScreenFocused && isOpenPlan) {
      setIsOpenPlan(isOpenPlan);
      setIsOpen(isOpenPlan);
    } else if (isScreenFocused && isAgreedPolicy) {
      setTimeout(() => {
        setShowPrivacyPolicy(isAgreedPolicy);
      }, 200);
    }
  }, [isOpenPlan, isScreenFocused, isAgreedPolicy, isAdsOpenPlan]);

  useEffect(() => {
    if (!isAgreedPolicy) {
      setIsAdsOpen(true);
    }
  }, []);

  useEffect(() => {
    if (isScreenFocused) {
      setTheme('girlfriend');
      getUserDetail().then(async res => {
        const newUserData = {
          ...userData,
          user: res?.data?.data?.user,
        };
        setUserData(newUserData);
      });

      getAdminSetting().then(res => {
        setFreeMessageCount(res?.data?.data?.free_message_count);
        setFreePublicAvatars(res?.data?.data?.free_public_avatars);
      });
    }
  }, [isScreenFocused, userData]);

  useEffect(() => {
    const currentUserState = userState.getState();
    const hasStoredAvatars =
      currentUserState?.homeAvatarList &&
      currentUserState.homeAvatarList.length > 0;

    if (
      !hasStoredAvatars &&
      !hasAvatarsLoaded.current &&
      userData.access_token
    ) {
      setLoading(true);
      setPage(1);
      fetchHomeAvatarsData(1);
    } else if (hasAvatarsLoaded.current && userData.access_token) {
      setLoading(true);
      setPage(1);
      hasAvatarsLoaded.current = false;
      fetchHomeAvatarsData(1);
    }
  }, [userData?.user?.id]);

  const fetchHomeAvatarsData = async (isPage?: number) => {
    try {
      const avatarsResponse = await userListGlobalAvatar(
        isPage ? isPage : page,
      );
      const avatarResults = avatarsResponse?.data?.data?.results || [];
      const hasNextPage = avatarsResponse?.data?.data?.next;
      const currentUserState = userState.getState();

      const updatedAvatarList =
        isPage === 1
          ? avatarResults
          : [...(currentUserState.homeAvatarList || []), ...avatarResults];

      currentUserState.setHomeAvatarList(updatedAvatarList);
      setIsNextPage(hasNextPage !== null);
      setPage(isPage ? isPage + 1 : hasNextPage !== null ? page + 1 : page);
      setHomeAvatarListState(updatedAvatarList);
      hasAvatarsLoaded.current = true;
      setLoading(false);
    } catch (error) {
      console.error('❌ Error fetching homeAvatarList:', error);
      setLoading(false);
    }
  };

  const requestMicrophoneAccess = async (): Promise<boolean> => {
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

  const handleLoadMore = () => {
    if (isNextPage && !loading) {
      setLoading(true);
      fetchHomeAvatarsData();
    }
  };

  const handleAvatarLike = (item: AvatarItem) => {
    if (userData?.isGuestUser) {
      navigation.navigate('Login', { isfromPlan: true });
      return;
    }
    setShowLike(true);
    if (item.is_liked) {
      return;
    }
    const currentUserState = userState.getState();
    const updatedAvatarList = homeAvatarList.map((favitem: AvatarItem) =>
      favitem.id === item.id ? { ...favitem, is_liked: true } : favitem,
    );
    currentUserState.setHomeAvatarList(updatedAvatarList);
    setHomeAvatarListState(updatedAvatarList);

    likeDislikeAPI(Number(item.id));
    logFirebaseEvent(EVENT_NAME.LIKE_FROM_HOME, {
      avatar: item.id,
      user_id: userData?.user?.id,
    });
    setEventTrackinig({ event_type: EVENT_NAME.LIKE_FROM_HOME });
  };

  const handleAvatarDislike = (item: AvatarItem) => {
    console.log('Disliked:', item.name);
  };

  const handleCallPress = async (item: AvatarItem) => {
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

    const hasPermission = await requestMicrophoneAccess();
    if (!hasPermission) {
      Alert.alert(
        'Permission Required',
        'Microphone access is needed to make a call.',
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Go to Settings', onPress: () => Linking.openSettings() },
        ],
      );
      return;
    }

    navigation.navigate('VoiceCall', {
      user: {
        name: item.name ?? '',
        id: item.id,
        image: item.cover_image ?? '',
      },
    });

    logFirebaseEvent(EVENT_NAME.CALL_FROM_HOME_SCREEN, {
      avatar_id: item.id,
      user_id: userData?.user?.id,
    });
    setEventTrackinig({ event_type: EVENT_NAME.CALL_FROM_HOME_SCREEN });
  };

  const handleChatPress = (item: AvatarItem) => {
    if (userData?.isGuestUser) {
      navigation.navigate('Login', { isfromPlan: true });
      return;
    }
    navigation.navigate('Chat', {
      user: {
        name: item.name ?? '',
        id: item.id,
        image: item.cover_image ?? '',
      },
      chat_id: item?.chat?.chat_id,
    });
    logFirebaseEvent(EVENT_NAME.CHAT_FROM_HOME_SCREEN, {
      avatar: item.id,
      user_id: userData?.user?.id,
    });
    setEventTrackinig({ event_type: EVENT_NAME.CHAT_FROM_HOME_SCREEN });
  };

  const handleLikePress = (item: AvatarItem, event?: any) => {
    console.log('Like pressed', item);
    if (userData?.isGuestUser) {
      navigation.navigate('Login', { isfromPlan: true });
      return;
    }

    let likeAnimationX = 100;
    let likeAnimationY = 300;

    if (event && event.nativeEvent) {
      likeAnimationX =
        event.nativeEvent.pageX ||
        event.nativeEvent.locationX ||
        likeAnimationX;
      likeAnimationY =
        event.nativeEvent.pageY ||
        event.nativeEvent.locationY ||
        likeAnimationY;
    }

    const currentUserState = userState.getState();

    // Update both store and local state to trigger re-render
    const updatedAvatarList = homeAvatarList.map((favitem: AvatarItem) =>
      favitem.id === item.id
        ? { ...favitem, is_liked: !favitem.is_liked }
        : favitem,
    );
    currentUserState.setHomeAvatarList(updatedAvatarList);
    setHomeAvatarListState(updatedAvatarList);

    likeDislikeAPI(Number(item.id)).then(res => {
      console.log('likeDislikeAPI', res);
    });

    logFirebaseEvent(EVENT_NAME.LIKE_FROM_HOME, {
      avatar: item.id,
      user_id: userData?.user?.id,
    });
    setEventTrackinig({ event_type: EVENT_NAME.LIKE_FROM_HOME });

    if (!item.is_liked) {
      // createFlyingLike(likeAnimationX, likeAnimationY);
      setShowLike(true);
    }
  };
  const shouldBlurAvatars = !free_public_avatars;

  const navigateToAvatarDetail = (item: AvatarItem) => {
    if (shouldBlurAvatars && userData?.isGuestUser) {
      navigation.navigate('Login', { isfromPlan: true });
      return;
    }

    navigation.navigate('AvatarDetail', {
      item,
      id: item.id,
      image: item.cover_image,
      name: item.name,
      isBackAllowed: true,
      isBlur: shouldBlurAvatars,
    });
    logFirebaseEvent(EVENT_NAME.VIEW_AVATAR_DETAIL_FROM_HOME, {
      avatar: item?.id,
      user_id: userData?.user?.id,
    });
    setEventTrackinig({ event_type: EVENT_NAME.VIEW_AVATAR_DETAIL_FROM_HOME });
  };

  return (
    <View style={homeStyles.screenContainer}>
      <StatusBar
        translucent
        backgroundColor={theme.primaryBackground}
        barStyle="dark-content"
      />
      <CustomHeader
        headerLeftComponent={
          <Text
            style={[homeStyles.headerTitle, { color: theme.primaryFriend }]}
          >
            {t(TranslationKeys.AI_CRUSH)}
          </Text>
        }
        headerRightStyle={{ alignSelf: 'center' }}
        containerStyle={{ paddingBottom: 5 }}
        headerRightComponent={
          <CustomCoinView
            coinCount={userData.user?.tokens}
            onPress={() => {
              if (userData?.isGuestUser) {
                navigation.navigate('Login', {
                  email: null,
                  isfromPlan: true,
                });
              } else {
                setIsOpenPlan(true);
                setIsOpen(true);
              }
            }}
          />
        }
      />
      <View style={homeStyles.contentContainer}>
        {loading && homeAvatarList.length === 0 ? (
          <View style={homeStyles.loadingViewContainer}>
            <ActivityIndicator size="large" color={theme.primaryFriend} />
            <Text style={homeStyles.loadingTextStyle}>Loading...</Text>
          </View>
        ) : homeAvatarList.length === 0 ? (
          <CommonEmptyView
            emptyImage={IMAGES.noAvatar}
            header={'No Avatars Found'}
            subHeader={'No avatars match with your current selection.'}
          />
        ) : (
          <FlatList
            data={homeAvatarList}
            keyExtractor={(item, index) => `${item.id}_${index}`}
            renderItem={({ item }) => (
              <CustomHomeAvatarCard
                item={item}
                onCardPress={() => navigateToAvatarDetail(item)}
                onCallPress={() => handleCallPress(item)}
                onChatPress={() => handleChatPress(item)}
                onLikePress={() => handleLikePress(item)}
                onDislikePress={() => handleAvatarDislike(item)}
                isBlur={shouldBlurAvatars}
                isLike={item.is_liked}
              />
            )}
            contentContainerStyle={homeStyles.listContainer}
            showsVerticalScrollIndicator={false}
            onEndReached={handleLoadMore}
            onEndReachedThreshold={2}
            ListEmptyComponent={
              !loading ? (
                <EmptyMatchesState
                  onRefresh={() => {
                    setPage(1);
                    fetchHomeAvatarsData(1);
                  }}
                  loading={loading}
                />
              ) : null
            }
            ListFooterComponent={
              loading && homeAvatarList.length > 0 ? (
                <View style={homeStyles.loadingFooter}>
                  <ActivityIndicator size="large" color={theme.primaryFriend} />
                  <Text style={homeStyles.loadingTextStyle}>
                    Loading more...
                  </Text>
                </View>
              ) : null
            }
          />
        )}
      </View>

      {isOpen && !userData.user?.isCurrentlyEnabledSubscription && (
        <SubscriptionPopup
          onNavigate={() => setIsOpen(false)}
          onClose={() => {
            setIsOpenPlan(false);
            setIsOpen(false);
            userState.getState().setSplashState(false);
          }}
          visible={isOpen}
          onLogin={() => {
            setIsOpen(false);
            navigation?.navigate('Login', { email: null, isfromPlan: true });
          }}
          onSuccess={() => {}}
        />
      )}

      {isOpen && userData.user?.isCurrentlyEnabledSubscription && (
        <UpgradeCreditPopup
          onNavigate={() => setIsOpen(false)}
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
          onSuccess={() => {}}
        />
      )}

      <CustomAgreementPopup
        visible={showPrivacyPolicy}
        onClose={() => setShowPrivacyPolicy(false)}
        onAgree={() => {
          setShowPrivacyPolicy(false);
          setIsAgreedPolicy(false);
          // setTimeout(() => {
          //   if (
          //     Number(userData?.user?.total_tokens) <= 0 &&
          //     !userData.isGuestUser
          //   ) {
          //     setIsOpen(true);
          //   }
          // }, 500);
        }}
      />

      {/* CustomMessagePopup popup */}

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

      {/* LikePopup popup */}

      <CustomLikePopup show={showLike} onEnd={() => setShowLike(false)} />

      {/* NoAdsIAPPopup popup */}

      {/* {isAdsOpen && !userState.getState().isAdsPlanPurchasedUser && (
          <NoAdsIAPPopup
            onClose={() => {
              setIsAdsOpenPlan(false);
              setIsAdsOpen(false);

              if (userState.getState().isOpenSubscriptionPlanAfterAdsPlan) {
                setTimeout(() => {
                  if (
                    Number(userData?.user?.total_tokens) <= 0 &&
                    !userData.isGuestUser
                  ) {
                    setIsOpen(true);
                  }
                  userState
                    .getState()
                    .setIsOpenSubscriptionPlanAfterAdsPlan(false);
                }, 500);
              }
            }}
            onLogin={() => {
              setIsAdsOpen(false);
              navigation?.navigate('Login', {
                email: null,
                isFromAdsPlan: true,
              });
            }}
            onNavigate={() => {
              setIsAdsOpen(false);
            }}
            onSuccess={() => {}}
            visible={isAdsOpen}
          />
        )} */}
    </View>
  );
};

// Avatar Card Component (Vertical Scrollable)
const AvatarCard: React.FC<{
  item: AvatarItem;
  onCardPress: () => void;
  onCallPress: () => void;
  onChatPress: () => void;
  onLikePress: () => void;
  onDislikePress: () => void;
  isBlur: boolean;
  isLike?: boolean;
}> = ({
  item,
  onCardPress,
  onCallPress,
  onChatPress,
  onLikePress,
  onDislikePress,
  isLike,
  isBlur,
}) => {
  const { theme } = useThemeStore.getState();
  const avatarCharacterLabel =
    item?.categories?.find((cat: any) => cat.label === 'Character')
      ?.options?.[0]?.label ?? null;

  const [hasImageError, setImageError] = useState(false);
  const [isImageLoading, setImageLoading] = useState(true);
  const homeStyles = HomeScreenStyles();

  return (
    <View style={homeStyles.avatarCard}>
      <TouchableOpacity
        activeOpacity={0.95}
        onPress={onCardPress}
        style={homeStyles.cardTouchableArea}
      >
        <View style={homeStyles.cardImageWrapper}>
          {(isImageLoading || hasImageError) && (
            <View style={homeStyles.imagePlaceholderContainer}>
              <ImageBackground
                source={IMAGES.app_splash_view}
                style={homeStyles.placeholderImageStyle}
                resizeMode="cover"
                blurRadius={isBlur ? 10 : 0}
              />
            </View>
          )}
          <ImageBackground
            source={
              item.cover_image || item.image
                ? {
                    uri: item.cover_image || item.image,
                  }
                : IMAGES.app_splash_view
            }
            blurRadius={isBlur ? 10 : 0}
            style={[
              homeStyles.cardImageStyle,
              (isImageLoading || hasImageError) && { opacity: 0 },
            ]}
            resizeMode="cover"
            onLoadStart={() => setImageLoading(true)}
            onLoadEnd={() => setImageLoading(false)}
            onError={() => {
              setImageError(true);
              setImageLoading(false);
            }}
          >
            <View style={homeStyles.cardActionButtonsContainer}>
              <TouchableOpacity
                onPress={() => (isLike ? onDislikePress() : onLikePress())}
              >
                <Image
                  source={
                    isLike ? IMAGES.avatar_unlike_icon : IMAGES.avatar_like_icon
                  }
                  style={[homeStyles.actionIconImage]}
                />
              </TouchableOpacity>
              <TouchableOpacity
                style={{
                  backgroundColor: theme.white,
                  borderRadius: scale(20),
                }}
                onPress={onCallPress}
              >
                <Image
                  source={IMAGES.avatar_call_icon}
                  style={homeStyles.actionIconImage}
                />
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  homeStyles.actionIconButton,
                  { backgroundColor: theme.boyFriend },
                ]}
                onPress={onChatPress}
              >
                <Image
                  source={IMAGES.Hchat}
                  style={homeStyles.chatActionIcon}
                />
              </TouchableOpacity>
            </View>
          </ImageBackground>
        </View>

        {/* Character Tag */}
        {avatarCharacterLabel && !isBlur && (
          <View style={homeStyles.characterLabelTag}>
            <Text style={homeStyles.characterLabelText}>
              {avatarCharacterLabel}
            </Text>
          </View>
        )}

        {!isBlur && (
          <View style={homeStyles.avatarInfoContainer}>
            <View style={homeStyles.avatarNameContainer}>
              <Text style={homeStyles.avatarNameText}>{item.name}</Text>
              {item.age && (
                <Text style={homeStyles.avatarAgeText}>AGE: {item.age}</Text>
              )}
            </View>
          </View>
        )}

        {isBlur && (
          <View style={homeStyles.premiumLockContainer}>
            <View style={homeStyles.premiumLockBackground}>
              <Image
                source={IMAGES.lock}
                style={homeStyles.premiumLockIcon}
                resizeMode="contain"
              />
              <Text style={homeStyles.premiumUnlockText}>{`Tap to view`}</Text>
            </View>
          </View>
        )}
      </TouchableOpacity>
    </View>
  );
};

export default HomeScreen;

const HomeScreenStyles = () => {
  const theme = useThemeStore().theme;
  const insets = useSafeAreaInsets();
  return StyleSheet.create({
    screenContainer: {
      flex: 1,
    },
    headerTitle: {
      fontSize: scale(32),
      fontFamily: Fonts.ISemiBold,
    },
    headerRightSection: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    contentContainer: {
      flex: 1,
      paddingTop: verticalScale(10),
      backgroundColor: theme.primaryBackground,
    },
    loadingViewContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
    },
    loadingTextStyle: {
      fontSize: scale(16),
      fontFamily: Fonts.IRegular,
      color: theme.primaryFriend,
      marginTop: verticalScale(10),
    },
    listContainer: {
      // paddingTop: verticalScale(20),
      paddingBottom: insets.bottom + verticalScale(60),
      paddingHorizontal: scale(20),
    },
    avatarCard: {
      width: CARD_WIDTH,
      height: CARD_HEIGHT,
      borderRadius: scale(20),
      overflow: 'hidden',
      // marginBottom: verticalScale(20),
      alignSelf: 'center',
    },
    loadingFooter: {
      paddingVertical: verticalScale(20),
      alignItems: 'center',
    },
    cardTouchableArea: {
      flex: 1,
    },
    cardImageWrapper: {
      width: '100%',
      height: '95%',
      borderRadius: scale(20),
      borderWidth: 1,
      borderColor: theme.heading,
      overflow: 'hidden',
    },
    cardImageStyle: {
      width: '100%',
      height: '100%',
      // borderRadius: scale(20),
      overflow: 'hidden',
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.25,
      shadowRadius: 1.84,
      justifyContent: 'flex-end',
      // elevation: 1,
    },
    imagePlaceholderContainer: {
      ...StyleSheet.absoluteFillObject,
      backgroundColor: '#f0f0f0',
      justifyContent: 'center',
      alignItems: 'center',
      borderRadius: scale(20),
      overflow: 'hidden',
    },
    placeholderImageStyle: {
      width: '100%',
      height: '100%',
    },
    characterLabelTag: {
      position: 'absolute',
      top: scale(15),
      right: scale(15),
      backgroundColor: '#2C2C2C99',
      borderWidth: 1,
      borderColor: '#FFFFFFAA',
      paddingHorizontal: scale(16),
      paddingVertical: verticalScale(8),
      borderRadius: scale(20),
    },
    characterLabelText: {
      color: '#FFFFFF',
      fontSize: scale(14),
      fontWeight: '600',
      fontFamily: Fonts.IRegular,
    },
    avatarInfoContainer: {
      position: 'absolute',
      top: scale(5),
      left: scale(5),
      borderRadius: scale(15),
      paddingHorizontal: scale(20),
      paddingVertical: verticalScale(15),
    },
    avatarNameContainer: {
      marginBottom: verticalScale(5),
    },
    avatarNameText: {
      fontSize: scale(15),
      fontWeight: '600',
      fontFamily: Fonts.IBold,
      color: '#fff',
    },
    avatarAgeText: {
      fontSize: scale(12),
      color: '#fff',
      fontFamily: Fonts.IRegular,
      letterSpacing: scale(1),
      marginTop: verticalScale(6),
    },
    premiumLockContainer: {
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      justifyContent: 'center',
      alignItems: 'center',
      zIndex: 999999,
    },
    premiumLockBackground: {
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
    premiumLockIcon: {
      width: scale(40),
      height: scale(40),
      tintColor: '#FFFFFF',
      marginBottom: scale(12),
      resizeMode: 'contain',
    },
    premiumLockText: {
      color: '#FFFFFF',
      fontSize: scale(18),
      fontFamily: Fonts.ISemiBold,
      textAlign: 'center',
      marginBottom: scale(8),
    },
    premiumUnlockText: {
      color: '#FFFFFF',
      fontSize: scale(14),
      fontFamily: Fonts.IRegular,
      textAlign: 'center',
      opacity: 0.9,
    },
    cardActionButtons: {
      position: 'absolute',
      bottom: -50,
      right: 0,
      left: 0,
      marginHorizontal: scale(40),
      // width: scale(120),
      // borderTopLeftRadius: scale(20),
      borderRadius: scale(20),
      overflow: 'hidden',
      zIndex: 999,
    },
    blurOverlayContainer: {
      ...StyleSheet.absoluteFillObject,
      borderTopLeftRadius: scale(20),
      borderBottomLeftRadius: scale(20),
      backgroundColor: '#0000003D',
    },
    blurOverlayStyle: {
      ...StyleSheet.absoluteFillObject,
      backgroundColor: '#2C2C2C26',
      borderTopLeftRadius: scale(20),
      borderBottomLeftRadius: scale(20),
    },
    actionIconsGroup: {
      flex: 1,
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingVertical: verticalScale(12),
    },
    actionIconButton: {
      width: scale(35),
      height: scale(35),
      backgroundColor: '#FFFFFF3D',
      borderRadius: 50,
      justifyContent: 'center',
      alignItems: 'center',
    },
    disabledActionIcon: {},
    actionIconImage: {
      width: scale(35),
      height: scale(35),
      resizeMode: 'contain',
    },
    chatActionIcon: {
      width: scale(20),
      height: scale(20),
      resizeMode: 'contain',
    },
    cardActionButtonsContainer: {
      flexDirection: 'row',
      justifyContent: 'center',
      alignItems: 'center',
      alignSelf: 'center',
      paddingVertical: verticalScale(10),
      marginBottom: verticalScale(10),
      gap: scale(15),
      paddingHorizontal: scale(10),
      backgroundColor: theme.white + 50,
      borderWidth: 1,
      borderColor: '#FFFFFF73',
      borderRadius: scale(50),
      zIndex: 99,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.25,
      shadowRadius: 1.84,

      elevation: 5,
    },
    cardActionButton: {
      width: scale(56),
      height: scale(56),
      borderRadius: scale(28),
      justifyContent: 'center',
      alignItems: 'center',
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.25,
      shadowRadius: 3.84,
      elevation: 5,
    },
    dislikeActionButton: {
      backgroundColor: '#fff',
    },
    superLikeActionButton: {
      backgroundColor: '#fff',
    },
    likeActionButton: {
      backgroundColor: '#FF4458',
    },
    boostActionButton: {
      backgroundColor: '#fff',
    },
    actionButtonIcon: {
      width: scale(28),
      height: scale(28),
      resizeMode: 'contain',
    },
    emptyCardsContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
    },
    emptyCardsText: {
      fontSize: scale(20),
      fontFamily: Fonts.IBold,
      color: '#666',
      marginBottom: verticalScale(20),
    },
    refreshCardsButton: {
      backgroundColor: '#FF4458',
      paddingHorizontal: scale(30),
      paddingVertical: verticalScale(12),
      borderRadius: scale(25),
    },
    refreshCardsButtonText: {
      color: '#fff',
      fontSize: scale(16),
      fontFamily: Fonts.IBold,
    },
  });
};
