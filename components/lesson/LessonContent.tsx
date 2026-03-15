"use client";

import type { LessonBlock } from "@/lib/services/lessonBlocks";
import type { H5PContentPayload } from "@/lib/services/h5p";
import {
  TextBlock,
  HeadingBlock,
  CalloutBlock,
  ToggleBlock,
  ImageBlock,
  VideoEmbedBlock,
  SeparatorBlock,
  QuoteBlock,
  ListBlock,
  CodeBlock,
  ChecklistBlock,
  H5PBlock,
} from "./blocks";

interface LessonContentProps {
  blocks: LessonBlock[];
  /** Para checklists: guardar estado por lección. */
  lessonId?: string;
  /** Estado inicial de checklists por blockId (opcional, si no se pide al API). */
  checklistState?: Record<string, Record<string, boolean>>;
  /** Contenido H5P ya cargado por contentId (para bloques h5p). */
  h5pContentById?: Record<string, H5PContentPayload>;
  /** Ref para medir progreso de lectura (scroll). */
  onReadingProgress?: (ratio: number) => void;
}

export function LessonContent({
  blocks,
  lessonId,
  checklistState,
  h5pContentById = {},
  onReadingProgress,
}: LessonContentProps) {
  return (
    <div className="space-y-1">
      {blocks.map((block) => {
        switch (block.type) {
          case "text":
            return <TextBlock key={block.id} block={block} />;
          case "heading":
            return <HeadingBlock key={block.id} block={block} />;
          case "callout":
            return <CalloutBlock key={block.id} block={block} />;
          case "toggle":
            return <ToggleBlock key={block.id} block={block} />;
          case "image":
            return <ImageBlock key={block.id} block={block} />;
          case "video_embed":
            return <VideoEmbedBlock key={block.id} block={block} />;
          case "separator":
            return <SeparatorBlock key={block.id} block={block} />;
          case "quote":
            return <QuoteBlock key={block.id} block={block} />;
          case "list":
            return <ListBlock key={block.id} block={block} />;
          case "code":
            return <CodeBlock key={block.id} block={block} />;
          case "checklist":
            return (
              <ChecklistBlock
                key={block.id}
                block={block}
                lessonId={lessonId ?? ""}
                initialState={lessonId ? checklistState?.[block.id] : undefined}
              />
            );
          case "h5p":
            return (
              <H5PBlock
                key={block.id}
                block={block}
                content={block.contentId ? h5pContentById[block.contentId] : null}
                lessonId={lessonId}
              />
            );
          default:
            return null;
        }
      })}
    </div>
  );
}
