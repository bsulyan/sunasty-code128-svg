import test from 'node:test';
import assert from 'node:assert/strict';

import {
  buildCode128Symbols,
  CODE128_START_B,
  CODE128_START_C,
  parseEan13Input,
  parseUpcaInput,
  renderBarcodeSvg,
  parseBulkBarcodeText,
  buildBulkBarcodeZipEntries,
} from './index.js';

test('Code 128 chooses Subset C for dense even digits and Subset B for text', () => {
  assert.equal(buildCode128Symbols('12345678')[0], CODE128_START_C);
  assert.equal(buildCode128Symbols('SUNASTY')[0], CODE128_START_B);
});

test('EAN-13 and UPC-A check digits validate and auto-append', () => {
  const ean = parseEan13Input('400638133393');
  assert.equal(ean.status, 'valid_payload');
  assert.equal(ean.code, '4006381333931');

  const upc = parseUpcaInput('036000291452');
  assert.equal(upc.status, 'valid_full');
});

test('renderBarcodeSvg produces standalone XML-escaped SVG and bulk entries', () => {
  const svg = renderBarcodeSvg('code128', 'A<B>&C');
  assert.match(svg.markup, /^<svg xmlns="http:\/\/www\.w3\.org\/2000\/svg"/);
  assert.match(svg.markup, /A&lt;B&gt;&amp;C/);

  const itf = renderBarcodeSvg('itf14', '10012345678902');
  assert.match(itf.markup, /fill="none" stroke="#000"/);

  const items = parseBulkBarcodeText('ean13,4006381333931\ncode39,SUNASTY-39');
  const entries = buildBulkBarcodeZipEntries(items);
  assert.equal(Object.keys(entries).length, 2);
});
