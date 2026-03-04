export type PublishStatus = "draft" | "published";

export interface Course {
  id: string;
  title: string;
  status: PublishStatus;
  created_at: string;
  updated_at: string;
}

export interface Module {
  id: string;
  course_id: string;
  title: string;
  order_index: number;
  status: PublishStatus;
  created_at: string;
  updated_at: string;
}

export interface Lesson {
  id: string;
  module_id: string;
  title: string;
  summary: string;
  content: string;
  video_embed_url: string | null;
  estimated_minutes: number | null;
  order_index: number;
  status: PublishStatus;
  created_at: string;
  updated_at: string;
}

export interface LessonResource {
  id: string;
  lesson_id: string;
  name: string;
  storage_path: string;
  mime_type: string;
  size: number;
  created_at: string;
}

export interface LessonFormData {
  title: string;
  summary: string;
  content: string;
  video_embed_url: string;
  estimated_minutes: number | null;
  status: PublishStatus;
}
