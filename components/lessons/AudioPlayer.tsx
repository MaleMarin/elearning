"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { Headphones, Pause, Play, Loader2 } from "lucide-react";

const STORAGE_KEY_PREFIX = "politica-digital-tts-";
const SPEEDS = [0.75, 1, 1.25, 1.5] as const;

interface AudioPlayerProps {
  /** Texto de la lección para TTS (puede ser markdown; se limpia en API). */
  text: string;
  /** Identificador para guardar posición (ej. lessonId). */
  storageId: string;
  /** Título opcional para aria-label. */
  title?: string;
  /** Si true, inicia la reproducción al montar (preferencia "escuchar"). */
  autoplay?: boolean;
}

export function AudioPlayer({ text, storageId, title, autoplay = false }: AudioPlayerProps) {
  const [loading, setLoading] = useState(false);
  const [playing, setPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const [speed, setSpeed] = useState<number>(1);
  const [error, setError] = useState<string | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const objectUrlRef = useRef<string | null>(null);

  const storageKey = `${STORAGE_KEY_PREFIX}${storageId}`;

  const cleanup = useCallback(() => {
    if (objectUrlRef.current) {
      URL.revokeObjectURL(objectUrlRef.current);
      objectUrlRef.current = null;
    }
    if (audioRef.current) {
      audioRef.current.src = "";
      audioRef.current = null;
    }
  }, []);

  const loadAndPlay = useCallback(async () => {
    if (!text.trim()) {
      setError("No hay texto para escuchar.");
      return;
    }
    setError(null);
    setLoading(true);
    try {
      const res = await fetch("/api/voice/tts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ text }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || "Error al generar audio");
      }
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      objectUrlRef.current = url;

      const audio = new Audio(url);
      audioRef.current = audio;
      audio.playbackRate = speed;

      const savedTime = typeof localStorage !== "undefined" ? parseFloat(localStorage.getItem(storageKey) ?? "0") : 0;
      if (savedTime > 0) {
        audio.currentTime = savedTime;
      }

      audio.addEventListener("loadedmetadata", () => setDuration(audio.duration));
      audio.addEventListener("timeupdate", () => {
        setProgress(audio.currentTime);
        if (typeof localStorage !== "undefined") {
          localStorage.setItem(storageKey, String(audio.currentTime));
        }
      });
      audio.addEventListener("ended", () => {
        setPlaying(false);
        setProgress(0);
        if (typeof localStorage !== "undefined") localStorage.removeItem(storageKey);
        cleanup();
      });
      audio.addEventListener("error", () => {
        setError("Error al reproducir el audio.");
        setPlaying(false);
        cleanup();
      });

      await audio.play();
      setPlaying(true);
      setDuration(audio.duration);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Error al cargar el audio");
    } finally {
      setLoading(false);
    }
  }, [text, storageId, speed, cleanup]);

  const togglePause = useCallback(() => {
    const audio = audioRef.current;
    if (!audio) return;
    if (playing) {
      audio.pause();
    } else {
      audio.play();
    }
    setPlaying(!playing);
  }, [playing]);

  const stop = useCallback(() => {
    const audio = audioRef.current;
    if (audio) {
      audio.pause();
      audio.currentTime = 0;
    }
    setPlaying(false);
    setProgress(0);
    cleanup();
  }, [cleanup]);

  useEffect(() => {
    const audio = audioRef.current;
    if (audio) audio.playbackRate = speed;
  }, [speed]);

  const autoplayTriggered = useRef(false);
  useEffect(() => {
    if (!autoplay || !text.trim() || autoplayTriggered.current) return;
    autoplayTriggered.current = true;
    const t = setTimeout(() => loadAndPlay(), 500);
    return () => clearTimeout(t);
  }, [autoplay, text, loadAndPlay]);

  useEffect(() => {
    return () => {
      if (audioRef.current && playing) {
        const t = audioRef.current.currentTime;
        if (typeof localStorage !== "undefined") localStorage.setItem(storageKey, String(t));
      }
      cleanup();
    };
  }, [storageKey, playing, cleanup]);

  const progressPct = duration > 0 ? (progress / duration) * 100 : 0;

  return (
    <div
      className="rounded-[16px] p-4 bg-[var(--neu-bg)] transition-shadow duration-200"
      style={{ boxShadow: "var(--neu-shadow-in)" }}
      aria-label={title ?? "Escuchar lección (aprendizaje por voz)"}
    >
      <div className="flex items-center gap-3 mb-3">
        {loading ? (
          <div
            className="w-12 h-12 rounded-full flex items-center justify-center bg-[var(--neu-bg)]"
            style={{ boxShadow: "var(--neu-shadow-in-sm)" }}
          >
            <Loader2 className="w-6 h-6 text-[var(--azul)] animate-spin" aria-hidden />
          </div>
        ) : playing ? (
          <button
            type="button"
            onClick={togglePause}
            className="w-12 h-12 rounded-full flex items-center justify-center bg-[var(--neu-bg)] text-[var(--azul)] hover:opacity-90 focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--acento)] focus-visible:ring-offset-2 transition-[box-shadow] duration-150"
            style={{ boxShadow: "var(--neu-shadow-in-sm)" }}
            aria-label="Pausar"
          >
            <Pause className="w-6 h-6" />
          </button>
        ) : (
          <button
            type="button"
            onClick={loadAndPlay}
            className="w-12 h-12 rounded-full flex items-center justify-center bg-[var(--neu-bg)] text-[var(--azul)] hover:-translate-y-0.5 focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--acento)] focus-visible:ring-offset-2 transition-[box-shadow,transform] duration-150"
            style={{ boxShadow: "var(--neu-shadow-out-sm)" }}
            onMouseEnter={(e) => {
              e.currentTarget.style.boxShadow = "var(--neu-glow)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.boxShadow = "var(--neu-shadow-out-sm)";
            }}
            aria-label="Escuchar lección (texto a voz)"
          >
            <Headphones className="w-6 h-6" />
          </button>
        )}
        <span className="text-sm font-medium text-[var(--azul)] font-[var(--font)]">
          {playing ? "Reproduciendo…" : "Escuchar lección"}
        </span>
        {playing && (
          <button
            type="button"
            onClick={stop}
            className="text-xs text-[var(--texto-sub)] hover:text-[var(--azul)] ml-auto transition-colors"
          >
            Detener
          </button>
        )}
      </div>

      {playing && (
        <>
          <div
            className="h-[6px] rounded-[4px] overflow-hidden bg-[var(--neu-bg)]"
            style={{ boxShadow: "var(--neu-shadow-in-sm)" }}
            role="progressbar"
            aria-valuenow={Math.round(progressPct)}
            aria-valuemin={0}
            aria-valuemax={100}
          >
            <div
              className="h-full rounded-[4px] transition-all duration-150"
              style={{
                width: `${progressPct}%`,
                background: "linear-gradient(90deg, var(--azul), var(--azul-bright))",
                boxShadow: "0 0 8px rgba(20, 40, 212, 0.4)",
              }}
            />
          </div>
          <div className="flex flex-wrap gap-2 mt-3">
            {SPEEDS.map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => setSpeed(s)}
                className={`px-3 py-1.5 rounded-[12px] text-sm font-medium font-[var(--font)] transition-all duration-150 ${
                  speed === s
                    ? "bg-[var(--neu-bg)] text-[var(--azul)]"
                    : "bg-[var(--neu-bg)] text-[var(--texto-sub)] hover:-translate-y-0.5"
                }`}
                style={{
                  boxShadow: speed === s ? "var(--neu-shadow-in-sm)" : "var(--neu-shadow-out-sm)",
                }}
              >
                {s}x
              </button>
            ))}
          </div>
        </>
      )}

      {error && (
        <p className="text-sm text-[var(--error)] mt-2" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}
