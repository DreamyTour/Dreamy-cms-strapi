/**
 * `gallery-middleware` middleware
 */

import type { Core } from '@strapi/strapi';

const populate = {
  galeria: {
    populate:{
      imagen: {
        populate:{
          fields:["url"],
        },
      },
    }
  },
};
export default (config, { strapi }: { strapi: Core.Strapi }) => {
  return async (ctx, next) => {
    console.dir(ctx.query, { depth: null });
    ctx.query.populate = populate;
    strapi.log.info('In gallery-middleware middleware.');

    await next();  
  };
};
