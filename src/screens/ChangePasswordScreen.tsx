import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  TouchableWithoutFeedback,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';
import { useFormik } from 'formik';
import * as Yup from 'yup';

import Fonts from '../utils/fonts';
import { customColors } from '../utils/Colors';
import AppConstant from '../utils/AppConstant';
import { useThemeStore } from '../store/themeStore';
import { TranslationKeys } from '../lang/TranslationKeys';
import CustomInput from '../components/inputs/CustomInput';
import CustomHeader from '../components/headers/CustomHeader';
import CustomTitleWithBackHeader from '../components/CustomTitleWithBackHeader';
import {
  verticalScale,
  scale,
  moderateScale,
  keyboardHide,
} from '../utils/Scale';
import { UpdatePassword } from '../api/user';
import CustomActivityIndicator from '../components/CustomActivityIndicator';
import CommonPrimaryButton from '../components/buttons/CommonPrimaryButton';

const ChangePasswordScreen = () => {
  const { t } = useTranslation();
  const navigation = useNavigation<any>();
  const [isLoading, setIsLoading] = useState(false);
  const changePasswordStyles = ChangePasswordScreenStyles();
  const theme = useThemeStore().theme;

  const formik = useFormik({
    initialValues: {
      oldPassword: '',
      newPassword: '',
      confirmPassword: '',
    },
    validationSchema: Yup.object({
      oldPassword: Yup.string().required('Old password is required'),
      newPassword: Yup.string()
        .min(8, 'Password must be at least 8 characters')
        .matches(/[A-Z]/, 'Must contain at least one uppercase letter')
        .matches(/[a-z]/, 'Must contain at least one lowercase letter')
        .matches(/[0-9]/, 'Must contain at least one number')
        .matches(
          /[@$!%*?&#^()_+\-=[\]{};':"\\|,.<>/?]/,
          'Must contain at least one special character',
        )
        .required('New password is required'),
      confirmPassword: Yup.string()
        .oneOf([Yup.ref('newPassword')], 'Passwords must match')
        .required('Confirm password is required'),
    }),
    onSubmit: async values => {
      try {
        setIsLoading(true);
        const passwordFormData = new FormData();
        passwordFormData.append('old_password', values.oldPassword);
        passwordFormData.append('new_password', values.newPassword);
        passwordFormData.append('confirm_new_password', values.confirmPassword);

        await UpdatePassword(passwordFormData)
          .then(res => {
            setIsLoading(false);
            console.log('Password updated successfully:', res);
            // navigation.navigate(AppConstant.mainNav, {
            //   screen: AppConstant.account,
            // });
            Alert.alert('Password Changed!', res.data.message);
            navigation.goBack();
          })
          .catch(error => {
            setIsLoading(false);
            console.error('Error updating password:', error);
            Alert.alert(error);
          });
      } catch (error) {
        console.error('Error Updating password:', error);
      }
    },
  });

  return (
    <>
      {isLoading ? (
        <CustomActivityIndicator color={theme.primaryFriend} />
      ) : null}

      <TouchableWithoutFeedback onPress={keyboardHide} accessible={false}>
        <View
          style={[
            changePasswordStyles.screenContainer,
            { backgroundColor: theme.primaryBackground },
          ]}
        >
          <CustomHeader
            headerLeftComponent={
              <CustomTitleWithBackHeader
                title={t(TranslationKeys.CHANGE_PASSWORD_TITLE)}
                onPress={() => {
                  navigation.goBack();
                }}
              />
            }
          />
          <View style={changePasswordStyles.formContainer}>
            {/* Old password */}
            <CustomInput
              label={t(TranslationKeys.CURRENT_PASSWORD)}
              value={formik.values.oldPassword}
              onChangeText={formik.handleChange('oldPassword')}
              onBlur={formik.handleBlur('oldPassword')}
              error={
                formik.touched.oldPassword ? formik.errors.oldPassword : ''
              }
              isPassword
              placeholder={t(TranslationKeys.PASSWORD_PLACEHOLDER)}
            />

            <TouchableOpacity
              onPress={() =>
                navigation.navigate(AppConstant.forgot, {
                  isLoginAllow: false,
                })
              }
            >
              <Text style={changePasswordStyles.forgotPasswordLink}>
                {t(TranslationKeys.FORGOT_PASSWORD)}
              </Text>
            </TouchableOpacity>

            {/* New password */}
            <CustomInput
              label={t(TranslationKeys.NEW_PASSWORD)}
              value={formik.values.newPassword}
              onChangeText={formik.handleChange('newPassword')}
              onBlur={formik.handleBlur('newPassword')}
              error={
                formik.touched.newPassword ? formik.errors.newPassword : ''
              }
              isPassword
              placeholder={t(TranslationKeys.PASSWORD_PLACEHOLDER)}
            />

            {/* Confirm new password */}
            <CustomInput
              label={t(TranslationKeys.CONFIRM_NEW_PASSWORD)}
              value={formik.values.confirmPassword}
              onChangeText={formik.handleChange('confirmPassword')}
              onBlur={formik.handleBlur('confirmPassword')}
              error={
                formik.touched.confirmPassword
                  ? formik.errors.confirmPassword
                  : ''
              }
              isPassword
              placeholder={t(TranslationKeys.PASSWORD_PLACEHOLDER)}
            />

            {/* Save Button */}
            {/* <TouchableOpacity
              style={changePasswordStyles.submitButton}
              onPress={() => {
                formik.setTouched({
                  oldPassword: true,
                  newPassword: true,
                  confirmPassword: true,
                });
                formik.handleSubmit();
              }}
            >
              <Text style={changePasswordStyles.submitButtonText}>
                {t(TranslationKeys.SAVE)}
              </Text>
            </TouchableOpacity> */}

            <CommonPrimaryButton
              title={t(TranslationKeys.SAVE)}
              onPress={() => {
                formik.setTouched({
                  oldPassword: true,
                  newPassword: true,
                  confirmPassword: true,
                });
                formik.handleSubmit();
              }}
              txtStyle={changePasswordStyles.saveText}
              btnStyle={changePasswordStyles.submitButton}
            />
          </View>
        </View>
      </TouchableWithoutFeedback>
    </>
  );
};

export default ChangePasswordScreen;

const ChangePasswordScreenStyles = () => {
  const theme = useThemeStore().theme;
  return StyleSheet.create({
    screenContainer: {
      flex: 1,
    },
    formContainer: {
      paddingHorizontal: scale(24),
      paddingVertical: verticalScale(32),
    },
    forgotPasswordLink: {
      textAlign: 'right',
      fontSize: moderateScale(14),
      fontFamily: Fonts.ISemiBold,
      marginBottom: verticalScale(8),
      color: theme.primaryFriend,
    },
    submitButton: {
      alignItems: 'center',
      borderRadius: scale(8),
      marginTop: verticalScale(56),
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
