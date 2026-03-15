# Ticket 3 (Etapa 1) — Estados vivos + progreso real mínimo (Firebase)

## Resumen

- **Firestore**: colección `progress`, documento `{uid}_{courseId}` con `uid`, `courseId`, `completedLessonIds` (string[]), `updatedAt`.
- **API**: GET `/api/progress?courseId=...` devuelve `{ completedLessonIds }`. POST `/api/progress/complete` (body: `{ courseId, lessonId }`) y POST `/api/progress/uncomplete` marcan completada/pendiente (idempotente).
- **Cálculo %**: en cliente/API: `completed = completedLessonIds ∩ publishedLessonIds`, `percent = round((completed/total)*100)`, si `total=0` → 0% (no mostrar percent en RightRail).
- **UI /curso**: badges por lección "Completado" / "Pendiente" según progress; cabecera de módulo "n/m completadas".
- **UI lección**: botón "Marcar como completada" → POST complete → Toast "¡Bien! Completaste esta lección."; si ya completada → estado "Completada" + "Marcar como pendiente".
- **RightRail**: ProgressRing con % real, "X de Y lecciones", enlace "Ver curso"; si no hay curso asignado → EmptyState "Aún no tienes curso asignado".
- **Dashboard**: con Firebase devuelve `courseId` y `progress` real desde Firestore; demo y Supabase mantienen/sumaban `courseId` y progress (Supabase sin persistencia de completadas).

---

## Archivos tocados

| Archivo | Cambio |
|--------|--------|
| `lib/services/firebase-progress.ts` | **Nuevo.** Servicio Firestore: `getProgress(uid, courseId)`, `addCompletedLesson`, `removeCompletedLesson`. Doc ID `{uid}_{courseId}`. |
| `app/api/progress/route.ts` | **Nuevo.** GET con `courseId` query; devuelve `{ completedLessonIds }`. Demo/Supabase: `[]`; Firebase: lee desde firebase-progress. |
| `app/api/progress/complete/route.ts` | **Nuevo.** POST body `{ courseId, lessonId }`; transacción idempotente en Firestore. Demo: devuelve ok sin persistir. |
| `app/api/progress/uncomplete/route.ts` | **Nuevo.** POST body `{ courseId, lessonId }`; quita lección de completadas. |
| `app/api/dashboard/route.ts` | Rama Firebase: auth → enrollment → courseId → getProgress + getPublishedModules/Lessons → `progress: { lessonsDone, lessonsTotal }` real y `courseId`. Respuesta con `courseId` en demo y Supabase. |
| `app/curso/page.tsx` | Fetch `/api/progress?courseId=...` al tener curso; badges ListRow "Completado" / "Pendiente"; cabecera módulo "n/m completadas". |
| `app/curso/lecciones/[lessonId]/page.tsx` | Estado `isCompleted` desde GET progress; botón "Marcar como completada" / "Completada" + "Marcar como pendiente"; POST complete/uncomplete; Toast éxito; Badge "Completada" o "En curso". |
| `components/layout/RightRail.tsx` | `courseId` en tipo; EmptyState "Aún no tienes curso asignado" cuando `cohortId && !courseId`; ProgressRing sin % si total=0; refetch dashboard al cambiar `pathname` para actualizar progreso tras completar. |

---

## Cómo probar

1. **Marcar completada y persistencia**  
   - Con alumno enrolado y curso con lecciones (Firebase): abrir `/curso` → todas "Pendiente".  
   - Abrir una lección → clic "Marcar como completada" → Toast "¡Bien! Completaste esta lección."  
   - Volver a `/curso` → esa lección con badge "Completado".  
   - Recargar navegador → sigue "Completado".

2. **RightRail**  
   - En `/inicio` (o cualquier ruta con RightRail): comprobar "Tu progreso" con ProgressRing, "X de Y lecciones" y "Ver curso".  
   - Completar una lección, navegar (p. ej. a `/curso` o `/inicio`) → RightRail actualiza X/Y y %.

3. **Sin curso asignado**  
   - Usuario con cohorte pero sin curso primary: RightRail muestra EmptyState "Aún no tienes curso asignado".

4. **Marcar como pendiente**  
   - En una lección ya completada → "Marcar como pendiente" → vuelve a "Pendiente"; en `/curso` el badge pasa a "Pendiente".

5. **Demo**  
   - Con `NEXT_PUBLIC_DEMO_MODE=true`: GET progress devuelve `[]`; POST complete devuelve ok pero no persiste (al recargar se pierde).

---

## Criterios de aceptación (checklist)

- [x] Marcar completada crea/actualiza progress en Firestore.
- [x] Recargar y el estado "Completado" se mantiene.
- [x] /curso muestra badges correctos por lección.
- [x] RightRail muestra porcentaje real y "X de Y".
- [x] Completar lección muestra Toast sutil.
- [x] Sin loops ni loading infinito; estados loading/error/empty/success en las pantallas afectadas.
