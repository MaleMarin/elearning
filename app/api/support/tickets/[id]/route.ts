import { NextRequest, NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { updateTicket } from "@/lib/services/support";
import { auditLog, getClientIp } from "@/lib/services/audit";

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createServerSupabaseClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const { id } = await params;
    const body = await req.json();
    const status = body.status as "open" | "pending" | "resolved" | undefined;

    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single();

    const role = profile?.role ?? "student";
    if (role !== "mentor" && role !== "admin") {
      return NextResponse.json({ error: "Sin permiso para actualizar tickets" }, { status: 403 });
    }

    if (!status) {
      return NextResponse.json({ error: "Falta status" }, { status: 400 });
    }

    const ticket = await updateTicket(id, { status });
    await auditLog({
      userId: user.id,
      role,
      action: "ticket.update",
      resourceType: "support_ticket",
      resourceId: id,
      payload: { status },
      ip: getClientIp(req),
    });
    return NextResponse.json({ ticket });
  } catch (e) {
    console.error("Ticket PATCH error:", e);
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Error" },
      { status: 500 }
    );
  }
}
