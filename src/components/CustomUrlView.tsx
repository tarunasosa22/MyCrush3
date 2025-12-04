// LegalLinksNotice.tsx

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { navigationRef } from '../../App';
import { moderateScale, verticalScale } from '../utils/Scale';
import Fonts from '../utils/fonts';
import { useThemeStore } from '../store/themeStore';

interface CustomUrlViewProps {
  onLinkPress: () => void;
  onRestorePress: () => void;
}

const CustomUrlView: React.FC<CustomUrlViewProps> = ({
  onLinkPress,
  onRestorePress,
}) => {
  const styles = useStyles();

  const handleUrlViewPrivacyPolicyPress = () => {
    onLinkPress();
  };

  const handleUrlViewTermsConditionsPress = () => {
    onLinkPress();
  };

  return (
    <View style={styles.urlViewContainer}>
      <Text
        onPress={handleUrlViewPrivacyPolicyPress}
        style={styles.urlViewPrivacyText}
      >
        Privacy Policy
      </Text>
      <Text
        style={styles.urlViewPrivacyText}
        onPress={() => {
          onRestorePress();
        }}
      >
        Restore Purchase
      </Text>
      <Text
        onPress={handleUrlViewTermsConditionsPress}
        style={styles.urlViewPrivacyText}
      >
        Terms and Conditions
      </Text>
    </View>
  );
};

const useStyles = () => {
  const theme = useThemeStore().theme;
  return StyleSheet.create({
    urlViewContainer: {
      marginVertical: verticalScale(10),
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    urlViewText: {
      textAlign: 'center',
      fontSize: 12,
      color: 'gray',
      lineHeight: 20,
    },
    urlViewPrivacyText: {
      fontSize: moderateScale(12),
      fontFamily: Fonts.IBold,
      color: theme.primaryFriend,
      marginBottom: verticalScale(10),
    },
  });
};

export default CustomUrlView;
