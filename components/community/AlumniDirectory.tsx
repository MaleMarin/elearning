"use client";

import { Building2, Briefcase, MapPin, ExternalLink } from "lucide-react";

export interface AlumniEntry {
  userId: string;
  fullName: string;
  institution: string | null;
  position: string | null;
  region: string | null;
  cohortName: string | null;
  linkedIn: string | null;
}

interface AlumniDirectoryProps {
  alumni: AlumniEntry[];
  suggested?: AlumniEntry[];
  filters: { institution: string; region: string; cohortId: string };
  onFilterChange: (key: "institution" | "region" | "cohortId", value: string) => void;
  cohortOptions?: { id: string; name: string }[];
}

export function AlumniDirectory({
  alumni,
  suggested = [],
  filters,
  onFilterChange,
  cohortOptions = [],
}: AlumniDirectoryProps) {
  return (
    <div className="space-y-6">
      {suggested.length > 0 && (
        <section>
          <h2 className="text-lg font-semibold text-[var(--ink)] mb-3">Sugeridos para ti</h2>
          <ul className="space-y-3 list-none">
            {suggested.map((a) => (
              <li key={a.userId} className="rounded-xl border border-[var(--line)] bg-amber-50/30 p-4">
                <p className="font-medium text-[var(--ink)]">{a.fullName}</p>
                {a.institution && <p className="text-sm text-[var(--ink-muted)] flex items-center gap-1"><Building2 className="w-3.5 h-3.5" /> {a.institution}</p>}
                {a.position && <p className="text-sm text-[var(--ink-muted)] flex items-center gap-1"><Briefcase className="w-3.5 h-3.5" /> {a.position}</p>}
                {a.linkedIn && (
                  <a href={a.linkedIn} target="_blank" rel="noopener noreferrer" className="text-sm text-[var(--primary)] inline-flex items-center gap-1 mt-1">
                    LinkedIn <ExternalLink className="w-3 h-3" />
                  </a>
                )}
              </li>
            ))}
          </ul>
        </section>
      )}
      <section>
        <h2 className="text-lg font-semibold text-[var(--ink)] mb-3">Filtros</h2>
        <div className="flex flex-wrap gap-2">
          <input
            type="text"
            placeholder="Institución"
            value={filters.institution}
            onChange={(e) => onFilterChange("institution", e.target.value)}
            className="px-3 py-2 rounded-lg border border-[var(--line)] text-sm w-40"
          />
          <input
            type="text"
            placeholder="Región"
            value={filters.region}
            onChange={(e) => onFilterChange("region", e.target.value)}
            className="px-3 py-2 rounded-lg border border-[var(--line)] text-sm w-32"
          />
          <select
            value={filters.cohortId}
            onChange={(e) => onFilterChange("cohortId", e.target.value)}
            className="px-3 py-2 rounded-lg border border-[var(--line)] text-sm"
          >
            <option value="">Todos los grupos</option>
            {cohortOptions.map((c) => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
        </div>
      </section>
      <section>
        <h2 className="text-lg font-semibold text-[var(--ink)] mb-3">Directorio</h2>
        {alumni.length === 0 ? (
          <p className="text-[var(--ink-muted)]">No hay egresados con esos filtros.</p>
        ) : (
          <ul className="space-y-3 list-none">
            {alumni.map((a) => (
              <li key={a.userId} className="rounded-xl border border-[var(--line)] bg-white p-4">
                <p className="font-medium text-[var(--ink)]">{a.fullName}</p>
                {a.institution && <p className="text-sm text-[var(--ink-muted)] flex items-center gap-1"><Building2 className="w-3.5 h-3.5" /> {a.institution}</p>}
                {a.position && <p className="text-sm text-[var(--ink-muted)] flex items-center gap-1"><Briefcase className="w-3.5 h-3.5" /> {a.position}</p>}
                {a.region && <p className="text-sm text-[var(--ink-muted)] flex items-center gap-1"><MapPin className="w-3.5 h-3.5" /> {a.region}</p>}
                {a.cohortName && <p className="text-xs text-[var(--ink-muted)] mt-1">Grupo {a.cohortName}</p>}
                {a.linkedIn && (
                  <a href={a.linkedIn} target="_blank" rel="noopener noreferrer" className="text-sm text-[var(--primary)] inline-flex items-center gap-1 mt-1">
                    LinkedIn <ExternalLink className="w-3 h-3" />
                  </a>
                )}
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
