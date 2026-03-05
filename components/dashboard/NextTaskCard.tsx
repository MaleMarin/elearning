"use client";

import { CheckSquare } from "lucide-react";
import { SurfaceCard } from "@/components/ui/SurfaceCard";
import { SecondaryButton } from "@/components/ui/Buttons";

export interface TaskData {
  id: string;
  title: string;
  due_at: string;
  completed_at: string | null;
}

interface NextTaskCardProps {
  task: TaskData | null;
}

export function NextTaskCard({ task }: NextTaskCardProps) {
  return (
    <SurfaceCard padding="lg" clickable={false} as="section" aria-labelledby="next-task-heading">
      <h2 id="next-task-heading" className="text-base font-semibold text-[var(--ink)] mb-4 flex items-center gap-2">
        <CheckSquare className="w-4 h-4 text-[var(--primary)]" />
        Próxima tarea
      </h2>
      {task ? (
        <>
          <p className="font-semibold text-[var(--ink)] text-base mb-2">{task.title}</p>
          <p className="text-[var(--ink-muted)] text-sm mb-5">
            Vence:{" "}
            {new Date(task.due_at).toLocaleDateString("es", {
              weekday: "short",
              day: "numeric",
              month: "short",
            })}
          </p>
          <SecondaryButton href="/tareas">Ver tarea</SecondaryButton>
        </>
      ) : (
        <div className="py-2">
          <p className="text-[var(--ink-muted)] text-sm mb-4">
            Aún no tienes tareas pendientes.
          </p>
          <SecondaryButton href="/tareas">Ver tareas</SecondaryButton>
        </div>
      )}
    </SurfaceCard>
  );
}
