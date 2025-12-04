import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Alert,
  ImageBackground,
} from 'react-native';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { useNavigation, useRoute } from '@react-navigation/native';

import { moderateScale, scale, verticalScale } from '../utils/Scale';
import { useThemeStore } from '../store/themeStore';
import CustomInput from '../components/inputs/CustomInput';
import IMAGES from '../assets/images';
import Fonts from '../utils/fonts';
import { ResetPassword } from '../api/user';
import { userState } from '../store/userStore';
import CommonPrimaryButton from '../components/buttons/CommonPrimaryButton';
import CustomAuthHeader from '../components/headers/CustomAuthHeader';

const ForgotPasswordScreen = () => {
  const { theme } = useThemeStore();
  const navigation = useNavigation<any>();
  const [isLoading, setIsLoading] = useState(true);
  const route = useRoute<any>();
  const { userData } = userState.getState();
  const userEmailAddress: any = userData?.user?.email;
  const isLoginAllowed = route.params?.isLoginAllow ?? true;
  const forgotPasswordStyles = ForgotPasswordScreenStyles();

  const formik = useFormik({
    initialValues: {
      email: '',
    },
    validationSchema: Yup.object({
      email: Yup.string()
        .required('Email is required')
        .matches(
          /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
          'Please enter a valid email address',
        )
        .when([], {
          is: () => !isLoginAllowed, // only apply when isLoginAllowed is false
          then: schema =>
            schema.oneOf([userEmailAddress], 'Please enter your login mail'),
          otherwise: schema => schema, // no extra restriction
        }),
    }),
    onSubmit: async values => {
      const resetPasswordFormData = new FormData();
      resetPasswordFormData.append('email', values.email);

      try {
        setIsLoading(true);
        await ResetPassword(resetPasswordFormData);
        Alert.alert(
          'Success',
          'If that email exists, a reset link has been sent.',
          [
            {
              text: 'OK',
              onPress: () =>
                navigation.navigate('Login', { email: values.email }),
            },
          ],
        );
      } catch (error) {
        Alert.alert('Error', 'Something went wrong. Please try again later.');
      } finally {
        setIsLoading(false);
      }
    },
  });

  return (
    <ImageBackground source={IMAGES.authBG} style={{ flex: 1 }}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={{ flex: 1 }}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 40 : 0}
      >
        {/* Header */}
        <CustomAuthHeader
          title={'Forgot Password'}
          onBackPress={() => navigation.goBack()}
          containerStyle={{
            paddingHorizontal: verticalScale(24),
          }}
        />
        <View style={forgotPasswordStyles.contentContainer}>
          {/* Heart Icon */}
          <View style={forgotPasswordStyles.heartIconContainer}>
            <Image
              source={IMAGES.app_icon_bg}
              style={[forgotPasswordStyles.heartIcon]}
              resizeMode="contain"
            />
          </View>

          <Text
            style={[
              forgotPasswordStyles.descriptionText,
              { color: theme.text },
            ]}
          >
            Enter the email associated with your account and we'll send an email
            with code to reset your password
          </Text>

          <CustomInput
            label="Email"
            value={formik.values.email}
            onChangeText={formik.handleChange('email')}
            error={formik.touched.email ? formik.errors.email : ''}
            keyboardType="email-address"
            autoCapitalize="none"
            placeholder="Enter your email"
          />

          <View style={forgotPasswordStyles.buttonContainer}>
            <CommonPrimaryButton
              title="Confirm"
              onPress={formik.handleSubmit}
              btnStyle={forgotPasswordStyles.submitButton}
              txtStyle={forgotPasswordStyles.saveText}
            />

            {isLoginAllowed && (
              <View style={forgotPasswordStyles.loginLinkContainer}>
                <Text
                  style={[
                    forgotPasswordStyles.loginLinkText,
                    { color: theme.text },
                  ]}
                >
                  Already have an account? {''}
                  <Text
                    style={{ color: '#007AFF' }}
                    onPress={() => navigation.goBack()}
                  >
                    Log In
                  </Text>
                </Text>
              </View>
            )}
          </View>
        </View>
      </KeyboardAvoidingView>
    </ImageBackground>
  );
};

export default ForgotPasswordScreen;

const ForgotPasswordScreenStyles = () => {
  const theme = useThemeStore().theme;
  return StyleSheet.create({
    container: {
      flex: 1,
    },
    contentContainer: { padding: scale(20) },
    headerRow: {
      flexDirection: 'row',
      alignItems: 'center',
      width: '100%',
      marginTop: verticalScale(20),
      marginBottom: verticalScale(50),
    },
    backButton: {
      marginRight: scale(10),
    },
    backIcon: {
      width: scale(48),
      height: scale(48),
    },
    headerTitle: {
      fontSize: scale(32),
      left: scale(10),
      fontFamily: Fonts.IMedium,
      fontWeight: '500',
    },
    descriptionText: {
      fontSize: scale(15),
      marginBottom: verticalScale(20),
      textAlign: 'auto',
      fontFamily: Fonts.IRegular,
    },
    buttonContainer: {
      width: '100%',
      marginTop: verticalScale(40),
      bottom: verticalScale(20),
    },
    loginLinkContainer: {
      alignItems: 'center',
      marginTop: verticalScale(10),
    },
    loginLinkText: {
      fontSize: scale(16),
      fontFamily: Fonts.IRegular,
    },
    heartIconContainer: {
      alignItems: 'center',
      marginTop: verticalScale(20),
      marginBottom: verticalScale(20),
    },
    heartIcon: {
      width: scale(80),
      height: scale(80),
    },
    submitButton: {
      alignItems: 'center',
      borderRadius: scale(8),
      paddingVertical: verticalScale(12),
      backgroundColor: theme.primaryFriend,
    },
    saveText: {
      color: theme.white,
      fontSize: moderateScale(16),
      fontFamily: Fonts.ISemiBold,
    },
  });
};
