// import type { Core } from '@strapi/strapi';

export default {
  /**
   * An asynchronous register function that runs before
   * your application is initialized.
   */
  register(/* { strapi }: { strapi: Core.Strapi } */) {},

  /**
   * An asynchronous bootstrap function that runs before
   * your application gets started.
   */
  bootstrap({ strapi }) {
    // Escucha todos los eventos del ciclo de vida de la base de datos
    strapi.db.lifecycles.subscribe((event) => {
      const { action, model } = event;

      // Filtramos para que solo reaccione a los modelos principales (tours, categorias, etc)
      // y no a configuraciones internas o creación de usuarios administradores.
      const isApiContent = model.uid && model.uid.startsWith('api::');
      const isMutation = action === 'afterCreate' || action === 'afterUpdate' || action === 'afterDelete';

      if (isApiContent && isMutation) {
        // Obtenemos el token desde el archivo .env de Strapi
        const githubToken = process.env.GITHUB_PAT;
        // Reemplaza esto con tu usuario y nombre del repo exactos si varían
        const repoOwner = 'Nilocastillo';
        const repoName = 'dreamy-front';

        if (!githubToken) {
          strapi.log.warn('GITHUB_PAT no está configurado. No se disparará el webhook a Github Actions.');
          return;
        }

        // Ejecuta la petición asíncrona sin bloquear el flujo de Strapi
        fetch(`https://api.github.com/repos/${repoOwner}/${repoName}/dispatches`, {
          method: 'POST',
          headers: {
            'Accept': 'application/vnd.github.v3+json',
            'Authorization': `token ${githubToken}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            event_type: 'strapi_content_update'
          })
        })
        .then(res => {
          if (!res.ok) {
            strapi.log.error(`Github Webhook Error: ${res.statusText}`);
          } else {
            strapi.log.info(`Github Webhook enviado por modificación en: ${model.uid}`);
          }
        })
        .catch(err => {
          strapi.log.error('Fallo al disparar Github Actions de Cloudflare:', err);
        });
      }
    });
  },
};
