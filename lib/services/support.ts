import { createServerSupabaseClient } from "@/lib/supabase/server";

export type TicketStatus = "open" | "pending" | "resolved";

export async function createTicket(
  userId: string,
  data: { category: string; summary: string; details: string; cohortId?: string | null }
) {
  const supabase = await createServerSupabaseClient();
  const { data: ticket, error } = await supabase
    .from("support_tickets")
    .insert({
      user_id: userId,
      cohort_id: data.cohortId ?? null,
      category: data.category,
      summary: data.summary,
      details: data.details,
      status: "open",
    })
    .select()
    .single();
  if (error) throw new Error(error.message);
  return ticket;
}

export async function getTicketsForUser(userId: string) {
  const supabase = await createServerSupabaseClient();
  const { data, error } = await supabase
    .from("support_tickets")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });
  if (error) throw new Error(error.message);
  return data ?? [];
}

export async function getTicketsForCohort(cohortId: string) {
  const supabase = await createServerSupabaseClient();
  const { data, error } = await supabase
    .from("support_tickets")
    .select("*")
    .eq("cohort_id", cohortId)
    .order("created_at", { ascending: false });
  if (error) throw new Error(error.message);
  return data ?? [];
}

export async function updateTicket(
  ticketId: string,
  updates: { status?: TicketStatus }
) {
  const supabase = await createServerSupabaseClient();
  const { data, error } = await supabase
    .from("support_tickets")
    .update(updates)
    .eq("id", ticketId)
    .select()
    .single();
  if (error) throw new Error(error.message);
  return data;
}
