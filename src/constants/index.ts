import { Dimensions, Platform } from 'react-native';
import * as Clarity from '@microsoft/react-native-clarity';
import { userState } from '../store/userStore';
export const SCREEN_WIDTH = Dimensions.get('screen').width;
export const SCREEN_HEIGHT = Dimensions.get('screen').height;

export const PRODUCT_IDS_IAP = Platform.select({
  ios: userState.getState()?.productIAPIds ?? ['100_token_product'],
  android: userState.getState()?.productIAPIds ?? ['100_tokens_product'],
});

export const NO_ADS_PRODUCT_IDS = Platform.select({
  ios: ['no_ads_plan_1'],
  android: ['no_ads_plan_1'],
});

export const PRODUCT_IDS_SUBSCRIPTION = Platform.select({
  ios: userState.getState()?.productSubscriptionIds ?? [
    '1_monthly_plan',
    '3_monthly_plan',
    '1_yearly_plan',
  ],
  android: ['ai_dating_subscription'],
});

export const PRODUCT_BASE_IDS = Platform.select({
  ios: userState.getState()?.productSubscriptionIds ?? [
    '1_monthly_plan',
    '3_monthly_plan',
    '1_yearly_plan',
  ],
  android: userState.getState()?.productSubscriptionIds ?? [
    '1-month-plan',
    'quarterly-plan',
    'annually-plan',
  ],
});

export const adsKeyword = [
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

export const privacyPolicyContent = `
Effective Date: 13rd November, 2025
Developer: Womline Fashion
Email: matariyabipin08@gmail.com

Introduction
AI Crush: Virtual Soulmate Chat, operated by Womline Fashion, respects and values your privacy.
 This Privacy Policy (“Policy”) explains how we collect, use, store, protect, and share your information when you use our AI companion and chat application.

By using the app, you agree to the terms of this Privacy Policy.
 If you do not agree, please discontinue using the app.
 For any questions or concerns, contact us at 📧 matariyabipin08@gmail.com.

1. Information We Collect
We may collect the following types of information to provide and improve your experience:

a. Information You Provide
Chat content (messages, text, or images shared with your AI companion).
Profile details (such as name or email address, if provided).
Contact details when you register, subscribe, or contact support.

b. Information Collected Automatically
Device information (model, OS version, language settings).
App usage statistics (features used, time spent, in-app interactions).
IP address and approximate location (to optimize app functionality).

c. Information from Third-Party Services
Our app may use third-party tools and SDKs that collect information to help us provide better service.

These may include:
Google Play Services – for app distribution and account integration.
Google Analytics for Firebase – for analyzing app usage and improving user experience.
AdMob – for displaying and measuring ads.
Firebase Crashlytics – for crash reporting and stability improvement.
We are not responsible for the privacy practices of third-party providers. Please review their privacy policies individually for more details.

2. How We Use Your Information
Your information is used for the following purposes:
To provide, maintain, and improve our AI chat and companion experience.
To personalize your AI Crush interactions.
To respond to customer inquiries or support requests.
To maintain app security and performance.
To send optional updates, offers, or notifications (if you choose to receive them).

3. Permissions We Request
To enable full functionality, the app may request access to:
Camera: For uploading or customizing profile pictures.
Microphone: For voice-based chat or interaction.
Storage: For saving or accessing shared media.
You can modify these permissions anytime in your device settings.

4. Cookies and Tracking Technologies
We do not use cookies directly. However, third-party services (such as AdMob or Firebase) may use cookies or identifiers to enhance performance and provide analytics. We do not access or store these cookies ourselves.

5. Data Sharing
We do not sell or share your personal data with any third parties, except:
When you give explicit consent.
When required by law or legal request.
When necessary to provide services via trusted partners (e.g., analytics or payment systems).
All third parties we work with are required to maintain confidentiality and data protection standards.

6. Data Storage & Security
Your data is stored securely using encryption and restricted access controls.
 We retain your information only as long as needed to operate our services effectively.
 You can request deletion of your data anytime by contacting us at matariyabipin08@gmail.com.

7. In-App Purchases
AI Crush: Virtual Soulmate Chat may offer optional in-app purchases for premium content, exclusive features, or enhanced customization.
All purchases are processed securely via Google Play Billing or other authorized payment processors.

Payment Information
We do not collect or store payment details.
All payment data is securely handled by the official platform (e.g., Google Play).
You can manage or cancel subscriptions anytime through your device’s account settings.

8. Children’s Privacy
Our app is intended for users aged 13 and above.
 We do not knowingly collect personal data from children under 13.
 If you believe a child has shared personal information with us, please contact us immediately for deletion.

9. Data Retention and Deletion
We keep user data only as long as necessary to provide our services and comply with legal obligations.
 You may request deletion of your account data anytime via email at matariyabipin08@gmail.com.

10. Changes to This Privacy Policy
We may update this Privacy Policy periodically. The latest revision date will always be displayed at the top of this page.
 Continued use of the app means you accept the updated policy.

11. Acceptance of This Policy
By using AI Crush: Virtual Soulmate Chat, you acknowledge that you have read and agreed to this Privacy Policy and our Terms of Use.

12. Target Audience and Content
AI Crush: Virtual Soulmate Chat is intended for individuals who are 16 years of age and older. The features, conversations, and interactive elements within the app are designed for a mature teenage and adult audience. While the app may include AI-generated responses that are emotional, romantic, or personal in nature, it does not provide, promote, or allow any explicit, sexual, abusive, or harmful content.

13. Contact Us
If you have any questions, concerns, or requests about this Privacy Policy, please contact us at:
 📧 matariyabipin08@gmail.com
`;

export const privacyPolicyURL =
  'https://womlinefashion.blogspot.com/2025/11/ai-crush-privacy-policy.html';
export const termsAndConditionsURL =
  'https://womlinefashion.blogspot.com/2025/11/ai-crush-terms-and-conditions.html';

export const IOS_APP_ID = '6752380186';
export const ANDROID_PACKAGE_NAME = 'com.sugar.soulmate.dearmgf.girl';
export const IOS_PACKAGE_NAME = 'com.sugar.soulmate.dearmgf.girl';
export const PACKAGE_NAME =
  Platform.OS == 'ios' ? IOS_PACKAGE_NAME : ANDROID_PACKAGE_NAME;

export const PUBLIC_KEY_ENCRYPTION = `-----BEGIN PUBLIC KEY-----\nMIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEAlOKdbXIpPdzhP02FzmAS\n6cnELnyo5xc0X0OsPTZL73nNoXBWQneK1DxyMnrx1IhCaBO0W8MHLmIQjDCZ94ZS\n0gCYkocb4JpjIm/Ub3nBNLd0gpv3jnz4p1bzkcVMtw2v6lJMY18tYgnDgllYUOf/\n+92QWD6Ow7VzI3kOsMM7yORC9O249jPVxEbHv2jMb6GfEGo8WhtShhgqpqJJyLaM\nXXbynXHIhh5vtyyD+wocRqaprGiqQjbqaObz0JZZv9CAh2/c5WtXY93VEAXgiWD4\n4CDfnPwD0CnyXMrNS6Bt95AV+z+xXVeDre3WcGd058X3TIsgU5qGqVAW/Y7otlGX\nSQIDAQAB\n-----END PUBLIC KEY-----`;

export const setCurrentScreenTrack = (screenName?: string) => {
  Clarity.setCurrentScreenName(screenName ?? null);
};
// constants.ts
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

export const PLAY_STORE_LINK1 = `https://play.google.com/store/apps/details?id=${ANDROID_PACKAGE_NAME}`;
export const APP_STORE_LINK1 = `https://apps.apple.com/us/app/my-crush-ai-soulmate-chat/id6752380186`;
export const APP_URL =
  Platform.OS === 'ios' ? APP_STORE_LINK1 : PLAY_STORE_LINK1;

export const GENERATE_IMAGE_MESSAGE = '__GENERATE_IMAGE__';

export const EVENT_NAME = {
  ONBOARDING_START_AS_GUEST: 'onboarding_start_as_guest',
  // Alternative name
  START_AS_GUEST: 'onboarding_start_as_guest',

  //SUBSCRIPTION & IN APP PURCHASE
  PURCHASED_SUCCESS: 'purchased_success',
  PURCHASE_SUCCESS: 'purchased_success',

  SELECTED_PURCHASE_PLAN: 'selected_purchase_plan',
  SELECT_PURCHASE_PLAN: 'selected_purchase_plan',

  CLOSE_SUBSCRIPTION_PAGE: 'close_subscription_page',
  CLOSE_SUBSCRIPTION: 'close_subscription_page',

  OPEN_LOGIN_FROM_SUBSCRIPTION: 'open_login_from_subscription',
  OPEN_LOGIN_SUBSCRIPTION: 'open_login_from_subscription',

  OPEN_SIGNUP_FROM_SUBSCRIPTION: 'open_signup_from_subscription',
  OPEN_SIGNUP_SUBSCRIPTION: 'open_signup_from_subscription',

  LOGIN_FROM_SUBSCRIPTION: 'login_from_subscription',
  LOGIN_SUBSCRIPTION: 'login_from_subscription',

  SIGNUP_FROM_SUBSCRIPTION: 'signup_from_subscription',
  SIGNUP_SUBSCRIPTION: 'signup_from_subscription',

  // AUTH
  AUTH_TRY_LOGOUT: 'auth_logout',
  AUTH_LOGOUT: 'auth_logout',

  AUTH_LOGIN_SUCCESS: 'auth_login_success',
  AUTH_LOGIN: 'auth_login_success',

  AUTH_SIGNUP_SUCCESS: 'auth_signup_success',
  AUTH_SIGNUP: 'auth_signup_success',

  AUTH_TRY_DELETE_ACCOUNT: 'auth_delete_account',
  AUTH_DELETE_ACCOUNT: 'auth_delete_account',

  //CALL
  CALL_FROM_HOME_SCREEN: 'call_from_home',
  CALL_FROM_HOME: 'call_from_home',

  CALL_FROM_MY_AVATAR: 'call_from_my_avatar',
  CALL_MY_AVATAR: 'call_from_my_avatar',

  CALL_FROM_CHAT_SCREEN: 'call_from_chat_screen',
  CALL_FROM_CHAT: 'call_from_chat_screen',

  CALL_FROM_AVATAR_DETAIL: 'call_from_avatar_detail',
  CALL_AVATAR_DETAIL: 'call_from_avatar_detail',

  CALL_FROM_FAVORITE_AVATAR: 'call_from_favorite_avatar',
  CALL_FAVORITE_AVATAR: 'call_from_favorite_avatar',

  //CHAT
  CHAT_FROM_HOME_SCREEN: 'chat_from_home',
  CHAT_FROM_HOME: 'chat_from_home',

  CHAT_FROM_MY_AVATAR: 'chat_from_my_avatar',
  CHAT_MY_AVATAR: 'chat_from_my_avatar',

  CHAT_FROM_CHAT_LIST: 'chat_from_chat_list',
  CHAT_FROM_LIST: 'chat_from_chat_list',

  CHAT_FROM_AVATAR_DETAIL: 'chat_from_avatar_detail',
  CHAT_AVATAR_DETAIL: 'chat_from_avatar_detail',

  CHAT_FROM_FAVORITE_AVATAR: 'chat_from_favorite_avatar',
  CHAT_FAVORITE_AVATAR: 'chat_from_favorite_avatar',

  SHOW_AD_FOR_GENERATE_FREE_AVATAR_CHAT_IMAGE:
    'ad_for_generate_free_avatar_chat_image',
  SHOW_AD_GENERATE_FREE_CHAT_IMAGE:
    'ad_for_generate_free_avatar_chat_image',

  //LIKE
  LIKE_FROM_HOME: 'like_from_home',
  LIKE_HOME: 'like_from_home',

  LIKE_FROM_AVATAR_DETAIL: 'like_from_avatar_detail',
  LIKE_AVATAR_DETAIL: 'like_from_avatar_detail',

  LIKE_FROM_FAVORITE_AVATAR: 'like_from_favorite_avatar',
  LIKE_FAVORITE_AVATAR: 'like_from_favorite_avatar',

  //AVATAR_DETAIL
  VIEW_AVATAR_DETAIL_FROM_HOME: 'view_avatar_from_home',
  VIEW_AVATAR_FROM_HOME: 'view_avatar_from_home',

  VIEW_AVATAR_DETAIL_FROM_MY_AVATAR: 'view_avatar_from_my_avatar',
  VIEW_AVATAR_MY_AVATAR: 'view_avatar_from_my_avatar',

  VIEW_AVATAR_DETAIL_FROM_CREATE_AVATAR: 'view_avatar_from_create_avatar',
  VIEW_AVATAR_CREATE_AVATAR: 'view_avatar_from_create_avatar',

  AD_IMPRESSION: 'ad_impression',
  AD_IMPRESS: 'ad_impression',

  BANNER_AD_IMPRESSION: 'banner_ad_impression',
  BANNER_AD_IMPRESS: 'banner_ad_impression',

  NATIVE_AD_IMPRESSION: 'native_ad_impression',
  NATIVE_AD_IMPRESS: 'native_ad_impression',

  INTERSTITIAL_AD_IMPRESSION: 'interstitial_ad_impression',
  INTERSTITIAL_AD_IMPRESS: 'interstitial_ad_impression',

  APP_OPEN_AD_IMPRESSION: 'app_open_ad_impression',
  APP_OPEN_AD_IMPRESS: 'app_open_ad_impression',

  INTERSTITIAL_AD_ERROR: 'interstitial_ad_error',
  INTERSTITIAL_ERROR: 'interstitial_ad_error',

  SHOW_AD_FOR_GENERATE_FREE_AVATAR_IMAGE:
    'show_ad_for_generate_free_avatar_image',
  SHOW_AD_GENERATE_FREE_IMAGE: 'show_ad_for_generate_free_avatar_image',

  //REPORT MODEL
  REPORT_AVATAR: 'report_avatar',
  REPORT_AVATAR_ACTION: 'report_avatar',
};

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
  display_credit_txt?: string;
}

export interface subscriptionSubTypes {
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

export type subscriptionTypes = {
  description: '';
  displayName: string;
  id: string;
  name: string;
  platform: string;
  productId: string;
  productType: string;
  subscriptionOfferDetails: subscriptionSubTypes[];
  type: string;
  title: string;
};

export const adTypes = {
  native: 'native',
  banner: 'banner',
};

export type subscriptionIosTypes = {
  currency: string; // e.g. "INR"
  countryCode: string; // e.g. ""
  subscriptionPeriodUnitIOS: string; // e.g. "MONTH"
  type: string; // e.g. "subs"
  localizedPrice: string; // e.g. "₹ 2,499.00"
  introductoryPriceSubscriptionPeriodIOS: string; // e.g. ""
  introductoryPriceAsAmountIOS: string; // e.g. ""
  discounts: any[]; // array of discount objects if present
  title: string; // e.g. "1 Month Plan"
  description: string; // e.g. "1-Month access..."
  introductoryPrice: string; // e.g. ""
  productId: string; // e.g. "1_monthly_plan"
  subscriptionPeriodNumberIOS: string; // e.g. "1"
  introductoryPricePaymentModeIOS: string; // e.g. ""
  introductoryPriceNumberOfPeriodsIOS: string; // e.g. ""
  price: string; // e.g. "2499" (numeric as string)
  platform: string; // e.g. "ios"
  offerTags: [];
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
};
