const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { createRequire } = require('node:module');
// Use Playwright locally when installed, or the sibling frontend's test tooling.
let playwrightPath;
try { playwrightPath = require.resolve('@playwright/test'); }
catch { playwrightPath = path.resolve(__dirname, '../../dreamy-front/node_modules/@playwright/test'); }
const { chromium } = require(playwrightPath);
const esbuild = createRequire(require.resolve('@strapi/strapi'))('esbuild');

async function main() {
  const r = createRequire(require.resolve('@strapi/strapi'));
  const coreEntry = r.resolve('@strapi/core');
  const cr = createRequire(coreEntry);
  const { Validators } = cr(path.join(path.dirname(coreEntry), 'services/entity-validator/validators.js'));
  const validatorPath = path.resolve('src/extensions/table-validation.ts');
  const validatorModule = new (require('node:module').Module)(validatorPath, module);
  validatorModule.filename = validatorPath;
  validatorModule.paths = module.paths;
  validatorModule._compile(require('typescript').transpileModule(fs.readFileSync(validatorPath, 'utf8'), {
    compilerOptions: { module: require('typescript').ModuleKind.CommonJS, esModuleInterop: true },
  }).outputText, validatorPath);
  validatorModule.exports.registerTableValidation();
  const bundle = await esbuild.build({
    stdin: { resolveDir: process.cwd(), loader: 'tsx', contents: `
      import React from 'react';
      import { createRoot } from 'react-dom/client';
      import { createEditor, Editor, Transforms } from 'slate';
      import { Slate, Editable, withReact } from 'slate-react';
      import { tableBlocks, withTables } from './src/admin/table-block';
      import { blocksFromClipboardHtml, withRichHtmlPaste } from './src/admin/rich-html-paste';
      const editor = withTables(withRichHtmlPaste(withReact(createEditor())));
      const isInline = editor.isInline;
      editor.isInline = node => node.type === 'link' || isInline(node);
      window.editor = editor;
      window.parse = blocksFromClipboardHtml;
      window.tableBlocks = tableBlocks;
      window.selectCell = path => Transforms.select(editor, Editor.start(editor, path));
      function App() {
        return <Slate editor={editor} initialValue={[{ type:'paragraph',children:[{type:'text',text:''}]}]}>
          <button id="insert" onMouseDown={e => { e.preventDefault(); tableBlocks.table.handleConvert(editor); }}>Insertar tabla</button>
          <Editable renderElement={props => {
            const block = Object.values(tableBlocks).find(b => b.matchNode(props.element));
            return block ? block.renderElement(props) : <p {...props.attributes}>{props.children}</p>;
          }} onKeyDown={e => {
            const node = editor.selection && editor.children[editor.selection.anchor.path[0]];
            if(node?.type !== 'table') return;
            if(e.key === 'Tab') { e.preventDefault(); e.shiftKey ? tableBlocks.table.handleShiftTab(editor) : tableBlocks.table.handleTab(editor); }
            if(e.key === 'Enter') { e.preventDefault(); tableBlocks.table.handleEnterKey(editor); }
          }} />
        </Slate>;
      }
      createRoot(document.getElementById('root')).render(<App />);
    ` }, bundle: true, write: false, format: 'iife', platform: 'browser', define: { 'process.env.NODE_ENV': '"development"' },
  });
  const browser = await chromium.launch({ headless: true });
  try {
    const page = await browser.newPage();
    const errors = [];
    page.on('pageerror', error => errors.push(error.message));
    await page.setContent('<div id="root"></div>');
    await page.addScriptTag({ content: bundle.outputFiles[0].text });
    await page.locator('[contenteditable=true]').waitFor();
    const html = '<h2>Precios</h2><div><table><thead><tr><th>Tour</th><th>Precio</th></tr></thead><tbody><tr><td><strong>Cusco</strong> <a href="https://example.com">Detalles</a></td><td>$100</td></tr></tbody></table></div><p>Después</p>';
    const parsed = await page.evaluate(html => window.parse(html), html);
    assert.deepEqual(parsed.map(n => n.type), ['heading', 'table', 'paragraph']);
    assert.equal(parsed[1].children[0].children[0].header, true);
    assert.equal(parsed[1].children[1].children[0].children[0].bold, true);
    assert.equal(parsed[1].children[1].children[0].children[2].type, 'link');
    await Validators.blocks().validate(parsed);
    await assert.rejects(() => Validators.blocks().validate([{ type: 'unknown', children: [] }]));
    const badLink = structuredClone(parsed);
    badLink[1].children[1].children[0].children[2].url = 'javascript:alert(1)';
    await assert.rejects(() => Validators.blocks().validate(badLink));
    const ragged = structuredClone(parsed);
    ragged[1].children[1].children.pop();
    await assert.rejects(() => Validators.blocks().validate(ragged));
    await page.locator('[contenteditable=true]').click();
    await page.evaluate(html => { const data = new DataTransfer(); data.setData('text/html', html); window.editor.insertData(data); }, html);
    assert.equal(await page.locator('table').count(), 1);
    assert.equal(await page.locator('th').count(), 2);
    assert.equal(await page.locator('td').count(), 2);
    await page.getByRole('button', { name: 'Encabezado', exact: true }).click();
    assert.equal(await page.locator('th').count(), 0);
    await page.getByRole('button', { name: 'Encabezado', exact: true }).focus();
    await page.keyboard.press('Enter');
    assert.equal(await page.locator('th').count(), 2);
    await page.evaluate(() => window.selectCell([window.editor.children.findIndex(n => n.type === 'table'), 1, 1]));
    await page.keyboard.press('Tab');
    assert.equal(await page.locator('tr').count(), 3);
    await page.getByRole('button', { name: '+ Columna', exact: true }).click();
    assert.equal(await page.locator('tr').first().locator('th').count(), 3);
    await page.getByRole('button', { name: '+ Fila', exact: true }).click();
    assert.equal(await page.locator('tr').count(), 4);
    await page.evaluate(() => window.selectCell([window.editor.children.findIndex(n => n.type === 'table'), 1, 0]));
    await page.getByRole('button', { name: 'Quitar fila', exact: true }).click();
    assert.equal(await page.locator('tr').count(), 3);
    await page.getByRole('button', { name: 'Quitar columna', exact: true }).click();
    assert.equal(await page.locator('tr').first().locator('th').count(), 2);
    const saved = await page.evaluate(() => window.editor.children);
    await Validators.blocks().validate(saved);
    await page.getByRole('button', { name: 'Eliminar tabla', exact: true }).click();
    assert.equal(await page.locator('table').count(), 0);
    await page.locator('#insert').click();
    assert.equal(await page.locator('table').count(), 1);
    await Validators.blocks().validate(await page.evaluate(() => window.editor.children));
    assert.deepEqual(errors, []);
    console.log('PASS: HTML paste, headings, marks, links, native validation, unsafe links, rectangular shape, editable table, Tab, row/column controls, delete and menu insertion.');
  } finally { await browser.close(); }
}
main().catch(error => { console.error(error); process.exitCode = 1; });
