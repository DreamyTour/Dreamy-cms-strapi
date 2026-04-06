/**
 * tour router
 */

import { factories } from '@strapi/strapi';

export default factories.createCoreRouter('api::tour.tour', {
  config: {
    find: {
      middlewares: ['api::tour.tours-pupulate']
    }
  }
});
