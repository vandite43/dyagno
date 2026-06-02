"use client";

import { useRef, useState } from "react";
import { ImagePlus, Send } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ChatInputProps {
  onSend: (text: string, imageUrls: string[]) => void;
  onUploadImage: (file: File) => Promise<string>;
  isLoading: boolean;
}

export function ChatInput({ onSend, onUploadImage, isLoading }: ChatInputProps) {
  const [text, setText] = useState("");
  const [pendingImages, setPendingImages] = useState<{ url: string; preview: string }[]>([]);
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files ?? []);
    if (!files.length) return;
    setUploading(true);
    const results = await Promise.all(
      files.map(async (file) => {
        const url = await onUploadImage(file);
        const preview = URL.createObjectURL(file);
        return { url, preview };
      })
    );
    setPendingImages((prev) => [...prev, ...results]);
    setUploading(false);
    e.target.value = "";
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!text.trim() && !pendingImages.length) return;
    onSend(text, pendingImages.map((i) => i.url));
    setText("");
    setPendingImages([]);
  }

  function removeImage(index: number) {
    setPendingImages((prev) => prev.filter((_, i) => i !== index));
  }

  const busy = isLoading || uploading;

  return (
    <div className="border-t border-steel-border bg-dark-carbon py-3 shrink-0">
      <div className="max-w-2xl mx-auto px-4">
      {/* Pending image thumbnails */}
      {pendingImages.length > 0 && (
        <div className="flex gap-2 flex-wrap mb-2">
          {pendingImages.map((img, i) => (
            <div key={i} className="relative">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={img.preview} alt="Upload preview" className="w-12 h-12 object-cover rounded-lg border border-steel-border" />
              <button
                type="button"
                onClick={() => removeImage(i)}
                className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-dark-chrome border border-steel-border text-warm-gold/60 hover:text-warm-gold text-[10px] flex items-center justify-center"
              >
                ×
              </button>
            </div>
          ))}
        </div>
      )}

      <form onSubmit={handleSubmit} className="flex items-center gap-2">
        <input
          ref={fileRef}
          type="file"
          accept="image/*"
          multiple
          className="hidden"
          onChange={handleFileChange}
        />
        <button
          type="button"
          disabled={busy}
          onClick={() => fileRef.current?.click()}
          className="shrink-0 w-11 h-11 flex items-center justify-center rounded-lg text-warm-gold/40 hover:text-forge-amber hover:bg-dark-chrome transition-colors disabled:opacity-40"
          title="Attach photo"
        >
          <ImagePlus size={18} />
        </button>

        <input
          type="text"
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              handleSubmit(e as unknown as React.FormEvent);
            }
          }}
          placeholder="Describe the fault, error code, or symptom..."
          disabled={busy}
          className="flex-1 h-11 rounded-lg border border-steel-border bg-dark-chrome text-warm-gold placeholder:text-warm-gold/30 px-3 text-sm focus:outline-none focus:ring-1 focus:ring-forge-amber disabled:opacity-50"
        />

        <Button
          type="submit"
          size="icon"
          disabled={busy || (!text.trim() && !pendingImages.length)}
          className="shrink-0 w-11 h-11 bg-forge-amber text-ink hover:bg-forge-amber/90 disabled:opacity-40"
        >
          <Send size={16} />
        </Button>
      </form>
      </div>
    </div>
  );
}
