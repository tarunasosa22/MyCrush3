import React from 'react';
import {
  Alert,
  Image,
  Modal,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { useThemeStore } from '../store/themeStore';
import { scale } from '../utils/Scale';
import Fonts from '../utils/fonts';
import IMAGES from '../assets/images';

interface AppModalProps {
  visible: boolean;
  title: string;
  onClose: () => void;
  showCloseButton?: boolean;
  children?: React.ReactNode;
}

const CustomAppModel: React.FC<AppModalProps> = ({
  visible,
  title,
  onClose,
  showCloseButton = true,
  children,
}) => {
  const styles = useStyles();
  const theme = useThemeStore().theme;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.appModalContainer}>
        <View style={styles.appModalContent}>
          <View
            style={{
              flexDirection: showCloseButton ? 'row' : 'column',
              alignItems: 'center',
              width: '100%',
              justifyContent: 'space-between',
              // backgroundColor: 'red',
            }}
          >
            <Text style={[styles.appModalTitle, { alignSelf: 'center' }]}>
              {title}
            </Text>
            {showCloseButton && (
              <TouchableOpacity onPress={onClose}>
                <Image
                  source={IMAGES.close}
                  style={{
                    width: scale(30),
                    height: scale(30),
                    tintColor: theme.primaryFriend,
                    right: 0,
                  }}
                />
              </TouchableOpacity>
            )}
          </View>
          <View style={styles.appModalDivider} />
          {children}
        </View>
      </View>
    </Modal>
  );
};

export default CustomAppModel;

const useStyles = () => {
  const theme = useThemeStore().theme;

  return StyleSheet.create({
    appModalContainer: {
      flex: 1,
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      justifyContent: 'center',
      alignItems: 'center',
    },
    appModalContent: {
      width: '85%',
      backgroundColor: theme.primaryBackground,
      borderRadius: scale(10),
      padding: scale(10),
      alignItems: 'center',
      shadowColor: theme.primaryFriend,
      shadowOffset: {
        width: 0,
        height: 2,
      },
      shadowOpacity: 0.25,
      shadowRadius: 3.84,
      elevation: 5,
    },
    appModalTitle: {
      color: theme.text,
      fontSize: scale(20),
      fontFamily: Fonts.IBold,
      marginBottom: scale(8.55),
    },
    appModalDivider: {
      width: scale(150),
      backgroundColor: theme.primaryFriend,
      height: scale(2),
      borderRadius: 100,
      marginBottom: scale(16.45),
    },
    // input: {
    //   width: '100%',
    //   borderRadius: wp(2),
    //   padding: wp(3),
    //   color: '#878787',
    //   fontFamily: Fonts.FONT_POP_REGULAR,
    //   fontSize: font(14),
    //   textAlignVertical: 'top',
    //   borderWidth: f2w(1),
    //   borderColor: '#7f7f7f',
    //   height: f2h(100),
    // },
    // doneButton: {
    //   width: f2w(110),
    //   height: f2h(42),
    //   borderRadius: f2h(42) / 2,
    //   marginTop: hp(3),
    // },
    // buttonContent: {
    //   width: '100%',
    //   height: '100%',
    //   justifyContent: 'center',
    //   alignItems: 'center',
    // },
    // buttonText: {
    //   color: theme.WHITE,
    //   fontSize: font(16),
    //   fontFamily: Fonts.FONT_POP_MEDIUM,
    // },
    // closeButton: {
    //   width: f2h(42),
    //   height: f2h(42),
    //   borderRadius: f2h(42) / 2,
    //   justifyContent: 'center',
    //   alignItems: 'center',
    //   marginTop: f2h(20),
    // },
    // closeIcon: {
    //   width: f2w(15.3),
    //   height: f2h(15.3),
    // },

    // microphoneIcon: {
    //   width: f2w(50),
    //   height: f2h(50),
    //   marginBottom: f2h(42),
    //   marginTop: f2h(38),
    // },
  });
};
