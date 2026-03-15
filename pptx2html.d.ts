declare module "pptx2html" {
  interface PptxResult {
    slides?: string[];
    html?: string;
  }
  function pptx2html(buffer: Buffer): Promise<string[] | PptxResult>;
  export default pptx2html;
}
