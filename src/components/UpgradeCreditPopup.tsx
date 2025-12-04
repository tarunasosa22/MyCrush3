import {
  Alert,
  ImageBackground,
  Linking,
  Modal,
  Platform,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { useThemeStore } from '../store/themeStore';
import IMAGES from '../assets/images';
import CustomHeader from './headers/CustomHeader';
import { moderateScale, scale, verticalScale } from '../utils/Scale';
import { Image } from 'react-native';
import { FlatList } from 'react-native';
import Fonts from '../utils/fonts';
import { useIsFocused, useNavigation } from '@react-navigation/native';
import {
  clearTransactionIOS,
  deepLinkToSubscriptionsAndroid,
  endConnection,
  finishTransaction,
  flushFailedPurchasesCachedAsPendingAndroid,
  getAvailablePurchases,
  getProducts,
  initConnection,
  purchaseErrorListener,
  purchaseUpdatedListener,
  requestPurchase,
  RequestPurchase,
} from 'react-native-iap';
import {
  PRODUCT_IDS_IAP,
  PRODUCT_IDS_SUBSCRIPTION,
  ProductPack,
} from '../constants';
import { mapIapProducts } from '../utils/HelperFunction';
import { userState } from '../store/userStore';
import LottieView from 'lottie-react-native';
import { AppAnimations } from '../assets/animation';
import { Animated } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import ProductSkeleton from './skeletons/ProductSkeleton';
import CustomActivityIndicator from './CustomActivityIndicator';
import {
  getUserDetail,
  setCancelMessage,
  setIAPPurchase,
  setPlanVisit,
  setPurchase,
} from '../api/user';
import { useAdsStore } from '../store/useAdsStore';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import AppConstant from '../utils/AppConstant';
import CustomBottomSheet, { CommonBottomSheetRef } from './CommonBottomSheet';
import {
  BottomSheetBackdrop,
  BottomSheetBackdropProps,
  BottomSheetScrollView,
} from '@gorhom/bottom-sheet';
import CustomCancelPopup from './CustomCancelPopup';
import { customColors } from '../utils/Colors';
import CommonPrimaryButton from './buttons/CommonPrimaryButton';
import CommonLinearContainer from './CommonLinearContainer';

type Props = {
  visible: boolean;
  disable?: boolean;
  isFromChat?: string;
  onClose: () => void;
  onAd?: () => void;
  onLogin?: () => void;
  onSuccess?: () => void;
  onNavigate?: () => void;
};

type Plan = {
  credits: number;
  price: string;
  title?: string;
};
const plans: Plan[] = [
  {
    credits: 10,
    price: '$ 0.50',
  },
  {
    credits: 200,
    price: '$ 30.0',
    title: 'MOST POPULAR',
  },
  {
    credits: 60,
    price: '$ 10.0',
  },
];

const UpgradeCreditPopup = (props: Props) => {
  const {
    visible,
    disable,
    onClose,
    onAd,
    onLogin,
    onSuccess,
    onNavigate,
    isFromChat,
  } = props;

  const styles = Styles();
  const focus = useIsFocused();
  const { theme, isDark } = useThemeStore();
  const navigation = useNavigation<any>();
  const [error, setError] = useState('');
  const [isPurchasing, setIsPurchasing] = useState(false);
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const {
    selectedIAPPlan,
    setUserSelectedIAPPlan,
    setIsOpenPlan,
    setUserTransactionId,
    isOpenPlan,
    tranactionId,
    userData,
    setUserData,
  } = userState();
  const [loadingSubriptions, setLoadingSubriptions] = useState(false);
  const [loadingBtnSubmit, setLoadingBtnSubmit] = useState(false);
  const [productsDisplay, setProductsDisplay] = useState<any[]>([]);
  const [scaleValues] = useState(plans.map(() => new Animated.Value(1)));
  const [opacityValues] = useState(plans.map(() => new Animated.Value(1)));
  const purchaseUpdatePlan = useRef<any>(null);
  const purchaseErrorPlan = useRef<any>(null);
  const [cancelTxt, setCancelTxt] = useState<string>('');

  console.log('isFromChat----', isFromChat);

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

  const bottomSheetRef = useRef<CommonBottomSheetRef>(null);

  const openBottomSheet = () => {
    setTimeout(() => {
      bottomSheetRef?.current?.snapToIndex(0);
    }, 200);
  };

  useEffect(() => {
    if (focus && visible) {
      fadeAnim.setValue(0);
      Animated.sequence([
        Animated.parallel([
          Animated.timing(fadeAnim, {
            toValue: 1,
            duration: 800,
            useNativeDriver: true,
          }),
        ]),
      ]).start();

      // Continuous animations
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.1,
            duration: 800,
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 800,
            useNativeDriver: true,
          }),
        ]),
      ).start();
      init();
    }
  }, [focus, visible]);

  const isFetchingRef = useRef(false);

  const init = async () => {
    setPlanVisit();
    try {
      setLoadingSubriptions(true);
      setError('');

      const connected = await initConnection();

      if (Platform.OS === 'android') {
        try {
          await flushFailedPurchasesCachedAsPendingAndroid();
          console.log('✅ Cleared pending Android purchases');
        } catch (flushErr) {
          console.warn(
            '⚠️ flushFailedPurchasesCachedAsPendingAndroid failed:',
            flushErr,
          );
        }
      } else {
        await clearTransactionIOS();
      }
      await handleGetSubscriptions(PRODUCT_IDS_IAP);
    } catch (error) {
      console.log('Init error:', error);
      setLoadingSubriptions(false);
      setError('Failed to initialize. Please try again.');
    }
  };

  const lastHandledIAPTxId = useRef(null);
  const isProcessingIAPPurchase = useRef(false);
  const failedIAPTransactions = useRef(new Set());

  useEffect(() => {
    if (visible && !purchaseUpdatePlan.current) {
      console.log('🔧 Setting up IAP purchase listeners');
       setTimeout(() => {
          userState.getState().setSplashState(false);
        }, 1000);
      purchaseUpdatePlan.current = purchaseUpdatedListener(async purchase => {
        console.log('🔔 IAP Purchase listener triggered');
        console.log('Transaction ID:', purchase?.transactionId);
        console.log('Product ID:', purchase?.productId);
        console.log('Last handled:', lastHandledIAPTxId.current);
        console.log('Is processing:', isProcessingIAPPurchase.current);

        // FIRST: Check if already processing ANY purchase
        if (isProcessingIAPPurchase.current) {
          console.log('⏸️ Already processing an IAP purchase, IGNORING');
          return;
        }

        // SECOND: Validate transaction ID exists
        if (!purchase?.transactionId) {
          console.log('⚠️ No transaction ID, IGNORING');
          return;
        }

        // THIRD: Check if this transaction previously failed
        if (failedIAPTransactions.current.has(purchase.transactionId)) {
          console.log('🚫 Transaction previously failed, IGNORING');
          return;
        }

        // FOURTH: Check if this exact transaction was already handled
        if (lastHandledIAPTxId.current === purchase.transactionId) {
          console.log('⏭️ Already handled this transaction ID, IGNORING');
          return;
        }

        // FIFTH: Check if this transaction was already processed globally
        const storedTxId = userState.getState().tranactionId;
        if (storedTxId === purchase.transactionId) {
          console.log('✅ Transaction already processed globally, IGNORING');
          return;
        }

        // SIXTH: Check if user is guest
        if (userState.getState().userData?.isGuestUser) {
          console.log('👤 Guest user detected, IGNORING purchase');
          setLoadingBtnSubmit(false);
          setIsPurchasing(false);
          return;
        }

        // All checks passed - proceed with purchase
        console.log('✅ Processing IAP purchase:', purchase.transactionId);

        // Set flags IMMEDIATELY before any async work
        isProcessingIAPPurchase.current = true;
        lastHandledIAPTxId.current = purchase.transactionId;

        // Get the current selected IAP plan from state
        const currentIAPPlan = userState.getState().selectedIAPPlan;
        if (!currentIAPPlan) {
          console.warn('❌ No selected IAP plan in store');
          if (purchaseUpdatePlan.current) {
            purchaseUpdatePlan.current.remove();
            purchaseUpdatePlan.current = null;
          }
          isProcessingIAPPurchase.current = false;
          lastHandledIAPTxId.current = null;
          setLoadingBtnSubmit(false);
          setIsPurchasing(false);
          return;
        }

        console.log('Selected IAP plan:', currentIAPPlan);

        const paramsPurchase = {
          product_id: purchase?.productId,
          credit: currentIAPPlan?.credits,
          onetime_payload: JSON.stringify(purchase),
        };

        try {
          if (purchaseErrorPlan.current) {
            purchaseErrorPlan.current.remove();
            console.log('🗑️ Removed IAP error listener during purchase');
          }

          setIsPurchasing(true);
          setLoadingBtnSubmit(true);
          console.log('🔒 Set IAP purchasing states to true');

          console.log('📦 Starting finishTransaction (IAP)...');
          try {
            await finishTransaction({ purchase, isConsumable: true });
            console.log('✅ finishTransaction (IAP) completed successfully');
          } catch (finishErr) {
            console.error('❌ finishTransaction (IAP) failed:', finishErr);
            // Even if finish fails, continue to try API call
            console.log('⚠️ Continuing despite finishTransaction error...');
          }

          console.log('💾 Storing transaction ID in userState...');
          userState.getState().setUserTransactionId(purchase.transactionId);
          console.log('✅ Transaction ID stored:', purchase.transactionId);

          console.log(
            '🌐 About to call postPurchaseApiCall (IAP) with params:',
            paramsPurchase,
          );
          try {
            await postPurchaseApiCall(purchase, paramsPurchase);
            console.log('✅ postPurchaseApiCall (IAP) completed successfully');
            // Clear failed transactions on success
            failedIAPTransactions.current.clear();
          } catch (apiErr) {
            console.error('❌ postPurchaseApiCall (IAP) failed:', apiErr);
            throw apiErr;
          }

          console.log('🎉 IAP Purchase completed successfully');
        } catch (err: any) {
          console.error('❌ IAP Purchase processing error:', err);
          console.error('Error details:', {
            message: err?.message,
            code: err?.code,
            response: err?.response,
          });

          // Mark this transaction as failed
          failedIAPTransactions.current.add(purchase.transactionId);

          // Reset flags to allow retry
          lastHandledIAPTxId.current = null;
          isProcessingIAPPurchase.current = false;

          // Check if this is a 400 error (invalid request)
          if (err?.response?.status === 400) {
            console.error('🚫 Server rejected IAP purchase (400)');
            Alert.alert(
              'Purchase Verification Failed',
              'The server could not verify your purchase. If you were charged, please contact support with transaction ID: ' +
                purchase.transactionId.substring(
                  Math.max(0, purchase.transactionId.length - 8),
                ),
              [{ text: 'OK' }],
            );
          } else {
            Alert.alert(
              'Purchase Error',
              `Failed to process purchase: ${err?.message || 'Unknown error'}`,
              [{ text: 'OK' }],
            );
          }

          setError(err?.message || 'Purchase failed');
        } finally {
          console.log('🧹 Cleanup: resetting IAP purchasing states');
          setLoadingBtnSubmit(false);
          setIsPurchasing(false);
          isProcessingIAPPurchase.current = false;
        }
      });

      purchaseErrorPlan.current = purchaseErrorListener(error => {
        console.log('❌ IAP Purchase error:', error);
        setIsPurchasing(false);
        setLoadingBtnSubmit(false);
        isProcessingIAPPurchase.current = false;
        setTimeout(() => {
          userState.getState().setSplashState(false);
        }, 1000);
        if (error?.code === 'E_USER_CANCELLED') {
          setError('Purchase cancelled by user');
        } else {
          setError(error?.message || 'Purchase failed');
        }
      });
    }

    return () => {
      console.log('🧹 Cleaning up IAP purchase listeners');
      if (purchaseUpdatePlan.current) {
        purchaseUpdatePlan.current.remove();
        purchaseUpdatePlan.current = null;
      }
      if (purchaseErrorPlan.current) {
        purchaseErrorPlan.current.remove();
        purchaseErrorPlan.current = null;
      }
      isProcessingIAPPurchase.current = false;
    };
  }, [visible]);

  const postPurchaseApiCall = async (purchase: any, paramsRequest: any) => {
    try {
      if (purchaseUpdatePlan.current) {
        purchaseUpdatePlan.current.remove();
        purchaseUpdatePlan.current = null;
      }
      console.log('PURCHASE-REQUEST--->', paramsRequest);
      await setIAPPurchase(paramsRequest).then(async resPurchase => {
        console.log('resPurchase--->', resPurchase);
        await getUserDetail().then(async res => {
          setUserData({
            ...userData,
            user: res?.data?.data?.user,
          });
          setUserSelectedIAPPlan(undefined);
          onClose();
          onSuccess?.();
          setIsPurchasing(false);
          setLoadingBtnSubmit(false);
          return;
        });
      });
    } catch (error) {
      setIsPurchasing(false);
      setLoadingBtnSubmit(false);
    }
  };

  const handleGetSubscriptions = async (productId: any) => {
    try {
      if (isFetchingRef.current) {
        console.log(
          'Previous getProducts call still running — skipping new one',
        );
        setLoadingSubriptions(false);
        return;
      }

      isFetchingRef.current = true;
      setLoadingSubriptions(true);
      const resProducts = await getProducts({ skus: productId });

      console.log('DATA---->', resProducts);
      if (resProducts.length > 0) {
        const IAPsubscriptions: any = mapIapProducts(
          resProducts,
          selectedIAPPlan?.id || undefined,
          userState.getState()?.productIAPPlans ?? [],
        );
        console.log('IAPsubscriptions===>', IAPsubscriptions);
        const selctedPlan = IAPsubscriptions.find(
          (item: any) => item?.isSelect,
        );
        // if (selctedPlan) {
        //   setUserSelectedIAPPlan(selctedPlan);
        // }
        setProductsDisplay(IAPsubscriptions);
        setLoadingSubriptions(false);

        if (
          selectedIAPPlan &&
          !userState.getState()?.userData?.isGuestUser &&
          visible &&
          Number(userState.getState()?.userData?.user?.tokens) <= 0
        ) {
          setTimeout(() => {
            onPurchase();
          }, 500);
        }
      } else {
        setLoadingSubriptions(false);
      }
    } catch (e) {
      setLoadingSubriptions(false);
      console.log('DATATTA--->', e);
    }
  };

  const onPurchase = () => {
    const selctedPlan = productsDisplay.find(item => item.isSelect);
    console.log('selctedPlan--->', productsDisplay, selctedPlan);
    if (selctedPlan) {
      setUserSelectedIAPPlan(selctedPlan);
    }
    if (userState.getState()?.userData?.isGuestUser) {
      onLogin?.();
      return;
    }
    let id = selctedPlan?.id ?? selectedIAPPlan?.id;
    let credits = selctedPlan?.credits ?? selectedIAPPlan?.credits;
    handleSubscribe(id, credits);
  };

  const handleSubscribe = async (sku: string, credits: number) => {
    console.log('sku---->', sku);
    if (isPurchasing) return; // Prevent duplicate request
    setIsPurchasing(true);
    try {
      setLoadingBtnSubmit(true);
      setError('');
      if (Platform.OS === 'ios') {
        await clearTransactionIOS();
      } else if (Platform.OS == 'android') {
        await flushFailedPurchasesCachedAsPendingAndroid();
      }
      let purchaseParams: RequestPurchase = {
        sku,
      };
      if (Platform.OS === 'android') {
        purchaseParams = {
          skus: [sku],
        };
      } else if (Platform.OS === 'ios') {
        purchaseParams = {
          sku,
        };
      }
      userState.getState().setSplashState(true);
      const purchase = await requestPurchase(purchaseParams);
      console.log('PURCHASE--->', purchase);
    } catch (error: any) {
      console.log('ERROR-->', error);
      setIsPurchasing(false);
      setIsOpenPlan(false);
      setUserSelectedIAPPlan(undefined);
      if (error?.code === 'E_USER_CANCELLED') {
        setError('Process cancelled by user');
      } else {
        setError(error?.message || 'Error request subscription');
      }
      setLoadingBtnSubmit(false);
    } finally {
      // setIsPurchasing(false);
      // setLoadingBtnSubmit(false);
    }
  };

  const handlePlanSelect = (plan: ProductPack, index: number) => {
    const updatedArray = productsDisplay.map((item, sindex) =>
      sindex === index
        ? { ...item, isSelect: true }
        : { ...item, isSelect: false },
    );
    setProductsDisplay(updatedArray);
    setUserSelectedIAPPlan(plan);
    setError('');
    plans.forEach((_, i) => {
      if (i !== index) {
        Animated.parallel([
          Animated.timing(scaleValues[i], {
            toValue: 1,
            duration: 200,
            useNativeDriver: true,
          }),
          Animated.timing(opacityValues[i], {
            toValue: 0.6,
            duration: 200,
            useNativeDriver: true,
          }),
        ]).start();
      }
    });

    Animated.parallel([
      Animated.spring(scaleValues[index], {
        toValue: 1.05,
        tension: 120,
        friction: 7,
        useNativeDriver: true,
      }),
      Animated.timing(opacityValues[index], {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const RenderFeaturePoint = React.memo(({ item }: { item: string }) => {
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
          <Text key={i} style={{ fontWeight: shouldBold ? 'bold' : 'normal' }}>
            {word + ' '}
          </Text>
        );
      });
    };
    return (
      <View style={styles.pointItemContainer}>
        <View style={styles.pointDot} />
        <Text style={styles.pointText}>{renderText(item)}</Text>
      </View>
    );
  });

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

  const cancelPlan = () => {
    setIsOpenPlan(false);
    setUserSelectedIAPPlan(undefined);
    setError('');
    setLoadingBtnSubmit(false);
    setLoadingSubriptions(false);
    setIsPurchasing(false);
    handleCancelSubscription();
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      statusBarTranslucent={true}
      presentationStyle="overFullScreen"
      onRequestClose={onClose}
    >
      <StatusBar
        backgroundColor="transparent"
        barStyle="dark-content"
        translucent
      />
      {loadingBtnSubmit || loadingSubriptions || isPurchasing ? (
        <CustomActivityIndicator />
      ) : null}
      <CommonLinearContainer
        containerStyle={styles.fullScreenContainer}
        colors={
          isDark
            ? [theme.primaryBackground, theme.primaryBackground]
            : [theme.white, '#f3ebfc']
        }
      >
        <LottieView
          source={AppAnimations.hearts}
          autoPlay
          loop
          style={{
            flex: 1,
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            opacity: 0.2,
            // zIndex: 1,
          }}
        />

        <CustomHeader
          containerStyle={{
            backgroundColor: 'transparent',
            marginTop: useSafeAreaInsets().top,
          }}
          headerLeftComponent={<View></View>}
          headerRightComponent={
            <TouchableOpacity onPress={onClose}>
              <Image source={IMAGES.close} style={styles.closeIcon} />
            </TouchableOpacity>
          }
        />

        <View
          style={{
            flex: 1,
          }}
        >
          {isFromChat && (
            <View style={styles.tokenContainer}>
              <Image source={IMAGES.token_star} style={styles.coinInner} />

              <Text style={styles.title}>Insufficient Tokens!</Text>
              <Text style={styles.subtitle}>
                I'd love to talk with you, but you need more tokens. Please
                purchase more to continue! 💫
              </Text>
            </View>
          )}
          <ScrollView
            contentContainerStyle={{
              flexGrow: 1,
              paddingBottom: verticalScale(30),
              justifyContent: 'flex-end',
            }}
            showsVerticalScrollIndicator={false}
          >
            <View style={styles.contentContainer}>
              <View style={{ flexDirection: 'row' }}>
                <Text style={styles.header1}>Get AI Dating</Text>
                <Text style={styles.header2}> Pro</Text>
              </View>
              <Text style={styles.subtitleText}>
                {'Get All The New Exciting Features '}
              </Text>

              <View>
                <FlatList
                  data={points}
                  renderItem={({ item }) => <RenderFeaturePoint item={item} />}
                  keyExtractor={(item, index) => `feature-${index}`}
                  scrollEnabled={false}
                  showsVerticalScrollIndicator={false}
                />
              </View>
              {/* //plan  */}
              <View style={styles.planListContainer}>
                {loadingSubriptions ? (
                  <Animated.View
                    style={[
                      styles.plansContainer,
                      {
                        transform: [
                          {
                            translateY: fadeAnim.interpolate({
                              inputRange: [0, 1],
                              outputRange: [30, 0],
                            }),
                          },
                        ],
                        opacity: fadeAnim,
                      },
                    ]}
                  >
                    <View
                      style={{
                        height: scale(150),
                      }}
                    >
                      <ProductSkeleton />
                    </View>
                  </Animated.View>
                ) : (
                  <Animated.View
                    style={[
                      styles.plansContainer,
                      {
                        transform: [
                          {
                            translateY: fadeAnim.interpolate({
                              inputRange: [0, 1],
                              outputRange: [30, 0],
                            }),
                          },
                        ],
                        opacity: fadeAnim,
                      },
                    ]}
                  >
                    <View style={styles.plansRow}>
                      {productsDisplay.map(
                        (plan: ProductPack, index: number) => (
                          <Animated.View
                            key={index}
                            style={{
                              transform: [{ scale: scaleValues[index] }],
                              // opacity: opacityValues[index],
                            }}
                          >
                            {/* Selected Indicator */}
                            {plan?.isSelect && (
                              <LinearGradient
                                colors={[theme.girlFriend, theme.girlFriend]}
                                start={{ x: 0, y: 0 }}
                                end={{ x: 1, y: 1 }}
                                style={styles.checkContainer}
                              >
                                <Image
                                  source={IMAGES.check_white_icon}
                                  style={styles.check}
                                />
                              </LinearGradient>
                            )}

                            {/* Plan Card */}
                            <ScrollView>
                              <LinearGradient
                                colors={
                                  plan?.isSelect
                                    ? [theme.girlFriend, theme.boyFriend]
                                    : [theme.girlFriend, theme.boyFriend]
                                }
                                start={{ x: 0, y: 0 }}
                                end={{ x: 1, y: 1 }}
                                style={styles.popularBadge}
                              >
                                {/* Popular Badge */}

                                <TouchableOpacity
                                  onPress={() => handlePlanSelect(plan, index)}
                                  style={[
                                    styles.planCard,
                                    {
                                      backgroundColor: isDark
                                        ? theme.primaryBackground
                                        : theme.white,
                                    },
                                  ]}
                                >
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
                                        {plan.price}
                                      </Text>
                                    </View>
                                    <View style={styles.creditsContainer}>
                                      <Image
                                        source={IMAGES.coin}
                                        style={styles.coinImage}
                                      />
                                      <Text style={[styles.creditsLabel]}>
                                        {' '}
                                        {plan?.display_credit_txt}:
                                      </Text>
                                      <Text style={[styles.creditsLabel]}>
                                        {' '}
                                        {plan?.credits}
                                      </Text>
                                    </View>
                                  </View>
                                </TouchableOpacity>
                              </LinearGradient>
                            </ScrollView>
                          </Animated.View>
                        ),
                      )}
                    </View>
                  </Animated.View>
                )}
              </View>
              {/* </View> */}
            </View>
          </ScrollView>
          <View style={styles.buttonsContainer}>
            <Animated.View style={[{ transform: [{ scale: pulseAnim }] }]}>
              <CommonPrimaryButton
                title={'Upgrade Now'}
                disabled={isPurchasing || loadingBtnSubmit}
                onPress={onPurchase}
                btnStyle={styles.btnStyle}
                // isProLabel
              />
            </Animated.View>

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
          </View>
        </View>
      </CommonLinearContainer>
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

export default UpgradeCreditPopup;

const Styles = () => {
  const { theme, isDark } = useThemeStore();
  const insets = useSafeAreaInsets();
  return StyleSheet.create({
    fullScreenContainer: {
      flex: 1,
      backgroundColor: theme.white,
    },
    coinInner: {
      width: scale(70),
      height: scale(70),
      borderRadius: 40,
      backgroundColor: '#FFC107',
      justifyContent: 'center',
      alignItems: 'center',
      borderWidth: 2,
      borderColor: '#FFD700',
    },
    tokenContainer: {
      flex: 1,
      alignItems: 'center',
      // backgroundColor: 'red',
      marginTop: verticalScale(20),
      gap: verticalScale(10),
    },
    title: {
      fontSize: scale(20),
      fontFamily: Fonts.ISemiBold,
      color: theme.primaryFriend,
      textAlign: 'center',
    },
    subtitle: {
      fontSize: scale(15),
      fontFamily: Fonts.IRegular,
      color: customColors.black,
      textAlign: 'center',
      lineHeight: 22,
      marginBottom: 8,
      width: '75%',
    },
    closeIcon: {
      width: scale(30),
      height: scale(30),
    },
    contentContainer: {
      // backgroundColor: 'green',
      // flex: 1,
      justifyContent: 'flex-end',
      paddingHorizontal: scale(20),
    },
    contentContainer0: {
      // flex: 1,
      justifyContent: 'center',
      paddingHorizontal: scale(20),
      // alignItems: 'flex-end',
      // backgroundColor: 'green',
    },
    pointItemContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: verticalScale(8),
      paddingHorizontal: scale(5),
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
      color: isDark ? theme.primaryText : '#333333',
      flex: 1,
    },
    tokenIcon: {
      width: scale(26),
      height: scale(26),
      resizeMode: 'contain',
      // marginBottom: scale(8),
      // resizeMode: 'contain',
    },
    header1: {
      fontSize: moderateScale(28),
      fontFamily: Fonts.FONT_FJALLAONE_REGULAR,
      color: theme.heading,
    },
    header2: {
      fontSize: moderateScale(28),
      fontFamily: Fonts.FONT_FJALLAONE_REGULAR,
      color: theme.girlFriend,
    },
    subtitleText: {
      color: theme.primaryText,
      fontSize: scale(16),
      fontFamily: Fonts.IRegular,
      marginBottom: scale(20),
    },
    plansContainer: {
      // alignItems: 'center',
      // justifyContent: 'center',
      marginVertical: scale(5),
      // paddingHorizontal: scale(15),
    },
    plansRow: {
      // flexDirection: 'row',
      // flex: 1,
      gap: scale(10),
      justifyContent: 'center',
      // backgroundColor: 'red',
    },
    checkContainer: {
      alignSelf: 'flex-end',
      borderRadius: scale(50),
      marginBottom: -scale(16),
      marginRight: -scale(4),
      zIndex: 999,
    },
    check: {
      margin: scale(2),
      width: scale(18),
      height: scale(18),
      resizeMode: 'contain',
      tintColor: theme.white,
    },
    popularBadge: {
      borderRadius: scale(8),
      // width: '100%',
      // alignItems: 'center',
      // justifyContent: 'center',
      // padding: scale(2.5),
      // backgroundColor: theme.white,
      // height: f2h(40),
    },
    planCard: {
      borderRadius: scale(8),
      overflow: 'hidden',

      paddingVertical: scale(12),
      paddingHorizontal: scale(10),
      backgroundColor: isDark ? theme.primaryBackground : theme.white,
      margin: scale(2.5),
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
      backgroundColor: theme.white,
      margin: scale(2.5),
      borderBottomRightRadius: 8,
      borderTopRightRadius: 8,
      marginLeft: scale(30), // Extra padding to account for CURRENT label
    },
    currentLabelContainer: {
      backgroundColor: theme.primaryFriend, // Semi-transparent white
      justifyContent: 'center',
    },
    currentLabel: {
      position: 'absolute',
      left: 0,
      top: 0,
      bottom: 0,
      color: theme.white,
      fontSize: scale(14),
      fontFamily: Fonts.IBold,
      marginBottom: 0,
      fontWeight: 'bold',
      transform: [{ rotate: '-90deg' }],
      zIndex: 9,
      // textAlign: 'left',
      backgroundColor: theme.primaryFriend,
    },
    planContent: {
      // flexDirection: 'column',
      justifyContent: 'space-between',
      alignItems: 'center',
      flexDirection: 'row',
      // backgroundColor: 'red',
    },
    creditsContainer: {
      // width: '100%',
      justifyContent: 'center',
      alignItems: 'center',
      flexDirection: 'row',
      // backgroundColor: 'red',
    },
    creditsNumber: {
      fontSize: scale(18),
      fontFamily: Fonts.ISemiBold,
      color: theme.primaryFriend,
      // marginBottom: scale(10),
    },
    creditsLabel: {
      fontSize: scale(20),
      fontFamily: Fonts.ISemiBold,
      color: theme.primaryFriend,
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
    buttonsContainer: {
      flexDirection: 'column',
      // gap: scale(10),
      paddingHorizontal: scale(30),
    },
    btnStyle: {
      // height: scale(50),
      borderRadius: scale(5),
      justifyContent: 'center',
      backgroundColor: theme.girlFriend,
    },
    planListContainer: {
      // marginVertical: scale(20),
      // paddingHorizontal: scale(2),
    },
    closeCotainer: {
      position: 'absolute',
      top: scale(50),
      right: scale(20),
      zIndex: 999,
    },
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
    purchaseButtonTextContainer: {
      // marginVertical: verticalScale(10),
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    privacyText: {
      fontSize: moderateScale(12),
      fontFamily: Fonts.IBold,
      color: theme.girlFriend,
      marginBottom: insets.bottom
        ? verticalScale(insets.bottom)
        : verticalScale(10),
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
      marginBottom: scale(10),
      textAlign: 'center',
      textDecorationLine: 'underline',
      // lineHeight: 20,
      textDecorationColor: theme.heading, // set underline color
      textDecorationStyle: 'solid',
    },
    coinImage: {
      width: scale(20),
      height: scale(20),
      resizeMode: 'contain',
    },
  });
};
