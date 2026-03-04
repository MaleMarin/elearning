import { createServerSupabaseClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

export async function createFlag(
  postId: string,
  flaggedBy: string,
  reason: string,
  severity: number
) {
  const supabase = await createServerSupabaseClient();
  const { data, error } = await supabase
    .from("community_flags")
    .insert({
      post_id: postId,
      flagged_by: flaggedBy,
      reason,
      severity,
      status: "queued",
    })
    .select()
    .single();
  if (error) throw new Error(error.message);
  return data;
}

export async function getFlagsForCohort(cohortId: string) {
  const supabase = await createServerSupabaseClient();
  const { data: postIds } = await supabase
    .from("community_posts")
    .select("id")
    .eq("cohort_id", cohortId);
  const ids = (postIds ?? []).map((p) => p.id);
  if (ids.length === 0) return [];
  const { data, error } = await supabase
    .from("community_flags")
    .select("id, post_id, flagged_by, reason, severity, status, created_at")
    .in("post_id", ids)
    .order("created_at", { ascending: false });
  if (error) throw new Error(error.message);
  return data ?? [];
}

export async function getUnansweredPosts(cohortId: string, olderThanHours: number) {
  const supabase = await createServerSupabaseClient();
  const since = new Date(Date.now() - olderThanHours * 60 * 60 * 1000).toISOString();
  const { data: posts, error } = await supabase
    .from("community_posts")
    .select("id, title, body, created_at, user_id")
    .eq("cohort_id", cohortId)
    .lt("created_at", since);
  if (error) throw new Error(error.message);

  const withComments = await Promise.all(
    (posts ?? []).map(async (post) => {
      const { data: comments } = await supabase
        .from("community_comments")
        .select("user_id")
        .eq("post_id", post.id);
      return { ...post, comments: comments ?? [] };
    })
  );

  const mentorIds = await getMentorIdsForCohort(cohortId);
  const unanswered = withComments.filter((p) => {
    const hasMentorReply = p.comments.some((c: { user_id: string }) => mentorIds.includes(c.user_id));
    const hasAnyReply = p.comments.length > 0;
    return !hasMentorReply && (p.comments.length === 0 || hasAnyReply);
  });
  return unanswered;
}

async function getMentorIdsForCohort(cohortId: string): Promise<string[]> {
  const supabase = await createServerSupabaseClient();
  const { data } = await supabase
    .from("cohort_members")
    .select("user_id")
    .eq("cohort_id", cohortId)
    .eq("role", "mentor");
  return (data ?? []).map((r) => r.user_id);
}

export async function createDigest(cohortId: string, content: string) {
  const admin = createAdminClient();
  const { data, error } = await admin
    .from("weekly_digests")
    .insert({ cohort_id: cohortId, content })
    .select()
    .single();
  if (error) throw new Error(error.message);
  return data;
}

export async function notifyMentorsUnanswered(
  cohortId: string,
  postSummaries: string[]
) {
  const admin = createAdminClient();
  const { data: mentors } = await admin
    .from("cohort_members")
    .select("user_id")
    .eq("cohort_id", cohortId)
    .eq("role", "mentor");
  if (!mentors?.length) return;
  const body = `Hay posts sin respuesta o sin respuesta del mentor:\n\n${postSummaries.join("\n")}`;
  for (const m of mentors) {
    await admin.from("notifications").insert({
      user_id: m.user_id,
      type: "unanswered_posts",
      title: "Posts sin respuesta",
      body,
      link: "/comunidad",
    });
  }
}
