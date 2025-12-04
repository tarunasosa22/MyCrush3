import { useNavigation, useIsFocused } from '@react-navigation/native';
import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import {
  ChatList as fetchChatList,
  getUserDetail,
  setEventTrackinig,
} from '../api/user';
import { useThemeStore } from '../store/themeStore';
import CustomHeader from '../components/headers/CustomHeader';
import CustomCoinView from '../components/CustomCoinView';
import { TranslationKeys } from '../lang/TranslationKeys';
import { t } from 'i18next';
import { moderateScale, scale, verticalScale } from '../utils/Scale';
import Fonts from '../utils/fonts';
import SubscriptionPopup from '../components/SubscriptionPopup';
import { RefreshControl } from 'react-native-gesture-handler';
import CommonEmptyView from '../components/CommonEmptyView';
import IMAGES from '../assets/images';
import CommonImagePlaceHolder from '../components/CommonImagePlaceHolder';
import { userState } from '../store/userStore';
import ChatListSkeleton from '../components/skeletons/ChatListSkeleton';
import CommonZoomImageModal from '../components/CommonZoomImageModal';
import UpgradeCreditPopup from '../components/UpgradeCreditPopup';
import { useChatStore } from '../store/chatListStore';
import { adsKeyword, EVENT_NAME, GENERATE_IMAGE_MESSAGE } from '../constants';
import NativeAdComponent from '../ads/NativeAdComponent';
import { NativeAd } from 'react-native-google-mobile-ads';
import { preloadAddStore } from '../store/preloadAddStore';
import { useAdsStore } from '../store/useAdsStore';
import { logFirebaseEvent } from '../utils/HelperFunction';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { CustomSeperator } from './AccountScreen';

export interface ChatItem {
  id: number;
  name: string;
  status: 'active' | 'inactive' | string;
  chat_id: string;
  created_at: string;
  updated_at: string;
  last_message: {
    id: number;
    human_message_timestamp: string;
    avatar_message_timestamp: string;
    human_message: string;
    avatar_message: string;
  };
  user: number;
  avatar?: {
    cover_image: string;
    name: string;
  };
}

export const CustomSeperator1 = () => {
  const styles = ChatListScreenStyles();
  return <View style={styles.seperator} />;
};

const ChatListScreen = () => {
  const theme = useThemeStore(state => state.theme);
  const navigation = useNavigation<any>();
  const isScreenFocused = useIsFocused();

  const [isPopupOpen, setIsPopupOpen] = useState(false);
  const [zoomImageState, setZoomImageState] = useState<{
    isVisible: boolean;
    image: string | undefined | null;
  }>({
    isVisible: false,
    image: undefined,
  });

  const {
    userData,
    isOpenPlan,
    setIsOpenPlan,
    setUserData,
    setIdForBlurImageGenerate,
  } = userState.getState();

  // 🔹 Local state (replacing Zustand for chat list, pagination, loaders)
  const [chatItemsList, setChatItemsList] = useState<ChatItem[]>([]);
  const [currentChatPage, setCurrentChatPage] = useState(1);
  const [hasMoreChatPages, setHasMoreChatPages] = useState(false);
  const [isChatListLoading, setIsChatListLoading] = useState(false);
  const [isChatFooterLoading, setIsChatFooterLoading] = useState(false);
  const [isChatRefreshing, setIsChatRefreshing] = useState(false);

  // Keep only update flag from Zustand
  const { isChatListUpdated, setIsChatListUpdated } = useChatStore();
  const { getNextAd, preloadNativeAds, hasPreloadedAds } = preloadAddStore();
  const [currentNativeAd, setCurrentNativeAd] = useState<NativeAd | null>(null);
  const remoteData = useAdsStore.getState().remoteData;

  const requestNativeAdvertisement = () => {
    const ad = getNextAd();
    if (ad) {
      setCurrentNativeAd(ad);
      const isAdAvailable = hasPreloadedAds();
      console.log('=Native=Ad=adUnitId-1=if=isAdAvailable', isAdAvailable, ad);
      if (!isAdAvailable) {
        preloadNativeAds(1).then(res => {
          console.log('Preload the ads', 'chatList');
        });
      }
    } else {
      const adUnitId = useAdsStore.getState()?.getNextAdmobNativeId();

      if (!adUnitId) {
        console.warn('❌ No ad unit ID provided');
        return;
      }
      const ad = NativeAd.createForAdRequest(adUnitId, {
        keywords: remoteData?.adsKeyword ?? adsKeyword,
      }).then(res => {
        setCurrentNativeAd(res);
      });
      console.log('=Native=Ad=adUnitId-1=else', adUnitId, currentNativeAd);
      const isAdAvailable = hasPreloadedAds();
      if (!isAdAvailable) {
        preloadNativeAds(1).then(res => {
          console.log('Preload the ads', 'chatList');
        });
      }
    }
  };

  useEffect(() => {
    console.log('come in first step...', 'chatList');
    requestNativeAdvertisement();
  }, []);

  useEffect(() => {
    if (isScreenFocused) {
      setIdForBlurImageGenerate(null);
    }
    if (isScreenFocused && isOpenPlan) {
      setIsOpenPlan(isOpenPlan);
      setIsPopupOpen(isOpenPlan);
    }
  }, [isOpenPlan, isScreenFocused]);

  const fetchChatListData = async (reset = false) => {
    try {
      if (reset) {
        setIsChatListLoading(true);
        setCurrentChatPage(1);
      } else {
        setIsChatFooterLoading(true);
      }

      const res = await fetchChatList(reset ? 1 : currentChatPage);

      if (res?.success && res?.data?.results) {
        const results = res.data.results;
        const next = res.data?.next;

        setChatItemsList(reset ? results : [...chatItemsList, ...results]);
        setHasMoreChatPages(next !== null);
        setCurrentChatPage(
          next !== null ? (reset ? 2 : currentChatPage + 1) : currentChatPage,
        );
      }
    } catch (error) {
      console.error('❌ Failed to load chats:', error);
    } finally {
      setIsChatListLoading(false);
      setIsChatFooterLoading(false);
      setIsChatRefreshing(false);
    }
  };

  useEffect(() => {
    if (isScreenFocused && isChatListUpdated) {
      fetchChatListData(true);
      setIsChatListUpdated(false);
    }
  }, [isScreenFocused]);

  useEffect(() => {
    if (isScreenFocused) {
      getUserDetail().then(async res => {
        const newUserData = {
          ...userData,
          user: res?.data?.data?.user,
        };
        setUserData(newUserData);
      });
    }
  }, [isScreenFocused]);

  const renderChatListItem = ({ item }: { item: ChatItem }) => {
    const humanMessageTime = new Date(
      item.last_message?.human_message_timestamp,
    );
    const avatarMessageTime = new Date(
      item.last_message?.avatar_message_timestamp,
    );
    // Compare and select latest
    let lastChatMessage;
    if (humanMessageTime > avatarMessageTime) {
      lastChatMessage = item.last_message?.human_message;
    } else {
      lastChatMessage = item.last_message?.avatar_message;
    }
    return (
      <TouchableOpacity
        style={chatListStyles.chatItem}
        onPress={() => {
          navigation.navigate('Chat', {
            user: item?.avatar,
            chat_id: item.chat_id,
          });
          logFirebaseEvent(EVENT_NAME.CHAT_FROM_CHAT_LIST, {
            avatar: item.id,
            user_id: userData?.user?.id,
          });
          setEventTrackinig({ event_type: EVENT_NAME.CHAT_FROM_CHAT_LIST });
        }}
      >
        <CommonImagePlaceHolder
          imageStyle={chatListStyles.avatar}
          image={item?.avatar?.cover_image || undefined}
          disabled={!item?.avatar?.cover_image}
          isAppIcon
          onPress={() => {
            setZoomImageState({
              isVisible: true,
              image: item?.avatar?.cover_image || undefined,
            });
          }}
        />
        <View style={chatListStyles.chatTextContainer}>
          <Text style={[chatListStyles.name, { color: theme.heading }]}>
            {item?.avatar?.name || 'User'}
          </Text>
          <Text
            style={[chatListStyles.message, { color: theme.text }]}
            numberOfLines={1}
          >
            {lastChatMessage === GENERATE_IMAGE_MESSAGE
              ? 'sent you an attachment📎'
              : lastChatMessage || 'Say hi 👋'}
          </Text>
        </View>
        <View style={{ marginLeft: 'auto', alignSelf: 'flex-start' }}>
          {item.last_message && (
            <Text style={chatListStyles.time}>
              {humanMessageTime.toLocaleTimeString([], {
                hour: '2-digit',
                minute: '2-digit',
              })}
            </Text>
          )}
        </View>
      </TouchableOpacity>
    );
  };

  const chatListStyles = ChatListScreenStyles();

  return (
    <View style={chatListStyles.screenContainer}>
      <CustomHeader
        headerLeftComponent={
          <Text
            style={[chatListStyles.headerTitle, { color: theme.primaryFriend }]}
          >
            {t(TranslationKeys.AI_CRUSH)}
          </Text>
        }
        headerRightStyle={{ alignSelf: 'center' }}
        containerStyle={{ paddingBottom: 0 }}
        headerRightComponent={
          <CustomCoinView
            coinCount={userData?.user?.tokens}
            onPress={() => {
              if (userData?.isGuestUser) {
                navigation.navigate('Login', {
                  email: null,
                  isfromPlan: true,
                });
              } else {
                setIsOpenPlan(true);
                setIsPopupOpen(true);
              }
            }}
          />
        }
      />
      <NativeAdComponent
        nativeAd={currentNativeAd}
        nativeStyles={chatListStyles.nativeAdStyles}
        type={remoteData?.native_ads_chat_list}
      />

      <View style={{ flex: 1, marginTop: verticalScale(10) }}>
        {isChatListLoading && !isChatRefreshing ? (
          <ChatListSkeleton />
        ) : chatItemsList.length !== 0 ? (
          <FlatList
            data={chatItemsList}
            keyExtractor={item => item?.chat_id?.toString?.() ?? ''}
            renderItem={renderChatListItem}
            ItemSeparatorComponent={CustomSeperator1}
            contentContainerStyle={chatListStyles.listContainer}
            showsVerticalScrollIndicator={false}
            refreshControl={
              <RefreshControl
                refreshing={isChatRefreshing}
                onRefresh={() => {
                  if (!isChatRefreshing) {
                    setIsChatRefreshing(true);
                    fetchChatListData(true);
                  }
                }}
                tintColor={theme.primaryFriend}
              />
            }
            ListFooterComponent={
              isChatFooterLoading ? (
                <ActivityIndicator
                  color={theme.primaryFriend}
                  style={{ marginVertical: 30 }}
                />
              ) : (
                <View style={chatListStyles.listFooter} />
              )
            }
            onEndReached={() => {
              if (hasMoreChatPages && !isChatFooterLoading) {
                fetchChatListData();
              }
            }}
          />
        ) : (
          <CommonEmptyView
            emptyImage={IMAGES.chat_list_empty_icon}
            header={'No Chats Yet!'}
            subHeader={'Start a conversation to see your chats here.'}
          />
        )}
      </View>

      {/* Subscription popup */}
      {isPopupOpen && !userData.user?.isCurrentlyEnabledSubscription && (
        <SubscriptionPopup
          onClose={() => {
            setIsPopupOpen(false);
            setIsOpenPlan(false);
            userState.getState().setSplashState(false);
          }}
          visible={isPopupOpen}
          onLogin={() => {
            setIsPopupOpen(false);
            navigation?.navigate('Login');
          }}
          onNavigate={() => {
            setIsPopupOpen(false);
          }}
          onSuccess={() => {}}
        />
      )}
      {isPopupOpen && userData.user?.isCurrentlyEnabledSubscription && (
        <UpgradeCreditPopup
          onNavigate={() => {
            setIsPopupOpen(false);
          }}
          visible={isPopupOpen}
          onClose={() => {
            setIsOpenPlan(false);
            setIsPopupOpen(false);
             userState.getState().setSplashState(false);
          }}
          onLogin={() => {
            setIsPopupOpen(false);
            navigation?.navigate('Login', { email: null, isfromPlan: true });
          }}
          onSuccess={() => {}}
        />
      )}

      {/* Image Zoom Modal */}
      {zoomImageState?.image && (
        <CommonZoomImageModal
          visible={zoomImageState?.isVisible}
          source={zoomImageState?.image}
          onClose={() => {
            setZoomImageState({ isVisible: false, image: undefined });
          }}
        />
      )}
    </View>
  );
};

export default React.memo(ChatListScreen);

const ChatListScreenStyles = () => {
  const insets = useSafeAreaInsets();
  const theme = useThemeStore().theme;
  return StyleSheet.create({
    screenContainer: { flex: 1 },
    listContainer: { paddingHorizontal: 16, paddingBottom: verticalScale(100) },
    chatItem: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: verticalScale(10),
      marginTop: verticalScale(10),
    },
    avatar: {
      width: 55,
      height: 55,
      borderRadius: 27.5,
      marginRight: 12,
      backgroundColor: '#ccc',
      resizeMode: 'stretch',
    },
    chatTextContainer: { flex: 1 },
    name: {
      fontSize: scale(17),
      fontFamily: Fonts.IMedium,
      marginBottom: 4,
      color: theme.primaryText,
    },
    message: {
      fontSize: moderateScale(15),
      fontFamily: Fonts.IMedium,
      color: theme.text,
    },
    headerTitle: { fontSize: scale(32), fontFamily: Fonts.IBold },
    headerRightSection: { flexDirection: 'row', alignItems: 'center' },
    listFooter: { height: verticalScale(20) },
    time: {
      fontSize: scale(14),
      color: theme.purpleText,
      fontFamily: Fonts.IRegular,
    },
    nativeAdStyles: {
      marginBottom: verticalScale(10),
      marginHorizontal: verticalScale(2),
    },
    seperator: {
      height: verticalScale(1.5),
      marginVertical: verticalScale(5),
      backgroundColor: theme.border,
      width: '85%',
      alignSelf: 'flex-end',
    },
  });
};
