import { NextRequest, NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase/server";

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

    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single();
    const role = profile?.role ?? "student";
    if (role !== "mentor" && role !== "admin") {
      return NextResponse.json({ error: "Solo mentor o admin" }, { status: 403 });
    }

    const { id } = await params;
    const body = await req.json();
    const status = body.status as "queued" | "reviewed" | "dismissed" | "actioned" | undefined;
    if (!status) {
      return NextResponse.json({ error: "Falta status" }, { status: 400 });
    }

    const { data, error } = await supabase
      .from("community_flags")
      .update({ status })
      .eq("id", id)
      .select()
      .single();
    if (error) throw new Error(error.message);
    return NextResponse.json({ flag: data });
  } catch (e) {
    console.error("Flag PATCH error:", e);
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Error" },
      { status: 500 }
    );
  }
}
