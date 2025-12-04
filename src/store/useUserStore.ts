import { Platform } from 'react-native';
import { createPersistZustand } from './store';
import { CupidThemeName } from '../theme';
import { AvatarItemTypes } from './useCategoryStore';
import { subscriptionStateTypes, subscriptionSubStateTypes } from '../constant';

export type ProductSubscriptionPlansTypes = {
  androidProductId: string;
  iosProductId: string;
  name: string;
  price_usd: number;
  duration: string; // e.g., "1 Month", "3 Months"
  tokens: number;
  perPlanPeriod: string; // e.g., "PER MONTH"
  isSelect: boolean;
  isPopular: boolean;
};
export type ProductIAPPlansTypes = {
  androidProductId: string;
  iosProductId: string;
  display_credit_txt: string;
  tokens: number;
  isSelect: boolean;
};

export type LoginDataTypes = {
  id: string | null;
  full_name: string | null;
  email: string | null;
  date_joined: string | null;
  profile_image: string | null;
  tokens: number;
  total_tokens?: number;
  isUserSubscribeOnce: boolean;
  isCurrentlyEnabledSubscription: boolean;
  free_public_avatars: boolean;
  free_voice_minutes: number;
  is_ad_free: boolean;
  is_subscription_active: boolean;
  user_type: string;
  active_subscription_detail?: {
    id: string | null;
    plan_name: subscriptionStateTypes | null;
    // subscription_sub_type: subscriptionSubTypes | null;
    start_date: string | null;
    end_date: string | null;
    is_active: boolean | null;
    credit?: number | null;
    price?: string | null;
    product_id?: string | null;
    ios_product_id?: string | null;
    android_product_id?: string | null;
  };
};

export type GuestDataTypes = {
  device_id?: string | null;
  device_type?: string | null;
  id: string | null;
  last_activity?: string | null;
  isUserSubscribeOnce?: boolean;
  isCurrentlyEnabledSubscription?: boolean;
  full_name?: string | null;
  email?: string | null;
  profile_image?: string | null;
  tokens?: number;
  total_tokens?: number;
  free_public_avatars: boolean;
  free_voice_minutes: number;
  is_ad_free: boolean;
  is_subscription_active: boolean;
  active_subscription_detail?: {
    id: string | null;
    plan_name: subscriptionStateTypes | null;
    // subscription_sub_type: subscriptionSubTypes | null;
    start_date: string | null;
    end_date: string | null;
    is_active: boolean | null;
    credit?: number | null;
    price?: string | null;
    android_product_id?: string | null;
  };
};

export type persona_typeTypes = {
  id: string;
  code: string | null | CupidThemeName;
  label: string | null;
};
export type photosTypes = {
  id: string;
  image: string | null;
  is_dummy?: boolean;
  status?: string;
};

export type avatarTypes = {
  cover_image: string | null;
  name: string | null;
  status: string | null;
  id: number;
};

export type chatTypes = {
  chat_id: string | null;
  created_at: string | null;
  last_message: string | null;
  updated_at: string | null;
  user: string | null;
  avatar: avatarTypes | null;
};

export type userSelfAvaterCategoryOptionTypes = {
  id: number;
  label: string | null;
  image: string | null;
  audio: string | null;
};
export type userSelfAvatarCategoryTypes = {
  category_id: number;
  input_type: string | null;
  label: string | null;
  options: userSelfAvaterCategoryOptionTypes[];
};
export type useTokensListType = {
  id: number;
  feature: string;
  tokens: string;
  icon: string;
};

export type userSelfAvatar = {
  id: string;
  categories: userSelfAvatarCategoryTypes[];
  cover_image: string | null;
  created_at: string | null;
  description: string | null;
  name: string | null;
  chat: {
    chat_id: string | number | null;
  };
  persona_type: persona_typeTypes;
  photos: photosTypes[];
  status: string | null;
  updated_at: string | null;
  visibility: string | null;
  likes?: number;
  age?: number;
  likes_count?: number;
  character: string | null;
  personality: string | null;
};

type UserType = {
  access_token: string | null;
  refresh_token: string | null;
  user: LoginDataTypes | GuestDataTypes | null;
  avatar: userSelfAvatar | null;
  isGuestUser: boolean | null;
};

interface AuthState {
  userData: UserType;
  isGuestUser: boolean;
  favoritesList: AvatarItemTypes[];
  myFavoritesList: AvatarItemTypes[];
  myAvatars: AvatarItemTypes[] | undefined;
  isOpenPlan?: boolean;
  isAdsOpenPlan?: boolean;
  isAdsPlanPurchasedUser?: boolean;
  selectedPlan: subscriptionSubStateTypes | undefined;
  selectedIAPPlan: ProductPack | undefined;
  selectedAdsIAPPlan: ProductPack | undefined;
  homeAvatarList?: AvatarItemTypes[] | undefined;
  isSignUpUser: boolean;
  isCreatedAvatarForSignUp: boolean;
  encryptedKey?: string | null;
  sentChatCount: chatCount[];
  timeOfPopup: string | null;
  isPopupSeenToday: boolean;
  IsChatDemoVideoShown: boolean;
  IdForBlurImageGenerate: string | null;
  createdAvatar: userSelfAvatar | null;
  isFailedCreateAvatar: boolean;
}
interface chatCount {
  id: number;
}

interface otherAuthState {
  isUserFirstTime: boolean;
  isLoading: boolean;
  isBusy: boolean;
  isOpenSubscriptionPlanAfterAdsPlan?: boolean;
  fcmToken: null | string | undefined;
  isTokenExpire: boolean;
  isAgreedPolicy: boolean;
  free_message_count: number;
  free_public_avatars: boolean;
  isInfoPopupOpen: boolean;
  isCallEnded: boolean;
  callEndReason: string;
  isSignUpUser: boolean;
  isCreatedAvatarForSignUp: boolean;
  useTokensList: useTokensListType[];
  productSubscriptionIds: string[] | undefined;
  productSubscriptionPlans: ProductSubscriptionPlansTypes[] | undefined;
  productIAPIds: string[] | undefined;
  productIAPPlans: ProductIAPPlansTypes[] | undefined;
  isAppReady: boolean;
  splashState: boolean;
  isAdClosed: boolean;
  tranactionId?: string | null;
}

const initialState: AuthState = {
  userData: {
    access_token: null,
    refresh_token: null,
    user: null,
    avatar: null,
    isGuestUser: null,
  },
  isOpenPlan: false,
  isAdsOpenPlan: false,
  isAdsPlanPurchasedUser: false,
  isGuestUser: true,
  favoritesList: [],
  myFavoritesList: [],
  myAvatars: undefined,
  homeAvatarList: undefined,
  selectedPlan: undefined,
  selectedIAPPlan: undefined,
  selectedAdsIAPPlan: undefined,
  isSignUpUser: false,
  isCreatedAvatarForSignUp: false,
  encryptedKey: null,
  sentChatCount: [],
  timeOfPopup: null,
  isPopupSeenToday: false,
  IsChatDemoVideoShown: false,
  IdForBlurImageGenerate: null,
  createdAvatar: null,
  isFailedCreateAvatar: false,
};

const anotherInitialState: otherAuthState = {
  isUserFirstTime: true,
  isLoading: false,
  isBusy: false,
  fcmToken: null,
  isTokenExpire: false,
  isAgreedPolicy: true,
  free_message_count: 0,
  free_public_avatars: false,
  isInfoPopupOpen: true,
  isCallEnded: false,
  callEndReason: '',
  isSignUpUser: false,
  isCreatedAvatarForSignUp: false,
  useTokensList: [],
  isAppReady: false,
  splashState: true,
  isAdClosed: false,
  productSubscriptionIds: undefined,
  productIAPIds: undefined,
  productSubscriptionPlans: undefined,
  productIAPPlans: undefined,
  tranactionId: null,
  isOpenSubscriptionPlanAfterAdsPlan: true,
};

interface AuthActions {
  setIsLoading: (isLoading: boolean) => void;
  setIsBusy: (isBusy: boolean) => void;
  setUserData: (user: UserType) => void;
  resetToInitialState: () => void;
  setUserFirstTime: (isFirstTime: boolean) => void;
  setUserFcmToken: (fcmToken: string | null | undefined) => void;
  setUserTokenExpire: (isTokenExpire: boolean) => void;
  setLogout: () => void;
  setFavoritesList: (favoritesItem: AvatarItemTypes) => void;
  setMyFavoritesList: (myFavoritesItem: AvatarItemTypes) => void;
  setMyAvatars: (myAvatars: AvatarItemTypes[]) => void;
  setIsOpenPlan: (isOpenPlan: boolean) => void;
  setIsAdsOpenPlan: (isAdsOpenPlan: boolean) => void;
  setIsOpenSubscriptionPlanAfterAdsPlan: (
    isOpenSubscriptionPlanAfterAdsPlan: boolean,
  ) => void;
  setIsAdsPlanPurchasedUser: (isAdsPlanPurchasedUser: boolean) => void;
  setUserSelectedPlan: (plan: subscriptionSubStateTypes | undefined) => void;
  setUserSelectedIAPPlan: (plan: ProductPack | undefined) => void;
  setUserSelectedAdsIAPPlan: (plan: ProductPack | undefined) => void;
  setUserTransactionId: (tranactionId: string | null) => void;
  setHomeAvatarList: (homeAvatarList: AvatarItemTypes[] | undefined) => void;
  setIsAgreedPolicy: (isAgreedPolicy: boolean) => void;
  setFreeMessageCount: (freeMessageCount: number) => void;
  setFreePublicAvatars: (freePublicAvatars: boolean) => void;
  setIsInfoPopupOpen: (isInfoPopupOpen: boolean) => void;
  setIsCallEnded: (isCallEnded: boolean) => void;
  setCallEndReason: (reason: string) => void;
  setIsSignUpUSer: (isSignUpUser: boolean) => void;
  setIsCreatedAvatarForSignUp: (isCreatedAvatarForSignUp: boolean) => void;
  setEncryptedKey: (encryptedKey: string | null) => void;
  setSentChatCount: (sentChatCount: chatCount) => void;
  setTimeOfPopup: (timeOfPopup: string) => void;
  resetChatCount: () => void;
  setIsPopupSeenToday: (isPopupSeenToday: boolean) => void;
  setUseTokenList: (useTokensList: useTokensListType[]) => void;
  setTokensInfoWithApi: () => void;
  setIsAppReady: (isAppReady: boolean) => void;
  setSplashState: (splashState: boolean) => void;
  setIsAdClosed: (isAdClosed: boolean) => void;
  setProductSubscriptionIds: (
    productSubscriptionIds: string[] | undefined,
  ) => void;
  setProductIAPIds: (productIAPIds: string[] | undefined) => void;
  setProductSubscriptionPlans: (
    productSubscriptionPlans: ProductSubscriptionPlansTypes[] | undefined,
  ) => void;
  setProductIAPPlans: (
    productIAPPlans: ProductIAPPlansTypes[] | undefined,
  ) => void;
  setIsChatDemoVideoShown: (isChatDemoVideoShown: boolean) => void;
  setIdForBlurImageGenerate: (IdForBlurImageGenerate: string | null) => void;
  setCreatedAvatar: (createdAvatar: userSelfAvatar | null) => void;
  setIsFailedCreateAvatar: (isFailedCreateAvatar: boolean) => void;
}

interface ExtraMetadata {
  credits_value: number;
  internal_plan_id: string;
  notes: string;
}

export interface ProductPack {
  description: string;
  extra_metadata: ExtraMetadata;
  id: string;
  name: string;
  price_currency: string;
  price_id: string;
  product_id: string;
  title: string;
  credits: number;
  priceNumber: number;
  price: number;
  isSelect?: boolean;
}

type UserStateType = AuthState & AuthActions & otherAuthState;

export const userState = createPersistZustand<UserStateType>(
  'user',
  (set, get) => ({
    ...initialState,
    ...anotherInitialState,
    setIsLoading(isLoading) {
      set({
        ...get(),
        isLoading,
      });
    },
    setIsBusy(isBusy) {
      set({
        ...get(),
        isBusy,
      });
    },

    setUserData: user => {
      set({
        ...get(),
        userData: {
          ...user,
          access_token: user?.access_token,
          refresh_token: user?.refresh_token,
          isGuestUser:
            user?.user && 'email' in user.user ? user.user.email == null : true,
          ...(user?.user && {
            user: {
              ...user.user,
              tokens:
                user?.user?.isCurrentlyEnabledSubscription === false
                  ? 0
                  : user?.user?.tokens,
            },
          }),
        },
        isGuestUser:
          user?.user && 'email' in user.user ? user.user.email == null : true,
      });
    },

    resetToInitialState: () =>
      set({
        ...get(),
        ...initialState,
        createdAvatar: null,
        isFailedCreateAvatar: false,
        isUserFirstTime: false,
        isGuestUser: true,
      }),
    setUserFirstTime(isFirstTime) {
      set({
        ...get(),
        isUserFirstTime: isFirstTime,
      });
    },
    setUserFcmToken: fcmToken => {
      set({ ...get(), fcmToken: fcmToken });
    },
    setUserTokenExpire: isTokenExpire => {
      set({ ...get(), isTokenExpire: isTokenExpire });
    },
    setLogout: () => {
      set({
        ...get(),
        ...initialState,
      });
    },
    setFavoritesList: (favoritesItem: AvatarItemTypes) => {
      const { favoritesList } = get();
      const exists = favoritesList.some(item => item.id === favoritesItem.id);

      set({
        ...get(),
        favoritesList: exists
          ? favoritesList.filter(item => item.id !== favoritesItem.id) // remove if exists
          : [...favoritesList, favoritesItem], // add if not
      });
    },
    setMyFavoritesList: (favoritesItem: AvatarItemTypes) => {
      const { myFavoritesList } = get();
      const exists = myFavoritesList.some(item => item.id === favoritesItem.id);

      set({
        ...get(),
        favoritesList: exists
          ? myFavoritesList.filter(item => item.id !== favoritesItem.id) // remove if exists
          : [...myFavoritesList, favoritesItem], // add if not
      });
    },
    setMyAvatars: (myAvatars: AvatarItemTypes[] | undefined) => {
      set({ ...get(), myAvatars: myAvatars });
    },
    setIsOpenPlan: (isOpenPlan: boolean) => {
      set({ ...get(), isOpenPlan: isOpenPlan });
    },
    setIsOpenSubscriptionPlanAfterAdsPlan: (
      isOpenSubscriptionPlanAfterAdsPlan: boolean,
    ) => {
      set({
        ...get(),
        isOpenSubscriptionPlanAfterAdsPlan: isOpenSubscriptionPlanAfterAdsPlan,
      });
    },
    setIsAdsOpenPlan: (isAdsOpenPlan: boolean) => {
      set({ ...get(), isAdsOpenPlan: isAdsOpenPlan });
    },
    setIsAdsPlanPurchasedUser: (isAdsPlanPurchasedUser: boolean) => {
      set({ ...get(), isAdsPlanPurchasedUser: isAdsPlanPurchasedUser });
    },
    setUserSelectedPlan: plan => {
      set({ ...get(), selectedPlan: plan });
    },
    setUserSelectedIAPPlan: plan => {
      set({ ...get(), selectedIAPPlan: plan });
    },
    setUserSelectedAdsIAPPlan: plan => {
      set({ ...get(), selectedAdsIAPPlan: plan });
    },
    setUserTransactionId: (tranactionId: string | null) => {
      set({ ...get(), tranactionId: tranactionId });
    },
    setHomeAvatarList: (avatarList: AvatarItemTypes[] | undefined) => {
      set({ ...get(), homeAvatarList: avatarList });
    },
    setIsAgreedPolicy: (isAgreedPolicy: boolean) => {
      set({ ...get(), isAgreedPolicy: isAgreedPolicy });
    },
    setFreeMessageCount: (freeMessageCount: number) => {
      set({ ...get(), free_message_count: freeMessageCount });
    },
    setFreePublicAvatars: (freePublicAvatars: boolean) => {
      set({ ...get(), free_public_avatars: freePublicAvatars });
    },
    setIsInfoPopupOpen: (isInfoPopupOpen: boolean) => {
      set({ ...get(), isInfoPopupOpen: isInfoPopupOpen });
    },
    setIsCallEnded: (isCallEnded: boolean) => {
      set({ ...get(), isCallEnded: isCallEnded });
    },
    setCallEndReason: (callEndReason: string) => {
      set({ ...get(), callEndReason: callEndReason });
    },
    setIsSignUpUSer: (isSignUpUser: boolean) => {
      set({ ...get(), isSignUpUser: isSignUpUser });
    },
    setIsCreatedAvatarForSignUp: isCreatedAvatarForSignUp => {
      set({ ...get(), isCreatedAvatarForSignUp: isCreatedAvatarForSignUp });
    },
    setSplashState: (splashState: boolean) => {
      set({ ...get(), splashState: splashState });
    },
    setIsAdClosed: (isAdClosed: boolean) => {
      set({ ...get(), isAdClosed: isAdClosed });
    },
    setEncryptedKey: (encryptedKey: string | null) => {
      set({
        ...get(),
        encryptedKey,
      });
    },
    setSentChatCount: sentChat => {
      const { sentChatCount } = get();
      const exists = sentChatCount?.some(item => item.id === sentChat.id);
      set({
        ...get(),
        sentChatCount: exists
          ? sentChatCount?.filter(item => item.id !== sentChat.id) // remove if exists
          : [...sentChatCount, sentChat], // add if not
      });
    },
    setTimeOfPopup: (timeOfPopup: string) => {
      set({
        ...get(),
        timeOfPopup: timeOfPopup,
      });
    },
    resetChatCount: () =>
      set({
        ...get(),
        sentChatCount: [],
      }),
    setIsPopupSeenToday: isPopupSeenToday => {
      set({
        ...get(),
        isPopupSeenToday: isPopupSeenToday,
      });
    },
    setUseTokenList: (useTokensList: useTokensListType[]) => {
      set({ ...get(), useTokensList: useTokensList });
    },
    setIsAppReady: isAppReady => {
      set({ ...get(), isAppReady: isAppReady });
    },
    setProductSubscriptionIds: (
      productSubscriptionIds: string[] | undefined,
    ) => {
      set({ ...get(), productSubscriptionIds: productSubscriptionIds });
    },
    setProductIAPIds: (productIAPIds: string[] | undefined) => {
      set({ ...get(), productIAPIds: productIAPIds });
    },
    setProductSubscriptionPlans: (
      productSubscriptionPlans: ProductSubscriptionPlansTypes[] | undefined,
    ) => {
      set({ ...get(), productSubscriptionPlans: productSubscriptionPlans });
    },
    setProductIAPPlans: (
      productIAPPlans: ProductIAPPlansTypes[] | undefined,
    ) => {
      set({ ...get(), productIAPPlans: productIAPPlans });
    },
    setIsChatDemoVideoShown: (isChatDemoVideoShown: boolean) => {
      set({ ...get(), IsChatDemoVideoShown: isChatDemoVideoShown });
    },
    setIdForBlurImageGenerate: (IdForBlurImageGenerate: string | null) => {
      set({ ...get(), IdForBlurImageGenerate: IdForBlurImageGenerate });
    },
    setCreatedAvatar: (createdAvatar: userSelfAvatar | null) => {
      set({ ...get(), createdAvatar: createdAvatar });
    },
    setIsFailedCreateAvatar: (isFailedCreateAvatar: boolean) => {
      set({ ...get(), isFailedCreateAvatar: isFailedCreateAvatar });
    },

    setTokensInfoWithApi: async () => {
      try {
        await getTokensInfo().then((res: any) => {
          const platform = Platform.OS === 'ios' ? 'ios' : 'android'; // detect platform

          // Map subscription plans to platform-specific IDs
          const subscriptionIds = res?.data?.data?.plans?.map((plan: any) =>
            platform === 'ios' ? plan.iosProductId : plan.androidProductId,
          );

          // Map one-time products to platform-specific IDs
          const iapIds = res?.data?.data?.one_time_products?.map(
            (product: any) =>
              platform === 'ios'
                ? product.iosProductId
                : product.androidProductId,
          );
          set({
            ...get(),
            useTokensList: res?.data?.data?.token_usage,
            productSubscriptionIds: subscriptionIds,
            productIAPIds: iapIds,
            productSubscriptionPlans: res?.data?.data?.plans,
            productIAPPlans: res?.data?.data?.one_time_products,
          });
        });
      } catch {}
    },
  }),
);
