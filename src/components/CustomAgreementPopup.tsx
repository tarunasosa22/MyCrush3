import React, { useState } from 'react';
import {
  View,
  Text,
  Modal,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  SafeAreaView,
  Image,
  StatusBar,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { scale } from '../utils/Scale';
import { privacyPolicyContent } from '../constants';
import Fonts from '../utils/fonts';
import { useThemeStore } from '../store/themeStore';
import IMAGES from '../assets/images';
import { navigationRef } from '../../App';
import CommonPrimaryButton from './buttons/CommonPrimaryButton';

const { width, height } = Dimensions.get('window');

const CustomAgreementPopup = ({ visible, onClose, onAgree }: any) => {
  const [isPrivacyAgreed, setIsPrivacyAgreed] = useState(false);
  const theme = useThemeStore(state => state.theme);
  const styles = useStyles();

  const handleAgree = () => {
    if (isPrivacyAgreed) {
      onAgree();
      onClose();
    }
  };

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
      <View style={styles.agreementOverlay}>
        <View style={styles.agreementContainer}>
          <LinearGradient
            colors={[theme.girlFriend, theme.boyFriend]}
            style={styles.agreementGradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            <View style={styles.agreementModal}>
              {/* Header */}
              <View style={styles.agreementHeader}>
                <View style={styles.agreementHeaderContent}>
                  <Text style={styles.agreementHeaderTitle}>
                    Privacy Policy
                  </Text>
                </View>
              </View>
              <View style={styles.agreementSeparator} />

              <ScrollView
                style={styles.agreementContent}
                showsVerticalScrollIndicator={false}
              >
                <View style={styles.agreementContentContainer}>
                  <Text style={styles.agreementEffectiveDate}>
                    {privacyPolicyContent}
                  </Text>
                </View>
              </ScrollView>

              <View style={styles.agreementFooter}>
                <TouchableOpacity
                  style={styles.agreementCheckboxContainer}
                  onPress={() => setIsPrivacyAgreed(!isPrivacyAgreed)}
                >
                  <View
                    style={[
                      styles.agreementCheckbox,
                      isPrivacyAgreed && styles.agreementCheckboxChecked,
                    ]}
                  >
                    {isPrivacyAgreed && (
                      <Image
                        source={IMAGES.right_icon}
                        style={styles.agreementCheckIcon}
                      />
                    )}
                  </View>
                  <View style={styles.agreementCheckboxRow}>
                    <Text style={styles.agreementCheckboxText}>
                      I have read and agree to the
                    </Text>
                    <TouchableOpacity
                      onPress={() => {
                        onClose();
                        navigationRef.current?.navigate('PrivacyPolicy');
                      }}
                    >
                      <Text style={styles.agreementPrivacyLink}>
                        {` Privacy Policy`}
                      </Text>
                    </TouchableOpacity>
                  </View>
                </TouchableOpacity>

                <View style={styles.agreementButtonWrapper}>
                  <CommonPrimaryButton
                    title="Accept & Continue"
                    onPress={onAgree}
                    disabled={!isPrivacyAgreed}
                    btnStyle={[
                      styles.agreementPrimaryButton,
                      {
                        backgroundColor: isPrivacyAgreed
                          ? theme.primaryFriend
                          : 'gray',
                      },
                    ]}
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

export default CustomAgreementPopup;

const useStyles = () => {
  const theme = useThemeStore(state => state.theme);
  return StyleSheet.create({
    agreementOverlay: {
      flex: 1,
      backgroundColor: '#00000080',
      paddingHorizontal: scale(10),
      alignItems: 'center',
      justifyContent: 'center',
    },
    agreementContainer: {
      height: '85%',
    },
    agreementGradient: {
      flex: 1,
      borderRadius: 20,
      margin: 10,
    },
    agreementModal: {
      backgroundColor: 'rgba(255, 255, 255, 0.95)',
      borderRadius: 20,
      overflow: 'hidden',
      margin: 3,
      flex: 1,
    },
    agreementHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: 20,
      paddingBottom: 15,
      backgroundColor: 'rgba(255, 255, 255, 0.9)',
      borderTopLeftRadius: 20,
      borderTopRightRadius: 20,
    },
    agreementHeaderContent: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    agreementHeaderTitle: {
      fontSize: 24,
      color: theme.primaryFriend,
      fontFamily: Fonts.ISemiBold,
    },
    agreementSeparator: {
      backgroundColor: theme.primaryFriend,
      width: '100%',
      height: 1,
    },
    agreementContent: {
      flex: 1,
      backgroundColor: '#FFFFFF',
    },
    agreementContentContainer: {
      paddingHorizontal: 10,
    },
    agreementEffectiveDate: {
      fontSize: 14,
      color: '#666',
      marginBottom: 5,
      fontFamily: Fonts.IMedium,
    },
    agreementFooter: {
      backgroundColor: '#FFFFFF',
      padding: 10,
      borderTopWidth: 1,
      borderTopColor: '#E0E0E0',
    },
    agreementCheckboxContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 5,
    },
    agreementCheckbox: {
      width: 20,
      height: 20,
      borderWidth: 2,
      borderColor: theme.primaryFriend,
      borderRadius: 4,
      marginRight: 10,
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: '#FFFFFF',
    },
    agreementCheckboxChecked: {
      backgroundColor: theme.primaryFriend,
    },
    agreementCheckIcon: {
      width: 11,
      height: 11,
      resizeMode: 'contain',
    },
    agreementCheckboxRow: {
      flexDirection: 'row',
      alignItems: 'center',
      width: '95%',
    },
    agreementCheckboxText: {
      fontSize: 13,
      color: '#333',
      fontFamily: Fonts.IMedium,
    },
    agreementPrivacyLink: {
      fontSize: 13,
      color: theme.primaryFriend,
      fontFamily: Fonts.IMedium,
      textAlign: 'left',
    },
    agreementButtonWrapper: {
      alignItems: 'center',
      justifyContent: 'space-between',
    },
    agreementPrimaryButton: {
      width: '90%',
      paddingHorizontal: 0,
      paddingVertical: scale(11),
      backgroundColor: 'gray',
    },
  });
};
