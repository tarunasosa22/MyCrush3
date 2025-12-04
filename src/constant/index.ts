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
