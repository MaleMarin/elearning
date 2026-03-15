import { NextRequest, NextResponse } from 'next/server'
import { getAuthFromRequest } from '@/lib/firebase/auth-request'
import { getFirebaseAdminFirestore } from '@/lib/firebase/admin'

const COLLECTION = 'cognitive_checkins'

export async function POST(req: NextRequest) {
  try {
    const user = await getAuthFromRequest(req)
    const body = await req.json()
    const { lessonId, scores, level } = body as { lessonId: string; scores: number[]; level: 'optimo' | 'moderado' | 'bajo' }

    if (!lessonId || !Array.isArray(scores) || !level) {
      return NextResponse.json({ success: false, error: 'Faltan lessonId, scores o level' }, { status: 400 })
    }

    const db = getFirebaseAdminFirestore()
    await db
      .collection('users')
      .doc(user.uid)
      .collection(COLLECTION)
      .add({
        userId: user.uid,
        lessonId,
        scores,
        level,
        timestamp: new Date(),
      })

    return NextResponse.json({ success: true, level })
  } catch (e) {
    const msg = e instanceof Error ? e.message : 'Error'
    if (msg === 'No autorizado') {
      return NextResponse.json({ success: false }, { status: 401 })
    }
    return NextResponse.json({ success: false }, { status: 500 })
  }
}
