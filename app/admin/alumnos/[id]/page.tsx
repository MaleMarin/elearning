"use client";

import { useParams } from "next/navigation";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { EmptyState } from "@/components/ui";

/**
 * Perfil del alumno (admin). Datos personales, progreso por módulo,
 * historial de lecciones, quizzes, badges, diario (cifrado), audit logs.
 * Acciones: Enviar recordatorio, Emitir certificado, Enviar mensaje.
 */
export default function AdminAlumnoPerfilPage() {
  const params = useParams();
  const id = String(params?.id ?? "");

  if (!id) {
    return (
      <EmptyState
        title="Alumno no especificado"
        description="Selecciona un alumno desde la lista."
        ctaLabel="Ver alumnos"
        ctaHref="/admin/alumnos"
      />
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6" style={{ fontFamily: "var(--font)" }}>
      <Link
        href="/admin/alumnos"
        className="inline-flex items-center gap-2 text-sm font-medium text-[var(--texto-sub)] hover:text-[var(--azul)]"
      >
        <ChevronLeft className="w-4 h-4" aria-hidden />
        Volver a alumnos
      </Link>
      <h1 className="text-2xl font-semibold text-[var(--ink)]">Perfil del alumno</h1>
      <p className="text-sm text-[var(--texto-sub)]">
        ID: {id}. Integra aquí: datos personales, progreso por módulo, historial de lecciones, resultados de quizzes,
        badges, diario (cifrado), audit logs. Acciones: Enviar recordatorio, Emitir certificado, Enviar mensaje.
      </p>
    </div>
  );
}
