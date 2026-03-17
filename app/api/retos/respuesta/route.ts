/**
 * POST: guarda la respuesta del alumno a un reto por concepto.
 * Body: { conceptoId, respuesta }
 */
import { NextRequest, NextResponse } from 'next/server'
import { getAuthFromRequest } from '@/lib/firebase/auth-request'
import { getDemoMode, useFirebase } from '@/lib/env'
import { getFirebaseAdminFirestore } from '@/lib/firebase/admin'

export const dynamic = 'force-dynamic'

export async function POST(req: NextRequest) {
  if (getDemoMode()) {
    return NextResponse.json({ ok: true })
  }
  if (!useFirebase()) return NextResponse.json({ error: 'No disponible' }, { status: 501 })
  try {
    const auth = await getAuthFromRequest(req)
    const body = await req.json()
    const conceptoId = (body.conceptoId as string)?.trim()
    const respuesta = (body.respuesta as string)?.trim()
    if (!conceptoId) return NextResponse.json({ error: 'Falta conceptoId' }, { status: 400 })
    if (!respuesta) return NextResponse.json({ error: 'Falta respuesta' }, { status: 400 })
    const db = getFirebaseAdminFirestore()
    await db.collection('reto_respuestas').add({
      userId: auth.uid,
      conceptoId,
      respuesta,
      timestamp: new Date(),
      estado: 'entregado',
    })
    return NextResponse.json({ ok: true })
  } catch {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
  }
}
