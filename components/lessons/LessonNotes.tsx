"use client";

import { useState, useEffect } from "react";

interface Note {
  id: string;
  text: string;
  blockIndex: number;
  timestamp: Date;
}

export default function LessonNotes({ lessonId }: { lessonId: string }) {
  const [notes, setNotes] = useState<Note[]>([]);
  const [newNote, setNewNote] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetch(`/api/notas/leccion?lessonId=${encodeURIComponent(lessonId)}`, {
      credentials: "include",
    })
      .then((r) => r.json())
      .then((d: { notes?: Note[] }) => {
        const list = d.notes ?? [];
        setNotes(
          list.map((n) => ({
            ...n,
            timestamp: n.timestamp instanceof Date ? n.timestamp : new Date(n.timestamp),
          }))
        );
      })
      .catch(() => setNotes([]));
  }, [lessonId]);

  const handleSave = async () => {
    if (!newNote.trim()) return;
    setSaving(true);
    try {
      const res = await fetch("/api/notas/leccion", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ lessonId, text: newNote }),
      });
      const data = await res.json();
      const note = data.note as Note;
      if (note)
        setNotes((n) => [
          ...n,
          {
            id: note.id,
            text: note.text,
            blockIndex: note.blockIndex ?? 0,
            timestamp: note.timestamp instanceof Date ? note.timestamp : new Date(note.timestamp),
          },
        ]);
      setNewNote("");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div
      style={{
        background: "#e8eaf0",
        borderRadius: 16,
        padding: 18,
        marginTop: 20,
        boxShadow: "5px 5px 12px #c2c8d6, -5px -5px 12px #ffffff",
        fontFamily: "var(--font-heading)",
      }}
    >
      <p
        style={{
          fontSize: 10,
          fontWeight: 700,
          color: "#8892b0",
          textTransform: "uppercase",
          letterSpacing: "1.5px",
          marginBottom: 14,
          fontFamily: "'Space Mono', monospace",
        }}
      >
        📝 Mis notas de esta lección
      </p>

      {notes.map((note, i) => (
        <div
          key={note.id || i}
          style={{
            background: "#e8eaf0",
            borderRadius: 10,
            padding: "10px 14px",
            marginBottom: 8,
            boxShadow: "inset 2px 2px 5px #c2c8d6, inset -2px -2px 5px #ffffff",
          }}
        >
          <p style={{ fontSize: 12, color: "#4a5580", lineHeight: 1.5 }}>{note.text}</p>
          <p
            style={{
              fontSize: 9,
              color: "#8892b0",
              marginTop: 4,
              fontFamily: "'Space Mono', monospace",
            }}
          >
            {new Date(note.timestamp).toLocaleDateString("es-MX")}
          </p>
        </div>
      ))}

      <textarea
        value={newNote}
        onChange={(e) => setNewNote(e.target.value)}
        placeholder="Agrega una nota sobre esta lección..."
        rows={3}
        style={{
          width: "100%",
          border: "none",
          background: "#e8eaf0",
          borderRadius: 10,
          padding: "10px 14px",
          fontFamily: "var(--font-heading)",
          fontSize: 12,
          color: "#4a5580",
          resize: "none",
          outline: "none",
          boxShadow: "inset 3px 3px 7px #c2c8d6, inset -3px -3px 7px #ffffff",
          lineHeight: 1.5,
          marginBottom: 10,
        }}
      />
      <button
        type="button"
        onClick={handleSave}
        disabled={saving || !newNote.trim()}
        style={{
          width: "100%",
          padding: "9px",
          borderRadius: 10,
          border: "none",
          cursor: saving ? "not-allowed" : "pointer",
          fontFamily: "var(--font-heading)",
          fontSize: 12,
          fontWeight: 700,
          background: newNote.trim()
            ? "linear-gradient(135deg, #1428d4, #0a0f8a)"
            : "#e8eaf0",
          color: newNote.trim() ? "white" : "#8892b0",
          boxShadow: newNote.trim()
            ? "4px 4px 10px rgba(10,15,138,0.3)"
            : "inset 2px 2px 5px #c2c8d6, inset -2px -2px 5px #ffffff",
        }}
      >
        {saving ? "Guardando…" : "Guardar nota"}
      </button>
    </div>
  );
}
