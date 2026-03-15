"use client";

import Link from "next/link";
import { MessageCircle } from "lucide-react";
import { SurfaceCard } from "@/components/ui/SurfaceCard";
import { SecondaryButton } from "@/components/ui/Buttons";

export interface CommunityPostPreview {
  id: string;
  title: string;
  body: string;
  created_at: string;
  author_name: string | null;
}

interface CommunityPreviewCardProps {
  post: CommunityPostPreview | null;
}

export function CommunityPreviewCard({ post }: CommunityPreviewCardProps) {
  return (
    <SurfaceCard padding="md" clickable={false} as="section" aria-labelledby="community-heading">
      <h2 id="community-heading" className="text-sm font-semibold text-[var(--ink)] mb-3 flex items-center gap-2">
        <MessageCircle className="w-4 h-4 text-[var(--primary)]" />
        Comunidad
      </h2>
      {post ? (
        <>
          <p className="font-medium text-[var(--ink)] text-sm mb-1 line-clamp-1">{post.title}</p>
          {post.author_name && (
            <p className="text-[var(--ink-muted)] text-xs mb-2">{post.author_name}</p>
          )}
          <p className="text-[var(--ink-muted)] text-xs line-clamp-2 mb-3">{post.body}</p>
          <SecondaryButton href="/comunidad">Ver comunidad</SecondaryButton>
        </>
      ) : (
        <div className="py-2">
          <p className="text-[var(--ink-muted)] text-sm mb-4">
            Sé la primera persona en publicar en tu grupo.
          </p>
          <SecondaryButton href="/comunidad">Crear post</SecondaryButton>
        </div>
      )}
    </SurfaceCard>
  );
}
