import { NextResponse } from 'next/server'

export interface LeaderboardEntry {
  pos: number
  nombre: string
  puntos: number
  retos: number
  total: number
  esYo: boolean
}

const LEADERBOARD: LeaderboardEntry[] = [
  { pos: 1, nombre: 'María A. Flores', puntos: 1240, retos: 8, total: 10, esYo: true },
  { pos: 2, nombre: 'Carlos R. Méndez', puntos: 1180, retos: 7, total: 10, esYo: false },
  { pos: 3, nombre: 'Ana L. Torres', puntos: 1050, retos: 7, total: 10, esYo: false },
  { pos: 4, nombre: 'José M. García', puntos: 980, retos: 6, total: 10, esYo: false },
  { pos: 5, nombre: 'Laura P. Sánchez', puntos: 920, retos: 6, total: 10, esYo: false },
]

export async function GET() {
  return NextResponse.json({ leaderboard: LEADERBOARD })
}
