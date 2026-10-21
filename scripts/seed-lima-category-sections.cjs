// Run after building the CMS. Defaults to saving a draft; --publish is explicit.
// Existing section content is never overwritten. No other page fields are updated.
const { createStrapi } = require('@strapi/strapi');
const source = require('./data/lima-category-sections.json');

async function main() {
  const app = await createStrapi({ distDir: './dist' }).load();
  try {
    const pages = app.documents('api::page.page');
    const page = await pages.findFirst({
      locale: 'es', filters: { slug: 'lima' },
      populate: ['selectorTours', 'informacionUtil'],
    });
    if (!page) throw new Error('Spanish Lima page not found');
    const data = {};
    if (!page.selectorTours) {
      for (const item of source.selectorTours.recomendaciones) {
        const tour = await app.documents('api::tour.tour').findOne({
          documentId: item.tour, locale: 'es', status: 'published',
        });
        if (!tour?.slug || tour.locale !== 'es') {
          throw new Error(`Published Spanish tour missing: ${item.tour}`);
        }
      }
      data.selectorTours = structuredClone(source.selectorTours);
      data.selectorTours.recomendaciones.forEach((item) => {
        item.tour = { connect: [{ documentId: item.tour, locale: 'es' }] };
      });
    }
    if (!page.informacionUtil) data.informacionUtil = source.informacionUtil;
    if (!Object.keys(data).length) {
      console.log('Lima sections already exist; nothing changed.');
      return;
    }
    await pages.update({ documentId: page.documentId, locale: 'es', data });
    if (process.argv.includes('--publish')) {
      await pages.publish({ documentId: page.documentId, locale: 'es' });
    }
    console.log(`Lima sections saved (${process.argv.includes('--publish') ? 'published' : 'draft'}).`);
  } finally {
    await app.destroy();
  }
}
main().catch((error) => { console.error(error); process.exitCode = 1; });
