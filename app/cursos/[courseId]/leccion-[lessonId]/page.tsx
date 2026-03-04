"use client";

import { useParams } from "next/navigation";
import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { useAssistant } from "@/contexts/AssistantContext";
import { TutorWidget } from "@/components/assistant/TutorWidget";
import { EmptyState } from "@/components/ui/EmptyState";
import Link from "next/link";

interface Lesson {
  id: string;
  title: string;
  summary: string;
  content: string;
  module_id: string;
}

interface Module {
  id: string;
  title: string;
}

export default function LeccionPage() {
  const params = useParams();
  const courseId = String(params?.courseId ?? "");
  const lessonId = String(params?.lessonId ?? "");
  const { openDrawer } = useAssistant();
  const [lesson, setLesson] = useState<Lesson | null>(null);
  const [moduleTitle, setModuleTitle] = useState<string>("");
  const [courseTitle, setCourseTitle] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(lessonId);

  useEffect(() => {
    if (!courseId || !lessonId || !isUuid) {
      setLoading(false);
      return;
    }
    const supabase = createClient();
    void (async () => {
      try {
        const { data: l, error: e } = await supabase
          .from("lessons")
          .select("id, title, summary, content, module_id")
          .eq("id", lessonId)
          .eq("status", "published")
          .single();
        if (e || !l) {
          setError(true);
          return;
        }
        setLesson(l as Lesson);
        const [{ data: m }, { data: c }] = await Promise.all([
          supabase.from("modules").select("id, title").eq("id", (l as Lesson).module_id).single(),
          supabase.from("courses").select("title").eq("id", courseId).single(),
        ]);
        setModuleTitle(m?.title ?? "");
        setCourseTitle(c?.title ?? "");
      } catch {
        setError(true);
      } finally {
        setLoading(false);
      }
    })();
  }, [courseId, lessonId, isUuid]);

  if (loading) {
    return (
      <div className="max-w-3xl">
        <div className="h-8 bg-gray-100 rounded w-2/3 mb-4 animate-pulse" />
        <div className="card-white p-6 animate-pulse">
          <div className="h-4 bg-gray-100 rounded w-full mb-2" />
          <div className="h-4 bg-gray-100 rounded w-4/5" />
        </div>
      </div>
    );
  }

  if (error || !lesson) {
    return (
      <div className="max-w-3xl">
        <EmptyState
          title="Lección no encontrada"
          description="No tienes acceso a esta lección o no está publicada."
          ctaLabel="Volver al curso"
          ctaHref={`/cursos/${courseId}`}
          icon="📖"
        />
      </div>
    );
  }

  const lessonContext = {
    courseTitle: courseTitle || "Curso",
    moduleTitle: moduleTitle || "Módulo",
    lessonTitle: lesson.title,
    lessonSummary: lesson.summary,
    resourcesTitles: [],
  };

  return (
    <div className="max-w-3xl">
      <p className="text-sm text-[var(--text-muted)] mb-2">
        <Link href={`/cursos/${courseId}`} className="text-[var(--accent)] hover:underline">
          {courseTitle || "Curso"}
        </Link>
        {" · "}
        {moduleTitle}
      </p>
      <h1 className="text-2xl font-bold text-[var(--text)] mb-2">{lesson.title}</h1>
      {lesson.summary && (
        <p className="text-[var(--text-muted)] mb-6">{lesson.summary}</p>
      )}
      <div className="card-white p-6 mb-6">
        <div className="text-base prose prose-neutral max-w-none whitespace-pre-wrap">
          {lesson.content || "Sin contenido adicional."}
        </div>
      </div>
      <TutorWidget
        lessonContext={lessonContext}
        onOpenAssistant={() =>
          openDrawer({
            mode: "tutor",
            lessonContext,
            cohortId: null,
            courseId,
          })
        }
      />
    </div>
  );
}
