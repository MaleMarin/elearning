"use client";

import Image from "next/image";
import { Building2, Briefcase } from "lucide-react";

interface Mentor {
  userId: string;
  fullName: string;
  institution: string | null;
  position: string | null;
  photoURL: string | null;
  cohortName: string | null;
}

interface MentorCardProps {
  mentor: Mentor;
  onRequest?: (mentorId: string) => void;
  requested?: boolean;
  disabled?: boolean;
}

export function MentorCard({ mentor, onRequest, requested, disabled }: MentorCardProps) {
  return (
    <article className="rounded-xl border border-[var(--line)] bg-white p-4 flex gap-4">
      <div className="shrink-0 w-14 h-14 rounded-full overflow-hidden bg-[var(--cream)]">
        {mentor.photoURL ? (
          <Image src={mentor.photoURL} alt={`Foto de perfil de ${mentor.fullName}`} width={56} height={56} className="object-cover w-full h-full" />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-[var(--ink-muted)] text-lg font-medium">
            {mentor.fullName.charAt(0)}
          </div>
        )}
      </div>
      <div className="min-w-0 flex-1">
        <h3 className="font-semibold text-[var(--ink)]">{mentor.fullName}</h3>
        {mentor.institution && (
          <p className="text-sm text-[var(--ink-muted)] flex items-center gap-1 mt-0.5">
            <Building2 className="w-3.5 h-3.5 shrink-0" />
            {mentor.institution}
          </p>
        )}
        {mentor.position && (
          <p className="text-sm text-[var(--ink-muted)] flex items-center gap-1 mt-0.5">
            <Briefcase className="w-3.5 h-3.5 shrink-0" />
            {mentor.position}
          </p>
        )}
        {mentor.cohortName && (
          <p className="text-xs text-[var(--ink-muted)] mt-1">Cohorte: {mentor.cohortName}</p>
        )}
        {onRequest && (
          <button
            type="button"
            onClick={() => onRequest(mentor.userId)}
            disabled={disabled || requested}
            className="mt-3 btn-primary text-sm"
          >
            {requested ? "Solicitud enviada" : "Solicitar sesión de 30 min"}
          </button>
        )}
      </div>
    </article>
  );
}
