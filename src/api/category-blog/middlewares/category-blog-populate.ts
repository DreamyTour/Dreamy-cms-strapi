/**
 * `category-blog-populate` middleware
 */

import type { Core } from '@strapi/strapi';

const populate = {
  imagenDestacada: true,
  seo: {
    populate: {
      metaImage: {
        fields: ["name", "alternativeText", "url"],
      },
    },
  },
};

export default (config, { strapi }: { strapi: Core.Strapi }) => {
  return async (ctx, next) => {
    ctx.query.populate = populate;
    strapi.log.info('In category-blog-populate middleware.');

    await next();
  };
};
