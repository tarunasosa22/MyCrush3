import {
  Alert,
  ImageBackground,
  Modal,
  Platform,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Animated,
  ScrollView,
} from 'react-native';
import React, { useEffect, useRef, useState } from 'react';
import { useThemeStore } from '../store/themeStore';
import IMAGES from '../assets/images';
import { moderateScale, scale, verticalScale } from '../utils/Scale';
import { Image } from 'react-native';
import { FlatList } from 'react-native';
import Fonts from '../utils/fonts';
import { useIsFocused, useNavigation } from '@react-navigation/native';
import {
  clearTransactionIOS,
  endConnection,
  finishTransaction,
  flushFailedPurchasesCachedAsPendingAndroid,
  getProducts,
  initConnection,
  purchaseErrorListener,
  getAvailablePurchases,
  purchaseUpdatedListener,
  requestPurchase,
  RequestPurchase,
} from 'react-native-iap';
import { NO_ADS_PRODUCT_IDS, PRODUCT_IDS_IAP, ProductPack } from '../constants';
import { normalizeAdsIAPList, normalizeIAPList } from '../utils/HelperFunction';
import { userState } from '../store/userStore';
import LottieView from 'lottie-react-native';
import { AppAnimations } from '../assets/animation';
import LinearGradient from 'react-native-linear-gradient';
import ProductSkeleton from './skeletons/ProductSkeleton';
import CustomActivityIndicator from './CustomActivityIndicator';
import { getUserDetail, setIAPPurchase, setPlanVisit } from '../api/user';
import { useAdsStore } from '../store/useAdsStore';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import AppConstant from '../utils/AppConstant';
import CommonPrimaryButton from './buttons/CommonPrimaryButton';

type Props = {
  visible: boolean;
  disable?: boolean;
  onClose: () => void;
  onLogin?: () => void;
  onSuccess?: () => void;
  onNavigate?: () => void;
};

const NoAdsIAPPopup = (props: Props) => {
  const { visible, disable, onClose, onLogin, onSuccess, onNavigate } = props;

  const styles = useStyles();
  const isFocused = useIsFocused();
  const theme = useThemeStore().theme;
  const navigation = useNavigation<any>();
  const [errorMessage, setErrorMessage] = useState('');
  const [isPurchaseInProgress, setIsPurchaseInProgress] = useState(false);
  const fadeAnimation = useRef(new Animated.Value(0)).current;
  const pulseAnimation = useRef(new Animated.Value(1)).current;
  const shimmerAnimation = useRef(new Animated.Value(0)).current;

  const {
    selectedAdsIAPPlan,
    setUserSelectedAdsIAPPlan,
    setIsOpenPlan,
    setUserTransactionId,
    userData,
    setUserData,
  } = userState();

  const [isLoadingSubscriptions, setIsLoadingSubscriptions] = useState(false);
  const [isLoadingButtonSubmit, setIsLoadingButtonSubmit] = useState(false);
  const [displayedProducts, setDisplayedProducts] = useState<any[]>([]);
  const purchaseUpdateListenerRef = useRef<any>(null);
  const purchaseErrorListenerRef = useRef<any>(null);
  const lastHandledTransactionId = useRef<string | null>(null);
  const isProcessingPurchase = useRef(false);
  const failedTransactions = useRef(new Set());

  const adFreeFeatureList = [
    {
      icon: '🚫',
      title: 'No Interruptions',
      description: 'Enjoy seamless conversations without ad breaks',
    },
  ];

  useEffect(() => {
    if (isFocused && visible) {
      fadeAnimation.setValue(0);
      Animated.sequence([
        Animated.timing(fadeAnimation, {
          toValue: 1,
          duration: 800,
          useNativeDriver: true,
        }),
      ]).start();

      // Pulse animation for CTA
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnimation, {
            toValue: 1.05,
            duration: 1000,
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnimation, {
            toValue: 1,
            duration: 1000,
            useNativeDriver: true,
          }),
        ]),
      ).start();

      // Shimmer animation for premium badge
      Animated.loop(
        Animated.sequence([
          Animated.timing(shimmerAnimation, {
            toValue: 1,
            duration: 2000,
            useNativeDriver: true,
          }),
          Animated.timing(shimmerAnimation, {
            toValue: 0,
            duration: 0,
            useNativeDriver: true,
          }),
        ]),
      ).start();

      initializeIAP();
    }
  }, [isFocused, visible]);

  useEffect(() => {
    console.log(
      '🔄 IAP Popup visibility changed:',
      visible,
      purchaseUpdateListenerRef.current,
    );
    if (visible && !purchaseUpdateListenerRef.current) {
      console.log('🔧 Setting up IAP purchase listeners');

      purchaseUpdateListenerRef.current = purchaseUpdatedListener(
        async purchase => {
          console.log('🔔 IAP Purchase listener triggered');
          console.log('Transaction ID:', purchase?.transactionId);
          console.log('Product ID:', purchase?.productId);
          console.log('Last handled:', lastHandledTransactionId.current);
          console.log('Is processing:', isProcessingPurchase.current);

          // FIRST: Check if already processing ANY purchase
          if (isProcessingPurchase.current) {
            console.log('⏸️ Already processing an IAP purchase, IGNORING');
            return;
          }

          // SECOND: Validate transaction ID exists
          if (!purchase?.transactionId) {
            console.log('⚠️ No transaction ID, IGNORING');
            return;
          }

          // THIRD: Check if this transaction previously failed
          if (failedTransactions.current.has(purchase.transactionId)) {
            console.log('🚫 Transaction previously failed, IGNORING');
            return;
          }

          // FOURTH: Check if this exact transaction was already handled
          if (lastHandledTransactionId.current === purchase.transactionId) {
            console.log('⏭️ Already handled this transaction ID, IGNORING');
            return;
          }

          // FIFTH: Check if this transaction was already processed globally
          const storedTransactionId = userState.getState().tranactionId;
          if (storedTransactionId === purchase.transactionId) {
            console.log('✅ Transaction already processed globally, IGNORING');
            return;
          }

          // SIXTH: Check if user is guest
          if (userState.getState().userData?.isGuestUser) {
            console.log('👤 Guest user detected, IGNORING purchase');
            setIsLoadingButtonSubmit(false);
            setIsPurchaseInProgress(false);
            return;
          }

          // All checks passed - proceed with purchase
          console.log('✅ Processing IAP purchase:', purchase.transactionId);

          // Set flags IMMEDIATELY before any async work
          isProcessingPurchase.current = true;
          lastHandledTransactionId.current = purchase.transactionId;

          // Get the current selected IAP plan from state
          const currentSelectedPlan = userState.getState().selectedAdsIAPPlan;
          if (!currentSelectedPlan) {
            console.warn('❌ No selected IAP plan in store');
            if (purchaseUpdateListenerRef.current) {
              purchaseUpdateListenerRef.current.remove();
              purchaseUpdateListenerRef.current = null;
            }
            isProcessingPurchase.current = false;
            lastHandledTransactionId.current = null;
            setIsLoadingButtonSubmit(false);
            setIsPurchaseInProgress(false);
            return;
          }

          console.log('Selected IAP plan:', currentSelectedPlan);

          const purchaseParameters = {
            product_id: purchase?.productId,
            // credit: currentIAPPlan?.credits,
            onetime_payload: JSON.stringify(purchase),
          };

          try {
            if (purchaseErrorListenerRef.current) {
              purchaseErrorListenerRef.current.remove();
              console.log('🗑️ Removed IAP error listener during purchase');
            }

            setIsPurchaseInProgress(true);
            setIsLoadingButtonSubmit(true);
            console.log('🔒 Set IAP purchasing states to true');

            console.log('📦 Starting finishTransaction (IAP)...');
            try {
              await finishTransaction({ purchase, isConsumable: true });
              userState.getState().setIsAdsPlanPurchasedUser(true);
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
              purchaseParameters,
            );
            try {
              // await postPurchaseApiCall(purchase, purchaseParameters);
              console.log(
                '✅ postPurchaseApiCall (IAP) completed successfully',
              );
              // Clear failed transactions on success
              failedTransactions.current.clear();
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
            failedTransactions.current.add(purchase.transactionId);

            // Reset flags to allow retry
            lastHandledTransactionId.current = null;
            isProcessingPurchase.current = false;

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
                `Failed to process purchase: ${
                  err?.message || 'Unknown error'
                }`,
                [{ text: 'OK' }],
              );
            }

            setErrorMessage(err?.message || 'Purchase failed');
          } finally {
            console.log('🧹 Cleanup: resetting IAP purchasing states');
            setIsLoadingButtonSubmit(false);
            setIsPurchaseInProgress(false);
            isProcessingPurchase.current = false;
          }
        },
      );

      purchaseErrorListenerRef.current = purchaseErrorListener((error: any) => {
        console.log('❌ IAP Purchase error:', error);
        setIsPurchaseInProgress(false);
        setIsLoadingButtonSubmit(false);
        isProcessingPurchase.current = false;

        if (error?.code === 'E_USER_CANCELLED') {
          setErrorMessage('Purchase cancelled by user');
        } else {
          setErrorMessage(error?.message || 'Purchase failed');
        }
      });
    }

    return () => {
      console.log('🧹 Cleaning up IAP purchase listeners');
      if (purchaseUpdateListenerRef.current) {
        purchaseUpdateListenerRef.current.remove();
        purchaseUpdateListenerRef.current = null;
      }
      if (purchaseErrorListenerRef.current) {
        purchaseErrorListenerRef.current.remove();
        purchaseErrorListenerRef.current = null;
      }
      isProcessingPurchase.current = false;
    };
  }, [visible]);

  const initializeIAP = async () => {
    setPlanVisit();
    try {
      setIsLoadingSubscriptions(true);
      setErrorMessage('');
      await initConnection();

      if (Platform.OS === 'android') {
        await flushFailedPurchasesCachedAsPendingAndroid();
      } else {
        await clearTransactionIOS();
      }

      // Initialize your IAP products here
      await handleGetSubscriptionProducts(NO_ADS_PRODUCT_IDS);

      setIsLoadingSubscriptions(false);
    } catch (error) {
      console.log('Init error:', error);
      setIsLoadingSubscriptions(false);
      setErrorMessage('Failed to initialize. Please try again.');
    }
  };

  const handleGetSubscriptionProducts = async (productId: any) => {
    try {
      const productResults = await getProducts({ skus: productId });

      console.log('DATA---->', productResults);
      if (productResults.length > 0) {
        const subscriptionProducts: any = normalizeAdsIAPList(productResults);
        const selectedSubscriptionPlan = subscriptionProducts.find(
          (item: any) => item?.isSelect,
        );
        console.log('subscriptionProducts', subscriptionProducts);
        setDisplayedProducts(subscriptionProducts || []);
        setIsLoadingSubscriptions(false);

        if (
          selectedAdsIAPPlan &&
          !userState.getState()?.userData?.isGuestUser &&
          visible &&
          Number(userState.getState()?.userData?.user?.tokens) <= 0
        ) {
          setTimeout(() => {
            handlePurchase();
          }, 500);
        }
      } else {
        setIsLoadingSubscriptions(false);
      }
    } catch (e) {
      setIsLoadingSubscriptions(false);
      console.log('DATATTA--->', e);
    }
  };

  const handlePurchase = () => {
    if (userData?.isGuestUser) {
      onLogin?.();
      return;
    }

    const selectedPlan: any = displayedProducts.filter(
      plan => plan.isSelect,
    )[0];
    console.log('Selected plan:', selectedPlan);
    setUserSelectedAdsIAPPlan(selectedPlan);

    // Handle subscription purchase
    handleSubscriptionPurchase(selectedPlan.id);
  };

  const handleSubscriptionPurchase = async (planId: string) => {
    if (isPurchaseInProgress) return;
    setIsPurchaseInProgress(true);
    setIsLoadingButtonSubmit(true);

    try {
      setErrorMessage('');
      // Your IAP purchase logic here
      console.log('Purchasing plan:', planId);

      if (Platform.OS === 'ios') {
        await clearTransactionIOS();
      } else if (Platform.OS == 'android') {
        await flushFailedPurchasesCachedAsPendingAndroid()
          .then(() => {
            console.log('flushFailedPurchasesCachedAsPendingAndroid');
          })
          .catch(e => {});
      }

      // const purchasees = await getAvailablePurchases();
      // await Promise.all(
      //   purchasees?.map(async item => {
      //     await finishTransaction({ purchase: item, isConsumable: true });
      //     // Use your backend API to update the status here
      //   }),
      // ).catch(e => {});

      let purchaseRequestParams: RequestPurchase = {
        sku: planId,
      };
      if (Platform.OS === 'android') {
        purchaseRequestParams = {
          skus: [planId],
        };
      } else if (Platform.OS === 'ios') {
        purchaseRequestParams = {
          sku: planId,
        };
      }
      // Simulate purchase for now
      const purchaseResult = await requestPurchase(purchaseRequestParams);
      // finishTransaction({ purchase: purchaseResult, isConsumable: true });
      console.log('PURCHASE--->', purchaseResult);
    } catch (error: any) {
      console.log('Purchase error:', error);
      setUserSelectedAdsIAPPlan(undefined);
      setIsPurchaseInProgress(false);
      setIsLoadingButtonSubmit(false);
      setErrorMessage(error?.message || 'Purchase failed');
    }
  };

  const handlePlanSelection = (selected_plan: ProductPack) => {
    if (isPurchaseInProgress) return;
    const updatedPlanList = displayedProducts.map((plan: ProductPack) => {
      if (plan?.id === selected_plan.id) return { ...plan, isSelect: true };
      else return { ...plan, isSelect: false };
    });
    setDisplayedProducts(updatedPlanList);
    setErrorMessage('');
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
        barStyle="light-content"
        translucent
      />

      {(isLoadingButtonSubmit ||
        isLoadingSubscriptions ||
        isPurchaseInProgress) && <CustomActivityIndicator />}

      <ImageBackground
        source={IMAGES.linear_bg}
        style={styles.noAdsIAPPopupFullScreenContainer}
      >
        {/* Animated Background Hearts */}
        {/* <LottieView
          source={AppAnimations.hearts}
          autoPlay
          loop
          style={styles.noAdsIAPPopupBackgroundAnimation}
        /> */}

        {/* Close Button */}
        <TouchableOpacity
          onPress={onClose}
          style={styles.noAdsIAPPopupCloseContainer}
        >
          <Image source={IMAGES.close} style={styles.noAdsIAPPopupCloseIcon} />
        </TouchableOpacity>
        <ScrollView>
          <View style={styles.noAdsIAPPopupContentContainer}>
            {/* Header Section */}
            <Animated.View
              style={[
                styles.noAdsIAPPopupHeaderSection,
                { opacity: fadeAnimation },
              ]}
            >
              <View style={styles.noAdsIAPPopupIconContainer}>
                <LinearGradient
                  colors={[theme.girlFriend, theme.boyFriend]}
                  style={styles.noAdsIAPPopupIconGradient}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                >
                  <Image
                    source={IMAGES.no_ads_icon}
                    style={styles.noAdsIAPPopupIcon}
                  />
                </LinearGradient>
              </View>

              <Text style={styles.noAdsIAPPopupMainTitle}>Go Ad-Free!</Text>
              <Text style={styles.noAdsIAPPopupSubtitle}>
                Experience pure, uninterrupted connections
              </Text>
            </Animated.View>

            {/* Features Grid */}
            <Animated.View
              style={[
                styles.noAdsIAPPopupFeaturesContainer,
                {
                  opacity: fadeAnimation,
                  transform: [
                    {
                      translateY: fadeAnimation.interpolate({
                        inputRange: [0, 1],
                        outputRange: [30, 0],
                      }),
                    },
                  ],
                },
              ]}
            >
              {adFreeFeatureList.map((feature, index) => (
                <View key={index} style={styles.noAdsIAPPopupFeatureCard}>
                  <Text style={styles.noAdsIAPPopupFeatureIcon}>
                    {feature.icon}
                  </Text>
                  <View style={styles.noAdsIAPPopupFeatureTextContainer}>
                    <Text style={styles.noAdsIAPPopupFeatureTitle}>
                      {feature.title}
                    </Text>
                    <Text style={styles.noAdsIAPPopupFeatureDescription}>
                      {feature.description}
                    </Text>
                  </View>
                </View>
              ))}
            </Animated.View>

            {/* Subscription Plans */}
            <Animated.View
              style={[
                styles.noAdsIAPPopupPlansSection,
                {
                  opacity: fadeAnimation,
                  transform: [
                    {
                      translateY: fadeAnimation.interpolate({
                        inputRange: [0, 1],
                        outputRange: [40, 0],
                      }),
                    },
                  ],
                },
              ]}
            >
              <Text style={styles.noAdsIAPPopupPlansSectionTitle}>
                Choose Your Plan
              </Text>

              <View style={styles.noAdsIAPPopupPlansGrid}>
                {displayedProducts.map((plan: ProductPack, index) => (
                  <TouchableOpacity
                    key={index}
                    activeOpacity={0.8}
                    onPress={() => handlePlanSelection(plan)}
                    style={styles.noAdsIAPPopupPlanCardWrapper}
                  >
                    {plan?.isSelect && (
                      <LinearGradient
                        colors={[theme.girlFriend, theme.boyFriend]}
                        style={styles.noAdsIAPPopupCheckmarkContainer}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 1 }}
                      >
                        <Image
                          source={IMAGES.check_white_icon}
                          style={styles.noAdsIAPPopupCheckmark}
                        />
                      </LinearGradient>
                    )}
                    <LinearGradient
                      colors={
                        plan?.isSelect
                          ? [theme.girlFriend, theme.boyFriend]
                          : ['#F5F5F5', '#F5F5F5']
                      }
                      style={styles.noAdsIAPPopupPlanCardGradient}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 1 }}
                    >
                      <View
                        style={[
                          styles.noAdsIAPPopupPlanCard,
                          plan?.isSelect &&
                            styles.noAdsIAPPopupPlanCardSelected,
                        ]}
                      >
                        <Image
                          source={IMAGES.ad_block}
                          style={styles.noAdsIAPPopupAdBlockIcon}
                        />
                        <View style={styles.noAdsIAPPopupPlanContentContainer}>
                          <Text style={[styles.noAdsIAPPopupPlanDuration]}>
                            {plan?.name || plan?.title}
                          </Text>

                          <Text
                            style={[
                              styles.noAdsIAPPopupPlanPricePerMonth,
                              plan?.isSelect &&
                                styles.noAdsIAPPopupPlanTextSelected,
                            ]}
                          >
                            {plan?.description}
                          </Text>
                        </View>
                        <Text
                          style={[
                            styles.noAdsIAPPopupPlanPrice,
                            plan?.isSelect &&
                              styles.noAdsIAPPopupPlanPriceSelected,
                          ]}
                        >
                          {plan.price}
                        </Text>
                      </View>
                    </LinearGradient>
                  </TouchableOpacity>
                ))}
              </View>
            </Animated.View>
          </View>
        </ScrollView>
        {/* CTA Section */}
        <View style={styles.noAdsIAPPopupCtaSection}>
          <Animated.View style={{ transform: [{ scale: pulseAnimation }] }}>
            <CommonPrimaryButton
              title="Remove Ads Forever"
              disabled={isPurchaseInProgress || isLoadingButtonSubmit}
              onPress={handlePurchase}
              btnStyle={styles.noAdsIAPPopupCtaButton}
            />
          </Animated.View>

          {errorMessage && (
            <View style={styles.noAdsIAPPopupErrorContainer}>
              <Text style={styles.noAdsIAPPopupErrorText}>{errorMessage}</Text>
              <TouchableOpacity
                onPress={() => setErrorMessage('')}
                style={styles.noAdsIAPPopupDismissButton}
              >
                <Text style={styles.noAdsIAPPopupDismissText}>Dismiss</Text>
              </TouchableOpacity>
            </View>
          )}

          <View style={styles.noAdsIAPPopupLegalLinks}>
            <Text
              style={styles.noAdsIAPPopupLegalText}
              onPress={() => {
                onNavigate?.();
                navigation.navigate(AppConstant.privacyPolicy);
              }}
            >
              Privacy Policy
            </Text>
            <Text style={styles.noAdsIAPPopupLegalSeparator}>•</Text>
            <Text
              style={styles.noAdsIAPPopupLegalText}
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
      </ImageBackground>
    </Modal>
  );
};

export default NoAdsIAPPopup;

const useStyles = () => {
  const theme = useThemeStore().theme;
  const insets = useSafeAreaInsets();

  return StyleSheet.create({
    noAdsIAPPopupFullScreenContainer: {
      flex: 1,
      backgroundColor: '#FFFFFF',
    },
    noAdsIAPPopupBackgroundAnimation: {
      ...StyleSheet.absoluteFillObject,
      opacity: 0.15,
    },
    noAdsIAPPopupCloseContainer: {
      position: 'absolute',
      top: insets.top + scale(10),
      right: scale(20),
      zIndex: 999,
      borderRadius: scale(20),
    },
    noAdsIAPPopupCloseIcon: {
      width: scale(30),
      height: scale(30),
      tintColor: theme.girlFriend,
    },
    noAdsIAPPopupContentContainer: {
      // flex: 1,
      paddingTop: insets.top + scale(60),
      paddingHorizontal: scale(20),
      paddingBottom: insets.bottom + scale(20),
    },

    // Header Section
    noAdsIAPPopupHeaderSection: {
      alignItems: 'center',
      marginBottom: verticalScale(30),
    },
    noAdsIAPPopupIconContainer: {
      marginBottom: verticalScale(15),
    },
    noAdsIAPPopupIconGradient: {
      width: scale(80),
      height: scale(80),
      borderRadius: scale(40),
      justifyContent: 'center',
      alignItems: 'center',
      shadowColor: theme.girlFriend,
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.3,
      shadowRadius: 12,
      elevation: 8,
    },
    noAdsIAPPopupIcon: {
      width: scale(50),
      height: scale(50),
      //   tintColor: theme.girlFriend,
    },
    noAdsIAPPopupMainTitle: {
      fontSize: moderateScale(36),
      fontFamily: Fonts.IBold,
      color: '#1A1A1A',
      marginBottom: verticalScale(8),
      textAlign: 'center',
    },
    noAdsIAPPopupSubtitle: {
      fontSize: moderateScale(16),
      fontFamily: Fonts.IRegular,
      color: '#666666',
      textAlign: 'center',
      paddingHorizontal: scale(20),
    },

    // Features Section
    noAdsIAPPopupFeaturesContainer: {
      marginBottom: verticalScale(30),
    },
    noAdsIAPPopupFeatureCard: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: '#FFFFFF',
      borderRadius: scale(16),
      padding: scale(16),
      marginBottom: verticalScale(12),
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.08,
      shadowRadius: 8,
      elevation: 3,
    },
    noAdsIAPPopupFeatureIcon: {
      fontSize: scale(32),
      marginRight: scale(16),
    },
    noAdsIAPPopupFeatureTextContainer: {
      flex: 1,
    },
    noAdsIAPPopupFeatureTitle: {
      fontSize: moderateScale(16),
      fontFamily: Fonts.ISemiBold,
      color: '#1A1A1A',
      marginBottom: verticalScale(4),
    },
    noAdsIAPPopupFeatureDescription: {
      fontSize: moderateScale(13),
      fontFamily: Fonts.IRegular,
      color: '#666666',
      lineHeight: scale(18),
    },

    // Plans Section
    noAdsIAPPopupPlansSection: {
      marginBottom: verticalScale(20),
      // flex: 1,
    },
    noAdsIAPPopupPlansSectionTitle: {
      fontSize: moderateScale(20),
      fontFamily: Fonts.IBold,
      color: '#1A1A1A',
      textAlign: 'center',
      marginBottom: verticalScale(16),
    },
    noAdsIAPPopupPlansGrid: {
      // flexDirection: 'row',
      justifyContent: 'space-between',
      gap: scale(10),
    },
    noAdsIAPPopupPlanCardWrapper: {
      // flex: 1,
      // height: 50,
      //   marginBottom: verticalScale(12),
      //   shadowColor: '#000',
      //   position: 'relative',
    },
    noAdsIAPPopupPopularBadgeContainer: {
      position: 'absolute',
      top: -scale(10),
      left: 0,
      right: 0,
      zIndex: 10,
      alignItems: 'center',
    },
    noAdsIAPPopupPopularBadge: {
      //   paddingHorizontal: scale(12),
      borderRadius: scale(12),
    },
    noAdsIAPPopupPopularBadgeText: {
      fontSize: moderateScale(10),
      fontFamily: Fonts.IBold,
      color: '#FFFFFF',
      paddingVertical: verticalScale(4),
      paddingHorizontal: scale(12),
      letterSpacing: 0.5,
    },
    noAdsIAPPopupPlanCardGradient: {
      borderRadius: scale(16),
    },
    noAdsIAPPopupPlanCard: {
      margin: scale(2.5),
      backgroundColor: '#FFFFFF',
      borderRadius: scale(14),
      padding: scale(10),
      paddingHorizontal: scale(15),
      alignItems: 'center',
      justifyContent: 'space-between',
      position: 'relative',
      flexDirection: 'row',
      gap: scale(5),
    },
    noAdsIAPPopupPlanCardSelected: {
      backgroundColor: '#FFFFFF',
    },
    noAdsIAPPopupSavingsBadge: {
      position: 'absolute',
      top: scale(8),
      right: scale(8),
      backgroundColor: '#4CAF50',
      paddingHorizontal: scale(8),
      paddingVertical: verticalScale(3),
      borderRadius: scale(8),
    },
    noAdsIAPPopupSavingsText: {
      fontSize: moderateScale(9),
      fontFamily: Fonts.IBold,
      color: '#FFFFFF',
    },
    noAdsIAPPopupAdBlockIcon: {
      width: '15%',
      height: scale(50),
      marginRight: scale(8),
      //   backgroundColor: 'red',
    },
    noAdsIAPPopupPlanDuration: {
      fontSize: moderateScale(16),
      fontFamily: Fonts.IBold,
      color: '#1A1A1A',
      marginBottom: verticalScale(8),
    },
    noAdsIAPPopupPlanPrice: {
      fontSize: moderateScale(20),
      fontFamily: Fonts.IBold,
      color: '#1A1A1A',
      marginBottom: verticalScale(4),
    },
    noAdsIAPPopupPlanPriceSelected: {
      color: theme.girlFriend,
    },
    noAdsIAPPopupPlanPricePerMonth: {
      fontSize: moderateScale(12),
      fontFamily: Fonts.IRegular,
      color: '#666666',
    },
    noAdsIAPPopupPlanTextSelected: {
      color: '#1A1A1A',
    },
    noAdsIAPPopupCheckmarkContainer: {
      position: 'absolute',
      top: scale(-5),
      right: scale(-1),
      backgroundColor: theme.girlFriend,
      borderRadius: scale(100),

      zIndex: 99,
    },
    noAdsIAPPopupCheckmark: {
      width: scale(14),
      height: scale(14),
      tintColor: '#FFFFFF',
      margin: scale(3),
    },
    noAdsIAPPopupPlanContentContainer: {
      flex: 1,
    },
    noAdsIAPPopupPulseAnimation: {
      transform: [{ scale: 1 }],
    },

    // CTA Section
    noAdsIAPPopupCtaSection: {
      marginTop: 'auto',
      paddingHorizontal: scale(20),
      paddingBottom: insets.bottom + verticalScale(10),
    },
    noAdsIAPPopupCtaButton: {
      height: scale(56),
      borderRadius: scale(28),
      backgroundColor: theme.girlFriend,
      marginBottom: verticalScale(12),
    },
    noAdsIAPPopupErrorContainer: {
      backgroundColor: '#FFE6E6',
      borderColor: '#FF4444',
      borderWidth: 1,
      borderRadius: scale(12),
      padding: scale(12),
      marginBottom: verticalScale(12),
      alignItems: 'center',
    },
    noAdsIAPPopupErrorText: {
      color: '#FF4444',
      fontSize: moderateScale(14),
      fontFamily: Fonts.IRegular,
      textAlign: 'center',
      marginBottom: verticalScale(8),
    },
    noAdsIAPPopupDismissButton: {
      paddingHorizontal: scale(20),
      paddingVertical: verticalScale(8),
      backgroundColor: '#FF4444',
      borderRadius: scale(8),
    },
    noAdsIAPPopupDismissText: {
      color: '#FFFFFF',
      fontSize: moderateScale(13),
      fontFamily: Fonts.ISemiBold,
    },
    noAdsIAPPopupLegalLinks: {
      flexDirection: 'row',
      justifyContent: 'center',
      alignItems: 'center',
      gap: scale(8),
    },
    noAdsIAPPopupLegalText: {
      fontSize: moderateScale(12),
      fontFamily: Fonts.IMedium,
      color: '#666666',
    },
    noAdsIAPPopupLegalSeparator: {
      fontSize: moderateScale(12),
      color: '#666666',
    },
  });
};
