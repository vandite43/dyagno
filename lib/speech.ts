// Minimal Web Speech API types (not always present in lib.dom.d.ts).
export interface SpeechRecognitionResultLike {
  transcript: string;
}
export interface SpeechRecognitionEventLike {
  results: ArrayLike<ArrayLike<SpeechRecognitionResultLike>>;
}
export interface SpeechRecognitionLike {
  lang: string;
  interimResults: boolean;
  continuous: boolean;
  maxAlternatives: number;
  start: () => void;
  stop: () => void;
  abort: () => void;
  onresult: ((e: SpeechRecognitionEventLike) => void) | null;
  onend: (() => void) | null;
  onerror: ((e: unknown) => void) | null;
}

// Strip markdown / formatting tokens so text-to-speech reads naturally.
export function stripMarkdown(input: string): string {
  return input
    .replace(/```[\s\S]*?```/g, " code block ")     // fenced code
    .replace(/`([^`]+)`/g, "$1")                       // inline code
    .replace(/\*\*([^*]+)\*\*/g, "$1")                 // bold
    .replace(/\*([^*]+)\*/g, "$1")                      // italic
    .replace(/^#{1,6}\s+/gm, "")                        // headings
    .replace(/^[-*•]\s+/gm, "")                         // bullets
    .replace(/^\d+\.\s+/gm, "")                         // ordered list markers
    .replace(/PART:\s*/g, "Part number ")
    .replace(/CODE:\s*/g, "Error code ")
    .replace(/STOCK RECOMMENDATION:\s*/g, "Stock recommendation: ")
    .replace(/\s{2,}/g, " ")
    .trim();
}

// Returns a constructor for SpeechRecognition if the browser supports it.
export function getSpeechRecognition(): (new () => SpeechRecognitionLike) | null {
  if (typeof window === "undefined") return null;
  const w = window as unknown as {
    SpeechRecognition?: new () => SpeechRecognitionLike;
    webkitSpeechRecognition?: new () => SpeechRecognitionLike;
  };
  return w.SpeechRecognition ?? w.webkitSpeechRecognition ?? null;
}

export function speechSynthesisSupported(): boolean {
  return typeof window !== "undefined" && "speechSynthesis" in window;
}
