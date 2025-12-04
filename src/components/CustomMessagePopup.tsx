import React from 'react';
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  Image,
  StatusBar,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { scale } from '../utils/Scale';
import Fonts from '../utils/fonts';
import { useThemeStore } from '../store/themeStore';
import IMAGES from '../assets/images';
import CommonPrimaryButton from './buttons/CommonPrimaryButton';
import CommonOutlinedButton from './buttons/CommonOutlinedButton';

const { width, height } = Dimensions.get('window');

const CustomMessagePopup = ({
  message,
  visible,
  onClose,
  onPurchase,
  data,
}: any) => {
  const theme = useThemeStore(state => state.theme);
  const styles = useStyles();

  // Determine the popup type based on status
  const hasSubscriptionExpired = data?.status === 'subscription_expired';
  const hasInsufficientTokens = data?.status === 'insufficient_tokens';
  const hasCallInsufficientTokens = data?.status === 'call_insufficient_tokens';

  console.log('infoMessage===>', message);

  // Get appropriate content based on status
  const getMessagePopupContent = () => {
    if (hasSubscriptionExpired) {
      return {
        title: 'Purchase Subscription Now! ⏰',
        subtitle:
          'You dont have any subscription. Please subscribe to continue chatting with me! 😊',
        currentStatus: 'You dont have any subscription.',
        actionText: 'Subscribe now to keep our conversation going! 💫',
        primaryButtonText: 'Subscribe Now 🔄',
        iconEmoji: '⏰',
        cardData: [
          {
            icon: '💬',
            title: 'Unlimited Chat',
            cost: 'Premium',
          },
          {
            icon: '🎨',
            title: 'Image Generation',
            cost: 'Premium',
          },
        ],
      };
    } else if (hasCallInsufficientTokens) {
      return {
        title: 'Insufficient Tokens!',
        subtitle: `I'd love to talk with you, but you need at least ${message?.required_tokens} tokens.`,
        currentStatus: `You currently have 0 tokens.`,
        actionText: 'Please purchase more to continue! 💫',
        primaryButtonText: 'Purchase Tokens 🛒',
        iconEmoji: '🪙',
        cardData: [
          {
            icon: '📞',
            title: 'Voice Call',
            cost: `${message?.required_tokens} Tokens`,
          },
        ],
      };
    } else {
      return {
        title: 'Insufficient Tokens!',
        subtitle: `I'd love to create an image for you, but you need at least ${message?.required_tokens} tokens.`,
        currentStatus: `You currently have 0 tokens.`,
        actionText: 'Please purchase more to continue! 💫',
        primaryButtonText: 'Purchase Tokens 🛒',
        iconEmoji: '🪙',
        cardData: [
          {
            icon: '🎨',
            title: 'Image Generation',
            cost: `${message?.required_tokens} Tokens`,
          },
          {
            icon: '💬',
            title: 'Chat Messages',
            cost: 'Free',
          },
        ],
      };
    }
  };

  const messagePopupContent = getMessagePopupContent();

  return (
    <Modal
      visible={visible}
      animationType="fade"
      transparent={true}
      onRequestClose={onClose}
      statusBarTranslucent={true}
      presentationStyle="overFullScreen"
    >
      <StatusBar
        backgroundColor="transparent"
        barStyle="light-content"
        translucent
      />
      <View style={styles.messagePopupOverlay}>
        <View style={styles.messagePopupContainer}>
          <LinearGradient
            colors={[theme.girlFriend, theme.boyFriend]}
            style={styles.messagePopupGradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            <View style={styles.messagePopupModal}>
              {/* Close Button */}
              <TouchableOpacity
                onPress={onClose}
                style={styles.messagePopupCloseButton}
              >
                <Text style={styles.messagePopupCloseIcon}>✕</Text>
              </TouchableOpacity>

              {/* Content */}
              <View style={styles.messagePopupContent}>
                {/* Token/Subscription Icon with Animation Effect */}
                <View style={styles.messagePopupIconContainer}>
                  <View
                    style={[
                      styles.messagePopupCoinBackground,
                      hasSubscriptionExpired &&
                        styles.messagePopupSubscriptionBackground,
                    ]}
                  >
                    <Image
                      source={IMAGES.token_star}
                      style={styles.messagePopupCoinInner}
                    />
                    {/* Sparkle Effects */}
                    <View
                      style={[
                        styles.messagePopupSparkle,
                        styles.messagePopupSparkle1,
                      ]}
                    >
                      <Text style={styles.messagePopupSparkleIcon}>✨</Text>
                    </View>
                    <View
                      style={[
                        styles.messagePopupSparkle,
                        styles.messagePopupSparkle2,
                      ]}
                    >
                      <Text style={styles.messagePopupSparkleIcon}>✨</Text>
                    </View>
                    <View
                      style={[
                        styles.messagePopupSparkle,
                        styles.messagePopupSparkle3,
                      ]}
                    >
                      <Text style={styles.messagePopupSparkleIcon}>✨</Text>
                    </View>
                  </View>
                </View>

                {/* Main Message */}
                <View style={styles.messagePopupMessageContainer}>
                  <Text style={styles.messagePopupTitle}>
                    {messagePopupContent.title}
                  </Text>
                  <Text style={styles.messagePopupSubtitle}>
                    {messagePopupContent.subtitle}
                    {(!hasSubscriptionExpired || !hasInsufficientTokens) && (
                      <Text style={styles.messagePopupHighlightText}>
                        {'\n'}
                        {'\n'}
                        Required {message?.required_tokens} tokens
                      </Text>
                    )}
                    {(!hasSubscriptionExpired || !hasInsufficientTokens) && '.'}
                  </Text>
                  <Text
                    style={[
                      styles.messagePopupCurrentTokens,
                      hasSubscriptionExpired &&
                        styles.messagePopupSubscriptionStatus,
                    ]}
                  >
                    {messagePopupContent.currentStatus}
                  </Text>
                  <Text style={styles.messagePopupActionText}>
                    {messagePopupContent.actionText}
                  </Text>
                </View>

                {/* Token/Feature Info Cards */}
                <View style={styles.messagePopupTokenInfoContainer}>
                  {messagePopupContent.cardData.map((card, index) => (
                    <View key={index} style={styles.messagePopupTokenCard}>
                      <Text style={styles.messagePopupTokenCardIcon}>
                        {card.icon}
                      </Text>
                      <Text style={styles.messagePopupTokenCardTitle}>
                        {card.title}
                      </Text>
                      <Text
                        style={[
                          styles.messagePopupTokenCardCost,
                          hasSubscriptionExpired &&
                            styles.messagePopupPremiumText,
                        ]}
                      >
                        {card.cost}
                      </Text>
                    </View>
                  ))}
                </View>

                {/* Buttons */}
                <View style={styles.messagePopupButtonContainer}>
                  <CommonPrimaryButton
                    title={messagePopupContent.primaryButtonText}
                    onPress={onPurchase}
                    btnStyle={styles.messagePopupPrimaryButton}
                  />
                  <CommonOutlinedButton
                    title="Maybe Later"
                    onPress={onClose}
                    btnStyle={styles.messagePopupSecondaryButton}
                    txtStyle={styles.messagePopupSecondaryButtonText}
                  />
                </View>

                {/* Benefits Text */}
                <Text style={styles.messagePopupBenefitsText}>
                  {hasSubscriptionExpired
                    ? 'Continue enjoying unlimited conversations and features'
                    : 'Get unlimited access to premium features'}
                </Text>
              </View>
            </View>
          </LinearGradient>
        </View>
      </View>
    </Modal>
  );
};

export default CustomMessagePopup;

const useStyles = () => {
  const theme = useThemeStore(state => state.theme);
  return StyleSheet.create({
    messagePopupOverlay: {
      flex: 1,
      backgroundColor: 'rgba(0, 0, 0, 0.7)',
      justifyContent: 'center',
      alignItems: 'center',
      padding: 20,
    },
    messagePopupContainer: {
      width: '100%',
      maxWidth: 400,
    },
    messagePopupGradient: {
      borderRadius: 24,
      padding: 3,
    },
    messagePopupModal: {
      backgroundColor: '#FFFFFF',
      borderRadius: 22,
      overflow: 'hidden',
      position: 'relative',
    },
    messagePopupCloseButton: {
      position: 'absolute',
      top: 16,
      right: 16,
      width: 32,
      height: 32,
      borderRadius: 16,
      backgroundColor: 'rgba(0, 0, 0, 0.1)',
      justifyContent: 'center',
      alignItems: 'center',
      zIndex: 10,
    },
    messagePopupCloseIcon: {
      fontSize: 18,
      color: '#666',
      fontFamily: Fonts.ISemiBold,
    },
    messagePopupContent: {
      padding: 24,
      alignItems: 'center',
    },
    messagePopupIconContainer: {
      marginTop: 20,
      marginBottom: 24,
      position: 'relative',
    },
    messagePopupCoinBackground: {
      width: scale(50),
      height: scale(50),
      borderRadius: 50,
      backgroundColor: '#FFD700',
      justifyContent: 'center',
      alignItems: 'center',
      shadowColor: '#FFD700',
      shadowOffset: {
        width: 0,
        height: 8,
      },
      shadowOpacity: 0.3,
      shadowRadius: 16,
      elevation: 12,
      position: 'relative',
    },
    messagePopupSubscriptionBackground: {
      backgroundColor: '#FF6B6B',
      shadowColor: '#FF6B6B',
    },
    messagePopupCoinInner: {
      width: scale(40),
      height: scale(40),
      borderRadius: 40,
      backgroundColor: '#FFC107',
      justifyContent: 'center',
      alignItems: 'center',
      borderWidth: 2,
      borderColor: '#FFD700',
    },
    messagePopupSubscriptionIcon: {
      fontSize: 40,
      color: '#FFFFFF',
    },
    messagePopupCoinIcon: {
      fontSize: 36,
    },
    messagePopupSparkle: {
      position: 'absolute',
    },
    messagePopupSparkle1: {
      top: -10,
      right: 10,
    },
    messagePopupSparkle2: {
      bottom: -5,
      left: 5,
    },
    messagePopupSparkle3: {
      top: 20,
      right: -15,
    },
    messagePopupSparkleIcon: {
      fontSize: 20,
      color: '#FFD700',
    },
    messagePopupMessageContainer: {
      alignItems: 'center',
      marginBottom: 24,
    },
    messagePopupTitle: {
      fontSize: scale(20),
      fontFamily: Fonts.ISemiBold,
      color: theme.primaryFriend,
      marginBottom: 12,
      textAlign: 'center',
    },
    messagePopupSubtitle: {
      fontSize: scale(15),
      fontFamily: Fonts.IRegular,
      color: '#666',
      textAlign: 'center',
      lineHeight: 22,
      marginBottom: 8,
    },
    messagePopupHighlightText: {
      color: theme.primaryFriend,
      fontFamily: Fonts.ISemiBold,
    },
    messagePopupCurrentTokens: {
      fontSize: 16,
      fontFamily: Fonts.IRegular,
      color: '#666',
      textAlign: 'center',
      marginBottom: 8,
    },
    messagePopupSubscriptionStatus: {
      color: '#FF6B6B',
      fontFamily: Fonts.ISemiBold,
      fontSize: scale(13),
    },
    messagePopupZeroTokens: {
      color: '#FF4444',
      fontFamily: Fonts.ISemiBold,
    },
    messagePopupActionText: {
      fontSize: scale(14),
      fontFamily: Fonts.IMedium,
      color: '#333',
      textAlign: 'center',
    },
    messagePopupTokenInfoContainer: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      width: '100%',
      marginBottom: scale(15),
      gap: 12,
    },
    messagePopupTokenCard: {
      flex: 1,
      backgroundColor: '#F8F9FA',
      borderRadius: 12,
      padding: 16,
      alignItems: 'center',
      borderWidth: 1,
      borderColor: '#E9ECEF',
    },
    messagePopupTokenCardIcon: {
      fontSize: 28,
      marginBottom: 8,
    },
    messagePopupTokenCardTitle: {
      fontSize: 12,
      fontFamily: Fonts.IMedium,
      color: '#666',
      textAlign: 'center',
      marginBottom: 4,
    },
    messagePopupTokenCardCost: {
      fontSize: 14,
      fontFamily: Fonts.ISemiBold,
      color: theme.primaryFriend,
    },
    messagePopupPremiumText: {
      color: '#FF6B6B',
    },
    messagePopupButtonContainer: {
      width: '100%',
      gap: scale(5),
      marginBottom: scale(10),
    },
    messagePopupPrimaryButton: {
      width: '100%',
      paddingVertical: scale(14),
      borderRadius: 12,
    },
    messagePopupSecondaryButton: {
      width: '100%',
      paddingVertical: scale(12),
      borderRadius: 12,
      backgroundColor: 'transparent',
      borderWidth: 1,
      borderColor: '#E0E0E0',
    },
    messagePopupSecondaryButtonText: {
      color: '#666',
      fontFamily: Fonts.IRegular,
    },
    messagePopupBenefitsText: {
      fontSize: 12,
      fontFamily: Fonts.IRegular,
      color: '#999',
      textAlign: 'center',
    },
  });
};
