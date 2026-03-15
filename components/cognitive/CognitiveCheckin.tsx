'use client'

import { useState } from 'react'
import CognitiveResult from './CognitiveResult'

const NM = {
  bg:      '#e8eaf0',
  elevated:'6px 6px 14px #c2c8d6, -6px -6px 14px #ffffff',
  elevatedLg:'8px 8px 20px #c2c8d6, -8px -8px 20px #ffffff',
  inset:   'inset 3px 3px 8px #c2c8d6, inset -3px -3px 8px #ffffff',
  insetSm: 'inset 2px 2px 5px #c2c8d6, inset -2px -2px 5px #ffffff',
} as const

export type CogLevel = 'optimo' | 'moderado' | 'bajo'

interface Question {
  id: number
  text: string
  options: { emoji: string; label: string; value: number }[]
}

export interface CognitiveCheckinProps {
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
      fetch('/api/checkin/cognitive', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ lessonId, scores: newScores, level: lvl }),
      }).catch(() => {})
    }
  }

  if (step === 'result' && level) {
    return (
      <CognitiveResult
        level={level}
        scores={scores}
        questions={QUESTIONS}
        onContinue={() => onComplete(level)}
      />
    )
  }

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

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 24 }}>
          <div>
            <p style={{ fontSize: 10, color: '#8892b0', fontFamily: "'Space Mono', monospace", textTransform: 'uppercase', letterSpacing: '1.5px', marginBottom: 4 }}>
              Check-in cognitivo
            </p>
            <p style={{ fontSize: 13, fontWeight: 700, color: '#0a0f8a' }}>{lessonTitle}</p>
          </div>
          <button onClick={onClose} style={{ background: NM.bg, border: 'none', cursor: 'pointer', width: 32, height: 32, borderRadius: 10, boxShadow: NM.elevated, color: '#8892b0', fontSize: 16, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>×</button>
        </div>

        <div style={{ display: 'flex', gap: 8, marginBottom: 28 }}>
          {QUESTIONS.map((_, i) => (
            <div key={i} style={{
              flex: 1, height: 6, borderRadius: 3,
              background: NM.bg,
              boxShadow: i <= current ? NM.inset : NM.elevated,
              transition: 'all 0.3s ease',
              overflow: 'hidden',
            }}>
              {i < current && (
                <div style={{ height: '100%', width: '100%', background: 'linear-gradient(90deg, #1428d4, #00e5a0)', borderRadius: 3 }} />
              )}
              {i === current && (
                <div style={{ height: '100%', width: selected !== null ? '100%' : '50%', background: '#1428d4', borderRadius: 3, transition: 'width 0.2s ease' }} />
              )}
            </div>
          ))}
        </div>

        <h2 style={{ fontSize: 18, fontWeight: 800, color: '#0a0f8a', marginBottom: 24, lineHeight: 1.3, letterSpacing: '-0.3px' }}>
          {q.text}
        </h2>

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
      </div>
    </div>
  )
}
