import React, { useEffect, useState } from 'react';
import {
  AppState,
  NativeModules,
  PermissionsAndroid,
  Platform,
} from 'react-native';
import messaging from '@react-native-firebase/messaging';

import notifee, {
  AndroidImportance,
  AndroidStyle,
  EventType,
} from '@notifee/react-native';
import { userState } from '../store/useUserStore';

export const convertToJsonString = (singleQuoteString: any) => {
  // Replace single quotes with double quotes
  let jsonString = singleQuoteString.replace(/'/g, '"');

  // Convert None to null
  jsonString = jsonString.replace(/None/g, 'null');

  // Convert None to null
  jsonString = jsonString.replace(/False/g, 'false');
  jsonString = jsonString.replace(/True/g, 'true');

  // Return the corrected JSON string
  return jsonString;
};

const NotificationController = () => {
  // **  MANAGE ALL NOTIFICATION NAVIGATION BASED ON BELOW COMMENTS
  const handleNotificationTap = (remoteMessage: any) => {
    console.log(
      '🚀 ~ file: NotificationController.ts:18 ~ handleNotificationTap ~ remoteMessage:',
      remoteMessage,
    );
    notifee.setBadgeCount(0).then(() => console.log('Badge count removed!'));
    // analytics().logEvent(EVENT_NAME.USER_TAP_ON_NOTIFICATION, {
    //   user_id: userStore?.getState()?.user_id,
    //   type: remoteMessage?.data?.type,
    // });
    // if (remoteMessage?.data?.type == 1) {
    //   console.log('NAVIGATION-->');
    //   homeStore?.getState().setIsOpenStoryScreen(true);
    //   navigationRef.current?.reset({
    //     index: 0,
    //     routes: [
    //       {
    //         name: 'DrawerStack',
    //         state: {
    //           type: 'drawer',
    //           index: 1, // index of MyStoryTab
    //           routes: [{ name: 'HomeTab' }, { name: 'MyStoryTab' }],
    //         },
    //       },
    //     ],
    //   });
    // } else if (remoteMessage?.data?.type == 2) {
    //   // setTimeout(() => {
    //   //   userState.getState()?.setIsOpenHomePlan(true);
    //   // }, 500);
    // }
  };

  useEffect(() => {
    requestNotificationPermission();

    notifee.getInitialNotification().then(initialNotification => {
      if (initialNotification) {
        handleNotificationTap(initialNotification);
      }
    });
    // Set up foreground notification handler
    const unsubscribe = notifee.onForegroundEvent(({ type, detail }) => {
      switch (type) {
        case EventType.DISMISSED:
          console.log('User dismissed notification', detail.notification);
          break;
        case EventType.PRESS:
          console.log('User pressed notification', detail.notification);
          // notificationAction(
          //     detail?.notification?.data as {
          //         notification_type?: string | undefined;
          //         id?: string | undefined;
          //     },
          // );
          handleNotificationTap(detail.notification);
          break;
        case EventType.DELIVERED:
          console.log('Notification delivered', detail.notification);
          break;
      }
    });

    // Set up Firebase messaging foreground handler
    const unsubscribeMessage = messaging().onMessage(async remoteMessage => {
      console.log(
        'REMOTE_MESSAGE',
        remoteMessage,
        remoteMessage?.notification?.title,
      );
      if (Platform.OS === 'android') {
        // Display the notification using notifee when app is in foreground
        await notifee.displayNotification({
          title: remoteMessage.notification?.title,
          body: remoteMessage.notification?.body,
          android: {
            channelId: 'general_notification_channel',
            pressAction: {
              id: 'general_notification_channel',
            },
            ...((remoteMessage?.data?.image_url ||
              remoteMessage?.notification?.android?.imageUrl) && {
              style: {
                type: AndroidStyle.BIGPICTURE,
                picture:
                  remoteMessage?.data?.image_url ??
                  remoteMessage?.notification?.android?.imageUrl,
              },
            }),
          },
          data: remoteMessage.data,
        });
      } else if (Platform.OS === 'ios') {
        await notifee.displayNotification({
          title: remoteMessage.notification?.title,
          body: remoteMessage.notification?.body,
          ios: {
            sound: 'default',
          },
          data: remoteMessage.data,
        });
      }
    });

    messaging()
      .getInitialNotification()
      .then(remoteMessage => {
        if (remoteMessage) {
          console.log(
            'Notification caused app to open from quit state:',
            remoteMessage.notification,
          );
          handleNotificationTap(remoteMessage);
        }
      });
    const appOpenSubscribe = messaging().onNotificationOpenedApp(
      remoteMessage => {
        handleNotificationTap(remoteMessage);
        console.log(
          'Notification caused app to open from background state:',
          remoteMessage.notification,
        );
      },
    );

    return () => {
      unsubscribe();
      unsubscribeMessage();
      appOpenSubscribe();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function requestNotificationPermission() {
    try {
      // Request Android notification permissions
      if (Platform.OS === 'android') {
        const permissionStatus = await PermissionsAndroid.request(
          'android.permission.POST_NOTIFICATIONS',
        );

        await notifee.createChannels([
          {
            id: 'sound_notification_channel',
            name: 'sound_notification_channel',
            lights: true,
            vibration: true,
            sound: 'sound',
            importance: AndroidImportance.HIGH,
          },
          {
            id: 'general_notification_channel',
            name: 'general_notification_channel',
            lights: true,
            vibration: true,
            sound: 'default',
            importance: AndroidImportance.HIGH,
          },
        ]);
        if (permissionStatus !== PermissionsAndroid.RESULTS.GRANTED) {
          console.warn('Notification permission denied');
          return false;
        }
      }

      // Register device for remote messages if not already registered
      if (!messaging().isDeviceRegisteredForRemoteMessages) {
        await messaging().registerDeviceForRemoteMessages();
      }

      // Request messaging permission
      await notifee.requestPermission({
        sound: true,
        alert: true,
      });
      const authStatus = await messaging().requestPermission();
      const enabled =
        authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
        authStatus === messaging.AuthorizationStatus.PROVISIONAL;

      if (enabled) {
        console.log('Push notifications authorized:', authStatus);
        // Get FCM token
        const token = await messaging().getToken();
        if (token && userState.getState().fcmToken == null) {
          console.log('FCM Token:', token);
          userState.getState().setUserFcmToken(token);
          return true;
        } else {
          console.log('FCM Token:stored', userState.getState().fcmToken);
        }
      } else {
        console.warn('User declined push notifications');
        return false;
      }
    } catch (error) {
      console.error('Error requesting notification permissions:', error);
      return false;
    }
  }
  return null;
};
export default NotificationController;
