import { StyleSheet, Text, TextInput, View } from 'react-native';
import React, { useState } from 'react';
import { scale } from '../utils/Scale';
import Fonts from '../utils/fonts';
import { useThemeStore } from '../store/themeStore';
import CommonPrimaryButton from './buttons/CommonPrimaryButton';

const CustomCancelPopup = ({
  onClose,
  cancel,
  setCancelTxt,
  cancelTxt,
}: {
  onClose: () => void;
  cancel: () => void;
  setCancelTxt: (txt: string) => void;
  cancelTxt: string;
}) => {
  const styles = useStyles();
  const [hasError, setHasError] = useState<boolean>(false);
  return (
    <View style={styles.cancelPopupContent}>
      <Text style={styles.cancelPopupTitle}>Tell us why are you living?</Text>
      <Text style={styles.cancelPopupDescriptionText}>
        Help us to improve this app so we stop loosing people like you
      </Text>
      <View style={styles.cancelPopupContainer}>
        <View
          style={[
            styles.cancelPopupTextInputContainer,
            { borderColor: hasError ? 'red' : '#D1D1D6' },
          ]}
        >
          <TextInput
            style={styles.cancelPopupTextInput}
            placeholder="Write your message here..."
            placeholderTextColor="#B0B0B0"
            multiline
            value={cancelTxt}
            onChangeText={txt => {
              setCancelTxt(txt);
              setHasError(false);
            }}
          />
        </View>
        <Text style={{ color: 'red', marginTop: 5 }}>
          {hasError ? 'Please write a message' : ''}
        </Text>
      </View>
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: scale(40),
          width: '100%',
        }}
      >
        <CommonPrimaryButton
          btnStyle={styles.cancelPopupBottomBtnStyle}
          onPress={() => onClose()}
          title={'Stay Here'}
        />
        <CommonPrimaryButton
          btnStyle={styles.cancelPopupBottomCancelBtnStyle}
          onPress={() => {
            if (!cancelTxt.length) {
              setHasError(true);
              return;
            }
            setHasError(false);
            cancel();
          }}
          txtStyle={styles.cancelPopupCancelTxt}
          title={'Cancel Now'}
        />
      </View>
    </View>
  );
};

export default CustomCancelPopup;

const useStyles = () => {
  const theme = useThemeStore().theme;
  return StyleSheet.create({
    cancelPopupContent: {
      flex: 1,
      paddingHorizontal: 20,
      paddingTop: 10,
      alignItems: 'center',
    },
    cancelPopupTitle: {
      fontSize: scale(26),
      color: theme.primaryFriend,
      textAlign: 'center',
      marginBottom: 20,
      lineHeight: 32,
      fontFamily: Fonts.ISemiBold,
    },
    cancelPopupDescriptionText: {
      fontSize: 14,
      color: '#6B7280',
      lineHeight: 20,
      textAlign: 'center',
      width: '80%',
    },
    cancelPopupContainer: {
      width: '100%',
      flex: 1,
      margin: scale(16),
    },
    cancelPopupTextInputContainer: {
      width: '100%',
      backgroundColor: theme.bottomTabBackground,
      borderWidth: 1,
      borderColor: '#D1D1D6',
      borderRadius: 12,
      padding: 12,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.08,
      shadowRadius: 6,
      elevation: 2, // for Android shadow
      flex: 1,
    },
    cancelPopupTextInput: {
      fontSize: 15,
      color: '#000',
      textAlignVertical: 'top',
      minHeight: scale(220), // adjusts the height like in your image
    },
    cancelPopupBottomBtnStyle: {
      width: '48%',
      paddingHorizontal: scale(20),
    },
    cancelPopupBottomCancelBtnStyle: {
      width: '48%',
      paddingHorizontal: scale(20),
      backgroundColor: theme.bottomTabBackground,
      borderWidth: 1,
      borderColor: theme.primaryFriend,
    },
    cancelPopupCancelTxt: {
      color: theme.primaryFriend,
    },
  });
};
