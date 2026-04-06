/**
 * `home-populate` middleware
 */

import type { Core } from '@strapi/strapi';
const populate = {
  hero: {
    populate: {
      badgeIcon: true,
      backgroundVideo: true,
      button: true,
    },
  },
  about: {
    populate: {
      imagen: true,
    },
  },
  premios: {
    populate: {
      premios: {
        populate: {
          logo: {
            fields: ["url"]
          }
        }
      }
    }
  },
  sectionMapi: {
    populate: {
      category: true
    }
  },
  peruPaquetes: {
    populate: {
      category: true
    }
  },
  boliviaPaquetes: {
    populate: {
      category: true
    }
  },
  cardPost: {
    populate: {
      blogs: true
    }
  },
  seo: {
    populate: {
      metaImage: {
        fields: ["name", "alternativeText", "url"],
      },
    },
  }
};

export default (config, { strapi }: { strapi: Core.Strapi }) => {
  // Add your own logic
  return async (ctx, next) => {
    console.dir(ctx.query, { depth: null });
    ctx.query.populate = populate;
    strapi.log.info('In home-populate middleware.');

    await next();
  };
};
