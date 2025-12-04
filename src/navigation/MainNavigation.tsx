import React, { useEffect, useState } from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { useThemeStore } from '../store/themeStore';
import Home from '../screens/HomeScreen';
import MyAvatar from '../screens/MyAvatarScreen';
import Onboarding from '../screens/OnboardingScreen';
import { navigationRef } from '../../App';
import { userState } from '../store/userStore';
import CustomTokenPricingPopup from '../components/CustomPricingTokenPopup';
import AppConstant from '../utils/AppConstant';
import CustomBottomTab from '../components/CustomBottomTab';
import AccountScreen from '../screens/AccountScreen';
import ChatListScreen from '../screens/ChatListScreen';

const Tab = createBottomTabNavigator();

const MainNavigation = () => {
  const theme = useThemeStore(state => state.theme);
  const [isOpenTokenUsag, setIsOpenTokenUsag] = useState(false);
  const [isTabDisabled, setIsTabDisabled] = useState(false);
  const [currentTab, setCurrentTab] = useState('Home'); // 👈 track current tab

  useEffect(() => {
    if (userState.getState().isSignUpUser) {
      userState.getState().setIsCreatedAvatarForSignUp(true);
    }
    setTimeout(() => {
      userState.getState().setSplashState(false);
    }, 3000);
  }, []);

  // 👇 Safe navigation helper
  const handleTabPress = (navigation: any, screen: string) => {
    // ✅ Prevent double presses on same tab
    if (isTabDisabled || currentTab === screen) return;

    setIsTabDisabled(true);
    setCurrentTab(screen);

    navigation.navigate(screen);

    // Optional: small delay to re-enable tab presses
    setTimeout(() => setIsTabDisabled(false), 800);
  };

  return (
    <>
      <Tab.Navigator
        tabBar={props => <CustomBottomTab {...props} />}
        initialRouteName={'Home'}
        screenOptions={{ headerShown: false }}
      >
        <Tab.Screen
          name={'Home'}
          component={Home}
          listeners={({ navigation }) => ({
            tabPress: e => {
              e.preventDefault();
              handleTabPress(navigation, 'Home');
            },
            focus: () => setCurrentTab('Home'),
          })}
        />

        <Tab.Screen
          name={AppConstant.chatList}
          component={ChatListScreen}
          listeners={({ navigation }) => ({
            tabPress: e => {
              e.preventDefault();
              handleTabPress(navigation, 'ChatList');
            },
            focus: () => setCurrentTab('ChatList'),
          })}
        />

        <Tab.Screen
          name={AppConstant.onboard}
          component={Onboarding}
          listeners={({ navigation }) => ({
            tabPress: e => {
              e.preventDefault();
              if (isTabDisabled || currentTab === AppConstant.onboard) return;

              if (userState.getState().isInfoPopupOpen) {
                setIsOpenTokenUsag(
                  userState.getState().useTokensList.length !== 0,
                );
              } else {
                handleTabPress(navigation, AppConstant.onboard);
              }
            },
            focus: () => setCurrentTab(AppConstant.onboard),
          })}
        />

        <Tab.Screen
          name={'MyAvatar'}
          component={MyAvatar}
          listeners={({ navigation }) => ({
            tabPress: e => {
              e.preventDefault();
              handleTabPress(navigation, 'MyAvatar');
            },
            focus: () => setCurrentTab('MyAvatar'),
          })}
        />

        <Tab.Screen
          name={AppConstant.account}
          component={AccountScreen}
          listeners={({ navigation }) => ({
            tabPress: e => {
              e.preventDefault();
              handleTabPress(navigation, 'Account');
            },
            focus: () => setCurrentTab('Account'),
          })}
        />
      </Tab.Navigator>

      <CustomTokenPricingPopup
        visible={isOpenTokenUsag}
        onClose={() => {
          setIsOpenTokenUsag(false);
          userState.getState().setIsInfoPopupOpen(false);
        }}
        onContinue={() => {
          setIsOpenTokenUsag(false);
          userState.getState().setIsInfoPopupOpen(false);
          navigationRef.current?.navigate('Onboarding');
        }}
      />
    </>
  );
};

export default MainNavigation;
