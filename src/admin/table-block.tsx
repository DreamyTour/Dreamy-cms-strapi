import React from 'react';
import { Editor, Node, Path, Range, Transforms } from 'slate';
import { ReactEditor, useSlate } from 'slate-react';
import type { TableNode } from './rich-html-paste';

const cell = (header = false) => ({ type: 'table-cell', header, children: [{ type: 'text', text: '' }] });
const row = (width: number, header = false) => ({ type: 'table-row', children: Array.from({ length: width }, () => cell(header)) });
const paragraph = () => ({ type: 'paragraph', children: [{ type: 'text', text: '' }] });
const asNode = (node: any) => node;
const TableIcon = () => <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true"><rect x="1" y="2" width="14" height="12" rx="1" stroke="currentColor" /><path d="M1 6h14M1 10h14M6 2v12M11 2v12" stroke="currentColor" /></svg>;

function TableElement({ attributes, children, element }: any) {
  const editor = useSlate() as ReactEditor;
  const table = element as TableNode;
  const change = (action: string) => {
    const path = ReactEditor.findPath(editor, element);
    const width = table.children[0]?.children.length || 2;
    Editor.withoutNormalizing(editor, () => {
      if (action === 'row' && table.children.length < 500) Transforms.insertNodes(editor, asNode(row(width)), { at: [...path, table.children.length] });
      if (action === 'column' && width < 50) table.children.forEach((item, index) => Transforms.insertNodes(editor, asNode(cell(item.children.every(c => c.header))), { at: [...path, index, width] }));
      if (action === 'remove-row' && table.children.length > 1) {
        const index = editor.selection?.anchor.path[0] === path[0] ? editor.selection.anchor.path[1] : table.children.length - 1;
        Transforms.removeNodes(editor, { at: [...path, index] });
      }
      if (action === 'remove-column' && width > 1) {
        const index = editor.selection?.anchor.path[0] === path[0] ? editor.selection.anchor.path[2] : width - 1;
        table.children.forEach((_, r) => Transforms.removeNodes(editor, { at: [...path, r, index] }));
      }
      if (action === 'header') table.children[0].children.forEach((item, index) => Transforms.setNodes(editor, asNode({ header: !table.children[0].children.every(c => c.header) }), { at: [...path, 0, index] }));
      if (action === 'after') {
        const next = [path[0] + 1];
        Transforms.insertNodes(editor, asNode(paragraph()), { at: next });
        Transforms.select(editor, Editor.start(editor, next));
      }
      if (action === 'delete') {
        Transforms.removeNodes(editor, { at: path });
        Transforms.insertNodes(editor, asNode(paragraph()), { at: path });
        Transforms.select(editor, Editor.start(editor, path));
      }
    });
    ReactEditor.focus(editor);
  };
  return <div {...attributes} style={{ margin: '12px 0' }}>
    <div contentEditable={false} style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 8 }}>
      {([['row', '+ Fila'], ['column', '+ Columna'], ['remove-row', 'Quitar fila'], ['remove-column', 'Quitar columna'], ['header', 'Encabezado'], ['after', 'Texto debajo'], ['delete', 'Eliminar tabla']] as const).map(([action, label]) =>
        <button key={action} type="button" disabled={ReactEditor.isReadOnly(editor) || (action === 'row' && table.children.length >= 500) || (action === 'column' && table.children[0].children.length >= 50)} onMouseDown={event => event.preventDefault()} onClick={() => change(action)} style={{ padding: '5px 8px', border: '1px solid #888', borderRadius: 4, background: 'transparent', color: 'inherit', cursor: 'pointer' }}>{label}</button>)}
    </div>
    <div style={{ overflowX: 'auto' }}><table style={{ borderCollapse: 'collapse', width: '100%', tableLayout: 'fixed' }}><tbody>{children}</tbody></table></div>
  </div>;
}

function moveCell(editor: any, direction: number) {
  if (!editor.selection) return;
  const [t, r, c] = editor.selection.anchor.path;
  const table = editor.children[t] as TableNode;
  const width = table.children[0].children.length;
  const index = r * width + c + direction;
  if (index < 0) return;
  if (index >= table.children.length * width) {
    if (table.children.length >= 500) return;
    Transforms.insertNodes(editor, asNode(row(width)), { at: [t, table.children.length] });
  }
  Transforms.select(editor, Editor.start(editor, [t, Math.floor(index / width), index % width]));
}

export function withTables(editor: any) {
  const { insertFragment, deleteBackward, deleteForward, deleteFragment } = editor;
  editor.insertFragment = (fragment: any[], ...args: any[]) => {
    if (!fragment.some(node => node.type === 'table')) {
      const entry = editor.selection && Editor.above(editor, { match: (n: any) => n.type === 'table-cell' });
      if (!entry) return insertFragment(fragment, ...args);
      // Keep pasted paragraphs/lists inside the cell as inline content.
      const inline = (node: any): any[] => node.type === 'text' || node.type === 'link' ? [node] : (node.children || []).flatMap(inline);
      const children = fragment.flatMap((node, index) => [...(index ? [{ type: 'text', text: '\n' }] : []), ...inline(node)]);
      if (children.length) Transforms.insertNodes(editor, asNode(children));
      return;
    }
    const current = editor.selection?.anchor.path[0];
    Editor.withoutNormalizing(editor, () => {
      const empty = current !== undefined && editor.children[current]?.type === 'paragraph' && !Node.string(editor.children[current]);
      const index = current === undefined ? editor.children.length : empty ? current : current + 1;
      if (empty) Transforms.removeNodes(editor, { at: [current] });
      Transforms.insertNodes(editor, fragment, { at: [index] });
      if (fragment[fragment.length - 1].type === 'table') Transforms.insertNodes(editor, asNode(paragraph()), { at: [index + fragment.length] });
      Transforms.select(editor, Editor.end(editor, [index + fragment.length - 1]));
    });
  };
  const inCell = () => editor.selection && Editor.above(editor, { match: (n: any) => n.type === 'table-cell' });
  editor.deleteBackward = (...args: any[]) => {
    const entry = inCell();
    if (entry && Range.isCollapsed(editor.selection) && Editor.isStart(editor, editor.selection.anchor, entry[1])) return;
    const point = editor.selection?.anchor;
    if (point && Range.isCollapsed(editor.selection) && Editor.isStart(editor, point, [point.path[0]]) && editor.children[point.path[0] - 1]?.type === 'table') return;
    deleteBackward(...args);
  };
  editor.deleteForward = (...args: any[]) => {
    const entry = inCell();
    if (entry && Range.isCollapsed(editor.selection) && Editor.isEnd(editor, editor.selection.anchor, entry[1])) return;
    const point = editor.selection?.anchor;
    if (point && Range.isCollapsed(editor.selection) && Editor.isEnd(editor, point, [point.path[0]]) && editor.children[point.path[0] + 1]?.type === 'table') return;
    deleteForward(...args);
  };
  editor.deleteFragment = (...args: any[]) => {
    const selection = editor.selection;
    if (selection && !Range.isCollapsed(selection)) {
      const a = selection.anchor.path.slice(0, 3);
      const b = selection.focus.path.slice(0, 3);
      if (!Path.equals(a, b) && (editor.children[a[0]]?.type === 'table' || editor.children[b[0]]?.type === 'table')) return;
    }
    deleteFragment(...args);
  };
  return editor;
}

export function prepareTableConversion(editor: any) {
  if (!editor.selection || editor.children[editor.selection.anchor.path[0]]?.type !== 'table') return;
  const path = [editor.selection.anchor.path[0] + 1];
  Transforms.insertNodes(editor, asNode(paragraph()), { at: path });
  Transforms.select(editor, Editor.start(editor, path));
}

export const tableBlocks = {
  table: {
    isInBlocksSelector: true,
    icon: TableIcon,
    label: { id: 'dreamy.blocks.table', defaultMessage: 'Tabla' },
    matchNode: (node: any) => node.type === 'table',
    renderElement: (props: any) => <TableElement {...props} />,
    plugin: withTables,
    handleConvert(editor: any) {
      if (editor.selection && editor.children[editor.selection.anchor.path[0]]?.type === 'table') return;
      editor.insertFragment([{ type: 'table', children: [row(3, true), row(3), row(3)] }]);
    },
    handleEnterKey: (editor: any) => Transforms.insertText(editor, '\n'),
    handleTab: (editor: any) => moveCell(editor, 1),
    handleShiftTab: (editor: any) => moveCell(editor, -1),
  },
  'table-row': {
    matchNode: (node: any) => node.type === 'table-row',
    isDraggable: () => false,
    renderElement: ({ attributes, children }: any) => <tr {...attributes}>{children}</tr>,
  },
  'table-cell': {
    matchNode: (node: any) => node.type === 'table-cell',
    isDraggable: () => false,
    renderElement: ({ attributes, children, element }: any) => {
      const Tag = element.header ? 'th' : 'td';
      return <Tag {...attributes} style={{ border: '1px solid #888', padding: '10px', minWidth: 100, verticalAlign: 'top', textAlign: 'left', whiteSpace: 'pre-wrap', background: element.header ? 'rgba(128,128,128,.15)' : undefined }}>{children}</Tag>;
    },
  },
};
