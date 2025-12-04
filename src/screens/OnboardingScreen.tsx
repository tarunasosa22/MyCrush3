import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
  Image,
  StatusBar,
} from 'react-native';

import {
  useIsFocused,
  useNavigation,
  useRoute,
} from '@react-navigation/native';
import {
  BottomSheetBackdrop,
  BottomSheetBackdropProps,
  BottomSheetView,
} from '@gorhom/bottom-sheet';
import CustomBottomSheet, {
  CommonBottomSheetRef,
} from '../components/CommonBottomSheet';
import { t } from 'i18next';

import { useThemeStore } from '../store/themeStore';
import { scale, verticalScale, moderateScale } from '../utils/Scale';
import { genderCategories } from '../api/user';
import { userState } from '../store/userStore';
import { AvatarCategory, useCategoryStore } from '../store/categoryStore';
import Fonts from '../utils/fonts';

import IMAGES from '../assets/images';
import CustomHeader from '../components/headers/CustomHeader';
import CustomActivityIndicator from '../components/CustomActivityIndicator';
import { TranslationKeys } from '../lang/TranslationKeys';
import AppConstant from '../utils/AppConstant';
import { BackHandler } from 'react-native';
import CommonLinearContainer from '../components/CommonLinearContainer';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import CommonOnBoardingPopup from '../components/CommonOnBoardingPopup';

const OnboardingScreen = () => {
  const isScreenFocused = useIsFocused();
  const navigation = useNavigation<any>();
  const { userData } = userState();
  const { theme, setTheme, themeName } = useThemeStore();
  const bottomSheetRef = useRef<CommonBottomSheetRef>(null);
  const [index, setIndex] = useState(0);
  const glowAnim = useRef(new Animated.Value(0)).current;
  const avatarAnims = useRef(
    Array.from({ length: 8 }, () => new Animated.Value(0)),
  ).current;
  const insets = useSafeAreaInsets();
  const ringAnim1 = useRef(new Animated.Value(0)).current;
  const ringAnim2 = useRef(new Animated.Value(0)).current;
  const ringAnim3 = useRef(new Animated.Value(0)).current;
  const ringAnim4 = useRef(new Animated.Value(0)).current;

  const ringRotation1 = useRef(new Animated.Value(0)).current;
  const ringRotation2 = useRef(new Animated.Value(0)).current;
  const ringRotation3 = useRef(new Animated.Value(0)).current;
  const ringRotation4 = useRef(new Animated.Value(0)).current;

  const orbitRotation1 = useRef(new Animated.Value(0)).current;
  const orbitRotation2 = useRef(new Animated.Value(0)).current;

  const [showAvatars, setShowAvatars] = useState(false);
  const [visibleAvatars, setVisibleAvatars] = useState<number[]>([]);
  const [visible, setVisible] = useState(false);

  const [isLoading, setIsLoading] = useState(false);
  const { setCategories, setFetchCategory, fetchCategory, setPersonaId } =
    useCategoryStore();
  const onboardingStyles = OnboardingScreenStyles();
  // const fetchCategory = [];

  const handleBackAction = () => {
    setTheme('girlfriend');
    bottomSheetRef?.current?.close();
    navigation.goBack();
    return true; // prevent default behavior
  };
  useEffect(() => {
    setTimeout(() => {
      userState.getState().setSplashState(false);
    }, 3000);
    const backHandler = BackHandler.addEventListener(
      'hardwareBackPress',
      handleBackAction,
    );

    return () => backHandler.remove(); // cleanup on unmount
  }, []);

  const fetchGenderCategories = async () => {
    try {
      setIsLoading(true);
      await genderCategories().then(res => {
        const genderCategoriesData = res?.data?.data?.results;
        const rawCategoryList = res.data?.data?.results?.[0]?.categories || [];
        const filteredCategories = rawCategoryList?.filter(
          (cat: AvatarCategory) =>
            Array.isArray(cat.sub_categories) && cat.sub_categories.length > 0,
        );

        setFetchCategory(genderCategoriesData);
      });
    } catch (err) {
      setIsLoading(false);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchGenderCategories();
  }, []);

  useEffect(() => {
    console.log('first------');
    useCategoryStore.getState().setSummeryList([]);
    useCategoryStore.getState().setCurrentIndex(0);
  }, [isScreenFocused]);

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(glowAnim, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: false,
        }),
        Animated.timing(glowAnim, {
          toValue: 0,
          duration: 1000,
          useNativeDriver: false,
        }),
      ]),
    ).start();

    Animated.sequence([
      Animated.timing(ringAnim1, {
        toValue: 1,
        duration: 400,
        useNativeDriver: false,
      }),
      Animated.timing(ringAnim2, {
        toValue: 1,
        duration: 400,
        useNativeDriver: false,
      }),
      Animated.timing(ringAnim3, {
        toValue: 1,
        duration: 400,
        useNativeDriver: false,
      }),
      Animated.timing(ringAnim4, {
        toValue: 1,
        duration: 400,
        useNativeDriver: false,
      }),
    ]).start(() => {
      setShowAvatars(true);

      const startRotationLoop = (anim: Animated.Value, duration: number) =>
        Animated.loop(
          Animated.timing(anim, {
            toValue: 1,
            duration,
            useNativeDriver: false,
          }),
        ).start();

      startRotationLoop(ringRotation1, 20000);
      startRotationLoop(ringRotation2, 15000);
      startRotationLoop(ringRotation3, 25000);
      startRotationLoop(ringRotation4, 30000);
      startRotationLoop(orbitRotation1, 20000);
      startRotationLoop(orbitRotation2, 15000);

      avatarAnims.forEach((anim, index) => {
        setTimeout(() => {
          setVisibleAvatars(prev => [...prev, index]);
          Animated.loop(
            Animated.sequence([
              Animated.timing(anim, {
                toValue: 1,
                duration: 700 + index * 10 + Math.random() * 300,
                useNativeDriver: false,
              }),
              Animated.timing(anim, {
                toValue: 0,
                duration: 700,
                useNativeDriver: false,
              }),
            ]),
          ).start();
        }, index * 150);
      });
    });
  }, []);

  const navigateToCreateAvatar = async () => {
    const selectedCategoryItem = fetchCategory?.[index];
    const selectedCategoryData = selectedCategoryItem.categories || [];
    const filteredCategories = selectedCategoryData.filter(
      (cat: AvatarCategory) =>
        Array.isArray(cat.sub_categories) && cat.sub_categories.length > 0,
    );
    setCategories(filteredCategories);
    bottomSheetRef.current?.close();
    // setTimeout(() => {
    // navigation.navigate(AppConstant.createAvatar);
    navigation.navigate(AppConstant.createAvatarStep0);

    // }, 300);
  };

  const renderOrbitingAvatars = (
    count: number,
    radius: number,
    startIndex = 0,
    orbitRotation?: Animated.Value,
  ) => {
    const orbitRotationValue =
      orbitRotation?.interpolate({
        inputRange: [0, 1],
        outputRange: ['0deg', '360deg'],
      }) || '0deg';

    return (
      <Animated.View
        style={[
          onboardingStyles.orbitViewContainer,
          { transform: [{ rotate: orbitRotationValue }] },
        ]}
      >
        {Array.from({ length: count }).map((_, i) => {
          const animIndex = startIndex + i;
          if (!visibleAvatars.includes(animIndex)) return null;

          const angle = (i / count) * 2 * Math.PI;
          const x = Math.cos(angle) * radius;
          const y = Math.sin(angle) * radius;

          const avatarScaleAnimation = avatarAnims[animIndex].interpolate({
            inputRange: [0, 1],
            outputRange: [1, 1.3],
          });

          const counterRotationValue =
            orbitRotation?.interpolate({
              inputRange: [0, 1],
              outputRange: ['0deg', '-360deg'],
            }) || '0deg';

          return (
            <Animated.View
              key={`avatar-${animIndex}`}
              style={[
                onboardingStyles.avatarWrapper,
                {
                  transform: [
                    { translateX: x },
                    { translateY: y },
                    { rotate: counterRotationValue },
                    { scale: avatarScaleAnimation },
                  ],
                },
              ]}
            >
              {(animIndex == 5 || animIndex == 2) && count == 7 ? (
                <Image
                  source={
                    animIndex == 5
                      ? IMAGES.onboarding_icon1
                      : IMAGES.onboarding_icon2
                  }
                  style={[
                    onboardingStyles.avatarImage,
                    {
                      backgroundColor: 'transparent',
                      borderColor: theme.secondayBackground,
                      width: scale(40),
                      height: scale(30),
                      resizeMode: 'contain',
                    },
                  ]}
                />
              ) : (
                <Image
                  source={{
                    uri: `https://randomuser.me/api/portraits/${
                      animIndex % 2 === 1 ? 'women' : 'men'
                    }/${10 + animIndex}.jpg`,
                  }}
                  style={onboardingStyles.avatarImage}
                />
              )}
            </Animated.View>
          );
        })}
      </Animated.View>
    );
  };

  const renderBottomSheetBackdrop = useCallback(
    (props: BottomSheetBackdropProps) => (
      <BottomSheetBackdrop
        {...props}
        pressBehavior={'close'}
        disappearsOnIndex={-1}
        appearsOnIndex={0}
        opacity={0.4}
        style={{
          height: '100%',
          width: '100%',
          position: 'absolute',
          zIndex: 6,
        }}
      />
    ),
    [],
  );

  return (
    <>
      {isLoading ? <CustomActivityIndicator /> : null}
      <StatusBar
        translucent
        barStyle={'dark-content'}
        backgroundColor={theme.primaryBackground}
      />
      <CommonLinearContainer
        containerStyle={onboardingStyles.screenContainer}
        colors={[theme.card, theme.secondayBackground, theme.primaryBackground]}
      >
        <CustomHeader
          headerLeftComponent={
            !(userData?.avatar && Object.keys(userData.avatar).length) ? (
              <Text
                style={[
                  onboardingStyles.headerTitle,
                  { color: theme.primaryFriend },
                ]}
              ></Text>
            ) : (
              <TouchableOpacity
                style={{ alignSelf: 'flex-start' }}
                onPress={() => handleBackAction()}
              >
                <Image
                  source={IMAGES.back_icon}
                  style={{
                    width: scale(20),
                    height: scale(20),
                    tintColor: theme.primaryFriend,
                  }}
                />
              </TouchableOpacity>
            )
          }
          headerCenterComponent={
            <Text
              style={[
                onboardingStyles.headerTitle,
                { color: theme.primaryFriend },
              ]}
            >
              {t(TranslationKeys.AI_CRUSH)}
            </Text>
          }
          headerRightComponent={
            <Text
              style={[
                onboardingStyles.headerTitle,
                { color: theme.primaryFriend },
              ]}
            ></Text>
          }
          containerStyle={{
            backgroundColor: 'transparent',
          }}
        />

        {/* <View style={onboardingStyles.logoImageContainer}> */}
        {/* <Animated.View
            style={[
              onboardingStyles.middleRing,
              {
                opacity: ringAnim2,
                transform: [{ scale: ringAnim2 }],
                backgroundColor: theme.card,
              },
            ]}
          />
          <Animated.View
            style={[
              onboardingStyles.innerRing,
              {
                opacity: ringAnim3,
                transform: [{ scale: ringAnim3 }],
                backgroundColor: '#ffffff',
              },
            ]}
          />
          <Animated.View
            style={[
              onboardingStyles.dashedRing,
              {
                opacity: ringAnim4,
                borderColor: theme.primaryFriend,
              },
            ]}
          /> */}

        {/* {showAvatars && (
            <View style={onboardingStyles.orbitContainerWrapper}>
              {renderOrbitingAvatars(7, scale(160), 0, orbitRotation1)}
              {renderOrbitingAvatars(2, scale(90), 6, orbitRotation2)}
              <Image
                source={{
                  uri: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1',
                }}
                style={onboardingStyles.centerAvatarImage}
              />
            </View>
          )} */}
        <Image
          source={IMAGES.onboarding_logo}
          style={onboardingStyles.logoImageContainer}
        />

        <View>
          <Text
            style={[onboardingStyles.mainHeading, { color: theme.heading }]}
          >
            Are you Looking for?
          </Text>
          <Text
            style={[onboardingStyles.descriptionText, { color: theme.text }]}
          >
            Choose who you're looking for and start exploring AI companions made
            just for you.
          </Text>
        </View>
        <View
          style={{
            width: '100%',
            justifyContent: 'center',
            alignItems: 'center',
            paddingBottom: insets.bottom > 0 ? insets.bottom : 10,
          }}
        >
          {fetchCategory?.length !== 0 &&
            fetchCategory?.map((item, index) => {
              const isLastItem = index === fetchCategory.length - 1;
              return (
                <TouchableOpacity
                  key={item?.code || index}
                  style={[
                    onboardingStyles.categoryButton,
                    {
                      backgroundColor:
                        item.code == 'girlfriend'
                          ? theme.girlFriend
                          : theme.boyFriend,
                      marginBottom: isLastItem ? insets.bottom : 0,
                    },
                  ]}
                  onPress={() => {
                    setTheme(item?.code || themeName);
                    setIndex(index);
                    setPersonaId(item?.id);
                    setVisible(true);
                    // bottomSheetRef.current?.snapToIndex(1);
                  }}
                >
                  <Text style={onboardingStyles.categoryButtonText}>
                    {item?.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
        </View>

        {/* <CustomBottomSheet
          ref={bottomSheetRef}
          snapPoints={['100%']}
          index={-1}
          enablePanDownToClose={true}
          animateOnMount={false}
          containerStyle={{ zIndex: 7, flex: 1 }}
          backgroundStyle={{
            backgroundColor: theme.primaryBackground,
            borderTopLeftRadius: scale(0),
            borderTopRightRadius: scale(0),
          }}
          backdropComponent={renderBottomSheetBackdrop}
          onChange={index => {
            // if (index === -1) {
            //   setTheme('girlfriend');
            //   // setTheme(item.code || themeName);
            // }
          }}
        >
          <ImageBackground
            source={IMAGES.onboarding_model_logo}
            style={{ flex: 1, width: '100%', height: '100%' }}
            resizeMode="cover"
          ></ImageBackground>
        </CustomBottomSheet> */}
      </CommonLinearContainer>
      <CommonOnBoardingPopup
        visible={visible}
        onClose={() => {
          setVisible(false);
        }}
        onPress={() => {
          setVisible(false);
          navigateToCreateAvatar();
        }}
      />
    </>
  );
};

export default OnboardingScreen;

const OnboardingScreenStyles = () => {
  const theme = useThemeStore().theme;

  return StyleSheet.create({
    screenContainer: {
      flex: 1,
      // alignItems: 'center',
      justifyContent: 'space-between',
      // paddingTop: verticalScale(20),
      backgroundColor: theme.secondayBackground,
    },
    headerTitle: {
      fontSize: moderateScale(36),
      fontFamily: Fonts.ISemiBold,
      // marginBottom: verticalScale(30),
    },
    logoImageContainer: {
      width: '100%',
      height: verticalScale(360),
      justifyContent: 'center',
      alignItems: 'center',
      marginBottom: verticalScale(20),
    },
    middleRing: {
      width: scale(200),
      height: scale(200),
      borderRadius: scale(100),
      position: 'absolute',
      opacity: 1,
    },
    innerRing: {
      width: scale(120),
      height: scale(120),
      borderRadius: scale(60),
      backgroundColor: theme.white,
      position: 'absolute',
    },
    dashedRing: {
      width: scale(330),
      height: scale(330),
      borderRadius: scale(165),
      borderWidth: 1.5,
      borderStyle: 'dashed',
      position: 'absolute',
    },
    orbitContainerWrapper: {
      position: 'absolute',
      width: scale(330),
      height: scale(330),
      justifyContent: 'center',
      alignItems: 'center',
    },
    orbitViewContainer: {
      position: 'absolute',
      width: '100%',
      height: '100%',
      justifyContent: 'center',
      alignItems: 'center',
    },
    avatarWrapper: {
      position: 'absolute',
    },
    avatarImage: {
      width: scale(45),
      height: scale(45),
      borderRadius: scale(22.5),
      borderWidth: 2,
      borderColor: theme.white,
      backgroundColor: '#ccc',
    },
    centerAvatarImage: {
      width: scale(70),
      height: scale(70),
      borderRadius: scale(35),
      borderWidth: 2,
      borderColor: theme.white,
    },
    mainHeading: {
      fontSize: moderateScale(24),
      fontWeight: '600',
      fontFamily: Fonts.ISemiBold,
      textAlign: 'center',
      marginTop: verticalScale(10),
      marginBottom: verticalScale(8),
    },
    descriptionText: {
      fontSize: moderateScale(16),
      textAlign: 'center',
      paddingHorizontal: scale(25),
      marginBottom: verticalScale(30),
      fontFamily: Fonts.IMedium,
    },
    categoryButton: {
      width: '70%',
      height: verticalScale(56),
      borderRadius: moderateScale(10),
      justifyContent: 'center',
      alignItems: 'center',
      shadowColor: theme.girlFriend,
      shadowOffset: { width: 0, height: 6 },
      shadowOpacity: 0.3,
      shadowRadius: 10,
      elevation: 6,
      backgroundColor: theme.girlFriend,
      marginTop: verticalScale(16),
    },
    categoryButtonSecondary: {
      width: '70%',
      height: verticalScale(54),
      borderRadius: moderateScale(10),
      justifyContent: 'center',
      alignItems: 'center',
      shadowColor: theme.boyFriend,
      shadowOffset: { width: 0, height: 6 },
      shadowOpacity: 0.3,
      shadowRadius: 10,
      elevation: 6,
      backgroundColor: theme.boyFriend,
    },
    categoryButtonText: {
      fontSize: moderateScale(20),
      color: '#fff',
      fontFamily: Fonts.IMedium,
    },
    bottomSheetTitle: {
      fontSize: moderateScale(30),
      textAlign: 'center',
      marginTop: scale(30),
      marginBottom: 10,
      fontFamily: Fonts.ISemiBold,
      color: theme.heading,
    },
    bottomSheetSubtitle: {
      fontSize: moderateScale(14),
      textAlign: 'center',
      marginBottom: verticalScale(20),
      marginTop: verticalScale(10),
      fontFamily: Fonts.IRegular,
      color: theme.text,
    },
    continueButton: {
      width: '100%',
      height: verticalScale(50),
      borderRadius: moderateScale(10),
      justifyContent: 'center',
      alignItems: 'center',
      marginTop: verticalScale(10),
      backgroundColor: theme.primaryFriend,
    },
    continueButtonText: {
      color: theme.white,
      fontSize: moderateScale(16),
      fontFamily: Fonts.IMedium,
    },
    logoImage: {
      width: '100%',
      // flex: 1,
      height: '100%',
      resizeMode: 'cover',
    },
  });
};
