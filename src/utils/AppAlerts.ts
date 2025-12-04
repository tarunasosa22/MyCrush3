import { Alert } from "react-native";


export const AppAlert = (title: string, message: string, onPositivePress?: () => void, onNegativePress?: () => void) => {
    Alert.alert(
        title,
        message,
        [
            {
                text: "Cancel",
                onPress: () => onNegativePress?.()
            },
            {
                text: "Ok",
                onPress: () => onPositivePress?.()
            }
        ])
};
