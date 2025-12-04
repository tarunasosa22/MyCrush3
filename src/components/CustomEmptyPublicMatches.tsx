import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  Dimensions,
} from 'react-native';
import { scale, verticalScale } from '../utils/Scale';
import Fonts from '../utils/fonts';
import IMAGES from '../assets/images';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

interface EmptyMatchesProps {
  onRefresh: () => void;
  loading?: boolean;
}

const EmptyMatchesState: React.FC<EmptyMatchesProps> = ({
  onRefresh,
  loading = false,
}) => {
  const styles = useStyles();
  return (
    <View style={styles.emptyPublicMatchesContainer}>
      <View style={styles.emptyPublicMatchesContentBox}>
        {/* Icon Container */}
        <View style={styles.emptyPublicMatchesIconContainer}>
          <View style={styles.emptyPublicMatchesIconBackground}>
            <Image
              source={IMAGES.heart} // You can replace with a sad emoji or custom icon
              style={styles.emptyPublicMatchesIcon}
              resizeMode="contain"
            />
          </View>
        </View>

        {/* Text Content */}
        <View style={styles.emptyPublicMatchesTextContainer}>
          <Text style={styles.emptyPublicMatchesTitleText}>Oh Sorry!</Text>
          <Text style={styles.emptyPublicMatchesMessageText}>
            You don't have another choice right now.{'\n'}
            Please refresh to get your match.
          </Text>
        </View>

        {/* Refresh Button */}
        <TouchableOpacity
          style={[
            styles.emptyPublicMatchesRefreshButton,
            loading && styles.emptyPublicMatchesDisabledButton,
          ]}
          onPress={onRefresh}
          disabled={loading}
          activeOpacity={0.8}
        >
          <Image
            source={IMAGES.refresh_icon} // Add refresh icon to your IMAGES
            style={styles.emptyPublicMatchesRefreshIcon}
            resizeMode="contain"
          />
          <Text style={styles.emptyPublicMatchesRefreshButtonText}>
            {loading ? 'Loading...' : 'Refresh'}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default EmptyMatchesState;

const useStyles = () => {
  return StyleSheet.create({
    emptyPublicMatchesContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      paddingHorizontal: scale(20),
    },
    emptyPublicMatchesContentBox: {
      width: '100%',
      maxWidth: scale(340),
      backgroundColor: '#FFFFFF',
      borderRadius: scale(24),
      paddingVertical: verticalScale(40),
      paddingHorizontal: scale(30),
      alignItems: 'center',
      shadowColor: '#000',
      shadowOffset: {
        width: 0,
        height: 4,
      },
      shadowOpacity: 0.1,
      shadowRadius: 12,
      elevation: 8,
      borderWidth: 1,
      borderColor: '#F0F0F0',
    },
    emptyPublicMatchesIconContainer: {
      marginBottom: verticalScale(24),
    },
    emptyPublicMatchesIconBackground: {
      width: scale(80),
      height: scale(80),
      borderRadius: scale(40),
      backgroundColor: '#FFF0F3',
      justifyContent: 'center',
      alignItems: 'center',
      borderWidth: 2,
      borderColor: '#FFE0E6',
    },
    emptyPublicMatchesIcon: {
      width: scale(40),
      height: scale(40),
      tintColor: '#FF4458',
      opacity: 0.8,
    },
    emptyPublicMatchesTextContainer: {
      alignItems: 'center',
      marginBottom: verticalScale(32),
    },
    emptyPublicMatchesTitleText: {
      fontSize: scale(28),
      fontFamily: Fonts.IBold,
      color: '#1A1A1A',
      marginBottom: verticalScale(12),
      textAlign: 'center',
    },
    emptyPublicMatchesMessageText: {
      fontSize: scale(15),
      fontFamily: Fonts.IRegular,
      color: '#666666',
      textAlign: 'center',
      lineHeight: scale(22),
      paddingHorizontal: scale(10),
    },
    emptyPublicMatchesRefreshButton: {
      flexDirection: 'row',
      backgroundColor: '#FF4458',
      paddingHorizontal: scale(32),
      paddingVertical: verticalScale(14),
      borderRadius: scale(28),
      alignItems: 'center',
      justifyContent: 'center',
      shadowColor: '#FF4458',
      shadowOffset: {
        width: 0,
        height: 4,
      },
      shadowOpacity: 0.3,
      shadowRadius: 8,
      elevation: 6,
      minWidth: scale(160),
    },
    emptyPublicMatchesDisabledButton: {
      opacity: 0.6,
    },
    emptyPublicMatchesRefreshIcon: {
      width: scale(20),
      height: scale(20),
      tintColor: '#FFFFFF',
      marginRight: scale(8),
    },
    emptyPublicMatchesRefreshButtonText: {
      color: '#FFFFFF',
      fontSize: scale(16),
      fontFamily: Fonts.IBold,
      letterSpacing: 0.5,
    },
  });
};
