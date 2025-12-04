import React, { useEffect, useState } from 'react';
import {
  View,
  StyleSheet,
  Image,
  Platform,
  Text,
  TouchableOpacity,
  Alert,
  ImageBackground,
  StatusBar,
} from 'react-native';
import { appleAuth } from '@invertase/react-native-apple-authentication';
import CustomPopup from '../components/CustomPopup'; // Import the popup component
import { scale, verticalScale } from '../utils/Scale';
import { useThemeStore } from '../store/themeStore';
import { useIsFocused, useNavigation } from '@react-navigation/native';
import IMAGES from '../assets/images';
import DeviceInfo from 'react-native-device-info';
import {
  socialSignUpAPI,
  guestUserLogin,
  LogOut,
  setEventTrackinig,
} from '../api/user';
import {
  GuestData,
  LoginData,
  userSelfAvatar,
  userState,
} from '../store/userStore';
import CustomActivityIndicator from '../components/CustomActivityIndicator';
import { CupidThemeName } from '../theme/themes';
import PrimaryButton from '../components/buttons/CommonPrimaryButton';
import OutlinedButton from '../components/buttons/CommonOutlinedButton';
import OrDivider from '../components/buttons/CommonOrDivider';
import AppConstant from '../utils/AppConstant';
import CommonLinearContainer from '../components/CommonLinearContainer';
import { navigationRef } from '../../App';
import messaging from '@react-native-firebase/messaging';
import SocialButton from '../components/buttons/CommonSocialButton';
import {
  GoogleSignin,
  statusCodes,
} from '@react-native-google-signin/google-signin';
import { LoginManager, AccessToken, Profile } from 'react-native-fbsdk-next';
import { logFirebaseEvent as handleFirebaseLogEvent } from '../utils/HelperFunction';
import { EVENT_NAME } from '../constants';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export const _google_signIn = async () => {
  try {
    await GoogleSignin.hasPlayServices();
    const userInfo = await GoogleSignin.signIn();
    console.log('Google Sign-In Success:', userInfo);
    return userInfo;
  } catch (error: any) {
    if (error.code === statusCodes.SIGN_IN_CANCELLED) {
      console.error('error SIGN_IN_CANCELLED', error);
    } else if (error.code === statusCodes.IN_PROGRESS) {
      console.error('error statusCodes.IN_PROGRESS', error);
    } else if (error.code === statusCodes.PLAY_SERVICES_NOT_AVAILABLE) {
      console.error('error PLAY_SERVICES_NOT_AVAILABLE', error);
    } else {
      console.error('error', error);
      console.error('Google Sign-In Error::', error);
    }
    throw error;
  } finally {
  }
};

export const handleFacebookLogin = async () => {
  try {
    LoginManager.logOut();
    // Trigger login
    const result = await LoginManager.logInWithPermissions(
      ['public_profile', 'email'],
      'enabled',
    );

    if (result.isCancelled) {
      Alert.alert('Login cancelled');
      return;
    }
    console.log('result---->', result);

    // Get access token
    const data = await AccessToken.getCurrentAccessToken();
    console.log('data---->', data);
    // if (!data) {
    //   throw 'Something went wrong obtaining access token';
    // }

    // Optional: Get user profile
    const profile = await Profile.getCurrentProfile();
    console.log('FB Profile:', profile);

    return { result, data, profile };
    // Alert.alert('Login Success', `Hi ${profile?.name}`);
  } catch (error: any) {
    console.error('Facebook Login Error:', error);
    Alert.alert('Login Error', error.toString());
  }
};

export const handleAppleLogin = async () => {
  try {
    // 1️⃣ Start the Apple sign-in request
    const appleAuthRequestResponse = await appleAuth.performRequest({
      requestedOperation: appleAuth.Operation.LOGIN,
      requestedScopes: [appleAuth.Scope.EMAIL, appleAuth.Scope.FULL_NAME],
    });

    console.log('Apple Auth Response:', appleAuthRequestResponse);

    // 2️⃣ Get the identity token
    const { identityToken, user, email, fullName } = appleAuthRequestResponse;

    if (!identityToken) {
      Alert.alert('Apple Sign-In failed', 'No identity token returned');
      return;
    }

    // Optional: Send token to your backend for verification
    // await api.verifyAppleToken(identityToken);

    return {
      user,
      email,
      fullName,
      identityToken,
    };
  } catch (error: any) {
    console.error('Apple Sign-In Error:', error);
    Alert.alert('Apple Sign-In Error', error.message || error.toString());
  }
};

const AuthStartScreen = () => {
  const { theme } = useThemeStore();
  const navigation = useNavigation<any>();
  const [isLoading, setIsLoading] = useState(false);
  const [showPopup, setShowPopup] = useState(false);

  const { setUserData, userData } = userState();
  const { setTheme, themeName } = useThemeStore();
  const styles = Styles();
  const focus = useIsFocused();

  GoogleSignin.configure({
    webClientId:
      '981896298601-t3p7s49jfh0c83in3kfbifjffqgnsa78.apps.googleusercontent.com', // from Firebase console
    iosClientId:
      '981896298601-7i6dottr5mta518it70hl43ep37ndlba.apps.googleusercontent.com',
    offlineAccess: false, // optional, if you want server auth code
    // forceCodeForRefreshToken: true, // optional
  });

  useEffect(() => {
    if (focus) {
      setTimeout(() => {
        userState.getState().setSplashState(false);
      }, 3000);
      setTheme('girlfriend');
    }
  }, [focus]);

  const stateManager = (response: any, isSocialSignIN?: boolean) => {
    console.log('response--->', response);
    setUserData({
      access_token: response?.access,
      refresh_token: response?.refresh,
      isGuestUser: !!response?.guest_user,
      user: {
        ...(response?.guest_user ?? response?.user),
        isUserSubscribeOnce: false,
        isCurrentlyEnabledSubscription: false,
        tokens: 0,
      },
      avatar: response?.avatar,
    });
    setIsLoading(false);

    // Check if user already has an avatar or needs to login
    // You can modify this condition based on your API response
    if (response?.avatar && Object.keys(response.avatar).length > 0) {
      setTheme(
        (response.avatar.persona_type?.code as CupidThemeName) || themeName,
      );

      if (response?.guest_user) {
        navigationRef.current?.navigate('AvatarDetail', {
          isMyAvatar: true,
          item: response?.avatar,
        });
      } else {
        navigationRef.current?.reset({
          index: 0, // the active route index
          routes: [
            {
              name: AppConstant.avatarDetail,
              params: { isMyAvatar: true, item: response?.avatar },
            },
          ],
        });
      }

      // navigation.navigate(AppConstant.avatarDetail, { isMyAvatar: true });
    } else {
      // Navigate to next screen if guest login is successful
      if (response?.guest_user) {
        return navigation.navigate(AppConstant.onboard);
      }
      navigationRef.current?.reset({
        index: 0, // the active route index
        routes: [
          {
            name: AppConstant.onboard,
          },
        ],
      });
    }
  };

  const onGuestLogin = async () => {
    if (userData?.isGuestUser) {
      if (!!(userData?.avatar && Object.keys(userData.avatar).length)) {
        return navigation.navigate(AppConstant.avatarDetail);
      } else {
        return navigation.navigate(AppConstant.onboard);
      }
    }
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
          stateManager(response, false);
          handleFirebaseLogEvent(EVENT_NAME.ONBOARDING_START_AS_GUEST, {
            device_id,
            user_id: res?.data?.data?.guest_user?.id,
          });
          setEventTrackinig({
            event_type: EVENT_NAME.ONBOARDING_START_AS_GUEST,
          });
        })
        .catch(e => {
          console.error('Guest login error:', e);
          setIsLoading(false);
          // Show error popup
          // setShowPopup(true);
        });
    } catch (error) {
      setIsLoading(false);
      console.error('Guest login failed:', error);
      // setShowPopup(true);
    }
  };

  const socialLogin = async (
    token: string,
    isGoogle?: boolean,
    isApple?: boolean,
  ) => {
    try {
      setIsLoading(true);
      const form = new FormData();
      const device_id = await DeviceInfo.getUniqueId();
      if (isApple) {
        form.append('identity_token', token);
      } else {
        form.append('token', token);
      }
      form.append('device_id', device_id);
      form.append('device_type', Platform.OS);
      form.append('fcm_token', userState?.getState()?.fcmToken);

      await socialSignUpAPI(form, isGoogle, isApple)
        .then(res => {
          const response: {
            access: string;
            refresh: string;
            user: LoginData;
            avatar: userSelfAvatar;
          } = res?.data?.data;
          stateManager(response);
        })
        .catch(e => {
          console.error('Google Sign-In Error:', e);
          setIsLoading(false);
          // Show error popup
          // setShowPopup(true);
        });
    } catch (error) {
      console.error('Social login failed:', error);
      setIsLoading(false);
    }
  };

  const handleLogin = () => {
    setShowPopup(false);
    navigation.navigate('Login');
  };

  const handleSignUp = () => {
    setShowPopup(false);
    navigation.navigate('SignUp');
  };

  const closePopup = () => {
    setShowPopup(false);
  };

  const onGoogleLogin = async () => {
    await GoogleSignin.signOut();
    setTimeout(async () => {
      userState.getState().setSplashState(true);
      const userInfo = await _google_signIn();
      console.log('onGoogleLogin', userInfo);
      if (userInfo?.data?.idToken) {
        await socialLogin(userInfo.data?.idToken || '', true);
      }
    }, 200);
  };

  const onFacebookLogin = async () => {
    const userInfo = await handleFacebookLogin();
    console.log('onFacebookLogin', userInfo, userInfo?.data);
    if (userInfo?.data?.accessToken) {
      await socialLogin(userInfo.data?.accessToken || '', false);
    }
  };

  const onAppleLogin = async () => {
    const userInfo = await handleAppleLogin();
    console.log('onAppleLogin', userInfo);
    if (userInfo?.identityToken) {
      await socialLogin(userInfo?.identityToken || '', false, true);
    }
  };

  return (
    <>
      {isLoading ? <CustomActivityIndicator /> : null}
       <StatusBar
        translucent
        backgroundColor={'transparent'}
        barStyle="dark-content"
      />
      <ImageBackground
        source={IMAGES.createAvatarBG}
        style={{ flex: 1 }}
        imageStyle={{ opacity: 0.5 }}
      >
        <View style={styles.imageContainer}>
          <Image
            source={IMAGES.startScreen}
            style={styles.image}
            resizeMode="contain"
          />
        </View>
        <View style={styles.buttonContainer}>
          <PrimaryButton
            title="Log In"
            onPress={() => navigation.navigate('Login', { isFromStart: true })}
          />
          <OutlinedButton
            title="Sign Up"
            onPress={() => navigation.navigate('SignUp')}
          />
          <OrDivider />
          <OutlinedButton
            title="Continue as Guest"
            onPress={() => onGuestLogin()}
          />

          <SocialButton
            icon={IMAGES.Google}
            title="Continue with Google"
            onPress={() => {
              onGoogleLogin();
            }}
          />
          {/* <SocialButton
            icon={IMAGES.facebook}
            title="Continue with Facebook"
            onPress={() => {
              onFacebookLogin();
            }}
          /> */}
          {Platform.OS == 'ios' && (
            <SocialButton
              icon={IMAGES.APPLE_ICON}
              title="Continue with Apple"
              onPress={() => {
                onAppleLogin();
              }}
            />
          )}
        </View>

        {/* Custom Popup */}
        <CustomPopup
          visible={showPopup}
          onClose={closePopup}
          title="Account Required"
          message="Thank you for logging in as a guest. You've already created an avatar, so please log in or sign up to access the app."
          type="info"
          primaryButtonText="Log In"
          secondaryButtonText="Sign Up"
          onPrimaryPress={handleLogin}
          onSecondaryPress={handleSignUp}
          icon={undefined} // You can use a custom icon
        />
      </ImageBackground>
    </>
  );
};

export default AuthStartScreen;

const Styles = () => {
  const theme = useThemeStore().theme;
  const insets = useSafeAreaInsets();
  return StyleSheet.create({
    container: {
      flex: 1,
    },
    imageContainer: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
    },
    image: {
      width: scale(150),
      height: verticalScale(150),
    },
    buttonContainer: {
      width: '100%',
      paddingHorizontal: scale(24),
      paddingBottom: verticalScale(insets.bottom),
    },
    categoryViewText: {
      textAlign: 'center',
      fontSize: scale(13),
      color: theme.heading,
      textDecorationLine: 'underline',
      marginBottom: verticalScale(10),
    },
    logout: {
      backgroundColor: '#FFFFFF',
      borderRadius: scale(24),
      padding: scale(12),
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 3 },
      shadowOpacity: 0.2,
      shadowRadius: 4,
      elevation: 4,
    },
    icon: {
      width: scale(20),
      height: scale(20),
      resizeMode: 'contain',
    },
  });
};
