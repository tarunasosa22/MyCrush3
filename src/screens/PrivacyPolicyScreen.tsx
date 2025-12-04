import React, { useState } from 'react';
import { View, StyleSheet, Text, SafeAreaView, StatusBar } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import WebView from 'react-native-webview';

import CustomTitleWithBack from '../components/CustomTitleWithBackHeader';
import CustomHeader from '../components/headers/CustomHeader';
import CustomActivityIndicator from '../components/CustomActivityIndicator';
import { customColors } from '../utils/Colors';
import { privacyPolicyURL, termsAndConditionsURL } from '../constants';
import { useThemeStore } from '../store/themeStore';

const PrivacyPolicyScreen = () => {
  const navigation = useNavigation();
  const route = useRoute<any>();
  const [isLoading, setIsLoading] = useState(true);
  const insets = useSafeAreaInsets();
  const isTermsScreen = route?.params?.isTerms;
  const styles = Styles();
  return (
    <View style={[styles.container, { paddingBottom: insets.bottom || 0 }]}>
      <StatusBar translucent barStyle="dark-content" />

      <CustomHeader
        containerStyle={{ backgroundColor: 'transparent' }}
        headerLeftComponent={
          <CustomTitleWithBack
            title={isTermsScreen ? 'Terms & Conditions' : 'Privacy Policy'}
            onPress={() => navigation.goBack()}
          />
        }
      />

      <View style={styles.webViewWrapper}>
        {isLoading && <CustomActivityIndicator />}
        <WebView
          source={{
            uri: isTermsScreen ? termsAndConditionsURL : privacyPolicyURL,
          }}
          onLoadStart={() => setIsLoading(true)}
          onLoadEnd={() => setIsLoading(false)}
          bounces={false}
        />
      </View>
    </View>
  );
};

export default PrivacyPolicyScreen;

const Styles = () => {
  const theme = useThemeStore().theme;
  return StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.primaryBackground,
    },
    webViewWrapper: {
      flex: 1,
    },
  })
};
