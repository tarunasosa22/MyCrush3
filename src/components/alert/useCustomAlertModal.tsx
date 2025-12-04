import {
  Image,
  Modal,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import React from 'react';
import { scale, verticalScale } from '../../utils/Scale';
import Fonts from '../../utils/fonts';
import IMAGES from '../../assets/images';

const ALERT_DATA_TYPES = {
  success: {
    icon: IMAGES.Google,
    iconBg: '#E6F4EA',
    iconTint: '#34A853',
  },
  error: {
    icon: IMAGES.Google,
    iconBg: '#FDEDED',
    iconTint: '#D93025',
  },
  info: {
    icon: IMAGES.Google,
    iconBg: '#E8F0FE',
    iconTint: '#1A73E8',
  },
};

const useCustomAlertModal =
  () =>
  ({ visible, onClose, type = 'info', title, message, buttons = [] }) => {
    const { icon, iconBg, iconTint } =
      ALERT_DATA_TYPES[type] || ALERT_DATA_TYPES.info;

    return (
      <Modal
        transparent
        animationType="fade"
        visible={visible}
        onRequestClose={onClose}
      >
        <View style={styles.alertOverlay}>
          <View style={styles.alertAlertBox}>
            <View
              style={[styles.alertIconWrapper, { backgroundColor: iconBg }]}
            >
              <Image
                source={icon}
                style={[styles.alertIcon, { tintColor: iconTint }]}
              />
            </View>
            <Text style={styles.alertTitle}>{title}</Text>
            <Text style={styles.alertMessage}>{message}</Text>
            <View style={styles.alertButtonContainer}>
              {buttons.map((btn, index) => (
                <TouchableOpacity
                  key={index}
                  style={[
                    styles.alertButton,
                    btn.style === 'cancel'
                      ? styles.alertCancelButton
                      : styles.alertPrimaryButton,
                  ]}
                  onPress={() => {
                    onClose();
                    btn.onPress?.();
                  }}
                >
                  <Text
                    style={[
                      styles.alertButtonText,
                      btn.style === 'cancel'
                        ? styles.alertCancelText
                        : styles.alertPrimaryText,
                    ]}
                  >
                    {btn.text}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </View>
      </Modal>
    );
  };

export default useCustomAlertModal;

const styles = StyleSheet.create({
  alertOverlay: {
    flex: 1,
    backgroundColor: '#00000099',
    justifyContent: 'center',
    alignItems: 'center',
  },
  alertAlertBox: {
    width: '85%',
    backgroundColor: '#fff',
    borderRadius: scale(12),
    padding: scale(20),
    alignItems: 'center',
  },
  alertIconWrapper: {
    padding: scale(12),
    borderRadius: scale(40),
    marginBottom: verticalScale(10),
  },
  alertIcon: {
    width: scale(28),
    height: scale(28),
  },
  alertTitle: {
    fontSize: scale(18),
    fontWeight: '600',
    textAlign: 'center',
    fontFamily: Fonts.IBold,
    marginBottom: verticalScale(6),
  },
  alertMessage: {
    fontSize: scale(14),
    textAlign: 'center',
    fontFamily: Fonts.IRegular,
    color: '#555',
    marginBottom: verticalScale(20),
  },
  alertButtonContainer: {
    flexDirection: 'row',
    gap: scale(10),
  },
  alertButton: {
    flex: 1,
    paddingVertical: scale(10),
    borderRadius: scale(8),
    alignItems: 'center',
  },
  alertPrimaryButton: {
    backgroundColor: '#1A73E8',
  },
  alertCancelButton: {
    backgroundColor: '#E0E0E0',
  },
  alertButtonText: {
    fontSize: scale(14),
    fontFamily: Fonts.IMedium,
  },
  alertPrimaryText: {
    color: '#fff',
  },
  alertCancelText: {
    color: '#333',
  },
});
