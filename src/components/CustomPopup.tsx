import React from 'react';
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Image,
  Animated,
} from 'react-native';
import { scale, verticalScale } from '../utils/Scale';
import { useThemeStore } from '../store/themeStore';
import Fonts from '../utils/fonts';
import IMAGES from '../assets/images';
import CommonOutlinedButton from './buttons/CommonOutlinedButton';
import CommonPrimaryButton from './buttons/CommonPrimaryButton';

interface CustomPopupProps {
  visible: boolean;
  onClose: () => void;
  title?: string;
  message: string;
  primaryButtonText?: string;
  secondaryButtonText?: string;
  onPrimaryPress?: () => void;
  onSecondaryPress?: () => void;
  icon?: any;
  type?: 'info' | 'success' | 'warning' | 'error';
}

const CustomPopup: React.FC<CustomPopupProps> = ({
  visible,
  onClose,
  title,
  message,
  primaryButtonText = 'OK',
  secondaryButtonText,
  onPrimaryPress,
  onSecondaryPress,
  icon,
  type = 'info',
}) => {
  const { theme } = useThemeStore();

  const getIconAndColor = () => {
    switch (type) {
      case 'success':
        return { icon: '✅', color: '#4CAF50' };
      case 'warning':
        return { icon: IMAGES.warning_icon || '⚠️', color: '#FF9800' };
      case 'error':
        return { icon: '❌', color: '#F44336' };
      default:
        return { icon: 'ℹ️', color: theme.primaryFriend };
    }
  };

  const { icon: defaultIcon, color: typeColor } = getIconAndColor();
  const displayIcon = icon || defaultIcon;

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="fade"
      onRequestClose={onClose}
      statusBarTranslucent
    >
      <View style={styles.overlay}>
        <View style={styles.modalContainer}>
          {/* Icon */}
          <View
            style={[
              styles.iconContainer,
              { backgroundColor: `${typeColor}15` },
            ]}
          >
            {typeof displayIcon === 'string' ? (
              <Text style={[styles.iconText, { color: typeColor }]}>
                {displayIcon}
              </Text>
            ) : (
              <Image
                source={displayIcon}
                style={[styles.iconImage, { tintColor: typeColor }]}
              />
            )}
          </View>

          {/* Title */}
          {title && (
            <Text style={[styles.title, { color: theme.heading }]}>
              {title}
            </Text>
          )}

          {/* Message */}
          <Text style={[styles.message, { color: theme.text }]}>{message}</Text>

          {/* Buttons */}
          <View style={styles.buttonContainer}>
            {secondaryButtonText && (
              <CommonOutlinedButton
                title={secondaryButtonText}
                onPress={onSecondaryPress || onClose}
                btnStyle={{ paddingHorizontal: scale(0), width: '45%' }}
              />
            )}

            <CommonPrimaryButton
              title={primaryButtonText}
              onPress={onPrimaryPress || onClose}
              btnStyle={{ paddingHorizontal: scale(0), width: '45%' }}
            />
          </View>
        </View>
      </View>
    </Modal>
  );
};

export default CustomPopup;

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: scale(20),
  },
  modalContainer: {
    backgroundColor: 'white',
    borderRadius: scale(16),
    padding: scale(24),
    width: '100%',
    maxWidth: scale(340),
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 10,
    },
    shadowOpacity: 0.25,
    shadowRadius: 20,
    elevation: 15,
  },
  iconContainer: {
    width: scale(64),
    height: scale(64),
    borderRadius: scale(32),
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: verticalScale(16),
  },
  iconText: {
    fontSize: scale(28),
  },
  iconImage: {
    width: scale(32),
    height: scale(32),
  },
  title: {
    fontSize: scale(20),
    fontWeight: '700',
    fontFamily: Fonts.IBold,
    textAlign: 'center',
    marginBottom: verticalScale(8),
  },
  message: {
    fontSize: scale(16),
    fontWeight: '400',
    fontFamily: Fonts.IRegular,
    textAlign: 'center',
    lineHeight: verticalScale(22),
    marginBottom: verticalScale(24),
  },
  buttonContainer: {
    // flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    // paddingHorizontal: scale(20),
  },
  primaryButton: {
    flex: 1,
    paddingVertical: verticalScale(14),
    borderRadius: scale(12),
    justifyContent: 'center',
    alignItems: 'center',
  },
  primaryButtonText: {
    color: 'white',
    fontSize: scale(16),
    fontWeight: '600',
    fontFamily: Fonts.ISemiBold,
  },
  secondaryButton: {
    flex: 1,
    paddingVertical: verticalScale(14),
    borderRadius: scale(12),
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: scale(10),
  },
  secondaryButtonText: {
    fontSize: scale(16),
    fontWeight: '600',
    fontFamily: Fonts.ISemiBold,
  },
});
