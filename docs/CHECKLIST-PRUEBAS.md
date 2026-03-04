# Checklist de pruebas – Sistema de Asistente

## Variables y entorno

- [ ] `.env.local` con `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`
- [ ] Opcional: `MODEL_API_KEY` para LLM real; sin ella debe funcionar el mock
- [ ] Migración SQL ejecutada en Supabase (`supabase/migrations/001_assistant_system.sql`)
- [ ] Seed ejecutado (o datos equivalentes): 1 admin, 1 mentor, 1 estudiante, 1 cohorte, 2 posts, 1 ticket

## Permisos y RLS

- [ ] **Estudiante**: solo ve sus propios `assistant_threads` y `assistant_messages`; solo sus `support_tickets`; no ve tickets de otros
- [ ] **Mentor**: ve threads y tickets de su cohorte; no ve datos de otras cohortes
- [ ] **Admin**: ve todos los threads, tickets y flags
- [ ] **Notificaciones**: solo el propio usuario ve sus notificaciones
- [ ] **Flags**: solo mentor/admin de la cohorte ven la cola de flags de esa cohorte

## Flujos por modo

### Tutor

- [ ] Botón flotante abre el drawer; pestaña Tutor por defecto
- [ ] Desde una lección, “Pregúntale al Tutor” abre el drawer en modo tutor con contexto de lección
- [ ] Envío de mensaje: se crea/usa thread, se guarda mensaje y respuesta en Supabase
- [ ] Con `MODEL_API_KEY`: respuesta coherente con el contexto; oferta de mini-quiz
- [ ] Petición de “mini-quiz”: se generan 3 preguntas con respuestas y explicación (o mensaje mock si no hay API)

### Soporte

- [ ] Pestaña “Soporte” en el drawer
- [ ] Página /soporte: FAQ visible; botón “Abrir chat de soporte” abre el drawer en modo soporte
- [ ] Chat de soporte: respuestas alineadas al FAQ (o mock)
- [ ] Cuando el asistente decide crear ticket: se crea registro en `support_tickets` y se confirma en el chat
- [ ] En /soporte, “Mis tickets” lista solo los del usuario

### Comunidad

- [ ] Pestaña “Comunidad” en el drawer
- [ ] /comunidad: botón “Resumir semana” llama a `POST /api/community/digest`; se crea digest y notificaciones (con service role)
- [ ] “Detectar preguntas sin respuesta”: llama a `POST /api/community/unanswered`; notifica a mentores
- [ ] Cola de flags: solo mentor/admin ven flags; listado con razón y severidad
- [ ] `POST /api/community/moderate` con `postId` y `postContent`: si el modelo marca, se crea `community_flags` (no borra el post)

## Casos de error

- [ ] `POST /api/assistant` sin sesión: 401
- [ ] `POST /api/assistant` sin `message`: 400
- [ ] `GET /api/support/tickets` sin sesión: 401
- [ ] `PATCH /api/support/tickets/[id]` como estudiante: 403
- [ ] `POST /api/community/digest` o `unanswered` como estudiante: 403
- [ ] `GET /api/community/flags` sin `cohortId`: 400
- [ ] Sin `SUPABASE_SERVICE_ROLE_KEY`: fallo al crear notificaciones o digests (API devuelve error)

## UI y accesibilidad

- [ ] Fondo crema cálido (no rosado); cards blancas; sidebar izquierda + contenido + panel derecho
- [ ] Tamaño base de fuente 18px; botones grandes (min 44px); contraste AA
- [ ] Drawer: focus atrapado en el panel; cierre con botón “Cerrar”; etiquetas ARIA

## Resumen

- Permisos: estudiante solo lo suyo; mentor solo su cohorte; admin todo.
- RLS: comprobar en Supabase que las policies coinciden con lo anterior.
- Flujos: tutor (contexto + quiz), soporte (FAQ + ticket), comunidad (digest, unanswered, flags).
- Errores: 401/403/400 según corresponda.
- UI: crema, accesible, sin WhatsApp.
