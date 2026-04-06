/**
 * `global-populate` middleware
 */

import type { Core } from "@strapi/strapi";
const populate = {
  topBar: {
    populate: {
      link: true,
    },
  },

  headerTop: {
    populate: {
      logo: {
        populate: {
          imagen: {
            fields: ["name", "alternativeText", "url"],
          },
        },
      },
      headerLink: true,
      button: true,
    },
  },

  menu: {
    populate: {
      menuItems: {
        populate: {
          link: true,
          item: true,
        },
      },
    },
  },

  footer: {
    populate: {
      logo: {
        populate: {
          imagen: {
            fields: ["name", "alternativeText", "url"],
          },
        },
      },
      socialLogo: {
        populate: {
          imagen: {
            fields: ["name", "alternativeText", "url"],
          },
        },
      },
      destination: {
        populate: {
          link: true,
        }
      },
      dreamyAbout: {
        populate: {
          link: true,
        }
      },
      contact: {
        populate: {
          link: true,
        }
      },
      certificaciones: {
        populate: {
          premios: {
            populate: {
              logo: {
                fields: ["name", "alternativeText", "url"],
              }
            }
          }
        }
      }
    },
  }
};

export default (config, { strapi }: { strapi: Core.Strapi }) => {
  // Add your own logic here.
  return async (ctx, next) => {
    console.dir(ctx.query, { depth: null });
    ctx.query.populate = populate;
    strapi.log.info("In global-populate middleware.");

    await next();
  };
};
