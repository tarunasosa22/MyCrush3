import { NavigationProp, useNavigation } from '@react-navigation/native';
import { RootStackParamList } from '../types/routes';

export const useCustomNavigation = <T extends keyof RootStackParamList>() => {
  const navigation =
    useNavigation<Omit<NavigationProp<RootStackParamList>, T>>();
  return navigation;
};
