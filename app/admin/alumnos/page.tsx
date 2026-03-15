"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { PrimaryButton } from "@/components/ui";
import { UserPlus } from "lucide-react";

/**
 * Lista de alumnos. Filtros por cohorte / progreso / certificado.
 * Acciones: Ver perfil, Enviar mensaje, Emitir certificado.
 * Botón Importar alumnos → /admin/alumnos/importar
 */
export default function AdminAlumnosPage() {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(false);
  }, []);

  return (
    <div className="max-w-6xl mx-auto space-y-6" style={{ fontFamily: "var(--font)" }}>
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-[var(--ink)]">Alumnos</h1>
          <p className="text-sm text-[var(--texto-sub)] mt-1">
            Filtra por grupo, progreso o estado de certificado. Ver perfil, enviar mensaje o emitir certificado.
          </p>
        </div>
        <PrimaryButton href="/admin/alumnos/importar" className="inline-flex items-center gap-2">
          <UserPlus className="w-4 h-4" aria-hidden />
          Importar alumnos
        </PrimaryButton>
      </div>

      <section
        className="rounded-[16px] p-4 sm:p-6"
        style={{
          background: "var(--neu-bg)",
          boxShadow: "var(--neu-shadow-out-sm)",
        }}
      >
        {loading ? (
          <p className="text-sm text-[var(--texto-sub)]">Cargando…</p>
        ) : (
          <>
            <p className="text-sm text-[var(--texto-sub)] mb-4">
              Filtros: por grupo / por progreso (&gt;80%, &gt;50%, &lt;30%) / por estado certificado.
            </p>
            <p className="text-sm text-[var(--texto-sub)]">
              Columnas: Foto | Nombre | Institución | Grupo | Progreso | Último acceso | Estado cert | Acciones.
            </p>
            <p className="text-sm text-[var(--texto-sub)] mt-2">
              Integra aquí la tabla de alumnos con los endpoints de tu API (grupos, progreso, certificados).
            </p>
          </>
        )}
      </section>
    </div>
  );
}
