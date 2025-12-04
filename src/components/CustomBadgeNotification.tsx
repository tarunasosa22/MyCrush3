import {
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  ViewStyle,
} from 'react-native';
import React from 'react';
import { useThemeStore } from '../store/themeStore';
import { scale } from '../utils/Scale';
import IMAGES from '../assets/images';

const CustomBadgeNotification = (props: {
  containerStyle?: ViewStyle;
  onPress?: () => void;
}) => {
  const { containerStyle, onPress } = props;
  const styles = useStyles();
  return (
    <TouchableOpacity
      style={[styles.badgeNotificationContainer, containerStyle]}
      onPress={onPress}
    >
      <View style={styles.badgeNotificationBadgeContainer}>
        <View style={styles.badgeNotificationBadge} />
      </View>
      <Image
        source={IMAGES.notification_icon}
        style={styles.badgeNotificationImage}
      />
    </TouchableOpacity>
  );
};

export default CustomBadgeNotification;

const useStyles = () => {
  const theme = useThemeStore().theme;
  return StyleSheet.create({
    badgeNotificationContainer: {
      borderWidth: 2,
      borderColor: '#4B164C20',
      borderRadius: scale(100),
      padding: scale(10),
    },
    badgeNotificationImage: {
      width: scale(24),
      height: scale(24),
      resizeMode: 'contain',
    },
    badgeNotificationBadgeContainer: {
      borderRadius: scale(100),
      backgroundColor: theme.primaryBackground,
      alignSelf: 'flex-end',
      padding: scale(2),
      justifyContent: 'center',
      alignItems: 'center',
      marginBottom: scale(-12),
      zIndex: 99,
    },
    badgeNotificationBadge: {
      borderRadius: scale(100),
      width: scale(6),
      height: scale(6),
      resizeMode: 'contain',
      backgroundColor: theme.primaryFriend,
    },
  });
};
