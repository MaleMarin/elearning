import { NextResponse } from "next/server";
import { getDemoMode } from "@/lib/env";
import { DEFAULT_QUIZ_QUESTIONS } from "@/lib/services/evaluation";

export const dynamic = "force-dynamic";

/** GET: preguntas del quiz final (por ahora las 10 de ejemplo) */
export async function GET() {
  if (getDemoMode()) {
    return NextResponse.json({ questions: DEFAULT_QUIZ_QUESTIONS });
  }
  return NextResponse.json({ questions: DEFAULT_QUIZ_QUESTIONS });
}
