/**
 * POST: crea una pregunta en el foro (preguntas de lección por concepto).
 * Body: { content, category?, lessonId }
 */
import { NextRequest, NextResponse } from 'next/server'
import { getAuthFromRequest } from '@/lib/firebase/auth-request'
import { getDemoMode, useFirebase } from '@/lib/env'
import { getFirebaseAdminFirestore } from '@/lib/firebase/admin'
import * as questions from '@/lib/services/questions'

export const dynamic = 'force-dynamic'

async function getDisplayName(uid: string): Promise<string> {
  try {
    const db = getFirebaseAdminFirestore()
    const snap = await db.collection('profiles').doc(uid).get()
    const name = (snap.data()?.full_name as string)?.trim()
    if (name) return name
  } catch {
    // ignore
  }
  return 'Alumno'
}

export async function POST(req: NextRequest) {
  if (getDemoMode()) {
    return NextResponse.json({
      id: 'demo-forum',
      userName: 'Tú',
      question: 'Pregunta enviada (modo demo)',
      createdAt: new Date().toISOString(),
      votes: 0,
    })
  }
  if (!useFirebase()) return NextResponse.json({ error: 'No disponible' }, { status: 501 })
  try {
    const auth = await getAuthFromRequest(req)
    const body = await req.json()
    const content = (body.content as string)?.trim()
    const lessonId = (body.lessonId as string)?.trim()
    if (!content) return NextResponse.json({ error: 'Falta content' }, { status: 400 })
    if (!lessonId) return NextResponse.json({ error: 'Falta lessonId' }, { status: 400 })
    if (content.length < 10)
      return NextResponse.json({ error: 'La pregunta debe tener al menos 10 caracteres' }, { status: 400 })
    const userName = await getDisplayName(auth.uid)
    const post = await questions.createPost(lessonId, auth.uid, userName, content)
    return NextResponse.json(post)
  } catch {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
  }
}
