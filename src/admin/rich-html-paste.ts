type TextNode = {
  type: 'text';
  text: string;
  bold?: true;
  italic?: true;
  underline?: true;
  strikethrough?: true;
};

type InlineNode = TextNode | {
  type: 'link';
  url: string;
  rel: string;
  target: string;
  children: TextNode[];
};

type BlockNode =
  | { type: 'paragraph' | 'quote'; children: InlineNode[] }
  | { type: 'heading'; level: 1 | 2 | 3 | 4 | 5 | 6; children: InlineNode[] }
  | { type: 'list'; format: 'ordered' | 'unordered'; children: Array<{ type: 'list-item'; children: InlineNode[] }> };

type Marks = Pick<TextNode, 'bold' | 'italic' | 'underline' | 'strikethrough'>;

const blockTags = new Set(['P', 'DIV', 'SECTION', 'ARTICLE', 'MAIN', 'H1', 'H2', 'H3', 'H4', 'H5', 'H6', 'UL', 'OL', 'BLOCKQUOTE']);

function inlineNodes(node: Node, marks: Marks = {}): InlineNode[] {
  if (node.nodeType === Node.TEXT_NODE) {
    const text = (node.textContent ?? '').replace(/\u00a0/g, ' ');
    return text ? [{ type: 'text', text, ...marks }] : [];
  }
  if (!(node instanceof Element)) return [];
  if (node.tagName === 'BR') return [{ type: 'text', text: '\n', ...marks }];

  const style = node.getAttribute('style') ?? '';
  const weight = style.match(/font-weight\s*:\s*(bold|bolder|[5-9]00)/i);
  const nextMarks: Marks = {
    ...marks,
    ...(node.matches('B, STRONG') || weight ? { bold: true } : {}),
    ...(node.matches('I, EM') || /font-style\s*:\s*italic/i.test(style) ? { italic: true } : {}),
    ...(node.tagName === 'U' || /text-decoration[^;]*underline/i.test(style) ? { underline: true } : {}),
    ...(node.matches('S, DEL, STRIKE') || /text-decoration[^;]*line-through/i.test(style) ? { strikethrough: true } : {}),
  };
  const children = Array.from(node.childNodes).flatMap((child) => inlineNodes(child, nextMarks));

  if (node.tagName === 'A' && node.getAttribute('href')) {
    const url = node.getAttribute('href') ?? '';
    if (/^(https?:|mailto:|\/)/i.test(url)) {
      return [{ type: 'link', url, rel: '', target: '', children: children.flatMap((child) => child.type === 'text' ? [child] : child.children) }];
    }
  }
  return children;
}

function contentOf(element: Element): InlineNode[] {
  const children = Array.from(element.childNodes).flatMap((child) => inlineNodes(child));
  return children.length ? children : [{ type: 'text', text: '' }];
}

function blocksFrom(container: Element): BlockNode[] {
  const blocks: BlockNode[] = [];
  let loose: Node[] = [];
  const flush = () => {
    if (!loose.length) return;
    const children = loose.flatMap((node) => inlineNodes(node));
    if (children.some((child) => child.type === 'link' || child.text.trim())) {
      blocks.push({ type: 'paragraph', children });
    }
    loose = [];
  };

  for (const node of Array.from(container.childNodes)) {
    if (!(node instanceof Element) || !blockTags.has(node.tagName)) {
      loose.push(node);
      continue;
    }
    flush();
    const tag = node.tagName;
    if (/^H[1-6]$/.test(tag)) {
      blocks.push({ type: 'heading', level: Number(tag[1]) as 1 | 2 | 3 | 4 | 5 | 6, children: contentOf(node) });
    } else if (tag === 'P') {
      blocks.push({ type: 'paragraph', children: contentOf(node) });
    } else if (tag === 'BLOCKQUOTE') {
      blocks.push({ type: 'quote', children: contentOf(node) });
    } else if (tag === 'UL' || tag === 'OL') {
      const items = Array.from(node.children).filter((child) => child.tagName === 'LI')
        .map((child) => ({ type: 'list-item' as const, children: contentOf(child) }));
      if (items.length) blocks.push({ type: 'list', format: tag === 'OL' ? 'ordered' : 'unordered', children: items });
    } else if (Array.from(node.children).some((child) => blockTags.has(child.tagName))) {
      blocks.push(...blocksFrom(node));
    } else {
      blocks.push({ type: 'paragraph', children: contentOf(node) });
    }
  }
  flush();
  return blocks;
}

export function blocksFromClipboardHtml(html: string): BlockNode[] {
  const document = new DOMParser().parseFromString(html, 'text/html');
  return blocksFrom(document.body);
}

export function withRichHtmlPaste<T extends { insertData: (data: DataTransfer) => void; insertFragment: (fragment: BlockNode[]) => void }>(editor: T): T {
  const originalInsertData = editor.insertData.bind(editor);
  editor.insertData = (data: DataTransfer) => {
    // Slate uses this format for copies within the editor. Keep its native behavior.
    if (data.getData('application/x-slate-fragment')) return originalInsertData(data);
    const html = data.getData('text/html');
    if (!html || !/<(?:h[1-6]|strong|b|span\b[^>]*font-weight)\b/i.test(html)) return originalInsertData(data);
    // The conversion below only covers text blocks; let Strapi handle richer embeds.
    if (/<(?:img|table|iframe|video)\b/i.test(html)) return originalInsertData(data);
    const blocks = blocksFromClipboardHtml(html);
    if (!blocks.length) return originalInsertData(data);
    editor.insertFragment(blocks);
  };
  return editor;
}
