"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";

interface VoteButtonProps {
  needId: string;
  initialVotes: number;
  isContributor: boolean;
  isOwner: boolean;
}

export function VoteButton({ needId, initialVotes, isContributor, isOwner }: VoteButtonProps) {
  const [votes, setVotes] = useState(initialVotes);
  const [voted, setVoted] = useState(false);
  const [loading, setLoading] = useState(false);

  if (!isContributor || isOwner) {
    return (
      <p className="text-xs text-muted-fg text-center">
        🗳️ {votes} تصويت إلحاح
        {!isContributor && (
          <span className="block mt-0.5">
            التصويت للمساهمين الموثّقين فقط
          </span>
        )}
      </p>
    );
  }

  async function handleVote() {
    if (voted) return;
    setLoading(true);
    try {
      const res = await fetch("/api/votes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ needId }),
      });
      const data = await res.json();
      setVotes(data.votes);
      setVoted(true);
    } finally {
      setLoading(false);
    }
  }

  return (
    <Button
      variant={voted ? "secondary" : "ghost"}
      size="sm"
      onClick={handleVote}
      loading={loading}
      disabled={voted}
      className="w-full"
    >
      {voted ? `✅ صوّتت — ${votes} تصويت` : `🗳️ صوّت للإلحاح (${votes})`}
    </Button>
  );
}
