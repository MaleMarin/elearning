"use client";

import { useState, useRef, useCallback } from "react";
import { Mic, Loader2 } from "lucide-react";

const MAX_RECORD_SEC = 60;

interface VoiceInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  rows?: number;
  minLength?: number;
  disabled?: boolean;
  /** Si el navegador no soporta MediaRecorder, no se muestra el botón de voz. */
  className?: string;
  id?: string;
  "aria-label"?: string;
}

function canUseMediaRecorder(): boolean {
  if (typeof window === "undefined") return false;
  const hasGetUserMedia = typeof window.navigator?.mediaDevices?.getUserMedia === "function";
  return hasGetUserMedia && typeof window.MediaRecorder !== "undefined";
}

export function VoiceInput({
  value,
  onChange,
  placeholder = "Escribe o graba tu respuesta…",
  rows = 4,
  disabled = false,
  className = "",
  id,
  "aria-label": ariaLabel,
}: VoiceInputProps) {
  const [recording, setRecording] = useState(false);
  const [transcribing, setTranscribing] = useState(false);
  const [recordError, setRecordError] = useState<string | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const supportsVoice = canUseMediaRecorder();

  const stopStream = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    }
  }, []);

  const startRecording = useCallback(async () => {
    if (!supportsVoice || disabled) return;
    setRecordError(null);
    chunksRef.current = [];
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;
      const mime = MediaRecorder.isTypeSupported("audio/webm;codecs=opus")
        ? "audio/webm;codecs=opus"
        : "audio/webm";
      const mr = new MediaRecorder(stream);
      mediaRecorderRef.current = mr;
      mr.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data);
      };
      mr.onstop = () => {
        stopStream();
      };
      mr.start(1000);
      setRecording(true);
    } catch (e) {
      setRecordError("No se pudo acceder al micrófono.");
      stopStream();
    }
  }, [supportsVoice, disabled, stopStream]);

  const stopRecording = useCallback(async () => {
    const mr = mediaRecorderRef.current;
    if (!mr || mr.state === "inactive") {
      setRecording(false);
      return;
    }
    mr.stop();
    setRecording(false);
    mediaRecorderRef.current = null;

    const chunks = chunksRef.current;
    if (chunks.length === 0) {
      setRecordError("No se grabó audio.");
      return;
    }

    const blob = new Blob(chunks, { type: "audio/webm" });
    if (blob.size < 1000) {
      setRecordError("Grabación demasiado corta.");
      return;
    }

    setTranscribing(true);
    setRecordError(null);
    try {
      const formData = new FormData();
      formData.append("audio", blob, "voice.webm");

      const res = await fetch("/api/voice/stt", {
        method: "POST",
        credentials: "include",
        body: formData,
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Error al transcribir");

      const text = (data.text as string) ?? "";
      if (text.trim()) {
        const newValue = value.trim() ? `${value.trim()}\n\n${text.trim()}` : text.trim();
        onChange(newValue);
      }
    } catch (e) {
      setRecordError(e instanceof Error ? e.message : "Error al transcribir");
    } finally {
      setTranscribing(false);
    }
  }, [value, onChange]);

  return (
    <div className={`relative ${className}`}>
      <textarea
        id={id}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        rows={rows}
        disabled={disabled}
        aria-label={ariaLabel ?? "Escribe o graba tu respuesta por voz"}
        className="w-full px-4 py-3 rounded-[12px] bg-[var(--neu-bg)] text-[var(--azul)] font-[var(--font)] resize-y pr-12 outline-none transition-[box-shadow] duration-200 focus:shadow-[var(--shadow-input-focus)]"
        style={{ boxShadow: "var(--neu-shadow-in)" }}
      />
      {supportsVoice && (
        <div className="absolute right-2 top-2 flex flex-col gap-1">
          {transcribing ? (
            <div
              className="w-10 h-10 rounded-full flex items-center justify-center bg-[var(--neu-bg)]"
              style={{ boxShadow: "var(--neu-shadow-in-sm)" }}
              aria-hidden
            >
              <Loader2 className="w-5 h-5 text-[var(--azul)] animate-spin" />
            </div>
          ) : (
            <button
              type="button"
              onClick={recording ? stopRecording : startRecording}
              disabled={disabled}
              className={`w-10 h-10 rounded-full flex items-center justify-center transition-all duration-150 focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--acento)] focus-visible:ring-offset-2 disabled:opacity-50 ${
                recording
                  ? "bg-[var(--acento)] text-[var(--azul-dark)] animate-pulse"
                  : "bg-[var(--neu-bg)] text-[var(--texto-sub)] hover:text-[var(--acento)] hover:-translate-y-0.5"
              }`}
              style={{
                boxShadow: recording ? "var(--neu-glow-acento)" : "var(--neu-shadow-out-sm)",
              }}
              aria-label={recording ? "Detener grabación" : "Grabar voz (respuesta por voz, máx. 60 s)"}
              title={recording ? "Suelta para transcribir" : "Graba tu respuesta (máx. 60 s)"}
            >
              <Mic className="w-5 h-5" />
            </button>
          )}
        </div>
      )}
      {recordError && (
        <p className="text-xs text-[var(--error)] mt-1" role="alert">
          {recordError}
        </p>
      )}
      {recording && (
        <p className="text-xs text-[var(--texto-sub)] mt-1">
          Grabando… (máx. {MAX_RECORD_SEC} s). Haz clic de nuevo en el micrófono para enviar.
        </p>
      )}
    </div>
  );
}
