/**
 * `tours-pupulate` middleware
 */

import type { Core } from '@strapi/strapi';

const populate = {
  imagenDestacada: true,

  badge: true,

  tab: {
    populate: {
      overview: {
        populate: {
          timeline: true,
        },
      },

      itinerary: {
        populate: {
          acordeon: true,
        },
      },

      included: true,

      information: {
        populate: {
          acordeon: true,
        },
      },

      price: true,

        maps: {
          populate: {
            mapstops: {
              populate: {
                imagen: true,
              },
            },
          },
        },
    },
  },

  categories: true,
  seo: {
    populate: {
      metaImage: {
        fields: ["name", "alternativeText", "url"],
      },
    },
  },
};

export default (config, { strapi }: { strapi: Core.Strapi }) => {
  // Add your own logic here.
  return async (ctx, next) => {
    console.dir(ctx.query, { depth: null });
    ctx.query.populate = populate;
    strapi.log.info('In tours-pupulate middleware.');

    await next();
  };
};
