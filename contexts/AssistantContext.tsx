"use client";

import { createContext, useContext, useState, useCallback } from "react";
import type { AssistantMode } from "@/lib/types/database";
import type { LessonContext } from "@/lib/types/database";
import { AssistantDrawer } from "@/components/assistant/AssistantDrawer";

type DrawerState = {
  open: boolean;
  mode: AssistantMode;
  lessonContext: LessonContext | null;
  cohortId: string | null;
  courseId: string | null;
};

const defaultState: DrawerState = {
  open: false,
  mode: "tutor",
  lessonContext: null,
  cohortId: null,
  courseId: null,
};

type AssistantContextValue = {
  openDrawer: (options: {
    mode?: AssistantMode;
    lessonContext?: LessonContext | null;
    cohortId?: string | null;
    courseId?: string | null;
  }) => void;
  closeDrawer: () => void;
};

const Context = createContext<AssistantContextValue | null>(null);

export function AssistantProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<DrawerState>(defaultState);

  const openDrawer = useCallback(
    (options: {
      mode?: AssistantMode;
      lessonContext?: LessonContext | null;
      cohortId?: string | null;
      courseId?: string | null;
    }) => {
      setState({
        open: true,
        mode: options.mode ?? "tutor",
        lessonContext: options.lessonContext ?? null,
        cohortId: options.cohortId ?? null,
        courseId: options.courseId ?? null,
      });
    },
    []
  );

  const closeDrawer = useCallback(() => {
    setState((s) => ({ ...s, open: false }));
  }, []);

  return (
    <Context.Provider value={{ openDrawer, closeDrawer }}>
      {children}
      <AssistantDrawer
        open={state.open}
        onClose={closeDrawer}
        onOpen={() => setState((s) => ({ ...s, open: true }))}
        defaultMode={state.mode}
        lessonContext={state.lessonContext}
        cohortId={state.cohortId}
        courseId={state.courseId}
      />
    </Context.Provider>
  );
}

export function useAssistant() {
  const ctx = useContext(Context);
  if (!ctx) throw new Error("useAssistant must be used within AssistantProvider");
  return ctx;
}
