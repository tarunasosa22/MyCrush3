import React, { useEffect } from 'react';
import { View, Image, StyleSheet, Dimensions } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  runOnJS,
} from 'react-native-reanimated';
import IMAGES from '../assets/images';

const { width, height } = Dimensions.get('window');

const CustomLikePopup = ({ show, onEnd }: any) => {
  const scale = useSharedValue(0);
  const opacity = useSharedValue(0);

  useEffect(() => {
    if (show) {
      scale.value = withTiming(1.5, { duration: 200 });
      opacity.value = withTiming(1, { duration: 200 }, () => {
        // fade out after delay
        scale.value = withTiming(0, { duration: 1000 });
        opacity.value = withTiming(0, { duration: 1000 }, () => {
          runOnJS(onEnd)();
        });
      });
    }
  }, [show]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    opacity: opacity.value,
  }));

  return (
    <Animated.View style={[styles.popupContainer, animatedStyle]}>
      <Image
        source={IMAGES.like_heart} // your image path
        style={styles.heartImage}
        resizeMode="contain"
      />
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  popupContainer: {
    position: 'absolute',
    top: height / 2 - 60,
    left: width / 2 - 60,
    width: 120,
    height: 120,
    zIndex: 999,
    justifyContent: 'center',
    alignItems: 'center',
  },
  heartImage: {
    width: 100,
    height: 100,
  },
});

export default CustomLikePopup;
