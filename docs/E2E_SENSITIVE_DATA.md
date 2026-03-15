# Cifrado E2E en datos sensibles (Brecha 1)

Este documento es la fuente de verdad sobre qué datos se cifran de extremo a extremo en Política Digital. La llave se deriva del `uid` del usuario y **nunca sale del dispositivo** cuando el cifrado/descifrado se realiza en el cliente; el servidor solo almacena ciphertext.

---

## Módulo de cifrado

- **Ubicación:** `lib/crypto/encryption.ts`
- **Algoritmo:** AES (CryptoJS) con llave derivada por PBKDF2 desde `uid` + salt fijo.
- **API:** `encrypt(text, uid)`, `decrypt(ciphertext, uid)`, `encryptObject(obj, uid)`, `decryptObject(encrypted, uid)`.

El servidor **nunca** tiene la llave; solo persiste y devuelve el blob cifrado. Quien descifra es siempre el cliente (o un backend que recibe el uid del usuario autenticado y lo usa solo para descifrado en memoria, p. ej. export o felicidades no leen el contenido en claro en el servidor: devuelven el ciphertext para que el cliente descifre).

---

## Datos cubiertos por E2E

| Dato | Ubicación Firestore | Cifrado en | Descifrado en |
|------|---------------------|------------|----------------|
| **Diagnóstico inicial** | `users/{uid}/diagnostic/v1` → `encryptedAnswers` | Servidor (`evaluation.setDiagnostic` con uid) | Cliente (perfil, export), Admin export con uid por fila |
| **Encuesta de cierre** | `users/{uid}/closingSurvey/v1` → `encryptedPayload` | Servidor (`evaluation.ts` con uid) | Cliente (perfil, export), Admin export con uid |
| **Carta al yo futuro** | `users/{uid}/futureLetter/letter` → `content` | Cliente antes de POST | Cliente (felicidades, export, perfil) |
| **Diario de aprendizaje** | `users/{uid}/journal/{lessonId}` → `content`, `reflection` | Cliente antes de POST | Cliente (lección, export, perfil) |

---

## Flujos por dato

### Diagnóstico inicial

- **Escritura:** Cliente envía respuestas en claro a `POST /api/evaluation/diagnostic`; el servicio `lib/services/evaluation.ts` cifra con `encrypt(JSON.stringify(answers), uid)` y guarda solo `encryptedAnswers` en Firestore.
- **Lectura:** `getDiagnostic(uid)` descifra en servidor cuando se necesita (ruta adaptativa, stats); export y perfil devuelven ciphertext y el cliente descifra.

### Encuesta de cierre

- **Escritura:** Cliente envía payload en claro; `evaluation.ts` cifra en servidor y guarda `encryptedPayload`.
- **Lectura:** Servidor no necesita el contenido en claro; export y perfil devuelven ciphertext, cliente descifra.

### Carta al yo futuro

- **Escritura:** Cliente cifra en `app/onboarding/diagnostic/page.tsx` (`handleSaveLetter`) y envía `content` cifrado a `POST /api/onboarding/future-letter`.
- **Lectura:** `GET /api/onboarding/future-letter` y `GET /api/felicidades` devuelven `content`/`cartaEncrypted` sin descifrar; el cliente usa `decrypt(..., uid)` en `app/felicidades/page.tsx` y en `components/profile/PrivacySection.tsx` (export).

### Diario (journal)

- **Escritura:** `components/lesson/LearningJournal.tsx` cifra `content` y `reflection` (si no vacíos) antes de `POST /api/journal`. El API guarda tal cual.
- **Lectura:** `GET /api/journal` devuelve `content` y `reflection` cifrados; el cliente descifra en `LearningJournal` y en `PrivacySection` (export).

---

## Export de datos y eliminación

- **GET /api/profile/export:** Devuelve journal, futureLetter, diagnostic (encryptedAnswers), closingSurvey (encryptedPayload) en crudo. El cliente descifra en `PrivacySection` con `decrypt(..., userId)` y genera el JSON descargable en claro solo en el dispositivo.
- **POST /api/profile/delete-my-data:** Borra journal, futureLetter, diagnostic y closingSurvey sin necesidad de descifrar.

---

## Reglas para nuevos datos sensibles

Si se añaden nuevos datos que deban ser E2E:

1. Cifrar en cliente (o en backend con `uid` del usuario autenticado) con `encrypt` / `encryptObject` de `lib/crypto/encryption.ts`.
2. Guardar solo ciphertext en Firestore/DB.
3. Descifrar solo en cliente con `decrypt(..., uid)` o en flujos de export/admin que requieran uid por usuario.
4. Actualizar este documento y la tabla de datos cubiertos.

---

**Fecha:** 2025-03-14 · **Brecha 1 — Cifrado E2E en datos sensibles**
