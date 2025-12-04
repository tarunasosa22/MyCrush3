import { Platform } from 'react-native';
import {
  NO_ADS_PRODUCT_IDS,
  PRODUCT_BASE_IDS,
  PRODUCT_IDS_IAP,
  PRODUCT_IDS_SUBSCRIPTION,
  ProductPack,
  subscriptionIosTypes,
  subscriptionSubTypes,
  subscriptionTypes,
} from '../constants';
import analytics from '@react-native-firebase/analytics';
import { useAdsStore } from '../store/useAdsStore';
import {
  ProductIAPPlans,
  ProductSubscriptionPlans,
  userState,
} from '../store/userStore';
import { AppVideos } from '../assets/videos';

/**
 * Convert a key-value object into FormData, handling file types properly.
 */
export const buildFormDataFromObject = (
  payload: Record<string, any>,
): FormData => {
  const formData = new FormData();

  for (const key in payload) {
    const value = payload[key];
    if (value !== undefined && value !== null) {
      if (typeof value === 'object' && value.uri && value.type) {
        formData.append(key, {
          uri: value.uri,
          type: value.type || 'image/jpeg',
          name: value.name || `upload-${Date.now()}.jpg`,
        });
      } else {
        formData.append(key, value);
      }
    }
  }

  return formData;
};

/**
 * Converts milliseconds into `m:ss` format.
 */
export const formatMsToMmSs = (durationMs: number): string => {
  const totalSeconds = Math.floor(durationMs / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
};

/**
 * Formats a subscription list with pricing, credit, and selection details.
 */
export const normalizeSubscriptionList = (
  subscriptions: any[],
  selectedProductId?: string,
) => {
  const defaultProductId = PRODUCT_IDS_SUBSCRIPTION?.[1];

  if (Platform.OS === 'ios') {
    const result = subscriptions.map(subscription => {
      const credit = parseInt(
        subscription.productId.match(/\d+/)?.[0] || '0',
        10,
      );
      const isSelected =
        subscription.productId === (selectedProductId || defaultProductId);

      return {
        ...subscription,
        priceNumber: subscription.price,
        price: subscription.localizedPrice,
        credits: credit,
        id: subscription.productId,
        isSelect: isSelected,
      };
    });

    result.sort((a, b) => Number(a.priceNumber) - Number(b.priceNumber));
    return result;
  } else {
    console.log('subscriptions--->', subscriptions);
    const result = subscriptions.map(subscription => {
      // let type =

      const isSelected =
        subscription.productId === (selectedProductId || defaultProductId);

      return {
        ...subscription,
        priceNumber: subscription.price,
        price: subscription.price,
        // type: credit,
        id: subscription.productId,
        isSelect: isSelected,
      };
    });

    result.sort(
      (a, b) =>
        Number(a.oneTimePurchaseOfferDetails?.priceAmountMicros ?? 0) -
        Number(b.oneTimePurchaseOfferDetails?.priceAmountMicros ?? 0),
    );

    return result;
  }
};

export const mapSubscriptionPlans = (
  subscriptions: subscriptionSubTypes[],
  selectedPlan?: any,
  APIData?: ProductSubscriptionPlans[],
) => {
  const monthlyTokenAmount = useAdsStore.getState().oneMonthToken;
  // ANDROID
  if (Platform.OS === 'android') {
    const result = subscriptions
      .map((subscription: subscriptionSubTypes) => {
        const user = userState.getState().userData.user;
        console.log('subscription', subscription);

        const matchPlan = APIData?.find(p => {
          return p.androidProductId === subscription.basePlanId;
        });
        const formattedPrice =
          subscription?.pricingPhases?.pricingPhaseList[0]?.formattedPrice ||
          '';

        if (!formattedPrice) {
          console.warn(
            'No formatted price found for subscription:',
            subscription,
          );
          return null;
        }

        const currency = formattedPrice.charAt(0);
        const withoutCurrency = formattedPrice.substring(1);
        const [mainValue, decimalValue] = withoutCurrency.split('.');
        const tokesFromTag = parseInt(
          (subscription as any)?.offerTags && (subscription as any).offerTags.length > 0
            ? (subscription as any).offerTags?.[0]?.match(/\d+/)?.[0] ?? '0'
            : '0',
          10,
        );

        const isSelected = selectedPlan?.basePlanId
          ? subscription.basePlanId ===
            (selectedPlan?.basePlanId || matchPlan?.isSelect)
          : matchPlan?.isSelect;

        console.log('isSelected--->', selectedPlan, isSelected, matchPlan);

        const planPeriod =
          subscription.basePlanId === PRODUCT_BASE_IDS?.[0]
            ? 'PER MONTH'
            : subscription.basePlanId === PRODUCT_BASE_IDS?.[1]
            ? 'PER 3 MONTHS'
            : 'PER YEAR';

        if (
          user?.active_subscription_detail?.android_product_id ===
            subscription?.basePlanId &&
          user?.active_subscription_detail?.is_active
        ) {
          return;
        }
        return {
          ...subscription,
          id: subscription?.basePlanId,
          isPopular:
            matchPlan?.isPopular ||
            subscription?.basePlanId === PRODUCT_BASE_IDS?.[2],
          originalPrice: mainValue,
          priceNumber: mainValue,
          bgColor: '#FCE4EC',
          currency: currency,
          decimal: decimalValue || '00',
          localizedPrice: formattedPrice,
          // Essential for purchase
          offerToken: subscription?.offerToken,
          basePlanId: subscription?.basePlanId,
          planPeriod: matchPlan?.perPlanPeriod ?? planPeriod,
          perPlanTxt:
            matchPlan?.name ??
            getAndroidBillingPeriodLabel(
              subscription?.pricingPhases?.pricingPhaseList[0]?.billingPeriod,
            ),
          isSelect: isSelected,
          credits:
            matchPlan?.tokens ?? tokesFromTag
              ? matchPlan?.tokens ?? tokesFromTag
              : subscription?.basePlanId === PRODUCT_BASE_IDS?.[0]
              ? monthlyTokenAmount
              : subscription?.basePlanId === PRODUCT_BASE_IDS?.[1]
              ? monthlyTokenAmount * 3
              : monthlyTokenAmount * 12,
        };
      })
      .filter(Boolean);
    
    // Sort by price
    result.sort(
      (a: any, b: any) =>
        Number(a.pricingPhases?.pricingPhaseList[0]?.priceAmountMicros ?? 0) -
        Number(b.pricingPhases?.pricingPhaseList[0]?.priceAmountMicros ?? 0),
    );

    return result;
  }

  // IOS
  if (Platform.OS === 'ios') {
    console.log('subscription---->', subscriptions);
    const result = (subscriptions as any[]).map((subscription: subscriptionIosTypes) => {
        const user = userState.getState().userData.user;

        const matchPlan = APIData?.find(p => {
          return p.iosProductId === subscription.productId;
        });
        // iOS gives `localizedPrice` like "₹ 2,499.00"
        const localizedPrice = subscription?.localizedPrice || '';
        const currencyMatch = localizedPrice.match(/^\D+/); // match non-digits at start
        const currency = currencyMatch ? currencyMatch[0].trim() : '';
        const withoutCurrency = localizedPrice?.replace(/^\D+/, '').trim(); // remove currency symbol
        const normalizedPrice = withoutCurrency?.replace(/,/g, ''); // <--- important
        const [mainValue, decimalValue] = withoutCurrency.split('.');
        const priceNumber =
          parseFloat(normalizedPrice) || Number(subscription?.price);
        const match = subscription?.title?.match(/(\d+)\s*Credits/i);
        const tokesFromTag = match ? Number(match[1]) : null;

        const isSelected = selectedPlan?.productId
          ? subscription.productId ===
            (selectedPlan?.productId || matchPlan?.isSelect)
          : matchPlan?.isSelect;

        const planPeriod =
          subscription.productId === PRODUCT_IDS_SUBSCRIPTION?.[0]
            ? 'PER MONTH'
            : subscription.productId === PRODUCT_IDS_SUBSCRIPTION?.[1]
            ? 'PER 3 MONTHS'
            : 'PER YEAR';

        if (
          (user?.active_subscription_detail as any)?.ios_product_id ===
            subscription?.productId &&
          user?.active_subscription_detail?.is_active
        ) {
          return;
        }
        return {
          ...subscription,
          id: subscription?.productId,
          isPopular:
            matchPlan?.isPopular ||
            subscription?.productId === PRODUCT_IDS_SUBSCRIPTION?.[2],
          originalPrice: mainValue || subscription?.price,
          priceNumber,
          bgColor: '#FCE4EC',
          currency: currency || subscription?.currency,
          decimal: decimalValue || '00',
          // iOS doesn’t have offerToken/basePlanId — keep productId
          productId: subscription?.productId,
          planPeriod: matchPlan?.perPlanPeriod ?? planPeriod,
          perPlanTxt:
            matchPlan?.name ??
            getIosBillingPeriodLabel(
              subscription.subscriptionPeriodNumberIOS,
              subscription.subscriptionPeriodUnitIOS,
            ),
          isSelect: isSelected,
          basePlanId: subscription?.productId,
          credits:
            matchPlan?.tokens ?? tokesFromTag
              ? tokesFromTag
              : subscription?.productId === PRODUCT_BASE_IDS?.[0]
              ? monthlyTokenAmount
              : subscription?.productId === PRODUCT_BASE_IDS?.[1]
              ? monthlyTokenAmount * 3
              : monthlyTokenAmount * 12,
        };
    });

    // Sort by numeric price
    result
      .filter(Boolean)
      .sort((a: any, b: any) => (a.priceNumber ?? 0) - (b.priceNumber ?? 0));

    return result;
  }

  // Default fallback
  return subscriptions;
};

function getAndroidBillingPeriodLabel(period: string) {
  // Extract number of months from ISO 8601 string (PXM)
  const months = parseInt(period.replace(/[^\d]/g, ''), 10);

  if (period.toUpperCase().includes('M')) {
    // Friendly names for common plans
    if (months === 1) return 'Monthly';
    if (months === 3) return 'Quarterly';
    if (months === 6) return 'Half-Yearly';
    if (months === 12) return 'Yearly';
  } else if (period.toUpperCase().includes('Y')) {
    return 'Yearly';
  }

  // Default: show as "X Months"
  return `${months} Months`;
}

function getIosBillingPeriodLabel(number: string | number, unit: string) {
  const n = Number(number);
  const u = unit.toUpperCase();

  if (u === 'MONTH') {
    if (n === 1) return 'Monthly';
    if (n === 3) return 'Quarterly';
    if (n === 6) return 'Half-Yearly';
    if (n === 12) return 'Yearly';
    return `${n} Months`;
  } else if (u === 'YEAR') {
    return n === 1 ? 'Yearly' : `${n} Years`;
  }

  return `${n} ${unit}`;
}

export const mapAdsIapProducts = (
  subscriptions: any[],
  selectedProductId?: string,
) => {
  const result = subscriptions.map(subscription => {
    const isSelected =
      subscriptions.length === 1
        ? true
        : subscription.productId === NO_ADS_PRODUCT_IDS?.[1];

    return {
      ...subscription,
      priceNumber: subscription.price,
      price: subscription.localizedPrice,
      id: subscription.productId,
      isSelect: isSelected,
    };
  });

  result.sort(
    (a, b) =>
      Number(a.oneTimePurchaseOfferDetails?.priceAmountMicros ?? 0) -
      Number(b.oneTimePurchaseOfferDetails?.priceAmountMicros ?? 0),
  );

  return result;
};

export const mapIapProducts = (
  subscriptions: any[],
  selectedProductId?: string,
  APIData?: ProductIAPPlans[],
) => {
  const defaultProductId =
    subscriptions?.length == 1 ? PRODUCT_IDS_IAP?.[0] : PRODUCT_IDS_IAP?.[1];
  const result = subscriptions.map(subscription => {
    const matchPlan = APIData?.find(p => {
      if (Platform.OS === 'ios') {
        return p?.iosProductId === subscription?.productId;
      } else if (Platform.OS === 'android') {
        return p?.androidProductId === subscription?.productId;
      }
      return false;
    });
    const credit =
      Platform.OS == 'android'
        ? parseInt(subscription.name?.match(/\d+/)?.[0] || '0', 10)
        : parseInt(subscription.title?.match(/\d+/)?.[0] || '0', 10);

    const isSelected = selectedProductId
      ? subscription.productId === selectedProductId
      : matchPlan?.isSelect || defaultProductId;
    console.log('matchPlan--->', matchPlan);

    return {
      ...subscription,
      priceNumber: subscription.price,
      price: subscription.localizedPrice,
      display_credit_txt: matchPlan?.display_credit_txt || 'Credits',
      credits: matchPlan?.tokens ?? credit,
      id: subscription.productId,
      isSelect: isSelected,
    };
  });

  console.log('result--->', result);

  result.sort(
    (a, b) =>
      Number(a.oneTimePurchaseOfferDetails?.priceAmountMicros ?? 0) -
      Number(b.oneTimePurchaseOfferDetails?.priceAmountMicros ?? 0),
  );

  return result;
};

/**
 * Generates a timestamped filename in ddmmyy_hhmmss format.
 */
export const generateTimestampedFilename = (): string => {
  const now = new Date();
  const format = (n: number) => String(n).padStart(2, '0');

  const dd = format(now.getDate());
  const mm = format(now.getMonth() + 1);
  const yy = String(now.getFullYear()).slice(-2);
  const hh = format(now.getHours());
  const min = format(now.getMinutes());
  const ss = format(now.getSeconds());

  return `${dd}${mm}${yy}_${hh}${min}${ss}`;
};

/**
 * Returns a countdown time string like `m:ss` from remaining seconds.
 */
export const formatRemainingTime = (
  elapsedSeconds: number,
  totalSeconds: number,
): string => {
  const remaining = Math.max(0, totalSeconds - elapsedSeconds);
  const m = Math.floor((remaining % 3600) / 60);
  const s = remaining % 60;
  return `${m}:${s < 10 ? '0' : ''}${s}`;
};
export const convertMicrosToCurrency = (micros: number) => micros / 1_000_000.0;

export const logFirebaseEvent = async (
  eventName: string,
  params?: any,
): Promise<void> => {
  try {
    await analytics().logEvent(eventName, params);
  } catch (error) {
    console.error(`Error logging Firebase event '${eventName}':`, error);
  }
};

export const globalIntroList = [
  {
    id: 1,
    title: 'Let’s Create Your Dream Companion',
    description:
      'Customize their look, style, and personality — just the way you like.  It only takes a few steps!',
    video: AppVideos.intro1video,
  },
  {
    id: 2,
    title: 'Your AI Crush is Just a Message Away',
    description:
      'Chat, connect, and fall in love with your perfect virtual companion.',
    video: AppVideos.intro2video,
  },
  {
    id: 3,
    title: 'Incoming Call: Your Match Awaits',
    description:
      'Pick up the call and let the conversation flow into something exciting and unforgettable.',
    video: AppVideos.intro3video,
  },
];
