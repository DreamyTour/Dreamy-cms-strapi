/**
 * category-blog router
 */

import { factories } from '@strapi/strapi';

export default factories.createCoreRouter('api::category-blog.category-blog', {
  config: {
    find: {
      middlewares: ['api::category-blog.category-blog-populate'],
    },
    findOne: {
      middlewares: ['api::category-blog.category-blog-populate'],
    },
  },
});
