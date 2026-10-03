import { createRequire } from 'node:module';
import { dirname, join } from 'node:path';

/** Verified against Strapi 5.56.0; there is no public server API for custom Blocks schemas.
 * Extend only Blocks and retain native validation; review this adapter on upgrades. */
export function registerTableValidation() {
  const strapiRequire = createRequire(require.resolve('@strapi/strapi'));
  const coreEntry = strapiRequire.resolve('@strapi/core');
  const coreRequire = createRequire(coreEntry);
  const { yup } = coreRequire('@strapi/utils');
  const { Validators } = coreRequire(join(dirname(coreEntry), 'services/entity-validator/validators.js'));
  const original = Validators.blocks;
  const nativeSchema = original();
  if (!nativeSchema.innerType) throw new Error('Strapi Blocks validator changed: review table-validation.ts.');
  // Reuse Strapi's text, marks and safe-link validation inside cells.
  const paragraph = nativeSchema.innerType.resolve({ value: { type: 'paragraph', children: [] } });
  const inline = paragraph.fields.children.innerType;
  const cell = yup.object({
    type: yup.string().oneOf(['table-cell']).required(),
    header: yup.boolean().required(),
    children: yup.array().of(inline).min(1).required(),
  });
  const row = yup.object({
    type: yup.string().oneOf(['table-row']).required(),
    children: yup.array().of(cell).min(1).max(50).required(),
  });
  const table = yup.object({
    type: yup.string().oneOf(['table']).required(),
    children: yup.array().of(row).min(1).max(500).required(),
  }).test('rectangular-table', 'Todas las filas de la tabla deben tener el mismo número de columnas.', (value: any) =>
    !value?.children || value.children.every((item: any) => item.children?.length === value.children[0]?.children?.length));
  Validators.blocks = (...args: any[]) => original(...args).of(yup.lazy((node: any) => {
    if (!node || typeof node !== 'object') return yup.mixed().test('invalid-block', 'Invalid block', () => false);
    return node.type === 'table' ? table : nativeSchema.innerType.resolve({ value: node });
  }));
}
