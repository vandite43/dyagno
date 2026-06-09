export interface ParsedPart {
  partName: string;
  partNumber: string | null;
}

// Extract part mentions from an assistant message.
// Captures both "STOCK RECOMMENDATION: name — number — reason" lines
// and standalone "PART: <number>" tokens.
export function parsePartMentions(text: string): ParsedPart[] {
  const parts: ParsedPart[] = [];
  const seen = new Set<string>();

  // STOCK RECOMMENDATION lines
  const stockRegex = /STOCK RECOMMENDATION:\s*([^\n]+)/g;
  let m: RegExpExecArray | null;
  while ((m = stockRegex.exec(text)) !== null) {
    const segments = m[1].split(/\s*[—–-]\s*/);
    const name = (segments[0] ?? "").trim();
    const number = (segments[1] ?? "").trim();
    if (name) {
      const key = name.toLowerCase();
      if (!seen.has(key)) {
        seen.add(key);
        parts.push({ partName: name, partNumber: number || null });
      }
    }
  }

  // PART: <number> tokens (only those that look like real part numbers)
  const partRegex = /PART:\s*([A-Z0-9][A-Z0-9-]{3,})/g;
  while ((m = partRegex.exec(text)) !== null) {
    const number = m[1].trim();
    const key = number.toLowerCase();
    if (!seen.has(key)) {
      seen.add(key);
      parts.push({ partName: number, partNumber: number });
    }
  }

  return parts;
}
