import React, { useEffect, useRef, useState } from 'react';
import {
  DefaultTheme,
  NavigationContainer,
  NavigationContainerRef,
  NavigationState,
  Theme,
} from '@react-navigation/native';
import NetInfo from '@react-native-community/netinfo';
import { RefreshToken } from './src/api/user';
import NotificationController from './src/notification/NotificationController';
import { RootStackParamList } from './src/types/navigation';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { userState } from './src/store/userStore';
import { useThemeStore } from './src/store/themeStore';
import Appnavigation from './src/navigation/Appnavigation';
import { useRemoteConfig } from './src/api/useRemoteConfig';
import { useAdsStore } from './src/store/useAdsStore';
import notifee from '@notifee/react-native';
import useAppOpenAd from './src/hooks/useAppOpenAd';
import { homeStore } from './src/database/homeStore';
import { categoriesState } from './src/database/categoryState';
import DeviceInfo from 'react-native-device-info';
import { setCurrentScreenTrack } from './src/constants';
import { useChatStore } from './src/store/chatListStore';
import FlashMessage from 'react-native-flash-message';
import {
  AppState,
  AppStateStatus,
  LogBox,
  Platform,
  StatusBar,
  Text,
  View,
} from 'react-native';
import { preloadAddStore } from './src/store/preloadAddStore';
import { useCategoryStore } from './src/store/categoryStore';
import { AppAnimations } from './src/assets/animation';
import { Image } from 'react-native';
import { customColors } from './src/utils/Colors';
import { scale } from './src/utils/Scale';
import FastImage from 'react-native-fast-image';
import MobileAds from 'react-native-google-mobile-ads';
import useTokenEncryption from './src/api/useTokenEncryption';
import { useScreenNavigation } from './src/context/ScreenNavigationContext';
import CustomNoInternetModal from './src/components/CustomNoInternetModal.';

export const navigationRef =
  React.createRef<NavigationContainerRef<RootStackParamList>>();

const App = () => {
  useRemoteConfig();
  LogBox.ignoreAllLogs(true);
  useTokenEncryption();
  const [isConnected, setIsConnected] = useState<boolean | null>(true);
  const [showNoInternetModal, setShowNoInternetModal] = useState(false);
  const { userData, setUserData, isAppReady, setIsAppReady } =
    userState?.getState();
  const { theme, setTheme } = useThemeStore();
  const prevRouteIndexRef = useRef<number | null>(null);
  const subEnabled = userData.user?.isCurrentlyEnabledSubscription;

  const { showAppOpenAd } = useAppOpenAd();
  const appState = useRef(AppState.currentState);

  const [appStateVisible, setAppStateVisible] = useState(appState.current);
  const {
    isAdsVisible,
    setAdsVisible,
    isAdsVisibleRemote,
    setNavigationCount,
    incrementNavigationCount,
    navigationCount,
    adsCount,
    remoteData,
  } = useAdsStore();
  const { setCurrentScreen, currentScreen } = useScreenNavigation();

  const { preloadNativeAds, hasPreloadedAds } = preloadAddStore();
  const prevRouteNameRef = useRef<string | null>(null);

  const createAvatarScreens =
    navigationRef.current?.getCurrentRoute()?.name == 'CreateAvatarStep0' ||
    navigationRef.current?.getCurrentRoute()?.name == 'CreateAvatarStep1' ||
    navigationRef.current?.getCurrentRoute()?.name == 'CreateAvatarStep2' ||
    navigationRef.current?.getCurrentRoute()?.name == 'CreateAvatarStep3' ||
    navigationRef.current?.getCurrentRoute()?.name == 'CreateAvatarStep4' ||
    navigationRef.current?.getCurrentRoute()?.name == 'CreateAvatarStep5' ||
    navigationRef.current?.getCurrentRoute()?.name == 'CreateAvatarStep6' ||
    navigationRef.current?.getCurrentRoute()?.name == 'CreateAvatarStep7' ||
    navigationRef.current?.getCurrentRoute()?.name == 'CreateAvatarStep8' ||
    navigationRef.current?.getCurrentRoute()?.name == 'CreateAvatarStep9' ||
    navigationRef.current?.getCurrentRoute()?.name == 'CreateAvatarStep10' ||
    navigationRef.current?.getCurrentRoute()?.name == 'CreateAvatarStep11' ||
    navigationRef.current?.getCurrentRoute()?.name == 'CreateAvatarStep12';

  useEffect(() => {
    const token = userData?.user?.tokens ?? 0;
    console.log('App preload from App.js---', token);
    if (
      Boolean(isAdsVisibleRemote) &&
      (!userState.getState().userData?.user?.tokens ||
        Number(userData?.user?.tokens) <= 0)
      // && !__DEV__ // in development comment
    ) {
      console.log('preload from app');
      if (!hasPreloadedAds()) {
        preloadNativeAds(1);
      }
    }
  }, [isAdsVisibleRemote, userData?.user?.tokens ?? 0]);

  useEffect(() => {
    const subscription = AppState.addEventListener(
      'change',
      handleAppStateChange,
    );

    // Mark app as active on mount (first launch)
    if (AppState.currentState === 'active') {
      hasAppBeenActive.current = true;
    }

    return () => subscription.remove();
  }, []);

  const onAdClosed = () => {
    return;
  };

  const onAdFailed = () => {
    return;
  };

  const isAdLoading = useRef(false);
  const hasAppBeenActive = useRef(false); // Track if app has been active before

  const handleAppStateChange = (nextAppState: AppStateStatus) => {
    // console.log(
    //   'nextAppState',
    //   nextAppState,
    //   appState.current,
    //   userState.getState().splashState,
    // );

    // Detect transition from background/inactive → active
    if (
      (appState.current?.match(/background/) ||
        appState.current?.match(/inactive/)) &&
      nextAppState === 'active' &&
      !userState.getState().splashState
    ) {
      console.log('📱 App moved from background to foreground');

      // Only show ad if app has been active before (not a cold start)
      if (hasAppBeenActive.current && isAdsVisible && !isAdLoading.current) {
        console.log('🎯 Loading app open ad from background resume...');
        useAdsStore.getState().setNavigationCount(0);

        isAdLoading.current = true;
        showAppOpenAd(
          () => {
            appState.current = null;
            console.log('✅ Ad closed');
            isAdLoading.current = false;
          },
          err => {
            console.log('❌ Ad failed', err);
            isAdLoading.current = false;
            appState.current = nextAppState;
          },
        );
      } else if (!hasAppBeenActive.current) {
        console.log('⏩ Skipping ad on cold start');
        hasAppBeenActive.current = true; // Mark that app has been active
      }
    }

    appState.current = nextAppState;
    setAppStateVisible(appState.current);
  };

  // cod push
  // useEffect(() => {
  //   const syncOptions = {
  //     deploymentKey: 'VnP6NHphOK7KInJc8QjAwkycvGyG4yykfKOrMe',
  //     installMode: codePush.InstallMode.ON_NEXT_RESUME, // shows modal
  //     updateDialog: {
  //       title: 'Update Available',
  //       optionalUpdateMessage:
  //         'A new version is available. Would you like to install it?',
  //       optionalIgnoreButtonLabel: 'Later',
  //       optionalInstallButtonLabel: 'Install',
  //       mandatoryUpdateMessage: 'An update is required to continue.',
  //       mandatoryContinueButtonLabel: 'Update',
  //     },
  //   };

  //   codePush.sync(
  //     syncOptions,
  //     status => {
  //       console.log('CodePush status:', status);
  //     },
  //     progress => {
  //       console.log(
  //         `Downloading: ${progress.receivedBytes} / ${progress.totalBytes}`,
  //       );
  //     },
  //   );
  // }, []);

  useEffect(() => {
    // Manage ads Point Wise
    notifee.setBadgeCount(0).then(() => console.log('Badge count removed!'));

    // setAdsVisible(
    //   // Boolean(isAdsVisibleRemote) && Number(userData?.user?.tokens) <= 0,
    //   // true,
    // ); // in  development

    console.log(
      'Boolean(isAdsVisibleRemote) && Number(userData?.user?.tokens) <= 0 <<<<',
      Boolean(isAdsVisibleRemote),
      userData?.user?.tokens,
      !userState.getState().userData?.user?.tokens ||
        Number(userData?.user?.tokens) <= 0,
      Boolean(isAdsVisibleRemote) &&
        (!userState.getState().userData?.user?.tokens ||
          Number(userData?.user?.tokens) <= 0),
    );

    setAdsVisible(
      Boolean(isAdsVisibleRemote) &&
        (!userState.getState().userData?.user?.tokens ||
          Number(userData?.user?.tokens) <= 0),
      // && !__DEV__,
    );
  }, [
    subEnabled,
    isAdsVisibleRemote,
    userData?.user?.id,
    userData?.user?.tokens,
  ]);

  const checkInternetConnection = async () => {
    try {
      const netInfoState = await NetInfo.fetch();
      setIsConnected(netInfoState.isConnected);
    } catch (error) {
      console.log('Error checking connection:', error);
      setIsConnected(false);
    }
  };

  const refreshTokenOnLaunch = async () => {
    if (userData?.access_token && userData?.refresh_token) {
      const formData = new FormData();
      formData.append('refresh', userData?.refresh_token);
      try {
        await RefreshToken(formData).then(res => {
          console.log('REFRES-TOKEN-API-CALL----->', res);
          setUserData({
            ...userData,
            access_token: res.data.data.access,
            refresh_token: res.data.data.refresh,
          });
        });
      } catch (error) {
        console.log('🔴 Refresh token failed:', error);
      }
    }
  };
  const initAdSdk = async () => {
    await MobileAds().initialize();
  };

  useEffect(() => {
    initAdSdk();
    userState?.getState().setHomeAvatarList(undefined);
    userState?.getState().setMyAvatars([]);
    userState?.getState().setIsOpenPlan(false);
    userState?.getState().setIsCallEnded(false);
    userState?.getState().setCallEndReason('');
    useChatStore.getState().setIsChatListUpdated(true);
    userState?.getState().setIsAppReady(false);
    userState.getState().setTokensInfoWithApi();
    useCategoryStore.getState().setSummeryList([]);
    useCategoryStore.getState().setCurrentIndex(0);

    setTheme('girlfriend');
    if (userData?.access_token && userData?.refresh_token) {
      refreshTokenOnLaunch();
    }
  }, []);

  useEffect(() => {
    console.log('nextAppState=isAdClosed', userState.getState().isAdClosed);
    if (userState.getState().isAdClosed) {
      setTimeout(() => {
        userState.getState().setSplashState(false);
        userState.getState().setIsAdClosed(false);
      }, 1000);
      return;
    }
  }, [userState.getState().isAdClosed]);

  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener(state => {
      setIsConnected(state.isConnected);
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    setShowNoInternetModal(isConnected === false);
  }, [isConnected]);

  const customTheme: Theme = {
    ...DefaultTheme,
    colors: {
      ...DefaultTheme.colors,
      background: theme?.primaryBackground,
    },
  };
  const versionToNumber = (version: any, parts = 3) => {
    const split = version?.split('.').map(Number);
    while (split.length < parts) {
      split.push(0);
    }
    return split.reduce(
      (acc: number, val: number, i: number) =>
        acc + val * Math.pow(1000, parts - i - 1),
      0,
    );
  };

  const isAppVersionValid = () => {
    const currentVersion = DeviceInfo.getVersion(); // e.g., '1.0.39'
    const minRequired =
      useAdsStore?.getState().remoteData?.requiredVersion[
        Platform.OS as 'ios' | 'android'
      ]; // e.g., '1.0.40'

    const currentNumeric = versionToNumber(currentVersion);
    const requiredNumeric = versionToNumber(minRequired);
    return currentNumeric >= requiredNumeric;
  };
  const findNestedRoute = (state: any, path = 'routes') => {
    const currentItem =
      path === 'routes' ? state?.routes?.[state?.index] : state?.state;
    if (currentItem?.routes) {
      return findNestedRoute(currentItem, 'routes');
    } else if (currentItem?.state) {
      return findNestedRoute(currentItem, 'state');
    } else {
      return currentItem?.name;
    }
  };

  const onStateChange = (state: NavigationState | undefined) => {
    if (state) {
      const name = findNestedRoute(state);
      console.log('&&&&&&&&&&current-screen==>', name, state);
      setCurrentScreenTrack(navigationRef?.current?.getCurrentRoute()?.name);
      if (name === 'Home') {
        setCurrentScreen(0);
      } else if (name === 'Chat') {
        setCurrentScreen(1);
      } else if (name === 'MyAvatar') {
        setCurrentScreen(2);
      } else if (name === 'Account') {
        setCurrentScreen(3);
      }
    }
    console.log(
      'isAdsVisible==>',
      isAdsVisible,
      !isAdsVisible ||
        (!!userData.user?.tokens && Number(userData.user?.tokens) > 0),
      state,
    );

    if (
      !isAdsVisible ||
      (!!userData.user?.tokens && Number(userData.user?.tokens) > 0)
    ) {
      console.log('user Has token.....***');
      return;
    }

    if (!state) return; // for development comment this line

    const currentRouteIndex = state.index;

    const prevRouteIndex = prevRouteIndexRef.current;

    prevRouteIndexRef.current = currentRouteIndex;

    const currentRoute = navigationRef?.current?.getCurrentRoute();
    const currentRouteName = currentRoute?.name;
    const prevRouteName = prevRouteNameRef.current;
    console.log(
      'SCREEN===>',
      prevRouteName,
      currentRouteName,
      useAdsStore.getState().intro2InterstitialAd,
    );

    // console.log('SHOW-AD......', adsCount, navigationCount);
    if (
      (prevRouteName === 'IntroScreen0' &&
        currentRouteName === 'IntroScreen1' &&
        remoteData.ads_IntroScreen1) ||
      (prevRouteName === 'IntroScreen2' &&
        currentRouteName === 'AuthStart' &&
        remoteData.ads_IntroScreen2) ||
      (prevRouteName === 'Onboarding' &&
        currentRouteName === 'CreateAvatarStep0' &&
        remoteData.ads_BG_GFScreen)
    ) {
      setNavigationCount(0);
      userState.getState().setSplashState(true);
      navigationRef?.current?.navigate('InterstitialAd', {
        isFrom: prevRouteName,
      });
    } else if (prevRouteIndex !== null && currentRouteIndex >= prevRouteIndex) {
      prevRouteNameRef.current = currentRouteName;
      if (
        currentRouteName == 'IntroScreen0' ||
        currentRouteName == 'IntroScreen1' ||
        currentRouteName == 'IntroScreen2' ||
        currentRouteName == 'Onboarding'
      ) {
        prevRouteNameRef.current = currentRouteName;
        return;
      } else if (navigationCount >= adsCount) {
        // console.log(
        //   'SHOW-AD in condition....',
        //   adsCount,
        //   navigationCount,
        //   createAvatarScreens,
        //   remoteData.createAvatarAdsCount,
        // );

        if (createAvatarScreens && remoteData.createAvatarAdsCount !== 0) {
          return;
        } else {
          setNavigationCount(0);
          userState.getState().setSplashState(true);
          // Trigger interstitial ad display
          navigationRef?.current?.navigate('InterstitialAd');
        }
      } else {
        incrementNavigationCount();
      }
    }
    prevRouteNameRef.current = currentRouteName;
  };

  const timeoutPromise = new Promise((_, reject) =>
    setTimeout(() => reject(new Error('Ad load timeout')), 4000),
  );

  useEffect(() => {
    console.log('update');
    homeStore.getState()?.resetAvatarsBySelectedCategories();
    homeStore.getState()?.resetExploresBySelectedCategories();
    homeStore.getState()?.setIsOpenStoryScreen(true);
    categoriesState.getState()?.resetExplores();
    categoriesState.getState()?.resetAvtars();
    isAppVersionValid();

    const removeNetInfoSubscription = NetInfo.addEventListener(state => {
      const offline =
        state.isInternetReachable == null
          ? !state.isConnected
          : !(state.isConnected && state.isInternetReachable);
      setIsConnected(!offline);
    });

    return () => {
      removeNetInfoSubscription();
      setIsConnected(false);
    };
  }, []);

  return (
    <>
      <SafeAreaProvider>
        <StatusBar
          translucent
          backgroundColor={theme.bottomTabBackground} // white background
          barStyle="dark-content" // black text/icons
        />
        <GestureHandlerRootView style={{ flex: 1 }}>
          <NavigationContainer
            theme={customTheme}
            ref={navigationRef}
            onStateChange={onStateChange}
          >
            <NotificationController />
            <Appnavigation />
          </NavigationContainer>
          <FlashMessage position="top" />
          {showNoInternetModal ? (
            <CustomNoInternetModal
              checkInternetConnection={checkInternetConnection}
              showNoInternetModal={showNoInternetModal}
            />
          ) : null}
        </GestureHandlerRootView>
      </SafeAreaProvider>
    </>
  );
};

export default App;
