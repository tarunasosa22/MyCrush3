import type { NavigatorScreenParams } from '@react-navigation/native';

import { CupidThemeName } from '../theme';
import { AvatarItemTypes } from '../store/useCategoryStore';

export type RootStackParamList = {
  Splash: undefined;
  GFBFS: undefined;
  Home: { theme: CupidThemeName } | undefined;
  MyAvatar: { theme: CupidThemeName } | undefined;
  Onboarding: undefined;
  AvatarDetail:
    | {
        item?: AvatarItemTypes;
        id?: number | string;
        image?: string;
        name?: string;
        isBackAllowed?: boolean;
        isMyAvatar?: boolean;
        isBlur?: boolean;
      }
    | undefined;
  Chat: {
    user: {
      id: number | string;
      name: string;
      image: string;
    };
    chat_id?: number | string;
  };
  ForgotPassword: undefined;
  Login:
    | {
        email?: string | null;
        isfromPlan?: boolean;
        isFromAccount?: boolean;
        isFromStart?: boolean;
        isFromAdsPlan?: boolean;
      }
    | undefined;
  MainNavigation: undefined;
  VoiceCall: {
    user: {
      id: number | string;
      name: string;
      image: string;
    };
  };
  CreateAvatar: undefined;
  ChangePassword: undefined;
  ChatList: undefined;
  PersonalInfo: undefined;
  HelpCenter: undefined;
  PrivacyPolicy: undefined;
  Account: undefined;
  FavoriteAvatars: undefined;
  InterstitialAd: { isFrom?: string | undefined } | undefined;
  IntroScreen0: undefined;
  IntroScreen1: undefined;
  IntroScreen2: undefined;

  SignUp:
    | { isfromPlan?: boolean; isFromAccount?: boolean; isFromAdsPlan?: boolean }
    | undefined;
  TermsAndConditions: undefined;
  AuthStart: undefined;
  CreateAvatarStep0: undefined;
  CreateAvatarStep1: undefined;
  CreateAvatarStep2: undefined;
  CreateAvatarStep3: undefined;
  CreateAvatarStep4: undefined;
  CreateAvatarStep5: undefined;
  CreateAvatarStep6: undefined;
  CreateAvatarStep7: undefined;
  CreateAvatarStep8: undefined;
  CreateAvatarStep9: undefined;
  CreateAvatarStep10: undefined;
  CreateAvatarStep11: undefined;
  CreateAvatarStep12: undefined;
  CreateAvatarStep13: undefined;
};
