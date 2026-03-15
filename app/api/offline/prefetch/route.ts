import { NextResponse } from 'next/server'

/**
 * GET /api/offline/prefetch
 * Devuelve URLs de las próximas lecciones para que el cliente (o SW) las cachee.
 * El cliente puede llamar a esta ruta cuando hay conexión para pre-descargar contenido.
 */
export async function GET() {
  // TODO: obtener del curso del alumno las próximas 3 lecciones desde Firebase/Supabase
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3001'
  const urls: string[] = [
    `${baseUrl}/api/curso/lecciones/lec-1`,
    `${baseUrl}/api/curso/lecciones/lec-2`,
    `${baseUrl}/api/curso/lecciones/lec-3`,
  ]
  return NextResponse.json({ urls })
}
