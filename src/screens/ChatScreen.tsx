import React, {
  useState,
  useRef,
  useEffect,
  useCallback,
  useMemo,
} from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Platform,
  FlatList,
  KeyboardAvoidingView,
  Keyboard,
  Image,
  ActivityIndicator,
  Dimensions,
  PermissionsAndroid,
  Alert,
  Linking,
  ImageBackground,
  StatusBar,
  AppState,
  Animated,
} from 'react-native';
import Share from 'react-native-share';
import {
  useRoute,
  useNavigation,
  useIsFocused,
  useFocusEffect,
} from '@react-navigation/native';
import {
  ChateScreen,
  ChatMessages,
  generateBlurImage,
  generateBlurImageFree,
  getUserDetail,
  setEventTrackinig,
} from '../api/user';
import { userState } from '../store/userStore';
import { CHAT_SOCKET_URL } from '../config';
import { isAndroid, moderateScale, scale, verticalScale } from '../utils/Scale';
import { useThemeStore } from '../store/themeStore';
import IMAGES from '../assets/images';
import {
  SafeAreaView,
  useSafeAreaInsets,
} from 'react-native-safe-area-context';
import CommonImagePlaceHolder from '../components/CommonImagePlaceHolder';
import CommonEmptyView from '../components/CommonEmptyView';
import { customColors } from '../utils/Colors';
import CustomActivityIndicator from '../components/CustomActivityIndicator';
import SubscriptionPopup from '../components/SubscriptionPopup';
import { AppAnimations } from '../assets/animation';
import LottieView from 'lottie-react-native';
import Fonts from '../utils/fonts';
import CommonZoomImageModal from '../components/CommonZoomImageModal';
import { PERMISSIONS, request, RESULTS } from 'react-native-permissions';
import { useChatStore } from '../store/chatListStore';
import CustomReportIssueModal from '../components/CustomReportIssueModal';
import { navigationRef } from '../../App';
import LinearGradient from 'react-native-linear-gradient';
import CustomMessagePopup from '../components/CustomMessagePopup';
import UpgradeCreditPopup from '../components/UpgradeCreditPopup';
import { logFirebaseEvent } from '../utils/HelperFunction';
import {
  adsKeyword,
  APP_URL,
  EVENT_NAME,
  GENERATE_IMAGE_MESSAGE,
} from '../constants';
import { getToday } from '../navigation/Appnavigation';
import RNFS from 'react-native-fs';
import { CameraRoll } from '@react-native-camera-roll/camera-roll';
import { showMessage } from 'react-native-flash-message';
import RomanticChatBottomSheet, {
  textSheet,
} from '../components/RomanticChatBottomSheet';
import CustomBottomSheet, {
  CommonBottomSheetRef,
} from '../components/CommonBottomSheet';
import {
  BottomSheetBackdrop,
  BottomSheetBackdropProps,
  BottomSheetScrollView,
} from '@gorhom/bottom-sheet';
import { useAdsStore } from '../store/useAdsStore';
import NativeAdComponent from '../ads/NativeAdComponent';
import {
  AdEventType,
  NativeAd,
  RewardedAd,
  RewardedAdEventType,
} from 'react-native-google-mobile-ads';
import { preloadAddStore } from '../store/preloadAddStore';
import ImagePreviewModal from '../components/ImagePreviewModal';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

type ChatMessage = {
  id: string | null;
  chat: string | null;
  human_message: string | null;
  human_message_timestamp: string | null;
  avatar_message: string | null;
  avatar_message_timestamp: string | null;
  message_type: string;
  attachment_id?: string | null;
  chat_message_type?: 'image' | 'text';
  is_dummy?: boolean;
  attachments?: {
    id?: string | null;
    file: string;
    status: string;
    attachment_type?: string;
    is_dummy?: boolean;
    required_tokens?: number;
  };
  message?: string;
  message_id?: string | null;

  isAd?: boolean;
  status?: string;
  user_subscription_status?: string;
  is_free_message_over?: boolean;
  is_subscription_active?: boolean;
  subscription_status?: string;
};

const ChatScreen = () => {
  const theme = useThemeStore(state => state.theme);
  const [message, setMessage] = useState('');
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [loadingMessages, setLoadingMessages] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false); // New state for pagination loading
  const [keyboardHeight, setKeyboardHeight] = useState(0);
  const flatListRef = useRef<FlatList>(null);
  const socketRef = useRef<WebSocket | null>(null);
  const textInputRef = useRef<TextInput>(null);
  const [page, setPage] = useState(1);
  const [hasMoreData, setHasMoreData] = useState(false); // Track if more data is available

  const reconnectDelay = useRef(1000); // start with 1s
  const route = useRoute();
  const navigation = useNavigation<any>();
  const styles = Styles();
  const { user, chat_id }: any = route.params;
  const [chatId, setChatId] = useState<string | null>(chat_id);
  const { refresh_token, access_token } = userState()?.userData;
  const { setSentChatCount } = userState();
  const [isReplyCount, setIsReplyCount] = useState<number>(0);
  const { remoteData } = useAdsStore();
  const [messageId, setMessageId] = useState('');
  // Add this state near your other useState declarations (around line 74)
  const [isAdLoading, setIsAdLoading] = useState(false);

  const {
    userData,
    setUserData,
    isOpenPlan,
    setIsOpenPlan,
    isCallEnded,
    callEndReason,
    setIsCallEnded,
    setCallEndReason,
    timeOfPopup,
    IsChatDemoVideoShown,
    setIsChatDemoVideoShown,
    setIdForBlurImageGenerate,
    IdForBlurImageGenerate,
  } = userState();
  const tokenExpired =
    Number(userState?.getState()?.userData?.user?.tokens) <= 0;
  const [isOpen, setIsOpen] = useState(false);
  const { setIsChatListUpdated, setChatCountRate } = useChatStore();
  const chatBannerAdsCount = useAdsStore.getState().chatBannerAdsCount;
  const [onReportVisible, setOnReportVisible] = useState<{
    visible: boolean;
    content: any;
  }>({ visible: false, content: undefined });
  // State for tracking loading images
  const [loadingImages, setLoadingImages] = useState<{
    [key: string]: boolean;
  }>({});

  const [isOpenZoomView, setIsOpenZoomView] = useState<{
    isVisible: boolean;
    isDownload?: boolean;
    isShare?: boolean;
    item:
      | {
          cover_image: string | undefined | null;
          name?: string | undefined | null;
          id?: string | undefined | null;
          message?: string | undefined | null;
          width?: any;
          height?: any;
        }
      | undefined
      | null;
  }>({
    isVisible: false,
    item: {
      cover_image: undefined,
      name: undefined,
      id: undefined,
      message: undefined,
      width: 0,
      height: 0,
    },
  });

  const userChatImage = userState?.getState()?.userData?.user?.profile_image;
  const focus = useIsFocused();
  const [showMessagePopup, setShowMessagePopup] = useState(false);

  const [keyboardVisible, setKeyboardVisible] = useState(false);
  const [infoMessage, setInfoMessage] = useState<any>({});
  const [isOpenPreview, setIsOpenPreview] = useState<any>({
    isOpen: false,
    imageData: null,
  });
  const pulseAnim = useRef(new Animated.Value(1)).current;
  // const [imageDimensions, setImageDimensions] = useState({
  //   width: 0,
  //   height: 0,
  // });

  // Store image dimensions in a ref to avoid re-renders
  const imageDimensionsRef = useRef<{
    [key: string]: { width: number; height: number };
  }>({});

  const selectedPhotoID = useRef<string | number | undefined>(null);

  const adUnitId = remoteData.admobMyAvatar_ChatImage; // your production ID

  const rewardedRef = useRef(
    RewardedAd.createForAdRequest(adUnitId, {
      keywords: remoteData?.adsKeyword ?? adsKeyword,
    }),
  );

  // ✅ Function to show ad on "Get Free"
  const handleGetFree = () => {
    userState.getState().setSplashState(true);
    logFirebaseEvent(EVENT_NAME.SHOW_AD_FOR_GENERATE_FREE_AVATAR_CHAT_IMAGE, {
      user_id: userData?.user?.id,
    });
    setEventTrackinig({
      event_type: EVENT_NAME.SHOW_AD_FOR_GENERATE_FREE_AVATAR_CHAT_IMAGE,
    });

    console.log('🎯 PRESSED Get Free...');
    setIsOpenPreview({ isOpen: false, imageData: null });

    // Show loader immediately
    setIsAdLoading(true);

    const rewardedAd = rewardedRef.current;

    // --- Setup listeners for this ad instance ---
    const unsubscribeLoaded = rewardedAd.addAdEventListener(
      RewardedAdEventType.LOADED,
      () => {
        console.log('✅ Rewarded ad loaded...');
        setIsAdLoading(false); // Hide loader when ad is ready
        rewardedAd.show();
      },
    );

    const unsubscribeEarned = rewardedAd.addAdEventListener(
      RewardedAdEventType.EARNED_REWARD,
      reward => {
        console.log('🎁 User earned reward:', selectedPhotoID, reward);
        if (selectedPhotoID.current != null) {
          generateBlutImageApiCallFree(); // Only after reward earned
        } else {
          console.log('⚠️ selectedPhotoID missing', selectedPhotoID.current);
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
        if (selectedPhotoID.current != null) {
          generateBlutImageApiCallFree(); // Only after reward earned
        } else {
          console.log('⚠️ selectedPhotoID missing', selectedPhotoID.current);
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

  useEffect(() => {
    // Continuous animations
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.1,
          duration: 800,
          useNativeDriver: true,
        }),
      ]),
    ).start();
  });

  const { getNextAd, preloadNativeAds, hasPreloadedAds } = preloadAddStore();
  const [nativeAd, setNativeAd] = useState<NativeAd | null>(null);

  const nativeAdRequest = () => {
    const ad = getNextAd();
    if (ad) {
      setNativeAd(ad);
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
        setNativeAd(res);
      });
      console.log('=Native=Ad=adUnitId-1=else', adUnitId, nativeAd);
      const isAdAvailable = hasPreloadedAds();
      if (!isAdAvailable) {
        preloadNativeAds(1).then(res => {
          console.log('Preload the ads', 'chatScreen');
        });
      }
    }
  };

  useEffect(() => {
    console.log('come in first step...', 'chatList');
    nativeAdRequest();
  }, []);

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
  }, [isCallEnded, callEndReason, focus]);

  useEffect(() => {
    const showSub = Keyboard.addListener('keyboardDidShow', () =>
      setKeyboardVisible(true),
    );
    const hideSub = Keyboard.addListener('keyboardDidHide', () =>
      setKeyboardVisible(false),
    );

    return () => {
      showSub.remove();
      hideSub.remove();
    };
  }, []);

  const getUserDetailAPI = async () => {
    getUserDetail().then(async res => {
      const newUserData = {
        ...userData,
        user: res?.data?.data?.user,
      };
      setUserData(newUserData);
    });
  };

  useEffect(() => {
    if (focus) {
      getUserDetailAPI();
    }
  }, [focus]);

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
    if (!userData?.user?.tokens || userData.user.tokens < 5) {
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
          name: user.name ?? '',
          id: user.id,
          image: user.cover_image ?? '',
        },
      });
      logFirebaseEvent(EVENT_NAME.CALL_FROM_CHAT_SCREEN, {
        avatar_id: user.id,
        user_id: userData.user.id,
      });
      setEventTrackinig({
        event_type: EVENT_NAME.CALL_FROM_CHAT_SCREEN,
      });
    }
  };

  const CreateChat = async () => {
    try {
      const payload = new FormData();
      payload.append('avatar', user.id);
      await ChateScreen(payload).then(res => {
        const chat_id = res.data?.data?.chat?.chat_id;
        setChatId(chat_id);
        fetchMessages(1, false, chat_id);
      });
    } catch (err) {
      console.error('❌ Failed to create or fetch chat:', err);
    }
  };

  useEffect(() => {
    if (!chat_id) {
      setLoadingMessages(true);
      CreateChat();
    } else {
      setLoadingMessages(true);
      fetchMessages(1, false, chat_id);
    }
  }, []);

  const fetchMessages = async (
    pageNum: number,
    isLoadMore = false,
    chat_id?: string,
  ) => {
    const _chatId = chat_id ?? chatId;
    if (!_chatId) return;

    if (!isLoadMore) {
      setLoadingMessages(true);
    } else {
      setLoadingMore(true);
    }

    try {
      await ChatMessages(_chatId, pageNum).then((res: any) => {
        const messages = res?.data?.results || [];
        const hasNext = res?.data?.next;

        // Update hasMoreData based on response
        setHasMoreData(!!hasNext);

        const sortedMessages = messages?.sort(
          (a: ChatMessage, b: ChatMessage) => {
            const aTime = new Date(
              a.human_message_timestamp || a.avatar_message_timestamp || 0,
            ).getTime();
            const bTime = new Date(
              b.human_message_timestamp || b.avatar_message_timestamp || 0,
            ).getTime();
            return aTime - bTime;
          },
        );

        if (isLoadMore) {
          // For pagination, prepend new messages to existing ones
          setChatMessages(prev => {
            const safePrev = Array.isArray(prev) ? prev : [];
            const combined = [...sortedMessages, ...safePrev];
            // Remove duplicates based on id
            const unique = combined.filter(
              (message, index, self) =>
                index === self.findIndex(m => m.id === message.id),
            );
            return unique;
          });

          // Only update page if there's more data
          if (hasNext) {
            setPage(prev => prev + 1);
          }
        } else {
          // Initial load, replace all messages
          setChatMessages(sortedMessages);
          // Set initial page for pagination
          setPage(hasNext ? 2 : 1);
        }
        setLoadingMessages(false);
        setLoadingMore(false);
        if (
          !socketRef.current ||
          socketRef.current.readyState !== WebSocket.OPEN
        ) {
          console.log('TRY TO CONNECT--->');
          connectionInit(chat_id);
        }
      });
    } catch (error) {
      console.error('Error fetching messages:', error);
      setHasMoreData(false);
      setLoadingMessages(false);
      setLoadingMore(false);
    } finally {
    }
  };

  const setChatMessagesOptimized = useCallback((updater: any) => {
    setChatMessages(prev => {
      const newMessages =
        typeof updater === 'function' ? updater(prev) : updater;

      // Prevent setting the same messages
      if (JSON.stringify(prev) === JSON.stringify(newMessages)) {
        return prev;
      }

      return newMessages;
    });
  }, []);

  const connectionInit = (chat_id?: any) => {
    const _chatId = chat_id ?? chatId;
    if (!_chatId) return;
    const ws = new WebSocket(
      `${CHAT_SOCKET_URL}${_chatId}/?token=${access_token}`,
    );

    ws.onopen = () => {
      console.log('✅ CONNECTION OPEN');
      reconnectDelay.current = 1000; // reset delay after success
    };

    ws.onmessage = event => {
      try {
        const data = JSON.parse(event.data);

        // if (data?.is_free_message_over && Number(userData.user?.tokens) <= 0) {
        setInfoMessage(data);
        // }

        if (data?.type == 'chat_message_v2' && tokenExpired) {
          console.log(
            '📩 WebSocket message received:chat_message chat_message_v2',
            data,
            chatId,
            chatMessages,
          );
          if (data.message_type === 'avatar_message') {
            const replyMessage: ChatMessage = {
              ...data,
              id: data.message_id || `ws-${Date.now()}`,
              chat: chatId,
              human_message: data?.human_message || '',
              human_message_timestamp: data?.human_message_timestamp || '',
              avatar_message: data.avatar_message || data.message || '',
              avatar_message_timestamp:
                data?.avatar_message_timestamp || new Date().toISOString(),
              message_type: data.message_type,
              attachments: {
                file: data.attachments?.file ?? data.attachments,
                is_dummy: data?.is_dummy ?? false,
                status: data?.status,
              },
            };
            console.log(
              'data.attachments?.file ?? data.attachments=====',
              data.attachments?.file,
              data.attachments,
            );

            // selectedPhotoID.current =
            //   data.attachments?.file ?? data.attachments;

            // if (
            //   data?.status === 'subscription_expired' ||
            //   data?.status === 'insufficient_tokens'
            // ) {
            //   setInfoMessage(data);
            //   setShowMessagePopup(true);
            // }

            if (data.attachments) {
              getUserDetailAPI();
            }

            setChatMessagesOptimized((prev: ChatMessage[]) => {
              const withoutTyping = prev.filter(
                msg => msg.avatar_message?.trim().toLowerCase() !== 'typing...',
              );
              const existsIndex = withoutTyping.findIndex(
                m => m.id === replyMessage.id,
              );
              if (existsIndex !== -1) {
                const updated = [...withoutTyping];
                updated[existsIndex] = {
                  ...updated[existsIndex],
                  ...replyMessage,
                };
                return updated;
              } else {
                return [...withoutTyping, replyMessage];
              }
            });
            console.log('replyMessage==>1', replyMessage);
          }
        } else if (data.message_type === 'avatar_message' && !tokenExpired) {
          console.log(
            '📩 WebSocket message received:chat_message avatar_message',
            data,
            chatId,
            chatMessages,
          );
          const replyMessage: ChatMessage = {
            ...data,
            id: messageId || data.message_id || `ws-${Date.now()}`,
            chat: chatId,
            human_message: data?.human_message || '',
            human_message_timestamp: data?.human_message_timestamp || '',
            avatar_message: data.avatar_message || data.message || '',
            avatar_message_timestamp:
              data?.avatar_message_timestamp || new Date().toISOString(),
            message_type: data.message_type,
            attachments: {
              file: data.attachments?.file ?? data.attachments,
              is_dummy: data?.is_dummy ?? false,
              status: data?.status,
            },
          };
          console.log('replyMessage====>2', replyMessage);
          // if(data.is_free_message_over) {
          //   setInfoMessage(data);
          // }
          // if (
          //   data?.user_subscription_status === 'subscription_expired' ||
          //   data?.user_subscription_status === 'insufficient_tokens' ||
          //   data?.user_subscription_status === 'subscribe_now'
          // ) {
          //   setInfoMessage(data);
          //   setShowMessagePopup(true);
          // }

          if (data.attachments) {
            getUserDetailAPI();
          }

          setChatMessagesOptimized((prev: ChatMessage[]) => {
            const withoutTyping = prev.filter(
              msg => msg.avatar_message?.trim().toLowerCase() !== 'typing...',
            );
            const existsIndex = withoutTyping.findIndex(
              m => m.id === replyMessage.id,
            );

            if (existsIndex !== -1) {
              const updated = [...withoutTyping];
              updated[existsIndex] = {
                ...updated[existsIndex],
                ...replyMessage,
              };
              return updated;
            } else {
              return [...withoutTyping, replyMessage];
            }
          });
        }
      } catch (error) {
        console.error('❌ WebSocket JSON parse error:', error);
      }
    };

    ws.onerror = e => {
      console.error('❌ WebSocket error:', e.message);
    };

    ws.onclose = () => {
      console.log(
        '🔌 CONNECTION CLOSE... retrying',
        focus,
        navigationRef.current?.getCurrentRoute()?.name === ('Chat' as any),
      );

      if (
        focus &&
        navigationRef.current?.getCurrentRoute()?.name === ('Chat' as any)
      ) {
        setTimeout(() => {
          console.log('♻️ Reconnecting WebSocket...');
          connectionInit(); // ✅ safe to reuse
        }, 2000);
      }
    };

    socketRef.current = ws;
  };

  const handleLoadMore = () => {
    console.log(
      `handleLoadMore called - loadingMore: ${loadingMore}, hasMoreData: ${hasMoreData}, loadingMessages: ${loadingMessages}, page: ${page}`,
    );

    if (
      chatMessages.length !== 0 &&
      !loadingMore &&
      hasMoreData &&
      !loadingMessages
    ) {
      console.log(`Loading page ${page}...`);
      fetchMessages(page, true);
    } else {
      console.log('Skipping load more - conditions not met');
    }
  };

  const allowUserToSendMessage = () => {
    console.log('infoMessage <<<<', infoMessage);
    if (
      !infoMessage ||
      Object.keys(infoMessage).length === 0 ||
      (!infoMessage.is_subscription_active &&
        infoMessage.is_free_message_over &&
        Number(userData?.user?.tokens) <= 0)
    ) {
      console.log('return true.... (NOT allowed)');
      return true;
    } else {
      console.log('return false.... (NOT allowed)');
      return false;
    }
  };

  const sendMessage = async (text: string) => {
    const isBlocked = allowUserToSendMessage();

    if (isBlocked) {
      console.log('User not allowed to send message.');
      // setShowMessagePopup(true);
      setIsOpen(true);
      return;
    }

    const trimmed = text.trim();
    if (!trimmed) return;

    const tempId = `temp-${Date.now()}`;
    const userMessage: ChatMessage = {
      id: tempId,
      chat: chatId,
      human_message: trimmed,
      human_message_timestamp: new Date().toISOString(),
      avatar_message: null,
      avatar_message_timestamp: null,
      message_type: 'text',
    };

    setChatMessages(prev => {
      const safePrev = Array.isArray(prev) ? prev : [];
      return [...safePrev, userMessage];
    });

    const userMessage1: ChatMessage = {
      id: `typing-${Date.now()}`,
      chat: chatId,
      human_message: null,
      human_message_timestamp: new Date().toISOString(),
      avatar_message: 'typing...',
      avatar_message_timestamp: null,
      message_type: 'text',
    };
    console.log('SEND-MESSAGE--->', userMessage, userMessage1);
    setChatMessages(prev => {
      const safePrev = Array.isArray(prev) ? prev : [];
      return [...safePrev, userMessage1];
    });

    setMessage('');

    if (socketRef.current && socketRef.current.readyState === WebSocket.OPEN) {
      const payload = {
        message_type: 'text',
        message: trimmed,
      };
      socketRef.current.send(JSON.stringify(payload));
      setTimeout(() => {
        flatListRef.current?.scrollToIndex({ index: 0, animated: true });
      }, 100);
    }
    const today = getToday();
    setIsChatListUpdated(true);

    if (userData.access_token) {
      setChatCountRate({
        id: user.id,
      });
    }
    if (
      userData.access_token &&
      userData.user?.total_tokens == 0 &&
      (timeOfPopup == null || timeOfPopup !== today)
    ) {
      setSentChatCount({ id: user.id });
    }
    console.log('SEND===>', isReplyCount);
    if (isReplyCount === 2 && !IsChatDemoVideoShown) {
      setTimeout(() => {
        openBottomSheet();
        setIsReplyCount(0);
        setIsChatDemoVideoShown(true);
      }, 1000);
    } else {
      setIsReplyCount(isReplyCount + 1);
    }
  };

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
    });
  };

  const handleImageLoadStart = (messageId: string) => {
    setLoadingImages(prev => ({ ...prev, [messageId]: true }));
  };

  const handleImageLoadEnd = (messageId: string) => {
    setLoadingImages(prev => ({ ...prev, [messageId]: false }));
  };
  const insets = useSafeAreaInsets();

  const [isKeyboardVisible, setIsKeyboardVisible] = useState(false);

  useEffect(() => {
    let keyboardDidShowListener: any;
    let keyboardDidHideListener: any;

    if (Platform.OS === 'ios') {
      keyboardDidShowListener = Keyboard.addListener(
        'keyboardWillShow',
        event => {
          setKeyboardHeight(event.endCoordinates.height);
          setIsKeyboardVisible(true);
          // Delay scroll to ensure layout is updated
        },
      );

      keyboardDidHideListener = Keyboard.addListener('keyboardWillHide', () => {
        setKeyboardHeight(0);
        setIsKeyboardVisible(false);
      });
    } else {
      // Android
      keyboardDidShowListener = Keyboard.addListener(
        'keyboardDidShow',
        event => {
          setKeyboardHeight(event.endCoordinates.height);
          setIsKeyboardVisible(true);
        },
      );

      keyboardDidHideListener = Keyboard.addListener('keyboardDidHide', () => {
        setKeyboardHeight(0);
        setIsKeyboardVisible(false);
      });
    }

    return () => {
      keyboardDidShowListener?.remove();
      keyboardDidHideListener?.remove();
    };
  }, []);

  // Render header component for pagination loading
  const renderListHeader = () => {
    if (loadingMore && hasMoreData) {
      return (
        <View style={styles.paginationLoader}>
          <ActivityIndicator size="small" color={theme.white} />
          <Text style={styles.paginationText}>Loading more messages...</Text>
        </View>
      );
    }
    return null;
  };

  // const combinedChatData = useMemo(() => {
  //   const result: (ChatMessage | { isAd: true; key: string })[] = [];
  //   let avatar_message_count = 0;

  //   // Reverse first, then process
  //   const reversedMessages = [...chatMessages].reverse();

  //   reversedMessages.forEach((msg, index) => {
  //     result.push(msg);

  //     // Only count actual avatar messages (not typing indicator)
  //     if (
  //       msg.avatar_message &&
  //       msg.avatar_message.trim().toLowerCase() !== 'typing...' &&
  //       msg.id &&
  //       !msg.id.toString().startsWith('typing-')
  //     ) {
  //       avatar_message_count++;

  //       // Insert ad after every chatBannerAdsCount avatar messages
  //       if (avatar_message_count % chatBannerAdsCount === 0) {
  //         result.push({
  //           isAd: true,
  //           key: `ad_${avatar_message_count}`,
  //         });
  //       }
  //     }
  //   });

  //   return result;
  // }, [chatMessages, chatBannerAdsCount]);

  const onBlurImagePress = (item: ChatMessage) => {
    console.log(
      'onBlurImagePress====?',
      item,
      item?.id,
      Number(userState.getState().userData?.user?.tokens),
    );
    setIdForBlurImageGenerate(item?.id || '');
    if (Number(userState.getState().userData?.user?.tokens) > 2) {
      AlertForBlurImage(item.id);
      return;
    }
    if (
      item.user_subscription_status === 'subscription_expired' ||
      item.user_subscription_status === 'subscribe_now'
    ) {
      console.log('onBlurImagePres<<<<', item.id);
      setIdForBlurImageGenerate(item?.id || '');
      // setIsOpen(true);
      selectedPhotoID.current = item.id as any;
      setIsOpenPreview({ isOpen: true, imageData: item.attachments?.file });
      setInfoMessage(item);
    } else {
      setInfoMessage(item);
      setIsOpen(true);
    }
  };

  const renderMessage = useCallback(
    ({ item, index }: { item: ChatMessage; index: number }) => {
      const messageId = `${item?.id || index}-${
        item.human_message_timestamp || item.avatar_message_timestamp
      }`;

      if (item?.attachments?.file) {
        const imageUri =
          typeof item.attachments.file === 'string'
            ? item.attachments.file
            : item.attachments.file?.uri; // <--- extract uri

        if (imageUri) {
          Image.getSize(
            imageUri,
            (width, height) => {
              console.log('Success to get image dimensions:', width, height);
              if (imageDimensionsRef && imageDimensionsRef.current) {
                imageDimensionsRef.current[item.id || 'default'] = {
                  width,
                  height,
                };
              }
            },
            error => {
              console.log('Failed to get image dimensions:', error);
            },
          );
        }
      }

      return (
        <>
          <View style={styles.messageContainer} key={messageId}>
            {/* Human message */}
            {item?.human_message ? (
              <View style={styles.userMessageContainer}>
                <View>
                  <View style={[styles.userBubble]}>
                    <Text style={styles.userText}>{item?.human_message}</Text>
                  </View>
                  {item?.human_message_timestamp && (
                    <Text style={[styles.timeStamp, { alignSelf: 'flex-end' }]}>
                      {formatTime(item?.human_message_timestamp)}
                    </Text>
                  )}
                </View>
                <View style={styles.botAvatar}>
                  <CommonImagePlaceHolder
                    key={`user-avatar-${messageId}`} // Add unique key
                    isAppIcon
                    image={userChatImage || undefined}
                    imageStyle={styles.avatarImage}
                    disabled={!userChatImage}
                    onPress={() => {
                      setIsOpenZoomView({
                        isVisible: true,
                        item: {
                          cover_image: userChatImage || undefined,
                        },
                      });
                    }}
                  />
                  <Text style={styles.timeStamp}></Text>
                </View>
              </View>
            ) : null}

            {/* Avatar message */}
            {item?.avatar_message ? (
              <TouchableOpacity
                activeOpacity={0.8}
                style={styles.botMessageContainer}
                disabled={item?.id ? false : true}
                onLongPress={() => {
                  if (item.attachments?.file) {
                    setOnReportVisible({
                      visible: true,
                      content: {
                        id: item?.attachments?.id,
                        cover_image: item?.attachments?.file,
                        name: user?.name,
                        type: 'message_attachment',
                      },
                    });
                  } else {
                    setOnReportVisible({
                      visible: true,
                      content: {
                        id: item?.id,
                        cover_image: user?.image || user?.cover_image,
                        message: item?.avatar_message,
                        name: user?.name,
                        type: 'message_id',
                      },
                    });
                  }
                }}
              >
                <View style={[styles.botAvatar, { marginRight: scale(8) }]}>
                  <CommonImagePlaceHolder
                    key={`bot-avatar-${messageId}`} // Add unique key
                    isAppIcon
                    image={user?.image || user?.cover_image || undefined}
                    imageStyle={styles.avatarImage}
                    disabled={!(user?.image || user?.cover_image)}
                    onPress={() => {
                      setIsOpenZoomView({
                        isVisible: true,
                        item: {
                          cover_image:
                            user?.image || user?.cover_image || undefined,
                        },
                      });
                    }}
                  />
                  <Text style={styles.timeStamp}></Text>
                </View>

                <View style={styles.botMessageContent}>
                  <View
                    style={[
                      styles.botBubble,
                      {
                        backgroundColor:
                          item.avatar_message == 'typing...'
                            ? 'transparent'
                            : '#f5f5f5',
                        shadowColor:
                          item.avatar_message == 'typing...'
                            ? 'transparent'
                            : theme.white,
                        paddingVertical:
                          item.avatar_message == 'typing...'
                            ? 0
                            : item.chat_message_type == 'image'
                            ? moderateScale(3)
                            : moderateScale(12),
                        paddingHorizontal:
                          item.avatar_message == 'typing...'
                            ? 0
                            : item.chat_message_type == 'image'
                            ? moderateScale(3)
                            : moderateScale(12),
                        borderBottomLeftRadius: 0,
                      },
                    ]}
                  >
                    {item?.chat_message_type === 'image' &&
                    (item?.attachments || item?.attachments?.file) ? (
                      <View style={styles.imageContainer}>
                        {item.attachments?.status == 'pending' &&
                        !item.attachments.is_dummy ? (
                          <View style={styles.imageLoadingOverlay}>
                            <ActivityIndicator
                              size="large"
                              color={theme.primaryFriend}
                            />
                          </View>
                        ) : (
                          <>
                            <TouchableOpacity
                              activeOpacity={1}
                              disabled={item?.attachments?.is_dummy}
                              style={{ zIndex: 99 }}
                              onPress={() => {
                                if (item.attachments?.is_dummy) {
                                  onBlurImagePress(item);
                                } else {
                                  setIsOpenZoomView({
                                    isVisible: true,
                                    isDownload: true,
                                    isShare: true,
                                    item: {
                                      id: item?.attachments?.id,
                                      cover_image: item?.attachments?.file,
                                      name: user?.name,
                                      message: 'image',
                                      width:
                                        imageDimensionsRef.current[
                                          item?.id || messageId
                                        ].width,
                                      height:
                                        imageDimensionsRef.current[
                                          item?.id || messageId
                                        ].height,
                                    },
                                  });
                                }
                              }}
                            >
                              <ImageBackground
                                blurRadius={
                                  item?.attachments?.is_dummy ? 20 : 0
                                }
                                key={`message-image-${messageId}`} // Add unique key
                                source={{ uri: item?.attachments?.file }}
                                style={[
                                  !item?.attachments?.is_dummy &&
                                  imageDimensionsRef.current &&
                                  imageDimensionsRef.current[
                                    item?.id || messageId
                                  ]
                                    ? {
                                        width:
                                          imageDimensionsRef.current[
                                            item?.id || messageId
                                          ].width,
                                        height:
                                          imageDimensionsRef.current[
                                            item?.id || messageId
                                          ].height / 2,
                                      }
                                    : {
                                        width: screenWidth * 0.6,
                                        // maxWidth: screenWidth * 0, // test in debug
                                        height: verticalScale(200),
                                      },
                                  { borderRadius: moderateScale(12) },
                                ]}
                                resizeMode={
                                  item?.attachments?.is_dummy
                                    ? 'cover'
                                    : 'contain'
                                }
                                onLoadStart={() =>
                                  handleImageLoadStart(item?.id || '')
                                }
                                onLoadEnd={() =>
                                  handleImageLoadEnd(item?.id || '')
                                }
                                onError={() =>
                                  handleImageLoadEnd(item?.id || '')
                                }
                              >
                                {item?.attachments?.is_dummy && (
                                  <TouchableOpacity
                                    activeOpacity={1}
                                    style={[
                                      styles.blurPressableArea,
                                      { zIndex: 9999 },
                                    ]}
                                    onPress={() => onBlurImagePress(item)}
                                  >
                                    {/* Lock icon overlay */}
                                    <View style={styles.lockIconContainer}>
                                      <View style={styles.lockIconBackground}>
                                        {item.user_subscription_status ===
                                        'insufficient_tokens' ? (
                                          <>
                                            <Text style={styles.unlockText}>
                                              {item?.attachments
                                                ?.required_tokens &&
                                              item?.attachments
                                                ?.required_tokens > 0 &&
                                              item?.attachments
                                                ?.required_tokens !== null
                                                ? item?.attachments
                                                    ?.required_tokens
                                                : 2}
                                            </Text>
                                            <Image
                                              source={IMAGES.token}
                                              style={styles.tokenIcon}
                                            />
                                          </>
                                        ) : (
                                          <Image
                                            source={IMAGES.lock}
                                            style={styles.lockIcon}
                                          />
                                        )}
                                      </View>
                                    </View>
                                  </TouchableOpacity>
                                )}
                              </ImageBackground>
                            </TouchableOpacity>
                            {!item?.attachments?.is_dummy && (
                              <TouchableOpacity
                                style={styles.downloadButton}
                                onPress={() => {
                                  if (item?.attachments?.file) {
                                    downloadRemoteImage(item.attachments.file);
                                    // handleDownloadAndShare(item.attachments.file);
                                  }
                                }}
                              >
                                <Image
                                  source={IMAGES.download}
                                  style={styles.downloadIcon}
                                />
                              </TouchableOpacity>
                            )}
                          </>
                        )}
                        <View style={styles.imageLoadingOverlay}>
                          <Image
                            key={`loading-overlay-${messageId}`} // Add unique key
                            source={IMAGES.app_icon}
                            style={[
                              styles.imageLoadingOverlay,
                              styles.messageImage,
                              { opacity: 0.5 },
                            ]}
                            resizeMode="cover"
                          />
                          <ActivityIndicator
                            size="large"
                            color={theme.primaryFriend}
                            style={{
                              zIndex:
                                item.attachments?.status == 'pending' ? 99 : 2,
                            }}
                          />
                        </View>
                      </View>
                    ) : item?.avatar_message?.includes('🎵') ||
                      item?.avatar_message?.includes('audio') ? (
                      // Audio message UI
                      <View style={styles.audioMessageContainer}>
                        <TouchableOpacity style={styles.playButton}>
                          <Text style={styles.playIcon}>▶</Text>
                        </TouchableOpacity>
                        <View style={styles.audioWaveform}>
                          {Array.from({ length: 20 }, (_, i) => (
                            <View
                              key={i}
                              style={[
                                styles.waveformBar,
                                { height: Math.random() * 20 + 5 },
                              ]}
                            />
                          ))}
                        </View>
                        <Text style={styles.audioDuration}>0:15</Text>
                      </View>
                    ) : item.avatar_message == 'typing...' ? (
                      <LottieView
                        key={`typing-${messageId}`} // Add unique key
                        source={AppAnimations.typing}
                        autoPlay
                        style={{
                          width: scale(50),
                          height: scale(30),
                          alignSelf: 'flex-start',
                        }}
                      />
                    ) : (
                      <Text style={styles.botText}>{item?.avatar_message}</Text>
                    )}
                  </View>

                  {item?.avatar_message_timestamp ? (
                    <Text style={styles.timeStamp}>
                      {formatTime(item?.avatar_message_timestamp)}
                    </Text>
                  ) : (
                    <Text style={styles.timeStamp}></Text>
                  )}
                </View>
              </TouchableOpacity>
            ) : null}
          </View>
          {/* {console.log(
            'chatBannerAdsCount------',
            index,
            chatBannerAdsCount,
            index !== 0 && index % chatBannerAdsCount == 0,
          )} */}

          {/* {item.isAd ? (
            <View style={styles.loadContainer}>
              <LoadBannerAd />
            </View>
          ) : null} */}
        </>
      );
    },
    [user, userChatImage], // Add theme to dependencies
  );

  /** ✅ useMemo: memoize keyExtractor */
  const keyExtractor = useCallback((item: ChatMessage, index: number) => {
    // Ensure unique keys by combining id with timestamp
    const uniqueId = item?.id
      ? `${item.id}-${
          item.human_message_timestamp || item.avatar_message_timestamp || index
        }`
      : `temp-${Date.now()}-${index}`;
    return uniqueId;
  }, []);

  // downloadRemoteImage function with proper error handling
  const downloadRemoteImage = async (imageUrl: string) => {
    try {
      if (!imageUrl) {
        showMessage({
          message: 'No image available to download.',
          type: 'danger',
          autoHide: true,
          style: { paddingTop: isAndroid ? verticalScale(30) : 0 },
        });
        return;
      }

      const filename = imageUrl.split('/').pop() || `image_${Date.now()}.jpg`;

      // Show download started message
      showMessage({
        message: 'Download starting...',
        description: 'Please wait a moment.',
        type: 'info',
        autoHide: true,
        backgroundColor: theme.primaryFriend,
        duration: 3000,
        style: { paddingTop: isAndroid ? verticalScale(30) : 0 },
      });

      // Define the AICrush folder path based on platform
      let folderPath;
      if (Platform.OS === 'ios') {
        folderPath = `${RNFS.DocumentDirectoryPath}/AICrush`;
      } else {
        folderPath = `${RNFS.PicturesDirectoryPath}/AICrush`;
      }

      // Ensure the folder exists
      const folderExists = await RNFS.exists(folderPath);
      if (!folderExists) {
        await RNFS.mkdir(folderPath);
      }

      // Full path for the downloaded image
      const destinationPath = `${folderPath}/${filename}`;

      // Download with progress tracking
      const downloadResult = await RNFS.downloadFile({
        fromUrl: imageUrl,
        toFile: destinationPath,
        // progress: res => {
        //   const percentage = Math.floor(
        //     (res.bytesWritten / res.contentLength) * 100,
        //   );
        //   console.log(
        //     'Image download progress:',
        //     percentage + '%',
        //     destinationPath,
        //   );
        // },
      }).promise;

      if (downloadResult.statusCode === 200) {
        if (Platform.OS === 'android') {
          try {
            await RNFS.scanFile(destinationPath);
            console.log('Media scan completed:', destinationPath);
          } catch (err) {
            console.warn('Media scan failed:', err);
          }
          showMessage({
            message: 'Image saved successfully!',
            description: 'You can access it in your Gallery',
            type: 'success',
            autoHide: true,
            duration: 3000,
            style: { paddingTop: isAndroid ? verticalScale(30) : 0 },
          });
        } else {
          try {
            const savedPath = await CameraRoll.save(
              `file://${destinationPath}`,
              {
                type: 'photo',
              },
            );
            // console.log('Saved to Camera Roll:', savedPath);

            // Optionally cleanup the file in Documents after saving
            try {
              await RNFS.unlink(destinationPath);
            } catch (unlinkErr) {
              console.warn('Could not delete temporary file:', unlinkErr);
            }

            showMessage({
              message: 'Image saved successfully!',
              description: 'You can access it in your device storage.',
              type: 'success',
              autoHide: true,
              duration: 3000,
              style: { paddingTop: isAndroid ? verticalScale(30) : 0 },
            });
          } catch (cameraRollErr) {
            console.error('CameraRoll save failed:', cameraRollErr);
            showMessage({
              message: 'Something Went Wrong, Please try again.',
              type: 'danger',
              autoHide: true,
              style: { paddingTop: isAndroid ? verticalScale(30) : 0 },
            });
          }
        }
        return destinationPath;
      } else {
        throw new Error(
          `Download failed with status ${downloadResult.statusCode}`,
        );
      }
    } catch (error) {
      console.error('Error saving image:', error);
      showMessage({
        message: 'Failed to save image. Please try again.',
        type: 'danger',
        autoHide: true,
        style: { paddingTop: isAndroid ? verticalScale(30) : 0 },
      });
      return 'Failed';
    }
  };

  let isProcessing = false;

  const handleDownloadAndShare = async (imageUrl: string) => {
    if (isProcessing) return;
    isProcessing = true;

    try {
      // 1️⃣ Download image to local cache
      const filename = imageUrl.split('/').pop() || `image_${Date.now()}.jpg`;
      const localPath = `${RNFS.CachesDirectoryPath}/${filename}`;

      const { promise } = RNFS.downloadFile({
        fromUrl: imageUrl,
        toFile: localPath,
      });
      await promise;

      // Save to Camera Roll on iOS (optional)
      if (Platform.OS === 'ios') {
        await CameraRoll.save(localPath, { type: 'photo' });
      }

      // 2️⃣ Share the local file (not the remote URL)
      await Share.open({
        title: 'Check this out!',
        message: ` Hey! I created this image using AICrush. Check out this app and create your own amazing images too! ${APP_URL}`,
        url: `file://${localPath}`, // ✅ Important: use file:// for local path
        type: 'image/jpeg',
      });
    } catch (err) {
      console.log('Error downloading or sharing image:', err);
      Alert.alert('Error', 'Failed to download or share the image.');
    } finally {
      isProcessing = false;
    }
  };

  const bottomSheetRef = useRef<CommonBottomSheetRef>(null);

  const openBottomSheet = () => {
    setTimeout(() => {
      Keyboard.dismiss();
      bottomSheetRef?.current?.snapToIndex(0);
    }, 200);
  };

  const closeBottomSheet = () => {
    bottomSheetRef.current?.close();
  };

  const generateBlutImageApiCall = (id?: any) => {
    const message_id = id ?? IdForBlurImageGenerate;
    if (message_id == null && !message_id) {
      return;
    }
    generateBlurImage(message_id).then(res => {
      showMessage({
        message: 'Blur Image Generated Successfully!',
        type: 'success',
        autoHide: true,
        duration: 3000,
        style: { paddingTop: isAndroid ? verticalScale(30) : 0 },
      });
      setIdForBlurImageGenerate(null);
    });
  };

  const generateBlutImageApiCallFree = () => {
    console.log(
      'API CALLED generateBlurImageFree :::::::',
      selectedPhotoID.current,
    );
    const message_id: any = selectedPhotoID.current ?? IdForBlurImageGenerate;
    if (message_id == null && !message_id) {
      return;
    }
    generateBlurImageFree(message_id)
      .then(res => {
        showMessage({
          message: 'Blur Image Generated Successfully!',
          type: 'success',
          autoHide: true,
          duration: 3000,
          style: { paddingTop: isAndroid ? verticalScale(30) : 0 },
        });
        setIdForBlurImageGenerate(null);
        selectedPhotoID.current = null;
        console.log('RES OF generateBlurImageFree:::::::::', res.data.data);
        setMessageId(res.data.data.message_id);
      })
      .catch(() => {
        selectedPhotoID.current = null;
      });
  };

  const AlertForBlurImage = (id?: any) => {
    Alert.alert(
      'Blur Image',
      'Are you sure you want to generate this image? This will use 2 of your tokens.',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'OK',
          onPress: () => {
            generateBlutImageApiCall(id);
          },
        },
      ],
    );
  };

  const renderBackdrop = useCallback(
    (props: BottomSheetBackdropProps) => (
      <BottomSheetBackdrop
        {...props}
        pressBehavior={'close'}
        disappearsOnIndex={-1}
        appearsOnIndex={0}
        opacity={0.4}
        style={{
          height: '100%',
          width: '100%',
          position: 'absolute',
        }}
      />
    ),
    [],
  );
  return (
    <View style={styles.container}>
      <StatusBar
        translucent
        backgroundColor={'transparent'}
        barStyle={'dark-content'}
      />
      {loadingMessages ? (
        <CustomActivityIndicator title="Loading Messages..." />
      ) : null}
      <ImageBackground style={{ flex: 1 }} source={IMAGES.app_splash_view2}>
        <ImageBackground
          style={{ flex: 1 }}
          source={{
            uri: user?.image || user?.cover_image,
          }}
        >
          <LinearGradient
            colors={[
              'rgba(0, 0, 0, 0.6)',
              'rgba(0, 0, 0, 0.0)',
              'rgba(0, 0, 0, 0.6)',
            ]}
            style={{ flex: 1 }}
          >
            <View style={{ flex: 1 }}>
              <KeyboardAvoidingView
                style={styles.keyboardContainer}
                behavior={
                  Platform.OS === 'ios'
                    ? 'padding'
                    : keyboardVisible
                    ? 'height'
                    : undefined
                }
                keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 0}
              >
                <SafeAreaView style={styles.headerContainer} edges={['top']}>
                  <View style={styles.row}>
                    <TouchableOpacity
                      style={styles.backButton}
                      onPress={() => {
                        Keyboard.dismiss();
                        navigation.goBack();
                      }}
                    >
                      <Image
                        source={IMAGES.back_icon}
                        style={[styles.backArrow, { tintColor: theme?.white }]}
                        resizeMode="contain"
                      />
                    </TouchableOpacity>

                    <View style={styles.headerProfile}>
                      <CommonImagePlaceHolder
                        isAppIcon
                        image={user?.image || user?.cover_image}
                        imageStyle={styles.headerAvatar}
                        onPress={() => {
                          setIsOpenZoomView({
                            isVisible:
                              user?.image || user?.cover_image ? true : false,
                            item: {
                              cover_image:
                                user?.image || user?.cover_image || undefined,
                            },
                          });
                        }}
                      />
                      <Text style={styles.headerName} numberOfLines={1}>
                        {user?.name || 'User'}
                      </Text>
                    </View>
                  </View>
                  <View style={[styles.row, { gap: 30 }]}>
                    <Animated.View
                      style={[{ transform: [{ scale: pulseAnim }] }]}
                    >
                      <TouchableOpacity
                        onPress={onCallPress}
                        style={{
                          backgroundColor: 'white',
                          borderRadius: scale(99),
                          overflow: 'hidden',
                        }}
                      >
                        <Image
                          source={IMAGES.avatar_call_icon}
                          style={styles.callIcon}
                        />
                      </TouchableOpacity>
                    </Animated.View>
                    <TouchableOpacity
                      onPress={() => {
                        setOnReportVisible({
                          visible: true,
                          content: {
                            id: chatId,
                            cover_image:
                              user?.image || user?.cover_image || undefined,
                            name: user?.name,
                            type: 'chat',
                          },
                        });
                      }}
                    >
                      <Image
                        source={IMAGES.report_icon}
                        style={[styles.callIcon, { tintColor: 'red' }]}
                      />
                    </TouchableOpacity>
                  </View>
                </SafeAreaView>

                <View style={styles.chatContainer}>
                  <NativeAdComponent
                    nativeAd={nativeAd}
                    type={remoteData.native_ads_chat_screen}
                    nativeStyles={{
                      backgroundColor: theme?.white,
                      marginBottom: scale(10),
                    }}
                  />
                  <FlatList
                    ref={flatListRef}
                    data={[...chatMessages].reverse()}
                    bounces={false}
                    keyExtractor={keyExtractor}
                    renderItem={renderMessage}
                    inverted={chatMessages.length !== 0}
                    ListFooterComponent={renderListHeader}
                    contentContainerStyle={[
                      styles.chatArea,
                      {
                        paddingBottom:
                          Platform.OS === 'android'
                            ? verticalScale(20)
                            : verticalScale(10),
                      },
                    ]}
                    ListEmptyComponent={
                      loadingMessages ? null : (
                        <CommonEmptyView
                          emptyImage={IMAGES.chat_list_empty_icon}
                          header={'No Chats Yet!'}
                          subHeader={
                            'Say hello and start your first conversation!'
                          }
                          subHeaderTxtStyle={styles.subHeaderTxtStyle}
                          // containerStyle={styles.containerStyle}
                        />
                      )
                    }
                    showsVerticalScrollIndicator={false}
                    onEndReached={handleLoadMore}
                    onEndReachedThreshold={0.5}
                    removeClippedSubviews={true} // Add this to improve performance
                    maxToRenderPerBatch={10} // Limit render batch size
                    windowSize={10} // Limit window size
                    getItemLayout={undefined}
                  />
                </View>

                <View
                  style={[
                    styles.inputContainer,
                    {
                      marginBottom: insets.bottom
                        ? isKeyboardVisible
                          ? 5
                          : verticalScale(insets.bottom)
                        : verticalScale(10),
                    },
                  ]}
                >
                  {remoteData?.defaultMessagesList?.length > 0 && (
                    <FlatList
                      data={remoteData?.defaultMessagesList}
                      horizontal
                      ListHeaderComponent={() => (
                        <View style={{ marginLeft: verticalScale(10) }} />
                      )}
                      ListFooterComponent={() => (
                        <View style={{ marginRight: verticalScale(10) }} />
                      )}
                      showsHorizontalScrollIndicator={false}
                      renderItem={({ item }) => {
                        return (
                          <TouchableOpacity
                            style={styles.defaultMessageContainer}
                            onPress={() => sendMessage(item)}
                          >
                            <Text style={styles.defaultMsgText}>{item}</Text>
                          </TouchableOpacity>
                        );
                      }}
                    />
                  )}
                  <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                    <View style={styles.inputWrapper}>
                      <TextInput
                        ref={textInputRef}
                        style={styles.textInput}
                        placeholder={'Write your message'}
                        placeholderTextColor={'#B0B0B0'}
                        value={message}
                        onChangeText={setMessage}
                        multiline
                        maxLength={1000}
                        returnKeyType={'default'}
                        enablesReturnKeyAutomatically={false}
                        scrollEnabled={true}
                      />
                    </View>

                    <TouchableOpacity
                      style={[
                        styles.sendButton,
                        !message.trim() && styles.sendButtonDisabled,
                      ]}
                      onPress={() => sendMessage(message)}
                      disabled={!message.trim()}
                    >
                      <Image
                        source={IMAGES.send_icon}
                        style={styles.footerIcons}
                      />
                    </TouchableOpacity>
                  </View>
                </View>
              </KeyboardAvoidingView>
            </View>
          </LinearGradient>
        </ImageBackground>
      </ImageBackground>

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

      {isOpen && !userData.user?.isCurrentlyEnabledSubscription && (
        <SubscriptionPopup
          isFromChat={infoMessage?.user_subscription_status}
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
            console.log('onSuccess===>', IdForBlurImageGenerate);
            if (IdForBlurImageGenerate !== null) {
              AlertForBlurImage();
            }
          }}
        />
      )}

      {isOpen && userData.user?.isCurrentlyEnabledSubscription && (
        <UpgradeCreditPopup
          isFromChat={infoMessage?.user_subscription_status}
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
            console.log('onSuccess===>', IdForBlurImageGenerate);
            if (IdForBlurImageGenerate !== null) {
              AlertForBlurImage();
            }
          }}
        />
      )}

      {isOpenZoomView && (
        <CommonZoomImageModal
          isDownload={isOpenZoomView.isDownload}
          isShare={isOpenZoomView.isShare}
          onShareImagePress={() =>
            isOpenZoomView?.item?.cover_image
              ? handleDownloadAndShare(isOpenZoomView?.item?.cover_image)
              : undefined
          }
          downloadRemoteImage={() =>
            isOpenZoomView?.item?.cover_image
              ? downloadRemoteImage(isOpenZoomView?.item?.cover_image)
              : undefined
          }
          visible={isOpenZoomView?.isVisible}
          source={isOpenZoomView?.item?.cover_image || undefined}
          isReport={isOpenZoomView?.item?.message === 'image'}
          onReportPress={() => {
            setIsOpenZoomView({ isVisible: false, item: undefined });
            setTimeout(() => {
              console.log('isOpenZoomView', isOpenZoomView);
              setOnReportVisible({
                visible: true,
                content: {
                  ...isOpenZoomView.item,
                  type:
                    isOpenZoomView?.item?.message === 'image'
                      ? 'message_attachment'
                      : 'chat',
                },
              });
            }, 500);
          }}
          onClose={() => {
            setIsOpenZoomView({ isVisible: false, item: undefined });
          }}
          imagesWidth={isOpenZoomView?.item?.width}
          imagesHeight={isOpenZoomView?.item?.height}
        />
      )}

      {onReportVisible?.visible && (
        <CustomReportIssueModal
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
          message={infoMessage}
          visible={showMessagePopup}
          onClose={() => setShowMessagePopup(false)}
          onPurchase={() => {
            setShowMessagePopup(false);
            setIsOpen(true);
          }}
          data={{
            status: isCallEnded
              ? 'call_insufficient_tokens'
              : infoMessage.user_subscription_status,
          }}
        />
      )}
      {/* <RomanticChatBottomSheet
        bottomSheetRef={bottomSheetRef}
        imageUrl="https://your-webp-image-url.webp"
      /> */}
      <CustomBottomSheet
        ref={bottomSheetRef}
        snapPoints={['65%']}
        index={-1}
        enablePanDownToClose={true}
        enableOverDrag={false}
        enableDynamicSizing={false}
        animateOnMount={false}
        enableContentPanningGesture={true}
        enableHandlePanningGesture={true}
        // containerStyle={{ flex: 1 }}
        backgroundStyle={{
          backgroundColor: theme.primaryBackground,
          borderTopLeftRadius: scale(20),
          borderTopRightRadius: scale(20),
        }}
        backdropComponent={renderBackdrop}
        onChange={index => {
          // if (index === -1) {
          //   setTheme('girlfriend');
          //   // setTheme(item.code || themeName);
          // }
        }}
      >
        <BottomSheetScrollView
          style={styles.bottomSheetScrollView}
          contentContainerStyle={styles.scrollContentContainer}
          showsVerticalScrollIndicator={false}
          bounces={false}
        >
          <RomanticChatBottomSheet
            handleSend={() => {
              sendMessage(textSheet);
              bottomSheetRef.current?.close();
            }}
            handleClose={() => {
              bottomSheetRef.current?.close();
            }}
          />
        </BottomSheetScrollView>
      </CustomBottomSheet>
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

export default ChatScreen;

const Styles = () => {
  const theme = useThemeStore().theme;
  const insets = useSafeAreaInsets();
  return StyleSheet.create({
    bottomSheetScrollView: {
      flex: 1,
    },
    scrollContentContainer: {
      flexGrow: 1,
      paddingBottom: verticalScale(100),
    },
    container: {
      flex: 1,
      backgroundColor: '#ccc',
      // paddingBottom: insets.bottom > 0 ? insets.bottom : 0,
    },
    headerContainer: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      paddingBottom: scale(20),
      paddingHorizontal: scale(20),
      alignItems: 'center',
    },

    // Header styles matching the image
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: scale(16),
      paddingVertical: verticalScale(12),
      backgroundColor: theme.primaryBackground,
      borderBottomWidth: 1,
      borderBottomColor: '#F0F0F0',
    },

    backButton: {
      padding: moderateScale(4),
    },

    callIcon: {
      width: scale(32),
      height: scale(32),
      resizeMode: 'contain',
    },

    backArrow: {
      width: scale(20),
      height: scale(20),
      tintColor: theme.primaryFriend,
    },

    headerProfile: {
      flexDirection: 'row',
      alignItems: 'center',
      marginLeft: scale(10),
    },

    headerAvatar: {
      width: scale(32),
      height: scale(32),
      borderRadius: scale(16),
      marginRight: scale(12),
    },

    headerName: {
      fontSize: moderateScale(18),
      color: theme.white,
      fontFamily: Fonts.ISemiBold,
      maxWidth: scale(150),
    },

    // Keyboard handling
    keyboardContainer: {
      flex: 1,
    },

    chatContainer: {
      flex: 1,
    },

    loadingContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
    },

    loadingText: {
      marginTop: verticalScale(12),
      fontSize: moderateScale(14),
      color: '#666',
    },

    // Pagination loader styles
    paginationLoader: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      paddingVertical: verticalScale(15),
      paddingHorizontal: scale(16),
    },

    paginationText: {
      marginLeft: scale(8),
      fontSize: moderateScale(14),
      color: theme.white,
      fontFamily: Fonts.ISemiBold,
    },

    chatArea: {
      paddingHorizontal: scale(16),
      paddingTop: verticalScale(16),
      paddingBottom: verticalScale(20), // Fixed bottom padding
      flexGrow: 1,
    },

    messageContainer: {
      marginBottom: verticalScale(16),
    },
    defaultMessageContainer: {
      backgroundColor: theme.secondayBackground,
      borderRadius: moderateScale(50),
      paddingHorizontal: moderateScale(16),
      height: verticalScale(45),
      justifyContent: 'center',
      marginHorizontal: scale(4),
      marginBottom: verticalScale(8),
    },

    // User message styles
    userMessageContainer: {
      alignSelf: 'flex-end',
      flexDirection: 'row',
      alignItems: 'flex-end',
    },

    userBubble: {
      backgroundColor: theme.primaryFriend,
      borderRadius: moderateScale(8),
      borderBottomRightRadius: moderateScale(4),
      paddingHorizontal: moderateScale(16),
      paddingVertical: moderateScale(8),
      maxWidth: screenWidth * 0.75,
      marginRight: scale(8),
    },

    userText: {
      color: theme.primaryBackground,
      fontSize: moderateScale(15),
      lineHeight: moderateScale(20),
    },

    timeStamp: {
      fontSize: moderateScale(11),
      color: '#fff',
      marginTop: verticalScale(4),
    },

    // Bot message styles
    botMessageContainer: {
      flexDirection: 'row',
      alignItems: 'flex-end',
      alignSelf: 'flex-start',
    },

    botAvatar: {
      alignItems: 'center',
    },

    avatarImage: {
      width: scale(25),
      height: scale(25),
      borderRadius: scale(20),
      borderColor: 'rgb(0, 0, 0,0.9)',
      borderWidth: 0.05,
    },

    botMessageContent: {
      flex: 1,
    },

    botBubble: {
      backgroundColor: theme.white,
      borderRadius: moderateScale(8),
      borderBottomLeftRadius: moderateScale(4),
      paddingVertical: moderateScale(8),
      maxWidth: screenWidth * 0.8,
      shadowColor: '#000',
      shadowOffset: {
        width: 0,
        height: 1,
      },
      shadowOpacity: 0.05,
      shadowRadius: 2,
      elevation: 1,
      alignSelf: 'flex-start',
    },

    botText: {
      color: '#374151',
      fontSize: moderateScale(15),
      lineHeight: moderateScale(20),
    },
    hyperLinkTxt: {
      color: theme.primaryFriend,
      textDecorationLine: 'underline',
      fontSize: moderateScale(15),
      marginLeft: scale(10),
      lineHeight: moderateScale(20),
    },

    // Image message styles
    imageContainer: {
      borderRadius: moderateScale(12),
      overflow: 'hidden',
      position: 'relative',
      alignItems: 'center',
      justifyContent: 'center',
      minWidth: screenWidth * 0.6,
      minHeight: verticalScale(200),
    },

    messageImage: {
      width: screenWidth * 0.6,
      height: verticalScale(200),
      borderRadius: moderateScale(12),
    },

    imageLoadingOverlay: {
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(255,255,255,0.8)',
      justifyContent: 'center',
      alignItems: 'center',
      zIndex: 1,
    },

    // Audio message styles
    audioMessageContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingVertical: verticalScale(8),
    },

    playButton: {
      width: scale(32),
      height: scale(32),
      borderRadius: scale(16),
      backgroundColor: theme.primaryFriend,
      justifyContent: 'center',
      alignItems: 'center',
      marginRight: scale(12),
    },

    playIcon: {
      color: theme.primaryBackground,
      fontSize: moderateScale(12),
      marginLeft: scale(2),
    },

    audioWaveform: {
      flex: 1,
      flexDirection: 'row',
      alignItems: 'center',
      height: verticalScale(30),
      marginRight: scale(12),
    },

    waveformBar: {
      width: scale(2),
      backgroundColor: theme.primaryBackground,
      marginHorizontal: scale(1),
      borderRadius: scale(1),
    },

    audioDuration: {
      fontSize: moderateScale(12),
      color: '#666',
    },

    // Enhanced Input container
    inputContainer: {
      alignItems: 'center',
      paddingVertical: verticalScale(12),
      borderTopColor: '#E5E7EB',
      shadowColor: '#B0B0B0',
      shadowOffset: {
        width: 0,
        height: -2,
      },
      shadowOpacity: 0.1,
      shadowRadius: 3,
      // minHeight: verticalScale(120),
    },

    inputContainerKeyboardAndroid: {
      // paddingBottom: verticalScale(8),
    },

    attachButton: {
      padding: moderateScale(8),
      justifyContent: 'center',
      alignItems: 'center',
      alignSelf: 'center',
    },

    inputWrapper: {
      flex: 1,
      backgroundColor: theme.primaryBackground,
      borderWidth: 1,
      borderColor: '#E5E7EB',
      borderRadius: moderateScale(20),
      paddingHorizontal: scale(16),
      paddingVertical: verticalScale(10),
      marginHorizontal: scale(8),
      minHeight: verticalScale(44),
      maxHeight: verticalScale(120),
      justifyContent: 'center',
    },

    textInput: {
      fontSize: moderateScale(15),
      color: theme.heading,
      lineHeight: moderateScale(20),
      minHeight: verticalScale(24),
      maxHeight: verticalScale(100),
      paddingTop: 0,
      paddingBottom: 0,
      paddingHorizontal: 0,
      margin: 0,
      includeFontPadding: false,
      textAlignVertical: 'top',
      fontFamily: Fonts.ISemiBold,
    },

    micButton: {
      padding: moderateScale(8),
      justifyContent: 'center',
      alignItems: 'center',
      alignSelf: 'center',
    },

    sendButton: {
      padding: moderateScale(10),
      justifyContent: 'center',
      alignItems: 'center',
      alignSelf: 'center',
      backgroundColor: theme.primaryFriend,
      width: scale(45),
      height: scale(45),
      marginRight: scale(10),
      borderRadius: moderateScale(99),
    },

    sendButtonDisabled: {
      opacity: 1,
      backgroundColor: theme.cardBorder,
    },

    footerIcons: {
      width: scale(24),
      height: scale(24),
      resizeMode: 'contain',
      tintColor: theme.white,
    },

    sendIconDisabled: {
      tintColor: theme.white,
    },
    row: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
    },
    subHeaderTxtStyle: { color: theme.white },
    containerStyle: { marginTop: verticalScale(80) },
    downloadButton: {
      position: 'absolute',
      top: scale(8),
      right: scale(8),
      width: scale(32),
      height: scale(32),
      borderRadius: scale(16),
      backgroundColor: 'rgba(0, 0, 0, 0.6)',
      justifyContent: 'center',
      alignItems: 'center',
      zIndex: 100,
      shadowColor: '#000',
      shadowOffset: {
        width: 0,
        height: 2,
      },
      shadowOpacity: 0.25,
      shadowRadius: 3.84,
      elevation: 5,
    },

    downloadIcon: {
      width: scale(18),
      height: scale(18),
      tintColor: theme.white,
      resizeMode: 'contain',
    },
    loadContainer: {
      paddingBottom: verticalScale(5),
      marginHorizontal: -scale(16),
    },
    defaultMsgText: {
      fontSize: moderateScale(15),
      color: theme.heading,
      fontFamily: Fonts.IMedium,
    },
    blurPressableArea: {
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      zIndex: 15,
      borderRadius: scale(15),
    },
    fullImageBlur: {
      zIndex: 15,
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      borderRadius: scale(15),
    },
    lockIconContainer: {
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      justifyContent: 'center',
      alignItems: 'center',
      zIndex: 16,
    },
    lockIconBackground: {
      // width: scale(80),
      // height: scale(80),
      flexDirection: 'row',
      backgroundColor: 'rgba(0, 0, 0, 0.7)',
      borderRadius: scale(10),
      paddingHorizontal: scale(15),
      paddingVertical: scale(10),
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
    },
    unlockText: {
      color: theme.white,
      fontSize: scale(20),
      marginRight: verticalScale(2),
      fontFamily: Fonts.IBold,
      textAlign: 'center',
      opacity: 0.8,
    },
    tokenIcon: {
      width: scale(22),
      height: scale(22),
      resizeMode: 'contain',
      // marginBottom: scale(8),
      // resizeMode: 'contain',
    },
    lockIcon: {
      width: scale(25),
      height: scale(25),
      resizeMode: 'contain',
      tintColor: theme.white,
      marginVertical: scale(8),
      // marginBottom: scale(8),
      // resizeMode: 'contain',
    },
    lockText: {
      color: theme.white,
      fontSize: scale(16),
      fontFamily: Fonts.ISemiBold,
      textAlign: 'center',
      marginBottom: scale(4),
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

export const useKeyboard = () => {
  const [keyboardHeight, setKeyboardHeight] = useState(0);
  const [isKeyboardVisible, setIsKeyboardVisible] = useState(false);

  useEffect(() => {
    const showEvent =
      Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow';
    const hideEvent =
      Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide';

    const keyboardDidShowListener = Keyboard.addListener(showEvent, event => {
      setKeyboardHeight(event.endCoordinates.height);
      setIsKeyboardVisible(true);
    });

    const keyboardDidHideListener = Keyboard.addListener(hideEvent, () => {
      setKeyboardHeight(0);
      setIsKeyboardVisible(false);
    });

    return () => {
      keyboardDidShowListener?.remove();
      keyboardDidHideListener?.remove();
    };
  }, []);

  return { keyboardHeight, isKeyboardVisible };
};
