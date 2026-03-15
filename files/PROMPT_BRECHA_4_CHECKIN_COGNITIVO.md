# 🎯 PROMPT CURSOR — BRECHA 4: CHECK-IN COGNITIVO
# ================================================================
# INSTRUCCIÓN CRÍTICA: Lee TODO antes de escribir una línea.
# ================================================================

## PASO 1 — LEE ESTOS ARCHIVOS PRIMERO (en orden exacto)

```
1.  .cursorrules
2.  docs/DESIGN_SYSTEM.md
3.  docs/PROJECT_STRUCTURE.md
4.  app/inicio/page.tsx
5.  components/dashboard/DashboardShell.tsx
6.  app/api/auth/me/route.ts
7.  lib/firebase/auth-request.ts
```

⛔ NO escribas código hasta confirmar. Responde "Archivos leídos ✓"

---

## CONTEXTO

Proyecto: Política Digital — e-learning servidores públicos mexicanos
Stack: Next.js 14 App Router + Firebase + Tailwind + TypeScript
NUNCA usar "cohorte" → siempre "grupo"
NUNCA usar "badges" → siempre "logros"
Colores SIEMPRE style={{}} inline — NUNCA clases Tailwind para colores
Íconos SIEMPRE SVG inline — NUNCA lucide-react

Colores oficiales:
- Fondo: #e8eaf0 | Azul: #1428d4 | Azul oscuro: #0a0f8a
- Menta: #00e5a0 | Sombra oscura: #c2c8d6 | Sombra clara: #ffffff

Sombras neumórficas:
- Elevada:  6px 6px 14px #c2c8d6, -6px -6px 14px #ffffff
- Hundida:  inset 3px 3px 8px #c2c8d6, inset -3px -3px 8px #ffffff

---

## TAREA — BRECHA 4: CHECK-IN COGNITIVO

### ¿Qué es?
Evaluación adaptativa del estado mental y cognitivo del alumno
ANTES de comenzar cada lección. Según el resultado, el sistema
ajusta la dificultad y el tipo de contenido presentado.

### Archivos a CREAR:
```
components/cognitive/CognitiveCheckin.tsx   ← componente principal
components/cognitive/CognitiveResult.tsx    ← pantalla de resultado
app/api/checkin/route.ts                    ← guarda resultado en Firebase
```

### Archivos a MODIFICAR:
```
app/inicio/page.tsx   ← integrar CognitiveCheckin antes de cada lección
```

### Flujo exacto:
1. Alumno hace clic en una lección
2. Aparece modal/overlay neumórfico con 4 preguntas rápidas
3. Preguntas evalúan: energía, concentración, estrés, motivación
4. Cada pregunta tiene 5 opciones visuales (emojis + texto corto)
5. Al completar → análisis → resultado en 3 niveles:
   - 🟢 ÓPTIMO: "Estás listo. Lección completa con todos los ejercicios."
   - 🟡 MODERADO: "Empecemos suave. Versión enfocada de la lección."
   - 🔴 BAJO: "Hoy descansa el cerebro. Versión express de 5 minutos."
6. Botón "Continuar" lleva a la lección con el modo seleccionado
7. Guardar resultado en Firebase: userId, lessonId, timestamp, nivel, respuestas

### Diseño del componente:

#### Modal overlay (neumórfico):
```
- Fondo: rgba(232, 234, 240, 0.95) con blur
- Card central: borderRadius 24px
- Sombra: 8px 8px 20px #c2c8d6, -8px -8px 20px #ffffff
- Ancho: 480px máximo
- Padding: 32px
```

#### Preguntas (una a la vez, con transición):
```
Pregunta 1: "¿Cómo está tu energía ahora?"
Opciones: 😴 Sin energía | 😕 Poca | 😐 Normal | 😊 Bien | ⚡ Máxima

Pregunta 2: "¿Qué tan concentrado/a te sientes?"
Opciones: 🌀 Disperso | 😵 Distraído | 😐 Regular | 🎯 Enfocado | 🔬 Total

Pregunta 3: "¿Cuánto estrés traes?"
Opciones: 😤 Mucho | 😰 Bastante | 😐 Algo | 😌 Poco | 🧘 Ninguno

Pregunta 4: "¿Con qué ganas llegás hoy?"
Opciones: 😞 Sin ganas | 😕 Pocas | 😐 Neutro | 😃 Con ganas | 🔥 Muy motivado
```

#### Barra de progreso de preguntas:
```
- 4 puntos neumórficos: completados = azul elevado, pendientes = gris hundido
- Transición suave entre preguntas (fade + slide)
```

#### Pantalla de resultado:
```
- Ícono grande con color según nivel (verde/amarillo/rojo neumórfico)
- Título del nivel
- Descripción breve de qué pasará
- Botón CTA primario: "Comenzar lección"
- Texto pequeño: "Puedes cambiar el modo en cualquier momento"
```

### Código TypeScript:

```tsx
// components/cognitive/CognitiveCheckin.tsx
'use client'

import { useState } from 'react'

const NM = {
  bg:      '#e8eaf0',
  elevated:'6px 6px 14px #c2c8d6, -6px -6px 14px #ffffff',
  elevatedLg:'8px 8px 20px #c2c8d6, -8px -8px 20px #ffffff',
  inset:   'inset 3px 3px 8px #c2c8d6, inset -3px -3px 8px #ffffff',
  insetSm: 'inset 2px 2px 5px #c2c8d6, inset -2px -2px 5px #ffffff',
} as const

type CogLevel = 'optimo' | 'moderado' | 'bajo'

interface Question {
  id: number
  text: string
  options: { emoji: string; label: string; value: number }[]
}

interface CognitiveCheckinProps {
  lessonTitle: string
  lessonId: string
  onComplete: (level: CogLevel) => void
  onClose: () => void
}

const QUESTIONS: Question[] = [
  {
    id: 1,
    text: '¿Cómo está tu energía ahora?',
    options: [
      { emoji: '😴', label: 'Sin energía', value: 1 },
      { emoji: '😕', label: 'Poca',        value: 2 },
      { emoji: '😐', label: 'Normal',      value: 3 },
      { emoji: '😊', label: 'Bien',        value: 4 },
      { emoji: '⚡', label: 'Máxima',      value: 5 },
    ],
  },
  {
    id: 2,
    text: '¿Qué tan concentrado/a te sentís?',
    options: [
      { emoji: '🌀', label: 'Disperso',  value: 1 },
      { emoji: '😵', label: 'Distraído', value: 2 },
      { emoji: '😐', label: 'Regular',   value: 3 },
      { emoji: '🎯', label: 'Enfocado',  value: 4 },
      { emoji: '🔬', label: 'Total',     value: 5 },
    ],
  },
  {
    id: 3,
    text: '¿Cuánto estrés traés?',
    options: [
      { emoji: '😤', label: 'Mucho',   value: 1 },
      { emoji: '😰', label: 'Bastante',value: 2 },
      { emoji: '😐', label: 'Algo',    value: 3 },
      { emoji: '😌', label: 'Poco',    value: 4 },
      { emoji: '🧘', label: 'Ninguno', value: 5 },
    ],
  },
  {
    id: 4,
    text: '¿Con qué ganas llegás hoy?',
    options: [
      { emoji: '😞', label: 'Sin ganas',     value: 1 },
      { emoji: '😕', label: 'Pocas',         value: 2 },
      { emoji: '😐', label: 'Neutro',        value: 3 },
      { emoji: '😃', label: 'Con ganas',     value: 4 },
      { emoji: '🔥', label: 'Muy motivado',  value: 5 },
    ],
  },
]

function calcLevel(scores: number[]): CogLevel {
  const avg = scores.reduce((a, b) => a + b, 0) / scores.length
  if (avg >= 3.5) return 'optimo'
  if (avg >= 2.5) return 'moderado'
  return 'bajo'
}

const LEVEL_CONFIG = {
  optimo: {
    icon: '🟢', color: '#00b87d', bg: 'rgba(0,229,160,0.12)',
    title: 'Estás en modo óptimo',
    desc: 'Lección completa con todos los ejercicios y actividades.',
    cta: 'Comenzar lección completa',
  },
  moderado: {
    icon: '🟡', color: '#c89000', bg: 'rgba(255,186,0,0.12)',
    title: 'Modo enfocado',
    desc: 'Versión concentrada de la lección. Lo esencial, bien aprendido.',
    cta: 'Comenzar versión enfocada',
  },
  bajo: {
    icon: '🔴', color: '#d84040', bg: 'rgba(220,80,80,0.1)',
    title: 'Modo express',
    desc: 'Hoy descansa el cerebro. Versión de 5 minutos con lo más importante.',
    cta: 'Comenzar versión express',
  },
}

export default function CognitiveCheckin({
  lessonTitle, lessonId, onComplete, onClose
}: CognitiveCheckinProps) {
  const [step, setStep]       = useState<'questions' | 'result'>('questions')
  const [current, setCurrent] = useState(0)
  const [scores, setScores]   = useState<number[]>([])
  const [selected, setSelected] = useState<number | null>(null)
  const [level, setLevel]     = useState<CogLevel | null>(null)

  const q = QUESTIONS[current]

  const handleSelect = (value: number) => {
    setSelected(value)
  }

  const handleNext = () => {
    if (selected === null) return
    const newScores = [...scores, selected]
    if (current < QUESTIONS.length - 1) {
      setScores(newScores)
      setCurrent(current + 1)
      setSelected(null)
    } else {
      const lvl = calcLevel(newScores)
      setLevel(lvl)
      setStep('result')
      // Guardar en Firebase via API
      fetch('/api/checkin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ lessonId, scores: newScores, level: lvl }),
      }).catch(() => {})
    }
  }

  const cfg = level ? LEVEL_CONFIG[level] : null

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 50,
      background: 'rgba(232,234,240,0.92)',
      backdropFilter: 'blur(8px)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: 16,
    }}>
      <div style={{
        background: NM.bg, borderRadius: 24, padding: 32,
        width: '100%', maxWidth: 480,
        boxShadow: NM.elevatedLg,
        fontFamily: "'Syne', sans-serif",
      }}>

        {step === 'questions' && (
          <>
            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 24 }}>
              <div>
                <p style={{ fontSize: 10, color: '#8892b0', fontFamily: "'Space Mono', monospace", textTransform: 'uppercase', letterSpacing: '1.5px', marginBottom: 4 }}>
                  Check-in cognitivo
                </p>
                <p style={{ fontSize: 13, fontWeight: 700, color: '#0a0f8a' }}>{lessonTitle}</p>
              </div>
              <button onClick={onClose} style={{ background: NM.bg, border: 'none', cursor: 'pointer', width: 32, height: 32, borderRadius: 10, boxShadow: NM.elevated, color: '#8892b0', fontSize: 16, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>×</button>
            </div>

            {/* Progreso */}
            <div style={{ display: 'flex', gap: 8, marginBottom: 28 }}>
              {QUESTIONS.map((_, i) => (
                <div key={i} style={{
                  flex: 1, height: 6, borderRadius: 3,
                  background: NM.bg,
                  boxShadow: i <= current ? NM.inset : NM.elevated,
                  transition: 'all 0.3s ease',
                }}>
                  {i < current && (
                    <div style={{ height: '100%', background: 'linear-gradient(90deg, #1428d4, #00e5a0)', borderRadius: 3 }} />
                  )}
                  {i === current && (
                    <div style={{ height: '100%', width: '50%', background: '#1428d4', borderRadius: 3 }} />
                  )}
                </div>
              ))}
            </div>

            {/* Pregunta */}
            <h2 style={{ fontSize: 18, fontWeight: 800, color: '#0a0f8a', marginBottom: 24, lineHeight: 1.3, letterSpacing: '-0.3px' }}>
              {q.text}
            </h2>

            {/* Opciones */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 28 }}>
              {q.options.map(opt => (
                <button
                  key={opt.value}
                  onClick={() => handleSelect(opt.value)}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 14,
                    padding: '12px 16px', borderRadius: 14, border: 'none',
                    cursor: 'pointer', fontFamily: "'Syne', sans-serif",
                    background: selected === opt.value ? 'rgba(20,40,212,0.06)' : NM.bg,
                    boxShadow: selected === opt.value ? NM.inset : NM.elevated,
                    transition: 'all 0.15s ease',
                  }}
                >
                  <span style={{ fontSize: 22 }}>{opt.emoji}</span>
                  <span style={{ fontSize: 13, fontWeight: 600, color: selected === opt.value ? '#1428d4' : '#4a5580' }}>
                    {opt.label}
                  </span>
                  {selected === opt.value && (
                    <span style={{ marginLeft: 'auto', width: 20, height: 20, borderRadius: '50%', background: '#1428d4', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <svg width="10" height="10" viewBox="0 0 12 12" fill="none"><polyline points="2,6 5,9 10,3" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
                    </span>
                  )}
                </button>
              ))}
            </div>

            {/* Botón siguiente */}
            <button
              onClick={handleNext}
              disabled={selected === null}
              style={{
                width: '100%', padding: 14, borderRadius: 14, border: 'none',
                cursor: selected !== null ? 'pointer' : 'not-allowed',
                fontFamily: "'Syne', sans-serif", fontSize: 13, fontWeight: 700,
                background: selected !== null ? 'linear-gradient(135deg, #1428d4, #0a0f8a)' : NM.bg,
                color: selected !== null ? 'white' : '#8892b0',
                boxShadow: selected !== null ? '5px 5px 12px rgba(10,15,138,0.35), -3px -3px 8px rgba(255,255,255,0.7)' : NM.inset,
                transition: 'all 0.2s ease',
              }}
            >
              {current < QUESTIONS.length - 1 ? 'Siguiente →' : 'Ver mi resultado →'}
            </button>

            <p style={{ textAlign: 'center', fontSize: 10, color: '#8892b0', marginTop: 12, fontFamily: "'Space Mono', monospace" }}>
              {current + 1} de {QUESTIONS.length} preguntas
            </p>
          </>
        )}

        {step === 'result' && cfg && level && (
          <>
            {/* Resultado */}
            <div style={{ textAlign: 'center', marginBottom: 28 }}>
              <div style={{ width: 72, height: 72, borderRadius: 22, background: cfg.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 36, margin: '0 auto 16px', boxShadow: NM.elevated }}>
                {cfg.icon}
              </div>
              <h2 style={{ fontSize: 20, fontWeight: 800, color: '#0a0f8a', marginBottom: 8, letterSpacing: '-0.3px' }}>
                {cfg.title}
              </h2>
              <p style={{ fontSize: 13, color: '#4a5580', lineHeight: 1.6, maxWidth: 320, margin: '0 auto' }}>
                {cfg.desc}
              </p>
            </div>

            {/* Métricas */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 8, marginBottom: 24 }}>
              {QUESTIONS.map((q, i) => (
                <div key={i} style={{ background: NM.bg, borderRadius: 12, padding: '10px 6px', boxShadow: NM.insetSm, textAlign: 'center' }}>
                  <div style={{ fontSize: 16, marginBottom: 4 }}>{q.options[scores[i] - 1]?.emoji}</div>
                  <div style={{ fontSize: 8, color: '#8892b0', textTransform: 'uppercase', letterSpacing: '0.3px', fontFamily: "'Space Mono', monospace", lineHeight: 1.3 }}>
                    {['Energía','Concentr.','Estrés','Motivación'][i]}
                  </div>
                </div>
              ))}
            </div>

            <button
              onClick={() => onComplete(level)}
              style={{
                width: '100%', padding: 14, borderRadius: 14, border: 'none',
                cursor: 'pointer', fontFamily: "'Syne', sans-serif",
                fontSize: 13, fontWeight: 700,
                background: 'linear-gradient(135deg, #1428d4, #0a0f8a)',
                color: 'white',
                boxShadow: '5px 5px 12px rgba(10,15,138,0.35), -3px -3px 8px rgba(255,255,255,0.7)',
                marginBottom: 10,
              }}
            >
              {cfg.cta}
            </button>

            <p style={{ textAlign: 'center', fontSize: 10, color: '#8892b0', fontFamily: "'Space Mono', monospace" }}>
              Podés cambiar el modo en cualquier momento
            </p>
          </>
        )}
      </div>
    </div>
  )
}
```

### API route.ts:

```typescript
// app/api/checkin/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { getAuthFromRequest } from '@/lib/firebase/auth-request'

export async function POST(req: NextRequest) {
  try {
    const { lessonId, scores, level } = await req.json()
    const user = await getAuthFromRequest(req)

    // TODO: guardar en Firestore
    // await db.collection('checkins').add({
    //   userId: user?.uid,
    //   lessonId,
    //   scores,
    //   level,
    //   timestamp: new Date(),
    // })

    return NextResponse.json({ success: true, level })
  } catch {
    return NextResponse.json({ success: false }, { status: 500 })
  }
}
```

### Integración en app/inicio/page.tsx:

```tsx
// Agregar estos imports al inicio:
import CognitiveCheckin from '@/components/cognitive/CognitiveCheckin'

// Agregar estos estados:
const [showCheckin, setShowCheckin] = useState(false)
const [pendingLesson, setPendingLesson] = useState<{ id: string; title: string } | null>(null)

// Función para abrir una lección:
const handleOpenLesson = (lessonId: string, lessonTitle: string) => {
  setPendingLesson({ id: lessonId, title: lessonTitle })
  setShowCheckin(true)
}

const handleCheckinComplete = (level: 'optimo' | 'moderado' | 'bajo') => {
  setShowCheckin(false)
  // TODO: navegar a la lección con el modo correspondiente
  // router.push(`/leccion/${pendingLesson?.id}?mode=${level}`)
}

// En el JSX, antes del cierre del return():
{showCheckin && pendingLesson && (
  <CognitiveCheckin
    lessonTitle={pendingLesson.title}
    lessonId={pendingLesson.id}
    onComplete={handleCheckinComplete}
    onClose={() => setShowCheckin(false)}
  />
)}
```

---

## ✅ CHECKLIST FINAL

- [ ] `'use client'` en línea 1 de CognitiveCheckin.tsx
- [ ] TypeScript sin errores (`tsc --noEmit`)
- [ ] 4 preguntas con 5 opciones cada una
- [ ] Barra de progreso neumórfica funcional
- [ ] 3 niveles de resultado: óptimo / moderado / bajo
- [ ] Guardia `disabled` en botón siguiente cuando no hay selección
- [ ] API `/api/checkin` creada y conectada
- [ ] Integrado en `app/inicio/page.tsx` sin romper nada
- [ ] NUNCA "badges" — "logros"
- [ ] NUNCA "cohorte" — "grupo"
- [ ] Colores hex exactos, sin clases Tailwind de color
- [ ] Íconos SVG inline, sin lucide-react

Solo responde "✅ Brecha 4 implementada" cuando todo esté confirmado.
