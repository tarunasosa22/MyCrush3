import { Image, Platform, StyleSheet, Text, View } from 'react-native';
import React, { useEffect, useState } from 'react';
import { RootStackParamList } from '../types/navigation';
import { createStackNavigator } from '@react-navigation/stack';
import CreateAvatarStep0 from '../screens/createAvatarSteps/CreateAvatarStep0';
import CreateAvatarStep1 from '../screens/createAvatarSteps/CreateAvatarStep1';
import CreateAvatarStep2 from '../screens/createAvatarSteps/CreateAvatarStep2';
import CreateAvatarStep3 from '../screens/createAvatarSteps/CreateAvatarStep3';
import CreateAvatarStep4 from '../screens/createAvatarSteps/CreateAvatarStep4';
import CreateAvatarStep5 from '../screens/createAvatarSteps/CreateAvatarStep5';
import CreateAvatarStep6 from '../screens/createAvatarSteps/CreateAvatarStep6';
import CreateAvatarStep7 from '../screens/createAvatarSteps/CreateAvatarStep7';
import CreateAvatarStep8 from '../screens/createAvatarSteps/CreateAvatarStep8';
import CreateAvatarStep9 from '../screens/createAvatarSteps/CreateAvatarStep9';
import CreateAvatarStep10 from '../screens/createAvatarSteps/CreateAvatarStep10';
import CreateAvatarStep11 from '../screens/createAvatarSteps/CreateAvatarStep11';
import CreateAvatarStep12 from '../screens/createAvatarSteps/CreateAvatarStep12';
import CreateAvatarStep13 from '../screens/createAvatarSteps/CreateAvatarStep13';
import { hideSplash } from 'react-native-splash-view';
import AuthStartScreen from '../screens/AuthStartScreen';
import TermsAndConditionsScreen from '../screens/TermsAndConditionsScreen';
import SignUpScreen from '../screens/SignUpScreen';
import AccountSCreen from '../screens/AccountScreen';
import ChangePasswordScreen from '../screens/ChangePasswordScreen';
import ChatListScreen from '../screens/ChatListScreen';
import { userState } from '../store/userStore';
import { useChatStore } from '../store/chatListStore';
import { useCategoryStore } from '../store/categoryStore';
import { useLoaderStore } from '../store/useLoaderStore';
import { enableScreens } from 'react-native-screens';
import { useThemeStore } from '../store/themeStore';
import { useAdsStore } from '../store/useAdsStore';
import AppConstant from '../utils/AppConstant';
import { navigationRef } from '../../App';
import IntroScreen0 from '../screens/IntroScreen0';
import IntroScreen1 from '../screens/IntroScreen1';
import IntroScreen2 from '../screens/IntroScreen2';
import OnboardingScreen from '../screens/OnboardingScreen';
import AppSplashScreen from '../screens/AppSplashScreen';
import ForgotPassword from '../screens/ForgotPasswordScreen';
import ForgotPasswordScreen from '../screens/ForgotPasswordScreen';
import MainNavigation from './MainNavigation';
import HomeScreen from '../screens/HomeScreen';
import VoiceCallScreen from '../screens/VoiceCall';
import PersonalInfoScreen from '../screens/PersonalInfoScreen';
import HelpCenterScreen from '../screens/HelpCenterScreen';
import PrivacyPolicyScreen from '../screens/PrivacyPolicyScreen';
import InterstitialAdScreen from '../screens/InterstitialAdScreen';
import CustomRatingPopup from '../components/CustomRatingPopup';
import { RatingManager } from '../utils/RatingManager';
import CommonPrimaryButton from '../components/buttons/CommonPrimaryButton';
import CustomAppModel from '../components/CustomAppModel';
import IMAGES from '../assets/images';
import { scale } from '../utils/Scale';
import Fonts from '../utils/fonts';
import CustomActivityIndicator from '../components/CustomActivityIndicator';
import LoginScreen from '../screens/LoginScreen';
import FavoriteAvatars from '../screens/FavoriteAvatars';
import ChatScreen from '../screens/ChatScreen';
import AvatarDetailScreen from '../screens/AvatarDetailScreen';

const Stack = createStackNavigator<RootStackParamList>();
export const getToday = () => new Date().toISOString().split('T')[0];

const Appnavigation = () => {
  const {
    userData,
    setLogout,
    isSignUpUser,
    isCreatedAvatarForSignUp,
    setIsSignUpUSer,
    setIsCreatedAvatarForSignUp,
    isAgreedPolicy,
    isOpenPlan,
    sentChatCount,
    setIsOpenPlan,
    setTimeOfPopup,
    timeOfPopup,
    setIsAppReady,
    isAppReady,
    setSplashState,
    splashState,
  } = userState();
  const { chatCountRate, setChatCountRate } = useChatStore();

  const { categories } = useCategoryStore();
  const theme = useThemeStore().theme;
  const { loaderCount } = useLoaderStore();
  const { remoteData } = useAdsStore();

  const getInitialRoute = () => {
    if (userData?.access_token !== null) {
      if (userData?.isGuestUser) {
        if (!(userData?.avatar && Object.keys(userData.avatar).length)) {
          if (categories.length) {
            return 'AuthStartScreen';
          } else {
            return 'AuthStartScreen';
          }
        } else if (
          !!(userData?.avatar && Object.keys(userData.avatar).length)
        ) {
          return AppConstant.mainNav;
        }
      } else if (!userData?.isGuestUser) {
        if (!(userData?.avatar && Object.keys(userData.avatar).length)) {
          if (categories.length) {
            return 'OnboardingScreen';
          } else {
            return 'OnboardingScreen';
          }
        } else if (
          !!(userData?.avatar && Object.keys(userData.avatar).length)
        ) {
          if (
            userData?.user?.isCurrentlyEnabledSubscription ||
            userData?.user?.isUserSubscribeOnce
          ) {
            return AppConstant.mainNav;
          } else {
            return AppConstant.mainNav;
          }
        }
      }
    } else {
      return 'AuthStart';
    }
  };

  const onLogout = () => {
    userState.getState().setUserTokenExpire(false);
    setLogout();
    setTimeout(() => {
      if (navigationRef?.current?.isReady()) {
        navigationRef.current.reset({
          index: 0,
          routes: [{ name: 'AuthStart' }],
        });
      }
    }, 500);
  };

  const [showRatingPopup, setShowRatingPopup] = useState(false);

  useEffect(() => {
    if (
      isSignUpUser &&
      isCreatedAvatarForSignUp &&
      !userData.isGuestUser &&
      !isAgreedPolicy &&
      !isOpenPlan
    ) {
      setTimeout(() => {
        setShowRatingPopup(true);
      }, 2000);
    }
  }, [isCreatedAvatarForSignUp, isSignUpUser, isAgreedPolicy, isOpenPlan]);

  useEffect(() => {
    const today = getToday();

    if (
      sentChatCount.length >= remoteData.subscriptionOnSentChatCount &&
      userData.access_token &&
      userData.user?.total_tokens == 0 &&
      (timeOfPopup == null || timeOfPopup !== today)
    ) {
      setTimeout(() => {
        setIsOpenPlan(true);
        setTimeOfPopup(today);
      }, 500);
    }
  }, [sentChatCount]);

  useEffect(() => {
    console.log('chatCountRate.length-----', chatCountRate.length);
    if (chatCountRate.length === remoteData.chatCountRate) {
      setTimeout(() => {
        setShowRatingPopup(true);
        setChatCountRate({ id: chatCountRate.length + 1 });
      }, 500);
    }
  }, [chatCountRate]);

  // FIX 2: Proper splash screen handling
  useEffect(() => {
    const initializeApp = async () => {
      try {
        // Hide the native splash screen first
        setSplashState(true);
        setTimeout(() => {
          setIsAppReady(false);
          hideSplash();
        }, 200);

        // Show custom splash for minimum duration
        setTimeout(
          () => {
            setIsAppReady(true);
          },
          Platform.OS === 'android' ? 4000 : 2500,
        ); // Total splash duration
      } catch (error) {
        console.error('Error during app initialization:', error);
        // Even if there's an error, hide splash after timeout
        setTimeout(
          () => {
            setIsAppReady(true);
          },
          Platform.OS === 'android' ? 4000 : 2500,
        ); // Total splash duration
      }
    };

    initializeApp();
  }, []);
  console.log('isAppReady', isAppReady);

  // FIX 3: Get initial route only when app is ready
  const initialRoute = React.useMemo(() => {
    if (!isAppReady) {
      return 'Splash';
    } else if (isAppReady) {
      enableScreens(true);
    }
    return getInitialRoute() as keyof RootStackParamList;
  }, [isAppReady, userData, categories]);
  return (
    <>
      <Stack.Navigator
        initialRouteName={initialRoute}
        screenOptions={{ headerShown: false }}
      >
        <Stack.Screen name={'IntroScreen0'} component={IntroScreen0} />
        <Stack.Screen name={'IntroScreen1'} component={IntroScreen1} />
        <Stack.Screen name={'IntroScreen2'} component={IntroScreen2} />
        <Stack.Screen name={'Onboarding'} component={OnboardingScreen} />
        <Stack.Screen name={'AuthStart'} component={AuthStartScreen} />
        <Stack.Screen name={'SignUp'} component={SignUpScreen} />
        <Stack.Screen name={'Login'} component={LoginScreen} />
        <Stack.Screen name={'Splash'} component={AppSplashScreen} />
        <Stack.Screen
          name={'ForgotPassword'}
          component={ForgotPasswordScreen}
        />
        <Stack.Screen name={'MainNavigation'} component={MainNavigation} />
        <Stack.Screen name={'Home'} component={HomeScreen} />
        <Stack.Screen name={'VoiceCall'} component={VoiceCallScreen} />
        <Stack.Screen
          name={'ChangePassword'}
          component={ChangePasswordScreen}
        />
        <Stack.Screen name={'PersonalInfo'} component={PersonalInfoScreen} />
        <Stack.Screen name={'HelpCenter'} component={HelpCenterScreen} />
        <Stack.Screen name={'PrivacyPolicy'} component={PrivacyPolicyScreen} />
        <Stack.Screen
          name={'InterstitialAd'}
          component={InterstitialAdScreen}
        />
        <Stack.Screen
          name={'TermsAndConditions'}
          component={TermsAndConditionsScreen}
        />
        <Stack.Screen name={'Account'} component={AccountSCreen} />

        <Stack.Screen name={'ChatList'} component={ChatListScreen} />
        <Stack.Screen name={'FavoriteAvatars'} component={FavoriteAvatars} />
        <Stack.Screen name={'Chat'} component={ChatScreen} />
        <Stack.Screen name={'AvatarDetail'} component={AvatarDetailScreen} />

        <Stack.Screen
          name={'CreateAvatarStep0'}
          component={CreateAvatarStep0}
        />
        <Stack.Screen
          name={'CreateAvatarStep1'}
          component={CreateAvatarStep1}
        />
        <Stack.Screen
          name={'CreateAvatarStep2'}
          component={CreateAvatarStep2}
        />
        <Stack.Screen
          name={'CreateAvatarStep3'}
          component={CreateAvatarStep3}
        />
        <Stack.Screen
          name={'CreateAvatarStep4'}
          component={CreateAvatarStep4}
        />
        <Stack.Screen
          name={'CreateAvatarStep5'}
          component={CreateAvatarStep5}
        />
        <Stack.Screen
          name={'CreateAvatarStep6'}
          component={CreateAvatarStep6}
        />
        <Stack.Screen
          name={'CreateAvatarStep7'}
          component={CreateAvatarStep7}
        />
        <Stack.Screen
          name={'CreateAvatarStep8'}
          component={CreateAvatarStep8}
        />
        <Stack.Screen
          name={'CreateAvatarStep9'}
          component={CreateAvatarStep9}
        />
        <Stack.Screen
          name={'CreateAvatarStep10'}
          component={CreateAvatarStep10}
        />
        <Stack.Screen
          name={'CreateAvatarStep11'}
          component={CreateAvatarStep11}
        />
        <Stack.Screen
          name={'CreateAvatarStep12'}
          component={CreateAvatarStep12}
        />
        <Stack.Screen
          name={'CreateAvatarStep13'}
          component={CreateAvatarStep13}
        />
      </Stack.Navigator>
      {loaderCount > 0 && <CustomActivityIndicator />}
      <CustomAppModel
        title="Warning!!"
        visible={userState.getState().isTokenExpire ?? false}
        showCloseButton={false}
        onClose={() => {
          onLogout();
        }}
      >
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'flex-start',
            width: '100%',
          }}
        >
          <Image
            source={IMAGES.warning_icon}
            style={{ width: 24, height: 24, tintColor: theme?.primaryFriend }}
          />
          <Text
            style={{
              color: theme?.text,
              fontSize: 16,
              marginLeft: scale(15),
              fontFamily: Fonts.IBold,
              marginVertical: scale(10),
            }}
          >
            {true
              ? 'Oops! Your session has expired. Please log in again as a guest to continue using the app.'
              : 'Oops! Your session has expired! Please login again.'}
          </Text>
        </View>
        <CommonPrimaryButton
          title={'OK'}
          onPress={() => {
            onLogout();
          }}
        />
      </CustomAppModel>
      {showRatingPopup && (
        <CustomRatingPopup
          visible={showRatingPopup}
          onClose={() => {
            setShowRatingPopup(false);
            setIsCreatedAvatarForSignUp(false);
            setIsSignUpUSer(false);
          }}
          onRate={async () => {
            setShowRatingPopup(false);
            setIsCreatedAvatarForSignUp(false);
            setIsSignUpUSer(false);
            await RatingManager.openAppStore();
          }}
          onLater={async () => {
            setShowRatingPopup(false);
            setIsCreatedAvatarForSignUp(false);
            setIsSignUpUSer(false);
            // User will be asked again later
          }}
        />
      )}
    </>
  );
};

export default Appnavigation;

const styles = StyleSheet.create({});
