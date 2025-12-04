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
  ImageBackground,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { scale, verticalScale } from '../utils/Scale';
import Fonts from '../utils/fonts';
import { useThemeStore } from '../store/themeStore';
import { customColors } from '../utils/Colors';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

const ImagePreviewModal = ({
  message,
  visible,
  onClose,
  onPurchase,
  data,
  imageData,
  getFree,
}: any) => {
  const theme = useThemeStore(state => state.theme);
  const styles = useStyles();

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
      <View style={styles.imagePreviewModalOverlay}>
        <View style={styles.imagePreviewModalContainer}>
          <LinearGradient
            colors={[theme.girlFriend, theme.boyFriend]}
            style={styles.imagePreviewModalGradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            <View style={styles.imagePreviewModalModal}>
              {/* Close Button - Moved outside */}
              <TouchableOpacity
                onPress={onClose}
                style={styles.imagePreviewModalCloseButton}
              >
                <View style={styles.imagePreviewModalCloseIconWrapper}>
                  <Text style={styles.imagePreviewModalCloseIcon}>✕</Text>
                </View>
              </TouchableOpacity>

              {/* Content */}
              <View style={styles.imagePreviewModalContent}>
                <ImageBackground
                  source={{ uri: imageData }}
                  style={styles.imagePreviewModalImageBackground}
                  imageStyle={styles.imagePreviewModalImageStyle}
                  resizeMode="cover"
                  blurRadius={12}
                >
                  {/* Overlay for better button visibility */}
                  <View style={styles.imagePreviewModalImageOverlay} />
                </ImageBackground>

                {/* Buttons */}
                <View style={styles.imagePreviewModalButtonContainer}>
                  <TouchableOpacity
                    onPress={onPurchase}
                    style={styles.imagePreviewModalLockIconBackground}
                  >
                    <Text style={styles.imagePreviewModalUnlockText}>
                      Get Pro 👑
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={styles.imagePreviewModalSecondaryButton}
                    onPress={getFree}
                  >
                    <Text style={styles.imagePreviewModalSecondaryButtonText}>
                      {'Show video ad for free'}
                    </Text>

                    {/* ✅ Ad Label */}
                    <View style={styles.imagePreviewModalAdLabel}>
                      <Text style={styles.imagePreviewModalAdLabelText}>
                        Ad
                      </Text>
                    </View>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          </LinearGradient>
        </View>
      </View>
    </Modal>
  );
};

export default ImagePreviewModal;

const useStyles = () => {
  const theme = useThemeStore(state => state.theme);
  return StyleSheet.create({
    imagePreviewModalOverlay: {
      flex: 1,
      backgroundColor: 'rgba(0, 0, 0, 0.7)',
      justifyContent: 'center',
      alignItems: 'center',
    },
    imagePreviewModalContainer: {
      width: SCREEN_WIDTH * 0.85,
      maxWidth: 400,
    },
    imagePreviewModalGradient: {
      borderRadius: 24,
      padding: 3,
    },
    imagePreviewModalModal: {
      backgroundColor: '#FFFFFF',
      borderRadius: 22,
      overflow: 'hidden',
      position: 'relative',
    },
    imagePreviewModalContent: {
      alignItems: 'center',
      justifyContent: 'flex-end',
    },
    imagePreviewModalImageBackground: {
      width: '100%',
      height: SCREEN_HEIGHT * 0.6,
      justifyContent: 'center',
      alignItems: 'center',
    },
    imagePreviewModalImageStyle: {
      borderRadius: 22,
    },
    imagePreviewModalImageOverlay: {
      ...StyleSheet.absoluteFillObject,
      backgroundColor: 'rgba(0, 0, 0, 0.2)',
      pointerEvents: 'none', // 👈 allows touches to pass through
    },
    imagePreviewModalButtonContainer: {
      position: 'absolute',
      alignItems: 'center',
      paddingHorizontal: scale(20),
      width: '100%',
    },
    imagePreviewModalLockIconBackground: {
      width: '100%',
      flexDirection: 'row',
      backgroundColor: theme.primaryFriend,
      borderRadius: scale(10),
      paddingHorizontal: scale(15),
      paddingVertical: scale(9),
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: verticalScale(20),
      borderWidth: 2,
      borderColor: customColors.white,
    },
    imagePreviewModalUnlockText: {
      color: theme.white,
      fontSize: scale(20),
      fontFamily: Fonts.ISemiBold,
      textAlign: 'center',
    },
    imagePreviewModalTokenIcon: {
      width: scale(22),
      height: scale(22),
      resizeMode: 'contain',
    },
    imagePreviewModalSecondaryButton: {
      width: '100%',
      paddingVertical: scale(15),
      borderRadius: 10,

      backgroundColor: 'rgba(0, 0, 0, 0.7)',
      // borderWidth: 2,
      // borderColor: customColors.white,
      alignItems: 'center',
      marginBottom: verticalScale(20),
      paddingHorizontal: scale(50),
    },
    imagePreviewModalSecondaryButtonText: {
      color: customColors.white,
      fontFamily: Fonts.ISemiBold,
      fontSize: scale(16),
    },
    imagePreviewModalAdLabel: {
      position: 'absolute',
      top: 0,
      left: 0,
      backgroundColor: 'red',
      paddingHorizontal: scale(12),
      paddingVertical: scale(2),
      borderTopLeftRadius: scale(8),
    },
    imagePreviewModalAdLabelText: {
      color: '#fff',
      fontSize: scale(12),
      fontFamily: Fonts.ISemiBold,
      fontWeight: '700',
    },
    imagePreviewModalCloseButton: {
      position: 'absolute',
      top: scale(12),
      right: scale(12),
      zIndex: 999,
    },
    imagePreviewModalCloseIconWrapper: {
      width: scale(25),
      height: scale(25),
      borderRadius: scale(18),
      backgroundColor: 'rgba(0, 0, 0, 0.6)',
      justifyContent: 'center',
      alignItems: 'center',
    },
    imagePreviewModalCloseIcon: {
      fontSize: scale(10),
      color: '#FFFFFF',
      fontFamily: Fonts.IBold,
      fontWeight: '700',
    },
  });
};
