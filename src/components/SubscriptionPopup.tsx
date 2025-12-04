import {
  View,
  Text,
  Modal,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  Animated,
  ScrollView,
  StatusBar,
  Dimensions,
  SafeAreaView,
  Platform,
  Alert,
  InteractionManager,
  Image,
} from 'react-native';
import React, {
  useState,
  useEffect,
  useRef,
  useCallback,
  useMemo,
} from 'react';
import { useThemeStore } from '../store/themeStore';
import CommonLinearContainer from './CommonLinearContainer';
import CustomHeader from './headers/CustomHeader';
import { scale, verticalScale, moderateScale } from '../utils/Scale';
import Fonts from '../utils/fonts';
import { ProductPack, userState } from '../store/userStore';
import { useIsFocused, useNavigation } from '@react-navigation/native';
import AppConstant from '../utils/AppConstant';
import {
  initConnection,
  clearTransactionIOS,
  finishTransaction,
  flushFailedPurchasesCachedAsPendingAndroid,
  requestPurchase,
  purchaseUpdatedListener,
  purchaseErrorListener,
  endConnection,
  RequestPurchase,
  getSubscriptions,
  requestSubscription,
  deepLinkToSubscriptionsAndroid,
} from 'react-native-iap';
import {
  EVENT_NAME,
  PRODUCT_IDS_SUBSCRIPTION,
  subscriptionSubTypes,
  subscriptionTypes,
} from '../constants';
import {
  getUserDetail,
  setCancelMessage,
  setEventTrackinig,
  setPlanVisit,
  setPurchase,
} from '../api/user';
import {
  logFirebaseEvent as handleFirebaseLogEvent,
  mapSubscriptionPlans,
} from '../utils/HelperFunction';
import LinearGradient from 'react-native-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAdsStore } from '../store/useAdsStore';
import CustomBottomSheet, { CommonBottomSheetRef } from './CommonBottomSheet';
import {
  BottomSheetBackdrop,
  BottomSheetBackdropProps,
  BottomSheetScrollView,
} from '@gorhom/bottom-sheet';
import CustomCancelPopup from './CustomCancelPopup';
import { Linking } from 'react-native';
import IMAGES from '../assets/images';
import { customColors } from '../utils/Colors';
import CustomTitleWithBackHeader from './CustomTitleWithBackHeader';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

// Define base plan IDs - make sure these match your Google Play Console
const PRODUCT_BASE_IDS = ['1-month-plan', '3-month-plan', '1-year-plan'];

type Props = {
  visible: boolean;
  disable?: boolean;
  onClose: () => void;
  onAd?: () => void;
  onLogin?: () => void;
  onSuccess?: () => void;
  onNavigate?: () => void;
  isFromChat?: boolean;
};

const SubscriptionPopup: React.FC<Props> = ({
  visible,
  disable,
  onClose,
  onAd,
  onLogin,
  onSuccess,
  onNavigate,
  isFromChat,
}) => {
  const styles = Styles();
  const { theme, isDark } = useThemeStore();
  const [loading, setLoading] = useState(false);
  const navigation = useNavigation<any>();

  // Optimized animation values with better timing curves
  const slideAnim = useRef(new Animated.Value(screenHeight)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const buttonScaleAnim = useRef(new Animated.Value(1)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const [loadingBtnSubmit, setLoadingBtnSubmit] = useState(false);

  // State management
  const [loadingSubscriptions, setLoadingSubscriptions] = useState(false);
  const [subscriptionDisplay, setSubscriptionDisplay] = useState<
    subscriptionSubTypes[]
  >([]);
  const {
    userData,
    setUserSelectedPlan,
    selectedPlan,
    setUserData,
    sentChatCount,
    resetChatCount,
  } = userState();
  const [error, setError] = useState('');
  const [isPurchasing, setIsPurchasing] = useState(false);

  // Refs
  const focus = useIsFocused();
  const purchaseUpdateSubscription = useRef<any>(null);
  const purchaseErrorSubscription = useRef<any>(null);
  const pulseAnimationRef = useRef<Animated.CompositeAnimation | null>(null);
  const subscriptionPlanFromAPI =
    userState.getState()?.productSubscriptionPlans ?? [];
  const [cancelTxt, setCancelTxt] = useState<string>('');

  const { oneMonthToken } = useAdsStore();
  const points = [
    'Unlimited messages',
    `${oneMonthToken} Tokens per month`,
    'Advertisement FREE experience',
    'Create own girlfriends-boyfriends',
    'Voice calls',
    'Faster response time',
    'Generate Girlfriend-Boyfriend Images',
  ];

  console.log('isFromChat-----', isFromChat);

  // Optimized animation configuration
  const animationConfig = useMemo(
    () => ({
      entry: {
        duration: 100,
        useNativeDriver: true,
        tension: 100,
        friction: 8,
      },
      exit: {
        duration: 250,
        useNativeDriver: true,
      },
      button: {
        duration: 100,
        useNativeDriver: true,
      },
      pulse: {
        duration: 2000,
        useNativeDriver: true,
      },
    }),
    [],
  );

  // Optimized modal entry/exit animations
  useEffect(() => {
    if (visible) {
      // Use InteractionManager to ensure smooth animation start
      InteractionManager.runAfterInteractions(() => {
        Animated.parallel([
          Animated.spring(slideAnim, {
            toValue: 0,
            ...animationConfig.entry,
          }),
          Animated.timing(fadeAnim, {
            toValue: 1,
            ...animationConfig.entry,
          }),
        ]).start();
      });

      // Optimized pulse animation for popular plan
      pulseAnimationRef.current = Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.015,
            ...animationConfig.pulse,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1.0,
            ...animationConfig.pulse,
          }),
        ]),
      );

      // Delay pulse animation start to avoid initial jank
      setTimeout(() => {
        pulseAnimationRef.current?.start();
      }, 500);

      return () => {
        pulseAnimationRef.current?.stop();
        pulseAnimationRef.current = null;
      };
    } else {
      slideAnim.setValue(screenHeight);
      fadeAnim.setValue(0);
      pulseAnim.setValue(1);
    }
  }, [visible, slideAnim, fadeAnim, pulseAnim, animationConfig]);

  const lastHandledTxId = useRef(null);
  const isProcessingPurchase = useRef(false);
  const listenerSetupCount = useRef(0);

  useEffect(() => {
    // CRITICAL: Prevent multiple listener setups
    if (purchaseUpdateSubscription.current) {
      console.log('Listeners already set up, skipping...');
      return;
    }

    listenerSetupCount.current += 1;
    console.log(
      'Setting up purchase listeners (count:',
      listenerSetupCount.current,
      ')',
    );

    // Clean up any existing listeners first (defensive)
    if (purchaseUpdateSubscription.current) {
      purchaseUpdateSubscription.current.remove();
    }

    purchaseUpdateSubscription.current = purchaseUpdatedListener(
      async purchase => {
        setTimeout(() => {
        userState.getState().setSplashState(false);
      }, 1000);
        if (userData?.user?.isCurrentlyEnabledSubscription) {
          if (purchaseErrorSubscription.current) {
            purchaseErrorSubscription.current.remove();
            purchaseErrorSubscription.current = null;
          }
          setLoading(false);
          setLoadingBtnSubmit(false);
          setIsPurchasing(false);
          isProcessingPurchase.current = false;
          try {
            await finishTransaction({ purchase, isConsumable: false });
            console.log('Transaction finished successfully');
          } catch (err) {
            console.warn(
              'finishTransaction failed, but continuing execution:',
              err,
              purchase,
            );
            console.log('finishTransaction failed', purchase);
          }
          if (purchaseErrorSubscription.current) {
            purchaseErrorSubscription.current.remove();
            purchaseErrorSubscription.current = null;
          }
          Alert.alert(
            'Subscription already active',
            'You already have an active subscription. Please cancel it first if you want to upgrade.',
          );
          onClose();
          console.log(
            '🔔 Purchase listener triggered but return',
            purchaseErrorSubscription.current,
          );
          return;
        }
        console.log('🔔 Purchase listener triggered');
        console.log('Transaction ID:', purchase?.transactionId);
        console.log('Stored TX ID:', userState.getState().tranactionId);
        console.log('Last handled:', lastHandledTxId.current);
        console.log('Is processing:', isProcessingPurchase.current);

        // FIRST: Check if already processing ANY purchase
        if (isProcessingPurchase.current) {
          console.log('⏸️ Already processing a purchase, IGNORING');
          return;
        }

        // SECOND: Validate transaction ID exists
        if (!purchase?.transactionId) {
          console.log('⚠️ No transaction ID, IGNORING');
          return;
        }

        // THIRD: Check if this exact transaction was already handled
        if (lastHandledTxId.current === purchase.transactionId) {
          console.log('⏭️ Already handled this transaction ID, IGNORING');
          return;
        }

        // FOURTH: Check if this transaction was already processed globally
        const storedTxId = userState.getState().tranactionId;
        if (storedTxId === purchase.transactionId) {
          console.log('✅ Transaction already processed globally, IGNORING');
          return;
        }

        // FIFTH: Validate we have a plan selected
        const currentPlan = userState.getState().selectedPlan;
        if (!currentPlan) {
          console.warn('❌ No selected plan in store, IGNORING');
          if (purchaseErrorSubscription.current) {
            purchaseErrorSubscription.current.remove();
            purchaseErrorSubscription.current = null;
          }
          setLoading(false);
          setLoadingBtnSubmit(false);
          setIsPurchasing(false);
          isProcessingPurchase.current = false;
          return;
        }

        // All checks passed - proceed with purchase
        console.log('✅ Processing purchase:', purchase.transactionId);

        // Set flags IMMEDIATELY before any async work
        isProcessingPurchase.current = true;
        lastHandledTxId.current = purchase.transactionId;

        const paramsPurchase = {
          product_id:
            Platform.OS === 'ios'
              ? purchase?.productId
              : currentPlan?.basePlanId,
          credit: currentPlan?.credits,
          price: currentPlan?.localizedPrice,
          subscription_payload: JSON.stringify(purchase),
        };
        console.log('paramsPurchase--->', currentPlan, paramsPurchase);

        try {
          if (purchaseErrorSubscription.current) {
            purchaseErrorSubscription.current.remove();
          }
          setIsPurchasing(true);
          setLoadingBtnSubmit(true);

          console.log('📦 Finishing transaction...');

          console.log('💾 Storing transaction ID...');
          userState.getState().setUserTransactionId(purchase.transactionId);

          console.log('🌐 Calling purchase API...');
          setLoadingBtnSubmit(false);
          setIsPurchasing(false);
          await postPurchaseApiCall(purchase, paramsPurchase);

          console.log('✅ Purchase completed successfully');
        } catch (err) {
          console.error('❌ Purchase processing error:', err);
          // Reset on error so user can retry
          lastHandledTxId.current = null;
          isProcessingPurchase.current = false;
        } finally {
          setLoadingBtnSubmit(false);
          setIsPurchasing(false);
          isProcessingPurchase.current = false;
        }
      },
    );

    purchaseErrorSubscription.current = purchaseErrorListener(error => {
      console.log('❌ Purchase error:', error);
      setIsPurchasing(false);
      setLoadingBtnSubmit(false);
      isProcessingPurchase.current = false;
      setTimeout(() => {
        userState.getState().setSplashState(false);
      }, 1000);
      setError(
        error?.code === 'E_USER_CANCELLED'
          ? 'Purchase cancelled by user'
          : error?.message || 'Purchase failed',
      );
    });

    // Cleanup function
    return () => {
      console.log('🧹 Cleaning up purchase listeners');
      if (purchaseUpdateSubscription.current) {
        purchaseUpdateSubscription.current.remove();
        purchaseUpdateSubscription.current = null;
      }
      if (purchaseErrorSubscription.current) {
        purchaseErrorSubscription.current.remove();
        purchaseErrorSubscription.current = null;
      }
      isProcessingPurchase.current = false;
    };
  }, []); // Empty dependency array - run only once

  // Initialize connection and fetch subscriptions
  useEffect(() => {
    if (focus && visible) {
      // Delay initialization to avoid blocking UI
      InteractionManager.runAfterInteractions(() => {
        init();
      });
    }
  }, [focus, visible]);

  const clearAllPendingPurchases = async () => {
    try {
      console.log('🧹 Clearing all pending purchases...');
      await initConnection();

      if (Platform.OS === 'android') {
        await flushFailedPurchasesCachedAsPendingAndroid();
        console.log('✅ All Android pending purchases cleared');
      } else {
        await clearTransactionIOS();
        console.log('✅ All iOS transactions cleared');
      }

      await endConnection();
    } catch (error) {
      console.error('Error clearing purchases:', error);
    }
  };

  const init = async () => {
    setPlanVisit();
    if (sentChatCount.length >= 3) {
      resetChatCount();
    }
    try {
      setLoadingSubscriptions(true);
      setError('');

      const connected = await initConnection();

      if (Platform.OS === 'android') {
        await flushFailedPurchasesCachedAsPendingAndroid();
        console.log('✅ All Android pending purchases cleared');
      } else {
        await clearTransactionIOS();
        console.log('✅ All iOS transactions cleared');
      }

      await handleGetSubscriptions();
    } catch (error) {
      console.log('Init error:', error);
      setLoadingSubscriptions(false);
      setError('Failed to initialize. Please try again.');
    }
  };

  const handleGetSubscriptions = async () => {
    try {
      console.log('Fetching subscriptions with IDs:', PRODUCT_IDS_SUBSCRIPTION);
      setLoadingSubscriptions?.(true);

      const resSubscriptions: any[] = await getSubscriptions({
        skus: PRODUCT_IDS_SUBSCRIPTION || [],
      });

      console.log('Raw subscription response:', resSubscriptions);

      if (!resSubscriptions || resSubscriptions.length === 0) {
        console.log('No subscriptions found in response');
        setError?.('No subscription plans found');
        setLoadingSubscriptions?.(false);
        return;
      }

      const firstItem = resSubscriptions[0];
      let subscriptionsToNormalize: any[] = [];

      // Android-like response: subscriptionOfferDetails nested inside product objects
      if (
        firstItem?.subscriptionOfferDetails ||
        firstItem?.platform === 'android' ||
        resSubscriptions.some((r: any) => r?.subscriptionOfferDetails)
      ) {
        // flatten all subscriptionOfferDetails from returned products (covers many libs/formats)
        subscriptionsToNormalize = resSubscriptions.flatMap((prod: any) => {
          if (
            Array.isArray(prod?.subscriptionOfferDetails) &&
            prod.subscriptionOfferDetails.length > 0
          ) {
            return prod.subscriptionOfferDetails;
          }
          // some libs wrap it under productDetails
          if (Array.isArray(prod?.productDetails?.subscriptionOfferDetails)) {
            return prod.productDetails.subscriptionOfferDetails;
          }
          return [];
        });
      } else {
        // iOS-like response: each item is a product / subscription object
        subscriptionsToNormalize = resSubscriptions;
      }

      if (!subscriptionsToNormalize || subscriptionsToNormalize.length === 0) {
        console.log('No subscription offer details found');
        setError?.('No subscription plans available');
        setLoadingSubscriptions?.(false);
        return;
      }

      // Try to set a product id for debugging / further use
      const productId =
        subscriptionsToNormalize[0]?.productId ||
        resSubscriptions[0]?.productId;
      console.log(
        'Product ID set to:',
        subscriptionsToNormalize,
        subscriptionPlanFromAPI,
      );

      // Normalize for UI (your normalizeSubscriptionList handles both platforms)
      const subscriptions = mapSubscriptionPlans(
        subscriptionsToNormalize as subscriptionSubTypes[],
        selectedPlan,
        subscriptionPlanFromAPI,
      );
      console.log('Normalizing subscriptions:', subscriptions);
      const selectedSubscription = subscriptions.find(sub => sub?.isSelect);
      // if (selectedSubscription) {
      //   setUserSelectedPlan(selectedSubscription);
      // }
      setSubscriptionDisplay?.(
        subscriptions.length > 0
          ? (subscriptions.filter(Boolean) as subscriptionSubTypes[])
          : [],
      );
      setLoadingSubscriptions?.(false);
    } catch (e) {
      console.log('Get subscriptions error:', e);
      setLoadingSubscriptions?.(false);
      setError?.('Failed to load subscription plans');
    }
  };

  const handleSubscribe = async () => {
    if (isPurchasing) {
      console.log('Purchase already in progress, skipping...');
      return;
    }

    setIsPurchasing(true);
    setLoadingBtnSubmit(true);
    setError('');
    console.log(
      'subscriptionDisplay',
      subscriptionDisplay,
      subscriptionDisplay.length,
    );
    try {
      if (subscriptionDisplay.length == 0) {
        throw new Error('Product ID not found. Please try refreshing.');
      }

      const selectedSubscription = subscriptionDisplay.find(
        sub => sub.isSelect,
      );
      setUserSelectedPlan(selectedSubscription);

      if (!selectedSubscription) {
        throw new Error('Selected subscription plan not found');
      }

      console.log('Selected subscription details:', {
        selectedPlan,
        selectedSubscription,
      });

      let purchaseParams: RequestPurchase;

      if (Platform.OS === 'android') {
        console.log('selectedPlan----->', selectedPlan, selectedSubscription);
        if (!selectedSubscription?.offerToken) {
          throw new Error('Offer token not found for selected plan');
        }

        purchaseParams = {
          sku: 'ai_dating_subscription',
          subscriptionOffers: [
            {
              sku: 'ai_dating_subscription',
              offerToken: selectedSubscription?.offerToken,
            },
          ],
        };
      } else if (Platform.OS === 'ios') {
        purchaseParams = {
          sku: selectedSubscription?.basePlanId,
        };
      }

      console.log('Initiating purchase with params:', purchaseParams);
      userState.getState().setSplashState(true);

      const purchase = await requestSubscription(purchaseParams);
      console.log('Purchase request response:', purchase);
    } catch (error: any) {
      console.log('Subscription error:', error);
      setIsPurchasing(false);
      setLoadingBtnSubmit(false);
      setLoading(false);

      let errorMessage = 'Purchase failed';

      if (error?.code === 'E_USER_CANCELLED') {
        errorMessage = 'Purchase cancelled';
      } else if (error?.message?.includes('sku was not found')) {
        errorMessage =
          'Product not found. Please check your internet connection and try again.';
      } else if (error?.message) {
        console.log('Subscription error-message:', error);
        errorMessage = error.message;
      }

      setError(errorMessage);
      // Alert.alert('Purchase Error', errorMessage);
    }
  };

  const bottomSheetRef = useRef<CommonBottomSheetRef>(null);

  const openBottomSheet = () => {
    setTimeout(() => {
      bottomSheetRef?.current?.snapToIndex(0);
    }, 200);
  };

  // Optimized plan selection with reduced animation complexity
  const handlePlanSelect = useCallback(
    (plan: subscriptionSubTypes, index: number) => {
      const updatedArray = subscriptionDisplay.map((item, sindex) =>
        sindex === index
          ? { ...item, isSelect: true }
          : { ...item, isSelect: false },
      );
      handleFirebaseLogEvent(EVENT_NAME.SELECTED_PURCHASE_PLAN, {
        product: plan,
        user_id: userData?.user?.id,
      });
      setEventTrackinig({
        event_type: EVENT_NAME.SELECTED_PURCHASE_PLAN,
      });
      setSubscriptionDisplay(updatedArray);
      setUserSelectedPlan(plan);
      console.log('setSelectedPlan--->', plan, subscriptionDisplay);
      setError('');

      // Simplified button press animation
      Animated.timing(buttonScaleAnim, {
        toValue: 0.98,
        duration: 50,
        useNativeDriver: true,
      }).start(() => {
        Animated.timing(buttonScaleAnim, {
          toValue: 1,
          duration: 100,
          useNativeDriver: true,
        }).start();
      });
    },
    [subscriptionDisplay, buttonScaleAnim],
  );

  const cancelPlan = () => {
    setUserSelectedPlan(undefined);
    setError('');
    setLoadingBtnSubmit(false);
    setLoadingSubscriptions(false);
    setIsPurchasing(false);
    handleCancelSubscription();
    handleCancelSubscription();
  };

  const handlePurchase = async () => {
    const selctedPlan = subscriptionDisplay.filter(item => item.isSelect);

    if (selctedPlan?.length) {
      setUserSelectedPlan(selctedPlan?.[0]);
    }
    if (loading || isPurchasing) {
      console.log('Purchase already in progress');
      return;
    }

    if (!selectedPlan?.basePlanId && !selctedPlan?.[0]?.basePlanId) {
      setError('Please select a plan first');
      // Alert.alert(
      //   'No Plan Selected',
      //   'Please select a subscription plan first',
      // );
      return;
    }

    if (userData?.isGuestUser) {
      onLogin?.();
      return;
    }

    console.log('Starting purchase for plan:', selectedPlan?.basePlanId);
    setLoading(true);

    // Quick button press feedback
    Animated.timing(buttonScaleAnim, {
      toValue: 0.95,
      duration: 100,
      useNativeDriver: true,
    }).start();

    try {
      await handleSubscribe();
    } catch (error) {
      console.log('Purchase initiation failed:', error);
      setLoading(false);
      Animated.timing(buttonScaleAnim, {
        toValue: 1,
        duration: 100,
        useNativeDriver: true,
      }).start();
    }
  };

  const postPurchaseApiCall = async (purchase: any, paramsRequest: any) => {
    try {
      console.log('PURCHASE-REQUEST--->', paramsRequest);
      await setPurchase(paramsRequest).then(async resPurchase => {
        console.log('resPurchase--->', resPurchase);
        try {
          await finishTransaction({ purchase, isConsumable: false });
          console.log('Transaction finished successfully');
        } catch (err) {
          console.warn(
            'finishTransaction failed, but continuing execution:',
            err,
          );
        }
        await getUserDetail().then(async res => {
          setUserData({
            ...userData,
            user: res?.data?.data?.user,
          });
          try {
            handleFirebaseLogEvent(EVENT_NAME.PURCHASED_SUCCESS, {
              user_id: res?.data?.data?.user?.id,
              product_id: paramsRequest?.product_id,
              transaction_id: paramsRequest?.transaction_id,
              credits: paramsRequest?.credit,
              platform: Platform.OS,
            });
            setEventTrackinig({ event_type: EVENT_NAME.PURCHASED_SUCCESS });
            setUserSelectedPlan(undefined);
          } catch (error) {
            console.log('PURCHASE-EVENT-ERROR--->', error);
          }
          onClose();
          onSuccess?.();
          setIsPurchasing(false);
          setLoadingBtnSubmit(false);
          setLoading(false);
          return;
        });
      });
    } catch (error) {
      setIsPurchasing(false);
      setLoadingBtnSubmit(false);
      setLoading(false);
    }
  };

  // Optimized close handler with better animation timing
  const handleClose = useCallback(() => {
    Animated.parallel([
      Animated.timing(slideAnim, {
        toValue: screenHeight,
        ...animationConfig.exit,
      }),
      Animated.timing(fadeAnim, {
        toValue: 0,
        ...animationConfig.exit,
      }),
    ]).start(() => {
      onClose();
      handleFirebaseLogEvent(EVENT_NAME.CLOSE_SUBSCRIPTION_PAGE, {
        is_pro_user: userData.user?.isCurrentlyEnabledSubscription,
        user_id: userData.user?.id,
      });
      setEventTrackinig({ event_type: EVENT_NAME.CLOSE_SUBSCRIPTION_PAGE });
    });
  }, [slideAnim, fadeAnim, animationConfig.exit, onClose]);

  // Memoized plan item renderer for better performance
  const renderPlanItem = useCallback(
    ({ item, index }: { item: subscriptionSubTypes; index: number }) => {
      // Only apply pulse animation to popular items and when not loading
      const animatedStyle =
        item.isPopular && !loading && !isPurchasing
          ? { transform: [{ scale: pulseAnim }] }
          : {};

      return (
        <Animated.View
          style={[
            animatedStyle,
            {
              marginBottom: verticalScale(15),
              // marginHorizontal: scale(4),
              marginTop: index === 0 ? verticalScale(10) : 0,
              borderRadius: moderateScale(8),
            },
          ]}
        >
          <LinearGradient
            colors={
              item.isSelect
                ? [theme.girlFriend, theme.girlFriend]
                : ['#0ac4fd', '#005f9a']
            }
            start={{ x: 1.0, y: 0.5 }}
            end={{ x: 0.0, y: 0.5 }}
            style={[styles.planContainer]}
          >
            <TouchableOpacity
              style={[
                styles.planContainer,
                {
                  backgroundColor: item.isSelect
                    ? isDark ? theme.primaryBackground : '#f3ebfc'
                    : theme.primaryBackground,
                },
              ]}
              onPress={() => handlePlanSelect(item, index)}
              activeOpacity={0.8}
              disabled={loading || isPurchasing}
            >
              <View style={{ paddingVertical: item?.isPopular ? 0 : scale(0) }}>
                <View style={styles.priceRow}>
                  {item?.isPopular ? (
                    <View
                      style={[
                        styles.mostValueBadge,
                        {
                          backgroundColor: item.isSelect
                            ? theme.primaryFriend
                            : '#005f9a',
                        },
                      ]}
                    >
                      <Text style={styles.mostValueText}>Best Value</Text>
                    </View>
                  ) : (
                    <Text></Text>
                  )}
                  <Text
                    style={[
                      styles.monthlyTxt,
                      {
                        color: item.isSelect ? theme.girlFriend : '#005f9a',
                      },
                    ]}
                  >
                    {item?.planPeriod}
                  </Text>
                </View>

                <View style={styles.priceCreditsRow}>
                  <View style={styles.currentPriceContainer}>
                    <Text style={[styles.currentPrice]}>
                      {item.currency}
                      {item.priceNumber}
                    </Text>
                    {/* <Text style={[styles.priceDecimal]}>.{item.decimal}</Text> */}
                    <Text style={styles.perMonthText}>
                      {' '}
                      / {item.perPlanTxt}
                    </Text>
                  </View>

                  <View style={styles.creditsContainer}>
                    <Text style={[styles.creditsNumber]}>{item.credits}</Text>
                    <Text style={[styles.creditsLabel]}> Coins</Text>
                  </View>
                </View>
              </View>
            </TouchableOpacity>
          </LinearGradient>
        </Animated.View>
      );
    },
    [
      selectedPlan?.basePlanId,
      handlePlanSelect,
      loading,
      isPurchasing,
      pulseAnim,
      styles,
      theme,
    ],
  );

  // Memoized feature point renderer
  const RenderFeaturePoint = React.memo(
    ({ item, index }: { item: string; index: number }) => {
      // Function to render text with bold for specific keywords
      const renderText = (text: string) => {
        // Define words that need to be bold
        const boldWords = ['FREE', 'Voice calls', 'Faster'];
        // If entire text should be bold
        if (text === 'Unlimited messages' || text === 'Voice calls')
          return <Text style={{ fontWeight: 'bold' }}>{text}</Text>;

        // Split text by spaces and bold specific words
        return text.split(' ').map((word, i) => {
          const shouldBold = boldWords.some(bw => word.includes(bw));
          return (
            <Text
              key={i}
              style={{ fontWeight: shouldBold ? 'bold' : 'normal' }}
            >
              {word + ' '}
            </Text>
          );
        });
      };

      return (
        <Animated.View
          style={[
            styles.pointItemContainer,
            {
              opacity: fadeAnim,
              transform: [
                {
                  translateX: fadeAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [-20, 0],
                  }),
                },
              ],
            },
          ]}
        >
          <View style={styles.pointDot} />
          <Text style={styles.pointText}>{renderText(item)}</Text>
        </Animated.View>
      );
    },
    [fadeAnim, styles],
  );

  // Memoized keyExtractor functions for better FlatList performance
  const featureKeyExtractor = useCallback(
    (item: string, index: number) => `feature-${index}`,
    [],
  );
  const planKeyExtractor = useCallback(
    (item: subscriptionSubTypes) => `plan-${item.basePlanId}`,
    [],
  );

  // Memoized loading state check
  const isAnyLoading = useMemo(
    () => loading || isPurchasing || loadingSubscriptions,
    [loading, isPurchasing, loadingSubscriptions],
  );

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

  const cancelApiCall = async (message: string) => {
    try {
      await setCancelMessage({ cancel_reason: message });
    } catch (error) {
      console.error('Error setting cancel message:', error);
    }
  };

  const handleCancelSubscription = async () => {
    console.log('cancelTxt--->', cancelTxt);
    try {
      await cancelApiCall(cancelTxt);
      if (Platform.OS === 'android' && PRODUCT_IDS_SUBSCRIPTION?.length) {
        await deepLinkToSubscriptionsAndroid({
          sku: PRODUCT_IDS_SUBSCRIPTION[0],
        });
      } else if (Platform.OS === 'ios') {
        await Linking.openURL('https://apps.apple.com/account/subscriptions');
      } else {
        Alert.alert('Error', 'Unable to open subscription settings.');
      }
    } catch (error) {
      console.error('Error cancelling subscription:', error);
      Alert.alert('Error', 'Failed to cancel subscription. Please try again.');
    } finally {
      bottomSheetRef.current?.close();
    }
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="none"
      statusBarTranslucent={true}
      presentationStyle="overFullScreen"
      onRequestClose={handleClose}
    >
      <StatusBar
        backgroundColor="transparent"
        barStyle="dark-content"
        translucent
      />
      <Animated.View
        style={[
          styles.fullScreenContainer,
          // {
          //   transform: [{ translateY: slideAnim }],
          //   opacity: fadeAnim,
          // },
        ]}
      >
        <CommonLinearContainer
          containerStyle={styles.linearContainer}
          colors={
            isDark
              ? [theme.primaryBackground, theme.primaryBackground]
              : [theme.white, '#f3ebfc']
          }
        >
          <SafeAreaView style={styles.safeArea}>
            {/* Header */}
            <CustomHeader
              headerLeftComponent={
                <CustomTitleWithBackHeader
                  title="Buy Coins"
                  onPress={handleClose}
                  txtStyle={{ color: theme.girlFriend }}
                  btnStyle={{ tintColor: theme.girlFriend }}
                />
              }
              containerStyle={styles.headerContainer}
            />

            {isFromChat && (
              <View style={styles.tokenContainer}>
                <Image source={IMAGES.token_star} style={styles.coinInner} />
                <Text style={styles.title}>Subscribe Now!</Text>
                <Text style={styles.subtitle}>
                  I'd love to talk with you, but you need subscription. Please
                  buy more to continue! 💫
                </Text>
              </View>
            )}

            <ScrollView
              style={styles.contentContainer}
              contentContainerStyle={{
                // justifyContent: 'flex-end',
                flexGrow: 1,
              }}
              bounces={false}
            >
              {userData?.user?.active_subscription_detail?.is_active && (
                <View style={styles.balanceContainer}>
                  <Image source={IMAGES.token} style={styles.tokenIcon} />
                  <Text style={styles.balanceTxt}>
                    {`Your Balance: ${userData.user?.tokens}`}
                  </Text>
                </View>
              )}
              {userData?.user?.active_subscription_detail?.credit &&
                userData?.user?.active_subscription_detail?.price && (
                  <LinearGradient
                    colors={[theme.girlFriend, theme.boyFriend]}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={{
                      backgroundColor: 'red',
                      zIndex: 2,
                      borderRadius: 8,
                    }}
                  >
                    {/* CURRENT Label - Positioned on the left side */}

                    {/* Popular Badge */}
                    <Text style={styles.currentTxt}>CURRENT</Text>
                    <TouchableOpacity style={styles.planCard2} disabled>
                      <View style={styles.planContent}>
                        <View style={styles.planPriceView}>
                          <Text
                            style={[
                              styles.priceText,
                              {
                                color: theme.primaryText,
                              },
                            ]}
                          >
                            {userData?.user?.active_subscription_detail?.price}
                          </Text>
                        </View>
                        <View
                          style={{
                            justifyContent: 'center',
                            alignItems: 'center',
                            flexDirection: 'row',
                          }}
                        >
                          <Image
                            source={IMAGES.coin}
                            style={styles.coinImage}
                          />
                          <Text
                            style={[
                              styles.creditsLabel,
                              {
                                color: theme.girlFriend,
                                fontFamily: Fonts.ISemiBold,
                              },
                            ]}
                          >
                            {' '}
                            Coin:
                          </Text>
                          <Text
                            style={[
                              styles.creditsNumber,
                              { color: theme.girlFriend },
                            ]}
                          >
                            {' '}
                            {userData?.user?.active_subscription_detail?.credit}
                          </Text>
                        </View>
                      </View>
                    </TouchableOpacity>
                  </LinearGradient>
                )}

              {/* Premium Features Section */}
              <View style={styles.featuresSection}>
                {userData?.user?.active_subscription_detail?.credit &&
                  userData?.user?.active_subscription_detail?.price && (
                    <Text style={styles.header2}>
                      Upgrade your subscription for more credits
                    </Text>
                  )}
                {points.map((item, index) => {
                  return <RenderFeaturePoint item={item} index={index} />;
                })}
              </View>

              {/* Plans Section */}
              {loadingSubscriptions ? (
                <View style={styles.loadingContainer}>
                  <Text style={styles.loadingText}>
                    Loading subscription plans...
                  </Text>
                </View>
              ) : (
                <View style={styles.plansSection}>
                  <FlatList
                    data={subscriptionDisplay}
                    renderItem={renderPlanItem}
                    keyExtractor={planKeyExtractor}
                    scrollEnabled={false}
                    showsVerticalScrollIndicator={false}
                    contentContainerStyle={styles.plansList}
                    removeClippedSubviews={true}
                    maxToRenderPerBatch={3}
                    windowSize={3}
                    getItemLayout={(data, index) => ({
                      length: verticalScale(100), // Approximate item height
                      offset: verticalScale(100) * index,
                      index,
                    })}
                  />
                </View>
              )}
            </ScrollView>

            {/* Purchase Button - Fixed at bottom */}
            <Animated.View
              style={[
                styles.purchaseButtonContainer,
                { transform: [{ scale: buttonScaleAnim }] },
              ]}
            >
              <TouchableOpacity
                style={[
                  styles.purchaseButton,
                  isAnyLoading && styles.purchaseButtonLoading,
                ]}
                onPress={handlePurchase}
                disabled={isAnyLoading}
                activeOpacity={0.8}
              >
                {loading || isPurchasing ? (
                  <View style={styles.loadingButtonContainer}>
                    <Text style={styles.purchaseButtonText}>Processing...</Text>
                  </View>
                ) : (
                  <Text style={styles.purchaseButtonText}>
                    Purchase Subscription
                  </Text>
                )}
              </TouchableOpacity>
              {error ? (
                <View style={styles.errorContainer}>
                  <Text style={styles.errorText}>{error}</Text>
                  <TouchableOpacity
                    onPress={() => setError('')}
                    style={styles.dismissButton}
                    activeOpacity={0.7}
                  >
                    <Text style={styles.dismissText}>Dismiss</Text>
                  </TouchableOpacity>
                </View>
              ) : null}
              {userData?.user?.active_subscription_detail?.is_active && (
                <TouchableOpacity onPress={() => openBottomSheet()}>
                  <Text style={styles.cancelText}>Cancel Subscription</Text>
                </TouchableOpacity>
              )}

              <View style={styles.purchaseButtonTextContainer}>
                <Text
                  style={styles.privacyText}
                  onPress={() => {
                    onNavigate?.();
                    navigation.navigate(AppConstant.privacyPolicy);
                  }}
                >
                  Privacy Policy
                </Text>
                <Text
                  style={styles.privacyText}
                  onPress={() => {
                    onNavigate?.();
                    navigation.navigate(AppConstant.privacyPolicy, {
                      isTerms: true,
                    });
                  }}
                >
                  Terms & Conditions
                </Text>
              </View>
            </Animated.View>
          </SafeAreaView>
        </CommonLinearContainer>
      </Animated.View>
      <CustomBottomSheet
        ref={bottomSheetRef}
        snapPoints={['60%']}
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
          <CustomCancelPopup
            onClose={() => bottomSheetRef.current?.close()}
            cancel={cancelPlan}
            setCancelTxt={setCancelTxt}
            cancelTxt={cancelTxt}
          />
        </BottomSheetScrollView>
      </CustomBottomSheet>
    </Modal>
  );
};

export default SubscriptionPopup;

const Styles = () => {
  const {isDark,theme} = useThemeStore();
  const insets = useSafeAreaInsets();
  return StyleSheet.create({
    fullScreenContainer: {
      flex: 1,
    },
    linearContainer: {
      flex: 1,
    },
    tokenContainer: {
      // flex: 1,
      alignItems: 'center',
      // backgroundColor: 'red',
      // marginVertical: verticalScale(20),
      gap: verticalScale(10),
    },
    coinInner: {
      width: scale(60),
      height: scale(60),
      borderRadius: 40,
      backgroundColor: '#FFC107',
      justifyContent: 'center',
      alignItems: 'center',
      borderWidth: 2,
      borderColor: '#FFD700',
    },
    title: {
      fontSize: scale(20),
      fontFamily: Fonts.ISemiBold,
      color: theme.primaryFriend,
      textAlign: 'center',
    },
    subtitle: {
      fontSize: scale(14),
      fontFamily: Fonts.IRegular,
      color: customColors.black,
      textAlign: 'center',
      lineHeight: 22,
      marginBottom: 8,
      width: '85%',
    },
    safeArea: {
      flex: 1,
    },
    headerContainer: {
      backgroundColor: 'transparent',
      paddingBottom: verticalScale(10),
    },
    contentContainer: {
      flex: 1,
      paddingHorizontal: scale(20),
    },
    scrollContent: {
      paddingHorizontal: scale(20),
      justifyContent: 'flex-end',
    },
    // Error styles
    errorContainer: {
      backgroundColor: '#FFE6E6',
      borderColor: '#FF4444',
      borderWidth: 1,
      borderRadius: moderateScale(8),
      padding: scale(5),
      margin: scale(5),
      alignItems: 'center',
    },
    errorText: {
      color: '#FF4444',
      fontSize: moderateScale(14),
      fontFamily: Fonts.IRegular,
      textAlign: 'center',
      marginBottom: verticalScale(8),
    },
    header2: {
      fontSize: moderateScale(22),
      fontFamily: Fonts.ISemiBold,
      color: theme.girlFriend,
      // marginTop: 40,
      marginBottom: scale(10),
    },
    dismissButton: {
      paddingHorizontal: scale(16),
      paddingVertical: verticalScale(6),
      backgroundColor: '#FF4444',
      borderRadius: moderateScale(4),
    },
    dismissText: {
      color: '#FFFFFF',
      fontSize: moderateScale(12),
      fontFamily: Fonts.IMedium,
    },
    // Loading styles
    loadingContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      paddingHorizontal: scale(20),
    },
    loadingText: {
      fontSize: moderateScale(16),
      fontFamily: Fonts.IRegular,
      color: '#666666',
      textAlign: 'center',
    },
    // Features Section
    featuresSection: {
      marginTop: verticalScale(10),
    },
    pointItemContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: verticalScale(8),
      // paddingHorizontal: scale(5),
    },
    pointDot: {
      width: scale(10),
      height: scale(10),
      borderRadius: scale(10),
      backgroundColor: theme.girlFriend,
      marginRight: scale(10),
    },
    pointText: {
      fontSize: moderateScale(16),
      fontFamily: Fonts.IRegular,
      color: theme.primaryText,
      flex: 1,
    },
    // Plans Section
    plansSection: {
      // marginBottom: verticalScale(20),
    },
    plansList: {
      paddingHorizontal: scale(4),
      // paddingTop: verticalScale(15),
    },
    planContainer: {
      borderRadius: moderateScale(8),
      position: 'relative',
      overflow: 'hidden',
      margin: 2,
    },
    planIAPContainer: {
      borderRadius: moderateScale(8),
      marginHorizontal: scale(4),
      overflow: 'visible',
      backgroundColor: theme.white,
    },
    planIAPContainer1: {
      borderRadius: moderateScale(8),
      paddingVertical: scale(12),
    },
    discountBadge: {
      position: 'absolute',
      top: verticalScale(-20),
      left: scale(16),
      paddingHorizontal: scale(5),
      paddingVertical: verticalScale(5),
      borderRadius: moderateScale(6),
      zIndex: 10,
      shadowColor: '#000',
      shadowOffset: {
        width: 0,
        height: 2,
      },
      shadowOpacity: 0.2,
      shadowRadius: 3,
      elevation: 5,
    },
    discountText: {
      fontSize: moderateScale(14),
      fontFamily: Fonts.IBold,
      color: '#FFFFFF',
      textAlign: 'center',
    },
    mostValueBadge: {
      paddingHorizontal: scale(12),
      paddingVertical: verticalScale(2),
      borderTopRightRadius: moderateScale(6),
      borderBottomRightRadius: moderateScale(6),
      shadowColor: '#000',
      shadowOffset: {
        width: 0,
        height: 2,
      },
      shadowOpacity: 0.2,
      shadowRadius: 3,
      elevation: 5,
      alignSelf: 'flex-end',
    },
    mostValueText: {
      fontSize: moderateScale(10),
      fontFamily: Fonts.IRegular,
      color: theme.white,
      textAlign: 'center',
    },
    planContent: {
      // marginTop: verticalScale(20),
      justifyContent: 'space-between',
      alignItems: 'center',
      flexDirection: 'row',
    },
    priceRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginTop: scale(10),
    },
    originalPriceText: {
      fontSize: moderateScale(14),
      fontFamily: Fonts.ISemiBold,
      color: '#B0B0B0',
      textDecorationLine: 'line-through',
      paddingLeft: scale(15),
    },
    priceCreditsRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'flex-end',
      paddingHorizontal: scale(12),
    },
    currentPriceContainer: {
      flexDirection: 'row',
      alignItems: 'baseline',
    },
    currentPrice: {
      fontSize: moderateScale(25),
      fontFamily: Fonts.IBold,
      color:isDark ? theme.primaryText : '#4F4F4F',
      lineHeight: moderateScale(32),
    },
    priceDecimal: {
      fontSize: moderateScale(16),
      fontFamily: Fonts.IMedium,
      color:isDark ? theme.primaryText : '#4F4F4F',
      lineHeight: moderateScale(32),
    },
    perMonthText: {
      fontSize: moderateScale(12),
      fontFamily: Fonts.IMedium,
      color:isDark ? theme.primaryText : '#4F4F4F',
      lineHeight: moderateScale(32),
    },
    creditsContainer: {
      flexDirection: 'row',
      alignItems: 'flex-end',
    },
    creditsNumber: {
      fontSize: moderateScale(20),
      fontFamily: Fonts.IBold,
      lineHeight: moderateScale(42),
      color:isDark ? theme.primaryText : '#4F4F4F',
    },
    creditsLabel: {
      fontSize: moderateScale(15),
      fontFamily: Fonts.IRegular,
      color:isDark ? theme.primaryText : '#4F4F4F',
      lineHeight: moderateScale(38),
    },
    perMothsTxt: {
      fontSize: moderateScale(12),
      fontFamily: Fonts.IBold,
      color: theme.text,
      marginBottom: verticalScale(10),
    },
    // Purchase Button Section
    purchaseButtonContainer: {
      backgroundColor: isDark ? theme.primaryBackground : 'rgba(255, 255, 255, 0.95)',
      paddingHorizontal: scale(20),
      paddingTop: verticalScale(5),
      borderTopWidth: StyleSheet.hairlineWidth,
      borderTopColor: isDark ? '#E5E7EB' : '#E5E7EB',
    },
    purchaseButton: {
      backgroundColor: theme.girlFriend,
      borderRadius: moderateScale(12),
      paddingVertical: verticalScale(12),
      paddingHorizontal: scale(30),
      shadowColor: theme.girlFriend,
      shadowOffset: {
        width: 0,
        height: 4,
      },
      shadowOpacity: 0.3,
      shadowRadius: 8,
      elevation: 8,
    },
    purchaseButtonLoading: {
      backgroundColor: '#999',
    },
    purchaseButtonText: {
      fontSize: moderateScale(18),
      fontFamily: Fonts.IBold,
      color: theme.white,
      textAlign: 'center',
    },
    loadingButtonContainer: {
      flexDirection: 'row',
      justifyContent: 'center',
      alignItems: 'center',
    },
    purchaseButtonTextContainer: {
      marginVertical: verticalScale(7),
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    privacyText: {
      fontSize: moderateScale(12),
      fontFamily: Fonts.IBold,
      color: theme.girlFriend,
      marginBottom:
        Platform.OS === 'ios'
          ? 0
          : insets.bottom
          ? verticalScale(insets.bottom)
          : verticalScale(0),
    },
    monthlyTxt: {
      fontSize: moderateScale(13),
      fontFamily: Fonts.IBold,
      color: theme.heading,
      textAlign: 'right',
      marginHorizontal: scale(7),
    },
    yourSaveTxt: {
      fontSize: moderateScale(12),
      fontFamily: Fonts.IMedium,
      color: theme.girlFriend,
    },
    bottomSheetScrollView: {
      flex: 1,
    },
    scrollContentContainer: {
      flexGrow: 1,
      paddingBottom: verticalScale(100),
    },
    cancelText: {
      fontSize: scale(12),
      fontFamily: Fonts.IMedium,
      color: theme.heading,
      // marginBottom: scale(10),
      textAlign: 'center',
      textDecorationLine: 'underline',
      marginVertical: scale(5),
      // lineHeight: 20,
      textDecorationColor: theme.heading, // set underline color
      textDecorationStyle: 'solid',
    },

    balanceContainer: {
      backgroundColor: theme.bottomTabBackground,
      paddingVertical: 10,
      alignItems: 'center',
      borderWidth: 2,
      borderColor: theme.primaryFriend,
      borderRadius: 8,
      flexDirection: 'row',
      justifyContent: 'center',
      gap: 4,
      marginBottom: 10,
    },
    balanceTxt: {
      fontSize: scale(16),
      fontFamily: Fonts.IBold,
      color: theme.primaryFriend,
    },
    tokenIcon: {
      width: scale(26),
      height: scale(26),
      resizeMode: 'contain',
      // marginBottom: scale(8),
      // resizeMode: 'contain',
    },
    currentTxt: {
      position: 'absolute',
      zIndex: 1,
      // top: 0,
      left: '-2%',
      // right: 0,
      transform:
        Platform.OS === 'ios'
          ? [{ rotateZ: '270deg' }]
          : [{ rotate: '270deg' }],
      bottom: '39%',
      // width: 10,
      // padding: 10,
      color: theme.white,
      fontFamily: Fonts.ISemiBold,
      fontSize: scale(10),
    },
    planCard2: {
      overflow: 'hidden',
      paddingVertical: scale(12),
      paddingHorizontal: scale(10),
      backgroundColor: theme.bottomTabBackground,
      margin: scale(2.5),
      borderBottomRightRadius: 8,
      borderTopRightRadius: 8,
      marginLeft: scale(30), // Extra padding to account for CURRENT label
    },
    planPriceView: {
      alignItems: 'center',
      justifyContent: 'center',
    },
    priceText: {
      fontSize: scale(22),
      fontFamily: Fonts.ISemiBold,
      textAlign: 'center',
      marginTop: scale(4),
    },
    coinImage: {
      width: scale(20),
      height: scale(20),
      resizeMode: 'contain',
    },
  });
};
