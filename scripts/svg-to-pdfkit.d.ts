// svg-to-pdfkit ships without type definitions; this covers the options build-media-kit.ts uses.
declare module 'svg-to-pdfkit' {
  interface SvgToPdfOptions {
    width?: number;
    height?: number;
    preserveAspectRatio?: string;
  }

  export default function SVGtoPDF(
    doc: PDFKit.PDFDocument,
    svg: string,
    x: number,
    y: number,
    options?: SvgToPdfOptions,
  ): void;
}
