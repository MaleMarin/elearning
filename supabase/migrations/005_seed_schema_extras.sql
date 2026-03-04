-- Extras para seed demo: post fijado e instrucciones en tareas
ALTER TABLE public.community_posts
  ADD COLUMN IF NOT EXISTS pinned BOOLEAN NOT NULL DEFAULT false;

ALTER TABLE public.tasks
  ADD COLUMN IF NOT EXISTS instructions TEXT;

CREATE INDEX IF NOT EXISTS idx_community_posts_pinned ON public.community_posts(cohort_id, pinned) WHERE pinned = true;
