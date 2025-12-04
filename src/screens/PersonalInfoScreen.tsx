import React, { useEffect, useState } from 'react';
import {
  Text,
  View,
  Image,
  Alert,
  Platform,
  StatusBar,
  StyleSheet,
  TouchableOpacity,
  KeyboardAvoidingView,
  TouchableWithoutFeedback,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { launchImageLibrary, launchCamera } from 'react-native-image-picker';
import { useTranslation } from 'react-i18next';

import {
  scale,
  keyboardHide,
  verticalScale,
  moderateScale,
} from '../utils/Scale';
import IMAGES from '../assets/images';
import { userState } from '../store/userStore';
import { UpdateUserProfile } from '../api/user';
import { useThemeStore } from '../store/themeStore';
import { TranslationKeys } from '../lang/TranslationKeys';
import Fonts from '../utils/fonts';
import AppConstant from '../utils/AppConstant';
import { customColors } from '../utils/Colors';

import CustomHeader from '../components/headers/CustomHeader';
import CustomTitleWithBack from '../components/CustomTitleWithBackHeader';
import CustomInput from '../components/inputs/CustomInput';
import CustomActivityIndicator from '../components/CustomActivityIndicator';
import CommonImagePlaceHolder from '../components/CommonImagePlaceHolder';
import PrimaryButton from '../components/buttons/CommonPrimaryButton';

import { useFormik } from 'formik';
import * as Yup from 'yup';

const PersonalInfoScreen = () => {
  const { t } = useTranslation();
  const navigation = useNavigation<any>();
  const { userData, setUserData } = userState.getState();
  const theme = useThemeStore(state => state.theme);

  const [userProfileImage, setUserProfileImage] = useState<any>(
    userData.user?.profile_image || undefined,
  );
  const [isUpdating, setIsUpdating] = useState(true);
  const [isModified, setIsModified] = useState(false);

  const styles = useUserProfileStyles();

  useEffect(() => {
    if (userData?.user) {
      setIsUpdating(false);
    }
  }, [userData]);

  /** ✅ Formik + Yup Validation Schema */
  const formik = useFormik({
    initialValues: {
      name: userData.user?.full_name || '',
      emailAddress: userData.user?.email || '',
    },
    validationSchema: Yup.object({
      name: Yup.string()
        .required('Name is required')
        .matches(/^[A-Za-z\s]+$/, 'Name can only contain letters and spaces')
        .min(2, 'Name must be at least 2 characters'),
      emailAddress: Yup.string()
        .required('Email is required')
        .matches(
          /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
          'Please enter a valid email address',
        ),
    }),
    onSubmit: async values => {
      try {
        const hasNameUpdated = values.name !== userData.user?.full_name;
        const hasImageUpdated =
          userProfileImage &&
          userProfileImage !== userData.user?.profile_image &&
          typeof userProfileImage === 'string' &&
          userProfileImage?.startsWith('file');

        if (!hasNameUpdated && !hasImageUpdated) {
          navigation.goBack();
          return;
        }

        setIsModified(true);
        setIsUpdating(true);

        const formData = new FormData();

        if (hasNameUpdated) {
          formData.append('full_name', values.name);
        }
        if (hasImageUpdated) {
          formData.append('profile_image', {
            uri: userProfileImage,
            type: 'image/jpeg',
            name: 'profile.jpg',
          } as any);
        }

        await UpdateUserProfile(formData)
          .then(res => {
            setIsUpdating(false);
            console.log('✅ Profile updated successfully:', res);
            setUserData({ ...userData, user: res?.data?.data });
            navigation.goBack();
          })
          .catch(error => {
            console.error('Error updating profile:', error);
          });
      } catch (error) {
        console.error('Error during profile update:', error);
        Alert.alert(
          'Error',
          'Failed to update your profile. Please try again later.',
        );
      }
    },
  });

  /** ✅ Detect if changes were made */
  useEffect(() => {
    const nameUpdated = formik.values.name !== userData.user?.full_name;
    const imageUpdated =
      userProfileImage &&
      userProfileImage !== userData.user?.profile_image &&
      ((userProfileImage && userProfileImage?.startsWith('file://')) ||
        userProfileImage?.startsWith('content://'));

    setIsModified(nameUpdated || imageUpdated);
  }, [formik.values.name, userProfileImage, userData.user]);

  /** ✅ Change Password Navigation */
  const handlePasswordChange = () => {
    navigation.navigate(AppConstant.ChangePassword);
  };

  /** ✅ Pick Image from Gallery */
  const handleGalleryImage = () => {
    launchImageLibrary(
      { mediaType: 'photo', quality: 0.8, selectionLimit: 1 },
      response => {
        if (response.didCancel) return;
        if (response.errorCode) {
          console.log('Image Picker Error: ', response.errorMessage);
          return;
        }
        if (response.assets && response.assets.length > 0) {
          setUserProfileImage(response.assets[0].uri || null);
        }
      },
    );
  };

  /** ✅ Take Photo using Camera */
  const handleCameraImage = () => {
    launchCamera({ mediaType: 'photo', quality: 0.8 }, response => {
      if (response.didCancel) return;
      if (response.errorCode) {
        console.log('Camera Error: ', response.errorMessage);
        return;
      }
      if (response.assets && response.assets.length > 0) {
        setUserProfileImage(response.assets[0].uri || null);
      }
    });
  };

  return (
    <>
      {isUpdating ? (
        <CustomActivityIndicator color={theme.primaryFriend} />
      ) : null}
      <TouchableWithoutFeedback
        onPress={keyboardHide}
        accessible={false}
        style={[styles.container, { backgroundColor: theme.primaryBackground }]}
      >
        <KeyboardAvoidingView
          style={{ flex: 1 }}
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          keyboardVerticalOffset={
            Platform.OS === 'ios' ? 0 : StatusBar.currentHeight
          }
        >
          <CustomHeader
            headerLeftComponent={
              <CustomTitleWithBack
                title={t(TranslationKeys.PERSONAL_INFO_TITLE)}
                onPress={() => navigation.goBack()}
              />
            }
          />
          <View style={styles.contentWrapper}>
            {/* Profile Image Section */}
            <View style={styles.imageSection}>
              <CommonImagePlaceHolder
                imageStyle={styles.profileImage}
                image={
                  userProfileImage || userData?.user?.profile_image || undefined
                }
              />
              <View style={styles.imageEditWrapper}>
                <TouchableOpacity
                  style={[
                    styles.editIconWrapper,
                    { backgroundColor: theme.primaryFriend },
                  ]}
                  onPress={handleGalleryImage}
                  onLongPress={handleCameraImage}
                >
                  <Image source={IMAGES.edit} style={styles.editIcon} />
                </TouchableOpacity>
              </View>
            </View>

            {/* Form Inputs */}
            <View style={styles.formSection}>
              <CustomInput
                label={t(TranslationKeys.FULL_NAME)}
                value={formik.values.name}
                onChangeText={formik.handleChange('name')}
                onBlur={formik.handleBlur('name')}
                error={formik.touched.name ? formik.errors.name : ''}
                placeholder={t(TranslationKeys.FULL_NAME_PLACEHOLDER)}
              />

              <CustomInput
                label={t(TranslationKeys.EMAIL)}
                value={formik.values.emailAddress}
                onChangeText={formik.handleChange('emailAddress')}
                onBlur={formik.handleBlur('emailAddress')}
                error={
                  formik.touched.emailAddress ? formik.errors.emailAddress : ''
                }
                placeholder={t(TranslationKeys.EMAIL_PLACEHOLDER)}
                keyboardType="email-address"
                editable={false}
              />

              <CustomInput
                label={t(TranslationKeys.PASSWORD)}
                value={'User@123'}
                onChangeText={formik.handleChange('email')}
                onBlur={formik.handleBlur('email')}
                error={
                  formik.touched.emailAddress ? formik.errors.emailAddress : ''
                }
                placeholder={t(TranslationKeys.PASSWORD_PLACEHOLDER)}
                editable={false}
                secureTextEntry
              />
              <TouchableOpacity onPress={handlePasswordChange}>
                <Text
                  style={[
                    styles.changePassword,
                    { color: theme.primaryFriend },
                  ]}
                >
                  {t(TranslationKeys.CHANGE_PASSWORD)}
                </Text>
              </TouchableOpacity>
            </View>

            {/* Save Button */}
            <PrimaryButton
              title={t(TranslationKeys.SAVE)}
              onPress={() => {
                formik.setTouched({ name: true, emailAddress: true });
                formik.handleSubmit();
              }}
              btnStyle={
                !isModified ? styles.disabledSaveButton : styles.saveButton
              }
              txtStyle={styles.saveText}
              disabled={!formik.isValid || !isModified}
            />
          </View>
        </KeyboardAvoidingView>
      </TouchableWithoutFeedback>
    </>
  );
};

export default PersonalInfoScreen;

const useUserProfileStyles = () => {
  const theme = useThemeStore().theme;
  return StyleSheet.create({
    container: { flex: 1 },
    contentWrapper: { flex: 1, paddingHorizontal: scale(20) },
    imageSection: { alignItems: 'center', marginVertical: verticalScale(20) },
    profileImage: {
      width: scale(100),
      height: scale(100),
      borderRadius: scale(50),
      borderWidth: scale(2),
      borderColor: theme.primaryFriend,
    },
    imageEditWrapper: {
      borderRadius: scale(40),
      backgroundColor: customColors.white,
      marginTop: verticalScale(-22),
      marginLeft: verticalScale(70),
    },
    editIconWrapper: {
      padding: moderateScale(6),
      borderRadius: moderateScale(20),
      borderWidth: moderateScale(3),
      borderColor: customColors.white,
    },
    editIcon: {
      width: scale(15),
      height: scale(15),
      tintColor: customColors.white,
    },
    formSection: { marginTop: verticalScale(10) },
    changePassword: {
      fontSize: moderateScale(14),
      fontFamily: Fonts.ISemiBold,
      textAlign: 'right',
    },
    saveButton: {
      marginTop: verticalScale(30),
      paddingVertical: verticalScale(12),
      borderRadius: scale(8),
      alignItems: 'center',
    },
    disabledSaveButton: {
      marginTop: verticalScale(30),
      paddingVertical: verticalScale(12),
      borderRadius: scale(8),
      alignItems: 'center',
      backgroundColor: theme.card,
    },
    saveText: {
      color: theme.white,
      fontSize: moderateScale(16),
      fontFamily: Fonts.ISemiBold,
    },
  });
};
