/**
 * `populate-page` middleware
 */

import type { Core } from '@strapi/strapi';

const populate = {
  category: true,
  video: {
    populate: {
      thumbnail: {
        fields: ["url"]
      }
    }
  },
  preguntasAcordeon: true
}

export default (config, { strapi }: { strapi: Core.Strapi }) => {
  // Add your own logic here.
  return async (ctx, next) => {
    ctx.query.populate = populate;
    strapi.log.info('In populate-page middleware.');

    await next();
  };
};
