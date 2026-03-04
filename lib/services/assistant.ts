import { createServerSupabaseClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import type { AssistantMode } from "@/lib/types/database";

export async function getOrCreateThread(
  mode: AssistantMode,
  userId: string,
  options: { cohortId?: string | null; courseId?: string | null } = {}
) {
  const supabase = await createServerSupabaseClient();
  const { data: existing } = await supabase
    .from("assistant_threads")
    .select("id")
    .eq("mode", mode)
    .eq("user_id", userId)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (existing) return existing.id;

  const { data: created, error } = await supabase
    .from("assistant_threads")
    .insert({
      mode,
      user_id: userId,
      cohort_id: options.cohortId ?? null,
      course_id: options.courseId ?? null,
    })
    .select("id")
    .single();

  if (error) throw new Error(error.message);
  return created.id;
}

export async function getThreadMessages(threadId: string) {
  const supabase = await createServerSupabaseClient();
  const { data, error } = await supabase
    .from("assistant_messages")
    .select("id, role, content, metadata, created_at")
    .eq("thread_id", threadId)
    .order("created_at", { ascending: true });
  if (error) throw new Error(error.message);
  return data ?? [];
}

export async function addMessage(
  threadId: string,
  role: "user" | "assistant" | "system",
  content: string,
  metadata: Record<string, unknown> = {}
) {
  const supabase = await createServerSupabaseClient();
  const { data, error } = await supabase
    .from("assistant_messages")
    .insert({ thread_id: threadId, role, content, metadata })
    .select("id, created_at")
    .single();
  if (error) throw new Error(error.message);
  return data;
}

export async function createNotification(
  userId: string,
  type: string,
  title: string,
  body: string,
  link: string | null = null
) {
  const admin = createAdminClient();
  const { error } = await admin.from("notifications").insert({
    user_id: userId,
    type,
    title,
    body,
    link,
  });
  if (error) throw new Error(error.message);
}
