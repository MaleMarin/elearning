import { createServerSupabaseClient } from "@/lib/supabase/server";
import type { PublishStatus } from "@/lib/types/content";

export async function ensureContentEditor() {
  const supabase = await createServerSupabaseClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("No autorizado");
  const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).single();
  const role = profile?.role ?? "student";
  if (role !== "admin" && role !== "mentor") throw new Error("Solo admin o mentor");
  return { user, role };
}

export async function getEditableCourses() {
  const { role } = await ensureContentEditor();
  const supabase = await createServerSupabaseClient();
  if (role === "admin") {
    const { data, error } = await supabase
      .from("courses")
      .select("id, title, status, created_at, updated_at")
      .order("updated_at", { ascending: false });
    if (error) throw new Error(error.message);
    return data ?? [];
  }
  const { data: members } = await supabase
    .from("cohort_members")
    .select("cohort_id")
    .eq("role", "mentor");
  const cohortIds = (members ?? []).map((m) => m.cohort_id);
  if (cohortIds.length === 0) return [];
  const { data: links } = await supabase
    .from("cohort_courses")
    .select("course_id")
    .in("cohort_id", cohortIds);
  const courseIds = Array.from(new Set((links ?? []).map((l) => l.course_id)));
  if (courseIds.length === 0) return [];
  const { data, error } = await supabase
    .from("courses")
    .select("id, title, status, created_at, updated_at")
    .in("id", courseIds)
    .order("updated_at", { ascending: false });
  if (error) throw new Error(error.message);
  return data ?? [];
}

export async function getCourse(courseId: string) {
  const supabase = await createServerSupabaseClient();
  const { data, error } = await supabase
    .from("courses")
    .select("*")
    .eq("id", courseId)
    .single();
  if (error) throw new Error(error.message);
  return data;
}

export async function createCourse(title: string, status: PublishStatus = "draft") {
  const supabase = await createServerSupabaseClient();
  const { data, error } = await supabase
    .from("courses")
    .insert({ title, status })
    .select()
    .single();
  if (error) throw new Error(error.message);
  return data;
}

export async function updateCourse(
  courseId: string,
  updates: { title?: string; status?: PublishStatus }
) {
  const supabase = await createServerSupabaseClient();
  const { data, error } = await supabase
    .from("courses")
    .update(updates)
    .eq("id", courseId)
    .select()
    .single();
  if (error) throw new Error(error.message);
  return data;
}

export async function getModules(courseId: string) {
  const supabase = await createServerSupabaseClient();
  const { data, error } = await supabase
    .from("modules")
    .select("*")
    .eq("course_id", courseId)
    .order("order_index", { ascending: true });
  if (error) throw new Error(error.message);
  return data ?? [];
}

export async function createModule(
  courseId: string,
  title: string,
  orderIndex: number,
  status: PublishStatus = "draft"
) {
  const supabase = await createServerSupabaseClient();
  const { data, error } = await supabase
    .from("modules")
    .insert({ course_id: courseId, title, order_index: orderIndex, status })
    .select()
    .single();
  if (error) throw new Error(error.message);
  return data;
}

export async function updateModule(
  moduleId: string,
  updates: { title?: string; order_index?: number; status?: PublishStatus }
) {
  const supabase = await createServerSupabaseClient();
  const { data, error } = await supabase
    .from("modules")
    .update(updates)
    .eq("id", moduleId)
    .select()
    .single();
  if (error) throw new Error(error.message);
  return data;
}

export async function deleteModule(moduleId: string) {
  const supabase = await createServerSupabaseClient();
  const { error } = await supabase.from("modules").delete().eq("id", moduleId);
  if (error) throw new Error(error.message);
}

export async function getLessons(moduleId: string) {
  const supabase = await createServerSupabaseClient();
  const { data, error } = await supabase
    .from("lessons")
    .select("*")
    .eq("module_id", moduleId)
    .order("order_index", { ascending: true });
  if (error) throw new Error(error.message);
  return data ?? [];
}

export async function getLesson(lessonId: string) {
  const supabase = await createServerSupabaseClient();
  const { data, error } = await supabase
    .from("lessons")
    .select("*")
    .eq("id", lessonId)
    .single();
  if (error) throw new Error(error.message);
  return data;
}

export async function createLesson(
  moduleId: string,
  payload: {
    title: string;
    summary: string;
    content: string;
    video_embed_url?: string | null;
    estimated_minutes?: number | null;
    order_index: number;
    status: PublishStatus;
  }
) {
  const supabase = await createServerSupabaseClient();
  const { data, error } = await supabase
    .from("lessons")
    .insert({
      module_id: moduleId,
      title: payload.title,
      summary: payload.summary ?? "",
      content: payload.content ?? "",
      video_embed_url: payload.video_embed_url ?? null,
      estimated_minutes: payload.estimated_minutes ?? null,
      order_index: payload.order_index,
      status: payload.status ?? "draft",
    })
    .select()
    .single();
  if (error) throw new Error(error.message);
  return data;
}

export async function updateLesson(
  lessonId: string,
  updates: {
    title?: string;
    summary?: string;
    content?: string;
    video_embed_url?: string | null;
    estimated_minutes?: number | null;
    order_index?: number;
    status?: PublishStatus;
  }
) {
  const supabase = await createServerSupabaseClient();
  const { data, error } = await supabase
    .from("lessons")
    .update(updates)
    .eq("id", lessonId)
    .select()
    .single();
  if (error) throw new Error(error.message);
  return data;
}

export async function deleteLesson(lessonId: string) {
  const supabase = await createServerSupabaseClient();
  const { error } = await supabase.from("lessons").delete().eq("id", lessonId);
  if (error) throw new Error(error.message);
}

export async function getLessonResources(lessonId: string) {
  const supabase = await createServerSupabaseClient();
  const { data, error } = await supabase
    .from("lesson_resources")
    .select("*")
    .eq("lesson_id", lessonId)
    .order("created_at", { ascending: true });
  if (error) throw new Error(error.message);
  return data ?? [];
}

export async function createLessonResource(
  lessonId: string,
  payload: { name: string; storage_path: string; mime_type: string; size: number }
) {
  const supabase = await createServerSupabaseClient();
  const { data, error } = await supabase
    .from("lesson_resources")
    .insert({
      lesson_id: lessonId,
      name: payload.name,
      storage_path: payload.storage_path,
      mime_type: payload.mime_type,
      size: payload.size,
    })
    .select()
    .single();
  if (error) throw new Error(error.message);
  return data;
}

export async function deleteLessonResource(resourceId: string) {
  const supabase = await createServerSupabaseClient();
  const { error } = await supabase.from("lesson_resources").delete().eq("id", resourceId);
  if (error) throw new Error(error.message);
}

export async function getCohortCourses(courseId: string) {
  const supabase = await createServerSupabaseClient();
  const { data, error } = await supabase
    .from("cohort_courses")
    .select("id, cohort_id, course_id")
    .eq("course_id", courseId);
  if (error) throw new Error(error.message);
  return data ?? [];
}

export async function assignCourseToCohort(courseId: string, cohortId: string) {
  const supabase = await createServerSupabaseClient();
  const { data, error } = await supabase
    .from("cohort_courses")
    .insert({ course_id: courseId, cohort_id: cohortId })
    .select()
    .single();
  if (error) throw new Error(error.message);
  return data;
}

export async function unassignCourseFromCohort(cohortId: string, courseId: string) {
  const supabase = await createServerSupabaseClient();
  const { error } = await supabase
    .from("cohort_courses")
    .delete()
    .eq("course_id", courseId)
    .eq("cohort_id", cohortId);
  if (error) throw new Error(error.message);
}
