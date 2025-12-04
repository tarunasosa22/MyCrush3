import {
  ActivityIndicator,
  Image,
  ImageBackground,
  ImageStyle,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  ViewStyle,
} from 'react-native';
import React, { useState } from 'react';
import { useThemeStore } from '../store/themeStore';
import { scale } from '../utils/Scale';
import IMAGES from '../assets/images';
import CustomActivityIndicator from './CustomActivityIndicator';
import FastImage from 'react-native-fast-image';

interface props {
  imageStyle?: ViewStyle;
  containerStyle?: ViewStyle;
  disabled?: boolean;
  onPress?: () => void;
  image?: string;
  loadImage?: string;
  isAppIcon?: boolean;
  loadingPlaceholderStyle?: ViewStyle;
  size?: 'small' | 'large' | undefined;
}

const CommonImagePlaceHolder = (props: props) => {
  const {
    containerStyle,
    onPress,
    disabled,
    imageStyle,
    image,
    loadImage,
    loadingPlaceholderStyle,
    size,
    isAppIcon,
  } = props;
  const styles = useStyles();
  const [isLoading, setIsLoading] = useState(false);
  const [hasError, setHasError] = useState(false);
  return (
    <TouchableOpacity
      style={[styles.container, imageStyle]}
      disabled={disabled || hasError}
      onPress={onPress}
    >
      {/* <ImageBackground
        source={image ? { uri: image } : IMAGES.app_icon_bg}
        style={[styles.image, imageStyle]}
        onLoadStart={() => setLoading(true)}
        onLoadEnd={() => setLoading(false)}
        onError={() => setLoading(false)}
      >
        {image && loading && <CustomActivityIndicator size={size} />}
        <Image
          source={loadImage ?? IMAGES.app_icon_bg}
          style={[
            styles.loadingPlaceholder,
            loadingPlaceholderStyle as ImageStyle,
          ]}
          resizeMode="cover"
        />
      </ImageBackground> */}
      {image ? (
        <View style={styles.imageWrapper}>
          {isLoading && (
            <View style={styles.loadingContainer}>
              <Image
                source={IMAGES.app_icon}
                style={styles.loadingImage}
                resizeMode="cover"
              />
              <View style={styles.loadingOverlay}>
                <CustomActivityIndicator size="small" />
              </View>
            </View>
          )}
          <View style={styles.loadingContainer}>
            <Image
              source={isAppIcon ? IMAGES.app_icon : IMAGES.app_splash_view}
              style={styles.loadingImage}
              resizeMode="cover"
            />
          </View>
          <FastImage
            source={{
              uri: image,
            }}
            style={styles.image}
            onLoad={() => setIsLoading(true)}
            onError={() => {
              setIsLoading(false);
              setHasError(true);
            }}
          />
        </View>
      ) : (
        <View style={styles.loadingContainer}>
          <Image
            source={isAppIcon ? IMAGES.app_icon : IMAGES.app_splash_view}
            style={styles.loadingImage}
            resizeMode="cover"
          />
        </View>
      )}
    </TouchableOpacity>
  );
};

export default CommonImagePlaceHolder;

const useStyles = () => {
  const theme = useThemeStore().theme;
  return StyleSheet.create({
    container: {
      width: scale(10),
      height: scale(10),
      borderRadius: scale(100),
      backgroundColor: theme.secondaryFriend,
      overflow: 'hidden',
    },
    imageWrapper: {
      width: '100%',
      overflow: 'hidden',
      position: 'relative',
    },
    loadingContainer: {
      position: 'absolute',
      width: '100%',
      height: '100%',
      overflow: 'hidden',
      zIndex: -1,
    },
    loadingImage: {
      width: '100%',
      height: '100%',
      opacity: 0.8,
    },
    image: {
      width: '100%',
      height: '100%',
      resizeMode: 'cover',
    },
    loadingPlaceholder: {
      ...StyleSheet.absoluteFillObject,
      width: '100%',
      height: '100%',
      zIndex: -1,
    },
    loadingOverlay: {
      position: 'absolute',
      width: '100%',
      height: '100%',
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: 'rgba(0,0,0,0.4)',
    },
  });
};
