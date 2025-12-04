import React, { useEffect, useLayoutEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StatusBar,
  ImageBackground,
} from 'react-native';
import { RouteProp, useNavigation, useRoute } from '@react-navigation/native';
import DeviceInfo from 'react-native-device-info';
import * as Yup from 'yup';
import { useFormik } from 'formik';
import Fonts from '../utils/fonts';
import { setEventTrackinig, socialSignUpAPI, UserLogin } from '../api/user';
import { LoginData, userSelfAvatar, userState } from '../store/userStore';
import { useThemeStore } from '../store/themeStore';
import { scale, verticalScale } from '../utils/Scale';
import CustomInput from '../components/inputs/CustomInput';
import CustomActivityIndicator from '../components/CustomActivityIndicator';
import AppConstant from '../utils/AppConstant';
import { CupidThemeName } from '../theme/themes';
import { navigationRef } from '../../App';
import { RootStackParamList } from '../types/navigation';
import IMAGES from '../assets/images';
import { GoogleSignin } from '@react-native-google-signin/google-signin';

import { useChatStore } from '../store/chatListStore';
import { EVENT_NAME } from '../constants';
import CustomAuthHeader from '../components/headers/CustomAuthHeader';
import CustomConfirmModal from '../components/CustomConfirmModal';
import CommonSocialButton from '../components/buttons/CommonSocialButton';
import CommonOrDivider from '../components/buttons/CommonOrDivider';
import CommonPrimaryButton from '../components/buttons/CommonPrimaryButton';
import {
  _google_signIn,
  handleAppleLogin,
  handleFacebookLogin,
} from './AuthStartScreen';
import { logFirebaseEvent } from '../utils/HelperFunction';
import { useCategoryStore } from '../store/categoryStore';

const LoginScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const { theme } = useThemeStore();
  const { setUserData, userData, isOpenPlan, setIsOpenPlan } = userState();
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState<boolean>(false);
  const { setTheme, themeName } = useThemeStore();
  const route = useRoute<RouteProp<RootStackParamList, 'Login'>>();
  const isfromPlan = route.params?.isfromPlan;
  const isFromAccount = route.params?.isFromAccount;
  const isFromStart = route.params?.isFromStart;
  const isFromAdsPlan = route.params?.isFromAdsPlan;
  const loginStyles = LoginScreenStyles();

  const formik = useFormik({
    initialValues: {
      email: '',
      password: '',
    },
    validationSchema: Yup.object({
      email: Yup.string()
        .required('Email is required')
        .matches(
          /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
          'Please enter a valid email address',
        ),
      password: Yup.string()
        .min(6, 'Password must be at least 6 characters')
        // .matches(/[A-Z]/, 'Password must contain at least one uppercase letter')
        // .matches(/[a-z]/, 'Password must contain at least one lowercase letter')
        // .matches(/[0-9]/, 'Password must contain at least one number')
        // .matches(
        //   /[@$!%*?&#^()_+\-=[\]{};':"\\|,.<>/?]/,
        //   'Password must contain at least one special character',
        // )
        .required('Password is required'),
    }),
    onSubmit: async values => {
      const deviceId = await DeviceInfo.getUniqueId();
      const platform = Platform.OS;
      const fcmToken = userState.getState().fcmToken;
      const loginFormData = new FormData();

      try {
        setLoading(true);
        loginFormData.append('email', values.email);
        loginFormData.append('password', values.password);
        loginFormData.append('device_id', deviceId);
        loginFormData.append('device_type', platform);
        loginFormData.append('fcm_token', fcmToken || '');

        await UserLogin(loginFormData)
          .then(res => {
            const loginResponse: {
              access: string;
              refresh: string;
              user: LoginData;
              avatar: userSelfAvatar;
            } = res?.data?.data;

            // error msg clear on create avatar step generate
            useCategoryStore.getState().setAvatarErrMessage('');

            if (isfromPlan) {
              logFirebaseEvent(EVENT_NAME.LOGIN_FROM_SUBSCRIPTION, {
                email: values.email?.toLowerCase(),
                user_id: res?.data?.data?.user.id,
                is_pro_user:
                  res?.data?.data?.user.isCurrentlyEnabledSubscription,
                users_token: res?.data?.data?.user.tokens,
              });
              setEventTrackinig({
                event_type: EVENT_NAME.LOGIN_FROM_SUBSCRIPTION,
              });
            } else {
              logFirebaseEvent(EVENT_NAME.AUTH_LOGIN_SUCCESS, {
                email: values.email?.toLowerCase(),
                user_id: res?.data?.data?.user.id,
                is_pro_user:
                  res?.data?.data?.user.isCurrentlyEnabledSubscription,
                users_token: res?.data?.data?.user.tokens,
              });
              setEventTrackinig({ event_type: EVENT_NAME.AUTH_LOGIN_SUCCESS });
            }
            handleLoginStateManagement(loginResponse);
          })
          .catch(error => {
            setShowModal(true);
            console.error(
              'Login error:',
              error.response?.data?.message || error.message,
            );
          })
          .finally(() => {
            setLoading(false);
          });
      } catch (error) {
        console.log('loginFormData error: ', error);
      }
    },
  });

  const handleLoginStateManagement = (response: any) => {
    setUserData({
      access_token: response?.access,
      refresh_token: response?.refresh,
      user: response?.user,
      avatar: response?.avatar,
      isGuestUser: response?.user?.email == null,
    });
    useChatStore.getState().setIsChatListUpdated(true);
    setLoading(false);
    if (response?.user.tokens > 0 && isfromPlan) {
      setIsOpenPlan(true);
    } else if (isFromAccount) {
      navigation.goBack();
    } else {
      if (response?.avatar && Object.keys(response.avatar).length > 0) {
        setTheme(
          (response?.avatar?.persona_type?.code as CupidThemeName) || themeName,
        );
        if (
          response?.user?.isUserSubscribeOnce ||
          response?.user?.isCurrentlyEnabledSubscription
        ) {
          navigationRef?.current?.reset({
            index: 0,
            routes: [{ name: AppConstant.mainNav }],
          });
        } else {
          navigationRef?.current?.reset({
            index: 0,
            routes: [{ name: AppConstant.mainNav }],
          });
          // navigation.navigate(AppConstant.avatarDetail);
        }
      } else {
        // Navigate to next screen if guest login is successful
        navigation.navigate(AppConstant.onboard, { isBackHide: true });
      }
    }
  };

  // for firebase Event Track
  useEffect(() => {
    if (isOpenPlan) {
      logFirebaseEvent(EVENT_NAME.OPEN_LOGIN_FROM_SUBSCRIPTION, {
        user_id: userData?.user?.id,
      });
      setEventTrackinig({
        event_type: EVENT_NAME.OPEN_LOGIN_FROM_SUBSCRIPTION,
      });
    }
  }, []);
  useLayoutEffect(() => {
    const checkAndNavigate = () => {
      if (
        !userState?.getState()?.isGuestUser &&
        (isfromPlan || isFromAccount || isFromAdsPlan)
      ) {
        if (!(userData?.avatar && Object.keys(userData.avatar).length)) {
          navigation.navigate('Onboarding');
        } else {
          if (isfromPlan) {
            userState.getState().setIsOpenPlan(true);
          }
          if (isFromAdsPlan) {
            userState.getState().setIsAdsOpenPlan(true);
          }
          if (navigation?.canGoBack()) {
            navigation.goBack();
          }
        }
      }
    };

    checkAndNavigate();
  }, [userState?.getState()?.isGuestUser]);

  const performSocialLogin = async (
    token: string,
    isGoogle?: boolean,
    isApple?: boolean,
  ) => {
    try {
      setLoading(true);
      const socialLoginFormData = new FormData();
      const deviceId = await DeviceInfo.getUniqueId();
      if (isApple) {
        socialLoginFormData.append('identity_token', token);
      } else {
        socialLoginFormData.append('token', token);
      }
      socialLoginFormData.append('device_id', deviceId);
      socialLoginFormData.append('device_type', Platform.OS);
      socialLoginFormData.append('fcm_token', userState?.getState()?.fcmToken);

      await socialSignUpAPI(socialLoginFormData, isGoogle, isApple)
        .then(res => {
          const loginResponse: {
            access: string;
            refresh: string;
            user: LoginData;
            avatar: userSelfAvatar;
          } = res?.data?.data;
          handleLoginStateManagement(loginResponse);
        })
        .catch(e => {
          console.error('Google Sign-In Error:', e);
          setLoading(false);
          // Show error popup
          // setShowPopup(true);
        });
    } catch (error) {
      console.error('Social login failed:', error);
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    await GoogleSignin.signOut();
    setTimeout(async () => {
      userState.getState().setSplashState(true);
      const socialAuthUserInfo = await _google_signIn();
      console.log('handleGoogleLogin', socialAuthUserInfo);
      if (socialAuthUserInfo?.data?.idToken) {
        await performSocialLogin(
          socialAuthUserInfo.data?.idToken || '',
          true,
          false,
        );
      }
    }, 200);
  };

  const performFacebookLogin = async () => {
    const socialAuthUserInfo = await handleFacebookLogin();
    console.log(
      'performFacebookLogin',
      socialAuthUserInfo,
      socialAuthUserInfo?.data,
    );
    if (socialAuthUserInfo?.data?.accessToken) {
      await performSocialLogin(
        socialAuthUserInfo.data?.accessToken || '',
        false,
        false,
      );
    }
  };

  const performAppleLogin = async () => {
    const socialAuthUserInfo = await handleAppleLogin();
    console.log('performAppleLogin', socialAuthUserInfo);
    if (socialAuthUserInfo?.identityToken) {
      await performSocialLogin(
        socialAuthUserInfo?.identityToken || '',
        false,
        true,
      );
    }
  };

  return (
    <>
      {loading ? <CustomActivityIndicator /> : null}
      <ImageBackground source={IMAGES.authBG} style={{ flex: 1 }}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'height' : 'padding'}
          keyboardVerticalOffset={
            Platform.OS === 'ios' ? 0 : StatusBar.currentHeight
          }
        >
          {/* Header */}
          <CustomAuthHeader
            title={'Log In'}
            onBackPress={() => navigation.goBack()}
            containerStyle={{
              paddingHorizontal: verticalScale(24),
            }}
          />
          <ScrollView bounces={false} showsVerticalScrollIndicator={false}>
            <View style={loginStyles.formContainer}>
              <CustomInput
                label={'Email'}
                value={formik.values.email}
                onChangeText={formik.handleChange('email')}
                error={formik.touched.email ? formik.errors.email : ''}
                keyboardType="email-address"
                placeholder={'Enter your email'}
              />

              <CustomInput
                label={'Password'}
                value={formik.values.password}
                onChangeText={formik.handleChange('password')}
                error={formik.touched.password ? formik.errors.password : ''}
                isPassword
                placeholder={'Enter your password'}
              />
              <View style={loginStyles.forgotPasswordRow}>
                {/* <TouchableOpacity style={loginStyles.rememberMeCheckboxContainer}>
                <View
                  style={[
                    loginStyles.rememberMeCheckbox,
                    {
                      borderColor: theme.primaryFriend,
                      backgroundColor: theme.primaryFriend,
                    },
                  ]}
                >
                  <Text style={loginStyles.rememberMeCheckboxTick}>✓</Text>
                </View>
              </TouchableOpacity>
              <Text style={[loginStyles.rememberMeText, { color: theme.text }]}>
                Remember me
              </Text> */}
                <TouchableOpacity
                  style={loginStyles.forgotPasswordButton}
                  onPress={() =>
                    navigation.navigate(AppConstant.forgot, {
                      isLoginAllow: true,
                    })
                  }
                >
                  <Text
                    style={[
                      loginStyles.forgotPasswordText,
                      { color: theme.text },
                    ]}
                  >
                    {'Forgot password?'}
                  </Text>
                </TouchableOpacity>
              </View>

              <View style={loginStyles.actionButtonsContainer}>
                <CommonPrimaryButton
                  title={'Log In'}
                  onPress={() => {
                    formik.setTouched({ email: true, password: true });
                    formik.handleSubmit();
                  }}
                />

                <View style={loginStyles.signUpLinkContainer}>
                  <Text
                    style={[loginStyles.signUpLinkText, { color: theme.text }]}
                  >
                    {"Don't have an account?"}
                    <Text
                      style={[
                        loginStyles.signUpLinkText,
                        { color: theme.primaryFriend },
                      ]}
                      onPress={() =>
                        navigation.replace(AppConstant.signup, {
                          isfromPlan: isfromPlan,
                          isFromAccount: isFromAccount,
                          isFromAdsPlan: isFromAdsPlan,
                        })
                      }
                    >
                      {''} {'Register'}
                    </Text>
                  </Text>
                </View>
                {isFromStart ? (
                  <></>
                ) : (
                  <>
                    <CommonOrDivider />
                    <CommonSocialButton
                      icon={IMAGES.Google}
                      title="Continue with Google"
                      onPress={() => {
                        handleGoogleLogin();
                      }}
                    />
                    {/* <SocialButton
                      icon={IMAGES.facebook}
                      title="Continue with Facebook"
                      onPress={() => {
                        performFacebookLogin();
                      }}
                    /> */}
                    {Platform.OS == 'ios' && (
                      <CommonSocialButton
                        icon={IMAGES.APPLE_ICON}
                        title="Continue with Apple"
                        onPress={() => {
                          performAppleLogin();
                        }}
                      />
                    )}
                  </>
                )}
              </View>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
        <CustomConfirmModal
          visible={showModal}
          title="Invalid Credentials"
          message="No active account found with the given credentials!"
          onConfirm={() => {
            setShowModal(false);
          }}
          onCancel={() => setShowModal(false)}
          btnText={'Try Again'}
          icon={IMAGES.warning_icon}
        />
      </ImageBackground>
    </>
  );
};

export default LoginScreen;

const LoginScreenStyles = () => {
  return StyleSheet.create({
    formContainer: {
      paddingHorizontal: scale(24),
      paddingTop: verticalScale(60),
    },
    forgotPasswordRow: {
      flexDirection: 'row',
      alignItems: 'center',
      width: '100%',
    },
    rememberMeCheckboxContainer: {
      marginRight: 8,
    },
    rememberMeCheckbox: {
      width: scale(18),
      height: scale(18),
      borderRadius: 4,
      borderWidth: 1.5,
      alignItems: 'center',
      justifyContent: 'center',
    },
    rememberMeCheckboxTick: {
      color: 'white',
      fontSize: scale(12),
    },
    rememberMeText: {
      fontSize: scale(12),
      fontFamily: Fonts.IRegular,
    },
    forgotPasswordButton: {
      marginLeft: 'auto',
    },
    forgotPasswordText: {
      fontSize: scale(16),
      fontFamily: Fonts.IMedium,
    },
    actionButtonsContainer: {
      width: '100%',
      marginTop: verticalScale(80),
      bottom: verticalScale(40),
    },
    signUpLinkContainer: {
      alignItems: 'center',
    },
    signUpLinkText: {
      fontSize: scale(16),
      textAlign: 'center',
      fontFamily: Fonts.IMedium,
    },
  });
};
