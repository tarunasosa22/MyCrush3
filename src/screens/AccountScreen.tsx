import React, { useState, useEffect, use, useRef } from 'react';
import {
  Text,
  View,
  Image,
  Alert,
  ScrollView,
  Animated,
  StyleSheet,
  TouchableOpacity,
  Linking,
  FlatList,
} from 'react-native';
import { scale, verticalScale } from '../utils/Scale';
import IMAGES from '../assets/images';
import { useThemeStore } from '../store/themeStore';
import {
  deleteAccount,
  getUserDetail,
  guestUserLogin,
  LogOut,
  setEventTrackinig,
} from '../api/user';
import {
  useIsFocused,
  useNavigation,
  useTheme,
} from '@react-navigation/native';
import { GuestData, userSelfAvatar, userState } from '../store/userStore';
import Fonts from '../utils/fonts';
import AppConstant from '../utils/AppConstant';
import { customColors } from '../utils/Colors';
import CommonImagePlaceHolder from '../components/CommonImagePlaceHolder';
import SubscriptionPopup from '../components/SubscriptionPopup';
import CustomActivityIndicator from '../components/CustomActivityIndicator';
import CommonZoomImageModal from '../components/CommonZoomImageModal';
import DeviceInfo from 'react-native-device-info';
import { Platform } from 'react-native';
import UpgradeCreditPopup from '../components/UpgradeCreditPopup';
import * as RNIap from 'react-native-iap';
import { APP_URL, EVENT_NAME, PRODUCT_IDS_SUBSCRIPTION } from '../constants';
import { GoogleSignin } from '@react-native-google-signin/google-signin';
import { useChatStore } from '../store/chatListStore';
import Share from 'react-native-share';
import { logFirebaseEvent } from '../utils/HelperFunction';
import CustomConfirmModal from '../components/CustomConfirmModal';
import CustomPricingTokenPopup from '../components/CustomPricingTokenPopup';
import { useCategoryStore } from '../store/categoryStore';
import CustomAccountProgress from '../components/CustomAccountProgress';

interface MenuItem {
  id: string;
  icon: any;
  label: string;
  onPress: () => void;
  iconTintColor?: string;
  labelColor?: string;
  disabled?: boolean;
  iconStyle?: any;
  condition?: boolean;
}

export const CustomSeperator = () => {
  const styles = AccountScreenStyles();

  return <View style={styles.seperator} />;
};

const AccountScreen = () => {
  GoogleSignin.configure({
    webClientId:
      '981896298601-t3p7s49jfh0c83in3kfbifjffqgnsa78.apps.googleusercontent.com', // from Firebase console
    offlineAccess: false, // optional, if you want server auth code
    // forceCodeForRefreshToken: true, // optional
  });
  const { isDark, setDarkMode, theme } = useThemeStore();
  const [isLoading, setIsLoading] = useState(false);
  const navigation = useNavigation<any>();
  const { userData, setUserData, isOpenPlan, setIsOpenPlan } =
    userState.getState();
  const [isPopupOpen, setIsPopupOpen] = useState(false);
  const isScreenFocused = useIsFocused();
  const [userTokens, setUserTokens] = useState(0);
  const [userTotalTokens, setUserTotalTokens] = useState(0);
  const [zoomImageState, setZoomImageState] = useState<{
    isVisible: boolean;
    image: string | undefined | null;
  }>({
    isVisible: false,
    image: undefined,
  });
  const [isLogoutModalVisible, setIsLogoutModalVisible] = useState(false);
  const [isDeleteAccountModalVisible, setIsDeleteAccountModalVisible] =
    useState(false);
  const [
    isCancelSubscriptionModalVisible,
    setIsCancelSubscriptionModalVisible,
  ] = useState(false);
  const [isTokenUsagePopupOpen, setIsTokenUsagePopupOpen] = useState(false);
  const [buttonPressState, setButtonPressState] = useState({
    rateApp: false,
    shareApp: false,
  });
  const [isSubscriptionPopupOpen, setIsSubscriptionPopupOpen] = useState(false);
  // Animation for progress bar
  const tokenProgressAnimation = new Animated.Value(0);

  const accountStyles = AccountScreenStyles();

  // Calculate progress percentage
  const tokenProgressPercent = Math.min(
    (userTokens / userTotalTokens) * 100,
    100,
  );

  useEffect(() => {
    if (isScreenFocused && isOpenPlan) {
      setIsPopupOpen(isOpenPlan);
    }
  }, [isOpenPlan, isScreenFocused]);

  useEffect(() => {
    // Animate progress bar on mount or when tokens change
    Animated.timing(tokenProgressAnimation, {
      toValue: tokenProgressPercent,
      duration: 1000,
      useNativeDriver: false,
    }).start();
  }, [tokenProgressPercent, isScreenFocused, isOpenPlan, isPopupOpen]);

  useEffect(() => {
    if (isScreenFocused) {
      getUserDetail().then(async res => {
        const newUserData = {
          ...userData,
          user: res?.data?.data?.user,
        };
        console.log('newUserData---->Account', newUserData);
        setUserTokens(
          newUserData?.user?.isCurrentlyEnabledSubscription === false
            ? 0
            : newUserData?.user?.tokens || 0,
        );
        setUserTotalTokens(
          newUserData?.user?.isCurrentlyEnabledSubscription === false
            ? 0
            : newUserData?.user?.total_tokens || 0,
        );
        setUserData(newUserData);
      });
    }
  }, [isScreenFocused, userData?.isGuestUser]);

  // Format date for subscription display
  const formatSubscriptionDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  // Calculate days remaining
  const calculateSubscriptionDaysRemaining = (endDate: string) => {
    const today = new Date();
    const end = new Date(endDate);
    const diffTime = end.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return Math.max(0, diffDays);
  };

  // Handle subscription cancellation
  const cancelUserSubscription = async () => {
    try {
      setIsLoading(true);

      if (Platform.OS === 'android' && PRODUCT_IDS_SUBSCRIPTION?.length) {
        await RNIap.deepLinkToSubscriptionsAndroid({
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
      setIsLoading(false);
      setIsCancelSubscriptionModalVisible(false);
    }
  };

  const performGuestLogin = async () => {
    setIsLoading(true);
    const device_id = await DeviceInfo.getUniqueId();
    try {
      const form = new FormData();
      form.append('device_id', device_id);
      form.append('device_type', Platform.OS);
      form.append('fcm_token', userState?.getState()?.fcmToken); // Add FCM token to form

      await guestUserLogin(form)
        .then(res => {
          const response: {
            access: string;
            refresh: string;
            guest_user: GuestData;
            avatar: userSelfAvatar;
          } = res?.data?.data;
          setIsLoading(false);
          setUserData({
            access_token: response?.access,
            refresh_token: response?.refresh,
            isGuestUser: !!response?.guest_user,
            user: {
              ...response?.guest_user,
              isUserSubscribeOnce: false,
              isCurrentlyEnabledSubscription: false,
              tokens: 0,
            },
            avatar: response?.avatar,
          });

          navigateToLoginScreen();
        })
        .catch(e => {
          console.error('Guest login error:', e);
          setIsLoading(false);
        });
    } catch (error) {
      setIsLoading(false);
      console.error('Guest login failed:', error);
    }
  };

  const performLogout = async () => {
    setIsLogoutModalVisible(false);
    setIsDeleteAccountModalVisible(false);
    useChatStore.getState().setIsChatListUpdated(true);
    await GoogleSignin.signOut();
    userState.getState().setLogout();
    userState.getState().setUserTokenExpire(false);
    userState.getState().setIsSignUpUSer(false);
    userState.getState().setIsCreatedAvatarForSignUp(false);
    useCategoryStore.getState().setSummeryList([]);
    useCategoryStore.getState().setCurrentIndex(0);
    performGuestLogin();
  };

  const navigateToLoginScreen = () => {
    navigation.navigate(AppConstant.login, { isFromAccount: true });
  };

  const confirmUserLogout = async () => {
    try {
      setIsLoading(true);
      const logoutForm = new FormData();
      logoutForm.append('refresh', userData.refresh_token);

      logFirebaseEvent(EVENT_NAME.AUTH_TRY_LOGOUT, {
        user_id: userData?.user?.id,
      });
      setEventTrackinig({
        event_type: EVENT_NAME.AUTH_TRY_LOGOUT,
      }).then(async () => {
        await LogOut(logoutForm)
          .then(async () => {
            await performLogout();
          })
          .catch(error => {
            console.log('logOut error::', error);
            Alert.alert('Something went wrong', error);
          });
      });
    } catch {
      console.log('some went wrong!');
      setIsLoading(false);
    }
  };

  const navigateToScreen = (screen: string) => {
    navigation.navigate(screen);
  };

  const openAppRating = async () => {
    setButtonPressState({
      shareApp: false,
      rateApp: true,
    });
    const packageName = 'com.sugar.soulmate.dearmgf.girl';

    try {
      if (Platform.OS === 'android') {
        const playStoreUrl = `market://details?id=${packageName}`;
        const supported = await Linking.canOpenURL(playStoreUrl);

        if (supported) {
          await Linking.openURL(playStoreUrl);
        } else {
          // Fallback to web version
          await Linking.openURL(
            `https://play.google.com/store/apps/details?id=${packageName}`,
          );
        }
      } else {
        // iOS App Store (you'll need your iOS app ID)
        const appStoreUrl =
          'https://apps.apple.com/us/app/my-crush-ai-soulmate-chat/id6752380186';
        await Linking.openURL(appStoreUrl);
      }
    } catch (error) {
      console.error('Error opening app store:', error);
      Alert.alert('Error', 'Could not open app store');
    }
  };

  const shareApplication = async () => {
    setButtonPressState({
      shareApp: true,
      rateApp: false,
    });
    Share.open({
      title: 'AI Crush',
      message:
        "Hey! Check out AI Crush, an AI chat app where you can call, connect, and have amazing conversations with your favorite AI characters. Give it a shot - you'll love it! Download now.",
      url: APP_URL,
    })
      .then(res => {
        console.log(res);
      })
      .catch(err => {
        err && console.log(err);
      });
  };

  const deleteUserAccount = () => {
    try {
      setIsLoading(true);
      logFirebaseEvent(EVENT_NAME.AUTH_TRY_DELETE_ACCOUNT, {
        user_id: userData?.user?.id,
      });
      setEventTrackinig({
        event_type: EVENT_NAME.AUTH_TRY_DELETE_ACCOUNT,
      }).then(async () => {
        await deleteAccount()
          .then(async () => {
            await performLogout();
          })
          .catch(error => {
            console.error('❌ Error deleting account:', error);
            Alert.alert(
              'Error',
              'Failed to delete account. Please try again later.',
            );
          });
      });
    } catch (error) {
      console.error('Error deleting account:', error);
      setIsLoading(false);
    }
  };

  const userHasActiveSubscription =
    userData?.user?.active_subscription_detail?.is_active || false;
  const activeSubscriptionInfo = userData?.user?.active_subscription_detail;

  // Define My Account menu items
  const myAccountMenuItems: MenuItem[] = [
    {
      id: 'personal_info',
      icon: IMAGES.personal_info_icon,
      label: 'Personal information',
      onPress: () => navigateToScreen(AppConstant.personalInfo),
      condition: !userData.isGuestUser,
    },
    {
      id: 'favorites',
      icon: IMAGES.heart,
      label: 'My Favorites',
      onPress: () => navigateToScreen('FavoriteAvatars'),
      iconTintColor: theme.primaryFriend,
      condition: !userData.isGuestUser,
    },
    {
      id: 'token_info',
      icon: IMAGES.token_info_icon,
      label: 'Token Info',
      onPress: () =>
        setIsTokenUsagePopupOpen(
          userState.getState().useTokensList.length !== 0,
        ),
      condition:
        Number(userData?.user?.total_tokens) > 0 &&
        userState.getState().useTokensList.length !== 0,
    },
    {
      id: 'privacy_policy',
      icon: IMAGES.privacy_Policy_icon,
      label: 'Privacy Policy',
      onPress: () => navigateToScreen(AppConstant.privacyPolicy),
      condition: true,
    },
    {
      id: 'terms',
      icon: IMAGES.terms_icon,
      label: 'Terms & conditions',
      onPress: () => navigateToScreen(AppConstant.termsAndConditions),
      condition: true,
    },
    {
      id: 'rate_app',
      icon: IMAGES.rate_App,
      label: 'Rate App',
      onPress: openAppRating,
      disabled: buttonPressState.rateApp,
      condition: true,
    },
    {
      id: 'share_app',
      icon: IMAGES.share_App,
      label: 'Share App',
      onPress: shareApplication,
      disabled: buttonPressState.shareApp,
      condition: true,
    },
  ].filter(item => item.condition);

  // Define More menu items
  const moreMenuItems: MenuItem[] = [
    {
      id: 'subscription',
      icon: IMAGES.subscribe_icon,
      label: 'Your Subscription',
      onPress: () => setIsSubscriptionPopupOpen(true),
      disabled: isSubscriptionPopupOpen,
      condition: userData?.user?.active_subscription_detail?.is_active,
    },
    {
      id: 'delete_account',
      icon: IMAGES.delete_user_icon,
      label: 'Delete Account',
      onPress: () => setIsDeleteAccountModalVisible(true),
      labelColor: customColors.error,
      iconStyle: {
        width: scale(21),
        height: scale(21),
        tintColor: customColors.error,
      },
      condition: !userData.isGuestUser,
    },
    {
      id: 'logout',
      icon: IMAGES.Logout,
      label: userData.isGuestUser ? 'Log In' : 'Log Out',
      onPress: () =>
        userData.isGuestUser
          ? navigateToLoginScreen()
          : setIsLogoutModalVisible(true),
      iconTintColor: customColors.error,
      labelColor: customColors.error,
      condition: true,
    },
  ].filter(item => item.condition);

  const renderMenuItem = ({ item }: { item: MenuItem }) => (
    <TouchableOpacity
      style={accountStyles.menuItem}
      onPress={item.onPress}
      disabled={item.disabled}
    >
      <Image
        source={item.icon}
        style={[
          accountStyles.iconImage,
          item.iconTintColor && { tintColor: item.iconTintColor },
          item.iconStyle,
        ]}
      />
      <Text
        style={[
          accountStyles.menuLabel,
          { color: item.labelColor || theme.heading },
        ]}
      >
        {item.label}
      </Text>
    </TouchableOpacity>
  );

  return (
    <>
      {isLoading ? <CustomActivityIndicator /> : null}
      <View
        style={[
          accountStyles.container,
          { backgroundColor: theme.primaryBackground },
        ]}
      >
        <View style={{ flex: 1 }}>
          <View style={accountStyles.headerContainer}>
            <Text
              style={[accountStyles.header, { color: theme.primaryFriend }]}
            >
              {'My Profile'}
            </Text>
            {__DEV__ && (
              <TouchableOpacity onPress={() => setDarkMode(!isDark)}>
                <Text style={{ color: theme.primaryFriend }}>
                  {isDark ? 'Light Mode' : 'Dark Mode'}
                </Text>
              </TouchableOpacity>
            )}
          </View>
          <ScrollView
            bounces={false}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ paddingBottom: verticalScale(100) }}
          >
            <View style={accountStyles.profileContainer}>
              <CommonImagePlaceHolder
                disabled={!userData?.user?.profile_image}
                imageStyle={accountStyles.avatar}
                image={userData?.user?.profile_image || undefined}
                isAppIcon={true}
                onPress={() => {
                  setZoomImageState({
                    isVisible: true,
                    image: userData?.user?.profile_image || undefined,
                  });
                }}
              />
              <View style={{ marginLeft: scale(10) }}>
                {userData?.isGuestUser ? (
                  <Text style={[accountStyles.name, { color: theme.heading }]}>
                    {'Guest User'}
                  </Text>
                ) : (
                  <Text style={[accountStyles.name, { color: theme.heading }]}>
                    {userData?.user?.full_name || 'User'}
                  </Text>
                )}

                <Text style={[accountStyles.email, { color: theme.text }]}>
                  {userData?.user?.email}
                </Text>
              </View>
            </View>
            <CustomAccountProgress
              userTokens={userTokens}
              userTotalTokens={userTotalTokens}
              progressChildComponent={
                <>
                  {userTotalTokens !== 0 && (
                    <>
                      <View style={accountStyles.progressContainer}>
                        <View style={accountStyles.progressBarBg}>
                          <Animated.View
                            style={[
                              accountStyles.progressBarFill,
                              {
                                width: tokenProgressAnimation.interpolate({
                                  inputRange: [0, 100],
                                  outputRange: ['0%', '100%'],
                                  extrapolate: 'clamp',
                                }),
                              },
                            ]}
                          />
                        </View>
                      </View>
                      <View style={accountStyles.progressLabels}>
                        <Text style={[accountStyles.progressLabel]}>
                          {userTokens}
                        </Text>
                        <Text style={[accountStyles.progressLabel]}>
                          {userTotalTokens}
                        </Text>
                      </View>
                    </>
                  )}
                </>
              }
              onPress={() => {
                setIsTokenUsagePopupOpen(
                  userState.getState().useTokensList.length !== 0,
                );
              }}
              onBuyMorePress={() => {
                if (userData?.isGuestUser) {
                  navigation.navigate(AppConstant.login, {
                    isfromPlan: true,
                    isFromAccount: true,
                  });
                  return;
                }
                setIsPopupOpen(true);
                setIsOpenPlan(true);
              }}
            />

            {/* My Account Section with FlatList */}
            <View style={accountStyles.section}>
              <Text
                style={[
                  accountStyles.sectionTitle,
                  { color: theme.primaryFriend },
                ]}
              >
                My Account
              </Text>
              <FlatList
                data={myAccountMenuItems}
                renderItem={renderMenuItem}
                ItemSeparatorComponent={CustomSeperator}
                keyExtractor={item => item.id}
                scrollEnabled={false}
              />
            </View>

            {/* More Section with FlatList */}
            <View style={accountStyles.section}>
              <Text
                style={[
                  accountStyles.sectionTitle,
                  { color: theme.primaryFriend },
                ]}
              >
                More
              </Text>
              <FlatList
                data={moreMenuItems}
                ItemSeparatorComponent={CustomSeperator}
                renderItem={renderMenuItem}
                keyExtractor={item => item.id}
                scrollEnabled={false}
              />
            </View>
          </ScrollView>
        </View>

        {zoomImageState && (
          <CommonZoomImageModal
            visible={zoomImageState?.isVisible}
            source={zoomImageState?.image || undefined}
            onClose={() => {
              setZoomImageState({ isVisible: false, image: undefined });
            }}
          />
        )}

        {(isSubscriptionPopupOpen ||
          (isPopupOpen && !userData.user?.isCurrentlyEnabledSubscription)) && (
          <SubscriptionPopup
            onClose={() => {
              setIsPopupOpen(false);
              setIsOpenPlan(false);
              setIsSubscriptionPopupOpen(false);
              userState.getState().setSplashState(false);
            }}
            visible={
              isSubscriptionPopupOpen ||
              (isPopupOpen && !userData.user?.isCurrentlyEnabledSubscription)
            }
            onLogin={() => {
              setIsPopupOpen(false);
              navigation?.navigate('Login', { isfromPlan: true });
            }}
            onNavigate={() => {
              setIsPopupOpen(false);
              setIsSubscriptionPopupOpen(false);
            }}
            onSuccess={() => {
              setIsSubscriptionPopupOpen(false);
            }}
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
        <CustomConfirmModal
          visible={isLogoutModalVisible}
          title="Logout"
          message="Are you sure you want to log out?"
          onCancel={() => setIsLogoutModalVisible(false)}
          onConfirm={confirmUserLogout}
          btnText={'Log Out'}
          icon={IMAGES.Logout}
        />
        <CustomConfirmModal
          visible={isDeleteAccountModalVisible}
          title="Delete Account!"
          message="Are you sure you want to delete this account?"
          onCancel={() => setIsDeleteAccountModalVisible(false)}
          onConfirm={deleteUserAccount}
          btnText={'Delete'}
          icon={IMAGES.delete_user_icon}
        />
        <CustomConfirmModal
          visible={isCancelSubscriptionModalVisible}
          title="Cancel Subscription"
          message="Are you sure you want to cancel your subscription? You will continue to have access until the end of your current billing period."
          onCancel={() => setIsCancelSubscriptionModalVisible(false)}
          onConfirm={cancelUserSubscription}
          btnText={'Cancel Subscription'}
          icon={IMAGES.delete_user_icon}
          cancelBtnText={'Keep Subscription'}
        />

        {isTokenUsagePopupOpen && (
          <CustomPricingTokenPopup
            visible={isTokenUsagePopupOpen}
            onClose={() => {
              setIsTokenUsagePopupOpen(false);
            }}
            onContinue={() => {
              setIsTokenUsagePopupOpen(false);
            }}
          />
        )}
      </View>
    </>
  );
};

export default AccountScreen;

const AccountScreenStyles = () => {
  const theme = useThemeStore().theme;
  return StyleSheet.create({
    container: {
      flex: 1,
      paddingHorizontal: scale(20),
      paddingTop: scale(10),
    },
    headerContainer: {
      width: '100%',
      paddingTop: scale(40),
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    header: {
      fontSize: scale(25),
      fontFamily: Fonts.ISemiBold,
    },
    profileContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      marginTop: verticalScale(14),
      borderRadius: scale(10),
      padding: scale(5),
    },
    avatar: {
      width: scale(80),
      height: scale(80),
      borderRadius: scale(40),
      backgroundColor: theme.secondayBackground,
      borderWidth: scale(2),
      borderColor: theme.white,
      shadowOffset: {
        width: 10,
        height: 12,
      },
      shadowOpacity: 0.58,
      shadowRadius: 50.0,

      elevation: 10,
    },
    name: {
      fontSize: scale(18),
      fontFamily: Fonts.ISemiBold,
    },
    email: {
      fontSize: scale(15),
      fontFamily: Fonts.IMedium,
      marginTop: verticalScale(-2),
    },
    subscriptionBox: {
      borderRadius: scale(12),
      padding: scale(20),
      marginBottom: verticalScale(20),
      borderWidth: scale(2),
      borderColor: theme.primaryFriend,
      shadowColor: '#000',
      shadowOffset: {
        width: 0,
        height: 4,
      },
      shadowOpacity: 0.15,
      shadowRadius: 8,
      elevation: 8,
    },
    subscriptionHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: verticalScale(16),
    },
    subscriptionLeft: {
      flexDirection: 'row',
      alignItems: 'center',
      flex: 1,
    },
    subscriptionIconContainer: {
      width: scale(50),
      height: scale(50),
      borderRadius: scale(25),
      backgroundColor: theme.primaryFriend + '10',
      justifyContent: 'center',
      alignItems: 'center',
      marginRight: scale(12),
    },
    subscriptionIcon: {
      fontSize: scale(24),
    },
    subscriptionInfo: {
      flex: 1,
    },
    subscriptionTitle: {
      fontSize: scale(18),
      fontFamily: Fonts.IBold,
      marginBottom: verticalScale(2),
    },
    subscriptionPlan: {
      fontSize: scale(14),
      fontFamily: Fonts.IMedium,
      opacity: 0.8,
    },
    activeStatus: {
      paddingHorizontal: scale(12),
      paddingVertical: scale(6),
      borderRadius: scale(20),
    },
    activeStatusText: {
      fontSize: scale(12),
      fontFamily: Fonts.IBold,
      color: '#FFFFFF',
    },
    subscriptionDates: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginBottom: verticalScale(12),
      paddingHorizontal: scale(4),
    },
    dateItem: {
      flex: 1,
    },
    dateLabel: {
      fontSize: scale(12),
      fontFamily: Fonts.IRegular,
      opacity: 0.7,
      marginBottom: verticalScale(2),
    },
    dateValue: {
      fontSize: scale(14),
      fontFamily: Fonts.IMedium,
    },
    daysRemaining: {
      backgroundColor: theme.primaryFriend + '10',
      paddingVertical: verticalScale(8),
      paddingHorizontal: scale(12),
      borderRadius: scale(8),
      alignItems: 'center',
      marginBottom: verticalScale(16),
    },
    daysRemainingText: {
      fontSize: scale(14),
      fontFamily: Fonts.IBold,
    },
    cancelButton: {
      backgroundColor: 'transparent',
      borderWidth: scale(1),
      borderColor: customColors.error,
      borderRadius: scale(8),
      paddingVertical: verticalScale(10),
      alignItems: 'center',
    },
    cancelButtonText: {
      fontSize: scale(14),
      fontFamily: Fonts.IMedium,
      color: customColors.error,
    },
    coinBox: {
      borderRadius: scale(12),
      padding: scale(16),
      marginVertical: verticalScale(20),
      shadowColor: '#00000070',
      shadowOffset: {
        width: 0,
        height: 4,
      },
      shadowOpacity: 0.15,
      shadowRadius: 8,
      elevation: 8,
    },
    coinRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      borderRadius: scale(7),
      backgroundColor: theme.white,
      paddingVertical: scale(3),
    },
    coinRowLeft: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: theme.white,
      alignSelf: 'center',
      paddingHorizontal: scale(25),
      paddingVertical: scale(5),
      borderRadius: scale(7),
      borderColor: theme.primaryFriend,
      borderWidth: scale(1),
      marginTop: verticalScale(-35),
    },
    coinIcon: {
      width: scale(22),
      height: scale(22),
      marginRight: scale(8),
      resizeMode: 'contain',
    },
    coinText: {
      fontSize: scale(16),
      fontFamily: Fonts.IBold,
    },
    buyMoreButton: {
      paddingHorizontal: scale(12),
      paddingVertical: scale(8),
      borderRadius: scale(6),
      backgroundColor: theme.white,
      justifyContent: 'center',
      alignItems: 'center',
    },
    buyMore: {
      fontSize: scale(14),
      fontFamily: Fonts.ISemiBold,
      textAlign: 'center',
      color: theme.primaryFriend,
      alignSelf: 'center',
    },
    progressContainer: {},
    progressBarBg: {
      height: scale(8),
      backgroundColor: theme.card,
      borderRadius: scale(4),
      overflow: 'hidden',
    },
    progressBarFill: {
      height: '100%',
      backgroundColor: '#E62063',
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
    progressLabels: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginTop: verticalScale(5),
      marginBottom: verticalScale(14),
      paddingHorizontal: scale(2),
    },
    progressLabel: {
      fontSize: scale(16),
      fontFamily: Fonts.IMedium,
      opacity: 0.8,
      color: theme.white,
    },
    section: {
      marginBottom: verticalScale(20),
    },
    sectionTitle: {
      fontSize: scale(16),
      fontFamily: Fonts.IMedium,
      marginBottom: verticalScale(12),
    },
    menuItem: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingVertical: verticalScale(12),
      paddingHorizontal: scale(4),
    },
    iconImage: {
      width: scale(22),
      height: scale(22),
      resizeMode: 'contain',
      marginRight: scale(12),
      tintColor: theme.primaryText,
    },
    menuLabel: {
      fontFamily: Fonts.IMedium,
      color: theme.primaryText,
      fontSize: scale(15),
      flex: 1,
    },
    logout: {
      fontSize: scale(14),
      fontFamily: Fonts.IMedium,
      color: customColors.error,
    },
    logoutIcon: {
      width: scale(18),
      height: scale(18),
      resizeMode: 'contain',
      marginLeft: scale(5),
      tintColor: customColors.error,
    },
    logoutContainer: {
      flexDirection: 'row',
      alignItems: 'center',
    },

    seperator: {
      height: verticalScale(1.5),
      backgroundColor: theme.border,
      width: '90%',
      alignSelf: 'flex-end',
    },
  });
};
