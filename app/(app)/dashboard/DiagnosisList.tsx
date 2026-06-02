"use client";

import { useState } from "react";
import Link from "next/link";
import { Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";

interface Conversation {
  id: string;
  title: string | null;
  appliance_type: string | null;
  created_at: string;
  updated_at: string;
}

export function DiagnosisList({ initialConversations }: { initialConversations: Conversation[] }) {
  const [conversations, setConversations] = useState(initialConversations);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [confirmId, setConfirmId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function handleDelete(id: string) {
    setDeleting(id);
    setError(null);

    try {
      const res = await fetch(`/api/conversations/${id}`, { method: "DELETE" });
      if (res.ok) {
        setConversations((prev) => prev.filter((c) => c.id !== id));
        setConfirmId(null);
      } else {
        const body = await res.json().catch(() => ({}));
        setError(body.error ?? "Delete failed. Please try again.");
        setConfirmId(null);
      }
    } catch {
      setError("Network error. Please try again.");
      setConfirmId(null);
    }

    setDeleting(null);
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-10">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-warm-gold" style={{ fontFamily: "var(--font-space-grotesk)" }}>
            Your diagnoses
          </h1>
          <p className="text-sm text-warm-gold/40 mt-1">
            {conversations.length} session{conversations.length !== 1 ? "s" : ""}
          </p>
        </div>
        <Link href="/chat/new">
          <Button className="bg-forge-amber text-ink font-semibold hover:bg-forge-amber/90">
            New diagnosis
          </Button>
        </Link>
      </div>

      {error && (
        <div className="mb-4 rounded-lg border border-red-400/30 bg-red-500/10 px-4 py-2.5 text-sm text-red-500 flex items-center justify-between">
          {error}
          <button onClick={() => setError(null)} className="ml-3 text-red-400 hover:text-red-300">x</button>
        </div>
      )}

      {conversations.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-steel-border bg-dark-carbon p-16 text-center space-y-4">
          <p className="text-warm-gold/40 text-sm">No diagnoses yet.</p>
          <Link href="/chat/new">
            <Button className="bg-forge-amber text-ink font-semibold hover:bg-forge-amber/90">
              Start your first diagnosis
            </Button>
          </Link>
        </div>
      ) : (
        <ul className="space-y-3">
          {conversations.map((c) => (
            <li key={c.id} className="flex items-center gap-2">
              <Link
                href={`/chat/${c.id}`}
                className="flex-1 flex items-center justify-between rounded-xl border border-steel-border bg-dark-carbon hover:border-forge-amber/50 transition-colors p-4 min-w-0"
              >
                <div className="min-w-0">
                  <p className="font-medium text-warm-gold truncate">
                    {c.title ?? "Untitled diagnosis"}
                  </p>
                  {c.appliance_type && (
                    <p className="text-xs text-warm-gold/40 mt-0.5">{c.appliance_type}</p>
                  )}
                </div>
                <p className="text-xs text-warm-gold/30 ml-4 shrink-0">
                  {new Date(c.updated_at).toLocaleDateString()}
                </p>
              </Link>

              {confirmId === c.id ? (
                <div className="flex items-center gap-1.5 shrink-0">
                  <button
                    onClick={() => handleDelete(c.id)}
                    disabled={deleting === c.id}
                    className="text-xs font-medium text-red-500 hover:text-red-400 border border-red-400/40 hover:border-red-400/70 rounded-lg px-2.5 py-1.5 transition-colors disabled:opacity-50"
                  >
                    {deleting === c.id ? "Deleting..." : "Delete"}
                  </button>
                  <button
                    onClick={() => setConfirmId(null)}
                    disabled={deleting === c.id}
                    className="text-xs text-warm-gold/40 hover:text-warm-gold/70 border border-steel-border rounded-lg px-2.5 py-1.5 transition-colors disabled:opacity-50"
                  >
                    Cancel
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => setConfirmId(c.id)}
                  disabled={deleting === c.id}
                  className="shrink-0 p-2 rounded-lg text-warm-gold/30 hover:text-red-500 hover:bg-red-500/10 transition-colors"
                  title="Delete diagnosis"
                >
                  <Trash2 size={16} />
                </button>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
