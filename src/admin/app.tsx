import type { StrapiApp } from '@strapi/strapi/admin';
import { withRichHtmlPaste } from './rich-html-paste';
import { tableBlocks, prepareTableConversion } from './table-block';

export default {
  config: {
    locales: ['es'],
  },
  register(app: StrapiApp) {
    const contentManager = app.getPlugin('content-manager') as unknown as {
      apis: {
        addRichTextBlocks: (update: (blocks: Record<string, any>) => Record<string, any>) => void;
      };
    };
    contentManager.apis.addRichTextBlocks((blocks) => {
      const safeBlocks = Object.fromEntries(Object.entries(blocks).map(([key, block]) => [key, {
        ...block,
        ...(block.handleConvert ? { handleConvert: (editor: any) => {
          prepareTableConversion(editor);
          return block.handleConvert(editor);
        } } : {}),
      }]));
      const originalPlugin = blocks.paragraph.plugin;
      return {
        ...safeBlocks,
        ...tableBlocks,
        paragraph: {
          ...safeBlocks.paragraph,
          plugin: (editor: any) => withRichHtmlPaste(originalPlugin ? originalPlugin(editor) : editor),
        },
      };
    });
  },
  bootstrap() {},
};
