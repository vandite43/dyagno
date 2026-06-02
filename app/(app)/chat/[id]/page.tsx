"use client";

import { use, useEffect, useMemo, useState } from "react";
import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport } from "ai";
import { createClient } from "@/lib/supabase/browser";
import { ChatInput } from "@/components/chat/ChatInput";
import { MessageList } from "@/components/chat/MessageList";
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

export default function ChatPage({ params }: ChatPageProps) {
  const { id: conversationId } = use(params);
  const [applianceType, setApplianceType] = useState<string | null>(null);
  const [titleSet, setTitleSet] = useState(false);
  const supabase = useMemo(() => createClient(), []);

  const { messages, sendMessage, status, setMessages } = useChat({
    transport: new DefaultChatTransport({
      api: "/api/chat",
      body: { conversationId },
    }),
  });

  useEffect(() => {
    async function loadData() {
      const [{ data: convo }, { data: msgs }] = await Promise.all([
        supabase.from("conversations").select("title, appliance_type").eq("id", conversationId).single(),
        supabase.from("messages").select("id, role, content, image_urls, created_at").eq("conversation_id", conversationId).order("created_at", { ascending: true }),
      ]);

      if (convo?.appliance_type) setApplianceType(convo.appliance_type);
      if (convo?.title) setTitleSet(true);

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
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("Not authenticated");
    const path = `${user.id}/${conversationId}/${Date.now()}.${ext}`;
    await supabase.storage.from("diagnosis-images").upload(path, file);
    const { data } = supabase.storage.from("diagnosis-images").getPublicUrl(path);
    return data.publicUrl;
  }

  async function handleSend(text: string, imageUrls: string[]) {
    await supabase.from("messages").insert({ conversation_id: conversationId, role: "user", content: text, image_urls: imageUrls.length ? imageUrls : null });

    if (!titleSet && text) {
      await supabase.from("conversations").update({ title: text.slice(0, 60), updated_at: new Date().toISOString() }).eq("id", conversationId);
      setTitleSet(true);
    }

    if (imageUrls.length > 0) {
      const fileParts: FileUIPart[] = imageUrls.map((url) => ({ type: "file", mediaType: "image/jpeg", url, filename: "image" }));
      sendMessage({ parts: [{ type: "text", text }, ...fileParts], role: "user", id: crypto.randomUUID(), metadata: {} });
    } else {
      sendMessage({ text });
    }
  }

  const isLoading = status === "streaming" || status === "submitted";

  return (
    <div className="flex flex-col h-[calc(100dvh-3.5rem)]">
      {applianceType && (
        <div className="border-b border-steel-border bg-dark-carbon shrink-0 px-4 py-2 flex items-center">
          <span className="text-xs text-warm-gold/50 bg-dark-chrome border border-steel-border rounded-full px-3 py-1">
            {applianceType}
          </span>
        </div>
      )}
      <MessageList messages={messages} isLoading={isLoading} />
      <ChatInput onSend={handleSend} onUploadImage={handleUploadImage} isLoading={isLoading} />
    </div>
  );
}
