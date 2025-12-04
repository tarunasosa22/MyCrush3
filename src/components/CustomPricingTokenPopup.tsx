import React from 'react';
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  StyleSheet,
  Image,
  StatusBar,
  ScrollView,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { scale } from '../utils/Scale';
import Fonts from '../utils/fonts';
import { useThemeStore } from '../store/themeStore';
import IMAGES from '../assets/images';
import { userState } from '../store/userStore';
import CommonPrimaryButton from './buttons/CommonPrimaryButton';

const CustomPricingTokenPopup = ({ visible, onClose, onContinue }: any) => {
  const theme = useThemeStore(state => state.theme);
  const styles = useStyles();

  const tokenPricingData = userState.getState().useTokensList;

  const renderTokenPricingRow = (item: any, index: number) => (
    <View key={item.id} style={styles.tokenPricingPopupPricingRow}>
      <View style={styles.tokenPricingPopupFeatureSection}>
        <Image
          source={item.icon ? { uri: item.icon } : IMAGES.app_icon_without_name}
          style={styles.tokenPricingPopupFeatureIcon}
        />
        <Text style={styles.tokenPricingPopupFeatureText}>{item.feature}</Text>
      </View>
      <View style={styles.tokenPricingPopupTokenSection}>
        <Text
          style={[
            styles.tokenPricingPopupTokenText,
            item?.tokens?.includes('Free')
              ? styles.tokenPricingPopupUnlimitedText
              : styles.tokenPricingPopupCostText,
          ]}
        >
          {item.tokens}
        </Text>
      </View>
    </View>
  );

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
      statusBarTranslucent={true}
      presentationStyle="overFullScreen"
    >
      <StatusBar
        backgroundColor="transparent"
        barStyle="dark-content"
        translucent
      />
      <View style={styles.tokenPricingPopupOverlay}>
        <View style={styles.tokenPricingPopupContainer}>
          <LinearGradient
            colors={[theme.girlFriend, theme.boyFriend]}
            style={styles.tokenPricingPopupGradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            <View style={styles.tokenPricingPopupModal}>
              {/* Header */}
              <View style={styles.tokenPricingPopupHeader}>
                <View style={styles.tokenPricingPopupHeaderContent}>
                  <Text style={styles.tokenPricingPopupHeaderTitle}>TOKEN</Text>
                  <Text
                    style={[
                      styles.tokenPricingPopupHeaderTitle,
                      styles.tokenPricingPopupHeaderTitleHeading,
                    ]}
                  >
                    {' '}
                    PRICING
                  </Text>
                </View>
                <TouchableOpacity
                  onPress={onClose}
                  style={styles.tokenPricingPopupCloseButton}
                >
                  <Image
                    source={IMAGES.close}
                    style={styles.tokenPricingPopupCloseIconImage}
                  />
                </TouchableOpacity>
              </View>
              <View style={styles.tokenPricingPopupSeparator} />

              {/* Content */}
              <View style={styles.tokenPricingPopupContentContainer}>
                {/* Table Header */}
                <View style={styles.tokenPricingPopupTableHeader}>
                  <View style={styles.tokenPricingPopupFeatureHeaderSection}>
                    <Text style={styles.tokenPricingPopupFeatureHeader}>
                      Feature
                    </Text>
                  </View>
                  <View style={styles.tokenPricingPopupTokenHeaderSection}>
                    <Text style={styles.tokenPricingPopupTokenHeader}>
                      Tokens
                    </Text>
                  </View>
                </View>
                <ScrollView>
                  {tokenPricingData?.map((item, index) =>
                    renderTokenPricingRow(item, index),
                  )}
                </ScrollView>
                <Image
                  source={IMAGES.token_star}
                  style={styles.tokenPricingPopupTokenStarBottom}
                />
                <Image
                  source={IMAGES.token_star}
                  style={styles.tokenPricingPopupTokenStarTop}
                />
                {/* Pricing Rows */}
              </View>
              {/* Footer */}
              <View style={styles.tokenPricingPopupFooter}>
                <View style={styles.tokenPricingPopupButtonWrapper}>
                  <CommonPrimaryButton
                    title="Continue"
                    onPress={onContinue}
                    btnStyle={styles.tokenPricingPopupPrimaryButton}
                  />
                </View>
              </View>
            </View>
          </LinearGradient>
        </View>
      </View>
    </Modal>
  );
};

export default CustomPricingTokenPopup;

const useStyles = () => {
  const theme = useThemeStore(state => state.theme);
  return StyleSheet.create({
    tokenPricingPopupOverlay: {
      flex: 1,
      backgroundColor: '#00000080',
    },
    tokenPricingPopupContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
    },
    tokenPricingPopupGradient: {
      borderRadius: 20,
      justifyContent: 'center',
      width: '90%',
    },
    tokenPricingPopupModal: {
      backgroundColor: 'rgba(255, 255, 255, 0.95)',
      borderRadius: 20,
      overflow: 'hidden',
      margin: 3,
    },
    tokenPricingPopupHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: 20,
      paddingBottom: 15,
      backgroundColor: 'rgba(255, 255, 255, 0.9)',
      borderTopLeftRadius: 20,
      borderTopRightRadius: 20,
    },
    tokenPricingPopupHeaderContent: {
      alignItems: 'center',
      flexDirection: 'row',
    },
    tokenPricingPopupHeaderTitle: {
      fontSize: scale(16),
      color: '#4A90E2',
      fontFamily: Fonts.ISemiBold,
      letterSpacing: 2,
    },
    tokenPricingPopupHeaderTitleHeading: {
      color: theme.heading,
    },
    tokenPricingPopupCloseButton: {
      justifyContent: 'center',
      alignItems: 'center',
    },
    tokenPricingPopupCloseIconImage: {
      width: scale(22),
      height: scale(22),
      resizeMode: 'contain',
    },
    tokenPricingPopupSeparator: {
      backgroundColor: theme.primaryFriend,
      width: '100%',
      height: 1,
    },
    tokenPricingPopupCoinContainer: {
      position: 'relative',
      height: 80,
    },
    tokenPricingPopupLeftCoin: {
      position: 'absolute',
      left: -30,
      top: 10,
      width: 80,
      height: 80,
      backgroundColor: '#F5C842',
      borderRadius: 40,
      justifyContent: 'center',
      alignItems: 'center',
      shadowColor: '#000',
      shadowOffset: {
        width: 0,
        height: 4,
      },
      shadowOpacity: 0.3,
      shadowRadius: 4.65,
      elevation: 8,
    },
    tokenPricingPopupRightCoin: {
      position: 'absolute',
      right: -30,
      bottom: 10,
      width: 60,
      height: 60,
      backgroundColor: '#F5C842',
      borderRadius: 30,
      justifyContent: 'center',
      alignItems: 'center',
      shadowColor: '#000',
      shadowOffset: {
        width: 0,
        height: 4,
      },
      shadowOpacity: 0.3,
      shadowRadius: 4.65,
      elevation: 8,
    },
    tokenPricingPopupCoinIcon: {
      fontSize: 30,
    },
    tokenPricingPopupContent: {
      backgroundColor: '#FFFFFF',
      paddingHorizontal: 20,
    },
    tokenPricingPopupContentContainer: {
      paddingHorizontal: 20,
    },
    tokenPricingPopupTableHeader: {
      flexDirection: 'row',
      paddingVertical: 15,
      borderBottomWidth: 2,
      borderBottomColor: '#E0E0E0',
      marginBottom: 10,
    },
    tokenPricingPopupFeatureHeaderSection: {
      width: '60%',
      alignItems: 'flex-start',
    },
    tokenPricingPopupTokenHeaderSection: {
      flex: 1,
      // alignItems: 'center',
    },
    tokenPricingPopupFeatureHeader: {
      fontSize: 18,
      color: theme.girlFriend,
      fontFamily: Fonts.ISemiBold,
      width: '60%',
      textAlign: 'center',
    },
    tokenPricingPopupTokenHeader: {
      fontSize: 18,
      color: theme.boyFriend,
      fontFamily: Fonts.ISemiBold,
      textAlign: 'center',
    },
    tokenPricingPopupScrollContent: {
      flex: 1,
    },
    tokenPricingPopupPricingRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      paddingVertical: 12,
      borderBottomWidth: 1,
      borderBottomColor: '#F0F0F0',
      alignItems: 'center',
      zIndex: 1,
    },
    tokenPricingPopupFeatureSection: {
      // flex: 1,
      flexDirection: 'row',
      alignItems: 'center',
      width: '60%',
    },
    tokenPricingPopupTokenSection: {
      flex: 1,
      alignItems: 'center',
    },
    tokenPricingPopupFeatureIcon: {
      marginRight: 12,
      width: scale(20),
      height: scale(20),
      tintColor: theme.girlFriend,
    },
    tokenPricingPopupFeatureText: {
      fontSize: scale(14),
      color: '#666',
      fontFamily: Fonts.IRegular,
      width: '80%',
    },
    tokenPricingPopupTokenText: {
      fontSize: scale(14),
      fontFamily: Fonts.ISemiBold,
      textAlign: 'center',
    },
    tokenPricingPopupUnlimitedText: {
      color: '#666',
    },
    tokenPricingPopupCostText: {
      color: theme.girlFriend,
    },
    tokenPricingPopupTokenStarBottom: {
      width: scale(50),
      height: scale(50),
      position: 'absolute',
      bottom: scale(20),
      right: scale(10),
      opacity: 0.2,
      zIndex: 2,
    },
    tokenPricingPopupTokenStarTop: {
      width: scale(30),
      height: scale(30),
      position: 'absolute',
      top: scale(20),
      left: scale(10),
      opacity: 0.2,
    },
    tokenPricingPopupFooter: {
      backgroundColor: '#FFFFFF',
      padding: 10,
    },
    tokenPricingPopupButtonWrapper: {
      alignItems: 'center',
    },
    tokenPricingPopupPrimaryButton: {
      width: '90%',
      paddingHorizontal: 0,
      paddingVertical: scale(12),
      marginBottom: 10,
    },
    tokenPricingPopupCancelButton: {
      paddingVertical: 8,
    },
    tokenPricingPopupCancelButtonText: {
      fontSize: 16,
      color: '#666',
      fontFamily: Fonts.IRegular,
    },
  });
};
