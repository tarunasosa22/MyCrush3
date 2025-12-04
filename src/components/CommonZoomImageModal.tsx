import React, { useEffect, useState } from 'react';
import {
  View,
  Modal,
  Dimensions,
  StyleSheet,
  TouchableOpacity,
  StatusBar,
  Text,
  FlatList,
  ScrollView,
  Image,
  Alert,
} from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withDecay,
  withSpring,
  clamp,
} from 'react-native-reanimated';
import {
  Gesture,
  GestureDetector,
  GestureHandlerRootView,
} from 'react-native-gesture-handler';
import { scale as RNscale } from '../utils/Scale';
import { customColors } from '../utils/Colors';
import {
  SafeAreaView,
  useSafeAreaInsets,
} from 'react-native-safe-area-context';
import FastImage from 'react-native-fast-image';
import IMAGES from '../assets/images';
import Fonts from '../utils/fonts';
import { useThemeStore } from '../store/themeStore';
import { SCREEN_WIDTH } from '@gorhom/bottom-sheet';
import { photos } from '../store/userStore';
import { SCREEN_HEIGHT } from '../constants';
import CustomActivityIndicator from './CustomActivityIndicator';

const { width, height } = Dimensions.get('window');

const CommonZoomImageModal = ({
  visible,
  source,
  onClose,
  isReport = false,
  isDownload = false,
  isShare = false,
  originalImages = [],
  onReportPress,
  onShareImagePress,
  downloadRemoteImage,
  item,
  imagesWidth,
  imagesHeight,
}: {
  visible: boolean;
  source?: string;
  onClose: () => void;
  isReport?: boolean;
  isDownload?: boolean;
  isShare?: boolean;
  originalImages?: photos[];
  onReportPress?: (item?: photos) => void;
  item?: photos;
  onShareImagePress?: (imageUrl: string) => void;
  downloadRemoteImage?: (imageUrl: string) => void;
  imagesWidth?: any;
  imagesHeight?: any;
}) => {
  // Modal state management - using single state instead of nested modals
  const [currentModalMode, setCurrentModalMode] = useState('zoom'); // 'zoom' or 'original'
  const [isOriginalShownOnLongPress, setIsOriginalShownOnLongPress] =
    useState(false);
  const [isImageLoading, setIsImageLoading] = useState(true); // 👈 Track loading
  const [currentImageIndex, setCurrentImageIndex] = useState(-1);
  const theme = useThemeStore().theme;
  const imagesFlatListRef = React.useRef<FlatList>(null);

  // Create separate gesture values for each image
  const zoomScale = useSharedValue(1);
  const savedZoomScale = useSharedValue(1);
  const zoomTranslateX = useSharedValue(0);
  const zoomTranslateY = useSharedValue(0);
  const savedZoomTranslateX = useSharedValue(0);
  const savedZoomTranslateY = useSharedValue(0);
  const styles = useStyles();

  const resetZoomPosition = () => {
    'worklet';
    zoomScale.value = withSpring(1);
    savedZoomScale.value = 1;
    zoomTranslateX.value = withSpring(0);
    zoomTranslateY.value = withSpring(0);
    savedZoomTranslateX.value = 0;
    savedZoomTranslateY.value = 0;
  };

  const handleModalClose = () => {
    resetZoomPosition();
    setCurrentModalMode('zoom'); // Reset to zoom mode
    setIsOriginalShownOnLongPress(false); // Reset long press state
    onClose();
  };

  const pinchZoomGesture = Gesture.Pinch()
    .onUpdate(e => {
      zoomScale.value = clamp(savedZoomScale.value * e.scale, 0.5, 4);
    })
    .onEnd(() => {
      savedZoomScale.value = zoomScale.value;
      if (zoomScale.value < 1) {
        zoomScale.value = withSpring(1);
        savedZoomScale.value = 1;
      }
    });

  const panZoomGesture = Gesture.Pan()
    .onStart(() => {
      savedZoomTranslateX.value = zoomTranslateX.value;
      savedZoomTranslateY.value = zoomTranslateY.value;
    })
    .onUpdate(e => {
      const maxTranslateX = width * (zoomScale.value - 1) * 0.5;
      const maxTranslateY = height * (zoomScale.value - 1) * 0.5;

      zoomTranslateX.value = clamp(
        savedZoomTranslateX.value + e.translationX,
        -maxTranslateX,
        maxTranslateX,
      );
      zoomTranslateY.value = clamp(
        savedZoomTranslateY.value + e.translationY,
        -maxTranslateY,
        maxTranslateY,
      );
    })
    .onEnd(e => {
      const maxTranslateX = width * (zoomScale.value - 1) * 0.5;
      const maxTranslateY = height * (zoomScale.value - 1) * 0.5;

      zoomTranslateX.value = withDecay({
        velocity: e.velocityX,
        clamp: [-maxTranslateX, maxTranslateX],
      });
      zoomTranslateY.value = withDecay({
        velocity: e.velocityY,
        clamp: [-maxTranslateY, maxTranslateY],
      });
    });

  const doubleTapZoomGesture = Gesture.Tap()
    .numberOfTaps(2)
    .onStart(() => {
      if (zoomScale.value > 1) {
        zoomScale.value = withSpring(1);
        savedZoomScale.value = 1;
        zoomTranslateX.value = withSpring(0);
        zoomTranslateY.value = withSpring(0);
        savedZoomTranslateX.value = 0;
        savedZoomTranslateY.value = 0;
      } else {
        zoomScale.value = withSpring(2);
        savedZoomScale.value = 2;
      }
    });

  const composedGestures = Gesture.Simultaneous(
    Gesture.Race(doubleTapZoomGesture, pinchZoomGesture),
    panZoomGesture,
  );

  const zoomAnimatedStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: zoomTranslateX.value },
      { translateY: zoomTranslateY.value },
      { scale: zoomScale.value },
    ],
  }));

  useEffect(() => {
    if (visible && originalImages.length !== 0 && item) {
      let index = originalImages.findIndex(
        (originalItem: photos) => originalItem.id === item.id,
      );
      if (index !== -1) {
        setCurrentImageIndex(index);
        setTimeout(() => {
          imagesFlatListRef.current?.scrollToIndex({ animated: true, index });
        }, 1000);
      }
    }
  }, [originalImages, visible, item]);

  const renderZoomMode = (image: string) => {
    return (
      <View style={styles.gestureContainer}>
        {/* Image Container */}
        <View style={styles.imageContainer}>
          {isImageLoading && (
            <CustomActivityIndicator color={theme.girlFriend} />
          )}
          <GestureDetector gesture={composedGestures}>
            <Animated.View style={zoomAnimatedStyle}>
              <FastImage
                source={{
                  uri: image,
                  priority: FastImage.priority.high,
                  cache: FastImage.cacheControl.web,
                }}
                style={{
                  width: imagesWidth
                    ? imagesWidth < SCREEN_WIDTH
                      ? imagesWidth
                      : SCREEN_WIDTH
                    : width,
                  height: imagesHeight
                    ? imagesHeight < SCREEN_HEIGHT
                      ? imagesHeight
                      : SCREEN_HEIGHT
                    : height,
                }}
                resizeMode={FastImage.resizeMode.contain}
                onLoadStart={() => setIsImageLoading(true)}
                onLoadEnd={() => setIsImageLoading(false)}
              />
            </Animated.View>
          </GestureDetector>
        </View>

        {/* Long Press Original Images Overlay */}
        {/* {isOriginalShownOnLongPress && <RenderLongPressOriginal />} */}

        {/* Bottom Controls */}
        <View style={styles.bottomControls}>
          {/* Add any additional controls here */}
        </View>
      </View>
    );
  };

  const renderImageItem = ({ item, index }: { item: any; index: number }) => {
    return (
      <View style={styles.originalImageItem}>{renderZoomMode(item.image)}</View>
    );
  };

  const handleScrollEnd = (e: any) => {
    const contentOffset = e.nativeEvent.contentOffset;
    const viewSize = e.nativeEvent.layoutMeasurement;
    const pageNum = Math.floor(contentOffset.x / viewSize.width);

    if (pageNum !== currentImageIndex) {
      setCurrentImageIndex(pageNum);
      // Reset zoom when changing images
      resetZoomPosition();
    }
  };

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="slide"
      onRequestClose={handleModalClose}
      statusBarTranslucent={true}
      presentationStyle="overFullScreen" // Better iOS support
      supportedOrientations={['portrait', 'landscape']}
    >
      <StatusBar backgroundColor="rgba(0,0,0,0.9)" barStyle="light-content" />

      <GestureHandlerRootView style={{ flex: 1 }}>
        <SafeAreaView
          style={[
            styles.modalContainer,
            currentModalMode === 'original' && styles.originalModalContainer,
          ]}
          edges={[]}
        >
          <View
            style={{
              right: 10,
              zIndex: 100,
              alignSelf: 'flex-end',
              position: 'absolute',
              marginTop: useSafeAreaInsets().top,
            }}
          >
            <TouchableOpacity
              style={[styles.closeButton, {}]}
              onPress={handleModalClose}
            >
              <FastImage source={IMAGES.close} style={styles.icon} />
            </TouchableOpacity>
            {isReport && (
              <TouchableOpacity
                style={[
                  styles.closeButton,
                  {
                    marginTop: 10,
                  },
                ]}
                onPress={() =>
                  onReportPress?.(
                    currentImageIndex !== -1
                      ? originalImages[currentImageIndex]
                      : undefined,
                  )
                }
              >
                <FastImage source={IMAGES.report_icon} style={styles.icon} />
              </TouchableOpacity>
            )}

            {isShare && (
              <TouchableOpacity
                style={[
                  styles.closeButton,
                  {
                    marginTop: 10,
                  },
                ]}
                onPress={async () => {
                  if (source && onShareImagePress) {
                    try {
                      await onShareImagePress(source);
                    } catch (err) {
                      Alert.alert('Error', 'Failed to shared image');
                    }
                  }
                }}
              >
                <FastImage source={IMAGES.share_App} style={styles.icon} />
              </TouchableOpacity>
            )}
            {isDownload && (
              <TouchableOpacity
                style={[
                  styles.closeButton,
                  {
                    marginTop: 10,
                  },
                ]}
                onPress={async () => {
                  if (source && downloadRemoteImage) {
                    try {
                      await downloadRemoteImage(source);
                      Alert.alert('Success', 'Image downloaded successfully.');
                    } catch (err) {
                      Alert.alert('Error', 'Failed to download image');
                    }
                  }
                }}
              >
                <FastImage source={IMAGES.download} style={styles.icon} />
              </TouchableOpacity>
            )}
          </View>

          {originalImages.length === 0 && source ? (
            renderZoomMode(source)
          ) : (
            <FlatList
              ref={imagesFlatListRef}
              data={originalImages}
              renderItem={renderImageItem}
              horizontal
              pagingEnabled
              showsHorizontalScrollIndicator={false}
              keyExtractor={(item, index) => index.toString()}
              onMomentumScrollEnd={handleScrollEnd}
              scrollEventThrottle={16}
            />
          )}

          {originalImages.length > 0 && (
            <View style={styles.bottomBtnContainer}>
              <TouchableOpacity
                disabled={currentImageIndex === 0}
                onPress={() => {
                  if (currentImageIndex > 0) {
                    imagesFlatListRef.current?.scrollToIndex({
                      index: currentImageIndex - 1,
                    });
                    setCurrentImageIndex(currentImageIndex - 1);
                    resetZoomPosition();
                  }
                }}
                style={[
                  styles.arrowBtn,
                  { opacity: currentImageIndex > 0 ? 1 : 0.5 },
                ]}
              >
                <Image source={IMAGES.back_icon} style={styles.bottomBtn} />
              </TouchableOpacity>
              <TouchableOpacity
                disabled={currentImageIndex === originalImages.length - 1}
                onPress={() => {
                  if (currentImageIndex < originalImages.length - 1) {
                    imagesFlatListRef.current?.scrollToIndex({
                      index: currentImageIndex + 1,
                    });
                    setCurrentImageIndex(currentImageIndex + 1);
                    resetZoomPosition();
                  }
                }}
                style={[
                  styles.arrowBtn,
                  {
                    opacity:
                      currentImageIndex < originalImages.length - 1 ? 1 : 0.5,
                  },
                ]}
              >
                <Image
                  source={IMAGES.back_icon}
                  style={[
                    styles.bottomBtn,
                    { transform: [{ rotate: '180deg' }] },
                  ]}
                />
              </TouchableOpacity>
            </View>
          )}
        </SafeAreaView>
      </GestureHandlerRootView>
    </Modal>
  );
};

const useStyles = () => {
  const { theme } = useThemeStore();
  const insets = useSafeAreaInsets();
  return StyleSheet.create({
    container: {
      flex: 1,
       backgroundColor: theme.bottomTabBackground,
    },
    modalContainer: {
      flex: 1,
      backgroundColor: theme.bottomTabBackground,
    },
    gestureContainer: {
      flex: 1,
      backgroundColor: theme.bottomTabBackground,
    },
    closeButton: {
      borderRadius: RNscale(25),
      backgroundColor: 'white',
      alignItems: 'center',
      justifyContent: 'center',
      width: RNscale(42),
      height: RNscale(42),
      // iOS shadow
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.3,
      shadowRadius: 6,

      // Android shadow
      elevation: 8,
    },
    icon: {
      height: RNscale(25),
      width: RNscale(25),
    },
    imageContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
    },
    image: {
      width: width,
      height: height,
    },
    bottomControls: {
      position: 'absolute',
      bottom: 40,
      left: 0,
      right: 0,
      flexDirection: 'row',
      justifyContent: 'center',
      alignItems: 'center',
    },
    resetButton: {
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      borderRadius: 25,
      padding: 12,
      elevation: 5,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.25,
      shadowRadius: 3.84,
      width: 150,
      height: 150,
    },
    thumbnail: {
      width: 150,
      height: 150,
      backgroundColor: '#ddd',
      justifyContent: 'center',
      alignItems: 'center',
      margin: 20,
      borderRadius: 10,
    },
    thumbnailText: {
      color: '#666',
      fontSize: 16,
    },
    showOriginal: {
      borderColor: customColors.primary,
      backgroundColor: customColors.primary,
      position: 'absolute',
      paddingHorizontal: RNscale(15),
      paddingVertical: RNscale(10),
      height: RNscale(40),
      alignSelf: 'center',
      bottom: RNscale(20),
      right: RNscale(20),
      zIndex: 100,
      borderRadius: RNscale(20),
      alignItems: 'center',
      justifyContent: 'center',
      // iOS shadow
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.25,
      shadowRadius: 3.84,
      // Android shadow
      elevation: 5,
    },
    showOriginalText: {
      color: 'white',
      fontSize: RNscale(14),
      fontWeight: '600',
    },

    // Long Press Overlay Styles
    longPressOverlay: {
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: customColors.toolbackground,
      zIndex: 200,
      justifyContent: 'center',
      alignItems: 'center',
    },
    longPressContent: {
      flex: 1,
      width: '100%',
      paddingHorizontal: RNscale(20),
      paddingVertical: RNscale(40),
    },
    longPressErrorContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
    },
    longPressErrorText: {
      fontFamily: Fonts.IRegular,
      fontSize: RNscale(24),
      color: customColors.primary,
      textAlign: 'center',
    },
    longPressImagesContainer: {
      flex: 1,
      justifyContent: 'center',
    },
    longPressSingleImage: {
      width: '100%',
      height: height * 0.8,
      borderRadius: RNscale(12),
    },
    longPressImagesList: {
      flexGrow: 1,
      justifyContent: 'center',
      paddingVertical: RNscale(20),
    },

    // Original Images Modal Styles
    originalModalContainer: {
      backgroundColor: 'rgba(0, 0, 0, 0.95)',
    },
    originalModalContent: {
      flex: 1,
      backgroundColor: customColors.backGround,
    },
    originalModalHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingHorizontal: RNscale(20),
      paddingVertical: RNscale(15),
      borderBottomWidth: 1,
      borderBottomColor: 'rgba(255, 255, 255, 0.1)',
    },
    originalModalTitle: {
      fontSize: RNscale(18),
      fontWeight: 'bold',
      color: customColors.primary,
      flex: 1,
      textAlign: 'center',
    },
    backButton: {
      backgroundColor: customColors.primary,
      borderRadius: RNscale(20),
      alignItems: 'center',
      justifyContent: 'center',
      width: RNscale(35),
      height: RNscale(35),
    },
    backIcon: {
      height: RNscale(18),
      width: RNscale(20),
    },
    originalCloseButton: {
      backgroundColor: customColors.primary,
      borderRadius: RNscale(20),
      alignItems: 'center',
      justifyContent: 'center',
      width: RNscale(35),
      height: RNscale(35),
    },
    originalCloseIcon: {
      height: RNscale(18),
      width: RNscale(18),
    },
    errorContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
    },
    errorText: {
      fontFamily: Fonts.IRegular,
      fontSize: RNscale(30),
      color: customColors.primary,
      textAlign: 'center',
    },
    originalImagesContainer: {
      flex: 1,
      paddingHorizontal: RNscale(10),
      paddingTop: RNscale(10),
    },
    originalImagesList: {
      paddingBottom: RNscale(20),
    },
    originalImageItem: {
      width: SCREEN_WIDTH,
      overflow: 'hidden',
    },
    originalImage: {
      width: '100%',
      height: '100%',
    },
    singleImageContainer: {
      flexGrow: 1,
      justifyContent: 'center',
      alignItems: 'center',
      paddingVertical: RNscale(20),
    },
    singleOriginalImage: {
      width: width - RNscale(40),
      height: height * 0.7,
      borderRadius: RNscale(8),
    },
    bottomBtnContainer: {
      position: 'absolute',
      bottom: insets.bottom,
      left: 0,
      right: 0,
      justifyContent: 'space-between',
      flexDirection: 'row',
      paddingVertical: 30,
      paddingHorizontal: 30,
      shadowColor: '#000',
      shadowOffset: {
        width: 0,
        height: 2,
      },
      shadowOpacity: 0.25,
      shadowRadius: 3.84,

      elevation: 5,
    },
    arrowBtn: {
      backgroundColor: 'white',
      padding: 20,
      borderRadius: 90,
      elevation: 5,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.25,
      shadowRadius: 3.84,
    },
    bottomBtn: {
      height: RNscale(20),
      width: RNscale(20),
    },
  });
};

export default CommonZoomImageModal;
