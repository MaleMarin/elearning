"use client";

import { useState, useCallback } from "react";
import {
  type LessonBlock,
  type BlockType,
  type CalloutVariant,
  generateBlockId,
  legacyContentToBlocks,
} from "@/lib/services/lessonBlocks";
import { GripVertical, Trash2, ChevronUp, ChevronDown, Plus } from "lucide-react";

const BLOCK_TYPES: { value: BlockType; label: string }[] = [
  { value: "text", label: "Texto" },
  { value: "heading", label: "Encabezado (H2/H3)" },
  { value: "callout", label: "Callout (Tip / Importante / Recuerda)" },
  { value: "toggle", label: "Toggle (colapsable)" },
  { value: "image", label: "Imagen" },
  { value: "video_embed", label: "Video (YouTube/Loom)" },
  { value: "separator", label: "Separador" },
  { value: "quote", label: "Cita" },
  { value: "list", label: "Lista" },
  { value: "code", label: "Código" },
  { value: "checklist", label: "Checklist" },
  { value: "h5p", label: "H5P" },
];

function createBlock(type: BlockType): LessonBlock {
  const id = generateBlockId();
  switch (type) {
    case "text":
      return { id, type: "text", content: "" };
    case "heading":
      return { id, type: "heading", level: 2, content: "" };
    case "callout":
      return { id, type: "callout", variant: "tip", content: "" };
    case "toggle":
      return { id, type: "toggle", title: "", content: "" };
    case "image":
      return { id, type: "image", url: "", caption: "" };
    case "video_embed":
      return { id, type: "video_embed", url: "" };
    case "separator":
      return { id, type: "separator" };
    case "quote":
      return { id, type: "quote", content: "", attribution: "" };
    case "list":
      return { id, type: "list", ordered: false, items: [""] };
    case "code":
      return { id, type: "code", code: "", language: "" };
    case "checklist":
      return { id, type: "checklist", items: [{ id: generateBlockId(), text: "", checked: false }] };
    case "h5p":
      return { id, type: "h5p", contentId: "" };
    default:
      return { id, type: "text", content: "" };
  }
}

interface LessonEditorProps {
  blocks: LessonBlock[];
  onChange: (blocks: LessonBlock[]) => void;
  h5pContentIds?: { id: string; title: string }[];
  /** Contenido legacy para migrar a un bloque de texto. */
  legacyContent?: string | null;
  onMigrateFromLegacy?: () => void;
}

export function LessonEditor({
  blocks,
  onChange,
  h5pContentIds = [],
  legacyContent,
  onMigrateFromLegacy,
}: LessonEditorProps) {
  const [addingType, setAddingType] = useState<BlockType | "">("");
  const [editingId, setEditingId] = useState<string | null>(null);

  const setBlocks = useCallback(
    (next: LessonBlock[]) => {
      onChange(next);
    },
    [onChange]
  );

  const addBlock = useCallback(
    (type: BlockType) => {
      setBlocks([...blocks, createBlock(type)]);
      setAddingType("");
    },
    [blocks, setBlocks]
  );

  const removeBlock = useCallback(
    (id: string) => {
      setBlocks(blocks.filter((b) => b.id !== id));
      setEditingId(null);
    },
    [blocks, setBlocks]
  );

  const updateBlock = useCallback(
    (id: string, patch: Partial<LessonBlock>) => {
      setBlocks(
        blocks.map((b) => (b.id === id ? { ...b, ...patch } : b)) as LessonBlock[]
      );
    },
    [blocks, setBlocks]
  );

  const move = useCallback(
    (index: number, dir: -1 | 1) => {
      const i = index + dir;
      if (i < 0 || i >= blocks.length) return;
      const copy = [...blocks];
      [copy[index], copy[i]] = [copy[i], copy[index]];
      setBlocks(copy);
    },
    [blocks, setBlocks]
  );

  const migrateFromLegacy = useCallback(() => {
    const migrated = legacyContentToBlocks(legacyContent ?? "");
    if (migrated.length > 0) setBlocks(migrated);
    onMigrateFromLegacy?.();
  }, [legacyContent, setBlocks, onMigrateFromLegacy]);

  return (
    <div className="space-y-4">
      {legacyContent && legacyContent.trim() && blocks.length === 0 && (
        <div className="p-4 rounded-xl border border-amber-200 bg-amber-50 text-amber-900">
          <p className="text-sm font-medium mb-2">Tienes contenido en texto plano.</p>
          <button
            type="button"
            onClick={migrateFromLegacy}
            className="px-3 py-2 rounded-lg bg-amber-100 hover:bg-amber-200 text-sm font-medium"
          >
            Migrar a un bloque de texto
          </button>
        </div>
      )}

      <div className="flex flex-wrap items-center gap-2">
        <label className="text-sm font-medium text-[var(--ink)]">Agregar bloque:</label>
        <select
          value={addingType}
          onChange={(e) => {
            const v = e.target.value as BlockType | "";
            setAddingType(v);
            if (v) addBlock(v);
          }}
          className="px-3 py-2 rounded-xl border border-[var(--line)] bg-white text-[var(--ink)] text-sm"
        >
          <option value="">— Elegir tipo —</option>
          {BLOCK_TYPES.map((t) => (
            <option key={t.value} value={t.value}>
              {t.label}
            </option>
          ))}
        </select>
        <button
          type="button"
          onClick={() => addingType && addBlock(addingType)}
          className="inline-flex items-center gap-1 px-3 py-2 rounded-xl border border-[var(--line)] bg-[var(--cream)] text-[var(--ink)] text-sm hover:bg-[var(--line)]/20"
        >
          <Plus className="w-4 h-4" />
          Añadir
        </button>
      </div>

      <ul className="space-y-2 list-none">
        {blocks.map((block, index) => (
          <li
            key={block.id}
            className="flex items-start gap-2 p-3 rounded-xl border border-[var(--line)] bg-white"
          >
            <div className="flex flex-col gap-0.5 shrink-0">
              <button
                type="button"
                onClick={() => move(index, -1)}
                disabled={index === 0}
                className="p-1 rounded text-[var(--ink-muted)] hover:bg-[var(--cream)] disabled:opacity-30"
                aria-label="Subir"
              >
                <ChevronUp className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => move(index, 1)}
                disabled={index === blocks.length - 1}
                className="p-1 rounded text-[var(--ink-muted)] hover:bg-[var(--cream)] disabled:opacity-30"
                aria-label="Bajar"
              >
                <ChevronDown className="w-4 h-4" />
              </button>
            </div>
            <GripVertical className="w-4 h-4 text-[var(--ink-muted)] shrink-0 mt-1" aria-hidden />
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between gap-2 mb-2">
                <span className="text-xs font-medium text-[var(--ink-muted)] uppercase">
                  {block.type}
                </span>
                <button
                  type="button"
                  onClick={() => removeBlock(block.id)}
                  className="p-1 rounded text-[var(--error)] hover:bg-red-50"
                  aria-label="Eliminar bloque"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
              <BlockEditorForm
                block={block}
                isOpen={editingId === block.id}
                onToggle={() => setEditingId(editingId === block.id ? null : block.id)}
                onChange={(patch) => updateBlock(block.id, patch)}
                h5pContentIds={h5pContentIds}
              />
            </div>
          </li>
        ))}
      </ul>

      {blocks.length === 0 && !legacyContent?.trim() && (
        <p className="text-sm text-[var(--ink-muted)]">
          Añade bloques con el selector de arriba o escribe contenido en el campo &quot;Contenido (Markdown)&quot; y migra.
        </p>
      )}
    </div>
  );
}

function BlockEditorForm({
  block,
  isOpen,
  onToggle,
  onChange,
  h5pContentIds,
}: {
  block: LessonBlock;
  isOpen: boolean;
  onToggle: () => void;
  onChange: (patch: Partial<LessonBlock>) => void;
  h5pContentIds: { id: string; title: string }[];
}) {
  const common = "w-full px-3 py-2 rounded-lg border border-[var(--line)] bg-white text-[var(--ink)] text-sm";

  if (!isOpen) {
    const preview = getBlockPreview(block);
    return (
      <button
        type="button"
        onClick={onToggle}
        className="text-left w-full py-2 text-sm text-[var(--ink-muted)] hover:text-[var(--ink)]"
      >
        {preview || "Editar…"}
      </button>
    );
  }

  switch (block.type) {
    case "text":
      return (
        <div className="space-y-2">
          <textarea
            value={block.content}
            onChange={(e) => onChange({ content: e.target.value })}
            rows={4}
            className={common}
            placeholder="Texto (puedes usar **negrita**)"
          />
          <button type="button" onClick={onToggle} className="text-xs text-[var(--primary)]">
            Cerrar
          </button>
        </div>
      );
    case "heading":
      return (
        <div className="space-y-2">
          <select
            value={block.level}
            onChange={(e) => onChange({ level: Number(e.target.value) as 2 | 3 })}
            className={common}
          >
            <option value={2}>H2</option>
            <option value={3}>H3</option>
          </select>
          <input
            type="text"
            value={block.content}
            onChange={(e) => onChange({ content: e.target.value })}
            className={common}
            placeholder="Título"
          />
          <button type="button" onClick={onToggle} className="text-xs text-[var(--primary)]">
            Cerrar
          </button>
        </div>
      );
    case "callout":
      return (
        <div className="space-y-2">
          <select
            value={block.variant}
            onChange={(e) => onChange({ variant: e.target.value as CalloutVariant })}
            className={common}
          >
            <option value="tip">💡 Tip</option>
            <option value="important">⚠️ Importante</option>
            <option value="remember">📌 Recuerda</option>
          </select>
          <input
            type="text"
            value={block.title ?? ""}
            onChange={(e) => onChange({ title: e.target.value })}
            className={common}
            placeholder="Título (opcional)"
          />
          <textarea
            value={block.content}
            onChange={(e) => onChange({ content: e.target.value })}
            rows={3}
            className={common}
            placeholder="Contenido"
          />
          <button type="button" onClick={onToggle} className="text-xs text-[var(--primary)]">
            Cerrar
          </button>
        </div>
      );
    case "toggle":
      return (
        <div className="space-y-2">
          <input
            type="text"
            value={block.title}
            onChange={(e) => onChange({ title: e.target.value })}
            className={common}
            placeholder="Título del toggle"
          />
          <textarea
            value={block.content}
            onChange={(e) => onChange({ content: e.target.value })}
            rows={3}
            className={common}
            placeholder="Contenido al expandir"
          />
          <button type="button" onClick={onToggle} className="text-xs text-[var(--primary)]">
            Cerrar
          </button>
        </div>
      );
    case "image":
      return (
        <div className="space-y-2">
          <input
            type="url"
            value={block.url}
            onChange={(e) => onChange({ url: e.target.value })}
            className={common}
            placeholder="URL de la imagen"
          />
          <input
            type="text"
            value={block.caption ?? ""}
            onChange={(e) => onChange({ caption: e.target.value })}
            className={common}
            placeholder="Caption (opcional)"
          />
          <button type="button" onClick={onToggle} className="text-xs text-[var(--primary)]">
            Cerrar
          </button>
        </div>
      );
    case "video_embed":
      return (
        <div className="space-y-2">
          <input
            type="url"
            value={block.url}
            onChange={(e) => onChange({ url: e.target.value })}
            className={common}
            placeholder="URL YouTube o Loom"
          />
          <button type="button" onClick={onToggle} className="text-xs text-[var(--primary)]">
            Cerrar
          </button>
        </div>
      );
    case "quote":
      return (
        <div className="space-y-2">
          <textarea
            value={block.content}
            onChange={(e) => onChange({ content: e.target.value })}
            rows={2}
            className={common}
            placeholder="Cita"
          />
          <input
            type="text"
            value={block.attribution ?? ""}
            onChange={(e) => onChange({ attribution: e.target.value })}
            className={common}
            placeholder="Atribución (opcional)"
          />
          <button type="button" onClick={onToggle} className="text-xs text-[var(--primary)]">
            Cerrar
          </button>
        </div>
      );
    case "list":
      return (
        <div className="space-y-2">
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={block.ordered}
              onChange={(e) => onChange({ ordered: e.target.checked })}
            />
            Lista numerada
          </label>
          {block.items.map((item, i) => (
            <input
              key={i}
              type="text"
              value={item}
              onChange={(e) => {
                const items = [...block.items];
                items[i] = e.target.value;
                onChange({ items });
              }}
              className={common}
              placeholder={`Elemento ${i + 1}`}
            />
          ))}
          <button
            type="button"
            onClick={() => onChange({ items: [...block.items, ""] })}
            className="text-xs text-[var(--primary)]"
          >
            + Añadir elemento
          </button>
          <button type="button" onClick={onToggle} className="text-xs text-[var(--primary)] block">
            Cerrar
          </button>
        </div>
      );
    case "code":
      return (
        <div className="space-y-2">
          <input
            type="text"
            value={block.language ?? ""}
            onChange={(e) => onChange({ language: e.target.value })}
            className={common}
            placeholder="Lenguaje (opcional)"
          />
          <textarea
            value={block.code}
            onChange={(e) => onChange({ code: e.target.value })}
            rows={6}
            className={`${common} font-mono`}
            placeholder="Código"
          />
          <button type="button" onClick={onToggle} className="text-xs text-[var(--primary)]">
            Cerrar
          </button>
        </div>
      );
    case "checklist":
      return (
        <div className="space-y-2">
          {block.items.map((item, i) => (
            <div key={item.id} className="flex gap-2">
              <input
                type="checkbox"
                checked={item.checked}
                onChange={(e) => {
                  const items = block.items.map((it) =>
                    it.id === item.id ? { ...it, checked: e.target.checked } : it
                  );
                  onChange({ items });
                }}
                className="mt-2"
              />
              <input
                type="text"
                value={item.text}
                onChange={(e) => {
                  const items = block.items.map((it) =>
                    it.id === item.id ? { ...it, text: e.target.value } : it
                  );
                  onChange({ items });
                }}
                className={common}
                placeholder="Texto del ítem"
              />
            </div>
          ))}
          <button
            type="button"
            onClick={() =>
              onChange({
                items: [
                  ...block.items,
                  { id: generateBlockId(), text: "", checked: false },
                ],
              })
            }
            className="text-xs text-[var(--primary)]"
          >
            + Añadir ítem
          </button>
          <button type="button" onClick={onToggle} className="text-xs text-[var(--primary)] block">
            Cerrar
          </button>
        </div>
      );
    case "h5p":
      return (
        <div className="space-y-2">
          <select
            value={block.contentId}
            onChange={(e) => onChange({ contentId: e.target.value })}
            className={common}
          >
            <option value="">— Seleccionar H5P —</option>
            {h5pContentIds.map((h) => (
              <option key={h.id} value={h.id}>
                {h.title}
              </option>
            ))}
          </select>
          <button type="button" onClick={onToggle} className="text-xs text-[var(--primary)]">
            Cerrar
          </button>
        </div>
      );
    case "separator":
      return (
        <button type="button" onClick={onToggle} className="text-xs text-[var(--primary)]">
          Cerrar
        </button>
      );
    default:
      return null;
  }
}

function getBlockPreview(block: LessonBlock): string {
  switch (block.type) {
    case "text":
      return (block.content as string).slice(0, 60) + ((block.content as string).length > 60 ? "…" : "");
    case "heading":
      return `${block.level === 2 ? "H2" : "H3"}: ${(block.content as string).slice(0, 40)}`;
    case "callout":
      return `${block.variant}: ${(block.title ?? block.content as string).slice(0, 40)}`;
    case "toggle":
      return (block.title as string).slice(0, 50) || "Toggle";
    case "image":
      return (block.url as string) ? "Imagen" : "Sin URL";
    case "video_embed":
      return (block.url as string) ? "Video" : "Sin URL";
    case "quote":
      return (block.content as string).slice(0, 50) + "…";
    case "list":
      return `${(block.items as string[]).length} elementos`;
    case "code":
      return (block.language as string) || "Código";
    case "checklist":
      return `${(block.items as { text: string }[]).length} ítems`;
    case "h5p":
      return (block.contentId as string) ? "H5P" : "Sin H5P";
    case "separator":
      return "—";
    default:
      return "";
  }
}
