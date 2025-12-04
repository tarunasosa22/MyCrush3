import { NavigationProp, useNavigation } from '@react-navigation/native';
import { RootStackParamList } from '../types/navigation';

export const useCustomNavigation = <T extends keyof RootStackParamList>() => {
  const navigation =
    useNavigation<Omit<NavigationProp<RootStackParamList>, T>>();
  return navigation;
};
