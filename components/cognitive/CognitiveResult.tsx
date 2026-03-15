'use client'

import type { CogLevel } from './CognitiveCheckin'

const NM = {
  bg: '#e8eaf0',
  elevated: '6px 6px 14px #c2c8d6, -6px -6px 14px #ffffff',
  insetSm: 'inset 2px 2px 5px #c2c8d6, inset -2px -2px 5px #ffffff',
} as const

const LEVEL_CONFIG: Record<CogLevel, { icon: string; bg: string; title: string; desc: string; cta: string }> = {
  optimo: {
    icon: '🟢',
    bg: 'rgba(0,229,160,0.12)',
    title: 'Estás en modo óptimo',
    desc: 'Lección completa con todos los ejercicios y actividades.',
    cta: 'Comenzar lección completa',
  },
  moderado: {
    icon: '🟡',
    bg: 'rgba(255,186,0,0.12)',
    title: 'Modo enfocado',
    desc: 'Versión concentrada de la lección. Lo esencial, bien aprendido.',
    cta: 'Comenzar versión enfocada',
  },
  bajo: {
    icon: '🔴',
    bg: 'rgba(220,80,80,0.1)',
    title: 'Modo express',
    desc: 'Hoy descansa el cerebro. Versión de 5 minutos con lo más importante.',
    cta: 'Comenzar versión express',
  },
}

const LABELS = ['Energía', 'Concentr.', 'Estrés', 'Motivación']

interface QuestionLike {
  options: { emoji: string }[]
}

interface CognitiveResultProps {
  level: CogLevel
  scores: number[]
  questions: QuestionLike[]
  onContinue: () => void
}

export default function CognitiveResult({ level, scores, questions, onContinue }: CognitiveResultProps) {
  const cfg = LEVEL_CONFIG[level]

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
        boxShadow: '8px 8px 20px #c2c8d6, -8px -8px 20px #ffffff',
        fontFamily: "'Syne', sans-serif",
      }}>
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

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 8, marginBottom: 24 }}>
          {questions.slice(0, 4).map((q, i) => (
            <div key={i} style={{ background: NM.bg, borderRadius: 12, padding: '10px 6px', boxShadow: NM.insetSm, textAlign: 'center' }}>
              <div style={{ fontSize: 16, marginBottom: 4 }}>{q.options[scores[i] - 1]?.emoji}</div>
              <div style={{ fontSize: 8, color: '#8892b0', textTransform: 'uppercase', letterSpacing: '0.3px', fontFamily: "'Space Mono', monospace", lineHeight: 1.3 }}>
                {LABELS[i]}
              </div>
            </div>
          ))}
        </div>

        <button
          onClick={onContinue}
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
      </div>
    </div>
  )
}
