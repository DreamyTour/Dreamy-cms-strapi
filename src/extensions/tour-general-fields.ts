/** Keep the itinerary illustration outside the nested itinerary tabs. */
export async function configureTourGeneralFields(strapi: any) {
  const service = strapi.plugin('content-manager').service('components');
  const contentType = service.findComponent('tours.maps');
  if (!contentType?.attributes.imagenRecorrido) return;
  const configuration = await service.findConfiguration(contentType);
  const rows = configuration.layouts.edit
    .map((row: any[]) => row.filter((field) => field.name !== 'imagenRecorrido'))
    .filter((row: any[]) => row.length);
  const tabIndex = rows.findIndex((row: any[]) => row.some((field) => field.name === 'mapstops'));
  rows.splice(tabIndex >= 0 ? tabIndex : rows.length, 0, [{ name: 'imagenRecorrido', size: 12 }]);
  const metadata = configuration.metadatas.imagenRecorrido;
  await service.updateConfiguration(contentType, {
    ...configuration,
    layouts: { ...configuration.layouts, edit: rows },
    metadatas: {
      ...configuration.metadatas,
      imagenRecorrido: {
        ...metadata,
        edit: {
          ...metadata?.edit,
          label: 'Imagen del recorrido',
          description: 'Imagen del itinerario completo para la vista previa del tour. Opcional, una imagen por idioma.',
          visible: true,
        },
      },
    },
  });
}
