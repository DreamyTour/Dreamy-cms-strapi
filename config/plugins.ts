import type { Core } from '@strapi/strapi';

const config = ({ env }: Core.Config.Shared.ConfigParams): Core.Config.Plugin => {
  const r2Config = {
    accessKeyId: env("CF_ACCESS_KEY_ID"),
    secretAccessKey: env("CF_ACCESS_SECRET"),
    endpoint: env("CF_ENDPOINT"),
    bucket: env("CF_BUCKET"),
  };
  const hasR2Config = Object.values(r2Config).every(Boolean);
  const isProduction = env("NODE_ENV", "development") === "production";

  if (!hasR2Config && isProduction) {
    throw new Error(
      "Falta la configuración de Cloudflare R2 para las subidas de archivos en producción.",
    );
  }

  return {
    seo: {
      enabled: true,
    },
    upload: {
      config: hasR2Config
        ? {
            provider: "strapi-provider-cloudflare-r2",
            providerOptions: {
              accessKeyId: r2Config.accessKeyId,
              secretAccessKey: r2Config.secretAccessKey,
              endpoint: r2Config.endpoint,
              region: "auto",
              params: {
                Bucket: r2Config.bucket,
              },
              cloudflarePublicAccessUrl: env("CF_PUBLIC_ACCESS_URL"),
              pool: false,
            },
            actionOptions: {
              upload: {},
              uploadStream: {},
              delete: {},
            },
          }
        : {
            // En local permite probar imágenes aunque no se disponga de R2.
            provider: "local",
          },
    },
  };
};

export default config;

