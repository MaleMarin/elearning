import { NextRequest, NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { createTicket, getTicketsForUser } from "@/lib/services/support";

export async function GET(req: NextRequest) {
  try {
    const supabase = await createServerSupabaseClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const cohortId = searchParams.get("cohortId");

    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single();

    const role = profile?.role ?? "student";

    if (role === "admin" && cohortId) {
      const { data } = await supabase
        .from("support_tickets")
        .select("*")
        .eq("cohort_id", cohortId)
        .order("created_at", { ascending: false });
      return NextResponse.json({ tickets: data ?? [] });
    }

    if (role === "mentor" && cohortId) {
      const { data } = await supabase
        .from("support_tickets")
        .select("*")
        .eq("cohort_id", cohortId)
        .order("created_at", { ascending: false });
      return NextResponse.json({ tickets: data ?? [] });
    }

    const tickets = await getTicketsForUser(user.id);
    return NextResponse.json({ tickets });
  } catch (e) {
    console.error("Tickets GET error:", e);
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Error" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const supabase = await createServerSupabaseClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const body = await req.json();
    const { category, summary, details, cohortId } = body;
    if (!category || !summary || !details) {
      return NextResponse.json(
        { error: "Faltan category, summary o details" },
        { status: 400 }
      );
    }

    const ticket = await createTicket(user.id, {
      category,
      summary,
      details,
      cohortId: cohortId ?? null,
    });
    return NextResponse.json({ ticket });
  } catch (e) {
    console.error("Tickets POST error:", e);
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Error" },
      { status: 500 }
    );
  }
}
