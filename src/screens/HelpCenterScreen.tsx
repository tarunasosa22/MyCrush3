import { View, StyleSheet, StatusBar } from 'react-native';
import React, { useState } from 'react';
import { useNavigation } from '@react-navigation/native';
import CustomTitleWithBackHeader from '../components/CustomTitleWithBackHeader';
import CustomHeader from '../components/headers/CustomHeader';
import WebView from 'react-native-webview';
import { customColors } from '../utils/Colors';
import CustomActivityIndicator from '../components/CustomActivityIndicator';
import { privacyPolicyURL } from '../constants';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const HelpCenterScreen = () => {
  const navigation = useNavigation();
  const [isLoading, setIsLoading] = useState(true);
  const helpCenterStyles = HelpCenterScreenStyles();

  return (
    <>
      {isLoading ? <CustomActivityIndicator /> : null}
      <View style={helpCenterStyles.screenContainer}>
        <StatusBar translucent barStyle={'dark-content'} />
        <CustomHeader
          containerStyle={{ backgroundColor: '#00000000' }}
          headerLeftComponent={
            <CustomTitleWithBackHeader
              title={'Help Center'}
              onPress={() => navigation.goBack()}
            />
          }
        />

        <View style={helpCenterStyles.webViewContainer}>
          <WebView
            source={{
              uri: privacyPolicyURL,
            }}
            onLoadStart={() => setIsLoading(true)}
            onLoadEnd={() => setIsLoading(false)}
            bounces={false}
          />
        </View>
      </View>
    </>
  );
};

export default HelpCenterScreen;

const HelpCenterScreenStyles = () => {
  const insets = useSafeAreaInsets();
  return StyleSheet.create({
    screenContainer: {
      flex: 1,
      backgroundColor: customColors.white,
      paddingBottom: insets.bottom > 0 ? insets.bottom : 0,
    },
    webViewContainer: {
      flex: 1,
    },
  });
};
