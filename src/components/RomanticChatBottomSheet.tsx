import React, { useMemo } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Image,
} from 'react-native';
import BottomSheet, { BottomSheetBackdrop } from '@gorhom/bottom-sheet';
import Video from 'react-native-video';
import { AppVideos } from '../assets/videos';
import IMAGES from '../assets/images';
import { scale } from '../utils/Scale';
import { useThemeStore } from '../store/themeStore';
import Fonts from '../utils/fonts';

export const textSheet = 'Can you send me a photo of yours?';

const RomanticChatBottomSheet = ({
  videoStart,
  handleSend,
  handleClose,
}: any) => {
  const styles = Styles();

  // Snap points for the bottom sheet
  const snapPoints = useMemo(() => ['75%', '90%'], []);

  return (
    <View style={styles.bottomSheetContent}>
      {/* Title */}
      <Text style={styles.title}>
        Hey!, You Can Ask Your{'\n'}Crush for A Photo
      </Text>

      {/* WebP Image Container */}
      <View style={styles.imageContainer}>
        <Video
          source={AppVideos.chat_demo_video}
          style={styles.image}
          resizeMode="cover"
          repeat={true}
          // controls
          paused={false}
        />

        {/* Chat Bubbles Overlay */}
      </View>

      {/* Description */}
      <View style={styles.descriptionContainer}>
        <Text style={styles.descriptionTitle}>Ask For Romantic Chats ❤️</Text>
        <Text style={styles.descriptionText}>
          Just Hit the Send Button below and Your message will be sent to your
          crush
        </Text>
      </View>

      {/* Message Input */}
      <View style={styles.inputContainer}>
        <Text style={styles.input}>{textSheet}</Text>
        <TouchableOpacity style={styles.sendButton} onPress={handleSend}>
          <Image source={IMAGES.send_icon} style={styles.sendIcon} />
        </TouchableOpacity>
      </View>
    </View>
  );
};

const Styles = () => {
  const theme = useThemeStore().theme;
  return StyleSheet.create({
    bottomSheetBackground: {
      backgroundColor: '#fff',
      borderTopLeftRadius: 30,
      borderTopRightRadius: 30,
    },
    handleIndicator: {
      backgroundColor: '#D1D1D6',
      width: 80,
      height: 5,
    },
    bottomSheetContent: {
      flex: 1,
      paddingHorizontal: 20,
      paddingTop: 10,
    },
    title: {
      fontSize: scale(26),
      color: theme.primaryFriend,
      textAlign: 'center',
      marginBottom: 20,
      lineHeight: 32,
      fontFamily: Fonts.ISemiBold,
    },
    imageContainer: {
      width: '100%',
      height: 200,
      borderRadius: 20,
      backgroundColor: '#E9D5FF',
      marginBottom: 20,
      overflow: 'hidden',
      position: 'relative',
    },
    image: {
      width: '100%',
      height: '100%',
    },
    chatOverlay: {
      position: 'absolute',
      bottom: 15,
      left: 15,
      right: 15,
    },
    sentBubble: {
      backgroundColor: '#8B5CF6',
      paddingHorizontal: 16,
      paddingVertical: 10,
      borderRadius: 18,
      alignSelf: 'flex-end',
      maxWidth: '70%',
      marginBottom: 8,
    },
    sentText: {
      color: '#fff',
      fontSize: 14,
    },
    receivedBubbleContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      alignSelf: 'flex-start',
      maxWidth: '70%',
    },
    avatar: {
      width: 24,
      height: 24,
      borderRadius: 12,
      backgroundColor: '#FCA5A5',
      marginRight: 8,
    },
    receivedBubble: {
      backgroundColor: '#F3F4F6',
      paddingHorizontal: 16,
      paddingVertical: 10,
      borderRadius: 18,
    },
    receivedText: {
      fontSize: 14,
      color: '#111',
    },
    descriptionContainer: {
      marginBottom: 20,
      justifyContent: 'center',
      alignItems: 'center',
    },
    descriptionTitle: {
      fontSize: scale(20),
      fontWeight: '700',
      color: '#454545',
      marginBottom: 8,
      fontFamily: Fonts.IBold,
    },
    descriptionText: {
      fontSize: 14,
      color: '#6B7280',
      lineHeight: 20,
      textAlign: 'center',
      width: '80%',
    },
    inputContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: theme.white,
      borderRadius: scale(50),
      paddingHorizontal: scale(18),
      paddingVertical: scale(15),
      // marginBottom: 15,
      shadowColor: theme.subText,
      shadowOffset: {
        width: 0,
        height: 2,
      },
      shadowOpacity: 0.25,
      shadowRadius: 10.84,

      elevation: 1,
    },
    input: {
      flex: 1,
      fontSize: 15,
      color: '#111',
      paddingVertical: 10,
    },
    sendButton: {
      marginLeft: 10,
    },
    sendIcon: {
      width: scale(25),
      height: scale(25),
      borderRadius: 18,
      justifyContent: 'center',
      alignItems: 'center',
      tintColor: theme.primaryFriend,
    },
    sendIconText: {
      color: '#fff',
      fontSize: 18,
      fontWeight: '600',
    },
    closeButton: {
      backgroundColor: '#374151',
      paddingVertical: 12,
      borderRadius: 8,
      alignItems: 'center',
      marginBottom: 20,
    },
    closeButtonText: {
      color: '#fff',
      fontSize: 16,
      fontWeight: '600',
    },
  });
};

export default RomanticChatBottomSheet;
