import themes from "daisyui/src/theming/themes";
import { ConfigProps } from "./types/config";

const config = {
  // REQUIRED
  appName: "AgenticVoice.net",
  // REQUIRED: a short description of your app for SEO tags (can be overwritten)
  appDescription:
    "AI voice agents for medical and legal professionals. Never miss another call with our 24/7 virtual receptionist.",
  // REQUIRED (no https://, not trailing slash at the end, just the naked domain)
  domainName: "agenticvoice.net",
  crisp: {
    // Crisp website ID. IF YOU DON'T USE CRISP: just remove this => Then add a support email in this config file (resend.supportEmail) otherwise customer support won't work.
    id: "",
    // Hide Crisp by default, except on route "/". Crisp is toggled with <ButtonSupport/>. If you want to show Crisp on every routes, just remove this below
    onlyShowOnRoutes: ["/"],
  },
  stripe: {
    // Create multiple plans in your Stripe dashboard, then add them here. You can add as many plans as you want, just make sure to add the priceId
    plans: [
      {
        // Pay Per Use tier
        priceId: process.env.STRIPE_PRICE_ID_PAYPERUSE || "",
        name: "Pay Per Use",
        description: "Perfect for trial users & seasonal practices",
        price: 0,
        priceNote: "$1.25/minute",
        features: [
          { name: "No monthly commitment" },
          { name: "Basic features only" },
          { name: "Email support only" },
          { name: "Ideal for testing (under 100 calls/month)" },
        ],
        isPayPerUse: true,
      },
      {
        // Essential tier
        priceId: process.env.STRIPE_PRICE_ID_ESSENTIAL || "",
        name: "Essential",
        description: "For micro practices & part-time practitioners",
        price: 99,
        features: [
          { name: "86 minutes included ($1.15/min value)" },
          { name: "1 AI voice agent" },
          { name: "Basic call answering & message taking" },
          { name: "Simple appointment scheduling" },
          { name: "Email support" },
          { name: "Basic call logs" },
        ],
      },
      {
        // Starter tier
        priceId: process.env.STRIPE_PRICE_ID_STARTER || "",
        name: "Starter",
        description: "For solo practitioners & small medical practices",
        price: 299,
        features: [
          { name: "300 minutes included ($0.99/min value)" },
          { name: "1 AI voice agent" },
          { name: "Basic call routing & scheduling" },
          { name: "Standard integrations" },
          { name: "Setup & training included" },
          { name: "Email support" },
        ],
      },
      {
        // Professional tier - Most Popular
        priceId: process.env.STRIPE_PRICE_ID_PROFESSIONAL || "",
        isFeatured: true,
        name: "Professional",
        description: "For small law firms & medium medical practices",
        price: 599,
        features: [
          { name: "637 minutes included ($0.94/min value)" },
          { name: "2 AI voice agents" },
          { name: "Full HIPAA/legal compliance" },
          { name: "Priority support" },
          { name: "Advanced call analytics" },
          { name: "Custom voice training" },
          { name: "Multiple system integrations" },
        ],
      },
      {
        // Business tier
        priceId: process.env.STRIPE_PRICE_ID_BUSINESS || "",
        name: "Business",
        description: "For multi-attorney firms & group practices",
        price: 999,
        features: [
          { name: "1,123 minutes included ($0.89/min value)" },
          { name: "3 AI voice agents" },
          { name: "Custom integrations" },
          { name: "Advanced analytics & reporting" },
          { name: "Dedicated support team" },
          { name: "Staff training included" },
          { name: "Multi-location support" },
        ],
      },
      {
        // Enterprise tier
        priceId: process.env.STRIPE_PRICE_ID_ENTERPRISE || "",
        name: "Enterprise",
        description: "For large firms & hospital systems",
        price: 1899,
        features: [
          { name: "2,261 minutes included ($0.84/min value)" },
          { name: "Unlimited AI voice agents" },
          { name: "White-label options available" },
          { name: "SLA guarantees" },
          { name: "Custom development" },
          { name: "Dedicated account manager" },
          { name: "24/7 phone support" },
        ],
      },
    ],
  },
  aws: {
    // If you use AWS S3/Cloudfront, put values in here
    bucket: "bucket-name",
    bucketUrl: `https://bucket-name.s3.amazonaws.com/`,
    cdn: "https://cdn-id.cloudfront.net/",
  },
  resend: {
    // REQUIRED — Email 'From' field to be used when sending magic login links
    fromNoReply: `AgenticVoice.net <noreply@agenticvoice.net>`,
    // REQUIRED — Email 'From' field to be used when sending other emails, like abandoned carts, updates etc..
    fromAdmin: `Support at AgenticVoice.net <support@agenticvoice.net>`,
    // Email shown to customer if they need support. Leave empty if not needed => if empty, set up Crisp above, otherwise you won't be able to offer customer support."
    supportEmail: "support@agenticvoice.net",
  },
  colors: {
    // REQUIRED — The DaisyUI theme to use (added to the main layout.js). Leave blank for default (light & dark mode). If you use any theme other than light/dark, you need to add it in config.tailwind.js in daisyui.themes.
    theme: "light",
    // REQUIRED — This color will be reflected on the whole app outside of the document (loading bar, Chrome tabs, etc..). By default it takes the primary color from your DaisyUI theme (make sure to update your the theme name after "data-theme=")
    // OR you can just do this to use a custom color: main: "#f37055". HEX only.
    main: themes["light"]["primary"],
  },
  auth: {
    // REQUIRED — the path to log in users. It's use to protect private routes (like /dashboard). It's used in apiClient (/libs/api.js) upon 401 errors from our API
    loginUrl: "/api/auth/signin",
    // REQUIRED — the path you want to redirect users to after a successful login (i.e. /dashboard, /private). This is normally a private page for users to manage their accounts. It's used in apiClient (/libs/api.js) upon 401 errors from our API & in ButtonSignin.js
    callbackUrl: "/dashboard",
  },
} as ConfigProps;

export default config;
