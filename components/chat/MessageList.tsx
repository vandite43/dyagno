"use client";

import { useEffect, useRef } from "react";
import type { UIMessage } from "ai";

interface MessageListProps {
  messages: UIMessage[];
  isLoading?: boolean;
}

export function MessageList({ messages, isLoading }: MessageListProps) {
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isLoading]);

  if (!messages.length && !isLoading) {
    return (
      <div className="flex-1 flex items-center justify-center text-center px-4">
        <div className="space-y-3 max-w-sm">
          <p className="text-warm-gold/70 text-base font-medium" style={{ fontFamily: "var(--font-space-grotesk)" }}>
            Describe the fault to get started
          </p>
          <p className="text-warm-gold/40 text-sm leading-relaxed">
            Include the error code, symptom, or attach a photo of the appliance.
            The more detail, the better the diagnosis.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto py-6">
      <div className="max-w-2xl mx-auto px-4 space-y-5">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}
          >
            {message.role === "assistant" && (
              <div className="w-6 h-6 rounded-md bg-forge-amber/20 border border-forge-amber/30 flex items-center justify-center shrink-0 mt-1 mr-2">
                <span className="text-forge-amber text-[10px] font-bold">D</span>
              </div>
            )}
            <div
              className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm leading-relaxed ${
                message.role === "user"
                  ? "bg-forge-amber text-ink font-medium rounded-br-sm"
                  : "bg-dark-carbon border border-steel-border text-warm-gold rounded-bl-sm"
              }`}
            >
              {message.parts.map((part, i) => {
                if (part.type === "text") {
                  return (
                    <FormattedText
                      key={i}
                      text={part.text}
                      isAssistant={message.role === "assistant"}
                    />
                  );
                }
                if (part.type === "file" && part.mediaType?.startsWith("image/")) {
                  return (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      key={i}
                      src={part.url}
                      alt="Attached image"
                      className="max-w-full rounded-lg mt-2 border border-steel-border"
                    />
                  );
                }
                return null;
              })}
            </div>
          </div>
        ))}

        {isLoading && (
          <div className="flex justify-start">
            <div className="w-6 h-6 rounded-md bg-forge-amber/20 border border-forge-amber/30 flex items-center justify-center shrink-0 mt-1 mr-2">
              <span className="text-forge-amber text-[10px] font-bold">D</span>
            </div>
            <div className="bg-dark-carbon border border-steel-border rounded-2xl rounded-bl-sm px-4 py-3 flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-warm-gold/50 animate-bounce [animation-delay:0ms]" />
              <span className="w-1.5 h-1.5 rounded-full bg-warm-gold/50 animate-bounce [animation-delay:150ms]" />
              <span className="w-1.5 h-1.5 rounded-full bg-warm-gold/50 animate-bounce [animation-delay:300ms]" />
            </div>
          </div>
        )}

        <div ref={bottomRef} />
      </div>
    </div>
  );
}

function FormattedText({ text, isAssistant }: { text: string; isAssistant: boolean }) {
  if (!isAssistant) return <span>{text}</span>;

  const lines = text.split("\n");
  const elements: React.ReactNode[] = [];
  let i = 0;

  const nextKey = () => elements.length;

  while (i < lines.length) {
    const line = lines[i];

    if (/^\d+\.\s/.test(line)) {
      const items: string[] = [];
      while (i < lines.length && /^\d+\.\s/.test(lines[i])) {
        items.push(lines[i].replace(/^\d+\.\s/, ""));
        i++;
      }
      elements.push(
        <ol key={nextKey()} className="list-decimal list-inside space-y-1 my-2 ml-1">
          {items.map((item, j) => (
            <li key={j}><InlineText text={item} /></li>
          ))}
        </ol>
      );
      continue;
    }

    if (/^[-*•]\s/.test(line)) {
      const items: string[] = [];
      while (i < lines.length && /^[-*•]\s/.test(lines[i])) {
        items.push(lines[i].replace(/^[-*•]\s/, ""));
        i++;
      }
      elements.push(
        <ul key={nextKey()} className="space-y-1 my-2 ml-1">
          {items.map((item, j) => (
            <li key={j} className="flex gap-2">
              <span className="text-forge-amber mt-0.5 shrink-0">&bull;</span>
              <InlineText text={item} />
            </li>
          ))}
        </ul>
      );
      continue;
    }

    if (/^#{1,3}\s/.test(line)) {
      elements.push(
        <p key={nextKey()} className="font-semibold text-warm-gold mt-3 mb-1" style={{ fontFamily: "var(--font-space-grotesk)" }}>
          <InlineText text={line.replace(/^#{1,3}\s/, "")} />
        </p>
      );
      i++;
      continue;
    }

    if (/^(WARNING|CAUTION|DANGER)/i.test(line)) {
      elements.push(
        <div key={nextKey()} className="flex gap-2 bg-amber-900/20 border border-amber-700/30 rounded-lg px-3 py-2 my-2">
          <span className="shrink-0">&#9888;</span>
          <span className="text-amber-300 text-xs leading-relaxed">
            <InlineText text={line} />
          </span>
        </div>
      );
      i++;
      continue;
    }

    if (line.trim() === "") {
      if (elements.length > 0) {
        elements.push(<div key={nextKey()} className="h-1.5" />);
      }
      i++;
      continue;
    }

    elements.push(
      <p key={nextKey()} className="leading-relaxed">
        <InlineText text={line} />
      </p>
    );
    i++;
  }

  return <div className="space-y-0.5">{elements}</div>;
}

function InlineText({ text }: { text: string }) {
  const parts: React.ReactNode[] = [];
  const regex = /(\*\*[^*]+\*\*|`[^`]+`|PART:\s*[A-Z0-9-]+|CODE:\s*\S+)/g;
  let last = 0;
  let match: RegExpExecArray | null;
  let keyIdx = 0;

  while ((match = regex.exec(text)) !== null) {
    if (match.index > last) {
      parts.push(text.slice(last, match.index));
    }
    const token = match[0];
    const k = keyIdx++;
    if (token.startsWith("**")) {
      parts.push(<strong key={k} className="font-semibold text-warm-gold">{token.slice(2, -2)}</strong>);
    } else if (token.startsWith("`")) {
      parts.push(<code key={k} className="font-mono text-forge-amber bg-dark-chrome px-1.5 py-0.5 rounded text-xs">{token.slice(1, -1)}</code>);
    } else if (token.startsWith("PART:")) {
      parts.push(
        <span key={k} className="font-mono text-forge-amber bg-dark-chrome border border-forge-amber/20 px-1.5 py-0.5 rounded text-xs font-semibold">
          {token}
        </span>
      );
    } else if (token.startsWith("CODE:")) {
      parts.push(
        <span key={k} className="font-mono text-amber-300 bg-amber-900/20 border border-amber-700/30 px-1.5 py-0.5 rounded text-xs font-semibold">
          {token}
        </span>
      );
    }
    last = match.index + token.length;
  }

  if (last < text.length) parts.push(text.slice(last));
  return <>{parts}</>;
}
