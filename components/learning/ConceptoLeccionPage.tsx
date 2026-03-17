'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

export interface Pregunta {
  id: string
  texto: string
  opciones: string[]
  correcta: number
  explicacion: string
}

export interface Seccion {
  titulo: string
  texto: string
  ejemplo?: string | null
  puntosClave?: string[]
}

export interface ConceptoData {
  id: string
  titulo: string
  subtitulo: string
  familia: 'ciberseguridad' | 'datos-abiertos' | 'innovacion'
  duracion: string
  contenido: {
    introduccion: string
    secciones: Seccion[]
    cierre: string
  }
  bibliografia: {
    titulo: string
    autor: string
    año: string
    url?: string
    tipo: 'libro' | 'ley' | 'articulo' | 'guia' | string
  }[]
  quiz: Pregunta[]
  reto: {
    titulo: string
    contexto: string
    problema: string
    entregable: string
    ejemplo_respuesta: string
  }
}

const FAMILIA_COLORES = {
  ciberseguridad: { bg: '#1428d4', light: 'rgba(20,40,212,0.08)', text: '#1428d4' },
  'datos-abiertos': { bg: '#006289', light: 'rgba(0,98,137,0.08)', text: '#006289' },
  innovacion: { bg: '#533ab7', light: 'rgba(83,58,183,0.08)', text: '#533ab7' },
}

export function ConceptoLeccionPage({ data }: { data: ConceptoData }) {
  const router = useRouter()
  const [tabActiva, setTabActiva] = useState<'leccion' | 'quiz' | 'reto' | 'biblio'>('leccion')
  const [respuestasQuiz, setRespuestasQuiz] = useState<Record<string, number>>({})
  const [quizEnviado, setQuizEnviado] = useState(false)
  const [preguntaForo, setPreguntaForo] = useState('')
  const [foroEnviado, setForoEnviado] = useState(false)
  const [retoPregunta, setRetoPregunta] = useState('')
  const [retoEnviado, setRetoEnviado] = useState(false)

  const colores = FAMILIA_COLORES[data.familia]
  const puntajeQuiz = quizEnviado
    ? data.quiz.filter((p) => respuestasQuiz[p.id] === p.correcta).length
    : 0

  const enviarPreguntaForo = async () => {
    if (!preguntaForo.trim()) return
    await fetch('/api/forum/posts', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({
        content: `[${data.titulo}] ${preguntaForo}`,
        category: 'pregunta',
        lessonId: data.id,
      }),
    })
    setForoEnviado(true)
    setPreguntaForo('')
  }

  const enviarReto = async () => {
    if (!retoPregunta.trim()) return
    await fetch('/api/retos/respuesta', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({
        conceptoId: data.id,
        respuesta: retoPregunta,
      }),
    })
    setRetoEnviado(true)
  }

  return (
    <div
      style={{
        flex: 1,
        padding: '20px',
        background: '#e8eaf0',
        minHeight: '100vh',
        fontFamily: 'var(--font-heading)',
      }}
    >
      {/* HERO DEL CONCEPTO */}
      <div
        style={{
          background: `linear-gradient(135deg, ${colores.bg}, ${colores.bg}cc)`,
          borderRadius: 20,
          padding: '28px 32px',
          marginBottom: 20,
          boxShadow: '7px 7px 18px rgba(0,0,0,0.2), -4px -4px 12px rgba(255,255,255,0.5)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
        }}
      >
        <div>
          <p
            style={{
              fontSize: 10,
              color: 'rgba(255,255,255,0.6)',
              fontFamily: "'Space Mono', monospace",
              textTransform: 'uppercase',
              letterSpacing: '2px',
              marginBottom: 8,
            }}
          >
            {data.familia.replace('-', ' ')} · {data.duracion}
          </p>
          <h1 style={{ fontSize: 26, fontWeight: 800, color: 'white', letterSpacing: '-0.5px', marginBottom: 8 }}>
            {data.titulo}
          </h1>
          <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.75)', lineHeight: 1.6, fontFamily: 'var(--font-body)' }}>
            {data.subtitulo}
          </p>
        </div>
        <button
          type="button"
          onClick={() => router.push('/conocimiento')}
          style={{
            padding: '8px 16px',
            borderRadius: 50,
            border: '1.5px solid rgba(255,255,255,0.4)',
            background: 'transparent',
            color: 'white',
            cursor: 'pointer',
            fontFamily: 'var(--font-heading)',
            fontSize: 12,
            fontWeight: 600,
            whiteSpace: 'nowrap',
            flexShrink: 0,
          }}
        >
          ← Volver al mapa
        </button>
      </div>

      {/* TABS */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 20, flexWrap: 'wrap' }}>
        {[
          { id: 'leccion', label: 'Lección', icon: 'book' },
          { id: 'quiz', label: `Quiz (${data.quiz.length} preguntas)`, icon: 'quiz' },
          { id: 'reto', label: 'Reto práctico', icon: 'target' },
          { id: 'biblio', label: 'Bibliografía', icon: 'biblio' },
        ].map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setTabActiva(tab.id as 'leccion' | 'quiz' | 'reto' | 'biblio')}
            style={{
              padding: '9px 18px',
              borderRadius: 50,
              border: 'none',
              cursor: 'pointer',
              fontFamily: 'var(--font-heading)',
              fontSize: 13,
              fontWeight: 600,
              background: tabActiva === tab.id ? `linear-gradient(135deg, ${colores.bg}, ${colores.bg}bb)` : '#e8eaf0',
              color: tabActiva === tab.id ? 'white' : '#4a5580',
              boxShadow:
                tabActiva === tab.id ? '4px 4px 10px rgba(0,0,0,0.2)' : '4px 4px 9px #c2c8d6, -4px -4px 9px #ffffff',
              transition: 'all 0.2s ease',
              display: 'inline-flex',
              alignItems: 'center',
              gap: 8,
            }}
          >
            {tab.icon === 'book' && (
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" />
                <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" />
              </svg>
            )}
            {tab.icon === 'quiz' && (
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                <path d="M9 11l3 3L22 4" />
                <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" />
              </svg>
            )}
            {tab.icon === 'target' && (
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                <circle cx="12" cy="12" r="10" />
                <circle cx="12" cy="12" r="6" />
                <circle cx="12" cy="12" r="2" />
              </svg>
            )}
            {tab.icon === 'biblio' && (
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
                <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
              </svg>
            )}
            {tab.label}
          </button>
        ))}
      </div>

      {/* TAB: LECCIÓN */}
      {tabActiva === 'leccion' && (
        <div>
          <div
            style={{
              background: '#e8eaf0',
              borderRadius: 18,
              padding: 24,
              marginBottom: 16,
              boxShadow: '6px 6px 14px #c2c8d6, -6px -6px 14px #ffffff',
            }}
          >
            <p style={{ fontSize: 15, color: '#0a0f8a', lineHeight: 1.8, fontFamily: 'var(--font-body)' }}>
              {data.contenido.introduccion}
            </p>
          </div>

          {data.contenido.secciones.map((sec, i) => (
            <div
              key={i}
              style={{
                background: '#e8eaf0',
                borderRadius: 18,
                padding: 24,
                marginBottom: 16,
                boxShadow: '6px 6px 14px #c2c8d6, -6px -6px 14px #ffffff',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 14 }}>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flexShrink: 0 }}>
                  <div
                    style={{
                      width: 32,
                      height: 32,
                      borderRadius: '50%',
                      background: colores.light,
                      border: `2px solid ${colores.text}30`,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: 13,
                      fontWeight: 800,
                      color: colores.text,
                      fontFamily: "'Space Mono', monospace",
                    }}
                  >
                    {i + 1}
                  </div>
                  <p
                    style={{
                      fontSize: 8,
                      color: '#8892b0',
                      fontFamily: "'Space Mono', monospace",
                      textAlign: 'center',
                      marginTop: 2,
                    }}
                  >
                    de {data.contenido.secciones.length}
                  </p>
                </div>
                <h2 style={{ fontSize: 17, fontWeight: 800, color: '#0a0f8a', letterSpacing: '-0.3px' }}>
                  {sec.titulo}
                </h2>
              </div>
              <p
                style={{
                  fontSize: 14,
                  color: '#4a5580',
                  lineHeight: 1.8,
                  fontFamily: 'var(--font-body)',
                  marginBottom: sec.ejemplo || sec.puntosClave?.length ? 16 : 0,
                }}
              >
                {sec.texto}
              </p>
              {sec.ejemplo ? (
                <div
                  style={{
                    marginTop: 16,
                    background: '#e8eaf0',
                    borderRadius: '0 10px 10px 0',
                    padding: '14px 18px',
                    boxShadow: 'inset 2px 2px 5px #c2c8d6, inset -2px -2px 5px #ffffff',
                    borderLeft: `3px solid ${colores.text}`,
                  }}
                >
                  <p
                    style={{
                      fontSize: 11,
                      fontWeight: 700,
                      color: colores.text,
                      fontFamily: "'Space Mono', monospace",
                      textTransform: 'uppercase',
                      letterSpacing: '1px',
                      marginBottom: 6,
                    }}
                  >
                    Ejemplo en gobierno mexicano
                  </p>
                  <p style={{ fontSize: 13, color: '#0a0f8a', lineHeight: 1.7, fontFamily: 'var(--font-body)' }}>
                    {sec.ejemplo}
                  </p>
                </div>
              ) : sec.puntosClave?.length ? (
                <div
                  style={{
                    marginTop: 16,
                    background: '#e8eaf0',
                    borderRadius: 12,
                    padding: '14px 18px',
                    boxShadow: 'inset 2px 2px 5px #c2c8d6, inset -2px -2px 5px #ffffff',
                  }}
                >
                  <p
                    style={{
                      fontSize: 11,
                      fontWeight: 700,
                      color: '#8892b0',
                      fontFamily: "'Space Mono', monospace",
                      textTransform: 'uppercase',
                      letterSpacing: '1px',
                      marginBottom: 10,
                    }}
                  >
                    Puntos clave
                  </p>
                  {sec.puntosClave.map((punto, k) => (
                    <div key={k} style={{ display: 'flex', gap: 10, marginBottom: 8 }}>
                      <div
                        style={{
                          width: 6,
                          height: 6,
                          borderRadius: '50%',
                          flexShrink: 0,
                          background: colores.text,
                          marginTop: 6,
                        }}
                      />
                      <p style={{ fontSize: 13, color: '#4a5580', lineHeight: 1.6, fontFamily: 'var(--font-body)' }}>
                        {punto}
                      </p>
                    </div>
                  ))}
                </div>
              ) : null}
            </div>
          ))}

          <div
            style={{
              background: '#e8eaf0',
              borderRadius: 18,
              padding: 24,
              marginBottom: 16,
              boxShadow: '6px 6px 14px #c2c8d6, -6px -6px 14px #ffffff',
            }}
          >
            <p
              style={{
                fontSize: 14,
                color: '#4a5580',
                lineHeight: 1.8,
                fontFamily: 'var(--font-body)',
                marginBottom: 20,
              }}
            >
              {data.contenido.cierre}
            </p>

            <div style={{ borderTop: '1px solid rgba(194,200,214,0.4)', paddingTop: 20 }}>
              <p style={{ fontSize: 13, fontWeight: 700, color: '#0a0f8a', marginBottom: 10 }}>
                ¿Tienes una pregunta sobre este tema? Envíala al foro del grupo
              </p>
              {foroEnviado ? (
                <div
                  style={{
                    background: 'rgba(0,184,125,0.1)',
                    borderRadius: 12,
                    padding: '12px 16px',
                    color: '#00b87d',
                    fontSize: 13,
                    fontWeight: 600,
                  }}
                >
                  ✓ Tu pregunta fue enviada al foro. Tu grupo podrá responderla.
                </div>
              ) : (
                <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                  <input
                    value={preguntaForo}
                    onChange={(e) => setPreguntaForo(e.target.value)}
                    placeholder="Escribe tu pregunta sobre este concepto..."
                    style={{
                      flex: 1,
                      minWidth: 200,
                      padding: '11px 16px',
                      borderRadius: 12,
                      border: 'none',
                      background: '#e8eaf0',
                      outline: 'none',
                      fontSize: 13,
                      color: '#0a0f8a',
                      fontFamily: 'var(--font-body)',
                      boxShadow: 'inset 3px 3px 7px #c2c8d6, inset -3px -3px 7px #ffffff',
                    }}
                  />
                  <button
                    type="button"
                    onClick={enviarPreguntaForo}
                    style={{
                      padding: '11px 20px',
                      borderRadius: 12,
                      border: 'none',
                      cursor: 'pointer',
                      fontFamily: 'var(--font-heading)',
                      fontSize: 13,
                      fontWeight: 700,
                      background: `linear-gradient(135deg, ${colores.bg}, ${colores.bg}bb)`,
                      color: 'white',
                      boxShadow: '4px 4px 10px rgba(0,0,0,0.2)',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    Enviar al foro →
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* TAB: QUIZ */}
      {tabActiva === 'quiz' && (
        <div>
          {!quizEnviado ? (
            <>
              {data.quiz.map((pregunta, i) => (
                <div
                  key={pregunta.id}
                  style={{
                    background: '#e8eaf0',
                    borderRadius: 18,
                    padding: 24,
                    marginBottom: 14,
                    boxShadow: '6px 6px 14px #c2c8d6, -6px -6px 14px #ffffff',
                  }}
                >
                  <p style={{ fontSize: 15, fontWeight: 700, color: '#0a0f8a', marginBottom: 16, lineHeight: 1.5 }}>
                    <span
                      style={{
                        color: colores.text,
                        fontFamily: "'Space Mono', monospace",
                        fontSize: 12,
                      }}
                    >
                      {i + 1}.{' '}
                    </span>
                    {pregunta.texto}
                  </p>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                    {pregunta.opciones.map((opcion, j) => (
                      <button
                        key={j}
                        type="button"
                        onClick={() => setRespuestasQuiz((r) => ({ ...r, [pregunta.id]: j }))}
                        style={{
                          padding: '12px 16px',
                          borderRadius: 12,
                          border: 'none',
                          cursor: 'pointer',
                          textAlign: 'left',
                          fontFamily: 'var(--font-body)',
                          fontSize: 14,
                          background: '#e8eaf0',
                          color: respuestasQuiz[pregunta.id] === j ? colores.text : '#4a5580',
                          fontWeight: respuestasQuiz[pregunta.id] === j ? 700 : 400,
                          boxShadow:
                            respuestasQuiz[pregunta.id] === j
                              ? 'inset 3px 3px 7px #c2c8d6, inset -3px -3px 7px #ffffff'
                              : '3px 3px 8px #c2c8d6, -3px -3px 8px #ffffff',
                          borderLeft:
                            respuestasQuiz[pregunta.id] === j ? `3px solid ${colores.text}` : '3px solid transparent',
                          transition: 'all 0.15s ease',
                        }}
                      >
                        {String.fromCharCode(65 + j)}) {opcion}
                      </button>
                    ))}
                  </div>
                </div>
              ))}
              <button
                type="button"
                onClick={() => setQuizEnviado(true)}
                disabled={Object.keys(respuestasQuiz).length < data.quiz.length}
                style={{
                  width: '100%',
                  padding: 16,
                  borderRadius: 16,
                  border: 'none',
                  cursor: Object.keys(respuestasQuiz).length < data.quiz.length ? 'not-allowed' : 'pointer',
                  fontFamily: 'var(--font-heading)',
                  fontSize: 15,
                  fontWeight: 800,
                  background:
                    Object.keys(respuestasQuiz).length < data.quiz.length
                      ? '#e8eaf0'
                      : `linear-gradient(135deg, ${colores.bg}, ${colores.bg}bb)`,
                  color: Object.keys(respuestasQuiz).length < data.quiz.length ? '#8892b0' : 'white',
                  boxShadow:
                    Object.keys(respuestasQuiz).length < data.quiz.length
                      ? 'inset 3px 3px 7px #c2c8d6, inset -3px -3px 7px #ffffff'
                      : '5px 5px 14px rgba(0,0,0,0.2)',
                }}
              >
                {Object.keys(respuestasQuiz).length < data.quiz.length
                  ? `Responde ${data.quiz.length - Object.keys(respuestasQuiz).length} preguntas más`
                  : 'Ver mis resultados →'}
              </button>
            </>
          ) : (
            <div>
              <div
                style={{
                  background: '#e8eaf0',
                  borderRadius: 20,
                  padding: 28,
                  marginBottom: 20,
                  textAlign: 'center',
                  boxShadow: '6px 6px 14px #c2c8d6, -6px -6px 14px #ffffff',
                }}
              >
                <div
                  style={{
                    width: 80,
                    height: 80,
                    borderRadius: '50%',
                    margin: '0 auto 16px',
                    background: puntajeQuiz >= 4 ? 'rgba(0,184,125,0.15)' : 'rgba(200,144,0,0.15)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <span
                    style={{
                      fontSize: 32,
                      fontWeight: 800,
                      color: puntajeQuiz >= 4 ? '#00b87d' : '#c89000',
                      fontFamily: "'Space Mono', monospace",
                    }}
                  >
                    {puntajeQuiz}/{data.quiz.length}
                  </span>
                </div>
                <h3 style={{ fontSize: 18, fontWeight: 800, color: '#0a0f8a', marginBottom: 6 }}>
                  {puntajeQuiz === data.quiz.length
                    ? '¡Perfecto! Dominas este concepto.'
                    : puntajeQuiz >= 4
                      ? 'Muy bien. Sólido conocimiento.'
                      : puntajeQuiz >= 3
                        ? 'Buen intento. Repasa las secciones marcadas.'
                        : 'Necesitas repasar esta lección.'}
                </h3>
              </div>

              {data.quiz.map((p) => {
                const correcta = respuestasQuiz[p.id] === p.correcta
                return (
                  <div
                    key={p.id}
                    style={{
                      background: '#e8eaf0',
                      borderRadius: 16,
                      padding: 20,
                      marginBottom: 12,
                      boxShadow: '5px 5px 12px #c2c8d6, -5px -5px 12px #ffffff',
                      borderLeft: `3px solid ${correcta ? '#00b87d' : '#d84040'}`,
                    }}
                  >
                    <div style={{ display: 'flex', gap: 10, marginBottom: 10 }}>
                      <span style={{ fontSize: 16 }}>
                        {correcta ? (
                          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#00b87d" strokeWidth="2">
                            <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                            <polyline points="22 4 12 14.01 9 11.01" />
                          </svg>
                        ) : (
                          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#d84040" strokeWidth="2">
                            <circle cx="12" cy="12" r="10" />
                            <line x1="15" y1="9" x2="9" y2="15" />
                            <line x1="9" y1="9" x2="15" y2="15" />
                          </svg>
                        )}
                      </span>
                      <p style={{ fontSize: 14, fontWeight: 600, color: '#0a0f8a' }}>{p.texto}</p>
                    </div>
                    <p
                      style={{
                        fontSize: 13,
                        color: '#4a5580',
                        lineHeight: 1.6,
                        fontFamily: 'var(--font-body)',
                        padding: '10px 14px',
                        borderRadius: 10,
                        background: '#e8eaf0',
                        boxShadow: 'inset 2px 2px 5px #c2c8d6, inset -2px -2px 5px #ffffff',
                      }}
                    >
                      <strong style={{ color: correcta ? '#00b87d' : '#d84040' }}>
                        {correcta ? 'Correcto.' : `Respuesta correcta: ${p.opciones[p.correcta]}.`}
                      </strong>{' '}
                      {p.explicacion}
                    </p>
                  </div>
                )
              })}

              <button
                type="button"
                onClick={() => {
                  setQuizEnviado(false)
                  setRespuestasQuiz({})
                }}
                style={{
                  width: '100%',
                  padding: 14,
                  borderRadius: 14,
                  border: 'none',
                  cursor: 'pointer',
                  fontFamily: 'var(--font-heading)',
                  fontSize: 14,
                  fontWeight: 700,
                  background: '#e8eaf0',
                  color: '#4a5580',
                  boxShadow: '4px 4px 10px #c2c8d6, -4px -4px 10px #ffffff',
                }}
              >
                ↺ Intentar de nuevo
              </button>
            </div>
          )}
        </div>
      )}

      {/* TAB: RETO PRÁCTICO */}
      {tabActiva === 'reto' && (
        <div>
          <div
            style={{
              background: '#e8eaf0',
              borderRadius: 18,
              padding: 24,
              marginBottom: 16,
              boxShadow: '6px 6px 14px #c2c8d6, -6px -6px 14px #ffffff',
            }}
          >
            <p
              style={{
                fontSize: 10,
                color: colores.text,
                fontFamily: "'Space Mono', monospace",
                textTransform: 'uppercase',
                letterSpacing: '2px',
                marginBottom: 8,
              }}
            >
              Reto práctico para estados mexicanos
            </p>
            <h2 style={{ fontSize: 18, fontWeight: 800, color: '#0a0f8a', marginBottom: 12 }}>
              {data.reto.titulo}
            </h2>

            <div
              style={{
                background: '#e8eaf0',
                borderRadius: 12,
                padding: '14px 18px',
                marginBottom: 16,
                boxShadow: 'inset 3px 3px 7px #c2c8d6, inset -3px -3px 7px #ffffff',
              }}
            >
              <p
                style={{
                  fontSize: 11,
                  fontWeight: 700,
                  color: '#8892b0',
                  fontFamily: "'Space Mono', monospace",
                  textTransform: 'uppercase',
                  letterSpacing: '1px',
                  marginBottom: 6,
                }}
              >
                Contexto
              </p>
              <p style={{ fontSize: 14, color: '#4a5580', lineHeight: 1.7, fontFamily: 'var(--font-body)' }}>
                {data.reto.contexto}
              </p>
            </div>

            <div
              style={{
                background: colores.light,
                borderRadius: 12,
                padding: '14px 18px',
                marginBottom: 16,
                border: `1px solid ${colores.text}20`,
              }}
            >
              <p
                style={{
                  fontSize: 11,
                  fontWeight: 700,
                  color: colores.text,
                  fontFamily: "'Space Mono', monospace",
                  textTransform: 'uppercase',
                  letterSpacing: '1px',
                  marginBottom: 6,
                }}
              >
                El problema
              </p>
              <p
                style={{
                  fontSize: 14,
                  color: '#0a0f8a',
                  lineHeight: 1.7,
                  fontWeight: 600,
                  fontFamily: 'var(--font-body)',
                }}
              >
                {data.reto.problema}
              </p>
            </div>

            <p style={{ fontSize: 13, color: '#4a5580', marginBottom: 6 }}>
              <strong style={{ color: '#0a0f8a' }}>Tu entregable:</strong> {data.reto.entregable}
            </p>

            <div
              style={{
                background: '#e8eaf0',
                borderRadius: 12,
                padding: '14px 18px',
                marginBottom: 20,
                boxShadow: 'inset 2px 2px 5px #c2c8d6, inset -2px -2px 5px #ffffff',
              }}
            >
              <p
                style={{
                  fontSize: 11,
                  fontWeight: 700,
                  color: '#8892b0',
                  fontFamily: "'Space Mono', monospace",
                  textTransform: 'uppercase',
                  letterSpacing: '1px',
                  marginBottom: 6,
                }}
              >
                Ejemplo orientador (no copies)
              </p>
              <p
                style={{
                  fontSize: 13,
                  color: '#4a5580',
                  lineHeight: 1.7,
                  fontFamily: 'var(--font-body)',
                  fontStyle: 'italic',
                }}
              >
                {data.reto.ejemplo_respuesta}
              </p>
            </div>

            {!retoEnviado ? (
              <div>
                <p style={{ fontSize: 13, fontWeight: 700, color: '#0a0f8a', marginBottom: 10 }}>
                  Tu propuesta de solución:
                </p>
                <textarea
                  value={retoPregunta}
                  onChange={(e) => setRetoPregunta(e.target.value)}
                  placeholder="Describe tu propuesta considerando el contexto de tu institución o estado..."
                  rows={6}
                  style={{
                    width: '100%',
                    padding: '14px 16px',
                    borderRadius: 14,
                    border: 'none',
                    background: '#e8eaf0',
                    outline: 'none',
                    fontSize: 14,
                    color: '#0a0f8a',
                    fontFamily: 'var(--font-body)',
                    boxShadow: 'inset 4px 4px 10px #c2c8d6, inset -4px -4px 10px #ffffff',
                    resize: 'vertical',
                    lineHeight: 1.7,
                    marginBottom: 12,
                    boxSizing: 'border-box',
                  }}
                />
                <button
                  type="button"
                  onClick={enviarReto}
                  disabled={retoPregunta.trim().length < 50}
                  style={{
                    width: '100%',
                    padding: 14,
                    borderRadius: 14,
                    border: 'none',
                    cursor: retoPregunta.trim().length < 50 ? 'not-allowed' : 'pointer',
                    fontFamily: 'var(--font-heading)',
                    fontSize: 14,
                    fontWeight: 800,
                    background:
                      retoPregunta.trim().length < 50 ? '#e8eaf0' : `linear-gradient(135deg, ${colores.bg}, ${colores.bg}bb)`,
                    color: retoPregunta.trim().length < 50 ? '#8892b0' : 'white',
                    boxShadow:
                      retoPregunta.trim().length < 50
                        ? 'inset 3px 3px 7px #c2c8d6'
                        : '5px 5px 14px rgba(0,0,0,0.2)',
                  }}
                >
                  {retoPregunta.trim().length < 50
                    ? `Escribe al menos 50 caracteres (${50 - retoPregunta.trim().length} más)`
                    : 'Entregar solución →'}
                </button>
              </div>
            ) : (
              <div
                style={{
                  background: 'rgba(0,184,125,0.1)',
                  borderRadius: 14,
                  padding: 20,
                  textAlign: 'center',
                }}
              >
                <p style={{ fontSize: 24, marginBottom: 8 }}>
                  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#00b87d" strokeWidth="2">
                    <circle cx="12" cy="12" r="10" />
                    <circle cx="12" cy="12" r="6" />
                    <circle cx="12" cy="12" r="2" />
                  </svg>
                </p>
                <p style={{ fontSize: 15, fontWeight: 700, color: '#00b87d', marginBottom: 4 }}>
                  ¡Reto entregado!
                </p>
                <p style={{ fontSize: 13, color: '#4a5580', fontFamily: 'var(--font-body)' }}>
                  Tu facilitador revisará tu propuesta y dará retroalimentación.
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB: BIBLIOGRAFÍA */}
      {tabActiva === 'biblio' && (
        <div>
          {data.bibliografia.map((ref, i) => {
            const TIPO_CONFIG: Record<string, { color: string; label: string }> = {
              libro: { color: '#1428d4', label: 'Libro' },
              ley: { color: '#d84040', label: 'Ley / Normativa' },
              articulo: { color: '#00b87d', label: 'Artículo' },
              guia: { color: '#c89000', label: 'Guía técnica' },
            }
            const tipo = TIPO_CONFIG[ref.tipo] ?? { color: '#8892b0', label: ref.tipo }
            return (
              <div
                key={i}
                style={{
                  background: '#e8eaf0',
                  borderRadius: 16,
                  padding: '18px 20px',
                  marginBottom: 10,
                  boxShadow: '5px 5px 12px #c2c8d6, -5px -5px 12px #ffffff',
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: 14,
                }}
              >
                <div
                  style={{
                    width: 36,
                    height: 36,
                    borderRadius: 10,
                    flexShrink: 0,
                    background: `${tipo.color}12`,
                    border: `1.5px solid ${tipo.color}30`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke={tipo.color}
                    strokeWidth="2"
                    strokeLinecap="round"
                  >
                    {ref.tipo === 'libro' || ref.tipo === 'guia' ? (
                      <>
                        <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
                        <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
                      </>
                    ) : ref.tipo === 'ley' ? (
                      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                    ) : (
                      <>
                        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                        <polyline points="14 2 14 8 20 8" />
                      </>
                    )}
                  </svg>
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                    <span
                      style={{
                        fontSize: 9,
                        fontWeight: 700,
                        color: tipo.color,
                        fontFamily: "'Space Mono', monospace",
                        textTransform: 'uppercase',
                        letterSpacing: '1px',
                        background: `${tipo.color}12`,
                        padding: '2px 8px',
                        borderRadius: 20,
                      }}
                    >
                      {tipo.label}
                    </span>
                    <span style={{ fontSize: 11, color: '#8892b0', fontFamily: "'Space Mono', monospace" }}>
                      {ref.año}
                    </span>
                  </div>
                  <p style={{ fontSize: 14, fontWeight: 700, color: '#0a0f8a', marginBottom: 2 }}>{ref.titulo}</p>
                  <p style={{ fontSize: 12, color: '#8892b0', fontFamily: 'var(--font-body)' }}>{ref.autor}</p>
                  {ref.url && (
                    <a
                      href={ref.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{
                        fontSize: 12,
                        color: colores.text,
                        marginTop: 4,
                        display: 'inline-block',
                        textDecoration: 'none',
                        fontWeight: 600,
                      }}
                    >
                      Ver en línea →
                    </a>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
