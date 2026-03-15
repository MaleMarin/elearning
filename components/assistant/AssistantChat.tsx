"use client";

import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { useChat } from "@ai-sdk/react";
import { Mic, Loader2, Paperclip } from "lucide-react";
import { DefaultChatTransport } from "ai";
import type { AssistantMode } from "@/lib/types/database";
import type { LessonContext } from "@/lib/types/database";
import type { LLMProvider } from "@/lib/ai/providers";
import {
  BibliographyCard,
  parseBibliographyFromMessage,
  stripBibliographyBlock,
} from "./BibliographyCard";

const DEMO_MODE = typeof process !== "undefined" && process.env.NEXT_PUBLIC_DEMO_MODE === "true";

interface LegacyMessage {
  id: string;
  role: "user" | "assistant" | "system";
  content: string;
  created_at: string;
}

export interface RoleplayContext {
  scenarioId: string;
  scenarioTitle: string;
  characterPrompt: string;
  openingLine: string;
}

interface AssistantChatProps {
  mode: AssistantMode;
  lessonContext: LessonContext | null;
  cohortId?: string | null;
  courseId?: string | null;
  provider: LLMProvider;
  onClose?: () => void;
  /** Sugerencias rápidas (Mayer / Nielsen) para mostrar cuando no hay mensajes */
  quickSuggestions?: string[];
  /** Cuando mode === "roleplay", contexto del escenario para el system prompt */
  roleplayContext?: RoleplayContext | null;
  /** Llamado cuando llega una nueva respuesta del asistente (p. ej. para capturar feedback de roleplay). */
  onAssistantMessage?: (text: string) => void;
  /** Llamado cuando el usuario hace clic en "Salir del escenario" (envía FINALIZAR_ROLEPLAY). */
  onExitRoleplayClick?: () => void;
  /** Llamado cuando el usuario envía un mensaje (para contar turnos en roleplay). */
  onUserMessage?: () => void;
}

/** Extrae texto de un mensaje del hook useChat (UIMessage). */
function getMessageText(msg: { parts?: Array<{ type?: string; text?: string }>; content?: string }): string {
  if (typeof msg.content === "string") return msg.content;
  const parts = msg.parts;
  if (Array.isArray(parts))
    return parts.map((p) => (p?.type === "text" ? p.text : "")).filter(Boolean).join(" ") || "";
  return "";
}

/** Construye context para la API según mode (lesson o roleplay). */
function buildApiContext(
  mode: AssistantMode,
  lessonContext: LessonContext | null,
  roleplayContext: RoleplayContext | null | undefined
): Record<string, unknown> | undefined {
  if (mode === "roleplay" && roleplayContext) {
    return {
      roleplayScenarioId: roleplayContext.scenarioId,
      roleplayScenarioTitle: roleplayContext.scenarioTitle,
      roleplayCharacter: roleplayContext.characterPrompt,
      roleplayOpeningLine: roleplayContext.openingLine,
    };
  }
  return (lessonContext ?? undefined) as Record<string, unknown> | undefined;
}

/** Chat en modo demo: fetch JSON, sin stream. */
function DemoChat({
  mode,
  lessonContext,
  roleplayContext,
  cohortId,
  courseId,
  provider,
  onClose,
  quickSuggestions,
  onAssistantMessage,
  onExitRoleplayClick,
  onUserMessage,
}: AssistantChatProps) {
  const [threadId, setThreadId] = useState<string | null>(null);
  const [messages, setMessages] = useState<LegacyMessage[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [modelUsed, setModelUsed] = useState<string | null>(null);
  const [uploadedDocuments, setUploadedDocuments] = useState<string[]>([]);
  const [uploadingFile, setUploadingFile] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const send = async () => {
    const t = input.trim();
    if (t) await sendWithText(t);
  };

  const sendWithText = async (textToSend: string) => {
    const text = textToSend.trim();
    if (!text || loading) return;
    onUserMessage?.();
    setInput("");
    setError(null);
    setLoading(true);
    const userMsg: LegacyMessage = {
      id: "temp-" + Date.now(),
      role: "user",
      content: text,
      created_at: new Date().toISOString(),
    };
    setMessages((prev) => [...prev, userMsg]);
    try {
      const res = await fetch("/api/assistant", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          mode,
          threadId: threadId ?? undefined,
          message: text,
          context: buildApiContext(mode, lessonContext, roleplayContext),
          cohortId: cohortId ?? undefined,
          courseId: courseId ?? undefined,
          provider,
          uploadedDocuments: uploadedDocuments.length > 0 ? uploadedDocuments : undefined,
        }),
      });
      const model = res.headers.get("X-Model-Used");
      if (model) setModelUsed(model);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Error");
      if (data.threadId) setThreadId(data.threadId);
      const assistantContent = data.message ?? "";
      setMessages((prev) => [
        ...prev,
        {
          id: "assistant-" + Date.now(),
          role: "assistant",
          content: assistantContent,
          created_at: new Date().toISOString(),
        },
      ]);
      onAssistantMessage?.(assistantContent);
      setUploadedDocuments([]);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Error al enviar");
    } finally {
      setLoading(false);
    }
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    e.target.value = "";
    setUploadingFile(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      const res = await fetch("/api/documents/extract", { method: "POST", credentials: "include", body: formData });
      const data = await res.json();
      if (res.ok && data.text) {
        setUploadedDocuments((prev) => [...prev, data.text]);
      } else {
        setError(data.error ?? "Error al procesar el archivo");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al subir");
    } finally {
      setUploadingFile(false);
    }
  };

  const displayMessages = messages.filter((m) => m.role !== "system");
  const lastAssistant = [...displayMessages].reverse().find((m) => m.role === "assistant");
  const showExitRoleplay = mode === "roleplay" && roleplayContext;

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {displayMessages.length === 0 && (
          <div className="text-center py-4">
            <p className="text-[var(--text-muted)] mb-3">
              {mode === "tutor" && "Pregunta algo sobre la lección o el curso."}
              {mode === "support" && "Cuéntame en qué necesitas ayuda. Revisa el FAQ o abre un ticket."}
              {mode === "community" && "Pregunta sobre la comunidad, moderación o dinamización."}
              {mode === "roleplay" && "El bot actuará como el personaje del escenario. Escribe FINALIZAR_ROLEPLAY o usa «Salir del escenario» para recibir feedback."}
            </p>
            {quickSuggestions && quickSuggestions.length > 0 && (
              <div className="flex flex-wrap justify-center gap-2 mt-3">
                {quickSuggestions.map((text) => (
                  <button
                    key={text}
                    type="button"
                    onClick={() => setInput(text)}
                    className="px-3 py-2 rounded-xl border border-[var(--line)] bg-white text-sm text-[var(--ink)] hover:bg-[var(--cream)] focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--primary)]"
                  >
                    {text}
                  </button>
                ))}
              </div>
            )}
          </div>
        )}
        {displayMessages.map((m) => (
          <div
            key={m.id}
            className={`flex ${m.role === "user" ? "justify-end" : "justify-start"} flex-col items-${m.role === "user" ? "end" : "start"}`}
          >
            <div
              className={`max-w-[85%] rounded-xl px-4 py-3 ${
                m.role === "user" ? "bg-[var(--accent)] text-white" : "card-white"
              }`}
            >
              <p className="whitespace-pre-wrap text-base">
                {m.role === "assistant" ? stripBibliographyBlock(m.content) : m.content}
              </p>
              {m.role === "assistant" && (() => {
                const bib = parseBibliographyFromMessage(m.content);
                return bib ? <BibliographyCard data={bib} className="mt-3" /> : null;
              })()}
            </div>
            {m.role === "assistant" && lastAssistant?.id === m.id && modelUsed && (
              <p className="mt-1 text-xs text-[var(--ink-muted)]" aria-hidden>
                Respondiendo con {modelUsed}
              </p>
            )}
          </div>
        ))}
        {error && (
          <p className="text-[var(--error)] text-sm" role="alert">
            {error}
          </p>
        )}
        <div ref={bottomRef} />
      </div>
      <div className="p-4 border-t border-cream-dark bg-white">
        {showExitRoleplay && (
          <div className="mb-3 flex justify-end">
            <button
              type="button"
              onClick={() => {
                onExitRoleplayClick?.();
                sendWithText("FINALIZAR_ROLEPLAY");
              }}
              disabled={loading}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-[var(--line)] bg-white text-sm text-[var(--ink)] hover:bg-[var(--cream)] focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--primary)] disabled:opacity-50"
            >
              Salir del escenario
            </button>
          </div>
        )}
        <form onSubmit={(e) => { e.preventDefault(); send(); }} className="flex flex-col gap-2">
          {uploadedDocuments.length > 0 && (
            <p className="text-xs text-[var(--acento-dark)] flex items-center gap-1">
              <Paperclip className="w-3.5 h-3.5" />
              {uploadedDocuments.length} documento(s) listo(s) para resumir o preguntar (estilo NotebookLM).
            </p>
          )}
          <div className="flex gap-2">
            <input type="file" ref={fileInputRef} onChange={handleFileSelect} accept=".pdf,.pptx,.txt,audio/*,.webm,.mp3,.m4a,.wav" className="hidden" aria-hidden />
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={loading || uploadingFile}
              title="Subir documento (PDF, PPTX, TXT) o audio para resumir o preguntar"
              aria-label="Subir documento o audio"
              className="flex items-center justify-center w-12 h-12 rounded-full border-2 border-gray-300 text-[var(--ink-muted)] hover:border-[var(--accent)] hover:text-[var(--accent)] shrink-0 disabled:opacity-50"
            >
              {uploadingFile ? <Loader2 className="w-5 h-5 animate-spin" /> : <Paperclip className="w-5 h-5" />}
            </button>
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="¿Cómo te ayudo?"
              className="flex-1 px-4 py-3 rounded-lg border border-gray-300 text-[var(--text)] text-base min-h-[48px] focus:outline focus:ring-2 focus:ring-[var(--accent)]"
              disabled={loading}
              aria-label="Mensaje"
            />
            <button type="submit" disabled={loading || !input.trim()} className="btn-primary disabled:opacity-50">
              {loading ? "…" : "Enviar"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export function AssistantChat(props: AssistantChatProps) {
  if (DEMO_MODE) return <DemoChat {...props} />;
  return <StreamChat {...props} />;
}

function StreamChat({
  mode,
  lessonContext,
  roleplayContext,
  cohortId,
  courseId,
  provider,
  quickSuggestions,
  onAssistantMessage,
  onExitRoleplayClick,
  onUserMessage,
}: AssistantChatProps) {
  const bottomRef = useRef<HTMLDivElement>(null);
  const lastReportedIdRef = useRef<string | null>(null);
  const [threadId, setThreadId] = useState<string | null>(null);
  const [modelUsed, setModelUsed] = useState<string | null>(null);
  const [uploadedDocuments, setUploadedDocuments] = useState<string[]>([]);
  const fetchWithHeaders = useCallback(async (url: RequestInfo | URL, init?: RequestInit) => {
    const res = await fetch(url, init);
    const tid = res.headers.get("X-Thread-Id");
    if (tid) setThreadId(tid);
    const model = res.headers.get("X-Model-Used");
    if (model) setModelUsed(model);
    return res;
  }, []);

  const apiContext = buildApiContext(mode, lessonContext, roleplayContext);
  const body = useMemo(
    () => ({
      provider,
      context: apiContext,
      mode,
      threadId: threadId ?? undefined,
      cohortId: cohortId ?? undefined,
      courseId: courseId ?? undefined,
      uploadedDocuments: uploadedDocuments.length > 0 ? uploadedDocuments : undefined,
    }),
    [provider, mode, apiContext, threadId, cohortId, courseId, uploadedDocuments]
  );

  const { messages, sendMessage: rawSendMessage, status, error } = useChat({
    transport: new DefaultChatTransport({
      api: "/api/assistant",
      body,
      fetch: fetchWithHeaders,
    }),
  });

  const sendMessage = useCallback(
    (opts: { text: string }) => {
      onUserMessage?.();
      return rawSendMessage(opts);
    },
    [rawSendMessage, onUserMessage]
  );

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const displayMessages = messages.filter((m) => m.role !== "system");
  const lastAssistant = [...displayMessages].reverse().find((m) => m.role === "assistant");
  useEffect(() => {
    if (lastAssistant && lastAssistant.id !== lastReportedIdRef.current && status !== "streaming") {
      lastReportedIdRef.current = lastAssistant.id;
      const text = getMessageText(lastAssistant);
      if (text) onAssistantMessage?.(text);
    }
  }, [lastAssistant?.id, status, onAssistantMessage]);

  const loading = status === "streaming" || status === "submitted";

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {displayMessages.length === 0 && (
          <div className="text-center py-4">
            <p className="text-[var(--text-muted)] mb-3">
              {mode === "tutor" && "Pregunta algo sobre la lección o el curso."}
              {mode === "support" && "Cuéntame en qué necesitas ayuda. Revisa el FAQ o abre un ticket."}
              {mode === "community" && "Pregunta sobre la comunidad, moderación o dinamización."}
              {mode === "roleplay" && "El bot actuará como el personaje del escenario. Escribe FINALIZAR_ROLEPLAY o usa «Salir del escenario» para recibir feedback."}
            </p>
            {quickSuggestions && quickSuggestions.length > 0 && (
              <div className="flex flex-wrap justify-center gap-2 mt-3">
                {quickSuggestions.map((text) => (
                  <button
                    key={text}
                    type="button"
                    onClick={() => sendMessage({ text })}
                    className="px-3 py-2 rounded-xl bg-[var(--neu-bg)] text-sm text-[var(--azul)] hover:opacity-90 focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--acento)] transition-all"
                    style={{ boxShadow: "var(--neu-shadow-out-sm)" }}
                  >
                    {text}
                  </button>
                ))}
              </div>
            )}
          </div>
        )}
        {displayMessages.map((m) => (
          <div
            key={m.id}
            className={`flex ${m.role === "user" ? "justify-end" : "justify-start"} flex-col items-${
              m.role === "user" ? "end" : "start"
            }`}
          >
            <div
              className={`max-w-[85%] rounded-2xl px-4 py-3 ${
                m.role === "user"
                  ? "bg-[var(--acento)] text-[var(--azul-dark)] font-medium"
                  : "bg-[var(--neu-bg)] text-[var(--azul)]"
              }`}
              style={{
                boxShadow: m.role === "user" ? "var(--neu-shadow-out-sm)" : "var(--neu-shadow-out-sm)",
              }}
            >
              {(() => {
                const text = getMessageText(m);
                const displayText = m.role === "assistant" ? stripBibliographyBlock(text) : text;
                const bib = m.role === "assistant" ? parseBibliographyFromMessage(text) : null;
                return (
                  <>
                    <p className="whitespace-pre-wrap text-base">{displayText}</p>
                    {bib && <BibliographyCard data={bib} className="mt-3" />}
                  </>
                );
              })()}
            </div>
            {m.role === "assistant" && m.id === lastAssistant?.id && modelUsed && (
              <p className="mt-1 text-xs text-[var(--ink-muted)]" aria-hidden>
                Respondiendo con {modelUsed}
              </p>
            )}
          </div>
        ))}
        {error && (
          <p className="text-[var(--error)] text-sm" role="alert">
            {error.message}
          </p>
        )}
        <div ref={bottomRef} />
      </div>
      {mode === "roleplay" && roleplayContext && (
        <div className="px-4 pb-2 flex justify-end">
          <button
            type="button"
            onClick={() => {
              onExitRoleplayClick?.();
              sendMessage({ text: "FINALIZAR_ROLEPLAY" });
            }}
            disabled={loading}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-[var(--line)] bg-white text-sm text-[var(--ink)] hover:bg-[var(--cream)] focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--primary)] disabled:opacity-50"
          >
            Salir del escenario
          </button>
        </div>
      )}
      <ChatInput
        onSend={(opts) => {
          sendMessage(opts);
          setUploadedDocuments([]);
        }}
        loading={loading}
        uploadedDocuments={uploadedDocuments}
        onAddUploadedDocument={(text) => setUploadedDocuments((prev) => [...prev, text])}
      />
    </div>
  );
}

function canUseMediaRecorder(): boolean {
  if (typeof window === "undefined") return false;
  const hasGetUserMedia = typeof window.navigator?.mediaDevices?.getUserMedia === "function";
  return hasGetUserMedia && typeof window.MediaRecorder !== "undefined";
}

function ChatInput({
  onSend,
  loading,
  uploadedDocuments = [],
  onAddUploadedDocument,
}: {
  onSend: (opts: { text: string }) => void | Promise<void>;
  loading: boolean;
  uploadedDocuments?: string[];
  onAddUploadedDocument?: (text: string) => void;
}) {
  const [input, setInput] = useState("");
  const [recording, setRecording] = useState(false);
  const [transcribing, setTranscribing] = useState(false);
  const [uploadingFile, setUploadingFile] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const chunksRef = useRef<Blob[]>([]);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const supportsVoice = canUseMediaRecorder();

  const handleFileSelect = useCallback(
    async (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file || !onAddUploadedDocument) return;
      e.target.value = "";
      setUploadingFile(true);
      try {
        const formData = new FormData();
        formData.append("file", file);
        const res = await fetch("/api/documents/extract", { method: "POST", credentials: "include", body: formData });
        const data = await res.json();
        if (res.ok && data.text) onAddUploadedDocument(data.text);
      } finally {
        setUploadingFile(false);
      }
    },
    [onAddUploadedDocument]
  );

  const stopStream = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    }
  }, []);

  const toggleVoice = useCallback(async () => {
    if (!supportsVoice || loading) return;
    if (recording) {
      const mr = mediaRecorderRef.current;
      if (!mr || mr.state === "inactive") {
        setRecording(false);
        return;
      }
      mr.stop();
      setRecording(false);
      mediaRecorderRef.current = null;
      stopStream();
      const chunks = chunksRef.current;
      if (chunks.length === 0) return;
      const blob = new Blob(chunks, { type: "audio/webm" });
      if (blob.size < 1000) return;
      setTranscribing(true);
      try {
        const formData = new FormData();
        formData.append("audio", blob, "voice.webm");
        const res = await fetch("/api/voice/stt", { method: "POST", credentials: "include", body: formData });
        const data = await res.json();
        if (res.ok && data.text) {
          setInput((prev) => (prev.trim() ? `${prev.trim()} ${data.text}` : data.text));
        }
      } finally {
        setTranscribing(false);
      }
      return;
    }
    chunksRef.current = [];
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;
      const mr = new MediaRecorder(stream);
      mediaRecorderRef.current = mr;
      mr.ondataavailable = (e) => { if (e.data.size > 0) chunksRef.current.push(e.data); };
      mr.onstop = stopStream;
      mr.start(1000);
      setRecording(true);
    } catch {
      stopStream();
    }
  }, [supportsVoice, loading, recording, stopStream]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const text = input.trim();
    if (!text || loading) return;
    setInput("");
    onSend({ text });
  };

  return (
    <div className="p-4 bg-[var(--neu-bg)]" style={{ boxShadow: "var(--neu-shadow-in-sm)" }}>
      {uploadedDocuments.length > 0 && (
        <p className="text-xs text-[var(--acento-dark)] flex items-center gap-1 mb-2">
          <Paperclip className="w-3.5 h-3.5" />
          {uploadedDocuments.length} documento(s) listo(s) para resumir o preguntar (estilo NotebookLM).
        </p>
      )}
      <form onSubmit={handleSubmit} className="flex gap-2 items-center">
        <input type="file" ref={fileInputRef} onChange={handleFileSelect} accept=".pdf,.pptx,.txt,audio/*,.webm,.mp3,.m4a,.wav" className="hidden" aria-hidden />
        {onAddUploadedDocument && (
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={loading || uploadingFile}
            title="Subir documento o audio para resumir o preguntar"
            aria-label="Subir documento o audio"
            className="flex items-center justify-center w-12 h-12 rounded-full bg-[var(--neu-bg)] text-[var(--azul)] hover:opacity-90 shrink-0 disabled:opacity-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--acento)] transition-all"
            style={{ boxShadow: "var(--neu-shadow-out-sm)" }}
          >
            {uploadingFile ? <Loader2 className="w-5 h-5 animate-spin" /> : <Paperclip className="w-5 h-5" />}
          </button>
        )}
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="¿Cómo te ayudo?"
          className="flex-1 px-4 py-3 rounded-xl bg-[var(--neu-bg)] text-[var(--azul)] text-base min-h-[48px] focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--acento)] disabled:opacity-70"
          style={{ boxShadow: "var(--neu-shadow-in)" }}
          disabled={loading}
          aria-label="Mensaje"
        />
        {supportsVoice && (
          <button
            type="button"
            onClick={toggleVoice}
            disabled={loading}
            className={`flex items-center justify-center w-12 h-12 rounded-full shrink-0 focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--acento)] disabled:opacity-50 transition-all ${
              recording ? "bg-[var(--acento)] text-[var(--azul-dark)] animate-pulse" : "bg-[var(--neu-bg)] text-[var(--azul)]"
            }`}
            style={{ boxShadow: recording ? "var(--neu-shadow-in)" : "var(--neu-shadow-out-sm)" }}
            aria-label={recording ? "Detener grabación" : "Grabar voz"}
            title={recording ? "Clic para transcribir" : "Grabar mensaje por voz"}
          >
            {transcribing ? <Loader2 className="w-5 h-5 animate-spin" /> : <Mic className="w-5 h-5" />}
          </button>
        )}
        <button
          type="submit"
          disabled={loading || !input.trim()}
          className="px-4 py-3 rounded-xl font-semibold text-[var(--azul)] bg-[var(--neu-bg)] disabled:opacity-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--acento)] transition-all min-h-[48px]"
          style={{ boxShadow: "var(--neu-shadow-out-sm)" }}
        >
          {loading ? "…" : "Enviar"}
        </button>
      </form>
    </div>
  );
}
