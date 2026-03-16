"use client";

import { useRef } from "react";

interface AvatarUploadProps {
  photoURL: string | null;
  fullName: string | null;
  email?: string | null;
  onUpload: (file: File) => Promise<void>;
  uploading?: boolean;
}

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
    <button
      type="button"
      onClick={handleClick}
      disabled={uploading}
      aria-label="Subir foto de perfil"
      style={{
        position: "relative",
        width: 80,
        height: 80,
        borderRadius: "50%",
        overflow: "hidden",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        border: "none",
        cursor: uploading ? "wait" : "pointer",
        background: photoURL ? "transparent" : "linear-gradient(135deg, #1428d4, #0a0f8a)",
        color: "#ffffff",
        fontSize: 24,
        fontWeight: 800,
        fontFamily: "'Syne', sans-serif",
        boxShadow: "6px 6px 14px #c2c8d6, -6px -6px 14px #ffffff",
      }}
    >
      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        style={{ position: "absolute", width: 1, height: 1, opacity: 0, overflow: "hidden", clip: "rect(0,0,0,0)" }}
        onChange={handleChange}
      />
      {photoURL ? (
        <img
          src={photoURL}
          alt="Avatar del usuario"
          style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover" }}
        />
      ) : initials ? (
        <span>{initials}</span>
      ) : (
        <span style={{ fontSize: 28 }}>?</span>
      )}
      {uploading && (
        <span
          style={{
            position: "absolute",
            inset: 0,
            background: "rgba(0,0,0,0.5)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "#fff",
            fontSize: 14,
          }}
        >
          …
        </span>
      )}
    </button>
  );
}
