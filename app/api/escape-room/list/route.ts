/**
 * GET: listar escape rooms (para admin y listado público).
 */
import { NextResponse } from "next/server";
import * as escapeRoom from "@/lib/services/escapeRoom";

export const dynamic = "force-dynamic";

export async function GET() {
  const rooms = await escapeRoom.listEscapeRooms();
  return NextResponse.json({ rooms });
}
