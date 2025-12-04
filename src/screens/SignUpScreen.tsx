import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  Platform,
  Alert,
  KeyboardAvoidingView,
  ScrollView,
  StatusBar,
  ImageBackground,
} from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import * as Yup from 'yup';
import { useFormik } from 'formik';
import DeviceInfo from 'react-native-device-info';
import {
  launchImageLibrary,
  ImagePickerResponse,
  MediaType,
  ImageLibraryOptions,
} from 'react-native-image-picker';

import IMAGES from '../assets/images';
import { AccountRegister, setEventTrackinig } from '../api/user';
import { LoginData, userSelfAvatar, userState } from '../store/userStore';
import { customColors } from '../utils/Colors';
import { useThemeStore } from '../store/themeStore';
import AuthHeader from '../components/headers/CustomAuthHeader';
import CustomInput from '../components/inputs/CustomInput';
import PrimaryButton from '../components/buttons/CommonPrimaryButton';
import { moderateScale, scale, verticalScale } from '../utils/Scale';
import CustomActivityIndicator from '../components/CustomActivityIndicator';
import { CupidThemeName } from '../theme/themes';
import CommonImagePlaceHolder from '../components/CommonImagePlaceHolder';
import { RootStackParamList } from '../types/navigation';
import { logFirebaseEvent } from '../utils/HelperFunction';
import { EVENT_NAME } from '../constants';
import Fonts from '../utils/fonts';
import AppConstant from '../utils/AppConstant';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useCategoryStore } from '../store/categoryStore';

const SignUpScreen = () => {
  const navigation = useNavigation<any>();
  const route = useRoute<RouteProp<RootStackParamList, 'SignUp'>>();

  const { theme, setTheme, themeName } = useThemeStore();
  const { setUserData, setIsSignUpUSer, userData } = userState();

  const [selectedInterest, setSelectedInterest] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedProfileUri, setSelectedProfileUri] = useState<string | null>(
    null,
  );
  const [selectedImageDetails, setSelectedImageDetails] = useState<any>(null);

  const isFromPlan = route.params?.isfromPlan;
  const isFromAccount = route.params?.isFromAccount;
  const isFromAdsPlan = route.params?.isFromAdsPlan;

  const styles = useStyles();

  useEffect(() => {
    if (isFromPlan) {
      logFirebaseEvent(EVENT_NAME.OPEN_SIGNUP_FROM_SUBSCRIPTION, {
        user_id: userData?.user?.id,
      });
    }
  }, []);

  const handleOpenGallery = () => {
    const options: ImageLibraryOptions = {
      mediaType: 'photo' as MediaType,
      includeBase64: false,
      maxHeight: 2000,
      maxWidth: 2000,
      quality: 0.8,
    };

    launchImageLibrary(options, (response: ImagePickerResponse) => {
      if (response.didCancel) return;
      if (response.errorMessage) {
        Alert.alert('Error', 'Failed to select image');
        return;
      }

      const asset = response.assets?.[0];
      if (asset?.uri) {
        setSelectedProfileUri(asset.uri);
        setSelectedImageDetails(asset);
      }
    });
  };

  const formik = useFormik({
    initialValues: {
      full_name: '',
      email: '',
      password: '',
      confirmPassword: '',
      profile_image: selectedProfileUri,
      interested: '',
    },
    validationSchema: Yup.object({
      full_name: Yup.string()
        .required('Name is required')
        .matches(/^[A-Za-z\s]+$/, 'Name can only contain letters and spaces')
        .min(2, 'Name must be at least 2 characters'),
      email: Yup.string()
        .required('Email is required')
        .matches(
          /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
          'Please enter a valid email address',
        ),
      password: Yup.string()
        .min(8, 'Password must be at least 8 characters')
        .matches(/[A-Z]/, 'Must contain at least one uppercase letter')
        .matches(/[a-z]/, 'Must contain at least one lowercase letter')
        .matches(/[0-9]/, 'Must contain at least one number')
        .matches(
          /[@$!%*?&#^()_+\-=[\]{};':"\\|,.<>/?]/,
          'Must contain one special character',
        )
        .required('Password is required'),
      confirmPassword: Yup.string()
        .oneOf([Yup.ref('password')], 'Passwords must match')
        .required('Confirm Password is required'),
      interested: Yup.string().required('Please select your interest'),
    }),
    onSubmit: async values => {
      try {
        setIsLoading(true);
        const deviceId = await DeviceInfo.getUniqueId();
        const fcmToken = userState.getState().fcmToken;

        const formData = new FormData();
        console.log('come in try signup flow...');
        formData.append('full_name', values.full_name);
        if (values?.profile_image) {
          formData.append('profile_image', values.profile_image);
        }
        formData.append('email', values.email);
        formData.append('password', values.password);
        formData.append('device_id', deviceId);
        formData.append('device_type', Platform.OS);
        formData.append('fcm_token', fcmToken || '');
        formData.append('is_interested', values.interested.toLowerCase());

        if (selectedProfileUri && selectedImageDetails) {
          formData.append('profile_image', {
            uri: selectedProfileUri,
            type: selectedImageDetails.type,
            name: selectedImageDetails.fileName,
          } as any);
        }

        await AccountRegister(formData).then(res => {
          const response = res?.data?.data as {
            access: string;
            refresh: string;
            user: LoginData;
            avatar: userSelfAvatar;
          };
          setIsSignUpUSer(true);

          // error msg clear on create avatar step generate
          useCategoryStore.getState().setAvatarErrMessage('');

          if (isFromPlan) {
            logFirebaseEvent(EVENT_NAME.SIGNUP_FROM_SUBSCRIPTION, {
              email: values.email,
              user_id: response.user.id,
            });
            setEventTrackinig({
              event_type: EVENT_NAME.SIGNUP_FROM_SUBSCRIPTION,
            });
          } else {
            logFirebaseEvent(EVENT_NAME.AUTH_SIGNUP_SUCCESS, {
              email: values.email,
              user_id: response.user.id,
            });
            setEventTrackinig({ event_type: EVENT_NAME.AUTH_SIGNUP_SUCCESS });
          }

          setUserData({
            access_token: response.access,
            refresh_token: response.refresh,
            user: response.user,
            avatar: response.avatar,
            isGuestUser: response.user?.email == null,
          });

          if (isFromAccount || isFromPlan || isFromAdsPlan) {
            if (isFromPlan) userState.getState().setIsOpenPlan(true);
            if (isFromAdsPlan) userState.getState().setIsAdsOpenPlan(true);
            navigation.goBack();
            return;
          }

          if (Object.keys(response.avatar || {}).length) {
            setTheme(
              (response.avatar.persona_type?.code as CupidThemeName) ||
                themeName,
            );
            if (
              response.user.isUserSubscribeOnce ||
              response.user.isCurrentlyEnabledSubscription
            ) {
              navigation.navigate('MainNavigation');
            } else {
              navigation.navigate('AvatarDetail', { isMyAvatar: true });
            }
          } else {
            navigation.navigate('Onboarding');
          }
        });
      } catch (error: any) {
        console.error('SignUp Error:', error);
      } finally {
        setIsLoading(false);
      }
    },
  });

  return (
    <>
      {isLoading && <CustomActivityIndicator />}
      <ImageBackground source={IMAGES.authBG} style={{ flex: 1 }}>
        <KeyboardAvoidingView
          style={{ flex: 1 }}
          keyboardVerticalOffset={
            Platform.OS === 'ios' ? 0 : StatusBar.currentHeight
          }
          behavior={Platform.OS === 'ios' ? 'height' : 'padding'}
        >
          <AuthHeader
            title="Sign Up"
            onBackPress={() => navigation.goBack()}
            containerStyle={{ paddingHorizontal: scale(24) }}
          />
          <ScrollView
            contentContainerStyle={{
              paddingHorizontal: scale(24),
              paddingBottom: useSafeAreaInsets().bottom + verticalScale(20),
            }}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
            bounces={false}
          >
            <View style={styles.profileContainer}>
              <CommonImagePlaceHolder
                imageStyle={styles.profileImage}
                image={selectedProfileUri || undefined}
                onPress={handleOpenGallery}
                isAppIcon={true}
              />
              <View style={styles.editWrapper}>
                <TouchableOpacity
                  style={[
                    styles.editButton,
                    { backgroundColor: theme.primaryFriend },
                  ]}
                  onPress={handleOpenGallery}
                >
                  <Image source={IMAGES.edit} style={styles.editIcon} />
                </TouchableOpacity>
              </View>
            </View>

            <CustomInput
              label="Name"
              value={formik.values.full_name}
              onChangeText={formik.handleChange('full_name')}
              error={formik.touched.full_name ? formik.errors.full_name : ''}
              placeholder="Enter your name"
            />

            <CustomInput
              label="Email"
              value={formik.values.email}
              onChangeText={formik.handleChange('email')}
              error={formik.touched.email ? formik.errors.email : ''}
              placeholder="Enter your email"
              keyboardType="email-address"
            />

            <CustomInput
              label="Password"
              value={formik.values.password}
              onChangeText={formik.handleChange('password')}
              error={formik.touched.password ? formik.errors.password : ''}
              placeholder="Enter password"
              isPassword
            />

            <CustomInput
              label="Confirm Password"
              value={formik.values.confirmPassword}
              onChangeText={formik.handleChange('confirmPassword')}
              error={
                formik.touched.confirmPassword
                  ? formik.errors.confirmPassword
                  : ''
              }
              placeholder="Confirm password"
              isPassword
            />

            <View style={{ marginLeft: scale(4) }}>
              <Text style={styles.label}>{'Are you interested in?'}</Text>
              <View style={[styles.rowContainer, { marginVertical: 5 }]}>
                {['Female', 'Male', 'Both'].map(item => (
                  <TouchableOpacity
                    key={item}
                    style={[styles.rowContainer, { marginHorizontal: 8 }]}
                    onPress={() => formik.setFieldValue('interested', item)}
                  >
                    <View style={styles.interestsContainer}>
                      <View
                        style={[
                          styles.interestsCheck,
                          {
                            backgroundColor:
                              formik.values.interested === item
                                ? theme.primaryFriend
                                : 'transparent',
                            borderRadius:
                              formik.values.interested === item
                                ? scale(50)
                                : scale(10),
                          },
                        ]}
                      />
                    </View>
                    <Text
                      style={[
                        styles.interestsText,
                        {
                          color:
                            formik.values.interested === item
                              ? theme.primaryFriend
                              : theme.text,
                        },
                      ]}
                    >
                      {item}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
              {formik.touched.interested && formik.errors.interested && (
                <Text style={styles.errorText}>{formik.errors.interested}</Text>
              )}
            </View>

            <View style={styles.buttonContainer}>
              <PrimaryButton
                title="Sign Up"
                onPress={() => {
                  formik.setTouched({
                    full_name: true,
                    email: true,
                    password: true,
                    confirmPassword: true,
                    interested: true,
                  });
                  formik.handleSubmit();
                }}
              />
              <Text style={[styles.registerText, { color: theme.text }]}>
                Already have an account?{' '}
                <Text
                  style={[styles.registerLink, { color: theme.primaryFriend }]}
                  onPress={() => {
                    navigation.replace(AppConstant.login);
                  }}
                >
                  Log in
                </Text>
              </Text>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </ImageBackground>
    </>
  );
};

export default SignUpScreen;

const useStyles = () => {
  const { theme } = useThemeStore();
  return StyleSheet.create({
    buttonContainer: {
      marginTop: verticalScale(40),
    },
    registerText: {
      color: '#777',
      fontSize: scale(14),
      textAlign: 'center',
    },
    registerLink: {
      color: customColors.primary,
      fontWeight: '500',
    },
    profileContainer: {
      alignItems: 'center',
      justifyContent: 'center',
      marginVertical: verticalScale(20),
    },
    profileImage: {
      width: scale(90),
      height: scale(90),
      borderRadius: scale(45),
      borderWidth: moderateScale(2),
      borderColor: theme.primaryFriend,
    },
    editWrapper: {
      borderRadius: scale(40),
      backgroundColor: 'white',
      marginTop: verticalScale(-20),
      marginLeft: verticalScale(50),
    },
    editButton: {
      padding: moderateScale(6),
      borderRadius: moderateScale(20),
      borderWidth: moderateScale(3),
      borderColor: 'white',
    },
    editIcon: {
      width: scale(15),
      height: verticalScale(15),
      resizeMode: 'contain',
    },
    label: {
      fontSize: moderateScale(16),
      color: customColors.labelColor,
      fontFamily: Fonts.IMedium,
    },
    rowContainer: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    interestsContainer: {
      borderRadius: scale(12),
      marginRight: moderateScale(8),
      width: scale(18),
      height: scale(18),
      borderWidth: moderateScale(1),
      borderColor: theme.primaryFriend,
      alignItems: 'center',
      justifyContent: 'center',
    },
    interestsCheck: {
      borderRadius: moderateScale(6),
      width: scale(12),
      height: scale(12),
    },
    interestsText: {
      color: theme.text,
      fontSize: scale(16),
      fontFamily: Fonts.IMedium,
    },
    errorText: {
      color: 'red',
      marginTop: 4,
      marginLeft: 5,
    },
  });
};
