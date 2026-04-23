/**
 * client-gallerie router
 */

import { factories } from '@strapi/strapi';

export default factories.createCoreRouter('api::client-gallerie.client-gallerie', {
  config: {
    find: {
      middlewares: ['api::client-gallerie.gallery-middleware'],
    },
  },
});
