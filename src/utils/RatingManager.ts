// RatingManager.ts
import { Linking, Alert, Platform } from 'react-native';
import { zustandStorage } from '../store/store';
import { ANDROID_PACKAGE_NAME, IOS_APP_ID } from '../constants';

export const PLAY_STORE_LINK = `market://details?id=${ANDROID_PACKAGE_NAME}`;
export const APP_STORE_LINK = `itms-apps://apps.apple.com/app/id${IOS_APP_ID}?action=write-review`;
export const RatingManager = {
  // Initialize on app first launch

  // Track user actions

  // Open app store for rating
  async openAppStore() {
    const STORE_LINK = Platform.select({
      ios: APP_STORE_LINK,
      android: PLAY_STORE_LINK,
    });

    try {
      if (Platform.OS === 'android') {
        // Try to open in Google Play Store app first
        const supported = await Linking.canOpenURL(STORE_LINK || '');

        if (supported) {
          await Linking.openURL(STORE_LINK || '');
        } else {
          // Fallback to web version
          await Linking.openURL(
            `https://play.google.com/store/apps/details?id=${ANDROID_PACKAGE_NAME}`,
          );
        }
      } else {
        // iOS App Store (you'll need your iOS app ID)

        await Linking.openURL(STORE_LINK || '');
      }
    } catch (error) {
      console.error('Error opening app store:', error);
      Alert.alert('Error', 'Could not open app store');
    }
  },

  // Get current stats (for debugging)
};
