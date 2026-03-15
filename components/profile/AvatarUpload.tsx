"use client";

import { useRef } from "react";
import { User } from "lucide-react";

interface AvatarUploadProps {
  photoURL: string | null;
  fullName: string | null;
  /** Si no hay nombre, se usan las iniciales del email (nunca se muestra "?"). */
  email?: string | null;
  onUpload: (file: File) => Promise<void>;
  uploading?: boolean;
}

/** Iniciales para el avatar: nombre completo, o primera letra del email, o icono. Nunca "?". */
function getInitials(fullName: string | null, email?: string | null): string | null {
  if (fullName?.trim()) {
    const parts = fullName.trim().split(/\s+/);
    if (parts.length >= 2) {
      return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
    }
    return (parts[0][0] ?? "").toUpperCase() || null;
  }
  if (email?.trim()) {
    const local = email.split("@")[0]?.trim();
    if (local) return local.slice(0, 2).toUpperCase();
  }
  return null;
}

export function AvatarUpload({
  photoURL,
  fullName,
  email,
  onUpload,
  uploading = false,
}: AvatarUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const initials = getInitials(fullName, email);

  const handleClick = () => {
    if (uploading) return;
    inputRef.current?.click();
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.type.startsWith("image/")) {
      onUpload(file);
    }
    e.target.value = "";
  };

  return (
    <div className="flex flex-col items-center gap-2">
      <button
        type="button"
        onClick={handleClick}
        disabled={uploading}
        className="relative w-24 h-24 rounded-full overflow-hidden flex items-center justify-center bg-[var(--primary-soft)] text-[var(--primary)] font-semibold text-2xl border-2 border-[var(--line)] hover:border-[var(--primary)] transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--primary)] focus-visible:ring-offset-2 disabled:opacity-60 shrink-0"
        aria-label="Subir foto de perfil"
      >
        <input
          ref={inputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          className="sr-only"
          onChange={handleChange}
        />
        {photoURL ? (
          <img
            src={photoURL}
            alt="Avatar del usuario"
            className="absolute inset-0 w-full h-full object-cover"
          />
        ) : initials ? (
          <span>{initials}</span>
        ) : (
          <User className="w-10 h-10 text-[var(--primary)]" aria-hidden />
        )}
        {uploading && (
          <span className="absolute inset-0 bg-[var(--overlay)] flex items-center justify-center text-white text-sm">
            …
          </span>
        )}
      </button>
      <span className="text-xs text-[var(--text-muted)]">
        {photoURL ? "Cambiar foto" : "Subir foto"}
      </span>
    </div>
  );
}
