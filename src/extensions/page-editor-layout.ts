import type { Core } from '@strapi/strapi';

/** Keep SEO last in pageCategoryTour without changing the other editor fields. */
export async function configurePageEditorLayout(strapi: Core.Strapi) {
  const service = strapi.plugin('content-manager').service('content-types');
  const contentType = service.findContentType('api::page.page');
  if (!contentType?.attributes.seo) return;

  const configuration = await service.findConfiguration(contentType);
  const rows = configuration.layouts.edit;
  const lastRow = rows[rows.length - 1];
  if (lastRow?.length === 1 && lastRow[0].name === 'seo') return;

  const edit = rows
    .map((row: Array<{ name: string; size: number }>) =>
      row.filter((field) => field.name !== 'seo'),
    )
    .filter((row: Array<{ name: string; size: number }>) => row.length);
  edit.push([{ name: 'seo', size: 12 }]);

  await service.updateConfiguration(contentType, {
    ...configuration,
    layouts: { ...configuration.layouts, edit },
  });
}
