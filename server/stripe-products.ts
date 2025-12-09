// Stripe Products and Pricing Configuration
// This file defines all subscription plans and one-time products

export const SUBSCRIPTION_PLANS = {
  // Institution Plans (Super Admin & Institution Admin)
  INSTITUTION_BASIC_MONTHLY: {
    name: "Institution Basic (Monthly)",
    priceId: "price_institution_basic_monthly", // Will be created in Stripe
    amount: 9900, // $99/month
    currency: "usd",
    interval: "month",
    features: [
      "Up to 3 branches",
      "Up to 100 students per branch",
      "Basic AI tutoring features",
      "Standard support",
      "Basic analytics",
    ],
    limits: {
      maxBranches: 3,
      maxStudentsPerBranch: 100,
    },
  },
  INSTITUTION_BASIC_ANNUAL: {
    name: "Institution Basic (Annual)",
    priceId: "price_institution_basic_annual",
    amount: 95040, // $950.40/year (20% discount)
    currency: "usd",
    interval: "year",
    features: [
      "Up to 3 branches",
      "Up to 100 students per branch",
      "Basic AI tutoring features",
      "Standard support",
      "Basic analytics",
      "20% annual discount",
    ],
    limits: {
      maxBranches: 3,
      maxStudentsPerBranch: 100,
    },
  },
  INSTITUTION_PREMIUM_MONTHLY: {
    name: "Institution Premium (Monthly)",
    priceId: "price_institution_premium_monthly",
    amount: 24900, // $249/month
    currency: "usd",
    interval: "month",
    features: [
      "Up to 10 branches",
      "Up to 500 students per branch",
      "Advanced AI tutoring + avatars",
      "Priority support",
      "Advanced analytics & reporting",
      "Custom branding",
    ],
    limits: {
      maxBranches: 10,
      maxStudentsPerBranch: 500,
    },
  },
  INSTITUTION_PREMIUM_ANNUAL: {
    name: "Institution Premium (Annual)",
    priceId: "price_institution_premium_annual",
    amount: 239040, // $2,390.40/year (20% discount)
    currency: "usd",
    interval: "year",
    features: [
      "Up to 10 branches",
      "Up to 500 students per branch",
      "Advanced AI tutoring + avatars",
      "Priority support",
      "Advanced analytics & reporting",
      "Custom branding",
      "20% annual discount",
    ],
    limits: {
      maxBranches: 10,
      maxStudentsPerBranch: 500,
    },
  },
  INSTITUTION_ENTERPRISE_MONTHLY: {
    name: "Institution Enterprise (Monthly)",
    priceId: "price_institution_enterprise_monthly",
    amount: 49900, // $499/month
    currency: "usd",
    interval: "month",
    features: [
      "Unlimited branches",
      "Unlimited students",
      "Full AI feature suite",
      "24/7 dedicated support",
      "Custom integrations",
      "White-label options",
      "API access",
    ],
    limits: {
      maxBranches: -1, // unlimited
      maxStudentsPerBranch: -1, // unlimited
    },
  },
  INSTITUTION_ENTERPRISE_ANNUAL: {
    name: "Institution Enterprise (Annual)",
    priceId: "price_institution_enterprise_annual",
    amount: 479040, // $4,790.40/year (20% discount)
    currency: "usd",
    interval: "year",
    features: [
      "Unlimited branches",
      "Unlimited students",
      "Full AI feature suite",
      "24/7 dedicated support",
      "Custom integrations",
      "White-label options",
      "API access",
      "20% annual discount",
    ],
    limits: {
      maxBranches: -1,
      maxStudentsPerBranch: -1,
    },
  },

  // Parent/Student Plans
  PARENT_MONTHLY: {
    name: "Student Monthly Subscription",
    priceId: "price_parent_monthly",
    amount: 2900, // $29/month per student
    currency: "usd",
    interval: "month",
    features: [
      "Full AI tutoring access",
      "Unlimited lessons & assessments",
      "Progress tracking",
      "Parent dashboard",
      "Doubt clearing sessions",
    ],
  },
  PARENT_ANNUAL: {
    name: "Student Annual Subscription",
    priceId: "price_parent_annual",
    amount: 27840, // $278.40/year (20% discount)
    currency: "usd",
    interval: "year",
    features: [
      "Full AI tutoring access",
      "Unlimited lessons & assessments",
      "Progress tracking",
      "Parent dashboard",
      "Doubt clearing sessions",
      "20% annual discount",
    ],
  },
} as const;

export const ONE_TIME_PRODUCTS = {
  // Course Purchases
  COURSE_JEE_MAIN: {
    name: "JEE Main Complete Course",
    priceId: "price_course_jee_main",
    amount: 14900, // $149 one-time
    currency: "usd",
    description: "Complete JEE Main preparation with AI-powered tutoring",
  },
  COURSE_JEE_ADVANCED: {
    name: "JEE Advanced Complete Course",
    priceId: "price_course_jee_advanced",
    amount: 19900, // $199 one-time
    currency: "usd",
    description: "Advanced JEE preparation with personalized AI guidance",
  },
  COURSE_NEET: {
    name: "NEET Complete Course",
    priceId: "price_course_neet",
    amount: 17900, // $179 one-time
    currency: "usd",
    description: "Comprehensive NEET preparation with AI tutoring",
  },
  COURSE_CBSE_10: {
    name: "CBSE Class 10 Complete Course",
    priceId: "price_course_cbse_10",
    amount: 9900, // $99 one-time
    currency: "usd",
    description: "Full CBSE Class 10 curriculum with AI support",
  },
  COURSE_CBSE_12: {
    name: "CBSE Class 12 Complete Course",
    priceId: "price_course_cbse_12",
    amount: 11900, // $119 one-time
    currency: "usd",
    description: "Complete CBSE Class 12 preparation",
  },
  COURSE_SAT: {
    name: "SAT Complete Course",
    priceId: "price_course_sat",
    amount: 24900, // $249 one-time
    currency: "usd",
    description: "Comprehensive SAT preparation with AI tutoring",
  },
  COURSE_GMAT: {
    name: "GMAT Complete Course",
    priceId: "price_course_gmat",
    amount: 29900, // $299 one-time
    currency: "usd",
    description: "Full GMAT preparation with adaptive AI learning",
  },
  COURSE_GRE: {
    name: "GRE Complete Course",
    priceId: "price_course_gre",
    amount: 27900, // $279 one-time
    currency: "usd",
    description: "Complete GRE preparation with personalized AI guidance",
  },
} as const;

// Trial period configuration
export const TRIAL_PERIOD_DAYS = 14;

// Bulk student discounts for institutions
export const BULK_STUDENT_DISCOUNTS = [
  { minStudents: 100, discountPercent: 10 },
  { minStudents: 500, discountPercent: 15 },
  { minStudents: 1000, discountPercent: 20 },
  { minStudents: 5000, discountPercent: 25 },
];

// Helper to get plan by ID
export function getPlanById(planId: keyof typeof SUBSCRIPTION_PLANS) {
  return SUBSCRIPTION_PLANS[planId];
}

// Helper to get product by ID
export function getProductById(productId: keyof typeof ONE_TIME_PRODUCTS) {
  return ONE_TIME_PRODUCTS[productId];
}

// Helper to calculate bulk discount
export function calculateBulkDiscount(studentCount: number): number {
  for (let i = BULK_STUDENT_DISCOUNTS.length - 1; i >= 0; i--) {
    if (studentCount >= BULK_STUDENT_DISCOUNTS[i].minStudents) {
      return BULK_STUDENT_DISCOUNTS[i].discountPercent;
    }
  }
  return 0;
}
