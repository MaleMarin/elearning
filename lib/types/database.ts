export type AssistantMode = "tutor" | "support" | "community";

export interface AssistantThread {
  id: string;
  mode: AssistantMode;
  user_id: string;
  cohort_id: string | null;
  course_id: string | null;
  created_at: string;
}

export interface AssistantMessage {
  id: string;
  thread_id: string;
  role: "user" | "assistant" | "system";
  content: string;
  metadata: Record<string, unknown> | null;
  created_at: string;
}

export interface SupportTicket {
  id: string;
  user_id: string;
  cohort_id: string | null;
  category: string;
  status: "open" | "pending" | "resolved";
  summary: string;
  details: string;
  created_at: string;
  updated_at: string;
}

export interface CommunityFlag {
  id: string;
  post_id: string;
  flagged_by: string;
  reason: string;
  severity: number;
  status: "queued" | "reviewed" | "dismissed" | "actioned";
  created_at: string;
}

export interface Notification {
  id: string;
  user_id: string;
  type: string;
  title: string;
  body: string;
  link: string | null;
  read_at: string | null;
  created_at: string;
}

export interface WeeklyDigest {
  id: string;
  cohort_id: string;
  content: string;
  created_at: string;
}

export interface LessonContext {
  courseTitle: string;
  moduleTitle: string;
  lessonTitle: string;
  lessonSummary: string;
  lessonText?: string;
  resourcesTitles?: string[];
}
