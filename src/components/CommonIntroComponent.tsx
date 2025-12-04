import {
  Text,
  View,
  Image,
  FlatList,
  StatusBar,
  StyleSheet,
  ImageBackground,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import React, { useRef, useState } from 'react';

import Video from 'react-native-video';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import Fonts from '../utils/fonts';
import IMAGES from '../assets/images';
import { navigationRef } from '../../App';
import { SCREEN_WIDTH } from '../constants';
import { AppVideos } from '../assets/videos';
import { userState } from '../store/userStore';
import { useThemeStore } from '../store/themeStore';
import { moderateScale, scale, verticalScale } from '../utils/Scale';
import { globalIntroList, logFirebaseEvent } from '../utils/HelperFunction';
import DeviceInfo from 'react-native-device-info';
import CommonPrimaryButton from './buttons/CommonPrimaryButton';
import FastImage from 'react-native-fast-image';

const CommonIntroComponent = ({ currentIndex }: { currentIndex: number }) => {
  const styles = useStyles();
  const insets = useSafeAreaInsets();
  const theme = useThemeStore().theme;

  const videoRefsArray = useRef<any[]>([]);
  const introFlatListRef = useRef<any>(null);
  const [isVideoLoaded, setIsVideoLoaded] = useState(false);
  // const [currentIndex, setCurrentIndex] = useState<number>(0);

  const introList = globalIntroList[currentIndex];

  const onNext = async (item: any) => {
    const deviceId = await DeviceInfo.getUniqueId();
    if (item.id === globalIntroList.length) {
      userState.getState().setUserFirstTime(false);
      navigationRef.current?.reset({
        index: 0,
        routes: [{ name: 'AuthStart' }],
      });
      const eventName = `move_to_startScreen_from_introScreen`;

      logFirebaseEvent(eventName, {
        guest_data: deviceId,
      });
      // Navigate to home screen
    } else {
      // Go to next item
      if (currentIndex < globalIntroList.length - 1) {
        navigationRef.current?.navigate(`IntroScreen${currentIndex + 1}`);
        const eventName = `move_to_introScreen${currentIndex + 1}`;

        logFirebaseEvent(eventName, {
          guest_data: deviceId,
        });
        // setCurrentIndex(currentIndex + 1);
        // Scroll to the next item
        // introFlatListRef.current?.scrollToIndex({
        //   animated: true,
        //   index: currentIndex + 1,
        // });
      }
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar
        backgroundColor="transparent"
        barStyle="dark-content"
        translucent
      />
      <View style={{ flex: 1 }}>
        <View
          key={introList?.id}
          style={{ width: SCREEN_WIDTH, backgroundColor: '#f3ebfc' }}
        >
          <View
            style={{
              width: '100%',
              height: '90%',
              alignSelf: 'baseline',
              backgroundColor: '#f3ebfc',
            }}
          >
            {introList?.video && (
              <>
                {currentIndex == 2 ? (
                  <Video
                    ref={ref => (videoRefsArray.current[currentIndex] = ref)}
                    source={{ uri: introList?.video }}
                    style={{
                      width: '100%',
                      height: '110%',
                      backgroundColor: '#f3ebfc',
                      // marginTop: insets.top,
                    }}
                    controls={false}
                    resizeMode="cover"
                    // paused={currentIndex !== index} // play only if current
                    repeat={true}
                    onLoad={() => setIsVideoLoaded(true)} // set true when loaded
                    onError={e => console.log('Video error', e)}
                  />
                ) : (
                  <FastImage
                    source={introList?.video}
                    style={{ width: '100%', height: '100%' }}
                    onLoadEnd={() => setIsVideoLoaded(true)} // set true when loaded
                    onError={() => setIsVideoLoaded(true)}
                  />
                )}

                {!isVideoLoaded && (
                  <View
                    style={{
                      position: 'absolute',
                      top: 0,
                      left: 0,
                      width: '100%',
                      height: '100%',
                      backgroundColor: '#f3ebfc',
                      justifyContent: 'center',
                      alignItems: 'center',
                    }}
                  >
                    <ActivityIndicator
                      size="large"
                      color={theme.primaryFriend}
                    />
                  </View>
                )}
              </>
            )}
          </View>
        </View>
        <View style={styles.bottomView}>
          <ImageBackground source={IMAGES.intro_bg} style={styles.bottomImage}>
            <View style={styles.bottomContent}>
              <View
                style={{
                  flex: 1,
                  justifyContent: 'center',
                  marginTop: scale(30),
                }}
              >
                <Text style={styles.title}>{introList?.title}</Text>
                <Text style={styles.subtitle}>{introList?.description}</Text>
              </View>
              <View
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  marginBottom: insets.bottom,
                  width: '100%',
                }}
              >
                {currentIndex !== 0 && (
                  <TouchableOpacity
                    style={styles.btnContainerStyle}
                    onPress={() => {
                      navigationRef.current?.goBack();
                    }}
                  >
                    <Image source={IMAGES.back_icon} style={styles.backIcon} />
                  </TouchableOpacity>
                )}
                <CommonPrimaryButton
                  btnStyle={[
                    styles.bottomBtnStyle,
                    { marginLeft: currentIndex == 0 ? 0 : scale(20) },
                  ]}
                  onPress={() => onNext(introList)}
                  title={currentIndex == 2 ? 'Let’s Go' : 'Next'}
                />
              </View>
            </View>
          </ImageBackground>
        </View>
      </View>
    </View>
  );
};

export default CommonIntroComponent;

const useStyles = () => {
  const theme = useThemeStore().theme;
  return StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.card,
    },
    title: {
      fontSize: moderateScale(28),
      textAlign: 'center',
      marginTop: scale(30),
      marginBottom: 10,
      fontFamily: Fonts.ISemiBold,
      color: theme.heading,
    },
    subtitle: {
      fontSize: moderateScale(14),
      textAlign: 'center',
      marginBottom: verticalScale(10),
      marginTop: verticalScale(10),
      fontFamily: Fonts.IRegular,
      color: theme.subText,
    },
    bottomView: {
      position: 'absolute',
      bottom: 0,
      left: 0,
      right: 0,
      height: '40%',
      width: '100%',
    },
    bottomImage: {
      height: '100%',
      width: '100%',
      justifyContent: 'center',
    },
    bottomContent: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      paddingHorizontal: scale(20),
    },
    bottomBtnStyle: {
      flex: 1,
      marginLeft: scale(20),
    },
    bottom1BtnStyle: {
      width: '25%',
      marginBottom: scale(40),
    },
    btnContainerStyle: {
      borderWidth: 1,
      borderRadius: scale(8),
      alignItems: 'center',
      borderColor: theme.primaryFriend,
      padding: scale(15),
    },
    backIcon: {
      width: scale(15),
      height: scale(15),
      tintColor: theme.primaryFriend,
    },
  });
};
