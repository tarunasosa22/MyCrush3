import { Dimensions, Image, StyleSheet, TouchableOpacity } from 'react-native';
import { AvatarItem } from '../store/categoryStore';
import {
  interpolate,
  runOnJS,
  useAnimatedGestureHandler,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';
import { useThemeStore } from '../store/themeStore';
import { scale, verticalScale } from '../utils/Scale';
import { PanGestureHandler } from 'react-native-gesture-handler';
import { Animated } from 'react-native';
import Fonts from '../utils/fonts';
import FastImage from 'react-native-fast-image';
import { View } from 'react-native';
import { Text } from 'react-native';
const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');
const CARD_WIDTH = SCREEN_WIDTH - scale(40);
const CARD_HEIGHT = SCREEN_HEIGHT * 0.6;
const SWIPE_THRESHOLD = SCREEN_WIDTH * 0.3;

const CustomSwiperCard: React.FC<{
  item: AvatarItem;
  index: number;
  onSwipeComplete: (direction: 'left' | 'right') => void;
  isTopCard: boolean;
  onCardPress: () => void;
  onCallPress: () => void;
  onChatPress: () => void;
  isBlur: boolean;
}> = ({
  item,
  index,
  onSwipeComplete,
  isTopCard,
  onCardPress,
  onCallPress,
  onChatPress,
  isBlur,
}) => {
  const swipeCardTranslateX = useSharedValue(0);
  const swipeCardTranslateY = useSharedValue(0);
  const { theme } = useThemeStore.getState();
  const styles = useStyles();

  const swipeCardGestureHandler = useAnimatedGestureHandler({
    onStart: (_, ctx: any) => {
      ctx.startX = swipeCardTranslateX.value;
      ctx.startY = swipeCardTranslateY.value;
    },
    onActive: (event, ctx: any) => {
      if (isTopCard) {
        swipeCardTranslateX.value = ctx.startX + event.translationX;
        swipeCardTranslateY.value = ctx.startY + event.translationY;
      }
    },
    onEnd: event => {
      if (isTopCard) {
        if (Math.abs(swipeCardTranslateX.value) > SWIPE_THRESHOLD) {
          const direction = swipeCardTranslateX.value > 0 ? 'right' : 'left';
          swipeCardTranslateX.value = withSpring(
            swipeCardTranslateX.value > 0 ? SCREEN_WIDTH : -SCREEN_WIDTH,
            {},
            () => {
              runOnJS(onSwipeComplete)(direction);
            },
          );
        } else {
          swipeCardTranslateX.value = withSpring(0);
          swipeCardTranslateY.value = withSpring(0);
        }
      }
    },
  });

  const swipeCardStyle = useAnimatedStyle(() => {
    const swipeCardRotate = interpolate(
      swipeCardTranslateX.value,
      [-SCREEN_WIDTH / 2, 0, SCREEN_WIDTH / 2],
      [-15, 0, 15],
    );

    // Calculate scale and translateY for stacked cards
    const swipeCardScale = 1 - index * 0.05;
    const swipeCardStackedTranslateY = -index * 20; // Move cards up to show peek effect

    return {
      transform: [
        { translateX: isTopCard ? swipeCardTranslateX.value : 0 },
        {
          translateY: isTopCard
            ? swipeCardTranslateY.value
            : swipeCardStackedTranslateY,
        },
        { rotate: `${isTopCard ? swipeCardRotate : 0}deg` },
        { scale: swipeCardScale },
      ],
      zIndex: 10 - index,
    };
  });

  const swipeCardLikeOpacity = useAnimatedStyle(() => ({
    opacity: interpolate(
      swipeCardTranslateX.value,
      [0, SWIPE_THRESHOLD],
      [0, 1],
    ),
  }));

  const swipeCardDislikeOpacity = useAnimatedStyle(() => ({
    opacity: interpolate(
      swipeCardTranslateX.value,
      [-SWIPE_THRESHOLD, 0],
      [1, 0],
    ),
  }));

  const swipeCardCharacterLabel =
    item?.categories?.find((cat: any) => cat.label === 'Character')
      ?.options?.[0]?.label ?? null;

  return (
    <PanGestureHandler
      onGestureEvent={swipeCardGestureHandler}
      enabled={isTopCard}
    >
      <Animated.View style={[styles.swipeCardCard, swipeCardStyle]}>
        <TouchableOpacity
          activeOpacity={0.95}
          onPress={onCardPress}
          style={styles.swipeCardTouchable}
          disabled={!isTopCard}
        >
          <FastImage
            source={{ uri: item.cover_image || item.image }}
            style={styles.swipeCardImage}
            resizeMode={FastImage.resizeMode.cover}
          />

          {/* Character Tag */}
          {swipeCardCharacterLabel && isTopCard && (
            <View style={styles.swipeCardCharacterTag}>
              <Text style={styles.swipeCardCharacterTagText}>
                {swipeCardCharacterLabel}
              </Text>
            </View>
          )}

          {/* Swipe Indicators - Only show on top card */}
          {isTopCard && (
            <>
              <Animated.View
                style={[
                  styles.swipeCardSwipeIndicator,
                  styles.swipeCardLikeIndicator,
                  swipeCardLikeOpacity,
                ]}
              >
                <Text style={styles.swipeCardLikeText}>LIKE</Text>
              </Animated.View>

              <Animated.View
                style={[
                  styles.swipeCardSwipeIndicator,
                  styles.swipeCardDislikeIndicator,
                  swipeCardDislikeOpacity,
                ]}
              >
                <Text style={styles.swipeCardDislikeText}>NOPE</Text>
              </Animated.View>
            </>
          )}

          {/* Bottom Info */}
          <View style={styles.swipeCardBottomInfo}>
            <View style={styles.swipeCardNameContainer}>
              <Text style={styles.swipeCardAvatarName}>{item.name}</Text>
              {item.age && (
                <Text style={styles.swipeCardAvatarAge}>AGE: {item.age}</Text>
              )}
            </View>
          </View>

          {/* Action Buttons Overlay - Only on top card */}
          {isTopCard && (
            <View style={styles.swipeCardOverlayButtons}>
              {isBlur ? (
                <>
                  {/* <BlurView
                      style={styles.swipeCardBlurContainer}
                      blurType="light"
                      blurAmount={10}
                      reducedTransparencyFallbackColor="white"
                    /> */}
                  <View style={styles.swipeCardBlurOverlay} />
                </>
              ) : null}
            </View>
          )}
        </TouchableOpacity>
      </Animated.View>
    </PanGestureHandler>
  );
};

export default CustomSwiperCard;

const useStyles = () => {
  return StyleSheet.create({
    swipeCardCard: {
      position: 'absolute',
      width: CARD_WIDTH,
      height: CARD_HEIGHT,
      borderRadius: scale(20),
      overflow: 'hidden',
      backgroundColor: '#fff',
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.25,
      shadowRadius: 3.84,
      elevation: 5,
    },
    swipeCardTouchable: {
      flex: 1,
    },
    swipeCardImage: {
      width: '100%',
      height: '100%',
    },
    swipeCardCharacterTag: {
      position: 'absolute',
      top: scale(15),
      right: scale(15),
      backgroundColor: '#2C2C2C99',
      borderWidth: 1,
      borderColor: '#FFFFFFAA',
      paddingHorizontal: scale(16),
      paddingVertical: verticalScale(8),
      borderRadius: scale(20),
    },
    swipeCardCharacterTagText: {
      color: '#FFFFFF',
      fontSize: scale(14),
      fontWeight: '600',
      fontFamily: Fonts.IRegular,
    },
    swipeCardSwipeIndicator: {
      position: 'absolute',
      top: scale(50),
      paddingHorizontal: scale(20),
      paddingVertical: verticalScale(10),
      borderWidth: 3,
      borderRadius: scale(10),
    },
    swipeCardLikeIndicator: {
      right: scale(30),
      borderColor: '#4CAF50',
      transform: [{ rotate: '20deg' }],
    },
    swipeCardDislikeIndicator: {
      left: scale(30),
      borderColor: '#F44336',
      transform: [{ rotate: '-20deg' }],
    },
    swipeCardLikeText: {
      fontSize: scale(32),
      fontWeight: 'bold',
      color: '#4CAF50',
      fontFamily: Fonts.IBold,
    },
    swipeCardDislikeText: {
      fontSize: scale(32),
      fontWeight: 'bold',
      color: '#F44336',
      fontFamily: Fonts.IBold,
    },
    swipeCardBottomInfo: {
      position: 'absolute',
      bottom: 0,
      left: 0,
      right: 0,
      paddingHorizontal: scale(20),
      paddingVertical: verticalScale(20),
      backgroundColor: 'rgba(0,0,0,0.4)',
    },
    swipeCardNameContainer: {
      marginBottom: verticalScale(5),
    },
    swipeCardAvatarName: {
      fontSize: scale(28),
      fontWeight: '600',
      fontFamily: Fonts.IBold,
      color: '#fff',
    },
    swipeCardAvatarAge: {
      fontSize: scale(16),
      color: '#fff',
      fontFamily: Fonts.IRegular,
      marginTop: verticalScale(4),
    },
    swipeCardOverlayButtons: {
      position: 'absolute',
      top: '35%',
      right: 0,
      width: scale(55),
      height: scale(120),
      borderTopLeftRadius: scale(20),
      borderBottomLeftRadius: scale(20),
      overflow: 'hidden',
    },
    swipeCardBlurContainer: {
      ...StyleSheet.absoluteFillObject,
      borderTopLeftRadius: scale(20),
      borderBottomLeftRadius: scale(20),
    },
    swipeCardBlurOverlay: {
      ...StyleSheet.absoluteFillObject,
      backgroundColor: '#2C2C2C26',
      borderTopLeftRadius: scale(20),
      borderBottomLeftRadius: scale(20),
    },
    swipeCardIconGroup: {
      flex: 1,
      justifyContent: 'space-around',
      alignItems: 'center',
      paddingVertical: verticalScale(12),
    },
    swipeCardOverlayIcon: {
      backgroundColor: '#FFFFFF3D',
      padding: scale(10),
      borderRadius: 50,
    },
    swipeCardIcon: {
      width: scale(20),
      height: scale(20),
      resizeMode: 'contain',
    },
    swipeCardActionButtons: {
      flexDirection: 'row',
      justifyContent: 'center',
      alignItems: 'center',
      paddingVertical: verticalScale(20),
      gap: scale(15),
      paddingHorizontal: scale(20),
    },
    swipeCardActionButton: {
      width: scale(56),
      height: scale(56),
      borderRadius: scale(28),
      justifyContent: 'center',
      alignItems: 'center',
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.25,
      shadowRadius: 3.84,
      elevation: 5,
    },
    swipeCardDislikeButton: {
      backgroundColor: '#fff',
    },
  });
};
