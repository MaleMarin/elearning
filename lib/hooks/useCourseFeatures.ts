"use client";

import { useState, useEffect } from "react";
import type { CourseFeatures } from "@/lib/types/course-features";
import { DEFAULT_COURSE_FEATURES } from "@/lib/types/course-features";

const CACHE_TTL_MS = 5 * 60 * 1000; // 5 minutos
const cache = new Map<string, { data: CourseFeatures; ts: number }>();

/**
 * Hook para leer los feature flags de un curso (vista alumno).
 * Usa la API /api/curso/[courseId]/features; solo devuelve datos si el usuario
 * está inscrito en una cohorte cuyo curso primario es este courseId.
 * Con cache en memoria para no cambiar frecuentemente.
 */
export function useCourseFeatures(courseId: string | null): CourseFeatures | null {
  const [features, setFeatures] = useState<CourseFeatures | null>(null);

  useEffect(() => {
    if (!courseId) {
      setFeatures(null);
      return;
    }
    const cached = cache.get(courseId);
    if (cached && Date.now() - cached.ts < CACHE_TTL_MS) {
      setFeatures(cached.data);
      return;
    }
    let cancelled = false;
    fetch(`/api/curso/${courseId}/features`)
      .then((r) => r.json())
      .then((data) => {
        if (cancelled) return;
        if (data.error) {
          setFeatures({ ...DEFAULT_COURSE_FEATURES });
          return;
        }
        const f = (data.features ?? { ...DEFAULT_COURSE_FEATURES }) as CourseFeatures;
        cache.set(courseId, { data: f, ts: Date.now() });
        setFeatures(f);
      })
      .catch(() => {
        if (!cancelled) setFeatures({ ...DEFAULT_COURSE_FEATURES });
      });
    return () => {
      cancelled = true;
    };
  }, [courseId]);

  return features;
}

/**
 * Invalida el cache de features para un courseId (p. ej. tras guardar en admin).
 */
export function invalidateCourseFeaturesCache(courseId: string): void {
  cache.delete(courseId);
}
