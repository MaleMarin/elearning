"use client";

import { useState, useEffect } from "react";
import { EmptyState } from "@/components/ui/EmptyState";

interface Task {
  id: string;
  title: string;
  due_at: string;
  completed_at: string | null;
  cohort_id: string | null;
  instructions?: string | null;
}

export default function TareasPage() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/tasks")
      .then((r) => r.json())
      .then((d) => setTasks(d.tasks ?? []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const pending = tasks.filter((t) => !t.completed_at);

  if (loading) {
    return (
      <div className="max-w-3xl">
        <h1 className="text-2xl font-bold text-[var(--text)] mb-4">Tareas</h1>
        <div className="card-white p-6 animate-pulse">
          <div className="h-5 bg-gray-100 rounded w-2/3" />
        </div>
      </div>
    );
  }

  if (tasks.length === 0) {
    return (
      <div className="max-w-3xl">
        <h1 className="text-2xl font-bold text-[var(--text)] mb-6">Tareas</h1>
        <EmptyState
          title="No tienes tareas pendientes"
          description="Cuando te asignen tareas con fechas límite aparecerán aquí."
          ctaLabel="Ver curso"
          ctaHref="/curso"
          icon="✅"
        />
      </div>
    );
  }

  return (
    <div className="max-w-3xl">
      <h1 className="text-2xl font-bold text-[var(--text)] mb-4">Tareas</h1>
      <p className="text-[var(--text-muted)] mb-6">
        Tus tareas y fechas límite.
      </p>
      <ul className="space-y-4">
        {tasks.map((t) => (
          <li key={t.id} className="card-white p-4">
            <p className="font-medium text-[var(--text)]">{t.title}</p>
            {t.instructions && (
              <p className="text-base text-[var(--text-muted)] mt-1">{t.instructions}</p>
            )}
            <p className="text-base text-[var(--text-muted)] mt-2">
              Vence: {new Date(t.due_at).toLocaleString("es")}
              {t.completed_at && <span className="text-[var(--success)] ml-2">Completada</span>}
            </p>
          </li>
        ))}
      </ul>
    </div>
  );
}
