import React, { useState } from 'react';
import { View, StyleSheet, StatusBar } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import WebView from 'react-native-webview';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import CustomTitleWithBack from '../components/CustomTitleWithBackHeader';
import CustomHeader from '../components/headers/CustomHeader';
import CustomActivityIndicator from '../components/CustomActivityIndicator';
import { customColors } from '../utils/Colors';
import { termsAndConditionsURL } from '../constants';
import { useThemeStore } from '../store/themeStore';

const TermsAndConditionsScreen = () => {
  const navigation = useNavigation();
  const [isLoading, setIsLoading] = useState(true);
  const route = useRoute<any>();
  const isTermsScreen = route?.params?.isTerms;
  const styles = useTermsAndConditionsStyles();

  return (
    <View style={styles.container}>
      <StatusBar translucent barStyle="dark-content" />
      <CustomHeader
        containerStyle={{ backgroundColor: 'transparent' }}
        headerLeftComponent={
          <CustomTitleWithBack
            title="Terms & Conditions"
            onPress={() => navigation.goBack()}
          />
        }
      />

      <View style={styles.webViewContainer}>
        {isLoading && <CustomActivityIndicator />}
        <WebView
          source={{ uri: termsAndConditionsURL }}
          onLoadStart={() => setIsLoading(true)}
          onLoadEnd={() => setIsLoading(false)}
          bounces={false}
        />
      </View>
    </View>
  );
};

export default TermsAndConditionsScreen;

const useTermsAndConditionsStyles = () => {
  const insets = useSafeAreaInsets();
  const theme = useThemeStore().theme;
  return StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.primaryBackground,
      paddingBottom: insets.bottom || 0,
    },
    webViewContainer: {
      flex: 1,
    },
  });
};
