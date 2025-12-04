import {
  View,
  TouchableOpacity,
  Image,
  StyleSheet,
  Platform,
} from 'react-native';
import React from 'react';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useThemeStore } from '../store/themeStore';
import IMAGES from '../assets/images';
import { scale, verticalScale } from '../utils/Scale';
import { customColors } from '../utils/Colors';
import AppConstant from '../utils/AppConstant';

interface GradientBottomTabBarProps {
  state: any;
  descriptors: any;
  navigation: any;
}

const CustomBottomTab = ({
  state,
  descriptors,
  navigation,
}: GradientBottomTabBarProps) => {
  const { theme } = useThemeStore();
  const styles = useStyles();
  const activeColor = theme.primaryFriend;
  const inactiveColor = '#888888';

  const getImage = (label: string, isFocused: boolean) => {
    switch (label) {
      case AppConstant.home:
        return (
          <Image
            source={IMAGES.home}
            tintColor={isFocused ? activeColor : inactiveColor}
            resizeMode="contain"
            style={styles.bottomTabIconStyle}
          />
        );
      case AppConstant.chatList:
        return (
          <Image
            source={IMAGES.chat}
            tintColor={isFocused ? activeColor : inactiveColor}
            resizeMode="contain"
            style={[styles.bottomTabIconStyle]}
          />
        );
      case AppConstant.myAvatar:
        // Using heart icon as placeholder for handshake/partnership
        return (
          <Image
            source={IMAGES.myAvatar}
            tintColor={isFocused ? activeColor : inactiveColor}
            resizeMode="contain"
            style={styles.bottomTabIconStyle}
          />
        );
      case 'Account':
        return (
          <Image
            source={IMAGES.account_icon}
            tintColor={isFocused ? activeColor : inactiveColor}
            resizeMode="contain"
            style={styles.bottomTabIconStyle}
          />
        );
      default:
        return null;
    }
  };

  // Check if current route is Onboarding - hide entire bottom tab if so
  const currentRoute = state.routes[state.index];
  const isOnboardingScreen = currentRoute?.name === AppConstant.onboard;

  // Hide entire bottom tab bar when on Onboarding screen
  if (isOnboardingScreen) {
    return null;
  }

  // Filter routes to show only the 4 main tabs (excluding Onboarding)
  const mainTabs = state.routes.filter(
    (route: any) => route.name !== AppConstant.onboard,
  );

  const handleFABPress = () => {
    const onboardingRoute = state.routes.find(
      (route: any) => route.name === AppConstant.onboard,
    );
    if (onboardingRoute) {
      const event = navigation.emit({
        type: 'tabPress',
        target: onboardingRoute.key,
        canPreventDefault: true,
      });

      if (!event.defaultPrevented) {
        navigation.navigate({ name: AppConstant.onboard, merge: true });
      }
    }
  };

  return (
    <View style={styles.bottomTabMainContainer}>
      {/* White Rounded Bar with Navigation Icons */}
      <View style={styles.bottomTabBarContainer}>
        <View style={styles.bottomTabBar}>
          {mainTabs.map((route: any, index: number) => {
            const { options } = descriptors[route.key];
            const label =
              options.tabBarLabel !== undefined
                ? options.tabBarLabel
                : options.title !== undefined
                ? options.title
                : route.name;

            const isFocused =
              state.index ===
              state.routes.findIndex((r: any) => r.name === route.name);

            const onPress = () => {
              const event = navigation.emit({
                type: 'tabPress',
                target: route.key,
                canPreventDefault: true,
              });

              if (!isFocused && !event.defaultPrevented) {
                navigation.navigate({ name: route.name, merge: true });
              }
            };

            return (
              <TouchableOpacity
                accessibilityRole="button"
                accessibilityState={isFocused ? { selected: true } : {}}
                accessibilityLabel={options.tabBarAccessibilityLabel}
                testID={options.tabBarTestID}
                onPress={onPress}
                key={route.key}
                style={styles.bottomTabButton}
                activeOpacity={0.7}
              >
                <View style={styles.bottomTabIconContainer}>
                  {getImage(label, isFocused)}
                </View>
              </TouchableOpacity>
            );
          })}
        </View>
      </View>

      {/* Floating Action Button (FAB) */}
      <View style={styles.fabContainer}>
        <TouchableOpacity
          style={[styles.fab, { backgroundColor: activeColor }]}
          onPress={handleFABPress}
          activeOpacity={0.8}
        >
          <Image source={IMAGES.pluse} style={styles.fabIcon} />
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default CustomBottomTab;

const useStyles = () => {
  const insets = useSafeAreaInsets();
  const bottom = insets.bottom;
  const theme = useThemeStore().theme;

  const getBottomPadding = () => {
    if (Platform.OS === 'ios') {
      return Math.max(bottom, 10);
    } else {
      if (bottom === 0) {
        return verticalScale(15);
      } else {
        return verticalScale(bottom + 5);
      }
    }
  };

  return StyleSheet.create({
    bottomTabIconStyle: {
      width: scale(22),
      height: scale(22),
      resizeMode: 'contain',
    },
    bottomTabMainContainer: {
      width: '100%',
      paddingBottom: getBottomPadding(),
      paddingTop: verticalScale(10),
      paddingHorizontal: scale(16),
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      position: 'absolute',
      bottom: 0,
    },
    bottomTabBarContainer: {
      flex: 1,
      shadowColor: '#000',
      shadowOffset: {
        width: 0,
        height: 2,
      },
      shadowOpacity: 0.23,
      shadowRadius: 2.62,

      elevation: 4,
      borderRadius: scale(30),
      marginRight: scale(12),
    },

    bottomTabBar: {
      flex: 1,
      height: scale(60),
      backgroundColor: theme.bottomTabBackground,
      borderRadius: scale(30),
      borderColor: theme.border,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-around',
      paddingHorizontal: scale(10),
      borderWidth: 2,
      // Shadow for floating effect
    },
    bottomTabButton: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
      height: '100%',
    },
    bottomTabIconContainer: {
      alignItems: 'center',
      justifyContent: 'center',
    },
    fabContainer: {
      shadowColor: '#000',
      shadowOffset: {
        width: 0,
        height: 2,
      },
      shadowOpacity: 0.23,
      shadowRadius: 2.62,

      elevation: 4,
      borderRadius: scale(28),
    },
    fab: {
      width: scale(54),
      height: scale(54),
      borderRadius: scale(28),
      justifyContent: 'center',
      // marginLeft: scale(10),
      alignItems: 'center',
    },
    fabIcon: {
      width: scale(15),
      height: scale(15),
      tintColor: customColors.white,
      resizeMode: 'contain',
    },
  });
};
