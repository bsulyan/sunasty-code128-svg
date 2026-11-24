# barcode128-svg

Zero-dependency 1D barcode encoder and standalone SVG generator supporting **Code 128** (automatic Subset B + dense numeric Subset C), **EAN-13**, **UPC-A**, **Code 39**, and **ITF-14** (with GS1 bearer frame).

Extracted from the core engine powering [Sunasty Barcode Generator](https://sunasty.com/barcode-generator/) and [Sunasty QR & Barcode Utilities](https://sunasty.com/qr-code/).

## Features

- **Five Industrial Symbologies**: `code128`, `ean13`, `upca`, `code39`, `itf14`.
- **Automatic Dense Subset C**: Compresses even-length numeric strings of 4+ digits (`CODE128_START_C`) automatically with Mod-103 checksum calculation.
- **GS1 Check Digit Validation**: Computes and verifies Mod-10 check digits for 12/13-digit EAN-13, 11/12-digit UPC-A, and 13/14-digit ITF-14 payloads.
- **Print-Ready Standalone SVG**: `renderBarcodeSvg` returns exact `svgWidth`, `svgHeight`, and self-contained SVG markup (zero canvas or DOM required).
- **Bulk CSV Parsing**: `parseBulkBarcodeText` + `buildBulkBarcodeZipEntries` batch-generate named SVG strings for label sheets.

## Installation

```bash
npm install barcode128-svg
# or via JSR
npx jsr add @sunasty/code128-svg
```

## Usage

```js
import { renderBarcodeSvg, parseEan13Input } from 'barcode128-svg';

const svg = renderBarcodeSvg('code128', 'ORD-2026-0042', {
  moduleWidth: 2,
  barHeight: 90,
  showText: true,
});

console.log(svg.svgWidth, svg.svgHeight);
console.log(svg.markup);

const check = parseEan13Input('400638133393'); // computes digit -> '4006381333931'
```

## Related Web Tools

- Browser-based SVG & PNG barcode generator: [https://sunasty.com/barcode-generator/](https://sunasty.com/barcode-generator/)
- Shipping & product label sheet builder: [https://sunasty.com/csv-label-sheet/](https://sunasty.com/csv-label-sheet/)

## License

MIT
