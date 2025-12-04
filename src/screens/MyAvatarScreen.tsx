import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  RefreshControl,
  ActivityIndicator,
  Alert,
  Linking,
  PermissionsAndroid,
  Platform,
} from 'react-native';
import { scale, verticalScale } from '../utils/Scale';
import Fonts from '../utils/fonts';
import { useThemeStore } from '../store/themeStore';
import { getUserDetail, myAvatarList, setEventTrackinig } from '../api/user';
import { useIsFocused, useNavigation } from '@react-navigation/native';
import type { StackNavigationProp } from '@react-navigation/stack';
import type { RootStackParamList } from '../types/navigation';
import CustomHeader from '../components/headers/CustomHeader';
import { t } from 'i18next';
import { TranslationKeys } from '../lang/TranslationKeys';
import CustomCoinView from '../components/CustomCoinView';
import CommonHomeAvatar from '../components/CommonHomeAvatar';
import IMAGES from '../assets/images';
import CommonEmptyView from '../components/CommonEmptyView';
import { userState } from '../store/userStore';
import SubscriptionPopup from '../components/SubscriptionPopup';
import UpgradeCreditPopup from '../components/UpgradeCreditPopup';
import { PERMISSIONS, request, RESULTS } from 'react-native-permissions';
import LoadBannerAd from '../components/ads/LoadBannerAd';
import CustomMessagePopup from '../components/CustomMessagePopup';
import { logFirebaseEvent } from '../utils/HelperFunction';
import { EVENT_NAME } from '../constants';
import { useAdsStore } from '../store/useAdsStore';
import MyAvatarSkeleton from '../components/skeletons/MyAvatarSkeleton';
import { BannerAdSize } from 'react-native-google-mobile-ads';

interface AvatarItem {
  id: number | string;
  name?: string;
  image?: string;
  cover_image?: string;
  age?: number;
  tag?: string;
  isLike?: boolean;
  persona_type?: string;
  isEmpty?: boolean;
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

type NavigationProp = StackNavigationProp<RootStackParamList, 'MyAvatar'>;

const MyAvatarScreen: React.FC = () => {
  const theme = useThemeStore(state => state.theme);
  const [loading, setLoading] = useState<boolean>(true);
  const navigation = useNavigation<NavigationProp>();
  const [isReferesh, setIsReferesh] = useState(false);
  const [isNextPage, setIsNextPage] = useState(false);
  const [page, setPage] = useState(1);
  const {
    setMyFavoritesList,
    myFavoritesList,
    setMyAvatars,
    myAvatars,
    userData,
    setUserData,
    isOpenPlan,
    setIsOpenPlan,
    isCallEnded,
    callEndReason,
    setIsCallEnded,
    setCallEndReason,
  } = userState?.getState();
  const [isOpen, setIsOpen] = useState(false);
  const [myAvatarListState, setMyAvatarListState] = useState<AvatarItem[]>([]);
  const [favoritesList, setFavoritesListState] = useState<AvatarItem[]>([]);
  const [isFooterLoading, setIsFooterLoading] = useState(false);
  const [showMessagePopup, setShowMessagePopup] = useState(false);
  const focus = useIsFocused();
  const styles = MyAvatarScreenStyles();
  const { remoteData } = useAdsStore.getState();

  useEffect(() => {
    if (focus) {
      getUserDetail().then(async res => {
        const newUserData = {
          ...userData,
          user: res?.data?.data?.user,
        };
        setUserData(newUserData);
      });
    }
  }, [focus]);

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

  useEffect(() => {
    if (focus && isOpenPlan) {
      setIsOpenPlan(isOpenPlan);
      setIsOpen(isOpenPlan);
    }
  }, [isOpenPlan, focus]);

  useEffect(() => {
    setLoading(true);
    fetchMyAvatarsData(1);
  }, [userData?.user?.id, useAdsStore?.getState()?.isAdsVisible]);

  const navigateToAvatarDetail = (
    item: AvatarItem | undefined,
    id: string | number,
    image?: string,
    name?: string,
    isBackAllowed?: boolean,
  ) => {
    navigation.navigate('AvatarDetail', {
      item,
      id,
      image,
      name,
      isBackAllowed,
      isMyAvatar: true,
    });
    logFirebaseEvent(EVENT_NAME.VIEW_AVATAR_DETAIL_FROM_MY_AVATAR, {
      avatar: item?.id,
      user_id: userData?.user?.id,
    });
    setEventTrackinig({
      event_type: EVENT_NAME.VIEW_AVATAR_DETAIL_FROM_MY_AVATAR,
    });
  };

  useEffect(() => {
    const state = userState.getState();
    setMyAvatarListState(state?.myAvatars ?? []);
    setFavoritesListState(state.myFavoritesList);
    // setUserDataState(state.userData);
  }, []);

  const fetchMyAvatarsData = async (isPage?: number) => {
    try {
      await myAvatarList(isPage ? isPage : page).then(response => {
        const results = response?.data?.data?.results || [];
        const next = response?.data?.data?.next;
        const state = userState.getState();
        const updatedProfiles = results.map((profile: AvatarItem) => ({
          ...profile,
          isLike: myFavoritesList.some(fav => fav.id === profile.id),
        }));
        state.setMyAvatars(
          page === 1
            ? updatedProfiles
            : [...(state.myAvatars || []), ...updatedProfiles],
        );
        setIsNextPage(next !== null);
        setPage(isPage ? isPage + 1 : next !== null ? page + 1 : page);
        setMyAvatarListState(prev =>
          isPage === 1 ? updatedProfiles : [...prev, ...updatedProfiles],
        );
        setLoading(false);
        setIsFooterLoading(false);
      });
    } catch (error) {
      console.error('Error fetching avatars:', error);
      setLoading(false);
      setIsFooterLoading(false);
    } finally {
      setLoading(false);
      setIsReferesh(false);
      setIsFooterLoading(false);
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
          name: item.name ?? '',
          id: item.id,
          image: item.cover_image ?? '',
        },
      });
      logFirebaseEvent(EVENT_NAME.CALL_FROM_MY_AVATAR, {
        avatar_id: item.id,
        user_id: userData.user.id,
      });
      setEventTrackinig({
        event_type: EVENT_NAME.CALL_FROM_MY_AVATAR,
      });
    }
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
    logFirebaseEvent(EVENT_NAME.CHAT_FROM_MY_AVATAR, {
      avatar: item.id,
      user_id: userData?.user?.id,
    });
    setEventTrackinig({ event_type: EVENT_NAME.CHAT_FROM_MY_AVATAR });
  };

  const handleLikePress = (item: AvatarItem) => {
    const state = userState.getState();

    // Update favorites list in store
    state.setFavoritesList({ ...item, isLike: !item.isLike });
    let data = [...myAvatarListState];
    const updatedList = data.map((favitem: AvatarItem) =>
      favitem.id === item.id
        ? { ...favitem, isLike: !favitem.isLike }
        : favitem,
    );
    state.setMyAvatars(updatedList);
    setMyAvatarListState(updatedList); // THIS IS CRUCIAL FOR RE-RENDERING

    // Update favorites list state
    const newFavoritesList = state.favoritesList;
    setFavoritesListState(newFavoritesList);
    console.log('updateList--->', data, updatedList);
  };

  const RenderAvatarItem = React.memo(({ item }: { item: AvatarItem }) => {
    const characterLabel =
      item?.categories?.find((cat: any) => cat.label === 'Character')
        ?.options?.[0]?.label ?? null;

    return (
      <CommonHomeAvatar
        item={item}
        isMyAvatar
        characterLabel={characterLabel}
        onPress={() =>
          navigateToAvatarDetail(
            item,
            item.id,
            item.cover_image,
            item.name,
            true,
          )
        }
        onCallPress={() => handleCallPress(item)}
        onChatPress={() => handleChatPress(item)}
        onLikePress={() => handleLikePress(item)}
        isBlur={false}
        onBlurPress={() => {}}
        // isLike={userState
        //   ?.getState()
        //   ?.myFavoritesList.some(fav => fav.id === item.id)}
      />
    );
  });

  return (
    <View style={styles.screenContainer}>
      <CustomHeader
        headerLeftComponent={
          <Text style={[styles.headerTitle, { color: theme.primaryFriend }]}>
            {t(TranslationKeys.AI_CRUSH)}
          </Text>
        }
        headerRightStyle={{ alignSelf: 'center' }}
        containerStyle={{ paddingBottom: 0 }}
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
      <LoadBannerAd
        size={BannerAdSize.ANCHORED_ADAPTIVE_BANNER}
        adUnitId={remoteData.admobBannerId}
        style={{ marginBottom: 5 }}
      />

      {loading && !isReferesh ? <MyAvatarSkeleton /> : null}
      <View
        style={{
          flex: 1,
          paddingHorizontal: scale(5),
        }}
      >
        {myAvatarListState?.length !== 0 ? (
          <FlatList
            data={
              myAvatarListState.length / 2 === 0
                ? myAvatarListState
                : [...myAvatarListState, { id: '0', isEmpty: true }]
            }
            keyExtractor={(item, index) => index.toString()}
            renderItem={({ item }) => <RenderAvatarItem item={item} />}
            showsVerticalScrollIndicator={false}
            numColumns={2}
            // ListHeaderComponent={<View style={styles.listHeader} />}
            ListFooterComponent={
              isFooterLoading ? (
                <ActivityIndicator
                  color={theme.primaryFriend}
                  style={{ marginVertical: 30 }}
                  size={'large'}
                />
              ) : (
                <View style={styles.listFooter} />
              )
            }
            refreshControl={
              <RefreshControl
                refreshing={isReferesh}
                onRefresh={() => {
                  if (!isReferesh) {
                    setIsReferesh(true);
                    fetchMyAvatarsData(1);
                    // getGeneratedVideos();
                  }
                }}
                tintColor={theme.primaryFriend}
                colors={[theme.primaryFriend]}
              />
            }
            onEndReached={() => {
              if (isNextPage && !isFooterLoading) {
                setIsFooterLoading(true);
                fetchMyAvatarsData();
              }
            }}
            onEndReachedThreshold={0.5}
          />
        ) : !loading && myAvatarListState?.length === 0 ? (
          <CommonEmptyView
            emptyImage={IMAGES.noAvatar}
            header={'No Created Avatar!'}
            subHeader={'Create your avatar and make this space yours!'}
          />
        ) : null}
      </View>
      {isOpen && !userData.user?.isCurrentlyEnabledSubscription && (
        <SubscriptionPopup
          onClose={() => {
            setIsOpen(false);
            setIsOpenPlan(false);
            userState.getState().setSplashState(false);
          }}
          visible={isOpen}
          onLogin={() => {
            setIsOpen(false);
            navigation?.navigate('Login', {
              isfromPlan: true,
            });
          }}
          onNavigate={() => {
            setIsOpen(false);
          }}
          onSuccess={() => {}}
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
          onSuccess={() => {}}
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
    </View>
  );
};

export default MyAvatarScreen;

const MyAvatarScreenStyles = () => {
  const theme = useThemeStore().theme;
  return StyleSheet.create({
    screenContainer: {
      flex: 1,
      backgroundColor: theme.primaryBackground,
    },
    listHeader: {
      height: verticalScale(20),
      backgroundColor: theme.primaryBackground,
    },
    listFooter: {
      height: verticalScale(20),
      backgroundColor: theme.primaryBackground,
    },
    listSeparator: {
      height: verticalScale(15),
      backgroundColor: theme.primaryBackground,
    },
    headerTitle: {
      fontSize: scale(32),
      fontFamily: Fonts.IBold,
    },
    headerRightSection: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    coinContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: scale(10),
      paddingVertical: verticalScale(4),
      borderRadius: scale(12),
      marginRight: scale(10),
    },
    coinIcon: {
      width: scale(16),
      height: scale(16),
      resizeMode: 'contain',
      marginRight: scale(6),
    },
    coinText: {
      fontSize: scale(15),
      fontFamily: Fonts.IBold,
      fontWeight: '700',
    },
    bellIcon: {
      width: scale(48),
      height: scale(48),
      resizeMode: 'contain',
    },
    content: {
      paddingHorizontal: scale(16),
      paddingTop: verticalScale(10),
      paddingBottom: verticalScale(20),
    },
    avatarCard: {
      borderRadius: scale(20),
      height: scale(450),
      overflow: 'hidden',
      backgroundColor: 'red',
    },
    avatarImage: {
      flex: 1,
      width: '100%',
      resizeMode: 'contain',
      borderRadius: scale(20),
    },
    bottomInfo: {
      position: 'absolute',
      bottom: 10,
      width: '100%',
      left: 10,
      paddingHorizontal: scale(10),
      paddingVertical: verticalScale(8),
    },
    avatarName: {
      fontSize: scale(18),
      fontWeight: '600',
      fontFamily: Fonts.IBold,
      color: '#fff',
    },
    avatarAge: {
      fontSize: scale(14),
      color: '#fff',
      fontFamily: Fonts.IRegular,
    },
    tag: {
      position: 'absolute',
      top: scale(12),
      left: scale(12),
      backgroundColor: '#00000080',
      paddingHorizontal: scale(12),
      paddingVertical: verticalScale(5),
      borderRadius: scale(16),
      zIndex: 10,
    },
    tagText: {
      color: '#fff',
      fontSize: scale(13),
      fontWeight: '600',
    },
    characterTagTop: {
      position: 'absolute',
      top: scale(15),
      left: scale(12),
      backgroundColor: '#2C2C2C59',
      borderWidth: 1,
      borderColor: '#FFFFFFAA',
      paddingHorizontal: scale(12),
      paddingVertical: verticalScale(4),
      borderRadius: scale(20),
      zIndex: 10,
    },

    characterTagText: {
      color: '#FFFFFF',
      fontSize: scale(14),
      fontWeight: '600',
      fontFamily: Fonts.IRegular,
    },
    overlayButtons: {
      position: 'absolute',
      top: '30%',
      right: 0,
      width: scale(55),
      height: scale(170),
      borderTopLeftRadius: scale(20),
      borderBottomLeftRadius: scale(20),
      overflow: 'hidden',
      zIndex: 10,
    },
    blurContainer: {
      ...StyleSheet.absoluteFillObject,
      borderTopLeftRadius: scale(20),
      borderBottomLeftRadius: scale(20),
    },
    blurOverlay: {
      ...StyleSheet.absoluteFillObject,
      backgroundColor: '#2C2C2C26',
      borderTopLeftRadius: scale(20),
      borderBottomLeftRadius: scale(20),
    },
    iconGroup: {
      flex: 1,
      justifyContent: 'space-around',
      alignItems: 'center',
      paddingVertical: verticalScale(12),
    },
    overlayIcon: {
      backgroundColor: '#FFFFFF3D',
      padding: scale(10),
      borderRadius: 50,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 4,
    },
    icon: {
      width: scale(20),
      height: scale(20),
      resizeMode: 'contain',
    },
    addIconWrapper: {
      width: scale(48),
      height: verticalScale(48),
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
  });
};
