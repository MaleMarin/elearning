"use client";

import { useState, useEffect } from "react";
import { ThumbsUp, ThumbsDown } from "lucide-react";
import { ProposalForm } from "./ProposalForm";

interface Proposal {
  id: string;
  userId: string;
  definition: string;
  votes: number;
  createdAt: string;
}

interface GlossaryTermProps {
  courseId: string;
  termId: string;
  term: string;
  officialDefinition: string;
  /** Si el usuario es admin (puede editar términos). */
  isAdmin?: boolean;
}

export function GlossaryTerm({
  courseId,
  termId,
  term,
  officialDefinition,
  isAdmin,
}: GlossaryTermProps) {
  const [proposals, setProposals] = useState<Proposal[]>([]);
  const [topProposalId, setTopProposalId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [votedId, setVotedId] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    fetch(`/api/glossary/${courseId}/terms/${termId}/proposals`, { credentials: "include" })
      .then((r) => r.json())
      .then((d) => {
        setProposals(d.proposals ?? []);
        setTopProposalId(d.topProposalId ?? null);
      })
      .catch(() => setProposals([]))
      .finally(() => setLoading(false));
  }, [courseId, termId, submitted]);

  const handleVote = async (proposalId: string, delta: 1 | -1) => {
    try {
      await fetch(`/api/glossary/${courseId}/terms/${termId}/vote`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ proposalId, delta }),
      });
      setVotedId(proposalId);
      setProposals((prev) =>
        prev.map((p) => {
          if (p.id === proposalId) return { ...p, votes: p.votes + delta };
          if (votedId === p.id) return { ...p, votes: Math.max(0, p.votes - 1) };
          return p;
        })
      );
    } catch {
      // ignore
    }
  };

  const displayDefinition = topProposalId
    ? proposals.find((p) => p.id === topProposalId)?.definition ?? officialDefinition
    : officialDefinition;
  const isCommunityChoice = !!topProposalId;

  return (
    <article className="rounded-xl border border-[var(--line)] bg-white p-4 space-y-4">
      <div>
        <h3 className="text-lg font-semibold text-[var(--ink)]">{term}</h3>
        <p className="mt-2 text-[var(--ink)]">
          {displayDefinition}
        </p>
        {isCommunityChoice && (
          <p className="mt-1 text-xs text-[var(--primary)] font-medium">
            Definición más votada de la cohorte
          </p>
        )}
      </div>

      {!loading && (
        <>
          <div>
            <h4 className="text-sm font-medium text-[var(--ink-muted)] mb-2">Otras definiciones propuestas</h4>
            {proposals.length === 0 ? (
              <p className="text-sm text-[var(--ink-muted)]">Nadie ha propuesto aún. ¡Sé el primero!</p>
            ) : (
              <ul className="space-y-2">
                {proposals.map((p) => (
                  <li
                    key={p.id}
                    className="flex items-start justify-between gap-2 py-2 px-3 rounded-lg bg-[var(--cream)]/50 border border-[var(--line)]"
                  >
                    <p className="text-sm text-[var(--ink)] flex-1">{p.definition}</p>
                    <div className="flex items-center gap-1 shrink-0">
                      <button
                        type="button"
                        onClick={() => handleVote(p.id, 1)}
                        className={`p-1.5 rounded-lg transition-colors ${
                          votedId === p.id ? "bg-[var(--primary)] text-white" : "hover:bg-[var(--cream)] text-[var(--ink-muted)]"
                        }`}
                        aria-label="Votar a favor"
                      >
                        <ThumbsUp className="w-4 h-4" />
                      </button>
                      <span className="text-sm font-medium text-[var(--ink)] min-w-[1.5rem] text-center">
                        {p.votes}
                      </span>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>

          <ProposalForm
            courseId={courseId}
            termId={termId}
            onSubmitted={() => setSubmitted(true)}
          />
        </>
      )}
    </article>
  );
}
