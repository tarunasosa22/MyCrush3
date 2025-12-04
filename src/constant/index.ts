import { Platform } from 'react-native';

export interface subscriptionSubStateTypes {
  pricingPhases: {
    pricingPhaseList: {
      recurrenceMode: number;
      priceAmountMicros: string;
      billingCycleCount: number;
      billingPeriod: string;
      priceCurrencyCode: string;
      formattedPrice: string;
    }[];
  };
  offerToken: string;
  offerTags: [];
  offerId: null;
  basePlanId: string;
  discount?: string;
  isPopular?: boolean;
  originalPrice?: string;
  priceNumber?: string;
  localizedPrice?: string;
  bgColor?: string;
  currency?: string;
  decimal?: string;
  borderColor?: string;
  credits?: string;
  planPeriod?: string;
  savePrice?: string;
  isSelect?: boolean;
  perPlanTxt?: string;
}

export type subscriptionStateTypes = {
  description: '';
  displayName: string;
  id: string;
  name: string;
  platform: string;
  productId: string;
  productType: string;
  subscriptionOfferDetails: subscriptionSubStateTypes[];
  type: string;
  title: string;
};

export const staticPublicKey = `
-----BEGIN PUBLIC KEY-----
MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEA12c/p+5nP54cNjgr9exki
C9nNqR3ToxtmOlTrUnvWKLuvYRndq5WiHArPPtHSjnqe+xCWAEaQ0Ct6UNZXGKPPQ
PFPis7DudEdnliW/Iyk9yIIgRvXF5clWra9ZRONIKLQ9v+skaj7MnGM1gdHhq5YgB
RvfULbP7K/x61Ezz8tYoKqnCfhcsaiNTFZLOPulsMshmwUZEbuL82cDE/j37RI5pr
vm94X+l5+ufcD8lr4MjUwH06t4rv8/nNNq6Ofbd35MhdcfL1BhESjHZ4zutUEXPQv
/BTvIpB1pihTI9M/Y3Q0mbndeJ4WUVjEp6J7yq/dZpHBOsrBxEYFFI4O+OfWQIDAQAB
-----END PUBLIC KEY-----
`;

export const AdsKeyword = [
  'Car Insurance loan',
  'Life Insurance',
  'Business Loan',
  'VA Home Loan',
  'Mortgage',
  'Life Insurance',
  'Auto Insurance',
  'Business Insurance',
  'Wealth Management',
  'Personal Loan',
  'Credit card',
  'Financial Planning',
  'Home Loan',
  'Mortgage Loan',
  'Student Loan',
  'Payday Loan',
  'Personal Loan',
  'Debt Consolidation Loan',
  'Car Loan',
  'Loan',
  'Short Term Loan',
  'Loan Calculator',
];

export const ANDROID_PACKAGE_NAME = 'com.mycrush3';
export const IOS_PACKAGE_NAME = 'org.reactjs.native.example.MyCrush3';
export const PACKAGE_NAME =
  Platform.OS == 'ios' ? IOS_PACKAGE_NAME : ANDROID_PACKAGE_NAME;

export const EVENTS = {
  // ONBOARDING
  ONBOARDING_START_AS_GUEST: 'onboarding_start_as_guest',
  START_AS_GUEST: 'onboarding_start_as_guest',
  START_GUEST_ONBOARDING: 'onboarding_start_as_guest',

  // SUBSCRIPTION & IAP
  PURCHASED_SUCCESS: 'purchased_success',
  PURCHASE_SUCCESS: 'purchased_success',
  PURCHASE_COMPLETED_EVENT: 'purchased_success',

  SELECTED_PURCHASE_PLAN: 'selected_purchase_plan',
  SELECT_PURCHASE_PLAN: 'selected_purchase_plan',
  PURCHASE_PLAN_SELECTED_EVENT: 'selected_purchase_plan',

  CLOSE_SUBSCRIPTION_PAGE: 'close_subscription_page',
  CLOSE_SUBSCRIPTION: 'close_subscription_page',
  SUBSCRIPTION_PAGE_CLOSED_EVENT: 'close_subscription_page',

  OPEN_LOGIN_FROM_SUBSCRIPTION: 'open_login_from_subscription',
  OPEN_LOGIN_SUBSCRIPTION: 'open_login_from_subscription',
  SUBSCRIPTION_LOGIN_OPENED_EVENT: 'open_login_from_subscription',

  OPEN_SIGNUP_FROM_SUBSCRIPTION: 'open_signup_from_subscription',
  OPEN_SIGNUP_SUBSCRIPTION: 'open_signup_from_subscription',
  SUBSCRIPTION_SIGNUP_OPENED_EVENT: 'open_signup_from_subscription',

  LOGIN_FROM_SUBSCRIPTION: 'login_from_subscription',
  LOGIN_SUBSCRIPTION: 'login_from_subscription',
  SUBSCRIPTION_LOGIN_EVENT: 'login_from_subscription',

  SIGNUP_FROM_SUBSCRIPTION: 'signup_from_subscription',
  SIGNUP_SUBSCRIPTION: 'signup_from_subscription',
  SUBSCRIPTION_SIGNUP_EVENT: 'signup_from_subscription',

  // AUTH
  AUTH_TRY_LOGOUT: 'auth_logout',
  AUTH_LOGOUT: 'auth_logout',
  LOGOUT_INITIATED_EVENT: 'auth_logout',

  AUTH_LOGIN_SUCCESS: 'auth_login_success',
  AUTH_LOGIN: 'auth_login_success',
  LOGIN_SUCCESS_EVENT: 'auth_login_success',

  AUTH_SIGNUP_SUCCESS: 'auth_signup_success',
  AUTH_SIGNUP: 'auth_signup_success',
  SIGNUP_SUCCESS_EVENT: 'auth_signup_success',

  AUTH_TRY_DELETE_ACCOUNT: 'auth_delete_account',
  AUTH_DELETE_ACCOUNT: 'auth_delete_account',
  DELETE_ACCOUNT_EVENT: 'auth_delete_account',

  // CALL
  CALL_FROM_HOME_SCREEN: 'call_from_home',
  CALL_FROM_HOME: 'call_from_home',
  CALL_INITIATED_FROM_HOME: 'call_from_home',

  CALL_FROM_MY_AVATAR: 'call_from_my_avatar',
  CALL_MY_AVATAR: 'call_from_my_avatar',
  CALL_INITIATED_FROM_MY_AVATAR: 'call_from_my_avatar',

  CALL_FROM_CHAT_SCREEN: 'call_from_chat_screen',
  CALL_FROM_CHAT: 'call_from_chat_screen',
  CALL_INITIATED_FROM_CHAT_SCREEN: 'call_from_chat_screen',

  CALL_FROM_AVATAR_DETAIL: 'call_from_avatar_detail',
  CALL_AVATAR_DETAIL: 'call_from_avatar_detail',
  CALL_INITIATED_FROM_AVATAR_DETAIL: 'call_from_avatar_detail',

  CALL_FROM_FAVORITE_AVATAR: 'call_from_favorite_avatar',
  CALL_FAVORITE_AVATAR: 'call_from_favorite_avatar',
  CALL_INITIATED_FROM_FAVORITES: 'call_from_favorite_avatar',

  // CHAT
  CHAT_FROM_HOME_SCREEN: 'chat_from_home',
  CHAT_FROM_HOME: 'chat_from_home',
  CHAT_STARTED_FROM_HOME: 'chat_from_home',

  CHAT_FROM_MY_AVATAR: 'chat_from_my_avatar',
  CHAT_MY_AVATAR: 'chat_from_my_avatar',
  CHAT_STARTED_FROM_MY_AVATAR: 'chat_from_my_avatar',

  CHAT_FROM_CHAT_LIST: 'chat_from_chat_list',
  CHAT_FROM_LIST: 'chat_from_chat_list',
  CHAT_STARTED_FROM_LIST: 'chat_from_chat_list',

  CHAT_FROM_AVATAR_DETAIL: 'chat_from_avatar_detail',
  CHAT_AVATAR_DETAIL: 'chat_from_avatar_detail',
  CHAT_STARTED_FROM_AVATAR_DETAIL: 'chat_from_avatar_detail',

  CHAT_FROM_FAVORITE_AVATAR: 'chat_from_favorite_avatar',
  CHAT_FAVORITE_AVATAR: 'chat_from_favorite_avatar',
  CHAT_STARTED_FROM_FAVORITES: 'chat_from_favorite_avatar',

  // ADS
  SHOW_AD_FOR_GENERATE_FREE_AVATAR_CHAT_IMAGE:
    'ad_for_generate_free_avatar_chat_image',
  SHOW_AD_GENERATE_FREE_CHAT_IMAGE: 'ad_for_generate_free_avatar_chat_image',
  FREE_CHAT_IMAGE_AD_TRIGGERED: 'ad_for_generate_free_avatar_chat_image',

  AD_IMPRESSION: 'ad_impression',
  AD_IMPRESS: 'ad_impression',
  AD_IMPRESSION_EVENT: 'ad_impression',

  BANNER_AD_IMPRESSION: 'banner_ad_impression',
  BANNER_AD_IMPRESS: 'banner_ad_impression',
  BANNER_AD_IMPRESSION_EVENT: 'banner_ad_impression',

  NATIVE_AD_IMPRESSION: 'native_ad_impression',
  NATIVE_AD_IMPRESS: 'native_ad_impression',
  NATIVE_AD_IMPRESSION_EVENT: 'native_ad_impression',

  INTERSTITIAL_AD_IMPRESSION: 'interstitial_ad_impression',
  INTERSTITIAL_AD_IMPRESS: 'interstitial_ad_impression',
  INTERSTITIAL_AD_IMPRESSION_EVENT: 'interstitial_ad_impression',

  APP_OPEN_AD_IMPRESSION: 'app_open_ad_impression',
  APP_OPEN_AD_IMPRESS: 'app_open_ad_impression',
  APP_OPEN_AD_IMPRESSION_EVENT: 'app_open_ad_impression',

  INTERSTITIAL_AD_ERROR: 'interstitial_ad_error',
  INTERSTITIAL_ERROR: 'interstitial_ad_error',
  INTERSTITIAL_AD_ERROR_EVENT: 'interstitial_ad_error',

  SHOW_AD_FOR_GENERATE_FREE_AVATAR_IMAGE:
    'show_ad_for_generate_free_avatar_image',
  SHOW_AD_GENERATE_FREE_IMAGE: 'show_ad_for_generate_free_avatar_image',
  FREE_AVATAR_IMAGE_AD_TRIGGERED: 'show_ad_for_generate_free_avatar_image',

  // LIKE
  LIKE_FROM_HOME: 'like_from_home',
  LIKE_HOME: 'like_from_home',
  LIKE_TRIGGERED_FROM_HOME: 'like_from_home',

  LIKE_FROM_AVATAR_DETAIL: 'like_from_avatar_detail',
  LIKE_AVATAR_DETAIL: 'like_from_avatar_detail',
  LIKE_TRIGGERED_FROM_AVATAR_DETAIL: 'like_from_avatar_detail',

  LIKE_FROM_FAVORITE_AVATAR: 'like_from_favorite_avatar',
  LIKE_FAVORITE_AVATAR: 'like_from_favorite_avatar',
  LIKE_TRIGGERED_FROM_FAVORITES: 'like_from_favorite_avatar',

  // AVATAR DETAILS
  VIEW_AVATAR_DETAIL_FROM_HOME: 'view_avatar_from_home',
  VIEW_AVATAR_FROM_HOME: 'view_avatar_from_home',
  VIEW_AVATAR_FROM_HOME_EVENT: 'view_avatar_from_home',

  VIEW_AVATAR_DETAIL_FROM_MY_AVATAR: 'view_avatar_from_my_avatar',
  VIEW_AVATAR_MY_AVATAR: 'view_avatar_from_my_avatar',
  VIEW_AVATAR_FROM_MY_AVATAR_EVENT: 'view_avatar_from_my_avatar',

  VIEW_AVATAR_DETAIL_FROM_CREATE_AVATAR: 'view_avatar_from_create_avatar',
  VIEW_AVATAR_CREATE_AVATAR: 'view_avatar_from_create_avatar',
  VIEW_AVATAR_FROM_CREATE_EVENT: 'view_avatar_from_create_avatar',

  // REPORT
  REPORT_AVATAR: 'report_avatar',
  REPORT_AVATAR_ACTION: 'report_avatar',
  AVATAR_REPORTED_EVENT: 'report_avatar',
};
