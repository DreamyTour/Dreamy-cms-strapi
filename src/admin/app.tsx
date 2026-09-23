import type { StrapiApp } from '@strapi/strapi/admin';
import { withRichHtmlPaste } from './rich-html-paste';

export default {
  config: {
    locales: ['es'],
  },
  register(app: StrapiApp) {
    const contentManager = app.getPlugin('content-manager') as {
      apis: {
        addRichTextBlocks: (update: (blocks: Record<string, any>) => Record<string, any>) => void;
      };
    };
    contentManager.apis.addRichTextBlocks((blocks) => {
      const originalPlugin = blocks.paragraph.plugin;
      return {
        ...blocks,
        paragraph: {
          ...blocks.paragraph,
          plugin: (editor: any) => withRichHtmlPaste(originalPlugin ? originalPlugin(editor) : editor),
        },
      };
    });
  },
  bootstrap() {},
};
