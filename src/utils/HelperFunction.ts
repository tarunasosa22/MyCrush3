import analytics from '@react-native-firebase/analytics';

export const logFirebaseEvent = async (
  eventName: string,
  params?: any,
): Promise<void> => {
  try {
    await analytics().logEvent(eventName, params);
  } catch (error) {
    console.error(`Error logging Firebase event '${eventName}':`, error);
  }
};
