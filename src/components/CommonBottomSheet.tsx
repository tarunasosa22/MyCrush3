import React from 'react';
import { StyleSheet, View, ViewStyle } from 'react-native';
import BottomSheet, {
  BottomSheetBackdrop,
  BottomSheetBackdropProps,
  BottomSheetProps,
} from '@gorhom/bottom-sheet';
import { useThemeStore } from '../store/themeStore';
import { scale } from '../utils/Scale';

interface CommonBottomSheetProps {
  children: React.ReactNode;
  backgroundStyle?: ViewStyle;
  animatedPosition?: any; // ✅ Add this prop
}

export type CommonBottomSheetRef = BottomSheet;

const CustomBottomSheet = React.forwardRef(
  (props: CommonBottomSheetProps & BottomSheetProps, ref: any) => {
    const styles = Styles();

    return (
      <BottomSheet
        {...props}
        ref={ref}
        animatedPosition={props.animatedPosition} // ✅ Pass it through
        handleIndicatorStyle={{
          backgroundColor: '#E7E7E7',
          width: '20%',
          marginTop: scale(5),
        }}
        backgroundStyle={[styles.background, props?.backgroundStyle]}
        keyboardBehavior={
          props.keyboardBehavior ? props.keyboardBehavior : 'interactive'
        }
        keyboardBlurBehavior={
          props.keyboardBlurBehavior ? props.keyboardBlurBehavior : 'restore'
        }
        // ✅ Remove android_keyboardInputMode if it's causing issues
        android_keyboardInputMode="adjustResize"
      >
        {/* ✅ Remove the extra View wrapper that was limiting scrolling */}
        {props?.children}
      </BottomSheet>
    );
  },
);

export default CustomBottomSheet;

const Styles = () => {
  const theme = useThemeStore().theme;
  return StyleSheet.create({
    background: {
      backgroundColor: theme.primaryBackground,
      borderTopLeftRadius: scale(35),
      borderTopRightRadius: scale(35),
    },
    // ✅ Remove contentContainer styles as they're now handled in the parent
  });
};
