"use client";

import Link from "next/link";
import { GlossaryView } from "@/components/lab/GlossaryView";

export default function GlosarioPage() {
  return (
    <div className="max-w-3xl mx-auto py-8 px-4">
      <Link href="/laboratorio/hablas-humano" className="text-[var(--primary)] hover:underline text-sm mb-6 inline-block">
        ← ¿Hablas humano?
      </Link>
      <h1 className="text-2xl font-bold text-[var(--ink)]">Mi glosario personal</h1>
      <p className="text-[var(--ink-muted)] mt-1 mb-6">Términos que vas aprendiendo en los 5 modos.</p>
      <GlossaryView />
    </div>
  );
}
