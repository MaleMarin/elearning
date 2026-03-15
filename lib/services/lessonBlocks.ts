/**
 * Bloques de contenido tipo Notion para lecciones.
 * Solo tipos y funciones puras (sin Firestore). Seguro para importar en Client Components.
 * Lógica Firestore: @/lib/services/lessonBlocks.server.ts (solo API routes / Server).
 */

export type BlockType =
  | "text"
  | "heading"
  | "callout"
  | "toggle"
  | "image"
  | "video_embed"
  | "separator"
  | "quote"
  | "list"
  | "code"
  | "checklist"
  | "h5p";

export interface BaseBlock {
  id: string;
  type: BlockType;
}

export interface TextBlock extends BaseBlock {
  type: "text";
  /** HTML seguro o texto con marcado simple (bold, italic, links). */
  content: string;
}

export interface HeadingBlock extends BaseBlock {
  type: "heading";
  level: 2 | 3;
  content: string;
}

export type CalloutVariant = "tip" | "important" | "remember";

export interface CalloutBlock extends BaseBlock {
  type: "callout";
  variant: CalloutVariant;
  title?: string;
  content: string;
}

export interface ToggleBlock extends BaseBlock {
  type: "toggle";
  title: string;
  content: string;
}

export interface ImageBlock extends BaseBlock {
  type: "image";
  url: string;
  caption?: string;
  alt?: string;
}

export interface VideoEmbedBlock extends BaseBlock {
  type: "video_embed";
  url: string;
  /** youtube | loom */
  provider?: string;
}

export interface SeparatorBlock extends BaseBlock {
  type: "separator";
}

export interface QuoteBlock extends BaseBlock {
  type: "quote";
  content: string;
  attribution?: string;
}

export interface ListBlock extends BaseBlock {
  type: "list";
  ordered: boolean;
  items: string[];
}

export interface CodeBlock extends BaseBlock {
  type: "code";
  code: string;
  language?: string;
}

export interface ChecklistItem {
  id: string;
  text: string;
  checked: boolean;
}

export interface ChecklistBlock extends BaseBlock {
  type: "checklist";
  items: ChecklistItem[];
}

export interface H5PBlock extends BaseBlock {
  type: "h5p";
  contentId: string;
}

export type LessonBlock =
  | TextBlock
  | HeadingBlock
  | CalloutBlock
  | ToggleBlock
  | ImageBlock
  | VideoEmbedBlock
  | SeparatorBlock
  | QuoteBlock
  | ListBlock
  | CodeBlock
  | ChecklistBlock
  | H5PBlock;

const BLOCK_ID_PREFIX = "blk_";

export function generateBlockId(): string {
  return BLOCK_ID_PREFIX + Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
}

/** Convierte contenido legacy (string markdown) en un único bloque de tipo text. */
export function legacyContentToBlocks(content: string | null | undefined): LessonBlock[] {
  const trimmed = (content ?? "").trim();
  if (!trimmed) return [];
  return [
    {
      id: generateBlockId(),
      type: "text",
      content: trimmed,
    },
  ];
}

/** Indica si la lección debe renderizarse por bloques (tiene array blocks con al menos un elemento). */
export function hasBlocks(lesson: { blocks?: unknown[] }): boolean {
  return Array.isArray(lesson.blocks) && lesson.blocks.length > 0;
}

/** Obtiene bloques para mostrar: si la lección tiene blocks los devuelve; si no, convierte content a un bloque text. */
export function getBlocksForRender(lesson: {
  content?: string | null;
  blocks?: LessonBlock[];
}): LessonBlock[] {
  if (hasBlocks(lesson)) return lesson.blocks!;
  return legacyContentToBlocks(lesson.content);
}

/** Extrae texto plano de bloques para TTS (Brecha 3). */
export function getPlainTextFromBlocks(blocks: LessonBlock[]): string {
  const parts: string[] = [];
  for (const block of blocks) {
    switch (block.type) {
      case "text":
      case "heading":
        parts.push(block.content);
        break;
      case "callout":
        if (block.title) parts.push(block.title);
        parts.push(block.content);
        break;
      case "toggle":
        parts.push(block.title);
        parts.push(block.content);
        break;
      case "quote":
        parts.push(block.content);
        break;
      case "list":
        parts.push(block.items.join(". "));
        break;
      case "checklist":
        parts.push(block.items.map((i) => i.text).join(". "));
        break;
      default:
        break;
    }
  }
  return parts.filter(Boolean).join("\n\n");
}
