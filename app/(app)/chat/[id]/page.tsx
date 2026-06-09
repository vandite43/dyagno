"use client";

import { use, useEffect, useMemo, useState } from "react";
import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport } from "ai";
import { Share2, Bookmark } from "lucide-react";
import { createClient } from "@/lib/supabase/browser";
import { ChatInput } from "@/components/chat/ChatInput";
import { MessageList } from "@/components/chat/MessageList";
import { faultsFor } from "@/lib/common-faults";
import type { FileUIPart } from "ai";

const MIME_TO_EXT: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
  "image/gif": "gif",
};

interface ChatPageProps {
  params: Promise<{ id: string }>;
}

interface Recommendation {
  partName: string;
  partNumber: string | null;
  count: number;
}

export default function ChatPage({ params }: ChatPageProps) {
  const { id: conversationId } = use(params);
  const [applianceType, setApplianceType] = useState<string | null>(null);
  const [titleSet, setTitleSet] = useState(false);
  const [plan, setPlan] = useState<string>("trial");
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [shareState, setShareState] = useState<"idle" | "copied" | "loading">("idle");
  const supabase = useMemo(() => createClient(), []);

  const { messages, sendMessage, status, setMessages, error } = useChat({
    transport: new DefaultChatTransport({
      api: "/api/chat",
      body: { conversationId },
    }),
  });

  useEffect(() => {
    async function loadData() {
      const [{ data: convo }, { data: msgs }, { data: { user } }] = await Promise.all([
        supabase.from("conversations").select("title, appliance_type").eq("id", conversationId).single(),
        supabase.from("messages").select("id, role, content, image_urls, created_at").eq("conversation_id", conversationId).order("created_at", { ascending: true }),
        supabase.auth.getUser(),
      ]);

      if (convo?.appliance_type) setApplianceType(convo.appliance_type);
      if (convo?.title) setTitleSet(true);

      if (user) {
        const { data: sub } = await supabase.from("subscriptions").select("plan").eq("user_id", user.id).single();
        if (sub?.plan) setPlan(sub.plan);
      }

      // Load stock recommendations for the nudge
      try {
        const res = await fetch("/api/parts/recommendations");
        if (res.ok) {
          const data = await res.json();
          if (Array.isArray(data.recommendations)) setRecommendations(data.recommendations);
        }
      } catch {
        // ignore
      }

      if (msgs && msgs.length > 0) {
        setMessages(msgs.map((m) => ({
          id: m.id,
          role: m.role as "user" | "assistant",
          parts: [
            ...(m.image_urls ?? []).map((url: string) => ({ type: "file" as const, mediaType: "image/jpeg" as const, url, filename: "image" } satisfies FileUIPart)),
            { type: "text" as const, text: m.content ?? "" },
          ],
          metadata: {},
        })));
      }
    }
    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [conversationId]);

  async function handleUploadImage(file: File): Promise<string> {
    const ext = MIME_TO_EXT[file.type];
    if (!ext) throw new Error("Unsupported file type. Use JPEG, PNG, WebP, or GIF.");
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  }

  async function handleSend(text: string, imageUrls: string[]) {
    await supabase.from("messages").insert({ conversation_id: conversationId, role: "user", content: text, image_urls: null });

    if (!titleSet && text) {
      await supabase.from("conversations").update({ title: text.slice(0, 60), updated_at: new Date().toISOString() }).eq("id", conversationId);
      setTitleSet(true);
    }

    if (imageUrls.length > 0) {
      const fileParts: FileUIPart[] = imageUrls.map((url) => {
        const mediaType = (url.match(/^data:([^;]+);/) ?? [])[1] ?? "image/jpeg";
        return { type: "file", mediaType: mediaType as FileUIPart["mediaType"], url, filename: "image" };
      });
      sendMessage({ parts: [{ type: "text", text }, ...fileParts], role: "user", id: crypto.randomUUID(), metadata: {} });
    } else {
      sendMessage({ text });
    }
  }

  async function handleShare() {
    setShareState("loading");
    try {
      const res = await fetch(`/api/conversations/${conversationId}/share`, { method: "POST" });
      if (!res.ok) { setShareState("idle"); return; }
      const { token } = await res.json();
      await navigator.clipboard.writeText(`${window.location.origin}/share/${token}`);
      setShareState("copied");
      setTimeout(() => setShareState("idle"), 2500);
    } catch {
      setShareState("idle");
    }
  }

  const isLoading = status === "streaming" || status === "submitted";
  const canShare = plan === "pro" || plan === "enterprise";
  const faults = faultsFor(applianceType);
  const topRec = recommendations[0];

  return (
    <div className="flex flex-col h-[calc(100dvh-3.5rem)]">
      {(applianceType || canShare) && (
        <div className="border-b border-steel-border bg-dark-carbon shrink-0 px-4 py-2 flex items-center justify-between gap-3">
          {applianceType ? (
            <span className="text-xs text-warm-gold/50 bg-dark-chrome border border-steel-border rounded-full px-3 py-1">
              {applianceType}
            </span>
          ) : <span />}
          {canShare && (
            <button
              onClick={handleShare}
              disabled={shareState === "loading"}
              className="flex items-center gap-1.5 text-xs text-warm-gold/50 hover:text-forge-amber transition-colors disabled:opacity-50"
            >
              <Share2 size={13} />
              {shareState === "copied" ? "Link copied!" : "Share summary"}
            </button>
          )}
        </div>
      )}

      {error && (
        <div className="shrink-0 px-4 py-2 bg-red-500/10 border-b border-red-400/20 flex items-center justify-between gap-3">
          <p className="text-xs text-red-400">Something went wrong. Send a new message to continue.</p>
        </div>
      )}

      <MessageList messages={messages} isLoading={isLoading} applianceType={applianceType} />

      {/* Common fault quick-start chips (empty session only) */}
      {messages.length === 0 && !isLoading && faults.length > 0 && (
        <div className="shrink-0 px-4 pb-2">
          <div className="max-w-2xl mx-auto">
            <p className="text-[11px] uppercase tracking-wider text-warm-gold/30 font-semibold mb-2">Common issues</p>
            <div className="flex flex-wrap gap-2">
              {faults.map((fault) => (
                <button
                  key={fault}
                  onClick={() => handleSend(fault, [])}
                  className="text-xs text-warm-gold/70 bg-dark-carbon border border-steel-border hover:border-forge-amber/60 hover:text-warm-gold rounded-full px-3 py-1.5 transition-colors text-left"
                >
                  {fault}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Stock nudge — same part seen 3+ times across history */}
      {topRec && messages.length > 0 && (
        <div className="shrink-0 px-4 pb-2">
          <div className="max-w-2xl mx-auto flex items-start gap-2.5 bg-forge-amber/10 border border-forge-amber/30 rounded-lg px-3 py-2">
            <Bookmark size={15} className="text-forge-amber shrink-0 mt-0.5" />
            <p className="text-xs text-warm-gold/80 leading-relaxed">
              You&apos;ve seen <span className="font-semibold text-forge-amber">{topRec.partName}</span> in {topRec.count} diagnoses. Consider keeping it stocked.
            </p>
          </div>
        </div>
      )}

      <ChatInput onSend={handleSend} onUploadImage={handleUploadImage} isLoading={isLoading} />
    </div>
  );
}
