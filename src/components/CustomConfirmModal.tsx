import React from 'react';
import {
  Text,
  View,
  Image,
  Modal,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import Fonts from '../utils/fonts';
import { useThemeStore } from '../store/themeStore';
import { moderateScale, scale, verticalScale } from '../utils/Scale';

interface CustomConfirmModalProps {
  visible: boolean;
  title: string;
  message: string;
  onCancel?: () => void;
  onConfirm: () => void;
  btnText: string;
  icon?: any;
  cancelBtnText?: string;
  onPressOutSide?: () => void;
}

const CustomConfirmModal: React.FC<CustomConfirmModalProps> = ({
  visible,
  title,
  message,
  onCancel,
  onConfirm,
  btnText,
  icon,
  cancelBtnText,
  onPressOutSide,
}) => {
  const styles = useStyles();
  const theme = useThemeStore().theme;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={() => onCancel?.()}
    >
      {/* <View style={styles.confirmModalOverlay}> */}
      <TouchableOpacity
        style={styles.confirmModalOverlay}
        activeOpacity={1}
        onPress={onPressOutSide ?? onCancel} // ✅ close modal when tapping outside
      >
        <View style={styles.confirmModalContainer}>
          {/* Icon with background circle */}
          <View style={styles.confirmModalIconContainer}>
            <View
              style={[
                styles.confirmModalIconBackground,
                { backgroundColor: theme.primaryFriend + '20' },
              ]}
            >
              <Image
                source={icon}
                style={styles.confirmModalIcon}
                resizeMode={'contain'}
                tintColor={theme.primaryFriend}
              />
            </View>
          </View>

          {/* Title */}
          <Text style={[styles.confirmModalTitle, { color: '#1a1a1a' }]}>
            {title}
          </Text>

          {/* Message */}
          <Text style={[styles.confirmModalMessage, { color: '#666666' }]}>
            {message}
          </Text>

          {/* Buttons */}
          <View style={styles.confirmModalButtonContainer}>
            {/* Keep Subscription Button (Primary) */}

            <TouchableOpacity
              style={styles.confirmModalCancelButton}
              onPress={onCancel}
              activeOpacity={0.7}
            >
              <Text style={styles.confirmModalSecondaryButtonText}>
                {cancelBtnText || 'Cancel'}
              </Text>
            </TouchableOpacity>

            {/* Cancel Subscription Button (Secondary) */}
            <TouchableOpacity
              style={styles.confirmModalSecondaryButton}
              onPress={onConfirm}
              activeOpacity={0.7}
            >
              <Text style={styles.confirmModalPrimaryButtonText}>
                {btnText}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </TouchableOpacity>
      {/* </View> */}
    </Modal>
  );
};

export default CustomConfirmModal;

const useStyles = () => {
  const theme = useThemeStore().theme;

  return StyleSheet.create({
    confirmModalOverlay: {
      flex: 1,
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      justifyContent: 'center',
      alignItems: 'center',
      paddingHorizontal: scale(20),
    },
    confirmModalContainer: {
      backgroundColor: theme.white || '#ffffff',
      borderRadius: moderateScale(20),
      padding: moderateScale(24),
      alignItems: 'center',
      width: '100%',
      maxWidth: scale(340),
      elevation: 10,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 5 },
      shadowOpacity: 0.3,
      shadowRadius: moderateScale(10),
    },
    confirmModalIconContainer: {
      marginBottom: verticalScale(20),
    },
    confirmModalIconBackground: {
      width: scale(60),
      height: scale(60),
      borderRadius: scale(30),
      alignItems: 'center',
      justifyContent: 'center',
    },
    confirmModalIcon: {
      width: scale(24),
      height: scale(24),
    },
    confirmModalTitle: {
      fontSize: moderateScale(22),
      fontFamily: Fonts.IBold,
      textAlign: 'center',
      marginBottom: verticalScale(12),
      lineHeight: moderateScale(28),
    },
    confirmModalMessage: {
      fontSize: moderateScale(16),
      fontFamily: Fonts.IRegular,
      textAlign: 'center',
      marginBottom: verticalScale(30),
      lineHeight: moderateScale(22),
      paddingHorizontal: scale(10),
    },
    confirmModalButtonContainer: {
      width: '100%',
      gap: verticalScale(12),
    },
    confirmModalPrimaryButtonWrapper: {
      width: '100%',
      borderRadius: moderateScale(12),
      elevation: 3,
      shadowColor: theme.primaryFriend,
      shadowOffset: { width: 0, height: 3 },
      shadowOpacity: 0.2,
      shadowRadius: 5,
    },
    confirmModalPrimaryButton: {
      paddingVertical: verticalScale(14),
      borderRadius: moderateScale(12),
      alignItems: 'center',
      justifyContent: 'center',
    },
    confirmModalPrimaryButtonText: {
      fontSize: moderateScale(16),
      fontFamily: Fonts.IBold,
      color: theme.white,
      letterSpacing: 0.3,
    },
    confirmModalSecondaryButton: {
      paddingVertical: verticalScale(14),
      borderRadius: moderateScale(12),
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: theme.primaryFriend,
      borderWidth: moderateScale(1),
      borderColor: theme.primaryFriend + '30',
    },
    confirmModalCancelButton: {
      paddingVertical: verticalScale(14),
      borderRadius: moderateScale(12),
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: 'transparent',
      borderWidth: moderateScale(1),
      borderColor: theme.primaryFriend + '30',
    },
    confirmModalSecondaryButtonText: {
      fontSize: moderateScale(16),
      fontFamily: Fonts.IMedium,
      letterSpacing: 0.2,
    },
  });
};
