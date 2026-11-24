export declare const CODE128_START_B: number;
export declare const CODE128_START_C: number;
export declare const CODE128_STOP: number;

export interface BarSegment {
  readonly start: number;
  readonly width: number;
}
export interface ParsedNumericBarcode {
  status: 'valid_payload' | 'valid_full' | 'mismatch_full' | 'invalid';
  code?: string;
  correctedCode?: string;
  expectedCheckDigit?: number;
  actualCheckDigit?: number;
}
export type BarcodeSymbology = 'ean13' | 'upca' | 'code128' | 'code39' | 'itf14';
export interface BulkBarcodeItem {
  index: number;
  raw: string;
  symbology: BarcodeSymbology;
  code: string;
  valid: boolean;
  error?: string;
}
export interface BarcodeSvgOptions {
  moduleWidth?: number;
  barHeight?: number;
  quietZone?: number;
  showText?: boolean;
  bearerBars?: boolean;
}
export interface BarcodeBarRect {
  x: number;
  y: number;
  width: number;
  height: number;
}
export interface BarcodeBearerFrame {
  x: number;
  y: number;
  width: number;
  height: number;
  strokeWidth: number;
}
export interface BarcodeTextLabel {
  x: number;
  y: number;
  text: string;
}
export interface BarcodeGeometry {
  svgWidth: number;
  svgHeight: number;
  bars: BarcodeBarRect[];
  bearerRect: BarcodeBearerFrame | null;
  label: BarcodeTextLabel | null;
}
export interface BarcodeSvgLayout {
  svgWidth: number;
  svgHeight: number;
  markup: string;
}

export declare const DEFAULT_BARCODE_SVG_OPTIONS: Required<BarcodeSvgOptions>;
export declare function calculateMod10CheckDigit(payload: string, evenIndexWeight: number, oddIndexWeight: number): number;
export declare function computeEan13CheckDigit(payload12: string): number;
export declare function encodeEan13Modules(ean13: string): string;
export declare function isCode128BText(text: string): boolean;
export declare function isCode128CText(text: string): boolean;
export declare function computeCode128Checksum(text: string): number;
export declare function buildCode128Symbols(text: string): number[];
export declare function encodeCode128Modules(text: string): string;
export declare function modulesToBarSegments(modules: string): BarSegment[];
export declare function isEan12Payload(digits: string): boolean;
export declare function isUpc11Payload(digits: string): boolean;
export declare function isItf13Payload(digits: string): boolean;
export declare function buildEan13(payload12: string): string;
export declare function computeUpcaCheckDigit(payload11: string): number;
export declare function buildUpca(payload11: string): string;
export declare function computeItf14CheckDigit(payload13: string): number;
export declare function buildItf14(payload13: string): string;
export declare function parseEan13Input(input: string): ParsedNumericBarcode;
export declare function parseUpcaInput(input: string): ParsedNumericBarcode;
export declare function parseItf14Input(input: string): ParsedNumericBarcode;
export declare function encodeUpcaModules(upca12: string): string;
export declare function isCode39Text(text: string): boolean;
export declare function encodeCode39Modules(text: string): string;
export declare function encodeItf14Modules(digits14: string): string;
export declare function defaultSampleForSymbology(symbology: BarcodeSymbology): string;
export declare function validateBarcodeItem(rawText: string, targetSymbology: BarcodeSymbology): { valid: boolean; code: string; error?: string };
export declare function parseBulkBarcodeText(text: string, defaultSymbology?: BarcodeSymbology): BulkBarcodeItem[];
export declare function barcodeFilename(symbology: BarcodeSymbology, ext: 'svg' | 'png'): string;
export declare function computeBarcodeGeometry(segments: readonly BarSegment[], totalModules: number, text: string, options?: BarcodeSvgOptions): BarcodeGeometry;
export declare function buildBarcodeSvg(segments: readonly BarSegment[], totalModules: number, text: string, options?: BarcodeSvgOptions): BarcodeSvgLayout;
export declare function encodeSymbologyItem(symbology: BarcodeSymbology, code: string): { text: string; modules: string };
export declare function renderBarcodeSvg(symbology: BarcodeSymbology, rawInput: string, options?: BarcodeSvgOptions): BarcodeSvgLayout;
export declare function buildBulkBarcodeZipEntries(items: readonly BulkBarcodeItem[], options?: Omit<BarcodeSvgOptions, 'bearerBars'>): Record<string, string>;
