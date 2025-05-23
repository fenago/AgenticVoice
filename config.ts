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
        // REQUIRED — we use this to find the plan in the webhook (for instance if you want to update the user's credits based on the plan)
        priceId:
          process.env.NODE_ENV === "development"
            ? "price_1Niyy5AxyNprDp7iZIqEyD2h"
            : "price_456",
        //  REQUIRED - Name of the plan, displayed on the pricing page
        name: "Essential",
        // A friendly description of the plan, displayed on the pricing page. Tip: explain why this plan and not others
        description: "Perfect for small practices with basic needs",
        // The price you want to display, the one user will be charged on Stripe.
        price: 499,
        // If you have an anchor price (i.e. $29) that you want to display crossed out, put it here. Otherwise, leave it empty
        priceAnchor: 699,
        features: [
          { name: "1 AI Employee for your practice" },
          { name: "Up to 5,000 minutes per month" },
          { name: "Business hours availability (8am-6pm)" },
          { name: "Appointment scheduling" },
          { name: "Basic FAQ handling" },
          { name: "Single integration with your EHR/PMS" },
          { name: "Email support" },
        ],
      },
      {
        priceId:
          process.env.NODE_ENV === "development"
            ? "price_1O5KtcAxyNprDp7iftKnrrpw"
            : "price_456",
        // This plan will look different on the pricing page, it will be highlighted. You can only have one plan with isFeatured: true
        isFeatured: true,
        name: "Professional",
        description: "The complete solution for growing practices",
        price: 899,
        priceAnchor: 1299,
        features: [
          { name: "2 AI Employees for your practice" },
          { name: "Up to 12,000 minutes per month" },
          { name: "24/7 availability" },
          { name: "Advanced appointment management" },
          { name: "Custom voice and personality options" },
          { name: "Patient/client intake automation" },
          { name: "Integrations with up to 3 systems" },
          { name: "Priority email and chat support" },
        ],
      },
      {
        priceId:
          process.env.NODE_ENV === "development"
            ? "price_1O5KtcAxyNprDp7iftKnrrpw"
            : "price_789",
        name: "Enterprise",
        description: "Custom solution for large multi-location practices",
        price: 1799,
        priceAnchor: 2499,
        features: [
          { name: "5+ AI Employees for your practice" },
          { name: "Unlimited minutes" },
          { name: "24/7 availability with priority routing" },
          { name: "Multi-location support" },
          { name: "Custom workflows and scripts" },
          { name: "HIPAA/compliance documentation" },
          { name: "Unlimited integrations" },
          { name: "Dedicated account manager" },
          { name: "24/7 phone and email support" },
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
