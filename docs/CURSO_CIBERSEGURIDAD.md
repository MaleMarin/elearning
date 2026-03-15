# Curso: Ciberseguridad para Funcionarios Públicos de México

**4 módulos · 30 horas · COBIT 2019, CISM, CRISC, CDPSE, ISACA**

---

## Crear el curso en la plataforma

Cuando el admin esté listo para disponibilizar el curso:

### 1. Ejecutar el seed (Firebase)

Con variables de entorno cargadas (por ejemplo desde `.env.local` o exportándolas):

```bash
# Opcional: ADMIN_ID=uid del perfil admin en Firebase
npm run seed:ciberseguridad
```

O con `dotenv-cli` si lo tienes instalado:

```bash
npx dotenv -e .env.local -- npm run seed:ciberseguridad
```

Requisitos:

- **FIREBASE_SERVICE_ACCOUNT_JSON** definido (proyecto Firebase con Firestore).
- Opcional: **ADMIN_ID** = UID del usuario admin (si no se pasa, se usa `seed-ciberseguridad` como `created_by`).

El script:

- Crea el curso en **borrador** (draft).
- Crea los **4 módulos** con título y descripción.
- Crea las **lecciones** por módulo (contenido teórico, video, actividades, quiz).
- Aplica la **plantilla de feature flags "Ciberseguridad"** (certificado con QR, peer review, spaced repetition, etc.).

### 2. Revisar y publicar desde Admin

1. Ir a **Admin → Cursos** y abrir el curso *Ciberseguridad para Funcionarios Públicos de México*.
2. **Funcionalidades:** Ya están aplicadas por el seed; puedes revisar o ajustar en *Configurar* (plantilla Ciberseguridad).
3. Añadir **videos** donde corresponda (las lecciones tienen placeholders "Inserte aquí la URL del video").
4. Publicar **módulos** y **lecciones** cuando el contenido esté listo (cambiar estado de draft a published).
5. **Asignar a una cohorte** (Asignar a cohorte) para que los 350 funcionarios puedan inscribirse.

### 3. Configuración recomendada

- **Evaluación mínima aprobatoria:** 6/10 (configurar en el quiz final / evaluación del curso si la plataforma lo permite).
- **Certificado con QR verificable:** ya activado vía feature flags.
- **Spaced repetition:** activado.
- **Peer review:** en Módulo 3 (foro dilema ético) y Módulo 4 (AI Audit Toolkit).

---

## Estructura del curso (generada por el seed)

| Módulo | Título | Lecciones (resumen) |
|--------|--------|----------------------|
| 1 | Fundamentos de Confianza Digital y Gobierno de TI | Introducción · Contenido COBIT 2019 · Video Gobernanza vs. Gestión · Actividad individual (caso) · Actividad en equipo (Sistema de Gobierno) · Quiz |
| 2 | Gestión de Seguridad y Riesgos Tecnológicos | Introducción · Contenido seguridad/BCP/DRP · Video Ransomware en la AP · Actividad individual (crisis) · Actividad en equipo (Protocolo) · Quiz |
| 3 | Privacidad por Diseño y Protección de Datos | Introducción · Contenido LFPDPPP/ITAF 5 · Video El viaje del dato · Actividad individual (flujo) · Foro dilema ético · Quiz |
| 4 | Ciber-resiliencia, IA y Normativas Globales | Introducción · Contenido NIS2/DORA/CMMC · Video IA y Fronteras · Ensayo · AI Audit Toolkit · **Examen final integrador** |

---

## Notas para el facilitador

- El curso sigue el modelo **ADDIE** y aplica los **10 Principios de Aprendizaje Multimediático de Mayer** y las **10 Heurísticas de Usabilidad de Nielsen**.
- Los quizzes usan ramificación: respuesta incorrecta → repaso del concepto → reintentar.
- El Módulo 2 (simulación de crisis) es el de mayor engagement esperado.
- Organismos a citar en materiales: CERT-MX, CNCS, INAI, Secretaría de la Función Pública.
