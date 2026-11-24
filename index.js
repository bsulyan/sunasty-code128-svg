/* @ts-self-types="./index.d.ts" */
/**
 * sunasty-code128-svg
 *
 * Zero-dependency 1D barcode encoder and standalone SVG generator for
 * Code 128 (Subset B & automatic dense Subset C), EAN-13, UPC-A, Code 39,
 * and ITF-14 (with GS1 bearer frame support).
 * Extracted from https://sunasty.com/barcode-generator/
 */

export const CODE128_START_B = 104;
export const CODE128_START_C = 105;
export const CODE128_STOP = 106;

const EAN_L = [
  '0001101', '0011001', '0010011', '0111101', '0100011',
  '0110001', '0101111', '0111011', '0110111', '0001011',
];
const EAN_G = [
  '0100111', '0110011', '0011011', '0100001', '0011101',
  '0111001', '0000101', '0010001', '0001001', '0010111',
];
const EAN_R = EAN_L.map((code) => code.split('').map((b) => (b === '1' ? '0' : '1')).join(''));
const EAN_FIRST_DIGIT_PARITY = [
  'LLLLLL', 'LLGLGG', 'LLGGLG', 'LLGGGL', 'LGLLGG',
  'LGGLLG', 'LGGGLL', 'LGLGLG', 'LGLGGL', 'LGGLGL',
];

const CODE128_PATTERNS = [
  '11011001100', '11001101100', '11001100110', '10010011000', '10010001100', '10001001100', '10011001000', '10011000100', '10001100100', '11001001000',
  '11001000100', '11000100100', '10110011100', '10011011100', '10011001110', '10111001100', '10011101100', '10011100110', '11001110010', '11001011100',
  '11001001110', '11011100100', '11001110100', '11101101110', '11101001100', '11100101100', '11100100110', '11101100100', '11100110100', '11100110010',
  '11011011000', '11011000110', '11000110110', '10100011000', '10001011000', '10001000110', '10110001000', '10001101000', '10001100010', '11010001000',
  '11000101000', '11000100010', '10110111000', '10110001110', '10001101110', '10111011000', '10111000110', '10001110110', '11101110110', '11010001110',
  '11000101110', '11011101000', '11011100010', '11011101110', '11101011000', '11101000110', '11100010110', '11101101000', '11101100010', '11100011010',
  '11101111010', '11001000010', '11110001010', '10100110000', '10100001100', '10010110000', '10010000110', '10000101100', '10000100110', '10110010000',
  '10110000100', '10011010000', '10011000010', '10000110100', '10000110010', '11000010010', '11001010000', '11110111010', '11000010100', '10001111010',
  '10100111100', '10010111100', '10010011110', '10111100100', '10011110100', '10011110010', '11110100100', '11110010100', '11110010010', '11011011110',
  '11011110110', '11110110110', '10101111000', '10100011110', '10001011110', '10111101000', '10111100010', '11110101000', '11110100010', '10111011110',
  '10111101110', '11101011110', '11110101110', '11010000100', '11010010000', '11010011100',
];
const CODE128_STOP_PATTERN = '1100011101011';

function escapeXmlText(value) {
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

export function calculateMod10CheckDigit(payload, evenIndexWeight, oddIndexWeight) {
  let total = 0;
  for (let idx = 0; idx < payload.length; idx += 1) {
    const digit = payload.charCodeAt(idx) - 48;
    total += digit * (idx % 2 === 0 ? evenIndexWeight : oddIndexWeight);
  }
  return (10 - (total % 10)) % 10;
}

export function computeEan13CheckDigit(payload12) {
  return calculateMod10CheckDigit(payload12, 1, 3);
}

export function encodeEan13Modules(ean13) {
  const first = ean13.charCodeAt(0) - 48;
  const parity = EAN_FIRST_DIGIT_PARITY[first];
  let left = '';
  for (let i = 1; i <= 6; i += 1) {
    const digit = ean13.charCodeAt(i) - 48;
    left += parity[i - 1] === 'L' ? EAN_L[digit] : EAN_G[digit];
  }
  let right = '';
  for (let i = 7; i <= 12; i += 1) {
    right += EAN_R[ean13.charCodeAt(i) - 48];
  }
  return `101${left}01010${right}101`;
}

export function isCode128BText(text) {
  if (text.length === 0) return false;
  for (let i = 0; i < text.length; i += 1) {
    const code = text.charCodeAt(i);
    if (code < 32 || code > 126) return false;
  }
  return true;
}

export function isCode128CText(text) {
  return text.length >= 4 && text.length % 2 === 0 && /^\d+$/.test(text);
}

function resolveCode128Payload(text) {
  if (isCode128CText(text)) {
    const dataValues = [];
    for (let i = 0; i < text.length; i += 2) {
      dataValues.push(Number(text.slice(i, i + 2)));
    }
    return { startSymbol: CODE128_START_C, dataValues };
  }
  return {
    startSymbol: CODE128_START_B,
    dataValues: text.split('').map((ch) => ch.charCodeAt(0) - 32),
  };
}

function computeCode128WeightedModulo(startSymbol, dataValues) {
  let sum = startSymbol;
  for (let i = 0; i < dataValues.length; i += 1) {
    sum += dataValues[i] * (i + 1);
  }
  return sum % 103;
}

export function computeCode128Checksum(text) {
  const { startSymbol, dataValues } = resolveCode128Payload(text);
  return computeCode128WeightedModulo(startSymbol, dataValues);
}

export function buildCode128Symbols(text) {
  const { startSymbol, dataValues } = resolveCode128Payload(text);
  return [
    startSymbol,
    ...dataValues,
    computeCode128WeightedModulo(startSymbol, dataValues),
    CODE128_STOP,
  ];
}

export function encodeCode128Modules(text) {
  return buildCode128Symbols(text)
    .map((val) => (val === CODE128_STOP ? CODE128_STOP_PATTERN : CODE128_PATTERNS[val]))
    .join('');
}

export function modulesToBarSegments(modules) {
  const segments = [];
  let runStart = -1;
  for (let i = 0; i <= modules.length; i += 1) {
    const isBar = modules[i] === '1';
    if (isBar && runStart === -1) runStart = i;
    else if (!isBar && runStart !== -1) {
      segments.push({ start: runStart, width: i - runStart });
      runStart = -1;
    }
  }
  return segments;
}

export function isEan12Payload(digits) { return /^\d{12}$/.test(digits); }
export function isUpc11Payload(digits) { return /^\d{11}$/.test(digits); }
export function isItf13Payload(digits) { return /^\d{13}$/.test(digits); }
export function buildEan13(payload12) { return payload12 + String(computeEan13CheckDigit(payload12)); }
export function computeUpcaCheckDigit(payload11) { return computeEan13CheckDigit('0' + payload11); }
export function buildUpca(payload11) { return payload11 + String(computeUpcaCheckDigit(payload11)); }
export function computeItf14CheckDigit(payload13) { return calculateMod10CheckDigit(payload13, 3, 1); }
export function buildItf14(payload13) { return payload13 + String(computeItf14CheckDigit(payload13)); }

function parseFixedLengthMod10(input, payloadLength, computeCheck) {
  const trimmed = input.trim();
  if (!/^\d+$/.test(trimmed)) return { status: 'invalid' };
  if (trimmed.length === payloadLength) {
    const expected = computeCheck(trimmed);
    const full = trimmed + String(expected);
    return { status: 'valid_payload', code: full, correctedCode: full, expectedCheckDigit: expected };
  }
  if (trimmed.length === payloadLength + 1) {
    const payload = trimmed.slice(0, payloadLength);
    const expected = computeCheck(payload);
    const actual = trimmed.charCodeAt(payloadLength) - 48;
    const corrected = payload + String(expected);
    if (actual === expected) {
      return { status: 'valid_full', code: trimmed, correctedCode: corrected, expectedCheckDigit: expected, actualCheckDigit: actual };
    }
    return { status: 'mismatch_full', correctedCode: corrected, expectedCheckDigit: expected, actualCheckDigit: actual };
  }
  return { status: 'invalid' };
}

export function parseEan13Input(input) { return parseFixedLengthMod10(input, 12, computeEan13CheckDigit); }
export function parseUpcaInput(input) { return parseFixedLengthMod10(input, 11, computeUpcaCheckDigit); }
export function parseItf14Input(input) { return parseFixedLengthMod10(input, 13, computeItf14CheckDigit); }
export function encodeUpcaModules(upca12) { return encodeEan13Modules('0' + upca12); }

const CODE39_PATTERNS = {
  '0': '101000111011101', '1': '111010001010111', '2': '101110001010111', '3': '111011100010101', '4': '101000111010111',
  '5': '111010001110101', '6': '101110001110101', '7': '101000101110111', '8': '111010001011101', '9': '101110001011101',
  'A': '111010100010111', 'B': '101110100010111', 'C': '111011101000101', 'D': '101011100010111', 'E': '111010111000101',
  'F': '101110111000101', 'G': '101010001110111', 'H': '111010100011101', 'I': '101110100011101', 'J': '101011100011101',
  'K': '111010101000111', 'L': '101110101000111', 'M': '111011101010001', 'N': '101011101000111', 'O': '111010111010001',
  'P': '101110111010001', 'Q': '101010111000111', 'R': '111010101110001', 'S': '101110101110001', 'T': '101011101110001',
  'U': '111000101010111', 'V': '100011101010111', 'W': '111000111010101', 'X': '100010111010111', 'Y': '111000101110101',
  'Z': '100011101110101', '-': '100010101110111', '.': '111000101011101', ' ': '100011101011101', '$': '100010001000101',
  '/': '100010001010001', '+': '100010100010001', '%': '101000100010001',
};
const CODE39_START_STOP = '100010111011101';

export function isCode39Text(text) {
  if (text.length === 0) return false;
  const upper = text.toUpperCase();
  for (let i = 0; i < upper.length; i += 1) {
    if (CODE39_PATTERNS[upper[i]] === undefined) return false;
  }
  return true;
}

export function encodeCode39Modules(text) {
  const upper = text.toUpperCase();
  const parts = [CODE39_START_STOP];
  for (let i = 0; i < upper.length; i += 1) parts.push(CODE39_PATTERNS[upper[i]]);
  parts.push(CODE39_START_STOP);
  return parts.join('0');
}

const ITF_PATTERNS = ['00110', '10001', '01001', '11000', '00101', '10100', '01100', '00011', '10010', '01010'];

function interleaveDigitPair(d1, d2) {
  const p1 = ITF_PATTERNS[d1];
  const p2 = ITF_PATTERNS[d2];
  let res = '';
  for (let i = 0; i < 5; i += 1) {
    res += p1[i] === '1' ? '111' : '1';
    res += p2[i] === '1' ? '000' : '0';
  }
  return res;
}

export function encodeItf14Modules(digits14) {
  let modules = '1010';
  for (let i = 0; i < 14; i += 2) {
    modules += interleaveDigitPair(digits14.charCodeAt(i) - 48, digits14.charCodeAt(i + 1) - 48);
  }
  return `${modules}11101`;
}

export function defaultSampleForSymbology(symbology) {
  switch (symbology) {
    case 'ean13': return '4006381333931';
    case 'upca': return '036000291452';
    case 'code39': return 'SUNASTY-39';
    case 'code128': return 'Hello World';
    case 'itf14': return '10012345678902';
  }
}

function validateNumericSymbology(text, sym) {
  const p = sym === 'ean13' ? parseEan13Input(text) : sym === 'upca' ? parseUpcaInput(text) : parseItf14Input(text);
  const valid = p.status === 'valid_full' || p.status === 'valid_payload';
  const label = sym === 'ean13' ? 'EAN-13' : sym === 'upca' ? 'UPC-A' : 'ITF-14';
  return { valid, code: valid ? p.code : text, error: valid ? undefined : `Invalid ${label}` };
}

export function validateBarcodeItem(rawText, targetSymbology) {
  const text = rawText.trim();
  if (targetSymbology === 'ean13' || targetSymbology === 'upca' || targetSymbology === 'itf14') {
    return validateNumericSymbology(text, targetSymbology);
  }
  if (targetSymbology === 'code39') {
    const valid = isCode39Text(text);
    return { valid, code: text.toUpperCase(), error: valid ? undefined : 'Invalid Code 39' };
  }
  const valid = isCode128BText(text);
  return { valid, code: text, error: valid ? undefined : 'Invalid Code 128' };
}

const KNOWN_SYMBOLOGIES = new Set(['ean13', 'upca', 'code128', 'code39', 'itf14']);

function resolveLineSymbology(line, fallback) {
  const delimiterMatch = line.match(/^([a-zA-Z0-9_-]+)[,;\t]\s*(.+)$/);
  if (delimiterMatch) {
    const candidate = delimiterMatch[1].toLowerCase().replace('-', '');
    if (KNOWN_SYMBOLOGIES.has(candidate)) {
      return { symbology: candidate, rawCode: delimiterMatch[2].trim() };
    }
  }
  return { symbology: fallback, rawCode: line.trim() };
}

export function parseBulkBarcodeText(text, defaultSymbology = 'code128') {
  const lines = text.split(/\r?\n/).map((l) => l.trim()).filter((l) => l.length > 0);
  return lines.map((line, index) => {
    const { symbology, rawCode } = resolveLineSymbology(line, defaultSymbology);
    const validated = validateBarcodeItem(rawCode, symbology);
    return { index, raw: line, symbology, code: validated.code, valid: validated.valid, error: validated.error };
  });
}

export function barcodeFilename(symbology, ext) {
  return `barcode-${symbology}.${ext}`;
}

export const DEFAULT_BARCODE_SVG_OPTIONS = {
  moduleWidth: 3,
  barHeight: 120,
  quietZone: 11,
  showText: true,
  bearerBars: false,
};

function resolveBarcodeSvgOptions(options) {
  return {
    moduleWidth: options.moduleWidth ?? DEFAULT_BARCODE_SVG_OPTIONS.moduleWidth,
    barHeight: options.barHeight ?? DEFAULT_BARCODE_SVG_OPTIONS.barHeight,
    quietZone: options.quietZone ?? DEFAULT_BARCODE_SVG_OPTIONS.quietZone,
    showText: options.showText ?? DEFAULT_BARCODE_SVG_OPTIONS.showText,
    bearerBars: options.bearerBars ?? DEFAULT_BARCODE_SVG_OPTIONS.bearerBars,
  };
}

export function computeBarcodeGeometry(segments, totalModules, text, options = {}) {
  const { moduleWidth, barHeight, quietZone, showText, bearerBars } = resolveBarcodeSvgOptions(options);
  const padTop = 8;
  const bearerThickness = bearerBars ? Math.max(4, moduleWidth * 2) : 0;
  const barTop = padTop + bearerThickness;
  const textBandHeight = showText ? 28 : 8;
  const svgWidth = (totalModules + quietZone * 2) * moduleWidth;
  const svgHeight = padTop + barHeight + bearerThickness * 2 + textBandHeight;

  const bars = segments.map((s) => ({
    x: (s.start + quietZone) * moduleWidth,
    y: barTop,
    width: s.width * moduleWidth,
    height: barHeight,
  }));

  const bearerRect = bearerBars
    ? {
        x: quietZone * 0.5 * moduleWidth,
        y: padTop + bearerThickness / 2,
        width: (totalModules + quietZone) * moduleWidth,
        height: barHeight + bearerThickness,
        strokeWidth: bearerThickness,
      }
    : null;

  const label = showText
    ? {
        x: svgWidth / 2,
        y: barTop + barHeight + bearerThickness + 20,
        text,
      }
    : null;

  return { svgWidth, svgHeight, bars, bearerRect, label };
}

export function buildBarcodeSvg(segments, totalModules, text, options = {}) {
  const geom = computeBarcodeGeometry(segments, totalModules, text, options);
  const rects = geom.bars
    .map((b) => `<rect x="${b.x}" y="${b.y}" width="${b.width}" height="${b.height}" fill="#000"/>`)
    .join('');
  const bearerRect = geom.bearerRect
    ? `<rect x="${geom.bearerRect.x}" y="${geom.bearerRect.y}" width="${geom.bearerRect.width}" height="${geom.bearerRect.height}" fill="none" stroke="#000" stroke-width="${geom.bearerRect.strokeWidth}"/>`
    : '';
  const textElement = geom.label
    ? `<text x="${geom.label.x}" y="${geom.label.y}" text-anchor="middle" font-family="ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace" font-size="16" font-weight="600" letter-spacing="2" fill="#000">${escapeXmlText(geom.label.text)}</text>`
    : '';
  const markup = `<svg xmlns="http://www.w3.org/2000/svg" width="${geom.svgWidth}" height="${geom.svgHeight}" viewBox="0 0 ${geom.svgWidth} ${geom.svgHeight}"><rect width="100%" height="100%" fill="#fff"/>${rects}${bearerRect}${textElement}</svg>`;
  return { svgWidth: geom.svgWidth, svgHeight: geom.svgHeight, markup };
}

export function encodeSymbologyItem(symbology, code) {
  if (symbology === 'ean13') return { text: code, modules: encodeEan13Modules(code) };
  if (symbology === 'upca') return { text: code, modules: encodeUpcaModules(code) };
  if (symbology === 'itf14') return { text: code, modules: encodeItf14Modules(code) };
  if (symbology === 'code39') return { text: `*${code}*`, modules: encodeCode39Modules(code) };
  return { text: code, modules: encodeCode128Modules(code) };
}

export function renderBarcodeSvg(symbology, rawInput, options = {}) {
  const validated = validateBarcodeItem(rawInput, symbology);
  if (!validated.valid) {
    throw new Error(validated.error || `Invalid ${symbology} barcode input`);
  }
  const encoded = encodeSymbologyItem(symbology, validated.code);
  const segments = modulesToBarSegments(encoded.modules);
  return buildBarcodeSvg(segments, encoded.modules.length, encoded.text, {
    ...options,
    bearerBars: options.bearerBars ?? symbology === 'itf14',
  });
}

export function buildBulkBarcodeZipEntries(items, options = {}) {
  const entries = {};
  let seq = 0;
  for (const item of items) {
    if (!item.valid) continue;
    seq += 1;
    const encoded = encodeSymbologyItem(item.symbology, item.code);
    const segments = modulesToBarSegments(encoded.modules);
    const layout = buildBarcodeSvg(segments, encoded.modules.length, encoded.text, {
      ...options,
      bearerBars: item.symbology === 'itf14',
    });
    const safeSlug = item.code.replace(/[^a-zA-Z0-9_-]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 32) || 'barcode';
    const prefix = String(seq).padStart(3, '0');
    entries[`${prefix}-${item.symbology}-${safeSlug}.svg`] = layout.markup;
  }
  return entries;
}
