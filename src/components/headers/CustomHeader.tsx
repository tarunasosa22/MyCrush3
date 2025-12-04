import React from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import { scale } from '../../utils/Scale';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useThemeStore } from '../../store/themeStore';

interface CustomHeaderProps {
  coinCount?: number;
  onNotificationPress?: () => void;
  containerStyle?: ViewStyle;
  headerStyle?: ViewStyle;
  headerRightComponent?: React.ReactNode;
  headerRightStyle?: ViewStyle;
  headerLeftComponent?: React.ReactNode;
  headerLeftStyle?: ViewStyle;
  headerCenterComponent?: React.ReactNode;
  headerCenterStyle?: ViewStyle;
}

const CustomHeader: React.FC<CustomHeaderProps> = ({
  coinCount = 0,
  onNotificationPress,
  containerStyle,
  headerStyle,
  headerRightComponent,
  headerRightStyle,
  headerLeftComponent,
  headerLeftStyle,
  headerCenterComponent,
  headerCenterStyle,
}) => {
  const styles = Styles();
  return (
    <SafeAreaView
      edges={['top']}
      style={[styles.headerContainer, containerStyle]}
    >
      <View style={[styles.headerRow, headerStyle]}>
        {headerLeftComponent ? (
          <View
            style={[styles.headerHeaderLeftComponentStyle, headerLeftStyle]}
          >
            {headerLeftComponent}
          </View>
        ) : null}
        {headerCenterComponent ? (
          <View
            style={[styles.headerHeaderCenterComponentStyle, headerCenterStyle]}
          >
            {headerCenterComponent}
          </View>
        ) : null}
        {headerRightComponent ? (
          <View
            style={[styles.headerHeaderRightComponentStyle, headerRightStyle]}
          >
            {headerRightComponent}
          </View>
        ) : null}
      </View>
    </SafeAreaView>
  );
};

export default CustomHeader;

const Styles = () => {
  const theme = useThemeStore().theme;
  return StyleSheet.create({
    headerContainer: {
      // paddingTop: Platform.OS == 'android' ? top + 10 : top,

      paddingTop: 5,
      backgroundColor: theme.primaryBackground,
      paddingBottom: scale(20),
    },
    headerRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      // width: '100%',
      alignItems: 'center',
      paddingHorizontal: scale(20),
    },
    headerHeaderRightComponentStyle: {
      alignSelf: 'flex-end',
    },
    headerHeaderLeftComponentStyle: {
      justifyContent: 'flex-start',
    },
    headerHeaderCenterComponentStyle: {
      justifyContent: 'center',
    },
  });
};
