import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { customColors } from '../../utils/Colors';
import { scale, moderateScale, verticalScale } from '../../utils/Scale';

const CommonOrDivider = () => (
  <View style={styles.dividerContainer}>
    <View style={styles.dividerLine} />
    <Text style={styles.dividerText}>Or</Text>
    <View style={styles.dividerLine} />
  </View>
);

export default CommonOrDivider;

const styles = StyleSheet.create({
  dividerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: verticalScale(20),
    // marginBottom: verticalScale(24),
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: customColors.tabinActive,
  },
  dividerText: {
    marginHorizontal: scale(10),
    color: customColors.placeHolder,
    fontSize: moderateScale(14),
  },
});
