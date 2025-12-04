import React, { useState } from 'react';
import {
  Text,
  View,
  Image,
  TextInput,
  StyleSheet,
  TextInputProps,
  TouchableOpacity,
  ViewStyle,
} from 'react-native';
import { moderateScale, scale, verticalScale } from '../../utils/Scale';
import Fonts from '../../utils/fonts';
import { customColors } from '../../utils/Colors';
import IMAGES from '../../assets/images';

interface CustomInputProps extends TextInputProps {
  label: string;
  error?: string;
  placeholder: string;
  isPassword?: boolean;
  containerStyle?: ViewStyle;
}

const CustomInput: React.FC<CustomInputProps> = ({
  label,
  value,
  error,
  placeholder,
  onChangeText,
  isPassword = false,
  keyboardType = 'default',
  containerStyle,
  ...rest
}) => {
  const [inputShowPassword, setInputShowPassword] = useState(false);

  return (
    <View style={[styles.inputContainer, containerStyle]}>
      {label && <Text style={styles.inputLabel}>{label}</Text>}

      <View
        style={[
          styles.inputInputContainer,
          {
            borderColor: !error ? customColors.mediumGrey : customColors.error,
          },
        ]}
      >
        <TextInput
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          secureTextEntry={isPassword && !inputShowPassword}
          keyboardType={keyboardType}
          autoCapitalize={'none'}
          style={styles.inputInput}
          placeholderTextColor={customColors.placeHolder}
          {...rest}
        />

        {isPassword && (
          <TouchableOpacity
            style={styles.inputEyeIconWrapper}
            onPress={() => setInputShowPassword(!inputShowPassword)}
          >
            <Image
              style={styles.inputEyeIcon}
              source={inputShowPassword ? IMAGES.hidePass : IMAGES.showPass}
            />
          </TouchableOpacity>
        )}
      </View>
      {error && <Text style={styles.inputErrorText}>{error}</Text>}
    </View>
  );
};

export default CustomInput;

const styles = StyleSheet.create({
  inputContainer: {
    width: '100%',
    marginBottom: verticalScale(15),
  },
  inputLabel: {
    fontSize: moderateScale(16),
    color: customColors.labelColor,
    fontFamily: Fonts.IMedium,
    marginBottom: verticalScale(6),
  },
  inputInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: moderateScale(1),
    borderColor: customColors.mediumGrey,
    borderRadius: moderateScale(8),
    backgroundColor: customColors.white,
    paddingRight: scale(10),
  },
  inputInput: {
    flex: 1,
    padding: scale(12),
    fontSize: scale(16),
    fontFamily: Fonts.IMedium,
  },
  inputEyeIconWrapper: {
    padding: moderateScale(6),
  },
  inputEyeIcon: {
    width: scale(20),
    height: scale(20),
    tintColor: customColors.placeHolder,
    resizeMode: 'contain',
  },
  inputErrorText: {
    color: customColors.error,
    fontSize: scale(12),
    marginTop: scale(4),
  },
});
