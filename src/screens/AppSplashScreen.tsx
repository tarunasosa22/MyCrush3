import { Animated, Easing, Text, View, StyleSheet, Image, StatusBar } from 'react-native';
import React, { useEffect, useRef } from 'react';
import { AppAnimations } from '../assets/animation';
import { scale } from '../utils/Scale';
import { useThemeStore } from '../store/themeStore';
import { userState } from '../store/userStore';
import { useCategoryStore } from '../store/categoryStore';
import AppConstant from '../utils/AppConstant';
import { navigationRef } from '../../App';
import FastImage from 'react-native-fast-image';
import { useAdsStore } from '../store/useAdsStore';
import useAppOpenAd from '../hooks/useAppOpenAd';
import { useIsFocused } from '@react-navigation/native';
import { customColors } from '../utils/Colors';
import SplashLoadBannerAd from '../ads/SplashLoadBannerAd';
import { BannerAdSize } from 'react-native-google-mobile-ads';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import IMAGES from '../assets/images';

const AppSplashScreen = () => {
  const { theme } = useThemeStore();
  const { isAppReady, userData, setIsAppReady, setSplashState } = userState();
  const { categories } = useCategoryStore();
  const { isAdsVisible } = useAdsStore();
  const { showAppOpenAd } = useAppOpenAd();
  const inset = useSafeAreaInsets();
  const isFocused = useIsFocused();
  const hasNavigatedRef = useRef(false);
  const navigationTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const loadingProgressAnim = useRef(new Animated.Value(0)).current;

  const resolveInitialRoute = () => {
    if (userData?.access_token !== null) {
      if (userData?.isGuestUser) {
        if (!(userData?.avatar && Object.keys(userData.avatar).length)) {
          if (categories.length) {
            return 'AuthStart';
          } else {
            return 'AuthStart';
          }
        } else if (
          !!(userData?.avatar && Object.keys(userData.avatar).length)
        ) {
          return AppConstant.mainNav;
        }
      } else if (!userData?.isGuestUser) {
        if (!(userData?.avatar && Object.keys(userData.avatar).length)) {
          if (categories.length) {
            return 'Onboarding';
          } else {
            return 'Onboarding';
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

  const handleAdClosed = () => {
    resolveInitialRoute();
    setSplashState(true);
  };

  const handleAdFailed = () => {
    console.log('⚠️ AppOpenAd failed to load');
    setTimeout(() => {
      resolveInitialRoute();
      setSplashState(false);
    }, 1000);
  };

  const navigateToInitialScreen = () => {
    if (hasNavigatedRef.current) return;
    hasNavigatedRef.current = true;

    if (navigationTimeoutRef.current) {
      clearTimeout(navigationTimeoutRef.current);
      navigationTimeoutRef.current = null;
    }

    navigationRef.current?.reset({
      index: 0,
      routes: [
        {
          name: userState.getState().isUserFirstTime
            ? 'IntroScreen0'
            : resolveInitialRoute() || '',
        },
      ],
    });
  };

  const progressWidth = loadingProgressAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0%', '100%'],
  });

  useEffect(() => {
    showAppOpenAd(
      () => {
        console.log('✅ Ad closed → navigating');
        setIsAppReady(false);
        setTimeout(() => {
          navigateToInitialScreen();
          setSplashState(false);
        }, 1000);
      },
      () => {
        console.log('⚠️ Ad failed → navigating');
        setIsAppReady(false);
        setTimeout(() => {
          navigateToInitialScreen();
          setSplashState(false);
        }, 1000);
      },
    );

    const loopAnimation = () => {
      loadingProgressAnim.setValue(0);
      Animated.timing(loadingProgressAnim, {
        toValue: 1,
        duration: 2000,
        easing: Easing.linear,
        useNativeDriver: false,
      }).start(() => loopAnimation());
    };
    loopAnimation();

    navigationTimeoutRef.current = setTimeout(() => {
      console.log('⏱️ Timeout reached → navigating');
      setIsAppReady(false);
      setTimeout(() => {
        navigateToInitialScreen();
        setSplashState(false);
      }, 1000);
    }, 7000);

    return () => {
      if (navigationTimeoutRef.current) {
        clearTimeout(navigationTimeoutRef.current);
        navigationTimeoutRef.current = null;
      }
    };
  }, []);

  return (
    <View style={[styles.container, { backgroundColor: theme.primaryFriend }]}>
      <StatusBar
        translucent
        backgroundColor={'transparent'}
        barStyle="dark-content"
      />
      <View style={styles.logoContainer}>
        <Image
          source={IMAGES.app_icon_bg}
          resizeMode="contain"
          style={{ width: scale(180), height: scale(180),tintColor:'white' }}
        />
      </View>

      <View style={styles.textContainer}>
        <Text style={styles.loadingText}>App is Loading...</Text>
        <View style={styles.progressContainer}>
          <Animated.View
            style={[styles.progressBar, { width: progressWidth }]}
          />
        </View>
      </View>
      <View
        style={{
          marginBottom: inset.bottom + 1,
          justifyContent: 'center',
          alignItems: 'center',
        }}
      >
        <SplashLoadBannerAd size={BannerAdSize.ANCHORED_ADAPTIVE_BANNER} />
      </View>
    </View>
  );
};

export default AppSplashScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  logoContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  textContainer: {
    alignItems: 'center',
  },
  loadingText: {
    color: customColors.white,
    fontSize: scale(15),
  },
  progressContainer: {
    width: '90%',
    height: 6,
    backgroundColor: 'rgba(255,255,255,0.3)',
    borderRadius: 10,
    overflow: 'hidden',
    marginVertical: scale(15),
  },
  progressBar: {
    height: '100%',
    backgroundColor: customColors.white,
    borderRadius: 10,
  },
});
