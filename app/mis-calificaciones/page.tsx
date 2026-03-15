"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { PageSection, EmptyState } from "@/components/ui";
import { StudentGradeView } from "@/components/grades/StudentGradeView";
import type { GradeRow } from "@/components/grades/GradeBook";
import { getDemoMode } from "@/lib/env";

export default function MisCalificacionesPage() {
  const [items, setItems] = useState<GradeRow[]>([]);
  const [finalGrade, setFinalGrade] = useState<number | null>(null);
  const [progressPercent, setProgressPercent] = useState(0);
  const [courseId, setCourseId] = useState<string | null>(null);
  const [courseTitle, setCourseTitle] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const printRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (getDemoMode()) {
      setItems([
        { type: "lesson", id: "l1", title: "Introducción", moduleId: "m1", status: "completed", score: 100, maxScore: 100 },
        { type: "quiz", id: "q1", title: "Quiz Módulo 1", moduleId: "m1", status: "completed", score: 80, maxScore: 100 },
      ]);
      setFinalGrade(90);
      setProgressPercent(50);
      setCourseId("c1");
      setLoading(false);
      return;
    }
    fetch("/api/curso", { credentials: "include" })
      .then((r) => r.json())
      .then((d) => {
        const cid = d?.course?.id;
        setCourseId(cid ?? null);
        setCourseTitle(d?.course?.title ?? null);
        if (cid) {
          return fetch(`/api/grades?courseId=${encodeURIComponent(cid)}`, { credentials: "include" }).then((r) => r.json());
        }
        return null;
      })
      .then((data) => {
        if (data?.items) setItems(data.items);
        if (data?.finalGrade != null) setFinalGrade(data.finalGrade);
        if (data?.progressPercent != null) setProgressPercent(data.progressPercent);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const handlePrintPdf = () => {
    if (typeof window === "undefined") return;
    window.print();
  };

  if (loading) {
    return (
      <div className="max-w-2xl mx-auto py-12">
        <p className="text-[var(--text-muted)]">Cargando…</p>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto py-8 px-4">
      <Link href="/inicio" className="text-[var(--primary)] hover:underline text-sm mb-4 inline-block">← Inicio</Link>
      <PageSection title="Mis calificaciones" subtitle="Progreso y notas por módulo.">
        <></>
      </PageSection>
      {!courseId ? (
        <EmptyState title="Sin curso asignado" description="Cuando tengas un curso asignado verás aquí tu progreso y calificaciones." ctaLabel="Volver al inicio" ctaHref="/inicio" />
      ) : (
        <div ref={printRef}>
          <StudentGradeView
            items={items}
            finalGrade={finalGrade}
            progressPercent={progressPercent}
            courseTitle={courseTitle}
            onPrintOrPdf={handlePrintPdf}
          />
        </div>
      )}
    </div>
  );
}
