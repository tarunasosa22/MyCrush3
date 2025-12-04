import {
  Alert,
  FlatList,
  Linking,
  PermissionsAndroid,
  Platform,
  RefreshControl,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import React, { useEffect, useState } from 'react';
import { useThemeStore } from '../store/themeStore';
import CustomHeader from '../components/headers/CustomHeader';
import { scale, verticalScale } from '../utils/Scale';
import Fonts from '../utils/fonts';
import CustomTitleWithBackHeader from '../components/CustomTitleWithBackHeader';
import { navigationRef } from '../../App';
import { userState } from '../store/userStore';
import { AvatarItem } from '../store/categoryStore';
import CommonHomeAvatar from '../components/CommonHomeAvatar';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../types/navigation';
import { useNavigation } from '@react-navigation/native';
import LottieView from 'lottie-react-native';
import { AppAnimations } from '../assets/animation';
import { customColors } from '../utils/Colors';
import {
  getFavouriteAvatar,
  getUserDetail,
  likeDislikeAPI,
  setEventTrackinig,
} from '../api/user';
import CustomActivityIndicator from '../components/CustomActivityIndicator';
import { EVENT_NAME } from '../constants';
import { PERMISSIONS, request, RESULTS } from 'react-native-permissions';
import { logFirebaseEvent } from '../utils/HelperFunction';

type NavigationProp = StackNavigationProp<
  RootStackParamList,
  'FavoriteAvatars'
>;

const FavoriteAvatars = () => {
  const favoriteAvatarsStyles = FavoriteAvatarsScreenStyles();
  const theme = useThemeStore(state => state.theme);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const {
    favoritesList,
    myFavoritesList,
    userData,
    setFavoritesList,
    homeAvatarList,
    setHomeAvatarList,
    setUserData,
    free_public_avatars,
  } = userState.getState();
  const [isPopupOpen, setIsPopupOpen] = useState(false);
  const navigation = useNavigation<NavigationProp>();
  const [favoriteAvatarsList, setFavoriteAvatarsList] =
    useState<AvatarItem[]>(favoritesList);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const [hasMorePages, setHasMorePages] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [isFooterLoading, setIsFooterLoading] = useState(false);

  const handleCallPress = async (item: AvatarItem) => {
    if (userData?.isGuestUser) {
      navigation.navigate('Login', { isfromPlan: true });
      return;
    }
    if (
      (!userData?.user?.tokens || userData.user.tokens < 5) &&
      userData?.user?.free_voice_minutes === 0
    ) {
      setIsPopupOpen(true);
      return;
    }

    const requestMicrophoneAccess = async (): Promise<boolean> => {
      try {
        if (Platform.OS === 'android') {
          const granted = await PermissionsAndroid.request(
            PermissionsAndroid.PERMISSIONS.RECORD_AUDIO,
            {
              title: 'Microphone Permission',
              message:
                'We need access to your microphone so you can make voice calls.',
              buttonPositive: 'OK',
              buttonNegative: 'Cancel',
            },
          );
          return granted === PermissionsAndroid.RESULTS.GRANTED;
        } else {
          const result = await request(PERMISSIONS.IOS.MICROPHONE);
          return result === RESULTS.GRANTED;
        }
      } catch (err) {
        console.warn('Mic permission error:', err);
        return false;
      }
    };

    const hasPermission = await requestMicrophoneAccess();
    if (!hasPermission) {
      Alert.alert(
        'Permission Required',
        'Microphone access is needed to make a call. Please allow permission.',
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Go to Settings', onPress: () => Linking.openSettings() },
        ],
      );
      return;
    } else {
      navigation.navigate('VoiceCall', {
        user: {
          name: item.name ?? '',
          id: item.id,
          image: item.cover_image ?? '',
        },
      });
      logFirebaseEvent(EVENT_NAME.CALL_FROM_FAVORITE_AVATAR, {
        avatar_id: item.id,
        user_id: userData?.user?.id,
      });
      setEventTrackinig({
        event_type: EVENT_NAME.CALL_FROM_FAVORITE_AVATAR,
      });
    }
  };

  const handleLikePress = (item: AvatarItem) => {
    console.log('DATATA--->', favoritesList);
    setFavoritesList(item);
    setFavoriteAvatarsList(
      favoriteAvatarsList?.filter(fav => fav.id !== item.id),
    );
    likeDislikeAPI(Number(item.id)).then(async res => {
      console.log(
        'likeDislikeAPI',
        res,
        homeAvatarList,
        homeAvatarList?.filter(fav => fav.id !== item.id),
      );
      if (res.status) {
        setHomeAvatarList(homeAvatarList?.filter(fav => fav.id !== item.id));
        getUserDetail().then(async res => {
          const newUserData = {
            ...userData,
            user: res?.data?.data?.user,
          };
          setUserData(newUserData);
        });
      }
    });
  };

  const handleChatPress = (item: AvatarItem) => {
    if (userData?.isGuestUser) {
      navigation.navigate('Login', { isfromPlan: true });
      return;
    }
    navigation.navigate('Chat', {
      user: {
        name: item.name ?? '',
        id: item.id,
        image: item.cover_image ?? '',
      },
      chat_id: item?.chat?.chat_id,
    });
    logFirebaseEvent(EVENT_NAME.CHAT_FROM_FAVORITE_AVATAR, {
      avatar: item.id,
      user_id: userData?.user?.id,
    });
    setEventTrackinig({ event_type: EVENT_NAME.CHAT_FROM_FAVORITE_AVATAR });
  };

  useEffect(() => {
    setIsLoading(true);
    fetchFavoriteAvatarsData(1);
  }, [userData?.isGuestUser]);

  const fetchFavoriteAvatarsData = async (isPage?: number) => {
    try {
      await getFavouriteAvatar().then(res => {
        const next = res?.data?.next;
        setIsLoading(false);
        setIsRefreshing(false);
        setHasMorePages(next !== null);
        setCurrentPage(
          isPage ? isPage + 1 : next !== null ? currentPage + 1 : currentPage,
        );
        console.log('DHkhakhkhk===', res?.data?.data?.results);
        setFavoriteAvatarsList(res?.data?.data?.results || []);
      });
    } catch (error) {
      console.log('ERROR--->', error);
    }
  };

  const shouldBlurAvatars = !free_public_avatars;

  const navigateToAvatarDetail = (
    id: string | number,
    image?: string,
    name?: string,
    isBackAllowed?: boolean,
    avatarItem?: AvatarItem,
  ) => {
    navigation.navigate('AvatarDetail', {
      id,
      image,
      name,
      isBackAllowed,
      item: avatarItem,
    });
  };

  const renderFavoriteAvatarItem = ({ item }: { item: AvatarItem }) => {
    const avatarCharacterLabel =
      item?.categories?.find((cat: any) => cat.label === 'Character')
        ?.options?.[0]?.label ?? null;

    return (
      <CommonHomeAvatar
        item={item}
        characterLabel={avatarCharacterLabel}
        onPress={() =>
          navigateToAvatarDetail(
            item.id,
            item.cover_image,
            item.name,
            true,
            item,
          )
        }
        onCallPress={() => handleCallPress(item)}
        onChatPress={() => handleChatPress(item)}
        onLikePress={() => handleLikePress(item)}
        onBlurPress={() => setIsPopupOpen(true)}
        isBlur={shouldBlurAvatars}
        isLike={item.isLike}
        // isLike={userState
        //   ?.getState()
        //   ?.favoritesList.some(fav => fav.id === item.id)}
      />
    );
  };

  return (
    <View style={favoriteAvatarsStyles.screenContainer}>
      <CustomHeader
        headerLeftComponent={
          <CustomTitleWithBackHeader
            title="My Favourites"
            onPress={() => navigationRef?.current?.goBack()}
          />
        }
      />
      {isLoading && !isRefreshing ? <CustomActivityIndicator /> : null}
      <View style={favoriteAvatarsStyles.mainContainer}>
        {favoriteAvatarsList?.length !== 0 ? (
          <FlatList
            data={
              favoriteAvatarsList.length / 2 === 0
                ? favoriteAvatarsList
                : [...favoriteAvatarsList, { id: '0', isEmpty: true }]
            }
            numColumns={2}
            keyExtractor={(item, index) => index.toString()}
            renderItem={renderFavoriteAvatarItem}
            showsVerticalScrollIndicator={false}
            // ListHeaderComponent={<View style={favoriteAvatarsStyles.listHeader} />}
            ListFooterComponent={
              <View style={favoriteAvatarsStyles.listFooter} />
            }
            // ItemSeparatorComponent={() => <View style={favoriteAvatarsStyles.listSeparator} />}
            refreshControl={
              <RefreshControl
                refreshing={isRefreshing}
                onRefresh={() => {
                  if (!isRefreshing) {
                    setIsRefreshing(true);
                    fetchFavoriteAvatarsData();
                    // getGeneratedVideos();
                  }
                }}
                tintColor={theme.primaryFriend}
                colors={[theme.primaryFriend]}
              />
            }
            onEndReached={() => {
              if (hasMorePages && !isFooterLoading) {
                setIsFooterLoading(true);
                fetchFavoriteAvatarsData();
              }
            }}
            onEndReachedThreshold={0.5}
          />
        ) : isLoading ? null : (
          <View
            style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}
          >
            <LottieView
              source={AppAnimations.emptyFav}
              autoPlay
              style={{
                width: scale(200),
                height: scale(200),
                // marginVertical: -hp(2),
              }}
            />
            <Text
              style={favoriteAvatarsStyles.headerText}
            >{`No Favorites`}</Text>
            <Text style={favoriteAvatarsStyles.subHeaderText}>
              {'Please add some avatar that you want to like.'}
            </Text>
          </View>
        )}
      </View>
    </View>
  );
};

export default FavoriteAvatars;

const FavoriteAvatarsScreenStyles = () => {
  const theme = useThemeStore.getState().theme;
  return StyleSheet.create({
    screenContainer: {
      flex: 1,
      backgroundColor: theme.primaryBackground,
    },
    title: {
      fontSize: scale(32),
      fontFamily: Fonts.IBold,
    },
    mainContainer: {
      flex: 1,
      paddingHorizontal: scale(10),
      // paddingBottom: scale(80),
    },
    listFooter: {
      height: verticalScale(20),
    },
    listSeparator: {
      // height: verticalScale(10),
    },
    headerText: {
      fontFamily: Fonts.ISemiBold,
      fontSize: scale(25),
      color: customColors.black,
      marginTop: verticalScale(10),
    },
    subHeaderText: {
      fontFamily: Fonts.IRegular,
      fontSize: scale(16),
      color: customColors.lightblack,
      textAlign: 'center',
      marginTop: verticalScale(5),
      paddingHorizontal: scale(20),
    },
  });
};
