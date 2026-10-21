// import type { Core } from '@strapi/strapi';
import { registerTableValidation } from './extensions/table-validation';
import { configureTourMapEditor } from './extensions/tour-map-editor';
import { configureTourGeneralFields } from './extensions/tour-general-fields';
import { configurePageEditorLayout } from './extensions/page-editor-layout';

export default {
  /**
   * An asynchronous register function that runs before
   * your application is initialized.
   */
  register({ strapi }) {
    registerTableValidation();
    strapi.customFields.register({name:'tour-route-plan',type:'json',inputSize:{default:12,isResizable:false}});
  },

  /**
   * An asynchronous bootstrap function that runs before
   * your application gets started.
   */
  async bootstrap({ strapi }) {
    await configureTourMapEditor(strapi);
    await configureTourGeneralFields(strapi);
    await configurePageEditorLayout(strapi);
  },
};
