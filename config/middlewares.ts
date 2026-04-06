import type { Core } from '@strapi/strapi';

const config: Core.Config.Middlewares = [
  'strapi::logger',
  'strapi::errors',

  {
    name: 'strapi::security',
    config: {
      contentSecurityPolicy: {
        useDefaults: true,
        directives: {
          "connect-src": ["'self'", "https:"],
          "img-src": [
            "'self'",
            "data:",
            "blob:",
            "market-assets.strapi.io",
            process.env.CF_PUBLIC_ACCESS_URL
              ? process.env.CF_PUBLIC_ACCESS_URL.replace(/^https?:\/\//, "")
              : "",
          ],
          "media-src": [
            "'self'",
            "data:",
            "blob:",
            "market-assets.strapi.io",
            process.env.CF_PUBLIC_ACCESS_URL
              ? process.env.CF_PUBLIC_ACCESS_URL.replace(/^https?:\/\//, "")
              : "",
          ],
          upgradeInsecureRequests: null,
        },
      },
    },
  },

  'strapi::cors',
  'strapi::poweredBy',
  'strapi::query',
  'strapi::body',
  'strapi::session',
  'strapi::favicon',
  'strapi::public',
];

export default config;

